import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 13 — Branching Strategy & CI/CD
   Advanced Git branching workflows, CI/CD pipelines,
   and how code gets from commit to production automatically.
================================================================ */

/* ---- Branching Strategy Comparison ---- */
function BranchingComparison() {
  const [active, setActive] = useState('github')

  const strategies = {
    gitflow: {
      label: 'Gitflow',
      tagline: 'Best for release-based products (mobile apps, enterprise)',
      when: 'Monthly/quarterly releases, large teams',
      branches: ['main', 'develop', 'feature/*', 'release/*', 'hotfix/*'],
      color: '#8b5cf6',
      steps: [
        { branch: 'develop', label: 'develop (integration)', y: 0, color: '#8b5cf6' },
        { branch: 'feature/search', label: 'feature/search', y: 1, color: '#3b82f6', start: 1, end: 4 },
        { branch: 'feature/auth', label: 'feature/auth', y: 2, color: '#ec4899', start: 2, end: 5 },
        { branch: 'release/v2.0', label: 'release/v2.0', y: 3, color: '#f59e0b', start: 5, end: 7 },
        { branch: 'main', label: 'main (production)', y: 4, color: '#059669' },
        { branch: 'hotfix/fix-bug', label: 'hotfix/fix-bug', y: 5, color: '#dc2626', start: 6, end: 7 },
      ],
    },
    github: {
      label: 'GitHub Flow',
      tagline: 'Simple and modern, best for web apps with CI/CD',
      when: 'Continuous deployment, small to medium teams',
      branches: ['main', 'feature branches'],
      color: '#3b82f6',
      steps: [
        { branch: 'main', label: 'main (always deployable)', y: 0, color: '#059669' },
        { branch: 'feature/add-search', label: 'feature/add-search', y: 1, color: '#3b82f6', start: 1, end: 3 },
        { branch: 'feature/dark-mode', label: 'feature/dark-mode', y: 2, color: '#8b5cf6', start: 2, end: 4 },
      ],
    },
    trunk: {
      label: 'Trunk-Based',
      tagline: 'For high-performing teams (Google, Meta)',
      when: 'Very mature CI/CD, feature flags, fast review cycles',
      branches: ['main (trunk)', 'very short-lived branches'],
      color: '#10b981',
      steps: [
        { branch: 'main', label: 'main (trunk) -- deploy continuously', y: 0, color: '#059669' },
        { branch: 'short/feat-a', label: 'short/feat-a (2hrs)', y: 1, color: '#3b82f6', start: 1, end: 2 },
        { branch: 'short/feat-b', label: 'short/feat-b (4hrs)', y: 1, color: '#8b5cf6', start: 3, end: 4 },
      ],
    },
  }

  const s = strategies[active]
  const tabs = [
    { key: 'gitflow', label: 'Gitflow', icon: '🌳' },
    { key: 'github', label: 'GitHub Flow', icon: '🔀' },
    { key: 'trunk', label: 'Trunk-Based', icon: '🪵' },
  ]

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <motion.button
            key={t.key}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActive(t.key)}
            style={{
              padding: '10px 20px', borderRadius: 12, border: '2px solid',
              borderColor: active === t.key ? strategies[t.key].color : 'var(--border)',
              background: active === t.key ? `${strategies[t.key].color}15` : 'var(--bg-secondary)',
              color: active === t.key ? strategies[t.key].color : 'var(--text-muted)',
              cursor: 'pointer', fontSize: 14, fontWeight: 700,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {t.icon} {t.label}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {/* Strategy info */}
          <div style={{
            background: `${s.color}10`, border: `1.5px solid ${s.color}30`,
            borderRadius: 14, padding: '16px 20px', marginBottom: 20,
          }}>
            <div style={{
              fontSize: 18, fontWeight: 800, color: s.color,
              fontFamily: 'var(--font-heading)', marginBottom: 4,
            }}>
              {s.label}
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
              {s.tagline}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              <strong>When to use:</strong> {s.when}
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
              {s.branches.map(b => (
                <span key={b} style={{
                  padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  background: `${s.color}20`, color: s.color,
                  fontFamily: 'monospace',
                }}>
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Branch diagram */}
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 14,
            border: '1px solid var(--border)', padding: 20, overflowX: 'auto',
          }}>
            <div style={{ minWidth: 500, position: 'relative' }}>
              {s.steps.map((step, i) => {
                const totalCols = 8
                const startCol = step.start || 0
                const endCol = step.end || totalCols
                const leftPct = `${(startCol / totalCols) * 100}%`
                const widthPct = `${((endCol - startCol) / totalCols) * 100}%`

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    style={{
                      display: 'flex', alignItems: 'center', marginBottom: 12, minHeight: 36,
                    }}
                  >
                    <div style={{
                      width: 160, fontSize: 12, fontWeight: 600,
                      color: step.color, fontFamily: 'monospace', flexShrink: 0,
                    }}>
                      {step.label}
                    </div>
                    <div style={{ flex: 1, position: 'relative', height: 24 }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: widthPct }}
                        transition={{ delay: i * 0.12, duration: 0.5 }}
                        style={{
                          position: 'absolute', left: leftPct, height: '100%',
                          background: `${step.color}30`, borderRadius: 12,
                          border: `2px solid ${step.color}`,
                        }}
                      />
                      {/* Commit dots */}
                      {Array.from({ length: endCol - startCol }, (_, j) => (
                        <motion.div
                          key={j}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.12 + j * 0.06 }}
                          style={{
                            position: 'absolute',
                            left: `${((startCol + j + 0.5) / totalCols) * 100}%`,
                            top: '50%', transform: 'translate(-50%, -50%)',
                            width: 10, height: 10, borderRadius: '50%',
                            background: step.color, zIndex: 1,
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Flow description for each strategy */}
          {active === 'github' && (
            <div style={{
              marginTop: 16, padding: '14px 18px', borderRadius: 12,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8,
            }}>
              <strong style={{ color: 'var(--accent)' }}>Flow:</strong> feature branch &rarr; PR &rarr; code review &rarr; merge to main &rarr; auto-deploy. Main is <em>always</em> deployable.
            </div>
          )}
          {active === 'gitflow' && (
            <div style={{
              marginTop: 16, padding: '14px 18px', borderRadius: 12,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8,
            }}>
              <strong style={{ color: '#8b5cf6' }}>Flow:</strong> feature &rarr; develop &rarr; release branch &rarr; QA &rarr; tag &rarr; merge to main. Hotfixes go directly from main and merge back.
            </div>
          )}
          {active === 'trunk' && (
            <div style={{
              marginTop: 16, padding: '14px 18px', borderRadius: 12,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.8,
            }}>
              <strong style={{ color: '#10b981' }}>Flow:</strong> tiny branch (hours, not days) &rarr; PR &rarr; fast review &rarr; merge to trunk. Features behind flags. Almost a straight line.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- PR Lifecycle Simulator ---- */
function PRLifecycleSimulator() {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: 'Create Branch',
      desc: 'Developer creates feature/add-search branch from main',
      visual: 'git checkout -b feature/add-search',
      icon: '🌿',
      status: 'branch',
    },
    {
      title: 'Make Commits',
      desc: 'Developer makes 3 commits with code changes',
      visual: '3 commits: add SearchBar component, add search API, add tests',
      icon: '💻',
      status: 'coding',
    },
    {
      title: 'Push to GitHub',
      desc: 'Push the feature branch to remote',
      visual: 'git push -u origin feature/add-search',
      icon: '☁️',
      status: 'pushed',
    },
    {
      title: 'Create Pull Request',
      desc: 'Open PR with title, description, and assign reviewers',
      visual: 'PR #142: Add search functionality',
      icon: '📝',
      status: 'pr-open',
    },
    {
      title: 'CI Runs Automatically',
      desc: 'Pipeline triggered on PR creation',
      visual: 'checks',
      icon: '⚙️',
      status: 'ci-running',
      checks: [
        { name: 'Lint check', passed: true },
        { name: 'Unit tests (48/48)', passed: true },
        { name: 'Integration tests', passed: true },
        { name: 'Security scan', passed: false, issue: 'Found hardcoded API key in config.js' },
      ],
    },
    {
      title: 'Reviewer Comments',
      desc: 'Reviewer finds the security issue and leaves feedback',
      visual: '"Please remove the hardcoded API key and use environment variables instead."',
      icon: '💬',
      status: 'review',
    },
    {
      title: 'Developer Fixes',
      desc: 'Developer moves the API key to .env, pushes fix commit',
      visual: 'commit: "fix: move API key to env variable"',
      icon: '🔧',
      status: 'fixing',
    },
    {
      title: 'CI Re-runs -- All Green',
      desc: 'All checks pass this time',
      visual: 'checks-pass',
      icon: '✅',
      checks: [
        { name: 'Lint check', passed: true },
        { name: 'Unit tests (48/48)', passed: true },
        { name: 'Integration tests', passed: true },
        { name: 'Security scan', passed: true },
      ],
      status: 'ci-pass',
    },
    {
      title: 'Reviewer Approves',
      desc: 'Reviewer is satisfied and approves the PR',
      visual: 'Approved -- "LGTM! Ship it."',
      icon: '👍',
      status: 'approved',
    },
    {
      title: 'Merge & Auto-Deploy',
      desc: 'PR merged to main, staging deploy triggered automatically',
      visual: 'Merged to main -- Deploying to staging...',
      icon: '🚀',
      status: 'merged',
    },
  ]

  const current = steps[step]

  return (
    <div>
      {/* Progress bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2, marginBottom: 24, overflowX: 'auto',
        paddingBottom: 8,
      }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <motion.div
              whileHover={{ scale: 1.2 }}
              onClick={() => setStep(i)}
              style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: i <= step ? 'var(--accent)' : 'var(--bg-secondary)',
                border: i === step ? '3px solid var(--accent)' : '2px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800,
                color: i <= step ? '#fff' : 'var(--text-muted)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {i + 1}
            </motion.div>
            {i < steps.length - 1 && (
              <div style={{
                width: 16, height: 2, flexShrink: 0,
                background: i < step ? 'var(--accent)' : 'var(--border)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Current step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          style={{
            background: 'var(--bg-card)', border: '1.5px solid var(--border)',
            borderRadius: 16, padding: 24, minHeight: 160,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <span style={{ fontSize: 28 }}>{current.icon}</span>
            <div>
              <div style={{
                fontSize: 17, fontWeight: 800, color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)',
              }}>
                Step {step + 1}: {current.title}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>
                {current.desc}
              </div>
            </div>
          </div>

          {/* Visual content for each step type */}
          {current.checks ? (
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 12, padding: 16,
              border: '1px solid var(--border)',
            }}>
              {current.checks.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 0',
                    borderBottom: i < current.checks.length - 1 ? '1px solid var(--border)' : 'none',
                  }}
                >
                  <span style={{
                    fontSize: 16, width: 24, textAlign: 'center',
                  }}>
                    {c.passed ? '✅' : '❌'}
                  </span>
                  <span style={{
                    fontSize: 14, fontWeight: 600,
                    color: c.passed ? '#059669' : '#dc2626',
                  }}>
                    {c.name}
                  </span>
                  {c.issue && (
                    <span style={{
                      fontSize: 12, color: '#dc2626', fontStyle: 'italic', marginLeft: 8,
                    }}>
                      -- {c.issue}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 12, padding: '14px 18px',
              border: '1px solid var(--border)', fontSize: 14,
              fontFamily: 'monospace', color: 'var(--text-secondary)',
            }}>
              {current.visual}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          style={{
            padding: '10px 20px', borderRadius: 10, border: '1px solid var(--border)',
            background: step === 0 ? 'var(--bg-secondary)' : 'var(--bg-card)',
            color: step === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            cursor: step === 0 ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-sans)',
          }}
        >
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep(Math.min(steps.length - 1, step + 1))}
          disabled={step === steps.length - 1}
          style={{
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: step === steps.length - 1 ? '#94a3b8' : 'var(--accent)',
            color: '#fff',
            cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-sans)',
          }}
        >
          {step === steps.length - 1 ? 'Done' : 'Next Step'}
        </motion.button>
      </div>
    </div>
  )
}

/* ---- CI/CD Pipeline Builder ---- */
function PipelineBuilder() {
  const [running, setRunning] = useState(false)
  const [stageStates, setStageStates] = useState({})
  const [activeStage, setActiveStage] = useState(null)
  const [failAt, setFailAt] = useState(null)

  const stages = [
    {
      id: 'build', label: 'Build', icon: '📦',
      details: ['Install dependencies (npm install)', 'Compile TypeScript', 'Create Docker image', 'Push to container registry'],
    },
    {
      id: 'test', label: 'Test', icon: '🧪',
      details: ['Unit tests (Jest) -- 142 tests', 'Integration tests -- 28 tests', 'E2E tests (Playwright) -- 15 flows'],
    },
    {
      id: 'scan', label: 'Scan', icon: '🔍',
      details: ['Security vulnerability scan', 'Code quality check (SonarQube)', 'License compliance check', 'Dependency audit'],
    },
    {
      id: 'staging', label: 'Deploy Staging', icon: '🟡',
      details: ['Push Docker image to staging registry', 'Update Kubernetes deployment', 'Run database migrations', 'Smoke tests on staging'],
    },
    {
      id: 'test-staging', label: 'Test Staging', icon: '🧪',
      details: ['Run E2E tests on staging', 'Performance baseline check', 'API contract validation'],
    },
    {
      id: 'approve', label: 'Approve', icon: '👤',
      details: ['Manual gate -- tech lead reviews staging', 'Check metrics dashboard', 'Confirm release notes'],
    },
    {
      id: 'production', label: 'Deploy Prod', icon: '🚀',
      details: ['Blue-green deployment starts', 'Route 10% traffic to new version', 'Monitor error rates for 5 min', 'Shift 100% traffic -- done!'],
    },
  ]

  const runPipeline = (shouldFail) => {
    setRunning(true)
    setStageStates({})
    setActiveStage(null)
    const failIndex = shouldFail ? 1 : null
    setFailAt(failIndex)

    stages.forEach((stage, i) => {
      // Set running
      setTimeout(() => {
        setActiveStage(stage.id)
        setStageStates(prev => ({ ...prev, [stage.id]: 'running' }))
      }, i * 1200)

      // Set result
      setTimeout(() => {
        if (failIndex !== null && i === failIndex) {
          setStageStates(prev => ({ ...prev, [stage.id]: 'failed' }))
          setRunning(false)
        } else if (failIndex !== null && i > failIndex) {
          // skip
        } else {
          setStageStates(prev => ({ ...prev, [stage.id]: 'passed' }))
          if (i === stages.length - 1) {
            setTimeout(() => setRunning(false), 400)
          }
        }
      }, i * 1200 + 900)
    })
  }

  const statusColors = {
    passed: '#059669',
    failed: '#dc2626',
    running: '#f59e0b',
    pending: 'var(--text-muted)',
  }

  const statusBgs = {
    passed: '#05966915',
    failed: '#dc262615',
    running: '#f59e0b15',
    pending: 'var(--bg-secondary)',
  }

  return (
    <div>
      {/* Run buttons */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => runPipeline(false)}
          disabled={running}
          style={{
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: running ? '#94a3b8' : '#059669',
            color: '#fff', fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer',
            fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          {running ? 'Running...' : 'Simulate Push (all pass)'}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => runPipeline(true)}
          disabled={running}
          style={{
            padding: '10px 22px', borderRadius: 10, border: 'none',
            background: running ? '#94a3b8' : '#dc2626',
            color: '#fff', fontWeight: 700, cursor: running ? 'not-allowed' : 'pointer',
            fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          {running ? 'Running...' : 'Simulate Push (test fails)'}
        </motion.button>
      </div>

      {/* Pipeline visualization */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto',
        paddingBottom: 12, marginBottom: 16,
      }}>
        {stages.map((stage, i) => {
          const state = stageStates[stage.id] || 'pending'
          const skipped = failAt !== null && stageStates[stages[failAt]?.id] === 'failed' && i > failAt
          return (
            <div key={stage.id} style={{ display: 'flex', alignItems: 'center' }}>
              <motion.div
                whileHover={{ scale: 1.08 }}
                onClick={() => setActiveStage(activeStage === stage.id ? null : stage.id)}
                animate={state === 'running' ? { boxShadow: ['0 0 0px #f59e0b', '0 0 16px #f59e0b', '0 0 0px #f59e0b'] } : {}}
                transition={state === 'running' ? { repeat: Infinity, duration: 1 } : {}}
                style={{
                  padding: '10px 14px', borderRadius: 12, textAlign: 'center',
                  background: skipped ? 'var(--bg-secondary)' : (statusBgs[state] || 'var(--bg-secondary)'),
                  border: `2px solid ${skipped ? 'var(--border)' : (statusColors[state] || 'var(--border)')}`,
                  cursor: 'pointer', minWidth: 80, opacity: skipped ? 0.4 : 1,
                  transition: 'all 0.3s',
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>
                  {state === 'passed' ? '✅' : state === 'failed' ? '❌' : state === 'running' ? '⏳' : stage.icon}
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 700,
                  color: skipped ? 'var(--text-muted)' : (statusColors[state] || 'var(--text-muted)'),
                }}>
                  {stage.label}
                </div>
              </motion.div>
              {i < stages.length - 1 && (
                <div style={{
                  width: 20, height: 2, flexShrink: 0,
                  background: stageStates[stage.id] === 'passed' ? '#059669' : 'var(--border)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          )
        })}
      </div>

      {/* Stage details */}
      <AnimatePresence>
        {activeStage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 12,
              border: '1px solid var(--border)', padding: 18,
            }}>
              <div style={{
                fontSize: 15, fontWeight: 700, color: 'var(--text-primary)',
                fontFamily: 'var(--font-heading)', marginBottom: 12,
              }}>
                {stages.find(s => s.id === activeStage)?.icon}{' '}
                {stages.find(s => s.id === activeStage)?.label} Stage
              </div>
              {stages.find(s => s.id === activeStage)?.details.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0', fontSize: 13, color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>&#8250;</span>
                  {d}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Failure message */}
      <AnimatePresence>
        {failAt !== null && stageStates[stages[failAt]?.id] === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 16, padding: '14px 18px', borderRadius: 12,
              background: '#fef2f2', border: '1.5px solid #fca5a5',
              fontSize: 13, color: '#991b1b',
            }}
          >
            <strong>Pipeline stopped!</strong> Tests failed -- the bug was caught before it reached production.
            Pipeline will not continue until the issue is fixed and a new push is made.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- GitHub Actions YAML Explainer ---- */
function ActionsExplainer() {
  const [highlight, setHighlight] = useState(null)

  const sections = [
    {
      id: 'name',
      lines: 'name: Deploy Pipeline',
      label: 'Pipeline Name',
      desc: 'A human-readable name that appears in the GitHub Actions tab.',
      color: '#8b5cf6',
    },
    {
      id: 'trigger',
      lines: `on:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]`,
      label: 'Trigger Events',
      desc: 'Defines when this pipeline runs: on pushes to main and on PRs targeting main.',
      color: '#3b82f6',
    },
    {
      id: 'test-job',
      lines: `jobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm install\n      - run: npm test`,
      label: 'Test Job',
      desc: 'Runs on an Ubuntu VM. Checks out code, installs dependencies, and runs the test suite.',
      color: '#10b981',
    },
    {
      id: 'deploy-job',
      lines: `  deploy-staging:\n    needs: test\n    if: github.ref == 'refs/heads/main'\n    runs-on: ubuntu-latest\n    steps:\n      - run: docker build -t myapp .\n      - run: docker push registry/myapp\n      - run: ssh staging "docker pull && docker restart"`,
      label: 'Deploy Job',
      desc: '"needs: test" means this only runs after tests pass. "if:" ensures it only deploys when code is on main (not on PRs). Builds a Docker image and deploys to staging via SSH.',
      color: '#f59e0b',
    },
  ]

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {/* YAML block */}
        <div style={{
          background: '#1e1e2e', borderRadius: 14, padding: 20,
          fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8,
          overflowX: 'auto', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: 10, right: 14, fontSize: 11,
            color: '#64748b', fontWeight: 600,
          }}>
            .github/workflows/deploy.yml
          </div>
          {sections.map(s => (
            <motion.div
              key={s.id}
              onClick={() => setHighlight(highlight === s.id ? null : s.id)}
              whileHover={{ backgroundColor: `${s.color}20` }}
              style={{
                padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
                whiteSpace: 'pre', marginBottom: 2,
                background: highlight === s.id ? `${s.color}25` : 'transparent',
                borderLeft: highlight === s.id ? `3px solid ${s.color}` : '3px solid transparent',
                color: highlight === s.id ? s.color : '#94a3b8',
                transition: 'all 0.2s',
              }}
            >
              {s.lines}
            </motion.div>
          ))}
        </div>

        {/* Explanation panel */}
        <AnimatePresence mode="wait">
          {highlight ? (
            <motion.div
              key={highlight}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: `${sections.find(s => s.id === highlight)?.color}10`,
                border: `1.5px solid ${sections.find(s => s.id === highlight)?.color}40`,
                borderRadius: 12, padding: '14px 18px',
              }}
            >
              <div style={{
                fontSize: 15, fontWeight: 700, marginBottom: 6,
                color: sections.find(s => s.id === highlight)?.color,
                fontFamily: 'var(--font-heading)',
              }}>
                {sections.find(s => s.id === highlight)?.label}
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {sections.find(s => s.id === highlight)?.desc}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: '14px 18px', borderRadius: 12,
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                fontSize: 13, color: 'var(--text-muted)', textAlign: 'center',
              }}
            >
              Click any section of the YAML above to see an explanation.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---- Release Flow Visual ---- */
function ReleaseFlow() {
  const [phase, setPhase] = useState(0)

  const phases = [
    {
      label: 'Feature Freeze',
      desc: 'No new features on develop. Only bug fixes allowed.',
      icon: '🧊', color: '#3b82f6',
    },
    {
      label: 'Create release/v2.1',
      desc: 'Cut a release branch from develop for stabilization.',
      icon: '✂️', color: '#8b5cf6',
    },
    {
      label: 'Bug Fixes Only',
      desc: 'Only critical bug fixes go to the release branch.',
      icon: '🐛', color: '#f59e0b',
    },
    {
      label: 'QA Testing',
      desc: 'QA team tests the release candidate thoroughly.',
      icon: '🧪', color: '#ec4899',
    },
    {
      label: 'Tag v2.1.0 & Merge to Main',
      desc: 'Create a Git tag and merge release branch to main.',
      icon: '🏷️', color: '#059669',
    },
    {
      label: 'Deploy to Production',
      desc: 'Main is deployed. Merge release back to develop.',
      icon: '🚀', color: '#10b981',
    },
  ]

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 6, overflowX: 'auto',
        paddingBottom: 12, marginBottom: 20,
      }}>
        {phases.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => setPhase(i)}
              style={{
                padding: '10px 12px', borderRadius: 12, textAlign: 'center',
                minWidth: 90, cursor: 'pointer',
                background: i <= phase ? `${p.color}15` : 'var(--bg-secondary)',
                border: `2px solid ${i === phase ? p.color : i < phase ? `${p.color}50` : 'var(--border)'}`,
                transition: 'all 0.2s',
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 4 }}>{p.icon}</div>
              <div style={{
                fontSize: 10, fontWeight: 700, lineHeight: 1.3,
                color: i <= phase ? p.color : 'var(--text-muted)',
              }}>
                {p.label}
              </div>
            </motion.div>
            {i < phases.length - 1 && (
              <div style={{
                width: 16, height: 2, flexShrink: 0,
                background: i < phase ? phases[i].color : 'var(--border)',
              }} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          style={{
            background: `${phases[phase].color}10`,
            border: `1.5px solid ${phases[phase].color}40`,
            borderRadius: 14, padding: '18px 22px',
          }}
        >
          <div style={{
            fontSize: 17, fontWeight: 800, color: phases[phase].color,
            fontFamily: 'var(--font-heading)', marginBottom: 6,
          }}>
            Phase {phase + 1}: {phases[phase].label}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {phases[phase].desc}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ---- Version Bump Simulator ---- */
function VersionBumpSimulator() {
  const [currentQ, setCurrentQ] = useState(0)
  const [selected, setSelected] = useState(null)
  const [score, setScore] = useState(0)

  const questions = [
    {
      change: 'Added dark mode to the app',
      answer: 'MINOR',
      from: '1.0.0',
      to: '1.1.0',
      why: 'New feature, backward compatible. Users who do not want dark mode are unaffected.',
    },
    {
      change: 'Fixed a login bug where password reset emails were not sent',
      answer: 'PATCH',
      from: '1.1.0',
      to: '1.1.1',
      why: 'Bug fix only. No new features, no breaking changes.',
    },
    {
      change: 'Changed API response format from XML to JSON',
      answer: 'MAJOR',
      from: '1.1.1',
      to: '2.0.0',
      why: 'Breaking change! Any client expecting XML will break. This requires a major bump.',
    },
    {
      change: 'Added a new /users/search endpoint',
      answer: 'MINOR',
      from: '2.0.0',
      to: '2.1.0',
      why: 'New functionality, but existing endpoints work exactly the same.',
    },
    {
      change: 'Fixed a typo in the error message',
      answer: 'PATCH',
      from: '2.1.0',
      to: '2.1.1',
      why: 'Tiny fix. No feature changes, no API changes.',
    },
  ]

  const q = questions[currentQ]
  const options = ['MAJOR', 'MINOR', 'PATCH']
  const optionColors = { MAJOR: '#dc2626', MINOR: '#3b82f6', PATCH: '#10b981' }

  const handleSelect = (opt) => {
    if (selected !== null) return
    setSelected(opt)
    if (opt === q.answer) setScore(score + 1)
  }

  const nextQuestion = () => {
    setSelected(null)
    setCurrentQ(currentQ + 1)
  }

  if (currentQ >= questions.length) {
    return (
      <div style={{ textAlign: 'center', padding: 30 }}>
        <div style={{
          fontSize: 48, fontWeight: 800, color: 'var(--accent)',
          fontFamily: 'var(--font-heading)', marginBottom: 8,
        }}>
          {score}/{questions.length}
        </div>
        <div style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 20 }}>
          {score === questions.length ? 'Perfect! You understand SemVer!' :
           score >= 3 ? 'Great job! Almost there.' : 'Keep practicing!'}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setCurrentQ(0); setSelected(null); setScore(0) }}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: 'var(--accent)', color: '#fff', fontWeight: 700,
            cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)',
          }}
        >
          Try Again
        </motion.button>
      </div>
    )
  }

  return (
    <div>
      {/* SemVer legend */}
      <div style={{
        display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {[
          { label: 'MAJOR', desc: 'Breaking changes', color: '#dc2626' },
          { label: 'MINOR', desc: 'New features (compatible)', color: '#3b82f6' },
          { label: 'PATCH', desc: 'Bug fixes', color: '#10b981' },
        ].map(v => (
          <div key={v.label} style={{
            padding: '6px 14px', borderRadius: 8,
            background: `${v.color}10`, border: `1px solid ${v.color}30`,
            fontSize: 12, fontWeight: 700, color: v.color,
          }}>
            {v.label}: {v.desc}
          </div>
        ))}
      </div>

      {/* Progress */}
      <div style={{
        fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, textAlign: 'right',
      }}>
        Question {currentQ + 1}/{questions.length} | Score: {score}
      </div>

      {/* Question */}
      <div style={{
        background: 'var(--bg-card)', border: '1.5px solid var(--border)',
        borderRadius: 14, padding: 22,
      }}>
        <div style={{
          fontSize: 14, color: 'var(--text-muted)', marginBottom: 6,
        }}>
          Current version: <strong style={{ color: 'var(--accent)', fontFamily: 'monospace', fontSize: 16 }}>{q.from}</strong>
        </div>
        <div style={{
          fontSize: 16, fontWeight: 700, color: 'var(--text-primary)',
          fontFamily: 'var(--font-heading)', marginBottom: 16, lineHeight: 1.5,
        }}>
          "{q.change}"
        </div>
        <div style={{
          fontSize: 14, color: 'var(--text-muted)', marginBottom: 16,
        }}>
          What type of version bump is this?
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {options.map(opt => {
            const isCorrect = selected !== null && opt === q.answer
            const isWrong = selected === opt && opt !== q.answer
            return (
              <motion.button
                key={opt}
                whileHover={selected === null ? { scale: 1.05 } : {}}
                whileTap={selected === null ? { scale: 0.95 } : {}}
                onClick={() => handleSelect(opt)}
                style={{
                  padding: '10px 24px', borderRadius: 10, fontWeight: 700,
                  fontSize: 14, fontFamily: 'var(--font-sans)',
                  cursor: selected === null ? 'pointer' : 'default',
                  border: `2px solid ${isCorrect ? '#059669' : isWrong ? '#dc2626' : optionColors[opt]}`,
                  background: isCorrect ? '#05966920' : isWrong ? '#dc262620' : `${optionColors[opt]}10`,
                  color: isCorrect ? '#059669' : isWrong ? '#dc2626' : optionColors[opt],
                }}
              >
                {opt}
                {isCorrect && ' ✓'}
                {isWrong && ' ✗'}
              </motion.button>
            )
          })}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: 16, padding: '12px 16px', borderRadius: 10,
                background: selected === q.answer ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${selected === q.answer ? '#6ee7b7' : '#fca5a5'}`,
                fontSize: 13, lineHeight: 1.6,
                color: selected === q.answer ? '#065f46' : '#991b1b',
              }}
            >
              <strong>{selected === q.answer ? 'Correct!' : `Wrong -- the answer is ${q.answer}.`}</strong>{' '}
              {q.from} &rarr; <strong>{q.to}</strong>. {q.why}
            </motion.div>
          )}
        </AnimatePresence>

        {selected !== null && currentQ < questions.length - 1 && (
          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextQuestion}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: 'var(--accent)', color: '#fff', fontWeight: 700,
                cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
              }}
            >
              Next Question
            </motion.button>
          </div>
        )}
        {selected !== null && currentQ === questions.length - 1 && (
          <div style={{ marginTop: 14, textAlign: 'right' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextQuestion}
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: 'var(--accent)', color: '#fff', fontWeight: 700,
                cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
              }}
            >
              See Score
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic13_BranchingCI() {
  return (
    <div style={{
      maxWidth: 860,
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* ---- Title ---- */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', marginBottom: 40 }}
      >
        <h1 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 38,
          fontWeight: 800,
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}>
          Branching Strategy & CI/CD
        </h1>
        <p style={{
          fontSize: 16, color: 'var(--text-muted)', maxWidth: 620, margin: '0 auto',
        }}>
          How real teams use Git branches, pull requests, and automated pipelines to ship code from commit to production.
        </p>
      </motion.div>

      {/* ---- Opening ---- */}
      <Neuron
        mood="explaining"
        message="In Topic 12 you learned Git basics. Now let's see how real teams use branching -- there's no single right answer. Different strategies fit different team sizes, release cadences, and maturity levels."
        typed
      />

      <div style={{ height: 32 }} />

      {/* ---- Section 1: Branching Strategies ---- */}
      <SectionBlock title="Branching Strategies Compared" icon="🌳" color="#8b5cf6">
        <Neuron
          mood="thinking"
          message="Gitflow is like a highway system with on-ramps and exits. GitHub Flow is a single two-lane road. Trunk-Based is a bullet train -- fast but requires discipline. Pick the one that matches your team."
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Strategy Comparison -- Switch Between Strategies">
            <BranchingComparison />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 2: PR Workflow ---- */}
      <SectionBlock title="The Pull Request Workflow (Deep Dive)" icon="🔀" color="#3b82f6">
        <Neuron
          mood="excited"
          message="A Pull Request is not just 'merge my code'. It is a collaboration point -- code review, automated testing, discussion, and quality gates all happen here. Let's walk through a real PR lifecycle!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="PR Lifecycle Simulator -- Click Through Each Step">
            <PRLifecycleSimulator />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 3: CI/CD Pipeline ---- */}
      <SectionBlock title="CI/CD Pipeline -- From Commit to Production" icon="⚙️" color="#10b981">
        <Neuron
          mood="explaining"
          message="CI/CD is the assembly line of software. Every push triggers an automated pipeline: build, test, scan, deploy. If any stage fails, the pipeline stops. No broken code reaches production!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="CI/CD Pipeline Builder -- Simulate a Push">
            <PipelineBuilder />
          </InteractiveDemo>
        </div>

        <div style={{ marginTop: 16 }}>
          <Neuron
            mood="happy"
            message="Click each stage to see what happens inside. Try both buttons -- one where everything passes, and one where tests fail. Notice how the pipeline stops at the failure!"
            typed
          />
        </div>
      </SectionBlock>

      {/* ---- Section 4: GitHub Actions ---- */}
      <SectionBlock title="GitHub Actions / CI Config Example" icon="📄" color="#f59e0b">
        <Neuron
          mood="thinking"
          message="This is what a real CI/CD pipeline looks like in code. It is a YAML file that GitHub reads to know what to run, when, and in what order. Click each section to understand it."
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Interactive GitHub Actions YAML">
            <ActionsExplainer />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 5: Release Management ---- */}
      <SectionBlock title="Release Management" icon="🏷️" color="#ec4899">
        <Neuron
          mood="explaining"
          message="Releases are the checkpoints where code goes from 'ready' to 'live'. Version numbers are not random -- they follow SemVer (Semantic Versioning) so everyone knows what changed."
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Release Flow -- Click Through the Phases">
            <ReleaseFlow />
          </InteractiveDemo>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3 style={{
            fontSize: 18, fontWeight: 700, color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)', marginBottom: 12,
          }}>
            SemVer: MAJOR.MINOR.PATCH
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'MAJOR', desc: 'Breaking changes. Clients may need to update their code.', example: '1.x.x -> 2.0.0', color: '#dc2626' },
              { label: 'MINOR', desc: 'New features, fully backward compatible.', example: '1.0.x -> 1.1.0', color: '#3b82f6' },
              { label: 'PATCH', desc: 'Bug fixes only. No new features.', example: '1.1.0 -> 1.1.1', color: '#10b981' },
            ].map(v => (
              <div key={v.label} style={{
                background: `${v.color}10`, border: `1.5px solid ${v.color}30`,
                borderRadius: 12, padding: 16,
              }}>
                <div style={{
                  fontSize: 20, fontWeight: 800, color: v.color,
                  fontFamily: 'var(--font-heading)', marginBottom: 4,
                }}>
                  {v.label}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 6 }}>
                  {v.desc}
                </div>
                <div style={{
                  fontSize: 12, fontFamily: 'monospace', color: v.color,
                  fontWeight: 600,
                }}>
                  {v.example}
                </div>
              </div>
            ))}
          </div>
        </div>

        <InteractiveDemo title="Version Bump Quiz -- Pick the Right Bump">
          <VersionBumpSimulator />
        </InteractiveDemo>
      </SectionBlock>

      {/* ---- Section 6: Hindi Explainer ---- */}
      <SectionBlock title="Hindi Explainer" icon="🇮🇳" color="#ff9933">
        <HindiExplainer
          concept="ब्रांचिंग और CI/CD"
          english="Branching Strategy & CI/CD"
          explanation="CI/CD मतलब code push करते ही automatically test हो, build हो, और deploy हो। Branching strategy तय करती है team कैसे collaborate करे — Gitflow structured है (बड़ी teams), GitHub Flow simple है (छोटी teams), Trunk-based सबसे fast है (expert teams)।"
          example="Razorpay में developer feature/upi-qr branch बनाता है। Code push करते ही GitHub Actions tests चलाता है। PR approve होने पर main में merge होता है। तुरंत staging पर deploy हो जाता है। QA check करता है। Approve → production deploy — सब automatic!"
          terms={[
            { hindi: 'सी.आई.', english: 'CI (Continuous Integration)', meaning: 'हर push पर automatically test चलाना' },
            { hindi: 'सी.डी.', english: 'CD (Continuous Deployment)', meaning: 'Tests pass होने पर automatically deploy करना' },
            { hindi: 'पाइपलाइन', english: 'Pipeline', meaning: 'Build → Test → Deploy के automated steps' },
            { hindi: 'सेमवर', english: 'SemVer', meaning: 'MAJOR.MINOR.PATCH version numbering' },
            { hindi: 'फ़ीचर फ़्लैग', english: 'Feature Flag', meaning: 'Code deploy हो लेकिन feature ON/OFF करने का switch' },
          ]}
        />
      </SectionBlock>
    </div>
  )
}
