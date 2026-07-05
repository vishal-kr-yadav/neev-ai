import { useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'

const SESSION_KEY = 'neev_session_id'
const BUFFER_KEY = 'neev_activity_buffer'
const FLUSH_INTERVAL = 30000 // flush every 30 seconds
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001'

function generateSessionId() {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function getSessionId() {
  let sid = sessionStorage.getItem(SESSION_KEY)
  if (!sid) {
    sid = generateSessionId()
    sessionStorage.setItem(SESSION_KEY, sid)
  }
  return sid
}

function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    platform: navigator.platform,
  }
}

export function useActivityTracker() {
  const { user, token } = useAuth()
  const bufferRef = useRef([])
  const flushTimerRef = useRef(null)
  const topicStartRef = useRef(null)
  const scrollMaxRef = useRef(0)

  const flush = useCallback(async () => {
    if (!token || bufferRef.current.length === 0) return
    const events = [...bufferRef.current]
    bufferRef.current = []

    try {
      await fetch(`${API_BASE}/api/activity/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ events }),
      })
    } catch (e) {
      // Put events back if failed (will retry next flush)
      bufferRef.current = [...events, ...bufferRef.current].slice(0, 100)
    }
  }, [token])

  const track = useCallback((type, data = {}) => {
    if (!user) return
    const event = {
      type,
      sessionId: getSessionId(),
      device: getDeviceInfo(),
      ...data,
      createdAt: new Date().toISOString(),
    }
    bufferRef.current.push(event)

    // Immediate flush for important events
    if (['session_start', 'quiz_complete', 'assignment_submit'].includes(type)) {
      flush()
    }
  }, [user, flush])

  // Track topic view start
  const trackTopicEnter = useCallback((courseId, topicId) => {
    topicStartRef.current = { courseId, topicId, startTime: Date.now() }
    scrollMaxRef.current = 0
    track('topic_view', { courseId, topicId, page: window.location.pathname })
  }, [track])

  // Track topic exit with time spent
  const trackTopicExit = useCallback((courseId, topicId) => {
    if (topicStartRef.current && topicStartRef.current.courseId === courseId && topicStartRef.current.topicId === topicId) {
      const duration = Date.now() - topicStartRef.current.startTime
      track('topic_exit', { courseId, topicId, duration, scrollDepth: scrollMaxRef.current })
      topicStartRef.current = null
    }
  }, [track])

  // Track quiz answer (individual question)
  const trackQuizAnswer = useCallback((courseId, topicId, questionIndex, selectedAnswer, correctAnswer, timeSpent) => {
    track('quiz_answer', {
      courseId, topicId,
      quizData: { questionIndex, selectedAnswer, correctAnswer, isCorrect: selectedAnswer === correctAnswer, timeSpent }
    })
  }, [track])

  // Track quiz complete
  const trackQuizComplete = useCallback((courseId, topicId, totalScore, totalQuestions, duration) => {
    track('quiz_complete', {
      courseId, topicId, duration,
      quizData: { totalScore, totalQuestions }
    })
  }, [track])

  // Track interactive component usage
  const trackInteraction = useCallback((courseId, topicId, component, action, value) => {
    track('interactive_use', {
      courseId, topicId,
      interactionData: { component, action, value }
    })
  }, [track])

  // Track page navigation
  const trackNavigation = useCallback((page, referrer) => {
    track('page_navigate', { page, referrer })
  }, [track])

  // Track assignment events
  const trackAssignment = useCallback((type, courseId, assignmentId) => {
    track(type, { courseId, assignmentId })
  }, [track])

  // Setup flush interval and session tracking
  useEffect(() => {
    if (!user) return

    // Session start
    track('session_start', { page: window.location.pathname })

    // Flush interval
    flushTimerRef.current = setInterval(flush, FLUSH_INTERVAL)

    // Scroll tracking
    const handleScroll = () => {
      const scrollPercent = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
      if (scrollPercent > scrollMaxRef.current) scrollMaxRef.current = scrollPercent
    }
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Flush on page hide (mobile/tab close)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Track topic exit if still in one
        if (topicStartRef.current) {
          const { courseId, topicId, startTime } = topicStartRef.current
          const duration = Date.now() - startTime
          bufferRef.current.push({
            type: 'topic_exit',
            sessionId: getSessionId(),
            courseId, topicId, duration,
            scrollDepth: scrollMaxRef.current,
            createdAt: new Date().toISOString(),
          })
        }
        // Use sendBeacon for reliable delivery
        if (bufferRef.current.length > 0 && token) {
          const blob = new Blob([JSON.stringify({ events: bufferRef.current })], { type: 'application/json' })
          navigator.sendBeacon(`${API_BASE}/api/activity/batch?token=${token}`, blob)
          bufferRef.current = []
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Before unload — try to flush
    const handleBeforeUnload = () => {
      if (topicStartRef.current) {
        const { courseId, topicId, startTime } = topicStartRef.current
        bufferRef.current.push({
          type: 'topic_exit',
          sessionId: getSessionId(),
          courseId, topicId,
          duration: Date.now() - startTime,
          scrollDepth: scrollMaxRef.current,
          createdAt: new Date().toISOString(),
        })
      }
      if (bufferRef.current.length > 0 && token) {
        const blob = new Blob([JSON.stringify({ events: bufferRef.current })], { type: 'application/json' })
        navigator.sendBeacon(`${API_BASE}/api/activity/batch?token=${token}`, blob)
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      clearInterval(flushTimerRef.current)
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      flush() // final flush on unmount
    }
  }, [user, token, track, flush])

  return {
    track,
    trackTopicEnter,
    trackTopicExit,
    trackQuizAnswer,
    trackQuizComplete,
    trackInteraction,
    trackNavigation,
    trackAssignment,
    flush,
  }
}
