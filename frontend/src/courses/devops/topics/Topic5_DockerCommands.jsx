import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

/* ================================================================
   TOPIC 5 — Docker Commands
   Interactive terminal simulator + visual cheat sheet + lifecycle
================================================================ */

/* ---- Fake Terminal Simulator ---- */

const CONTAINER_ID = 'a1b2c3d4e5f6'
const IMAGE_ID = 'd1e2f3a4b5c6'

const commandDatabase = {
  'docker pull nginx': {
    type: 'pull',
    layers: [
      { id: 'a1b2c3d4', size: '25.4MB' },
      { id: 'e5f6a7b8', size: '18.2MB' },
      { id: 'c9d0e1f2', size: '5.7MB' },
      { id: '3a4b5c6d', size: '1.2MB' },
    ],
    final: [
      'Digest: sha256:943c25b4b8b9...',
      'Status: Downloaded newer image for nginx:latest',
      'docker.io/library/nginx:latest',
    ],
  },
  'docker images': {
    type: 'table',
    header: 'REPOSITORY   TAG       IMAGE ID       CREATED        SIZE',
    rows: [
      'nginx        latest    ' + IMAGE_ID + '   2 hours ago    142MB',
      'node         18-slim   f7a8b9c0d1e2   3 days ago     238MB',
      'redis        alpine    1234abcd5678   5 days ago     28.5MB',
    ],
  },
  'docker run nginx': {
    type: 'run',
    lines: [
      'Unable to find image \'nginx:latest\' locally',
      'Pulling from library/nginx...',
      'Creating container...',
      'Container ID: ' + CONTAINER_ID,
      'Starting nginx...',
      '/ docker-entrypoint.sh: Configuration complete; ready for start up',
      'nginx: [notice] start worker processes',
      'nginx: ready to accept connections on port 80',
    ],
  },
  'docker run -d nginx': {
    type: 'simple',
    lines: [CONTAINER_ID + '7890abcdef1234567890abcdef12345678'],
  },
  'docker ps': {
    type: 'table',
    header: 'CONTAINER ID   IMAGE   COMMAND                  STATUS          PORTS     NAMES',
    rows: [
      CONTAINER_ID + '   nginx   "/docker-entrypoint..."   Up 3 minutes    80/tcp    hopeful_curie',
    ],
  },
  'docker ps -a': {
    type: 'table',
    header: 'CONTAINER ID   IMAGE   COMMAND                  STATUS                     PORTS   NAMES',
    rows: [
      CONTAINER_ID + '   nginx   "/docker-entrypoint..."   Exited (0) 2 minutes ago           hopeful_curie',
      'b2c3d4e5f6a7   redis   "redis-server"           Up 15 minutes              6379    cool_redis',
    ],
  },
  ['docker stop ' + CONTAINER_ID]: {
    type: 'stop',
    lines: [CONTAINER_ID],
  },
  'docker stop hopeful_curie': {
    type: 'stop',
    lines: [CONTAINER_ID],
  },
  ['docker rm ' + CONTAINER_ID]: {
    type: 'remove',
    lines: [CONTAINER_ID],
  },
  'docker rm hopeful_curie': {
    type: 'remove',
    lines: [CONTAINER_ID],
  },
  'docker build -t myapp .': {
    type: 'build',
    steps: [
      'Step 1/5 : FROM node:18-slim',
      'Step 2/5 : WORKDIR /app',
      'Step 3/5 : COPY package*.json ./',
      'Step 4/5 : RUN npm install',
      'Step 5/5 : COPY . .',
    ],
    final: 'Successfully tagged myapp:latest',
  },
  help: {
    type: 'simple',
    lines: [
      'Available commands:',
      '  docker pull nginx',
      '  docker images',
      '  docker run nginx',
      '  docker run -d nginx',
      '  docker ps',
      '  docker ps -a',
      '  docker stop ' + CONTAINER_ID,
      '  docker rm ' + CONTAINER_ID,
      '  docker build -t myapp .',
      '',
      'Type any command or click the buttons below.',
    ],
  },
}

