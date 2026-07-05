import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

export default function AIEvaluationPanel({ courseId, assignmentId }) {
  const { evaluateAssignment, getEvaluation } = useAuth()
  const [evaluation, setEvaluation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingExisting, setLoadingExisting] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const data = await getEvaluation(courseId, assignmentId)
        if (data) setEvaluation(data)
      } catch { /* no previous evaluation */ }
      setLoadingExisting(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleEvaluate = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await evaluateAssignment(courseId, assignmentId)
      setEvaluation(data)
    } catch (err) {
      setError(err.message || 'Evaluation failed. Please try again.')
    }
    setLoading(false)
  }

  if (loadingExisting) return null

  const scoreColor = (score) => {
    if (score >= 8) return '#10b981'
    if (score >= 6) return '#f59e0b'
    return '#ef4444'
  }

  const totalColor = (pct) => {
    if (pct >= 80) return '#10b981'
    if (pct >= 60) return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div style={{ marginTop: 32 }}>
      {!evaluation && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #4f46e510, #7c3aed10)',
            border: '2px dashed #7c3aed40',
            borderRadius: 20,
            padding: 32,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: 22,
            color: 'var(--text-primary)', marginBottom: 8,
          }}>
            AI-Powered Evaluation
          </h3>
          <p style={{
            color: 'var(--text-secondary)', fontSize: 15,
            lineHeight: 1.7, marginBottom: 24, maxWidth: 480, margin: '0 auto 24px',
          }}>
            Get instant feedback on your submission from an AI instructor.
            Your responses will be scored section-by-section with specific improvement suggestions.
          </p>
          <motion.button
            onClick={handleEvaluate}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: '14px 36px',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              color: 'white',
              border: 'none',
              borderRadius: 14,
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
            }}
          >
            ✨ Evaluate with AI
          </motion.button>
          {error && (
            <p style={{ color: '#ef4444', fontSize: 14, marginTop: 16 }}>{error}</p>
          )}
        </motion.div>
      )}

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 20,
            padding: 48,
            textAlign: 'center',
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            style={{ fontSize: 48, display: 'inline-block', marginBottom: 20 }}
          >
            🧠
          </motion.div>
          <h3 style={{
            fontFamily: 'var(--font-heading)', fontSize: 20,
            color: 'var(--text-primary)', marginBottom: 8,
          }}>
            AI is reviewing your work...
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Analyzing responses, scoring sections, generating feedback. This may take 15-30 seconds.
          </p>
          <div style={{
            marginTop: 20, height: 4, background: 'var(--bg-secondary)',
            borderRadius: 4, overflow: 'hidden', maxWidth: 300, margin: '20px auto 0',
          }}>
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
              style={{
                height: '100%', width: '40%',
                background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
                borderRadius: 4,
              }}
            />
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {evaluation && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Overall Score */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 20,
              padding: 32,
              marginBottom: 20,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 1, marginBottom: 16 }}>
                AI EVALUATION RESULT
              </div>
              <div style={{
                fontSize: 64, fontWeight: 800,
                fontFamily: 'var(--font-heading)',
                color: totalColor(evaluation.totalScore),
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {evaluation.totalScore}
                <span style={{ fontSize: 24, color: 'var(--text-muted)' }}>/{evaluation.maxScore || 100}</span>
              </div>
              <div style={{
                display: 'inline-block',
                padding: '6px 16px',
                borderRadius: 100,
                fontSize: 13,
                fontWeight: 700,
                background: `${totalColor(evaluation.totalScore)}15`,
                color: totalColor(evaluation.totalScore),
                marginBottom: 16,
              }}>
                {evaluation.totalScore >= 80 ? 'Excellent' : evaluation.totalScore >= 60 ? 'Good — Room to Improve' : 'Needs More Work'}
              </div>
              <p style={{
                color: 'var(--text-secondary)', fontSize: 15,
                lineHeight: 1.7, maxWidth: 600, margin: '0 auto',
              }}>
                {evaluation.overallFeedback}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
              {evaluation.strengths?.length > 0 && (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: 24,
                }}>
                  <h4 style={{
                    fontFamily: 'var(--font-heading)', fontSize: 16,
                    color: '#10b981', marginBottom: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    💪 Strengths
                  </h4>
                  {evaluation.strengths.map((s, i) => (
                    <div key={i} style={{
                      padding: '8px 0', fontSize: 14, color: 'var(--text-secondary)',
                      lineHeight: 1.6, borderBottom: i < evaluation.strengths.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <span style={{ color: '#10b981', marginRight: 8 }}>✓</span>
                      {s}
                    </div>
                  ))}
                </div>
              )}
              {evaluation.improvements?.length > 0 && (
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: 24,
                }}>
                  <h4 style={{
                    fontFamily: 'var(--font-heading)', fontSize: 16,
                    color: '#f59e0b', marginBottom: 14,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    🎯 Areas to Improve
                  </h4>
                  {evaluation.improvements.map((s, i) => (
                    <div key={i} style={{
                      padding: '8px 0', fontSize: 14, color: 'var(--text-secondary)',
                      lineHeight: 1.6, borderBottom: i < evaluation.improvements.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      <span style={{ color: '#f59e0b', marginRight: 8 }}>→</span>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Per-Section Scores */}
            {evaluation.sections && (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 16, padding: 24,
                marginBottom: 20,
              }}>
                <h4 style={{
                  fontFamily: 'var(--font-heading)', fontSize: 16,
                  color: 'var(--text-primary)', marginBottom: 20,
                }}>
                  📊 Section-by-Section Breakdown
                </h4>
                {Object.entries(evaluation.sections).map(([key, section]) => (
                  <div key={key} style={{
                    padding: '16px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      marginBottom: 8,
                    }}>
                      <span style={{
                        fontSize: 15, fontWeight: 600,
                        color: 'var(--text-primary)',
                      }}>
                        Section {key}
                      </span>
                      <span style={{
                        fontSize: 20, fontWeight: 800,
                        fontFamily: 'var(--font-heading)',
                        color: scoreColor(section.score),
                      }}>
                        {section.score}<span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/10</span>
                      </span>
                    </div>
                    {/* Score bar */}
                    <div style={{
                      height: 6, background: 'var(--bg-secondary)',
                      borderRadius: 6, marginBottom: 10, overflow: 'hidden',
                    }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${section.score * 10}%` }}
                        transition={{ duration: 0.8, delay: Number(key) * 0.1 }}
                        style={{
                          height: '100%',
                          background: scoreColor(section.score),
                          borderRadius: 6,
                        }}
                      />
                    </div>
                    <p style={{
                      fontSize: 14, color: 'var(--text-secondary)',
                      lineHeight: 1.6, marginBottom: 6,
                    }}>
                      {section.feedback}
                    </p>
                    {section.suggestion && (
                      <p style={{
                        fontSize: 13, color: '#8b5cf6',
                        lineHeight: 1.5, fontStyle: 'italic',
                      }}>
                        💡 {section.suggestion}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Re-evaluate button */}
            <div style={{ textAlign: 'center' }}>
              <motion.button
                onClick={handleEvaluate}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '12px 28px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                🔄 Re-evaluate
              </motion.button>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 8 }}>
                {evaluation.evaluatedAt && `Last evaluated: ${new Date(evaluation.evaluatedAt).toLocaleString()}`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
