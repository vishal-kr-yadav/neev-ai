import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, Users, BarChart3, MessageSquare, Activity, Search,
  ChevronLeft, ChevronRight, Ban, Unlock, Key, Trash2, Plus,
  Eye, ArrowUpDown, Download, UserPlus, Edit3, X, Check,
  TrendingUp, BookOpen, Clock, AlertTriangle, RefreshCw,
  LogOut, Home, UserCheck, UserX,
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
