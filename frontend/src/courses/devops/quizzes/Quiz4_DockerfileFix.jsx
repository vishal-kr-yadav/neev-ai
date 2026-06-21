import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

/* ================================================================
   QUIZ 4 — Dockerfile Fix: Find and Fix the Errors
   Format: Interactive broken Dockerfile with clickable lines
================================================================ */

const LINES = [
  {
    id: 0,
    broken: 'FORM node:18-alpine',
    fixed: 'FROM node:18-alpine',
    isError: true,
    errorType: 'Typo in instruction',
    explanation: 'FORM should be FROM — the base image instruction.',
  },
  {
    id: 1,
    broken: 'WORKDIR /app',
    fixed: 'WORKDIR /app',
    isError: false,
  },
  {
    id: 2,
    broken: 'COPY package*.json ./',
    fixed: 'COPY package*.json ./',
    isError: false,
  },
  {
    id: 3,
    broken: 'RUN npm install',
    fixed: 'RUN npm install',
    isError: false,
  },
  {
    id: 4,
    broken: 'COPY . .',
    fixed: 'COPY . .',
    isError: false,
  },
  {
    id: 5,
    broken: 'EXPOSE 3000',
    fixed: 'EXPOSE 3000',
    isError: false,
  },
  {
    id: 6,
    broken: 'CMD npm start',
    fixed: 'CMD ["npm", "start"]',
    isError: true,
    errorType: 'Wrong CMD format',
    explanation: 'CMD should use exec form ["npm", "start"] not shell form for proper signal handling.',
  },
]

// The broken Dockerfile has lines in wrong order too: COPY . . before RUN npm install
// And missing an EXPOSE instruction that should be there
// Let's define the broken ordering and content:
const BROKEN_DOCKERFILE = [
  {
    id: 0,
    lineNum: 1,
    broken: 'FORM node:18-alpine',
    fixed: 'FROM node:18-alpine',
    isError: true,
    errorType: 'Typo: FORM instead of FROM',
    explanation: 'The base image instruction must be FROM, not FORM.',
    options: ['FROM node:18-alpine', 'FORM node:latest', 'USE node:18-alpine'],
    correctOption: 0,
  },
  {
    id: 1,
    lineNum: 2,
    broken: 'WORKDIR /app',
    fixed: 'WORKDIR /app',
    isError: false,
  },
  {
    id: 2,
    lineNum: 3,
    broken: 'COPY . .',
    fixed: 'COPY package*.json ./',
    isError: true,
    errorType: 'Inefficient layer caching',
    explanation: 'Copy package.json first to leverage Docker layer caching — dependencies change less often than source code.',
    options: ['COPY package*.json ./', 'COPY . /app/', 'ADD . .'],
    correctOption: 0,
  },
  {
    id: 3,
    lineNum: 4,
    broken: 'RUN npm instal',
    fixed: 'RUN npm install',
    isError: true,
    errorType: 'Typo in command',
    explanation: '"npm instal" is a typo. The correct command is "npm install".',
    options: ['RUN npm install', 'RUN npm instal --force', 'EXEC npm install'],
    correctOption: 0,
  },
  {
    id: 4,
    lineNum: 5,
    broken: 'COPY package*.json ./',
    fixed: 'COPY . .',
    isError: true,
    errorType: 'Wrong order — should copy all source after install',
    explanation: 'After installing dependencies, copy the rest of the source code. The package.json copy should come before npm install.',
    options: ['COPY . .', 'COPY src/ ./', 'MOVE . .'],
    correctOption: 0,
  },
  {
    id: 5,
    lineNum: 6,
    broken: 'EXPOSE 3000',
    fixed: 'EXPOSE 3000',
    isError: false,
  },
  {
    id: 6,
    lineNum: 7,
    broken: 'CMD npm start',
    fixed: 'CMD ["npm", "start"]',
    isError: false,
  },
]

const errorLines = BROKEN_DOCKERFILE.filter((l) => l.isError)