function TerminalSimulator() {
  const [history, setHistory] = useState([
    { type: 'system', text: 'Docker Terminal v24.0.7 -- Type "help" for available commands' },
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [animatingPull, setAnimatingPull] = useState(null)
  const [animatingBuild, setAnimatingBuild] = useState(null)
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history, animatingPull, animatingBuild])

  const quickCommands = [
    'docker pull nginx',
    'docker images',
    'docker run -d nginx',
    'docker ps',
    'docker stop ' + CONTAINER_ID,
    'docker rm ' + CONTAINER_ID,
  ]

  const executeCommand = async (cmd) => {
    if (isProcessing) return
    const trimmed = cmd.trim().toLowerCase()
    setIsProcessing(true)

    setHistory(h => [...h, { type: 'input', text: cmd.trim() }])
    setInput('')

    const result = commandDatabase[trimmed] || commandDatabase[cmd.trim()]

    if (!result) {
      await delay(300)
      setHistory(h => [...h, { type: 'error', text: `bash: ${cmd.trim()}: command not found. Type "help" for available commands.` }])
      setIsProcessing(false)
      return
    }

    if (result.type === 'pull') {
      setAnimatingPull({ layers: result.layers, final: result.final, progress: result.layers.map(() => 0) })
      // Animate progress bars
      for (let tick = 0; tick <= 20; tick++) {
        await delay(80)
        setAnimatingPull(prev => {
          if (!prev) return prev
          return {
            ...prev,
            progress: prev.layers.map((_, i) => {
              const offset = i * 3
              return Math.min(100, Math.max(0, ((tick - offset) / (20 - offset)) * 100))
            }),
          }
        })
      }
      await delay(200)
      setAnimatingPull(null)
      setHistory(h => [
        ...h,
        ...result.layers.map(l => ({ type: 'output', text: `${l.id}: Pull complete  ${l.size}` })),
        ...result.final.map(t => ({ type: 'success', text: t })),
      ])
    } else if (result.type === 'build') {
      for (let i = 0; i < result.steps.length; i++) {
        setAnimatingBuild(result.steps[i])
        await delay(500)
        setHistory(h => [...h, { type: 'output', text: result.steps[i] }])
      }
      setAnimatingBuild(null)
      await delay(300)
      setHistory(h => [...h, { type: 'success', text: result.final }])
    } else if (result.type === 'run') {
      for (let i = 0; i < result.lines.length; i++) {
        await delay(250)
        setHistory(h => [...h, {
          type: i >= result.lines.length - 2 ? 'success' : 'output',
          text: result.lines[i],
        }])
      }
    } else if (result.type === 'stop') {
      await delay(600)
      setHistory(h => [...h, { type: 'warning', text: 'Sending SIGTERM...' }])
      await delay(800)
      setHistory(h => [...h, { type: 'success', text: result.lines[0] }])
    } else if (result.type === 'remove') {
      await delay(400)
      setHistory(h => [...h, { type: 'success', text: result.lines[0] }])
    } else if (result.type === 'table') {
      await delay(200)
      setHistory(h => [
        ...h,
        { type: 'table-header', text: result.header },
        ...result.rows.map(r => ({ type: 'table-row', text: r })),
      ])
    } else {
      for (const line of result.lines) {
        await delay(60)
        setHistory(h => [...h, { type: 'output', text: line }])
      }
    }

    setIsProcessing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      executeCommand(input)
    }
  }

  const lineColor = (type) => {
    switch (type) {
      case 'input': return '#6ee7b7'
      case 'error': return '#f87171'
      case 'success': return '#34d399'
      case 'warning': return '#fbbf24'
      case 'system': return '#818cf8'
      case 'table-header': return '#94a3b8'
      case 'table-row': return '#cbd5e1'
      default: return '#e2e8f0'
    }
  }

  return (
    <div>
      {/* Terminal Window */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        style={{
          background: '#0d1117',
          borderRadius: 16,
          overflow: 'hidden',
          border: '1px solid #30363d',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(56,139,253,0.08)',
        }}
      >
        {/* Title Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 16px',
          background: '#161b22',
          borderBottom: '1px solid #30363d',
        }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f85149' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#e3b341' }} />
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#3fb950' }} />
          <span style={{
            flex: 1, textAlign: 'center', fontSize: 13, color: '#8b949e',
            fontFamily: 'monospace', fontWeight: 600,
          }}>
            docker-terminal -- bash
          </span>
          <motion.div
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{ width: 8, height: 8, borderRadius: '50%', background: '#3fb950' }}
          />
        </div>

        {/* Terminal Body */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          style={{
            padding: '16px 20px',
            minHeight: 320,
            maxHeight: 420,
            overflowY: 'auto',
            fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
            fontSize: 14,
            lineHeight: 1.7,
            cursor: 'text',
          }}
        >
          {/* History */}
          {history.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={{ color: lineColor(line.type), whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
            >
              {line.type === 'input' ? (
                <>
                  <span style={{ color: '#58a6ff' }}>user@docker</span>
                  <span style={{ color: '#8b949e' }}>:</span>
                  <span style={{ color: '#7ee787' }}>~</span>
                  <span style={{ color: '#8b949e' }}>$ </span>
                  <span style={{ color: '#f0f6fc' }}>{line.text}</span>
                </>
              ) : line.type === 'table-header' ? (
                <span style={{ color: '#58a6ff', fontWeight: 700 }}>{line.text}</span>
              ) : (
                line.text
              )}
            </motion.div>
          ))}

          {/* Pull Animation */}
          <AnimatePresence>
            {animatingPull && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ margin: '8px 0' }}
              >
                {animatingPull.layers.map((layer, i) => (
                  <div key={layer.id} style={{ marginBottom: 6, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#8b949e', minWidth: 90, fontSize: 13 }}>{layer.id}:</span>
                    <div style={{
                      flex: 1, height: 14, background: '#21262d',
                      borderRadius: 7, overflow: 'hidden', position: 'relative',
                    }}>
                      <motion.div
                        animate={{ width: `${animatingPull.progress[i]}%` }}
                        transition={{ duration: 0.08 }}
                        style={{
                          height: '100%',
                          background: animatingPull.progress[i] >= 100
                            ? 'linear-gradient(90deg, #238636, #3fb950)'
                            : 'linear-gradient(90deg, #1f6feb, #58a6ff)',
                          borderRadius: 7,
                        }}
                      />
                    </div>
                    <span style={{ color: '#7ee787', fontSize: 12, minWidth: 55, textAlign: 'right' }}>
                      {animatingPull.progress[i] >= 100 ? '  Done' : `${Math.round(animatingPull.progress[i])}%`}
                    </span>
                    <span style={{ color: '#484f58', fontSize: 11, minWidth: 55 }}>{layer.size}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Build step animation */}
          <AnimatePresence>
            {animatingBuild && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  style={{ display: 'inline-block' }}
                >
                  ⚙
                </motion.span>
                {animatingBuild}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input Line */}
          {!isProcessing && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: '#58a6ff' }}>user@docker</span>
              <span style={{ color: '#8b949e' }}>:</span>
              <span style={{ color: '#7ee787' }}>~</span>
              <span style={{ color: '#8b949e' }}>$ </span>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#f0f6fc', fontFamily: 'inherit', fontSize: 'inherit',
                  caretColor: '#58a6ff', padding: 0,
                }}
                spellCheck={false}
                autoComplete="off"
              />
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 1, ease: 'steps(2)' }}
                style={{ color: '#58a6ff', fontSize: 16, marginLeft: -2 }}
              >
                |
              </motion.span>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#8b949e', marginTop: 4 }}>
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  style={{ fontSize: 20 }}
                >
                  .
                </motion.span>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Command Buttons */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16,
      }}>
        {quickCommands.map((cmd, i) => (
          <motion.button
            key={cmd}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 200 }}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => executeCommand(cmd)}
            disabled={isProcessing}
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              border: '1px solid #30363d',
              background: '#161b22',
              color: '#58a6ff',
              fontFamily: '"Fira Code", monospace',
              fontSize: 12,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              opacity: isProcessing ? 0.5 : 1,
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#8b949e' }}>$ </span>{cmd}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}


