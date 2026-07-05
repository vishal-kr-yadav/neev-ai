import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 1 — CPU, Cores & Execution
   How computers actually run your code
================================================================ */

/* ---- Section 1 Interactive: CPU Instruction Viewer ---- */
function CPUInstructionViewer() {
  const [step, setStep] = useState(-1)
  const [isRunning, setIsRunning] = useState(false)

  const code = 'a = 2 + 3'
  const instructions = [
    { op: 'LOAD', arg: '2', register: 'R1', desc: 'Load value 2 into register R1', regState: { R1: 2, R2: '—', R3: '—' } },
    { op: 'LOAD', arg: '3', register: 'R2', desc: 'Load value 3 into register R2', regState: { R1: 2, R2: 3, R3: '—' } },
    { op: 'ADD', arg: 'R1, R2', register: 'R3', desc: 'Add R1 + R2, store result in R3', regState: { R1: 2, R2: 3, R3: 5 } },
    { op: 'STORE', arg: 'R3 -> a', register: 'MEM', desc: 'Store R3 value into memory variable a', regState: { R1: 2, R2: 3, R3: 5 } },
  ]

  const runExecution = () => {
    setIsRunning(true)
    setStep(0)
    let current = 0
    const interval = setInterval(() => {
      current++
      if (current >= instructions.length) {
        clearInterval(interval)
        setIsRunning(false)
        setStep(instructions.length - 1)
        return
      }
      setStep(current)
    }, 1200)
  }

  const reset = () => {
    setStep(-1)
    setIsRunning(false)
  }

  const currentRegs = step >= 0 ? instructions[step].regState : { R1: '—', R2: '—', R3: '—' }

  return (
    <div>
      {/* Python code display */}
      <div style={{
        background: '#1e1e2e', borderRadius: 14, padding: '18px 24px',
        marginBottom: 20, fontFamily: 'monospace', fontSize: 16,
        color: '#cdd6f4', border: '1px solid #45475a',
      }}>
        <div style={{ fontSize: 11, color: '#6c7086', marginBottom: 8, fontWeight: 600, letterSpacing: 1 }}>
          PYTHON CODE
        </div>
        <span style={{ color: '#cba6f7' }}>a</span>
        <span style={{ color: '#89dceb' }}> = </span>
        <span style={{ color: '#fab387' }}>2</span>
        <span style={{ color: '#89dceb' }}> + </span>
        <span style={{ color: '#fab387' }}>3</span>
      </div>

      {/* Arrow */}
      <div style={{ textAlign: 'center', fontSize: 24, color: 'var(--text-muted)', marginBottom: 16 }}>
        Compiles to CPU instructions
      </div>

      {/* CPU Instructions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
        {instructions.map((inst, i) => {
          const isActive = step === i
          const isDone = step > i
          const colors = {
            LOAD: '#3b82f6',
            ADD: '#10b981',
            STORE: '#f59e0b',
          }
          const color = colors[inst.op] || '#6366f1'

          return (
            <motion.div
              key={i}
              animate={{
                borderColor: isActive ? color : isDone ? `${color}40` : 'var(--border)',
                background: isActive ? `${color}10` : 'var(--bg-card)',
                scale: isActive ? 1.02 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '14px 20px', borderRadius: 12,
                border: '2px solid var(--border)',
              }}
            >
              {/* Step number */}
              <motion.div
                animate={{
                  background: isDone || isActive ? color : 'var(--bg-secondary)',
                  color: isDone || isActive ? '#fff' : 'var(--text-muted)',
                }}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 14, flexShrink: 0,
                }}
              >
                {isDone ? '✓' : i + 1}
              </motion.div>

              {/* Instruction */}
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 15, color: isActive ? color : 'var(--text-primary)' }}>
                  {inst.op} {inst.arg}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  {inst.desc}
                </div>
              </div>

              {/* Status */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{
                    padding: '4px 12px', borderRadius: 20,
                    background: color, color: '#fff',
                    fontSize: 12, fontWeight: 700,
                  }}
                >
                  EXECUTING
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Register file */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: 20, marginBottom: 20,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 14 }}>
          CPU REGISTER FILE
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {Object.entries(currentRegs).map(([name, val]) => (
            <motion.div
              key={name}
              animate={{
                borderColor: val !== '—' ? '#6366f1' : 'var(--border)',
                background: val !== '—' ? '#6366f108' : 'var(--bg-secondary)',
              }}
              style={{
                flex: 1, padding: '14px 16px', borderRadius: 10,
                border: '2px solid var(--border)', textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>{name}</div>
              <motion.div
                key={`${name}-${val}`}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  fontSize: 24, fontWeight: 800,
                  fontFamily: 'monospace',
                  color: val !== '—' ? '#6366f1' : 'var(--text-muted)',
                }}
              >
                {val}
              </motion.div>
            </motion.div>
          ))}

          {/* Memory result */}
          <motion.div
            animate={{
              borderColor: step >= 3 ? '#f59e0b' : 'var(--border)',
              background: step >= 3 ? '#f59e0b08' : 'var(--bg-secondary)',
            }}
            style={{
              flex: 1, padding: '14px 16px', borderRadius: 10,
              border: '2px solid var(--border)', textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>a (MEM)</div>
            <motion.div
              key={`mem-${step}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                fontSize: 24, fontWeight: 800, fontFamily: 'monospace',
                color: step >= 3 ? '#f59e0b' : 'var(--text-muted)',
              }}
            >
              {step >= 3 ? 5 : '—'}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={runExecution}
          disabled={isRunning}
          style={{
            padding: '12px 32px', borderRadius: 12, border: 'none',
            background: isRunning ? 'var(--border)' : 'var(--gradient-primary)',
            color: isRunning ? 'var(--text-muted)' : '#fff',
            fontWeight: 700, fontSize: 15, cursor: isRunning ? 'default' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {isRunning ? 'Executing...' : step >= 0 ? 'Run Again' : 'Execute'}
        </motion.button>
        {step >= 0 && !isRunning && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            style={{
              padding: '12px 24px', borderRadius: 12,
              border: '1px solid var(--border)', background: 'var(--bg-card)',
              color: 'var(--text-primary)', fontWeight: 600, fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Reset
          </motion.button>
        )}
      </div>

      {/* Completion message */}
      <AnimatePresence>
        {step >= 3 && !isRunning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              marginTop: 16, padding: '14px 20px', borderRadius: 12,
              background: 'linear-gradient(135deg, #10b98115, #3b82f615)',
              border: '1px solid #10b98140', textAlign: 'center',
              fontSize: 15, fontWeight: 700, color: '#10b981',
            }}
          >
            Done! Variable a now holds the value 5 in memory.
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ---- Section 2 Interactive: Core Task Scheduler ---- */
function CoreTaskScheduler() {
  const [coreCount, setCoreCount] = useState(4)
  const [isRunning, setIsRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [taskAlloc, setTaskAlloc] = useState([])

  const totalTasks = 8
  const baseDuration = 4000
  const actualDuration = baseDuration / coreCount * (totalTasks / Math.max(coreCount, 1))
  const speedup = (totalTasks / coreCount).toFixed(1)

  const taskColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#0ea5e9', '#6366f1']

  const startSimulation = () => {
    setIsRunning(true)
    setProgress(0)
    setElapsed(0)

    // Distribute tasks across cores
    const alloc = Array.from({ length: coreCount }, () => [])
    for (let i = 0; i < totalTasks; i++) {
      alloc[i % coreCount].push(i)
    }
    setTaskAlloc(alloc)

    const startTime = Date.now()
    const duration = baseDuration
    const interval = setInterval(() => {
      const now = Date.now()
      const pct = Math.min((now - startTime) / duration, 1)
      setProgress(pct)
      setElapsed(((now - startTime) / 1000).toFixed(1))
      if (pct >= 1) {
        clearInterval(interval)
        setIsRunning(false)
      }
    }, 50)
  }

  const coreOptions = [1, 2, 4, 8]

  return (
    <div>
      {/* Core selector */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
        {coreOptions.map(n => (
          <motion.button
            key={n}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { if (!isRunning) setCoreCount(n) }}
            style={{
              padding: '10px 24px', borderRadius: 12, border: '2px solid',
              borderColor: coreCount === n ? 'var(--accent)' : 'var(--border)',
              background: coreCount === n ? 'var(--accent)' : 'var(--bg-card)',
              color: coreCount === n ? '#fff' : 'var(--text-primary)',
              fontWeight: 700, fontSize: 15, cursor: isRunning ? 'default' : 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            {n} Core{n > 1 ? 's' : ''}
          </motion.button>
        ))}
      </div>

      {/* Task queue */}
      <div style={{
        background: 'var(--bg-secondary)', borderRadius: 12, padding: '14px 20px',
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 10 }}>
          TASK QUEUE ({totalTasks} tasks)
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Array.from({ length: totalTasks }, (_, i) => (
            <motion.div
              key={i}
              animate={{
                opacity: isRunning && progress >= (i + 1) / totalTasks ? 0.3 : 1,
                scale: isRunning && progress >= i / totalTasks && progress < (i + 1) / totalTasks ? 1.1 : 1,
              }}
              style={{
                width: 44, height: 44, borderRadius: 10,
                background: taskColors[i], display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 14,
              }}
            >
              T{i + 1}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cores visualization */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {Array.from({ length: coreCount }, (_, coreIdx) => {
          const coreTasks = taskAlloc[coreIdx] || []
          const taskCount = coreTasks.length
          return (
            <div key={coreIdx} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 16px', borderRadius: 12,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 40, fontSize: 12, fontWeight: 700,
                color: 'var(--text-muted)', flexShrink: 0,
              }}>
                Core {coreIdx + 1}
              </div>
              <div style={{ flex: 1, height: 32, background: 'var(--bg-secondary)', borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                {isRunning || progress >= 1 ? (
                  coreTasks.map((taskIdx, ti) => {
                    const segWidth = 100 / taskCount
                    const segStart = segWidth * ti
                    const segProgress = Math.min(Math.max((progress * totalTasks - taskIdx) / 1, 0), 1)
                    return (
                      <motion.div
                        key={taskIdx}
                        initial={{ width: 0 }}
                        animate={{ width: `${segWidth * segProgress}%` }}
                        style={{
                          position: 'absolute', left: `${segStart}%`, top: 0, bottom: 0,
                          background: taskColors[taskIdx], borderRadius: 4,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 10, fontWeight: 700,
                          overflow: 'hidden', minWidth: segProgress > 0.3 ? 'auto' : 0,
                        }}
                      >
                        {segProgress > 0.5 && `T${taskIdx + 1}`}
                      </motion.div>
                    )
                  })
                ) : null}
              </div>
              <div style={{ width: 60, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>
                {coreTasks.length} task{coreTasks.length !== 1 ? 's' : ''}
              </div>
            </div>
          )
        })}
      </div>

      {/* Timer and speedup */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20, justifyContent: 'center' }}>
        <div style={{
          padding: '12px 24px', borderRadius: 12,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1 }}>ELAPSED</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace' }}>
            {elapsed}s
          </div>
        </div>
        <div style={{
          padding: '12px 24px', borderRadius: 12,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1 }}>SPEEDUP</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#10b981', fontFamily: 'monospace' }}>
            {coreCount}x
          </div>
        </div>
        <div style={{
          padding: '12px 24px', borderRadius: 12,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: 1 }}>PROGRESS</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#3b82f6', fontFamily: 'monospace' }}>
            {Math.round(progress * 100)}%
          </div>
        </div>
      </div>

      {/* Run button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startSimulation}
          disabled={isRunning}
          style={{
            padding: '12px 36px', borderRadius: 12, border: 'none',
            background: isRunning ? 'var(--border)' : 'var(--gradient-primary)',
            color: isRunning ? 'var(--text-muted)' : '#fff',
            fontWeight: 700, fontSize: 15, cursor: isRunning ? 'default' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          {isRunning ? 'Running...' : 'Run Tasks'}
        </motion.button>
      </div>
    </div>
  )
}

/* ---- Section 4 Interactive: Process Monitor ---- */
function ProcessMonitor() {
  const [processes, setProcesses] = useState([
    { name: 'python app.py', icon: '🐍', cpu: 34, mem: 256, color: '#3b82f6' },
    { name: 'chrome.exe', icon: '🌐', cpu: 22, mem: 1820, color: '#f59e0b' },
    { name: 'code.exe (VS Code)', icon: '📝', cpu: 8, mem: 680, color: '#0ea5e9' },
  ])
  const [ticks, setTicks] = useState(0)

  const fluctuate = () => {
    setProcesses(prev => prev.map(p => ({
      ...p,
      cpu: Math.max(1, Math.min(95, p.cpu + Math.floor(Math.random() * 20 - 10))),
      mem: Math.max(64, p.mem + Math.floor(Math.random() * 100 - 50)),
    })))
    setTicks(t => t + 1)
  }

  const launchProcess = () => {
    const newProcs = [
      { name: 'node server.js', icon: '🟢', cpu: 15, mem: 220, color: '#10b981' },
      { name: 'docker run', icon: '🐳', cpu: 42, mem: 512, color: '#8b5cf6' },
      { name: 'jupyter notebook', icon: '📓', cpu: 28, mem: 390, color: '#ec4899' },
    ]
    const available = newProcs.filter(np => !processes.some(p => p.name === np.name))
    if (available.length > 0) {
      setProcesses(prev => [...prev, available[0]])
    }
  }

  const totalCpu = processes.reduce((sum, p) => sum + p.cpu, 0)
  const totalMem = processes.reduce((sum, p) => sum + p.mem, 0)

  return (
    <div>
      {/* Header bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 20px', background: '#1e1e2e', borderRadius: '12px 12px 0 0',
        color: '#cdd6f4', fontFamily: 'monospace', fontSize: 13,
      }}>
        <span style={{ fontWeight: 700 }}>PROCESS MONITOR</span>
        <span>Total CPU: {Math.min(totalCpu, 100)}% | Memory: {(totalMem / 1024).toFixed(1)} GB</span>
      </div>

      {/* Process list */}
      <div style={{
        background: '#181825', borderRadius: '0 0 12px 12px', padding: '12px 0',
        marginBottom: 16,
      }}>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '40px 1fr 120px 120px',
          padding: '6px 20px', fontSize: 11, color: '#6c7086', fontWeight: 700, letterSpacing: 1,
          borderBottom: '1px solid #313244',
        }}>
          <span></span>
          <span>PROCESS</span>
          <span>CPU %</span>
          <span>MEMORY</span>
        </div>

        {processes.map((proc, i) => (
          <motion.div
            key={proc.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{
              display: 'grid', gridTemplateColumns: '40px 1fr 120px 120px',
              padding: '10px 20px', alignItems: 'center',
              borderBottom: '1px solid #31324440',
            }}
          >
            <span style={{ fontSize: 20 }}>{proc.icon}</span>
            <span style={{ color: '#cdd6f4', fontSize: 14, fontFamily: 'monospace' }}>{proc.name}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 8, background: '#313244', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  animate={{ width: `${proc.cpu}%` }}
                  transition={{ duration: 0.5 }}
                  style={{
                    height: '100%', borderRadius: 4,
                    background: proc.cpu > 60 ? '#ef4444' : proc.cpu > 30 ? '#f59e0b' : '#10b981',
                  }}
                />
              </div>
              <span style={{ color: '#cdd6f4', fontSize: 12, fontFamily: 'monospace', width: 36, textAlign: 'right' }}>
                {proc.cpu}%
              </span>
            </div>
            <span style={{ color: '#a6adc8', fontSize: 13, fontFamily: 'monospace' }}>
              {proc.mem} MB
            </span>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fluctuate}
          style={{
            padding: '10px 24px', borderRadius: 10, border: 'none',
            background: 'var(--gradient-primary)', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          Refresh Stats
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={launchProcess}
          disabled={processes.length >= 6}
          style={{
            padding: '10px 24px', borderRadius: 10,
            border: '1px solid var(--border)',
            background: processes.length >= 6 ? 'var(--bg-secondary)' : 'var(--bg-card)',
            color: processes.length >= 6 ? 'var(--text-muted)' : 'var(--text-primary)',
            fontWeight: 700, fontSize: 14, cursor: processes.length >= 6 ? 'default' : 'pointer',
            fontFamily: 'var(--font-heading)',
          }}
        >
          + Launch New Process
        </motion.button>
      </div>
    </div>
  )
}

/* ---- Section 5 Interactive: Task Classifier ---- */
function TaskClassifier() {
  const [currentTask, setCurrentTask] = useState(0)
  const [score, setScore] = useState(0)
  const [answers, setAnswers] = useState([])
  const [showResult, setShowResult] = useState(false)

  const tasks = [
    { label: 'Resizing 1000 images', answer: 'cpu', explanation: 'Image processing uses heavy math operations — pure CPU work.' },
    { label: 'Calling OpenAI API', answer: 'io', explanation: 'Network request — your CPU waits idle while data travels over the internet.' },
    { label: 'Parsing a large CSV file', answer: 'cpu', explanation: 'Reading and processing data row by row is computation-heavy work.' },
    { label: 'Waiting for a database query', answer: 'io', explanation: 'The database is on another server — your app just waits for the response.' },
    { label: 'Training a neural network', answer: 'cpu', explanation: 'Millions of matrix multiplications — the most CPU/GPU-intensive task.' },
    { label: 'Reading a large file from disk', answer: 'io', explanation: 'Disk access is slow compared to CPU — the processor waits for data.' },
    { label: 'Encrypting passwords with bcrypt', answer: 'cpu', explanation: 'Bcrypt intentionally uses heavy computation to make passwords secure.' },
    { label: 'Downloading files from S3', answer: 'io', explanation: 'Network transfer — CPU does almost nothing while bits travel over the wire.' },
  ]

  const handleAnswer = (choice) => {
    const isCorrect = choice === tasks[currentTask].answer
    const newAnswers = [...answers, { task: tasks[currentTask], choice, isCorrect }]
    setAnswers(newAnswers)
    if (isCorrect) setScore(s => s + 1)
    setShowResult(true)

    setTimeout(() => {
      setShowResult(false)
      if (currentTask < tasks.length - 1) {
        setCurrentTask(c => c + 1)
      }
    }, 1800)
  }

  const resetQuiz = () => {
    setCurrentTask(0)
    setScore(0)
    setAnswers([])
    setShowResult(false)
  }

  const isComplete = answers.length >= tasks.length
  const currentAnswer = answers[currentTask]

  return (
    <div>
      {/* Progress */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {tasks.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              background: i < answers.length
                ? (answers[i].isCorrect ? '#10b981' : '#ef4444')
                : i === currentTask ? 'var(--accent)' : 'var(--border)',
              flex: i === currentTask ? 3 : 1,
            }}
            style={{ height: 6, borderRadius: 3 }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
        Task {Math.min(currentTask + 1, tasks.length)} of {tasks.length} | Score: {score}/{answers.length}
      </div>

      {!isComplete ? (
        <>
          {/* Current task */}
          <motion.div
            key={currentTask}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '24px 28px', borderRadius: 16, textAlign: 'center',
              background: 'var(--bg-card)', border: '2px solid var(--border)',
              marginBottom: 20, fontSize: 20, fontWeight: 700,
              color: 'var(--text-primary)', fontFamily: 'var(--font-heading)',
            }}
          >
            "{tasks[currentTask].label}"
          </motion.div>

          {/* Choice buttons */}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 }}>
            <motion.button
              whileHover={{ scale: showResult ? 1 : 1.05 }}
              whileTap={{ scale: showResult ? 1 : 0.95 }}
              onClick={() => !showResult && handleAnswer('cpu')}
              disabled={showResult}
              style={{
                flex: 1, maxWidth: 220, padding: '20px 24px', borderRadius: 16,
                border: '2px solid',
                borderColor: showResult && currentAnswer
                  ? (currentAnswer.choice === 'cpu'
                    ? (currentAnswer.isCorrect ? '#10b981' : '#ef4444')
                    : (tasks[currentTask].answer === 'cpu' ? '#10b981' : 'var(--border)'))
                  : '#10b98160',
                background: showResult && currentAnswer && tasks[currentTask].answer === 'cpu'
                  ? '#10b98115' : 'var(--bg-card)',
                cursor: showResult ? 'default' : 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔥</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#10b981', fontFamily: 'var(--font-heading)' }}>
                CPU-bound
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Crunching numbers
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: showResult ? 1 : 1.05 }}
              whileTap={{ scale: showResult ? 1 : 0.95 }}
              onClick={() => !showResult && handleAnswer('io')}
              disabled={showResult}
              style={{
                flex: 1, maxWidth: 220, padding: '20px 24px', borderRadius: 16,
                border: '2px solid',
                borderColor: showResult && currentAnswer
                  ? (currentAnswer.choice === 'io'
                    ? (currentAnswer.isCorrect ? '#10b981' : '#ef4444')
                    : (tasks[currentTask].answer === 'io' ? '#10b981' : 'var(--border)'))
                  : '#3b82f660',
                background: showResult && currentAnswer && tasks[currentTask].answer === 'io'
                  ? '#3b82f615' : 'var(--bg-card)',
                cursor: showResult ? 'default' : 'pointer',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>🕐</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#3b82f6', fontFamily: 'var(--font-heading)' }}>
                I/O-bound
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                Waiting for data
              </div>
            </motion.button>
          </div>

          {/* Result feedback */}
          <AnimatePresence>
            {showResult && currentAnswer && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  padding: '14px 20px', borderRadius: 12, textAlign: 'center',
                  background: currentAnswer.isCorrect ? '#10b98115' : '#ef444415',
                  border: `1px solid ${currentAnswer.isCorrect ? '#10b98140' : '#ef444440'}`,
                  color: currentAnswer.isCorrect ? '#10b981' : '#ef4444',
                  fontSize: 14, fontWeight: 600,
                }}
              >
                {currentAnswer.isCorrect ? 'Correct! ' : 'Not quite. '}
                {currentAnswer.task.explanation}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Completion */
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            textAlign: 'center', padding: '32px 24px', borderRadius: 16,
            background: score >= 6 ? 'linear-gradient(135deg, #10b98115, #3b82f615)' : 'var(--bg-card)',
            border: `2px solid ${score >= 6 ? '#10b98140' : 'var(--border)'}`,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>
            {score >= 7 ? '🌟' : score >= 5 ? '👍' : '💪'}
          </div>
          <div style={{
            fontSize: 28, fontWeight: 800, color: 'var(--text-primary)',
            fontFamily: 'var(--font-heading)', marginBottom: 8,
          }}>
            {score}/{tasks.length} Correct!
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 20 }}>
            {score >= 7 ? 'Excellent! You really understand the difference.'
              : score >= 5 ? 'Good job! A few more to master.'
              : 'Keep practicing — this distinction is crucial for scaling.'}
          </div>

          {/* Review answers */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20, textAlign: 'left' }}>
            {answers.map((a, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 14px', borderRadius: 8,
                background: a.isCorrect ? '#10b98108' : '#ef444408',
                fontSize: 13,
              }}>
                <span style={{ color: a.isCorrect ? '#10b981' : '#ef4444', fontWeight: 800 }}>
                  {a.isCorrect ? '✓' : '✗'}
                </span>
                <span style={{ color: 'var(--text-primary)', flex: 1 }}>{a.task.label}</span>
                <span style={{
                  padding: '2px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                  background: a.task.answer === 'cpu' ? '#10b98118' : '#3b82f618',
                  color: a.task.answer === 'cpu' ? '#10b981' : '#3b82f6',
                }}>
                  {a.task.answer === 'cpu' ? 'CPU' : 'I/O'}
                </span>
              </div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetQuiz}
            style={{
              padding: '12px 32px', borderRadius: 12, border: 'none',
              background: 'var(--gradient-primary)', color: '#fff',
              fontWeight: 700, fontSize: 15, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Try Again
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic1_CPU() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

      {/* --- Section 1: What is a CPU? --- */}
      <SectionBlock title="What is a CPU? The Brain Analogy" icon="🧠" color="#6366f1">
        <Neuron
          mood="explaining"
          message="Think of the CPU as the brain of your computer. Just like your brain processes thoughts one at a time (even though it feels instant), a CPU processes instructions one by one, billions of times per second. Let me show you what happens when Python runs a = 2 + 3..."
          typed
        />
        <div style={{ marginTop: 28 }}>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Your Python code looks simple, but the CPU breaks it into tiny steps called <strong style={{ color: 'var(--text-primary)' }}>machine instructions</strong>. Each instruction does one tiny thing: load a number, add two numbers, store a result. The CPU executes billions of these per second.
          </p>
        </div>
        <div style={{ marginTop: 24 }}>
          <InteractiveDemo title="CPU Instruction Viewer" instruction="Click Execute to watch the CPU process a = 2 + 3 step by step.">
            <CPUInstructionViewer />
          </InteractiveDemo>
        </div>
      </SectionBlock>

      {/* --- Section 2: Cores — Multiple Workers --- */}
      <SectionBlock title="Cores — Multiple Workers" icon="⚙️" color="#3b82f6">
        <Neuron
          mood="thinking"
          message="A single CPU core is like having one chef in a kitchen. They can cook fast, but they can only do one dish at a time. Multi-core CPUs are like having 4 or 8 chefs — each handling a different dish simultaneously!"
          typed
        />
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 16 }}>
            Early CPUs had a single core. When speed couldn't increase further (heat limits!), manufacturers started adding more cores.
            Modern laptops typically have <strong style={{ color: 'var(--text-primary)' }}>4-8 cores</strong>, while servers can have <strong style={{ color: 'var(--text-primary)' }}>64-128 cores</strong>.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { year: '2005', cores: 1, label: 'Pentium 4', color: '#94a3b8' },
              { year: '2010', cores: 4, label: 'Core i5', color: '#3b82f6' },
              { year: '2020', cores: 8, label: 'Ryzen 7', color: '#8b5cf6' },
              { year: '2024', cores: 16, label: 'Ryzen 9', color: '#ec4899' },
            ].map(cpu => (
              <motion.div
                key={cpu.year}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                  padding: '16px 14px', borderRadius: 14, textAlign: 'center',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>{cpu.year}</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: cpu.color, fontFamily: 'var(--font-heading)' }}>
                  {cpu.cores}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>core{cpu.cores > 1 ? 's' : ''}</div>
                <div style={{ fontSize: 11, color: cpu.color, fontWeight: 700, marginTop: 4 }}>{cpu.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <InteractiveDemo title="Core Task Scheduler" instruction="Select the number of cores and hit Run to see how tasks get distributed. Watch the speedup!">
          <CoreTaskScheduler />
        </InteractiveDemo>
      </SectionBlock>

      {/* --- Section 3: Clock Speed & IPC --- */}
      <SectionBlock title="Clock Speed & IPC" icon="⏱️" color="#f59e0b">
        <Neuron
          mood="happy"
          message="GHz means gigahertz — billions of cycles per second. A 3 GHz CPU ticks 3 billion times every second! But raw speed isn't everything. What matters is how much work gets done per tick."
          typed
        />
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 20 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Clock Speed</strong> tells you how fast the CPU ticks.
            <strong style={{ color: 'var(--text-primary)' }}> IPC (Instructions Per Cycle)</strong> tells you how much work happens per tick.
            Real performance = Clock Speed x IPC x Cores.
          </p>

          {/* Comparison table */}
          <div style={{
            borderRadius: 16, overflow: 'hidden',
            border: '1px solid var(--border)',
          }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
              padding: '14px 20px', background: 'var(--bg-secondary)',
              fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', letterSpacing: 0.5,
              borderBottom: '1px solid var(--border)',
            }}>
              <span>CPU</span>
              <span>Cores</span>
              <span>Clock Speed</span>
              <span>IPC (relative)</span>
              <span>Best For</span>
            </div>
            {[
              { name: 'Core i5-13400', cores: '10', clock: '4.6 GHz', ipc: 'High', use: 'Everyday / Gaming', color: '#3b82f6' },
              { name: 'Core i7-13700K', cores: '16', clock: '5.4 GHz', ipc: 'Very High', use: 'Dev / Streaming', color: '#8b5cf6' },
              { name: 'Xeon W-3375', cores: '38', clock: '2.5 GHz', ipc: 'Moderate', use: 'Servers / ML Training', color: '#f59e0b' },
            ].map((cpu, i) => (
              <motion.div
                key={cpu.name}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                  padding: '14px 20px', alignItems: 'center',
                  background: 'var(--bg-card)',
                  borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                }}
              >
                <span style={{ fontWeight: 700, color: cpu.color, fontSize: 14 }}>{cpu.name}</span>
                <span style={{ color: 'var(--text-primary)', fontSize: 14 }}>{cpu.cores}</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-primary)', fontSize: 14 }}>{cpu.clock}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{cpu.ipc}</span>
                <span style={{
                  padding: '4px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                  background: `${cpu.color}15`, color: cpu.color, display: 'inline-block',
                }}>
                  {cpu.use}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{
              marginTop: 16, padding: '14px 20px', borderRadius: 12,
              background: '#f59e0b10', border: '1px solid #f59e0b30',
              fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6,
            }}
          >
            <strong style={{ color: '#f59e0b' }}>Key insight:</strong> The Xeon has way more cores but lower clock speed.
            For a single-threaded Python script, the i7 is faster. For training ML models on 38 parallel workers, the Xeon wins.
          </motion.div>
        </div>
      </SectionBlock>

      {/* --- Section 4: Processes --- */}
      <SectionBlock title="Processes — Your App's Container" icon="📦" color="#0ea5e9">
        <Neuron
          mood="explaining"
          message="When you run python app.py, the OS creates a process for it. A process is like a private office for your program — it gets its own memory, its own CPU time, and its own set of resources. No other program can mess with it!"
          typed
        />
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 8 }}>
            Every running program is a <strong style={{ color: 'var(--text-primary)' }}>process</strong>. The OS gives each one:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Memory Space', icon: '🧠', desc: 'Its own private RAM region', color: '#3b82f6' },
              { label: 'CPU Time', icon: '⏰', desc: 'Scheduled time slices on cores', color: '#10b981' },
              { label: 'File Handles', icon: '📂', desc: 'Access to files, sockets, pipes', color: '#f59e0b' },
            ].map(item => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                style={{
                  padding: '18px 16px', borderRadius: 14, textAlign: 'center',
                  background: `${item.color}08`, border: `1px solid ${item.color}25`,
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
        <InteractiveDemo title="Process Monitor" instruction="Click Refresh to watch CPU and memory fluctuate. Launch new processes and see resources shift.">
          <ProcessMonitor />
        </InteractiveDemo>
      </SectionBlock>

      {/* --- Section 5: CPU-bound vs I/O-bound --- */}
      <SectionBlock title="CPU-bound vs I/O-bound" icon="⚡" color="#ec4899">
        <Neuron
          mood="excited"
          message="This is THE most important concept for scaling! If your code is CPU-bound, adding more cores helps. If it's I/O-bound, you need async or more connections. Getting this wrong means you'll optimize the wrong thing!"
          typed
        />
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* CPU-bound card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{
                padding: '24px', borderRadius: 18,
                background: 'linear-gradient(135deg, #10b98108, #10b98115)',
                border: '2px solid #10b98130',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>🔥</span>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: '#10b981' }}>
                  CPU-bound
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
                The CPU is the bottleneck. It is working flat-out crunching numbers. Adding a faster CPU or more cores directly speeds things up.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['ML model training', 'Image/video processing', 'Data compression', 'Cryptographic hashing'].map(ex => (
                  <div key={ex} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#10b981' }}>
                    <span style={{ fontWeight: 800 }}>✓</span> {ex}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* I/O-bound card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{
                padding: '24px', borderRadius: 18,
                background: 'linear-gradient(135deg, #3b82f608, #3b82f615)',
                border: '2px solid #3b82f630',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 28 }}>🕐</span>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 20, color: '#3b82f6' }}>
                  I/O-bound
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 14 }}>
                The CPU is mostly idle, waiting for data from network, disk, or database. A faster CPU won't help — you need async I/O or more connections.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['API calls (REST, GraphQL)', 'Database queries', 'File system reads/writes', 'Cloud storage downloads'].map(ex => (
                  <div key={ex} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#3b82f6' }}>
                    <span style={{ fontWeight: 800 }}>✓</span> {ex}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
        <InteractiveDemo title="Task Classifier Quiz" instruction="Classify each task as CPU-bound or I/O-bound. Can you get all 8 correct?">
          <TaskClassifier />
        </InteractiveDemo>
      </SectionBlock>

      {/* --- Section 6: Hindi Explainer --- */}
      <SectionBlock title="Summary" icon="📖" color="#ff9933">
        <Neuron
          mood="happy"
          message="Great job making it through! You now understand how a CPU works, why cores matter, what processes are, and the critical difference between CPU-bound and I/O-bound tasks. This foundation is essential for everything we'll learn about scaling."
          typed
        />
        <div style={{ marginTop: 20 }}>
          <HindiExplainer
            concept="सी.पी.यू. और कोर"
            english="CPU & Cores"
            explanation="CPU कंप्यूटर का दिमाग है। जैसे एक रसोई में एक शेफ (1 core) सब कुछ अकेला बनाता है, वैसे ही 1 core एक समय में एक काम करता है। Multi-core मतलब कई शेफ एक साथ — 4 cores = 4 शेफ एक साथ खाना बनाते हैं, इसलिए काम 4 गुना तेज़ होता है।"
            example="जब आप PUBG खेलते हैं, तो एक core graphics render करता है, दूसरा physics calculate करता है, तीसरा network handle करता है — सब एक साथ!"
            terms={[
              { hindi: 'कोर', english: 'Core', meaning: 'CPU का एक independent worker' },
              { hindi: 'क्लॉक स्पीड', english: 'Clock Speed', meaning: 'कितनी तेज़ी से instructions execute होते हैं (GHz में)' },
              { hindi: 'प्रोसेस', english: 'Process', meaning: 'चल रहा program जिसे OS ने memory दी है' },
              { hindi: 'सी.पी.यू.-बाउंड', english: 'CPU-bound', meaning: 'काम जो CPU की speed पर depend करता है' },
              { hindi: 'आई/ओ-बाउंड', english: 'I/O-bound', meaning: 'काम जो data आने का इंतज़ार करता है' },
            ]}
          />
        </div>
      </SectionBlock>

    </div>
  )
}
