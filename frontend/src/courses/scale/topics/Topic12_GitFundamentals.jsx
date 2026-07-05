import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 12 — Git: The Complete Guide
   Internals, commands, branching, merging, real workflows
================================================================ */

const BRANCH_COLORS = {
  main: '#3b82f6',
  develop: '#10b981',
  feature: '#8b5cf6',
  release: '#f59e0b',
  hotfix: '#ef4444',
}

function generateHash() {
  return Math.random().toString(16).slice(2, 9)
}

/* ---- Git Timeline Visualizer ---- */
function GitTimeline() {
  const [commits, setCommits] = useState([
    { hash: 'a1b2c3d', message: 'Initial commit', author: 'You', ts: '10:00 AM', files: ['README.md'] },
    { hash: 'e4f5a6b', message: 'Add index.html', author: 'You', ts: '10:15 AM', files: ['index.html', 'README.md'] },
  ])
  const [selectedIdx, setSelectedIdx] = useState(null)
  const messages = ['Add login page', 'Fix navbar bug', 'Update styles', 'Add API route', 'Refactor utils', 'Add tests']
  const filesets = [
    ['login.jsx', 'auth.js'],
    ['Navbar.jsx'],
    ['styles.css', 'theme.js'],
    ['api/route.js', 'handlers.js'],
    ['utils/helpers.js'],
    ['tests/app.test.js'],
  ]

  const addCommit = () => {
    const idx = (commits.length - 2) % messages.length
    setCommits(prev => [...prev, {
      hash: generateHash(),
      message: messages[idx],
      author: 'You',
      ts: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      files: filesets[idx],
    }])
    setSelectedIdx(null)
  }

  return (
    <div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={addCommit}
        style={{
          padding: '10px 24px', borderRadius: 12, border: 'none',
          background: 'var(--accent)', color: '#fff', fontWeight: 700,
          cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-sans)',
          marginBottom: 20,
        }}
      >
        Make Change + Commit
      </motion.button>

      <div style={{ position: 'relative', paddingLeft: 30 }}>
        {/* vertical line */}
        <div style={{
          position: 'absolute', left: 14, top: 0, bottom: 0,
          width: 3, background: 'var(--accent)', borderRadius: 2, opacity: 0.3,
        }} />

        {[...commits].reverse().map((c, i) => {
          const realIdx = commits.length - 1 - i
          const isSelected = selectedIdx === realIdx
          return (
            <motion.div
              key={c.hash}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedIdx(realIdx)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 16,
                marginBottom: 14, cursor: 'pointer', position: 'relative',
              }}
            >
              {/* commit dot */}
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                background: isSelected ? '#f59e0b' : 'var(--accent)',
                border: '3px solid var(--bg-primary)',
                boxShadow: isSelected ? '0 0 12px #f59e0b88' : '0 0 8px var(--accent)33',
                flexShrink: 0, marginTop: 4, zIndex: 1,
              }} />
              <div style={{
                background: isSelected ? '#f59e0b12' : 'var(--bg-secondary)',
                border: `1px solid ${isSelected ? '#f59e0b55' : 'var(--border)'}`,
                borderRadius: 12, padding: '12px 16px', flex: 1,
                transition: 'all 0.2s',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <code style={{
                    background: '#6366f115', color: '#6366f1', padding: '2px 8px',
                    borderRadius: 6, fontSize: 12, fontWeight: 700,
                  }}>{c.hash}</code>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 14 }}>{c.message}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {c.author} -- {c.ts}
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    style={{ marginTop: 10, overflow: 'hidden' }}
                  >
                    <div style={{
                      fontSize: 12, color: '#f59e0b', fontWeight: 700, marginBottom: 6,
                    }}>
                      Project at this point:
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {c.files.map(f => (
                        <span key={f} style={{
                          background: '#10b98118', color: '#10b981', padding: '3px 10px',
                          borderRadius: 8, fontSize: 12, fontWeight: 600,
                        }}>{f}</span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ---- Git Three Areas Visualizer ---- */
function GitAreasVisualizer() {
  const [workingFiles, setWorkingFiles] = useState([
    { name: 'index.html', status: 'clean' },
    { name: 'style.css', status: 'clean' },
    { name: 'app.js', status: 'clean' },
  ])
  const [stagingFiles, setStagingFiles] = useState([])
  const [repoCommits, setRepoCommits] = useState([{ hash: 'a1b2c3d', files: ['README.md'] }])
  const [statusText, setStatusText] = useState('')
  const [lastCommand, setLastCommand] = useState('')

  const editFile = () => {
    const cleanFiles = workingFiles.filter(f => f.status === 'clean')
    if (cleanFiles.length === 0) {
      setStatusText('All files already modified!')
      return
    }
    const target = cleanFiles[0]
    setWorkingFiles(prev => prev.map(f =>
      f.name === target.name ? { ...f, status: 'modified' } : f
    ))
    setLastCommand(`// Edited ${target.name}`)
    setStatusText(`Modified: ${target.name}`)
  }

  const gitAdd = () => {
    const modified = workingFiles.filter(f => f.status === 'modified')
    if (modified.length === 0) {
      setStatusText('Nothing to stage. Edit a file first!')
      return
    }
    const toStage = modified[0]
    setStagingFiles(prev => [...prev, { name: toStage.name, status: 'staged' }])
    setWorkingFiles(prev => prev.map(f =>
      f.name === toStage.name ? { ...f, status: 'staged' } : f
    ))
    setLastCommand(`git add ${toStage.name}`)
    setStatusText(`Staged: ${toStage.name}`)
  }

  const gitCommit = () => {
    if (stagingFiles.length === 0) {
      setStatusText('Nothing to commit! Stage files first with git add.')
      return
    }
    const newCommit = {
      hash: generateHash(),
      files: stagingFiles.map(f => f.name),
    }
    setRepoCommits(prev => [...prev, newCommit])
    setWorkingFiles(prev => prev.map(f =>
      f.status === 'staged' ? { ...f, status: 'clean' } : f
    ))
    setStagingFiles([])
    setLastCommand(`git commit -m "Update ${newCommit.files.join(', ')}"`)
    setStatusText(`Committed ${newCommit.files.length} file(s) -- ${newCommit.hash}`)
  }

  const gitStatus = () => {
    const modified = workingFiles.filter(f => f.status === 'modified')
    const staged = stagingFiles.length
    const lines = []
    if (staged > 0) lines.push(`Changes to be committed: ${stagingFiles.map(f => f.name).join(', ')}`)
    if (modified.length > 0) lines.push(`Changes not staged: ${modified.map(f => f.name).join(', ')}`)
    if (staged === 0 && modified.length === 0) lines.push('Working tree clean')
    setLastCommand('git status')
    setStatusText(lines.join('\n'))
  }

  const areaStyle = (color, label) => ({
    flex: 1, minWidth: 180, background: `${color}08`, border: `2px solid ${color}40`,
    borderRadius: 16, padding: 16, position: 'relative',
  })

  const fileBadge = (f, color) => (
    <motion.div
      key={f.name}
      layout
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      style={{
        padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
        background: `${color}20`, color: color, marginBottom: 6,
        border: `1px solid ${color}40`,
      }}
    >
      {f.name}
    </motion.div>
  )

  const statusColor = (status) => {
    if (status === 'modified') return '#ef4444'
    if (status === 'staged') return '#10b981'
    return 'var(--text-muted)'
  }

  return (
    <div>
      {/* action buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {[
          { label: 'Edit file', fn: editFile, color: '#ef4444' },
          { label: 'git add', fn: gitAdd, color: '#f59e0b' },
          { label: 'git commit', fn: gitCommit, color: '#10b981' },
          { label: 'git status', fn: gitStatus, color: '#6366f1' },
        ].map(btn => (
          <motion.button
            key={btn.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={btn.fn}
            style={{
              padding: '8px 18px', borderRadius: 10, border: `2px solid ${btn.color}`,
              background: `${btn.color}12`, color: btn.color, fontWeight: 700,
              cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
            }}
          >
            {btn.label}
          </motion.button>
        ))}
      </div>

      {/* three areas */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {/* working directory */}
        <div style={areaStyle('#3b82f6')}>
          <div style={{
            fontSize: 13, fontWeight: 800, color: '#3b82f6', marginBottom: 12,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>Working Directory</div>
          <AnimatePresence>
            {workingFiles.map(f => (
              <motion.div
                key={f.name}
                layout
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: f.status === 'modified' ? '#ef444420' : f.status === 'staged' ? '#10b98120' : '#3b82f620',
                  color: statusColor(f.status), marginBottom: 6,
                  border: `1px solid ${statusColor(f.status)}40`,
                }}
              >
                {f.name}
                {f.status !== 'clean' && (
                  <span style={{ fontSize: 11, marginLeft: 8, opacity: 0.7 }}>({f.status})</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* staging area */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 20 }}>
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            &#8594;
          </motion.span>
        </div>
        <div style={areaStyle('#f59e0b')}>
          <div style={{
            fontSize: 13, fontWeight: 800, color: '#f59e0b', marginBottom: 12,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>Staging Area (Index)</div>
          <AnimatePresence>
            {stagingFiles.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>Empty</div>
            ) : stagingFiles.map(f => fileBadge(f, '#f59e0b'))}
          </AnimatePresence>
        </div>

        {/* repository */}
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 20 }}>
          <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            &#8594;
          </motion.span>
        </div>
        <div style={areaStyle('#10b981')}>
          <div style={{
            fontSize: 13, fontWeight: 800, color: '#10b981', marginBottom: 12,
            textTransform: 'uppercase', letterSpacing: 1,
          }}>Repository (.git)</div>
          {repoCommits.map((c, i) => (
            <div key={i} style={{
              padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: '#10b98115', color: '#10b981', marginBottom: 6,
              border: '1px solid #10b98130',
            }}>
              <code style={{ fontSize: 11 }}>{c.hash}</code> -- {c.files.join(', ')}
            </div>
          ))}
        </div>
      </div>

      {/* command & status output */}
      {lastCommand && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: 16, background: '#1e293b', borderRadius: 10, padding: 14,
            fontFamily: 'monospace', fontSize: 13,
          }}
        >
          <div style={{ color: '#10b981' }}>$ {lastCommand}</div>
          {statusText && (
            <div style={{ color: '#94a3b8', marginTop: 6, whiteSpace: 'pre-wrap' }}>{statusText}</div>
          )}
        </motion.div>
      )}
    </div>
  )
}

/* ---- Git Command Lab ---- */
function GitCommandLab() {
  const [gitInitialized, setGitInitialized] = useState(false)
  const [files, setFiles] = useState([
    { name: 'index.html', status: 'untracked' },
    { name: 'style.css', status: 'untracked' },
    { name: 'app.js', status: 'untracked' },
  ])
  const [commits, setCommits] = useState([])
  const [stash, setStash] = useState([])
  const [output, setOutput] = useState([])
  const [showDiff, setShowDiff] = useState(false)

  const pushOutput = (cmd, result) => {
    setOutput(prev => [...prev.slice(-4), { cmd, result }])
  }

  const commands = [
    {
      cmd: 'git init',
      label: 'git init',
      desc: 'Initialize a new Git repository',
      fn: () => {
        setGitInitialized(true)
        pushOutput('git init', 'Initialized empty Git repository in ./.git/')
      },
    },
    {
      cmd: 'git status',
      label: 'git status',
      desc: 'Show the working tree status',
      fn: () => {
        const untracked = files.filter(f => f.status === 'untracked')
        const modified = files.filter(f => f.status === 'modified')
        const staged = files.filter(f => f.status === 'staged')
        let result = 'On branch main\n'
        if (staged.length) result += `Changes to be committed:\n  ${staged.map(f => f.name).join('\n  ')}\n`
        if (modified.length) result += `Changes not staged:\n  ${modified.map(f => f.name).join('\n  ')}\n`
        if (untracked.length) result += `Untracked files:\n  ${untracked.map(f => f.name).join('\n  ')}`
        if (!staged.length && !modified.length && !untracked.length) result += 'nothing to commit, working tree clean'
        pushOutput('git status', result)
      },
    },
    {
      cmd: 'git add .',
      label: 'git add .',
      desc: 'Stage all changes',
      fn: () => {
        const unstaged = files.filter(f => f.status === 'untracked' || f.status === 'modified')
        if (unstaged.length === 0) {
          pushOutput('git add .', 'Nothing to add.')
          return
        }
        setFiles(prev => prev.map(f =>
          (f.status === 'untracked' || f.status === 'modified') ? { ...f, status: 'staged' } : f
        ))
        pushOutput('git add .', `Staged ${unstaged.length} file(s)`)
      },
    },
    {
      cmd: 'git commit',
      label: 'git commit -m "msg"',
      desc: 'Record changes to the repository',
      fn: () => {
        const staged = files.filter(f => f.status === 'staged')
        if (staged.length === 0) {
          pushOutput('git commit', 'nothing to commit (use "git add" first)')
          return
        }
        const hash = generateHash()
        setCommits(prev => [...prev, { hash, message: `Update ${staged.map(f => f.name).join(', ')}`, files: staged.map(f => f.name) }])
        setFiles(prev => prev.map(f => f.status === 'staged' ? { ...f, status: 'committed' } : f))
        pushOutput(`git commit -m "Update files"`, `[main ${hash}] Update ${staged.length} file(s)`)
      },
    },
    {
      cmd: 'git log',
      label: 'git log',
      desc: 'Show commit history',
      fn: () => {
        if (commits.length === 0) {
          pushOutput('git log', 'No commits yet.')
          return
        }
        const log = commits.map((c, i) => `commit ${c.hash}\n  ${c.message}`).reverse().join('\n')
        pushOutput('git log', log)
      },
    },
    {
      cmd: 'git diff',
      label: 'git diff',
      desc: 'Show changes between working tree and index',
      fn: () => {
        setShowDiff(true)
        pushOutput('git diff', 'Showing diff...')
        setTimeout(() => setShowDiff(false), 4000)
      },
    },
    {
      cmd: 'git stash',
      label: 'git stash',
      desc: 'Stash modified changes away',
      fn: () => {
        const modified = files.filter(f => f.status === 'modified')
        if (modified.length === 0) {
          pushOutput('git stash', 'No local changes to save.')
          return
        }
        setStash(prev => [...prev, ...modified])
        setFiles(prev => prev.map(f => f.status === 'modified' ? { ...f, status: 'committed' } : f))
        pushOutput('git stash', `Saved working directory: ${modified.map(f => f.name).join(', ')}`)
      },
    },
    {
      cmd: 'git stash pop',
      label: 'git stash pop',
      desc: 'Re-apply stashed changes',
      fn: () => {
        if (stash.length === 0) {
          pushOutput('git stash pop', 'No stash entries found.')
          return
        }
        const restored = stash.map(f => f.name)
        setFiles(prev => prev.map(f => restored.includes(f.name) ? { ...f, status: 'modified' } : f))
        setStash([])
        pushOutput('git stash pop', `Restored: ${restored.join(', ')}`)
      },
    },
    {
      cmd: 'git reset --soft HEAD~1',
      label: 'git reset --soft HEAD~1',
      desc: 'Undo last commit, keep changes staged',
      fn: () => {
        if (commits.length === 0) {
          pushOutput('git reset --soft HEAD~1', 'No commits to undo.')
          return
        }
        const last = commits[commits.length - 1]
        setFiles(prev => prev.map(f => last.files.includes(f.name) ? { ...f, status: 'staged' } : f))
        setCommits(prev => prev.slice(0, -1))
        pushOutput('git reset --soft HEAD~1', `Undid commit ${last.hash}. Changes moved back to staging.`)
      },
    },
    {
      cmd: 'git reset --hard HEAD~1',
      label: 'git reset --hard HEAD~1',
      desc: 'Discard last commit AND changes (danger!)',
      fn: () => {
        if (commits.length === 0) {
          pushOutput('git reset --hard HEAD~1', 'No commits to reset.')
          return
        }
        const last = commits[commits.length - 1]
        setCommits(prev => prev.slice(0, -1))
        setFiles(prev => prev.map(f => last.files.includes(f.name) ? { ...f, status: 'committed' } : f))
        pushOutput('git reset --hard HEAD~1', `HEAD is now at ${commits.length > 1 ? commits[commits.length - 2].hash : '(no commits)'}. Changes DESTROYED.`)
      },
    },
  ]

  const statusColors = {
    untracked: '#94a3b8',
    modified: '#ef4444',
    staged: '#10b981',
    committed: '#3b82f6',
  }

  return (
    <div>
      {/* command cards */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {commands.map(c => (
          <motion.button
            key={c.cmd}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={c.fn}
            disabled={!gitInitialized && c.cmd !== 'git init'}
            style={{
              padding: '7px 14px', borderRadius: 8,
              border: '1px solid var(--border)',
              background: (!gitInitialized && c.cmd !== 'git init') ? 'var(--bg-secondary)' : 'var(--bg-card)',
              color: (!gitInitialized && c.cmd !== 'git init') ? 'var(--text-muted)' : 'var(--text-primary)',
              fontWeight: 600, cursor: (!gitInitialized && c.cmd !== 'git init') ? 'not-allowed' : 'pointer',
              fontSize: 12, fontFamily: 'monospace',
              opacity: (!gitInitialized && c.cmd !== 'git init') ? 0.5 : 1,
            }}
            title={c.desc}
          >
            {c.label}
          </motion.button>
        ))}
      </div>

      {/* file state visualization */}
      <div style={{
        display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 8 }}>Files</div>
          {files.map(f => (
            <motion.div key={f.name} layout style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
              padding: '5px 10px', borderRadius: 8,
              background: `${statusColors[f.status]}12`,
              border: `1px solid ${statusColors[f.status]}30`,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[f.status] }} />
              <span style={{ fontSize: 13, color: statusColors[f.status], fontWeight: 600 }}>{f.name}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 'auto' }}>{f.status}</span>
            </motion.div>
          ))}
        </div>

        {stash.length > 0 && (
          <div style={{
            minWidth: 160, background: '#f59e0b10', border: '1px solid #f59e0b30',
            borderRadius: 12, padding: 12,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginBottom: 8 }}>Stash Box</div>
            {stash.map((f, i) => (
              <div key={i} style={{ fontSize: 12, color: '#f59e0b', marginBottom: 4 }}>{f.name}</div>
            ))}
          </div>
        )}
      </div>

      {/* diff visualization */}
      <AnimatePresence>
        {showDiff && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', marginBottom: 16 }}
          >
            <div style={{
              background: '#1e293b', borderRadius: 10, padding: 14,
              fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8,
            }}>
              <div style={{ color: '#94a3b8' }}>diff --git a/index.html b/index.html</div>
              <div style={{ color: '#ef4444' }}>- &lt;h1&gt;Hello World&lt;/h1&gt;</div>
              <div style={{ color: '#10b981' }}>+ &lt;h1&gt;Hello Git!&lt;/h1&gt;</div>
              <div style={{ color: '#ef4444' }}>- &lt;p&gt;Welcome&lt;/p&gt;</div>
              <div style={{ color: '#10b981' }}>+ &lt;p&gt;Welcome to Git learning&lt;/p&gt;</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* terminal output */}
      {output.length > 0 && (
        <div style={{
          background: '#0f172a', borderRadius: 10, padding: 14,
          fontFamily: 'monospace', fontSize: 12, maxHeight: 200,
          overflowY: 'auto',
        }}>
          {output.map((o, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <div style={{ color: '#10b981' }}>$ {o.cmd}</div>
              <div style={{ color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>{o.result}</div>
            </div>
          ))}
        </div>
      )}

      {/* legend */}
      <div style={{
        display: 'flex', gap: 16, marginTop: 14, flexWrap: 'wrap', fontSize: 12,
      }}>
        {Object.entries(statusColors).map(([k, v]) => (
          <span key={k} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: v, display: 'inline-block' }} />
            <span style={{ color: 'var(--text-muted)' }}>{k}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ---- Branch Visualizer ---- */
function BranchVisualizer() {
  const [branches, setBranches] = useState([
    { name: 'main', color: BRANCH_COLORS.main, commits: [
      { hash: 'a1b2c3d', msg: 'Initial commit' },
      { hash: 'e4f5a6b', msg: 'Add README' },
      { hash: 'c7d8e9f', msg: 'Setup project' },
    ], parent: null, forkPoint: 2 },
  ])
  const [head, setHead] = useState('main')
  const [branchCounter, setBranchCounter] = useState(0)

  const branchNames = ['feature/login', 'feature/payment', 'bugfix/navbar', 'feature/dashboard']
  const branchColorList = [BRANCH_COLORS.feature, '#ec4899', BRANCH_COLORS.hotfix, '#06b6d4']

  const createBranch = () => {
    if (branchCounter >= branchNames.length) return
    const currentBranch = branches.find(b => b.name === head)
    const newBranch = {
      name: branchNames[branchCounter],
      color: branchColorList[branchCounter],
      commits: [],
      parent: head,
      forkPoint: currentBranch.commits.length - 1,
    }
    setBranches(prev => [...prev, newBranch])
    setHead(newBranch.name)
    setBranchCounter(prev => prev + 1)
  }

  const makeCommit = () => {
    const msgs = ['Add component', 'Fix styles', 'Update logic', 'Add tests', 'Refactor code', 'Update deps']
    setBranches(prev => prev.map(b =>
      b.name === head
        ? { ...b, commits: [...b.commits, { hash: generateHash(), msg: msgs[b.commits.length % msgs.length] }] }
        : b
    ))
  }

  const switchBranch = (name) => setHead(name)

  return (
    <div>
      {/* controls */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={createBranch}
          disabled={branchCounter >= branchNames.length}
          style={{
            padding: '8px 18px', borderRadius: 10, border: 'none',
            background: branchCounter >= branchNames.length ? '#94a3b8' : '#8b5cf6',
            color: '#fff', fontWeight: 700, cursor: branchCounter >= branchNames.length ? 'not-allowed' : 'pointer',
            fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          Create Branch
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={makeCommit}
          style={{
            padding: '8px 18px', borderRadius: 10, border: 'none',
            background: 'var(--accent)', color: '#fff', fontWeight: 700,
            cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          Make Commit
        </motion.button>
      </div>

      {/* branch selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {branches.map(b => (
          <motion.button
            key={b.name}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => switchBranch(b.name)}
            style={{
              padding: '6px 14px', borderRadius: 20,
              background: head === b.name ? b.color : `${b.color}15`,
              color: head === b.name ? '#fff' : b.color,
              border: `2px solid ${b.color}`,
              fontWeight: 700, cursor: 'pointer', fontSize: 12,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {b.name} {head === b.name ? '(HEAD)' : ''}
          </motion.button>
        ))}
      </div>

      {/* branch graph */}
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 20, overflowX: 'auto',
      }}>
        {branches.map((branch, bIdx) => (
          <div key={branch.name} style={{ marginBottom: bIdx < branches.length - 1 ? 16 : 0 }}>
            <div style={{
              fontSize: 12, fontWeight: 700, color: branch.color,
              marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{
                width: 12, height: 12, borderRadius: '50%', background: branch.color,
                display: 'inline-block', boxShadow: head === branch.name ? `0 0 10px ${branch.color}` : 'none',
              }} />
              {branch.name}
              {head === branch.name && (
                <span style={{
                  background: '#f59e0b', color: '#fff', padding: '2px 8px',
                  borderRadius: 10, fontSize: 10, fontWeight: 800,
                }}>HEAD</span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 20 }}>
              {/* fork indicator */}
              {branch.parent && (
                <div style={{
                  fontSize: 11, color: 'var(--text-muted)', marginRight: 4,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <span style={{ color: branch.color }}>&#8627;</span>
                  from {branch.parent}
                </div>
              )}
              {/* parent commits (shown dimly for context) */}
              {branch.parent && branches.find(b => b.name === branch.parent) && (
                branches.find(b => b.name === branch.parent).commits.slice(0, branch.forkPoint + 1).map((c, i) => (
                  <div key={`parent-${i}`} style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: `${branches.find(b => b.name === branch.parent).color}30`,
                    border: `2px solid ${branches.find(b => b.name === branch.parent).color}30`,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 8, color: 'var(--text-muted)',
                  }}>
                    {c.hash.slice(0, 3)}
                  </div>
                ))
              )}
              {/* own commits */}
              {(branch.parent ? branch.commits : branch.commits).map((c, i) => (
                <motion.div
                  key={c.hash}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}
                >
                  {i > 0 || branch.parent ? (
                    <div style={{
                      width: 16, height: 2, background: branch.color,
                      opacity: 0.5,
                    }} />
                  ) : null}
                  <div
                    style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: branch.color,
                      border: `3px solid ${branch.color}50`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 8, color: '#fff', fontWeight: 700,
                      boxShadow: `0 0 8px ${branch.color}40`,
                      cursor: 'default',
                    }}
                    title={`${c.hash} - ${c.msg}`}
                  >
                    {c.hash.slice(0, 3)}
                  </div>
                </motion.div>
              ))}
              {/* connecting line */}
              {branch.commits.length === 0 && !branch.parent && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>No commits yet</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Merge Simulator ---- */
function MergeSimulator() {
  const [scenario, setScenario] = useState(null)
  const [merged, setMerged] = useState(false)
  const [conflictResolution, setConflictResolution] = useState(null)

  const scenarios = [
    {
      id: 'ff',
      name: 'Fast-Forward',
      icon: '&#8594;',
      color: '#10b981',
      mainCommits: ['Init', 'Setup'],
      featureCommits: ['Add login', 'Add auth'],
      desc: 'Main has NOT changed since branching. Feature branch simply slides main forward.',
    },
    {
      id: '3way',
      name: 'Three-Way Merge',
      icon: '&#8644;',
      color: '#3b82f6',
      mainCommits: ['Init', 'Setup', 'Hotfix deployed'],
      featureCommits: ['Add login', 'Add auth'],
      desc: 'Both branches have new commits. Git creates a merge commit combining both.',
    },
    {
      id: 'conflict',
      name: 'Merge Conflict!',
      icon: '&#9888;',
      color: '#ef4444',
      mainCommits: ['Init', 'Login with email'],
      featureCommits: ['Login with phone'],
      desc: 'Same file edited in both branches. Git cannot auto-merge -- YOU must resolve!',
    },
  ]

  const reset = () => {
    setScenario(null)
    setMerged(false)
    setConflictResolution(null)
  }

  const doMerge = () => {
    if (scenario.id === 'conflict' && !conflictResolution) return
    setMerged(true)
  }

  return (
    <div>
      {!scenario ? (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {scenarios.map(s => (
            <motion.button
              key={s.id}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setScenario(s)}
              style={{
                padding: '16px 20px', borderRadius: 14,
                border: `2px solid ${s.color}40`,
                background: `${s.color}08`, color: s.color,
                fontWeight: 700, cursor: 'pointer', fontSize: 14,
                fontFamily: 'var(--font-sans)', flex: 1, minWidth: 160,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: s.icon }} />
              <div>{s.name}</div>
              <div style={{ fontSize: 11, fontWeight: 400, marginTop: 6, color: 'var(--text-muted)' }}>{s.desc}</div>
            </motion.button>
          ))}
        </div>
      ) : (
        <div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            style={{
              padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--bg-secondary)', color: 'var(--text-muted)',
              cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-sans)',
              marginBottom: 20,
            }}
          >
            &#8592; Back to scenarios
          </motion.button>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
            {/* main branch */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: BRANCH_COLORS.main, marginBottom: 10 }}>
                main
              </div>
              {scenario.mainCommits.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: BRANCH_COLORS.main, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{c}</span>
                </div>
              ))}
            </div>

            {/* feature branch */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: BRANCH_COLORS.feature, marginBottom: 10 }}>
                feature/login
              </div>
              {scenario.featureCommits.map((c, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                }}>
                  <div style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: BRANCH_COLORS.feature, flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{c}</span>
                </div>
              ))}
            </div>
          </div>

          {/* conflict resolution */}
          {scenario.id === 'conflict' && !merged && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#fef2f2', border: '2px solid #fca5a5', borderRadius: 14,
                padding: 20, marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 800, color: '#dc2626', marginBottom: 12 }}>
                CONFLICT in login.jsx
              </div>
              <div style={{
                background: '#1e293b', borderRadius: 10, padding: 14,
                fontFamily: 'monospace', fontSize: 13, lineHeight: 1.8, marginBottom: 16,
              }}>
                <div style={{ color: '#94a3b8' }}>{'<<<<<<< HEAD'}</div>
                <div style={{ color: '#3b82f6' }}>{'  Login with email'}</div>
                <div style={{ color: '#94a3b8' }}>{'======='}</div>
                <div style={{ color: '#8b5cf6' }}>{'  Login with phone'}</div>
                <div style={{ color: '#94a3b8' }}>{'>>>>>>> feature/login'}</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', marginBottom: 10 }}>
                Resolve the conflict:
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[
                  { label: 'Keep HEAD (email)', value: 'head' },
                  { label: 'Keep feature (phone)', value: 'feature' },
                  { label: 'Keep Both', value: 'both' },
                ].map(opt => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setConflictResolution(opt.value)}
                    style={{
                      padding: '8px 16px', borderRadius: 10,
                      border: `2px solid ${conflictResolution === opt.value ? '#10b981' : '#fca5a5'}`,
                      background: conflictResolution === opt.value ? '#ecfdf5' : '#fff',
                      color: conflictResolution === opt.value ? '#059669' : '#991b1b',
                      fontWeight: 700, cursor: 'pointer', fontSize: 13,
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {opt.label}
                  </motion.button>
                ))}
              </div>
              {conflictResolution && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{
                    marginTop: 14, background: '#ecfdf5', borderRadius: 10,
                    padding: 12, fontFamily: 'monospace', fontSize: 13, color: '#059669',
                  }}
                >
                  Resolved: {conflictResolution === 'head' ? 'Login with email'
                    : conflictResolution === 'feature' ? 'Login with phone'
                    : 'Login with email\nLogin with phone'}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* merge button */}
          {!merged && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={doMerge}
              disabled={scenario.id === 'conflict' && !conflictResolution}
              style={{
                padding: '10px 24px', borderRadius: 12, border: 'none',
                background: (scenario.id === 'conflict' && !conflictResolution) ? '#94a3b8' : scenario.color,
                color: '#fff', fontWeight: 700, cursor: (scenario.id === 'conflict' && !conflictResolution) ? 'not-allowed' : 'pointer',
                fontSize: 14, fontFamily: 'var(--font-sans)',
              }}
            >
              Merge feature into main
            </motion.button>
          )}

          {/* merge result */}
          <AnimatePresence>
            {merged && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 20, borderRadius: 14, padding: 20,
                  background: `${scenario.color}10`, border: `2px solid ${scenario.color}40`,
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 800, color: scenario.color, marginBottom: 10 }}>
                  {scenario.id === 'ff' ? 'Fast-Forward Merge Complete!' :
                   scenario.id === '3way' ? 'Three-Way Merge Complete!' :
                   'Conflict Resolved & Merged!'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {scenario.id === 'ff' && 'Main pointer simply moved forward to include the feature commits. No merge commit needed -- the history stays linear.'}
                  {scenario.id === '3way' && 'Git created a merge commit that combines both branches. The commit has TWO parents -- one from each branch. History shows the branches diverged and re-converged.'}
                  {scenario.id === 'conflict' && `Conflict resolved by keeping ${conflictResolution === 'both' ? 'both versions' : conflictResolution === 'head' ? 'HEAD version (email)' : 'feature version (phone)'}. The resolved file was staged and committed as a merge commit.`}
                </div>
                {/* visual result */}
                <div style={{
                  marginTop: 14, display: 'flex', alignItems: 'center', gap: 6,
                  flexWrap: 'wrap',
                }}>
                  {scenario.mainCommits.map((c, i) => (
                    <div key={`m-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: BRANCH_COLORS.main,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8, color: '#fff', fontWeight: 700,
                      }}>{i + 1}</div>
                      {i < scenario.mainCommits.length - 1 && (
                        <div style={{ width: 12, height: 2, background: BRANCH_COLORS.main }} />
                      )}
                    </div>
                  ))}
                  {scenario.featureCommits.map((c, i) => (
                    <div key={`f-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div style={{ width: 12, height: 2, background: BRANCH_COLORS.feature }} />
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: BRANCH_COLORS.feature,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 8, color: '#fff', fontWeight: 700,
                      }}>F{i + 1}</div>
                    </div>
                  ))}
                  {scenario.id !== 'ff' && (
                    <>
                      <div style={{ width: 12, height: 2, background: '#f59e0b' }} />
                      <div style={{
                        width: 24, height: 24, borderRadius: 4,
                        background: '#f59e0b', transform: 'rotate(45deg)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <span style={{
                          fontSize: 8, color: '#fff', fontWeight: 800,
                          transform: 'rotate(-45deg)',
                        }}>M</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

/* ---- Gitflow Visualizer ---- */
function GitflowVisualizer() {
  const [step, setStep] = useState(0)

  const steps = [
    {
      title: '1. Developer creates feature/login from develop',
      branches: [
        { name: 'main', color: BRANCH_COLORS.main, commits: ['v1.0', 'v1.1'], y: 0 },
        { name: 'develop', color: BRANCH_COLORS.develop, commits: ['Init', 'Setup', 'Base UI'], y: 1 },
        { name: 'feature/login', color: BRANCH_COLORS.feature, commits: [], y: 2 },
      ],
      highlight: 'feature/login',
      desc: 'New feature branch created from develop. Main stays untouched.',
    },
    {
      title: '2. Developer codes, commits, pushes',
      branches: [
        { name: 'main', color: BRANCH_COLORS.main, commits: ['v1.0', 'v1.1'], y: 0 },
        { name: 'develop', color: BRANCH_COLORS.develop, commits: ['Init', 'Setup', 'Base UI'], y: 1 },
        { name: 'feature/login', color: BRANCH_COLORS.feature, commits: ['Add form', 'Add auth', 'Add tests'], y: 2 },
      ],
      highlight: 'feature/login',
      desc: 'Developer makes commits on the feature branch independently.',
    },
    {
      title: '3. Create Pull Request & merge to develop',
      branches: [
        { name: 'main', color: BRANCH_COLORS.main, commits: ['v1.0', 'v1.1'], y: 0 },
        { name: 'develop', color: BRANCH_COLORS.develop, commits: ['Init', 'Setup', 'Base UI', 'Merge login'], y: 1 },
      ],
      highlight: 'develop',
      desc: 'PR reviewed, approved, merged into develop. Feature branch deleted.',
      mergeArrow: true,
    },
    {
      title: '4. Release branch created from develop',
      branches: [
        { name: 'main', color: BRANCH_COLORS.main, commits: ['v1.0', 'v1.1'], y: 0 },
        { name: 'develop', color: BRANCH_COLORS.develop, commits: ['Init', 'Setup', 'Base UI', 'Merge login'], y: 1 },
        { name: 'release/v1.2', color: BRANCH_COLORS.release, commits: ['Bump version', 'Fix typo'], y: 2 },
      ],
      highlight: 'release/v1.2',
      desc: 'Release branch for testing. Only bug fixes go here, no new features.',
    },
    {
      title: '5. Release merged to main & tagged',
      branches: [
        { name: 'main', color: BRANCH_COLORS.main, commits: ['v1.0', 'v1.1', 'v1.2'], y: 0 },
        { name: 'develop', color: BRANCH_COLORS.develop, commits: ['Init', 'Setup', 'Base UI', 'Merge login', 'Merge release'], y: 1 },
      ],
      highlight: 'main',
      desc: 'Release merged to main (tagged v1.2) AND back to develop.',
    },
    {
      title: '6. HOTFIX! Bug in production',
      branches: [
        { name: 'main', color: BRANCH_COLORS.main, commits: ['v1.0', 'v1.1', 'v1.2'], y: 0 },
        { name: 'hotfix/fix-crash', color: BRANCH_COLORS.hotfix, commits: ['Fix null check'], y: 1 },
        { name: 'develop', color: BRANCH_COLORS.develop, commits: ['Init', 'Setup', 'Base UI', 'Merge login', 'Merge release'], y: 2 },
      ],
      highlight: 'hotfix/fix-crash',
      desc: 'Emergency! Hotfix branch from main. Fix applied, merged to BOTH main and develop.',
    },
    {
      title: '7. Hotfix merged everywhere',
      branches: [
        { name: 'main', color: BRANCH_COLORS.main, commits: ['v1.0', 'v1.1', 'v1.2', 'v1.2.1'], y: 0 },
        { name: 'develop', color: BRANCH_COLORS.develop, commits: ['Init', 'Setup', 'Base UI', 'Merge login', 'Merge release', 'Merge hotfix'], y: 1 },
      ],
      highlight: 'main',
      desc: 'Hotfix merged to main (tagged v1.2.1) and develop. Production is fixed!',
    },
  ]

  const current = steps[step]

  return (
    <div>
      {/* step progress */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap',
      }}>
        {steps.map((s, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.1 }}
            onClick={() => setStep(i)}
            style={{
              width: 32, height: 32, borderRadius: '50%',
              background: step === i ? 'var(--accent)' : step > i ? '#10b98130' : 'var(--bg-secondary)',
              color: step === i ? '#fff' : step > i ? '#10b981' : 'var(--text-muted)',
              border: step === i ? 'none' : '1px solid var(--border)',
              fontWeight: 700, cursor: 'pointer', fontSize: 13,
              fontFamily: 'var(--font-sans)',
            }}
          >
            {i + 1}
          </motion.button>
        ))}
      </div>

      {/* current step */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{
            fontSize: 15, fontWeight: 800, color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            {current.title}
          </div>
          <div style={{
            fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16,
            lineHeight: 1.6,
          }}>
            {current.desc}
          </div>

          {/* branch visualization */}
          <div style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 20,
          }}>
            {current.branches.map(branch => (
              <div key={branch.name} style={{ marginBottom: 14 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
                }}>
                  <span style={{
                    width: 12, height: 12, borderRadius: '50%', background: branch.color,
                    display: 'inline-block',
                    boxShadow: current.highlight === branch.name ? `0 0 12px ${branch.color}` : 'none',
                  }} />
                  <span style={{
                    fontSize: 13, fontWeight: 700, color: branch.color,
                  }}>{branch.name}</span>
                  {current.highlight === branch.name && (
                    <span style={{
                      fontSize: 10, background: branch.color, color: '#fff',
                      padding: '2px 8px', borderRadius: 8, fontWeight: 700,
                    }}>ACTIVE</span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, paddingLeft: 20, flexWrap: 'wrap' }}>
                  {branch.commits.map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      {i > 0 && <div style={{ width: 14, height: 2, background: `${branch.color}60` }} />}
                      <div style={{
                        padding: '4px 10px', borderRadius: 12,
                        background: `${branch.color}20`, border: `1px solid ${branch.color}40`,
                        fontSize: 11, fontWeight: 600, color: branch.color,
                        whiteSpace: 'nowrap',
                      }}>{c}</div>
                    </motion.div>
                  ))}
                  {branch.commits.length === 0 && (
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      (just created)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* navigation */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep(prev => Math.max(0, prev - 1))}
          disabled={step === 0}
          style={{
            padding: '8px 20px', borderRadius: 10, border: '1px solid var(--border)',
            background: 'var(--bg-secondary)', color: step === 0 ? 'var(--text-muted)' : 'var(--text-primary)',
            fontWeight: 700, cursor: step === 0 ? 'not-allowed' : 'pointer',
            fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          Previous
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setStep(prev => Math.min(steps.length - 1, prev + 1))}
          disabled={step === steps.length - 1}
          style={{
            padding: '8px 20px', borderRadius: 10, border: 'none',
            background: step === steps.length - 1 ? '#94a3b8' : 'var(--accent)',
            color: '#fff', fontWeight: 700,
            cursor: step === steps.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          Next
        </motion.button>
      </div>
    </div>
  )
}

/* ---- PR Review Simulator ---- */
function PRReviewSimulator() {
  const [activeFile, setActiveFile] = useState(0)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [approved, setApproved] = useState(null)
  const [ciStatus, setCiStatus] = useState('running')

  useState(() => {
    const timer = setTimeout(() => setCiStatus('passed'), 3000)
    return () => clearTimeout(timer)
  })

  const prFiles = [
    {
      name: 'src/Login.jsx',
      additions: 24,
      deletions: 3,
      diff: [
        { type: 'context', line: 'import React from "react"' },
        { type: 'context', line: '' },
        { type: 'deletion', line: 'function Login() {' },
        { type: 'addition', line: 'function Login({ onSuccess }) {' },
        { type: 'context', line: '  const [email, setEmail] = useState("")' },
        { type: 'addition', line: '  const [password, setPassword] = useState("")' },
        { type: 'addition', line: '  const [error, setError] = useState(null)' },
        { type: 'context', line: '' },
        { type: 'deletion', line: '  const handleSubmit = () => {' },
        { type: 'addition', line: '  const handleSubmit = async (e) => {' },
        { type: 'addition', line: '    e.preventDefault()' },
        { type: 'addition', line: '    try {' },
        { type: 'addition', line: '      await auth.login(email, password)' },
        { type: 'addition', line: '      onSuccess()' },
        { type: 'addition', line: '    } catch (err) {' },
        { type: 'addition', line: '      setError(err.message)' },
        { type: 'addition', line: '    }' },
        { type: 'deletion', line: '    login(email)' },
        { type: 'context', line: '  }' },
      ],
    },
    {
      name: 'src/auth.js',
      additions: 15,
      deletions: 0,
      diff: [
        { type: 'addition', line: 'export async function login(email, pwd) {' },
        { type: 'addition', line: '  const res = await fetch("/api/login", {' },
        { type: 'addition', line: '    method: "POST",' },
        { type: 'addition', line: '    body: JSON.stringify({ email, pwd })' },
        { type: 'addition', line: '  })' },
        { type: 'addition', line: '  if (!res.ok) throw new Error("Login failed")' },
        { type: 'addition', line: '  return res.json()' },
        { type: 'addition', line: '}' },
      ],
    },
  ]

  const addComment = () => {
    if (!commentText.trim()) return
    setComments(prev => [...prev, { text: commentText, file: prFiles[activeFile].name }])
    setCommentText('')
  }

  const diffColors = { addition: '#10b981', deletion: '#ef4444', context: 'var(--text-muted)' }
  const diffBg = { addition: '#10b98112', deletion: '#ef444412', context: 'transparent' }

  return (
    <div>
      {/* PR header */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 14, padding: 16,
        border: '1px solid var(--border)', marginBottom: 16,
      }}>
        <div style={{
          fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6,
        }}>
          PR #42: Add login authentication
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
          feature/login &#8594; main -- opened by @developer
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: ciStatus === 'passed' ? '#10b98120' : '#f59e0b20',
            color: ciStatus === 'passed' ? '#10b981' : '#f59e0b',
            border: `1px solid ${ciStatus === 'passed' ? '#10b98140' : '#f59e0b40'}`,
          }}>
            {ciStatus === 'passed' ? 'CI: All checks passed' : 'CI: Running...'}
          </span>
          <span style={{
            padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700,
            background: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f640',
          }}>
            +{prFiles.reduce((s, f) => s + f.additions, 0)} / -{prFiles.reduce((s, f) => s + f.deletions, 0)}
          </span>
        </div>
      </div>

      {/* file tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {prFiles.map((f, i) => (
          <motion.button
            key={f.name}
            whileHover={{ scale: 1.04 }}
            onClick={() => setActiveFile(i)}
            style={{
              padding: '6px 14px', borderRadius: 8,
              background: activeFile === i ? 'var(--accent)' : 'var(--bg-secondary)',
              color: activeFile === i ? '#fff' : 'var(--text-muted)',
              border: '1px solid var(--border)', fontWeight: 600,
              cursor: 'pointer', fontSize: 12, fontFamily: 'monospace',
            }}
          >
            {f.name} <span style={{ opacity: 0.7 }}>+{f.additions} -{f.deletions}</span>
          </motion.button>
        ))}
      </div>

      {/* diff view */}
      <div style={{
        background: '#0f172a', borderRadius: 10, padding: 14,
        fontFamily: 'monospace', fontSize: 12, lineHeight: 1.9,
        marginBottom: 16, overflowX: 'auto',
      }}>
        {prFiles[activeFile].diff.map((line, i) => (
          <div key={i} style={{
            color: diffColors[line.type],
            background: diffBg[line.type],
            padding: '0 8px', borderRadius: 3, marginBottom: 1,
          }}>
            <span style={{ opacity: 0.4, marginRight: 12, userSelect: 'none' }}>
              {line.type === 'addition' ? '+' : line.type === 'deletion' ? '-' : ' '}
            </span>
            {line.line}
          </div>
        ))}
      </div>

      {/* review actions */}
      <div style={{
        display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16,
      }}>
        <input
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          placeholder="Leave a review comment..."
          style={{
            flex: 1, minWidth: 200, padding: '8px 14px', borderRadius: 10,
            border: '1px solid var(--border)', background: 'var(--bg-card)',
            color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-sans)',
            outline: 'none',
          }}
          onKeyDown={e => e.key === 'Enter' && addComment()}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={addComment}
          style={{
            padding: '8px 16px', borderRadius: 10, border: 'none',
            background: '#6366f1', color: '#fff', fontWeight: 700,
            cursor: 'pointer', fontSize: 13, fontFamily: 'var(--font-sans)',
          }}
        >
          Comment
        </motion.button>
      </div>

      {/* comments list */}
      {comments.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          {comments.map((c, i) => (
            <div key={i} style={{
              background: '#fef9c320', border: '1px solid #fef9c360', borderRadius: 10,
              padding: '8px 14px', marginBottom: 6, fontSize: 13,
            }}>
              <span style={{ fontWeight: 700, color: '#f59e0b' }}>You</span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11, marginLeft: 8 }}>on {c.file}</span>
              <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{c.text}</div>
            </div>
          ))}
        </div>
      )}

      {/* approve / request changes */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setApproved(true)}
          style={{
            padding: '10px 22px', borderRadius: 12, border: 'none',
            background: approved === true ? '#10b981' : '#10b98130',
            color: approved === true ? '#fff' : '#10b981',
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
            fontFamily: 'var(--font-sans)',
          }}
        >
          Approve
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setApproved(false)}
          style={{
            padding: '10px 22px', borderRadius: 12, border: 'none',
            background: approved === false ? '#ef4444' : '#ef444430',
            color: approved === false ? '#fff' : '#ef4444',
            fontWeight: 700, cursor: 'pointer', fontSize: 14,
            fontFamily: 'var(--font-sans)',
          }}
        >
          Request Changes
        </motion.button>
      </div>

      <AnimatePresence>
        {approved !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 14, padding: 14, borderRadius: 12,
              background: approved ? '#ecfdf5' : '#fef2f2',
              border: `1px solid ${approved ? '#6ee7b7' : '#fca5a5'}`,
              fontSize: 13, color: approved ? '#059669' : '#dc2626', fontWeight: 600,
            }}
          >
            {approved ? 'You approved the PR! It can now be merged.' : 'Changes requested. Developer must address your comments.'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function Topic12_GitFundamentals() {
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
          Git -- The Complete Guide
        </h1>
        <p style={{
          fontSize: 16, color: 'var(--text-muted)', maxWidth: 620, margin: '0 auto',
        }}>
          Internals, commands, branching, merging, and real-world workflows -- learn Git by doing.
        </p>
      </motion.div>

      {/* ---- Section 1: What is Git? ---- */}
      <SectionBlock title="What is Git? The Time Machine" icon="&#128337;" color="#6366f1">
        <Neuron
          mood="excited"
          message="Imagine you could take a snapshot of your entire project at any point, go back in time, explore alternate realities, and merge the best ideas together. That is Git -- a time machine for your code."
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Git Timeline -- Travel Through Commits">
            <GitTimeline />
          </InteractiveDemo>
        </div>

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 12, padding: 16,
          border: '1px solid var(--border)', fontSize: 13, marginTop: 12,
          color: 'var(--text-secondary)', lineHeight: 1.8,
        }}>
          <strong>Key idea:</strong> Every commit is a snapshot of your entire project.
          Git does not store differences -- it stores the complete state at each commit.
          This makes going back in time instant, no matter how many changes happened since.
        </div>
      </SectionBlock>

      {/* ---- Section 2: The Three Areas ---- */}
      <SectionBlock title="The Three Areas of Git" icon="&#128230;" color="#3b82f6">
        <Neuron
          mood="explaining"
          message="This is the MOST important concept in Git. Your files live in three zones: the Working Directory (your files), the Staging Area (what you are about to commit), and the Repository (committed history). Understanding this flow is the key to mastering Git."
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Git Areas Visualizer -- Working Dir to Staging to Repo">
            <GitAreasVisualizer />
          </InteractiveDemo>
        </div>

        <div style={{
          background: '#3b82f608', borderRadius: 12, padding: 16,
          border: '1px solid #3b82f630', fontSize: 13, marginTop: 12,
          color: 'var(--text-secondary)', lineHeight: 1.8,
        }}>
          <strong>The flow:</strong> You edit files in the <strong style={{ color: '#3b82f6' }}>Working Directory</strong>.
          Then <code style={{ color: '#f59e0b' }}>git add</code> moves them to the <strong style={{ color: '#f59e0b' }}>Staging Area</strong>.
          Finally <code style={{ color: '#10b981' }}>git commit</code> saves them to the <strong style={{ color: '#10b981' }}>Repository</strong>.
          This two-step process lets you choose exactly which changes to include in each commit.
        </div>
      </SectionBlock>

      {/* ---- Section 3: Essential Commands ---- */}
      <SectionBlock title="Essential Git Commands" icon="&#9000;" color="#8b5cf6">
        <Neuron
          mood="happy"
          message="Here is every Git command you will use daily. Click each one to see what it does visually. Start with 'git init' to initialize a repository, then try the rest!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Git Command Lab -- Click Commands, See Results">
            <GitCommandLab />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 4: Branching ---- */}
      <SectionBlock title="Branching -- Parallel Universes" icon="&#127796;" color="#8b5cf6">
        <Neuron
          mood="excited"
          message="Branches are Git's superpower. Think of them as parallel universes -- you can create a new reality, experiment freely, and merge the best results back. The main branch stays safe while you explore!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Branch Visualizer -- Create, Switch, Commit">
            <BranchVisualizer />
          </InteractiveDemo>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12, marginTop: 16,
        }}>
          {[
            { label: 'Feature Branch', desc: 'Build a feature without affecting main', color: BRANCH_COLORS.feature, icon: '&#9733;' },
            { label: 'Bug Fix Branch', desc: 'Quick fix on a separate branch', color: BRANCH_COLORS.hotfix, icon: '&#128295;' },
            { label: 'Experiment Branch', desc: 'Try something risky -- delete if it fails', color: '#06b6d4', icon: '&#128300;' },
          ].map(item => (
            <div key={item.label} style={{
              background: `${item.color}10`, border: `1px solid ${item.color}30`,
              borderRadius: 12, padding: 14,
            }}>
              <div style={{ fontSize: 20, marginBottom: 6 }} dangerouslySetInnerHTML={{ __html: item.icon }} />
              <div style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* ---- Section 5: Merging & Conflicts ---- */}
      <SectionBlock title="Merging & Conflicts" icon="&#128279;" color="#ef4444">
        <Neuron
          mood="thinking"
          message="Merging brings branches back together. Sometimes it is smooth (fast-forward), sometimes it creates a merge commit (three-way), and sometimes there is a conflict you must resolve manually. Let's practice all three!"
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Merge Simulator -- Fast-Forward, Three-Way, Conflict">
            <MergeSimulator />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 6: Gitflow ---- */}
      <SectionBlock title="Gitflow -- Professional Branching Strategy" icon="&#128640;" color="#f59e0b">
        <Neuron
          mood="explaining"
          message="In real teams, you do not just use random branches. Gitflow is a structured workflow with specific branch types: main for production, develop for integration, feature branches for new work, release branches for testing, and hotfix branches for emergencies."
          typed
        />

        <div style={{ marginTop: 20 }}>
          <InteractiveDemo title="Gitflow Visualizer -- Step Through the Workflow">
            <GitflowVisualizer />
          </InteractiveDemo>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 10, marginTop: 16,
        }}>
          {[
            { name: 'main', color: BRANCH_COLORS.main, desc: 'Production-ready code only' },
            { name: 'develop', color: BRANCH_COLORS.develop, desc: 'Integration branch for features' },
            { name: 'feature/*', color: BRANCH_COLORS.feature, desc: 'Individual features from develop' },
            { name: 'release/*', color: BRANCH_COLORS.release, desc: 'Release prep from develop' },
            { name: 'hotfix/*', color: BRANCH_COLORS.hotfix, desc: 'Emergency fixes from main' },
          ].map(b => (
            <div key={b.name} style={{
              background: `${b.color}10`, border: `1px solid ${b.color}30`,
              borderRadius: 10, padding: 10, textAlign: 'center',
            }}>
              <div style={{
                fontSize: 12, fontWeight: 800, color: b.color, fontFamily: 'monospace',
              }}>{b.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{b.desc}</div>
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* ---- Section 7: Pull Requests ---- */}
      <SectionBlock title="Pull Requests & Code Review" icon="&#128065;" color="#0ea5e9">
        <Neuron
          mood="happy"
          message="A Pull Request is how you propose changes to a codebase. You push your branch, open a PR, your team reviews the code, leaves comments, and once approved, the code gets merged. It is the gateway to collaboration!"
          typed
        />

        <div style={{
          background: 'var(--bg-secondary)', borderRadius: 12, padding: 16,
          border: '1px solid var(--border)', fontSize: 13, marginTop: 12, marginBottom: 16,
          color: 'var(--text-secondary)', lineHeight: 1.8,
        }}>
          <strong>PR Lifecycle:</strong>{' '}
          <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Open PR</span> &#8594;{' '}
          <span style={{ color: '#f59e0b', fontWeight: 700 }}>Team Reviews</span> &#8594;{' '}
          <span style={{ color: '#10b981', fontWeight: 700 }}>Approve</span> &#8594;{' '}
          <span style={{ color: '#3b82f6', fontWeight: 700 }}>Merge</span>{' '}
          (CI/CD checks run automatically at each stage)
        </div>

        <div style={{ marginTop: 4 }}>
          <InteractiveDemo title="PR Review Simulator -- Be the Reviewer">
            <PRReviewSimulator />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* ---- Section 8: Hindi Explainer ---- */}
      <SectionBlock title="Summary" icon="&#128221;" color="var(--accent)">
        <Neuron
          mood="happy"
          message="You now understand Git from the inside out -- the three areas, essential commands, branching, merging, Gitflow, and Pull Requests. This is the foundation of every professional development workflow!"
          typed
        />
        <div style={{ marginTop: 20 }}>
          <HindiExplainer
            concept="Git कम्पलीट गाइड"
            english="Git -- Version Control"
            explanation="Git एक time machine है तुम्हारे code की। हर commit एक snapshot है -- कभी भी पीछे जा सकते हो। Branches parallel universes हैं -- एक branch पर feature बनाओ, दूसरी पर bug fix, main branch safe रहे। Merge करके सब एक में लाओ। GitHub पर Push करो ताकि team share कर सके।"
            example="सोचो तुम और तुम्हारे दोस्त एक project बना रहे हो। बिना Git: दोनों same file edit करो → conflict, कौन सा version सही? Git से: तुम feature/login branch पर काम करो, दोस्त feature/payment पर। दोनों independently काम करो, फिर merge करो -- कोई conflict नहीं!"
            terms={[
              { hindi: 'कमिट', english: 'Commit', meaning: 'Code का snapshot -- time machine का checkpoint' },
              { hindi: 'ब्रांच', english: 'Branch', meaning: 'Code की parallel copy -- independent काम करने के लिए' },
              { hindi: 'मर्ज', english: 'Merge', meaning: 'दो branches का code combine करना' },
              { hindi: 'पुल रिक्वेस्ट', english: 'Pull Request', meaning: 'Team से permission माँगना code merge करने की' },
              { hindi: 'क्लोन', english: 'Clone', meaning: 'GitHub से project copy करना अपने laptop पर' },
              { hindi: 'पुश/पुल', english: 'Push/Pull', meaning: 'Push = code भेजो GitHub पर। Pull = GitHub से latest code लो' },
            ]}
          />
        </div>
      </SectionBlock>
    </div>
  )
}