/* ---- Command Cheat Sheet ---- */

const commandGroups = [
  {
    category: 'Images',
    icon: '📦',
    gradient: 'linear-gradient(135deg, #6366f1, #818cf8)',
    commands: [
      { cmd: 'docker pull <image>', desc: 'Download image from registry' },
      { cmd: 'docker images', desc: 'List all local images' },
      { cmd: 'docker build -t name .', desc: 'Build image from Dockerfile' },
      { cmd: 'docker rmi <image>', desc: 'Remove an image' },
      { cmd: 'docker tag src dest', desc: 'Tag an image with a new name' },
      { cmd: 'docker push <image>', desc: 'Upload image to registry' },
    ],
  },
  {
    category: 'Containers',
    icon: '🐳',
    gradient: 'linear-gradient(135deg, #0ea5e9, #38bdf8)',
    commands: [
      { cmd: 'docker run <image>', desc: 'Create and start a container' },
      { cmd: 'docker ps', desc: 'List running containers' },
      { cmd: 'docker ps -a', desc: 'List all containers' },
      { cmd: 'docker stop <id>', desc: 'Gracefully stop a container' },
      { cmd: 'docker start <id>', desc: 'Start a stopped container' },
      { cmd: 'docker rm <id>', desc: 'Remove a stopped container' },
      { cmd: 'docker logs <id>', desc: 'View container output logs' },
      { cmd: 'docker exec -it <id> bash', desc: 'Open shell inside container' },
    ],
  },
  {
    category: 'Network',
    icon: '🌐',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    commands: [
      { cmd: 'docker network ls', desc: 'List all networks' },
      { cmd: 'docker network create', desc: 'Create a new network' },
      { cmd: 'docker network connect', desc: 'Connect container to network' },
      { cmd: 'docker network inspect', desc: 'Show network details' },
    ],
  },
  {
    category: 'Volumes',
    icon: '💾',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    commands: [
      { cmd: 'docker volume create', desc: 'Create a named volume' },
      { cmd: 'docker volume ls', desc: 'List all volumes' },
      { cmd: 'docker volume inspect', desc: 'Show volume details' },
      { cmd: 'docker volume rm', desc: 'Remove a volume' },
    ],
  },
]

