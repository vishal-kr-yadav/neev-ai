import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, BarChart3, MessageSquare, Activity, Search,
  ChevronLeft, ChevronRight, Ban, Unlock, Key, Trash2, Plus,
  Eye, ArrowUpDown, Download, UserPlus, Edit3, X, Check,
  TrendingUp, BookOpen, Clock, AlertTriangle, RefreshCw,
  LogOut, Home, UserCheck, UserX, Zap, Target, Award,
  ChevronDown, ChevronUp, Layers,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import styles from './Admin.module.css'

const API = (import.meta.env.VITE_API_URL || '') + '/api'

function useAdminFetch(endpoint, deps = []) {
  const { token } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API}/admin${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed')
      setData(await res.json())
    } catch { setData(null) }
    setLoading(false)
  }, [endpoint, token])

  useEffect(() => { refetch() }, [refetch, ...deps])
  return { data, loading, refetch }
}

// ─── Tabs ───
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'activity', label: 'Activity', icon: Activity },
  { id: 'questions', label: 'Q&A', icon: MessageSquare },
  { id: 'analytics', label: 'Analytics', icon: TrendingUp },
]

export default function Admin() {
  const navigate = useNavigate()
  const { user, token, isLoggedIn, loading: authLoading, logout } = useAuth()
  const [tab, setTab] = useState('overview')

  if (authLoading) return <div className={styles.loading}>Loading...</div>
  if (!isLoggedIn) { navigate('/login'); return null }
  if (user?.role !== 'admin') {
    return (
      <div className={styles.denied}>
        <Shield size={48} />
        <h2>Access Denied</h2>
        <p>You do not have admin privileges.</p>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    )
  }

  return (
    <div className={styles.admin}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Logo size="small" onClick={() => navigate('/')} />
          <div className={styles.adminBadge}><Shield size={12} /> Admin</div>
        </div>

        <nav className={styles.sidebarNav}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.sidebarBtn} ${tab === t.id ? styles.sidebarBtnActive : ''}`}
              onClick={() => setTab(t.id)}
            >
              <t.icon size={18} />
              {t.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <button className={styles.sidebarBtn} onClick={() => navigate('/')}>
            <Home size={18} /> Home
          </button>
          <button className={styles.sidebarBtn} onClick={() => navigate('/dashboard')}>
            <BookOpen size={18} /> Dashboard
          </button>
          <button className={styles.sidebarBtn} onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>
            {TABS.find(t => t.id === tab)?.icon && (() => {
              const Icon = TABS.find(t => t.id === tab).icon
              return <Icon size={24} />
            })()}
            {TABS.find(t => t.id === tab)?.label}
          </h1>
          <div className={styles.headerUser}>
            <span>{user?.name}</span>
            <div className={styles.headerAvatar}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className={styles.content}>
          {tab === 'overview' && <OverviewTab token={token} />}
          {tab === 'users' && <UsersTab token={token} />}
          {tab === 'activity' && <ActivityTab token={token} />}
          {tab === 'questions' && <QuestionsTab token={token} />}
          {tab === 'analytics' && <AnalyticsTab token={token} />}
        </div>
      </main>
    </div>
  )
}

// ═══════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════
function OverviewTab({ token }) {
  const { data, loading, refetch } = useAdminFetch('/stats')

  if (loading) return <Loader />
  if (!data) return <ErrorState onRetry={refetch} />

  const { users, courses, community, registrationTrend, professions } = data

  const statCards = [
    { label: 'Total Users', value: users.total, icon: Users, color: '#4f46e5', bg: '#ede9fe' },
    { label: 'New Today', value: users.today, icon: UserPlus, color: '#059669', bg: '#d1fae5' },
    { label: 'This Week', value: users.thisWeek, icon: TrendingUp, color: '#0284c7', bg: '#e0f2fe' },
    { label: 'Active Today', value: users.activeToday, icon: UserCheck, color: '#d97706', bg: '#fef3c7' },
    { label: 'Blocked', value: users.blocked, icon: Ban, color: '#dc2626', bg: '#fee2e2' },
    { label: 'Questions', value: community.totalQuestions, icon: MessageSquare, color: '#7c3aed', bg: '#f3e8ff' },
    { label: 'Answers', value: community.totalAnswers, icon: Check, color: '#0891b2', bg: '#cffafe' },
    { label: 'This Month', value: users.thisMonth, icon: Clock, color: '#be185d', bg: '#fce7f3' },
  ]

  return (
    <div className={styles.overview}>
      <div className={styles.statsGrid}>
        {statCards.map((s, i) => (
          <motion.div
            key={s.label}
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className={styles.statIcon} style={{ background: s.bg, color: s.color }}>
              <s.icon size={20} />
            </div>
            <div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Course Enrollments */}
      <div className={styles.sectionRow}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><BookOpen size={18} /> Course Enrollments</h3>
          {courses.enrollments.length === 0 ? (
            <p className={styles.empty}>No enrollments yet</p>
          ) : (
            <div className={styles.barChart}>
              {courses.enrollments.map(c => (
                <div key={c._id} className={styles.barRow}>
                  <div className={styles.barLabel}>{c._id.toUpperCase()}</div>
                  <div className={styles.barTrack}>
                    <motion.div
                      className={styles.barFill}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (c.count / (users.total || 1)) * 100)}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                  <div className={styles.barValue}>{c.count}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <h3 className={styles.cardTitle}><Users size={18} /> Top Professions</h3>
          {professions.length === 0 ? (
            <p className={styles.empty}>No data yet</p>
          ) : (
            <div className={styles.profList}>
              {professions.map((p, i) => (
                <div key={p._id} className={styles.profItem}>
                  <span className={styles.profRank}>#{i + 1}</span>
                  <span className={styles.profName}>{p._id}</span>
                  <span className={styles.profCount}>{p.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Registration Trend */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><TrendingUp size={18} /> Registrations (Last 30 Days)</h3>
        {registrationTrend.length === 0 ? (
          <p className={styles.empty}>No registrations yet</p>
        ) : (
          <div className={styles.trendChart}>
            {registrationTrend.map(d => {
              const max = Math.max(...registrationTrend.map(x => x.count))
              return (
                <div key={d._id} className={styles.trendBar}>
                  <div className={styles.trendBarTooltip}>{d.count}</div>
                  <motion.div
                    className={styles.trendBarFill}
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.count / (max || 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className={styles.trendBarDate}>{d._id.slice(5)}</div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Completion Stats */}
      {courses.completionStats.length > 0 && (
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><BarChart3 size={18} /> Completion Stats</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Course</th>
                <th>Enrolled</th>
                <th>Completed</th>
                <th>Avg Topics</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {courses.completionStats.map(c => (
                <tr key={c._id}>
                  <td><strong>{c._id.toUpperCase()}</strong></td>
                  <td>{c.enrolled}</td>
                  <td>{c.completed}</td>
                  <td>{c.avgTopics?.toFixed(1) || 0}</td>
                  <td>
                    <span className={styles.badge} style={{
                      background: c.enrolled > 0 && (c.completed / c.enrolled) > 0.5 ? '#d1fae5' : '#fef3c7',
                      color: c.enrolled > 0 && (c.completed / c.enrolled) > 0.5 ? '#059669' : '#d97706',
                    }}>
                      {c.enrolled > 0 ? ((c.completed / c.enrolled) * 100).toFixed(0) : 0}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// USERS TAB
// ═══════════════════════════════════════
function UsersTab({ token }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('-createdAt')
  const [filterRole, setFilterRole] = useState('')
  const [filterBlocked, setFilterBlocked] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [showAddUser, setShowAddUser] = useState(false)
  const [expandedUser, setExpandedUser] = useState(null)

  const query = `/users?page=${page}&limit=15&search=${search}&sort=${sort}${filterRole ? `&role=${filterRole}` : ''}${filterBlocked ? `&blocked=${filterBlocked}` : ''}`
  const { data, loading, refetch } = useAdminFetch(query, [page, search, sort, filterRole, filterBlocked])

  const handleAction = async (userId, action, body = {}) => {
    try {
      const method = action === 'delete' ? 'DELETE' : 'PUT'
      const url = action === 'delete'
        ? `${API}/admin/users/${userId}`
        : `${API}/admin/users/${userId}`
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: method === 'PUT' ? JSON.stringify(body) : undefined,
      })
      refetch()
    } catch (err) {
      alert('Action failed')
    }
  }

  return (
    <div className={styles.usersTab}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            placeholder="Search users by name, email, profession..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <div className={styles.filters}>
          <select value={filterRole} onChange={e => { setFilterRole(e.target.value); setPage(1) }}>
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <select value={filterBlocked} onChange={e => { setFilterBlocked(e.target.value); setPage(1) }}>
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Blocked</option>
          </select>
          <select value={sort} onChange={e => setSort(e.target.value)}>
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="name">Name A-Z</option>
            <option value="-lastLogin">Recent Login</option>
          </select>
        </div>
        <button className={styles.addBtn} onClick={() => setShowAddUser(true)}>
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* User Table */}
      {loading ? <Loader /> : !data?.users ? <ErrorState onRetry={refetch} /> : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Courses</th>
                  <th>Questions</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.users.map(u => (
                  <UserRow
                    key={u._id}
                    u={u}
                    expanded={expandedUser === u._id}
                    onToggle={() => setExpandedUser(expandedUser === u._id ? null : u._id)}
                    onEdit={() => setEditingUser(u)}
                    onAction={handleAction}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Page {data.page} of {data.pages} ({data.total} users)
            </span>
            <div className={styles.pageButtons}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} /> Prev
              </button>
              <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <EditUserModal
            user={editingUser}
            token={token}
            onClose={() => { setEditingUser(null); refetch() }}
          />
        )}
        {showAddUser && (
          <AddUserModal
            token={token}
            onClose={() => { setShowAddUser(false); refetch() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function UserRow({ u, expanded, onToggle, onEdit, onAction }) {
  return (
    <>
      <tr className={u.isBlocked ? styles.blockedRow : ''}>
        <td>
          <div className={styles.userCell}>
            <div className={styles.userAvatar} style={{
              background: u.isBlocked ? '#fee2e2' : u.role === 'admin' ? '#ede9fe' : '#e0f2fe',
              color: u.isBlocked ? '#dc2626' : u.role === 'admin' ? '#4f46e5' : '#0284c7',
            }}>
              {u.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <div className={styles.userName}>{u.name}</div>
              <div className={styles.userMeta}>{u.profession || '—'} {u.age ? `• ${u.age}y` : ''}</div>
            </div>
          </div>
        </td>
        <td className={styles.emailCell}>{u.email}</td>
        <td>
          <span className={`${styles.roleBadge} ${u.role === 'admin' ? styles.roleAdmin : styles.roleUser}`}>
            {u.role === 'admin' ? <Shield size={12} /> : <Users size={12} />}
            {u.role}
          </span>
        </td>
        <td>
          <span className={`${styles.statusBadge} ${u.isBlocked ? styles.statusBlocked : styles.statusActive}`}>
            {u.isBlocked ? 'Blocked' : 'Active'}
          </span>
        </td>
        <td>
          <span className={styles.courseCount}>{u.progress?.length || 0}</span>
        </td>
        <td>{u.questionCount || 0}</td>
        <td className={styles.dateCell}>{new Date(u.createdAt).toLocaleDateString()}</td>
        <td className={styles.dateCell}>{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : '—'}</td>
        <td>
          <div className={styles.actions}>
            <button title="View details" onClick={onToggle}><Eye size={14} /></button>
            <button title="Edit user" onClick={onEdit}><Edit3 size={14} /></button>
            {u.isBlocked ? (
              <button title="Unblock" className={styles.actionGreen} onClick={() => onAction(u._id, 'update', { isBlocked: false })}>
                <Unlock size={14} />
              </button>
            ) : (
              <button title="Block" className={styles.actionRed} onClick={() => onAction(u._id, 'update', { isBlocked: true })}>
                <Ban size={14} />
              </button>
            )}
            <button title="Delete" className={styles.actionRed} onClick={() => {
              if (confirm(`Delete ${u.name}? This removes ALL their data.`)) onAction(u._id, 'delete')
            }}>
              <Trash2 size={14} />
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className={styles.expandedRow}>
          <td colSpan={9}>
            <div className={styles.expandedContent}>
              <div className={styles.expandedGrid}>
                <div>
                  <strong>Phone:</strong> {u.phone || '—'}
                </div>
                <div>
                  <strong>Age:</strong> {u.age || '—'}
                </div>
                <div>
                  <strong>Profession:</strong> {u.profession || '—'}
                </div>
                <div>
                  <strong>ID:</strong> <code>{u._id}</code>
                </div>
              </div>
              {u.progress?.length > 0 && (
                <div className={styles.expandedProgress}>
                  <strong>Course Progress:</strong>
                  {u.progress.map(p => (
                    <div key={p._id} className={styles.progressChip}>
                      <span className={styles.progressCourse}>{p.courseId.toUpperCase()}</span>
                      <span>{p.completedTopics?.length || 0} topics</span>
                      {p.finalQuizScore != null && <span>Final: {p.finalQuizScore}%</span>}
                      {p.completedAt && <Check size={14} style={{ color: '#059669' }} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function EditUserModal({ user: u, token, onClose }) {
  const [form, setForm] = useState({
    name: u.name, email: u.email, phone: u.phone || '', age: u.age || '',
    profession: u.profession || '', role: u.role, password: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const body = { ...form }
      if (!body.password) delete body.password
      if (body.age) body.age = Number(body.age)
      const res = await fetch(`${API}/admin/users/${u._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed')
      }
      onClose()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  return (
    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className={styles.modal} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
        <div className={styles.modalHeader}>
          <h3><Edit3 size={18} /> Edit User</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {error && <div className={styles.modalError}>{error}</div>}
        <div className={styles.modalBody}>
          <div className={styles.formGrid}>
            <label>
              Name
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </label>
            <label>
              Age
              <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
            </label>
            <label>
              Profession
              <input value={form.profession} onChange={e => setForm(f => ({ ...f, profession: e.target.value }))} />
            </label>
            <label>
              Role
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>
          <label className={styles.passwordField}>
            <Key size={14} /> New Password (leave blank to keep current)
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" />
          </label>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

function AddUserModal({ token, onClose }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', age: '',
    profession: '', role: 'user',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const body = { ...form }
      if (body.age) body.age = Number(body.age)
      const res = await fetch(`${API}/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Failed')
      }
      onClose()
    } catch (err) {
      setError(err.message)
    }
    setSaving(false)
  }

  return (
    <motion.div className={styles.modalOverlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className={styles.modal} initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}>
        <div className={styles.modalHeader}>
          <h3><UserPlus size={18} /> Add New User</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        {error && <div className={styles.modalError}>{error}</div>}
        <div className={styles.modalBody}>
          <div className={styles.formGrid}>
            <label>
              Name *
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </label>
            <label>
              Email *
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </label>
            <label>
              Password *
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Min 6 characters" />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </label>
            <label>
              Age
              <input type="number" value={form.age} onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
            </label>
            <label>
              Profession
              <input value={form.profession} onChange={e => setForm(f => ({ ...f, profession: e.target.value }))} />
            </label>
          </div>
          <label>
            Role
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </label>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ═══════════════════════════════════════
// ACTIVITY TAB
// ═══════════════════════════════════════
function ActivityTab({ token }) {
  const { data, loading, refetch } = useAdminFetch('/activity?limit=100')

  if (loading) return <Loader />
  if (!data) return <ErrorState onRetry={refetch} />

  const typeConfig = {
    registration: { icon: UserPlus, color: '#059669', bg: '#d1fae5', label: 'Registration' },
    login: { icon: UserCheck, color: '#0284c7', bg: '#e0f2fe', label: 'Login' },
    progress: { icon: BookOpen, color: '#7c3aed', bg: '#f3e8ff', label: 'Progress' },
    question: { icon: MessageSquare, color: '#d97706', bg: '#fef3c7', label: 'Question' },
  }

  return (
    <div className={styles.activityTab}>
      <div className={styles.toolbar}>
        <button className={styles.refreshBtn} onClick={refetch}><RefreshCw size={14} /> Refresh</button>
      </div>
      <div className={styles.timeline}>
        {data.activities.map((a, i) => {
          const cfg = typeConfig[a.type] || typeConfig.registration
          return (
            <motion.div
              key={i}
              className={styles.timelineItem}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
            >
              <div className={styles.timelineDot} style={{ background: cfg.bg, color: cfg.color }}>
                <cfg.icon size={14} />
              </div>
              <div className={styles.timelineContent}>
                <div className={styles.timelineRow}>
                  <span className={styles.timelineType} style={{ background: cfg.bg, color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <span className={styles.timelineUser}>{a.user?.name || 'Unknown'}</span>
                  <span className={styles.timelineDetail}>{a.detail}</span>
                </div>
                <div className={styles.timelineTime}>
                  {new Date(a.timestamp).toLocaleString()}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// QUESTIONS TAB
// ═══════════════════════════════════════
function QuestionsTab({ token }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const query = `/questions?page=${page}&limit=15&search=${search}`
  const { data, loading, refetch } = useAdminFetch(query, [page, search])

  const handleDelete = async (id) => {
    if (!confirm('Delete this question?')) return
    await fetch(`${API}/admin/questions/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
    refetch()
  }

  return (
    <div className={styles.questionsTab}>
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={16} />
          <input
            placeholder="Search questions..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {loading ? <Loader /> : !data?.questions ? <ErrorState onRetry={refetch} /> : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Tags</th>
                  <th>Answers</th>
                  <th>Views</th>
                  <th>Upvotes</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.questions.map(q => (
                  <tr key={q._id}>
                    <td className={styles.titleCell}>
                      <div className={styles.questionTitle}>{q.title}</div>
                    </td>
                    <td>{q.author?.name || 'Deleted'}</td>
                    <td>
                      <div className={styles.tagList}>
                        {q.tags?.slice(0, 3).map(t => (
                          <span key={t} className={styles.tag}>{t}</span>
                        ))}
                      </div>
                    </td>
                    <td>{q.answers?.length || 0}</td>
                    <td>{q.views}</td>
                    <td>{q.upvotes?.length || 0}</td>
                    <td className={styles.dateCell}>{new Date(q.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className={styles.actionRed} title="Delete" onClick={() => handleDelete(q._id)}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <span className={styles.pageInfo}>
              Page {data.page} of {data.pages} ({data.total} questions)
            </span>
            <div className={styles.pageButtons}>
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                <ChevronLeft size={16} /> Prev
              </button>
              <button disabled={page >= data.pages} onClick={() => setPage(p => p + 1)}>
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ═══════════════════════════════════════
// ANALYTICS TAB
// ═══════════════════════════════════════

// Uses the shared API constant from line 16

function fmtMs(ms) {
  if (!ms || ms <= 0) return '0h 0m'
  const totalMin = Math.floor(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return `${h}h ${m}m`
}

function AnalyticsTab({ token }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [expandedUser, setExpandedUser] = useState(null)

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`${API}/activity/admin/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}))
        throw new Error(errBody.error || `HTTP ${res.status}`)
      }
      setData(await res.json())
    } catch (e) {
      console.error('Analytics load error:', e)
      setError(true)
    }
    setLoading(false)
  }

  useEffect(() => { if (token) load() }, [token])

  if (loading) return <Loader />
  if (error || !data) return (
    <div className={styles.errorState}>
      <AlertTriangle size={32} />
      <p>Failed to load analytics data</p>
      <button onClick={load}><RefreshCw size={14} /> Retry</button>
    </div>
  )

  const {
    dau = 0, wau = 0, mau = 0,
    totalPlatformTimeToday = 0,
    avgTimePerUserPerDay = 0,
    quizPassRate = 0,
    dauTrend = [],
    popularCourses = [],
    topActiveUsers = [],
    hourlyActivity = [],
    quizPerformance = [],
    dropoffAnalysis = [],
    interactiveUsage = [],
  } = data

  const maxDau = Math.max(...dauTrend.map(d => d.count || 0), 1)
  const maxCourse = Math.max(...popularCourses.map(c => c.views || 0), 1)
  const maxHour = Math.max(...hourlyActivity.map(h => h.count || 0), 1)
  const maxInteractive = Math.max(...interactiveUsage.map(u => u.uses || 0), 1)

  const heatmapColor = (count) => {
    const intensity = count / maxHour
    if (intensity === 0) return 'var(--bg-secondary)'
    if (intensity < 0.25) return '#bfdbfe'
    if (intensity < 0.5) return '#60a5fa'
    if (intensity < 0.75) return '#3b82f6'
    return '#1d4ed8'
  }

  const passRateColor = (rate) => {
    if (rate >= 70) return { bg: '#d1fae5', color: '#059669' }
    if (rate >= 50) return { bg: '#fef3c7', color: '#d97706' }
    return { bg: '#fee2e2', color: '#dc2626' }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header actions */}
      <div className={styles.toolbar}>
        <button className={styles.refreshBtn} onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* ── 1. Engagement Overview Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          {
            label: 'Daily / Weekly / Monthly Active',
            value: `${dau} / ${wau} / ${mau}`,
            icon: Users, bg: '#ede9fe', color: '#4f46e5',
            sub: 'DAU · WAU · MAU',
          },
          {
            label: 'Platform Time Today',
            value: fmtMs(totalPlatformTimeToday),
            icon: Clock, bg: '#e0f2fe', color: '#0284c7',
            sub: 'Total across all users',
          },
          {
            label: 'Avg Time / User / Day',
            value: fmtMs(avgTimePerUserPerDay),
            icon: Activity, bg: '#fef3c7', color: '#d97706',
            sub: 'This week',
          },
          {
            label: 'Quiz Pass Rate',
            value: `${(quizPassRate || 0).toFixed(1)}%`,
            icon: Award, bg: quizPassRate >= 70 ? '#d1fae5' : quizPassRate >= 50 ? '#fef3c7' : '#fee2e2',
            color: quizPassRate >= 70 ? '#059669' : quizPassRate >= 50 ? '#d97706' : '#dc2626',
            sub: 'This month',
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <div className={styles.statIcon} style={{ background: s.bg, color: s.color }}>
              <s.icon size={20} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div className={styles.statValue} style={{ fontSize: 18, wordBreak: 'break-all' }}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{s.sub}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── 2. DAU Trend Chart ── */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><TrendingUp size={18} /> DAU Trend — Last 30 Days</h3>
        {dauTrend.length === 0 ? (
          <p className={styles.empty}>No activity data yet</p>
        ) : (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 180, paddingTop: 24, overflowX: 'auto' }}>
            {dauTrend.map((d, i) => {
              const date = new Date(d.date || d._id || '')
              const isWeekend = date.getDay() === 0 || date.getDay() === 6
              const heightPct = ((d.count || 0) / maxDau) * 100
              const label = d.date ? d.date.slice(5) : (d._id || '').slice(5)
              return (
                <div
                  key={i}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', position: 'relative', minWidth: 18 }}
                  title={`${label}: ${d.count} DAU`}
                >
                  {d.count > 0 && (
                    <div style={{ position: 'absolute', top: 0, fontSize: 10, fontWeight: 700, color: 'var(--accent)' }}>{d.count}</div>
                  )}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(heightPct, 2)}%` }}
                    transition={{ duration: 0.5, delay: i * 0.015 }}
                    style={{
                      width: '100%',
                      maxWidth: 28,
                      background: isWeekend ? '#f59e0b' : 'var(--gradient-primary)',
                      borderRadius: '4px 4px 0 0',
                      minHeight: 4,
                    }}
                  />
                  <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 5, whiteSpace: 'nowrap', transform: 'rotate(-45deg)', transformOrigin: 'top left', marginLeft: 8 }}>
                    {label}
                  </div>
                </div>
              )
            })}
          </div>
        )}
        <div style={{ display: 'flex', gap: 16, marginTop: 16, fontSize: 12, color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, background: 'var(--accent)', borderRadius: 2, display: 'inline-block' }} /> Weekdays
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 12, height: 12, background: '#f59e0b', borderRadius: 2, display: 'inline-block' }} /> Weekends
          </span>
        </div>
      </div>

      {/* ── 3 & 4: Popular Courses + Top Active Users side-by-side ── */}
      <div className={styles.sectionRow}>
        {/* Popular Courses */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><BookOpen size={18} /> Popular Courses — This Week</h3>
          {popularCourses.length === 0 ? (
            <p className={styles.empty}>No course data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {popularCourses.map((c, i) => (
                <div key={c.courseId || c._id || i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 22, height: 22, borderRadius: '50%', background: 'var(--gradient-primary)',
                        color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                        {(c.courseId || c._id || 'Unknown').toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                      <div>{c.views || 0} views</div>
                      <div>{c.uniqueUsers || 0} users</div>
                    </div>
                  </div>
                  <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((c.views || 0) / maxCourse) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.07 }}
                      style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top 10 Most Active Users */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><Users size={18} /> Top Active Users — This Week</h3>
          {topActiveUsers.length === 0 ? (
            <p className={styles.empty}>No user activity data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {topActiveUsers.slice(0, 10).map((u, i) => (
                <div key={u.userId || u._id || i}>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                      borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s',
                      background: expandedUser === (u.userId || u._id) ? 'var(--bg-secondary)' : 'transparent',
                    }}
                    onClick={() => setExpandedUser(expandedUser === (u.userId || u._id) ? null : (u.userId || u._id))}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: i < 3 ? ['#fef3c7', '#e0f2fe', '#f3e8ff'][i] : 'var(--bg-secondary)',
                      color: i < 3 ? ['#d97706', '#0284c7', '#7c3aed'][i] : 'var(--text-muted)',
                      fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {i + 1}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {u.name || 'Unknown'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {fmtMs(u.totalTime)} · {u.activeDays || 0}d · {u.sessions || 0} sessions
                      </div>
                    </div>
                    {expandedUser === (u.userId || u._id)
                      ? <ChevronUp size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                      : <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
                  </div>
                  {expandedUser === (u.userId || u._id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ padding: '8px 12px 10px 44px', fontSize: 12, color: 'var(--text-secondary)', background: 'var(--bg-secondary)', borderRadius: '0 0 8px 8px', marginBottom: 2 }}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                        <div><span style={{ color: 'var(--text-muted)' }}>Total Time:</span> <strong>{fmtMs(u.totalTime)}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Active Days:</span> <strong>{u.activeDays || 0}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Sessions:</span> <strong>{u.sessions || 0}</strong></div>
                        <div><span style={{ color: 'var(--text-muted)' }}>Avg/Session:</span> <strong>{fmtMs(u.sessions ? (u.totalTime / u.sessions) : 0)}</strong></div>
                        {u.courses?.length > 0 && (
                          <div style={{ gridColumn: '1 / -1' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Courses: </span>
                            {u.courses.map(c => (
                              <span key={c} style={{ padding: '1px 7px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, marginRight: 4, fontWeight: 600, color: 'var(--accent)' }}>
                                {c.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 5. Hourly Activity Heatmap ── */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><Zap size={18} /> Hourly Activity Heatmap</h3>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>When are users most active? (0 = midnight, 23 = 11 PM)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6 }}>
          {Array.from({ length: 24 }, (_, h) => {
            const entry = hourlyActivity.find(x => (x.hour ?? x._id) === h) || { count: 0 }
            const count = entry.count || 0
            return (
              <div
                key={h}
                title={`${h}:00 — ${count} events`}
                style={{
                  aspectRatio: '1',
                  borderRadius: 8,
                  background: heatmapColor(count),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'default',
                  transition: 'transform 0.15s',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: count > 0 ? 'white' : 'var(--text-muted)' }}>{h}</div>
                {count > 0 && <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.85)' }}>{count}</div>}
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>Low</span>
          {['#bfdbfe', '#60a5fa', '#3b82f6', '#1d4ed8'].map(c => (
            <span key={c} style={{ width: 18, height: 10, background: c, borderRadius: 2, display: 'inline-block' }} />
          ))}
          <span>High</span>
        </div>
      </div>

      {/* ── 6. Quiz Performance per Course ── */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}><Target size={18} /> Quiz Performance — Per Course</h3>
        {quizPerformance.length === 0 ? (
          <p className={styles.empty}>No quiz data yet</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Attempts</th>
                  <th>Pass Rate</th>
                  <th>Avg Score</th>
                  <th>Visual</th>
                </tr>
              </thead>
              <tbody>
                {quizPerformance.map((q, i) => {
                  const { bg, color } = passRateColor(q.passRate || 0)
                  return (
                    <tr key={q.courseId || q._id || i}>
                      <td><strong>{(q.courseId || q._id || 'Unknown').toUpperCase()}</strong></td>
                      <td>{q.attempts || 0}</td>
                      <td>
                        <span className={styles.badge} style={{ background: bg, color }}>
                          {(q.passRate || 0).toFixed(1)}%
                        </span>
                      </td>
                      <td>{(q.avgScore || 0).toFixed(1)}%</td>
                      <td style={{ width: 120 }}>
                        <div style={{ height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(q.passRate || 0, 100)}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.5s' }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 7 & 8: Drop-off Analysis + Interactive Usage side-by-side ── */}
      <div className={styles.sectionRow}>
        {/* Drop-off Analysis */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><AlertTriangle size={18} /> Drop-off Analysis</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>High views but low time spent — content users may struggle with</p>
          {dropoffAnalysis.length === 0 ? (
            <p className={styles.empty}>No drop-off data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dropoffAnalysis.map((item, i) => (
                <div key={item.topicId || i} style={{ padding: '10px 14px', background: 'var(--bg-secondary)', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                        {item.course ? `${item.course.toUpperCase()} → ` : ''}{item.topic || item.topicId || 'Unknown Topic'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {item.views || 0} views · avg {fmtMs(item.avgTimeSpent)} spent
                      </div>
                    </div>
                    <span style={{
                      padding: '2px 9px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      borderRadius: 100,
                      fontSize: 11,
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    }}>
                      Drop-off
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 36 }}>Time</span>
                    <div style={{ flex: 1, height: 5, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(((item.avgTimeSpent || 0) / 300000) * 100, 100)}%`,
                        height: '100%',
                        background: '#f59e0b',
                        borderRadius: 3,
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Component Usage */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}><Layers size={18} /> Interactive Component Usage</h3>
          {interactiveUsage.length === 0 ? (
            <p className={styles.empty}>No interactive usage data yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {interactiveUsage.map((item, i) => (
                <div key={item.component || item._id || i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'var(--bg-secondary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--accent)', flexShrink: 0,
                      }}>
                        <Zap size={14} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                          {item.component || item._id || 'Unknown'}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {item.uniqueUsers || 0} unique users
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--accent)' }}>{item.uses || 0}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>uses</div>
                    </div>
                  </div>
                  <div style={{ height: 5, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((item.uses || 0) / maxInteractive) * 100}%` }}
                      transition={{ duration: 0.6, delay: i * 0.07 }}
                      style={{ height: '100%', background: 'var(--gradient-primary)', borderRadius: 3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Shared Components ───
function Loader() {
  return (
    <div className={styles.loader}>
      <div className={styles.spinner} />
      <span>Loading...</span>
    </div>
  )
}

function ErrorState({ onRetry }) {
  return (
    <div className={styles.errorState}>
      <AlertTriangle size={32} />
      <p>Failed to load data</p>
      <button onClick={onRetry}><RefreshCw size={14} /> Retry</button>
    </div>
  )
}