export default function Quiz4_DockerfileFix({ onComplete }) {
  const [fixedLines, setFixedLines] = useState({}) // id -> true
  const [activeLine, setActiveLine] = useState(null) // id of line showing options
  const [wrongAttempts, setWrongAttempts] = useState({}) // id -> count

  const totalErrors = errorLines.length
  const fixedCount = Object.keys(fixedLines).length
  const allFixed = fixedCount === totalErrors

  const handleLineClick = (line) => {
    if (!line.isError || fixedLines[line.id]) return
    setActiveLine(activeLine === line.id ? null : line.id)
  }

  const handleOptionClick = (line, optionIndex) => {
    if (optionIndex === line.correctOption) {
      setFixedLines((prev) => ({ ...prev, [line.id]: true }))
      setActiveLine(null)
    } else {
      setWrongAttempts((prev) => ({ ...prev, [line.id]: (prev[line.id] || 0) + 1 }))
    }
  }

  const getLineColor = (line) => {
    if (!line.isError) return 'var(--text-primary)'
    if (fixedLines[line.id]) return '#10b981'
    return '#ef4444'
  }

  const getLineBg = (line) => {
    if (!line.isError) return 'transparent'
    if (fixedLines[line.id]) return '#10b98112'
    return '#ef444412'
  }

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontFamily: 'var(--font-heading)',
          color: 'var(--text-primary)',
          textAlign: 'center',
          marginBottom: 8,
          fontSize: 24,
        }}
      >
        Fix the Dockerfile
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 8, fontSize: 14 }}
      >
        This Dockerfile has {totalErrors} errors. Click on the red lines to fix them.
      </motion.p>

      {/* Progress */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 24 }}>
        {errorLines.map((line, i) => (
          <motion.div
            key={line.id}
            animate={{
              background: fixedLines[line.id] ? '#10b981' : 'var(--border)',
              scale: fixedLines[line.id] ? [1, 1.3, 1] : 1,
            }}
            style={{
              width: 32,
              height: 6,
              borderRadius: 3,
            }}
          />
        ))}
      </div>

      {!allFixed ? (
        <div
          style={{
            background: '#1a1a2e',
            borderRadius: 14,
            border: '1px solid var(--border)',
            overflow: 'hidden',
            fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
            fontSize: 14,
          }}
        >
          {/* Filename tab */}
          <div
            style={{
              padding: '8px 16px',
              background: '#12121f',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 12, color: '#3b82f6' }}>📄</span>
            <span style={{ fontSize: 12, color: '#888', letterSpacing: 0.5 }}>Dockerfile</span>
            <span style={{ fontSize: 11, color: '#ef4444', marginLeft: 'auto' }}>
              {totalErrors - fixedCount} error{totalErrors - fixedCount !== 1 ? 's' : ''} remaining
            </span>
          </div>

          {/* Code lines */}
          <div style={{ padding: '8px 0' }}>
            {BROKEN_DOCKERFILE.map((line) => {
              const isFixed = fixedLines[line.id]
              const isActive = activeLine === line.id
              const displayText = isFixed ? line.fixed : line.broken

              return (
                <div key={line.id}>
                  <motion.div
                    onClick={() => handleLineClick(line)}
                    animate={{
                      backgroundColor: getLineBg(line),
                    }}
                    whileHover={
                      line.isError && !isFixed
                        ? { backgroundColor: '#ef444425' }
                        : {}
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '6px 16px',
                      cursor: line.isError && !isFixed ? 'pointer' : 'default',
                      position: 'relative',
                      gap: 12,
                    }}
                  >
                    {/* Line number */}
                    <span style={{ color: '#555', fontSize: 12, width: 20, textAlign: 'right', flexShrink: 0 }}>
                      {line.lineNum}
                    </span>

                    {/* Error indicator */}
                    {line.isError && !isFixed && (
                      <motion.span
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ fontSize: 10, flexShrink: 0 }}
                      >
                        🔴
                      </motion.span>
                    )}
                    {line.isError && isFixed && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        style={{ fontSize: 10, flexShrink: 0 }}
                      >
                        🟢
                      </motion.span>
                    )}
                    {!line.isError && (
                      <span style={{ width: 14, flexShrink: 0 }} />
                    )}

                    {/* Code text */}
                    <motion.span
                      animate={{ color: getLineColor(line) }}
                      style={{
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        textDecoration: line.isError && !isFixed ? 'wavy underline #ef4444' : 'none',
                      }}
                    >
                      {renderDockerSyntax(displayText, line.isError && !isFixed)}
                    </motion.span>
                  </motion.div>

                  {/* Options dropdown */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            padding: '12px 16px 12px 56px',
                            background: '#12121f',
                            borderTop: '1px solid #333',
                            borderBottom: '1px solid #333',
                          }}
                        >
                          <div style={{ fontSize: 11, color: '#f59e0b', marginBottom: 8, fontFamily: 'system-ui' }}>
                            {line.errorType} — Choose the fix:
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {line.options.map((opt, i) => (
                              <motion.button
                                key={i}
                                onClick={() => handleOptionClick(line, i)}
                                whileHover={{ scale: 1.02, x: 4 }}
                                whileTap={{ scale: 0.98 }}
                                animate={
                                  wrongAttempts[line.id] && i !== line.correctOption
                                    ? {}
                                    : {}
                                }
                                style={{
                                  padding: '8px 14px',
                                  borderRadius: 8,
                                  border: '1px solid #333',
                                  background: '#1a1a30',
                                  color: '#ddd',
                                  cursor: 'pointer',
                                  textAlign: 'left',
                                  fontFamily: '"Fira Code", "Cascadia Code", monospace',
                                  fontSize: 13,
                                }}
                              >
                                {opt}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center' }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ fontSize: 56, marginBottom: 16 }}
          >
            ✅
          </motion.div>
          <h3 style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-heading)', marginBottom: 12 }}>
            Dockerfile Fixed!
          </h3>

          {/* Before / After comparison */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {/* Before */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8, letterSpacing: 1 }}>BEFORE (BROKEN)</div>
              <div style={{
                background: '#1a1a2e',
                borderRadius: 10,
                border: '1px solid #ef444440',
                padding: 14,
                textAlign: 'left',
                fontFamily: '"Fira Code", monospace',
                fontSize: 12,
                lineHeight: 1.8,
              }}>
                {BROKEN_DOCKERFILE.map((line) => (
                  <div key={line.id} style={{ color: line.isError ? '#ef4444' : '#888' }}>
                    {line.isError ? '- ' : '  '}{line.broken}
                  </div>
                ))}
              </div>
            </div>

            {/* After */}
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 8, letterSpacing: 1 }}>AFTER (FIXED)</div>
              <div style={{
                background: '#1a1a2e',
                borderRadius: 10,
                border: '1px solid #10b98140',
                padding: 14,
                textAlign: 'left',
                fontFamily: '"Fira Code", monospace',
                fontSize: 12,
                lineHeight: 1.8,
              }}>
                {BROKEN_DOCKERFILE.map((line) => (
                  <div key={line.id} style={{ color: line.isError ? '#10b981' : '#888' }}>
                    {line.isError ? '+ ' : '  '}{line.fixed}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Explanations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, alignItems: 'center' }}>
            {errorLines.map((line, i) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  background: '#10b98110',
                  border: '1px solid #10b98130',
                  textAlign: 'left',
                  maxWidth: 500,
                  width: '100%',
                }}
              >
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 2 }}>{line.errorType}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{line.explanation}</div>
              </motion.div>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onComplete()}
            style={{
              padding: '12px 32px',
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Continue
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

/* Syntax highlighting helper */
function renderDockerSyntax(text, isErrorLine) {
  const parts = text.match(/^(\S+)(.*)$/)
  if (!parts) return text

  const instruction = parts[1]
  const rest = parts[2]

  const keywords = ['FROM', 'WORKDIR', 'COPY', 'RUN', 'EXPOSE', 'CMD', 'ADD', 'ENV', 'ENTRYPOINT', 'ARG', 'LABEL']
  const isKeyword = keywords.includes(instruction.toUpperCase())

  return (
    <span>
      <span style={{ color: isErrorLine ? '#ef4444' : isKeyword ? '#8b5cf6' : 'inherit', fontWeight: isKeyword ? 700 : 400 }}>
        {instruction}
      </span>
      <span style={{ color: isErrorLine ? '#ef444499' : '#e2e8f0' }}>{rest}</span>
    </span>
  )
}