function CommandCheatSheet() {
  const [activeGroup, setActiveGroup] = useState(0)

  return (
    <div>
      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
        {commandGroups.map((group, i) => (
          <motion.button
            key={group.category}
            onClick={() => setActiveGroup(i)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              background: i === activeGroup ? group.gradient : 'var(--bg-secondary)',
              color: i === activeGroup ? 'white' : 'var(--text-secondary)',
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{
              padding: '10px 20px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'var(--font-heading)',
            }}
          >
            <span style={{ fontSize: 20 }}>{group.icon}</span>
            {group.category}
          </motion.button>
        ))}
      </div>

      {/* Command Cards Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeGroup}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 200, damping: 22 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          {commandGroups[activeGroup].commands.map((cmd, i) => (
            <motion.div
              key={cmd.cmd}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 250 }}
              whileHover={{
                y: -4,
                boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
              }}
              style={{
                padding: 20,
                borderRadius: 16,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Gradient top accent */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: commandGroups[activeGroup].gradient,
              }} />
              <div style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: 8,
                background: 'var(--bg-secondary)',
                padding: '6px 10px',
                borderRadius: 8,
                display: 'inline-block',
              }}>
                {cmd.cmd}
              </div>
              <div style={{
                fontSize: 14,
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}>
                {cmd.desc}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


/* ---- Docker Lifecycle State Machine ---- */

const lifecycleStates = [
  { id: 'created', label: 'Created', color: '#818cf8', icon: '📋', x: 10, y: 50, desc: 'Container exists but is not running' },
  { id: 'running', label: 'Running', color: '#34d399', icon: '🟢', x: 38, y: 15, desc: 'Container is actively executing' },
  { id: 'paused', label: 'Paused', color: '#fbbf24', icon: '⏸', x: 66, y: 15, desc: 'Container processes are suspended' },
  { id: 'stopped', label: 'Stopped', color: '#f87171', icon: '🔴', x: 66, y: 85, desc: 'Container has exited' },
  { id: 'removed', label: 'Removed', color: '#6b7280', icon: '🗑', x: 38, y: 85, desc: 'Container is deleted from disk' },
]

const transitions = [
  { from: 'created', to: 'running', cmd: 'docker start', label: 'start' },
  { from: 'running', to: 'paused', cmd: 'docker pause', label: 'pause' },
  { from: 'paused', to: 'running', cmd: 'docker unpause', label: 'unpause' },
  { from: 'running', to: 'stopped', cmd: 'docker stop', label: 'stop' },
  { from: 'stopped', to: 'running', cmd: 'docker start', label: 'restart' },
  { from: 'stopped', to: 'removed', cmd: 'docker rm', label: 'rm' },
  { from: 'created', to: 'removed', cmd: 'docker rm', label: 'rm' },
]

function DockerLifecycle() {
  const [activeState, setActiveState] = useState('running')
  const [highlightedTransition, setHighlightedTransition] = useState(null)

  const activeTransitions = transitions.filter(
    t => t.from === activeState || t.to === activeState
  )

  const getState = (id) => lifecycleStates.find(s => s.id === id)
  const active = getState(activeState)

  return (
    <div>
      {/* States arranged in a circle-ish layout */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '55%',
        marginBottom: 24,
      }}>
        {/* Connection Lines (SVG) */}
        <svg
          viewBox="0 0 100 100"
          style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none',
          }}
        >
          {transitions.map((t, i) => {
            const from = getState(t.from)
            const to = getState(t.to)
            const isHighlighted = highlightedTransition === i ||
              (t.from === activeState || t.to === activeState)
            const midX = (from.x + to.x) / 2
            const midY = (from.y + to.y) / 2
            // Curve the line a bit
            const dx = to.x - from.x
            const dy = to.y - from.y
            const cx = midX - dy * 0.15
            const cy = midY + dx * 0.15

            return (
              <g key={i}>
                <path
                  d={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
                  fill="none"
                  stroke={isHighlighted ? active.color : '#e2e8f040'}
                  strokeWidth={isHighlighted ? 0.6 : 0.3}
                  strokeDasharray={isHighlighted ? 'none' : '1.5 1'}
                  opacity={isHighlighted ? 0.8 : 0.3}
                />
                {/* Arrow head */}
                {isHighlighted && (
                  <circle r="1" fill={active.color}>
                    <animateMotion
                      dur="2s"
                      repeatCount="indefinite"
                      path={`M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`}
                    />
                  </circle>
                )}
              </g>
            )
          })}
        </svg>

        {/* State Nodes */}
        {lifecycleStates.map((state) => {
          const isActive = activeState === state.id
          const isConnected = activeTransitions.some(t => t.from === state.id || t.to === state.id)
          return (
            <motion.button
              key={state.id}
              onClick={() => setActiveState(state.id)}
              animate={{
                scale: isActive ? 1.12 : 1,
                boxShadow: isActive
                  ? `0 0 30px ${state.color}50, 0 8px 24px ${state.color}30`
                  : '0 2px 8px rgba(0,0,0,0.1)',
              }}
              whileHover={{ scale: isActive ? 1.15 : 1.06 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              style={{
                position: 'absolute',
                left: `${state.x}%`,
                top: `${state.y}%`,
                transform: 'translate(-50%, -50%)',
                width: 110,
                height: 110,
                borderRadius: 22,
                background: isActive
                  ? `linear-gradient(135deg, ${state.color}, ${state.color}cc)`
                  : 'var(--bg-card)',
                border: `2px solid ${isConnected ? state.color : 'var(--border)'}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                color: isActive ? 'white' : 'var(--text-primary)',
                zIndex: isActive ? 10 : 1,
              }}
            >
              <span style={{ fontSize: 28 }}>{state.icon}</span>
              <span style={{
                fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-heading)',
              }}>
                {state.label}
              </span>
              {/* Pulse ring for active */}
              {isActive && (
                <motion.div
                  animate={{ scale: [1, 1.4], opacity: [0.4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    position: 'absolute', inset: -4,
                    borderRadius: 26,
                    border: `2px solid ${state.color}`,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Active State Details */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeState}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ type: 'spring', stiffness: 250, damping: 22 }}
          style={{
            background: `${active.color}10`,
            border: `1px solid ${active.color}30`,
            borderRadius: 16,
            padding: '20px 24px',
          }}
        >
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
          }}>
            <span style={{ fontSize: 24 }}>{active.icon}</span>
            <span style={{
              fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700,
              color: active.color,
            }}>
              {active.label}
            </span>
            <span style={{ fontSize: 14, color: 'var(--text-muted)', marginLeft: 8 }}>
              {active.desc}
            </span>
          </div>

          {/* Available transitions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {activeTransitions.map((t, i) => {
              const target = t.from === activeState ? t.to : t.from
              const targetState = getState(target)
              const isOutgoing = t.from === activeState
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.08 }}
                  onMouseEnter={() => setHighlightedTransition(transitions.indexOf(t))}
                  onMouseLeave={() => setHighlightedTransition(null)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 14px',
                    borderRadius: 10,
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    fontSize: 13,
                  }}
                >
                  <span style={{
                    fontFamily: '"Fira Code", monospace', fontWeight: 700,
                    color: isOutgoing ? targetState.color : active.color,
                    fontSize: 12,
                  }}>
                    {t.cmd}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {isOutgoing ? '→' : '←'}
                  </span>
                  <span style={{
                    fontSize: 14, display: 'flex', alignItems: 'center', gap: 4,
                    color: targetState.color, fontWeight: 600,
                  }}>
                    {targetState.icon} {targetState.label}
                  </span>
                </motion.div>
              )
            })}
            {activeTransitions.length === 0 && (
              <span style={{ color: 'var(--text-muted)', fontSize: 14, fontStyle: 'italic' }}>
                No transitions -- this is the final state.
              </span>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


/* ================================================================
   MAIN EXPORT
================================================================ */

export default function Topic5_DockerCommands() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
      <Neuron
        mood="excited"
        message="Time to get your hands dirty! Docker commands are the language you speak to control containers. Let me give you a real terminal to practice in."
        typed
        size="large"
      />

      <SectionBlock icon="💻" title="Docker Terminal Simulator" color="#0ea5e9">
        <InteractiveDemo
          title="Live Terminal"
          instruction="Type a Docker command or click a quick-command button below. Watch the animated output!"
        >
          <TerminalSimulator />
        </InteractiveDemo>
      </SectionBlock>

      <NeuronTip type="try">
        Start with <strong>docker pull nginx</strong> to download an image, then <strong>docker run -d nginx</strong> to launch it. Use <strong>docker ps</strong> to see it running!
      </NeuronTip>

      <SectionBlock icon="📋" title="Command Cheat Sheet" color="#6366f1">
        <Neuron
          mood="explaining"
          message="Here are ALL the essential Docker commands, organized by what they work with. Click a category to explore."
          size="small"
        />
        <div style={{ marginTop: 20 }}>
          <CommandCheatSheet />
        </div>
      </SectionBlock>

      <SectionBlock icon="🔄" title="Container Lifecycle" color="#10b981">
        <Neuron
          mood="thinking"
          message="A container goes through different states during its life. Click any state to see which commands move it from one state to another."
          size="small"
        />
        <div style={{ marginTop: 20 }}>
          <DockerLifecycle />
        </div>
      </SectionBlock>

      <NeuronTip type="tip">
        The most common workflow: <strong>pull</strong> an image, <strong>run</strong> it as a container, <strong>stop</strong> it when done, and <strong>rm</strong> to clean up. Master these four and you are 80% there!
      </NeuronTip>

      <NeuronTip type="warning">
        <strong>docker rm</strong> only removes stopped containers. Running <strong>docker rm -f</strong> force-kills and removes -- use with caution in production!
      </NeuronTip>
    </div>
  )
}
