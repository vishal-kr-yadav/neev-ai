import { createContext, useContext, useState, useEffect } from 'react'

const API = 'http://localhost:5000/api'
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  // On mount, validate stored token
  useEffect(() => {
    if (!token) { setLoading(false); return }
    fetch(`${API}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setUser(data.user); setLoading(false) })
      .catch(() => { localStorage.removeItem('token'); setToken(null); setUser(null); setLoading(false) })
  }, [token])

  const register = async (formData) => {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const login = async (email, password) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  // Progress API helpers
  const getProgress = async (courseId) => {
    if (!token) return null
    const res = await fetch(`${API}/progress/${courseId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.progress
  }

  const getAllProgress = async () => {
    if (!token) return []
    const res = await fetch(`${API}/progress`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return []
    const data = await res.json()
    return data.progress
  }

  const completeTopic = async (courseId, topicIndex) => {
    if (!token) return null
    const res = await fetch(`${API}/progress/${courseId}/topic`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ topicIndex }),
    })
    if (!res.ok) return null
    return (await res.json()).progress
  }

  const saveQuizScore = async (courseId, topicIndex, score) => {
    if (!token) return null
    const res = await fetch(`${API}/progress/${courseId}/quiz`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ topicIndex, score }),
    })
    if (!res.ok) return null
    return (await res.json()).progress
  }

  const saveFinalQuiz = async (courseId, score) => {
    if (!token) return null
    const res = await fetch(`${API}/progress/${courseId}/final-quiz`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ score }),
    })
    if (!res.ok) return null
    return (await res.json()).progress
  }

  const completeProject = async (courseId) => {
    if (!token) return null
    const res = await fetch(`${API}/progress/${courseId}/project`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return (await res.json()).progress
  }

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      register, login, logout,
      getProgress, getAllProgress, completeTopic, saveQuizScore, saveFinalQuiz, completeProject,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
