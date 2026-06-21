const express = require('express')
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const User = require('../models/User')
const Progress = require('../models/Progress')
const Question = require('../models/Question')

const router = express.Router()

// All admin routes require auth + admin
router.use(auth, admin)

// ──────────────────────────────────────
// GET /api/admin/stats — Dashboard overview
// ──────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today - 7 * 24 * 60 * 60 * 1000)
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers,
      usersToday,
      usersThisWeek,
      usersThisMonth,
      blockedUsers,
      totalProgress,
      totalQuestions,
      totalAnswers,
      activeToday,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: thisWeek } }),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      User.countDocuments({ isBlocked: true }),
      Progress.countDocuments(),
      Question.countDocuments(),
      Question.aggregate([
        { $project: { answerCount: { $size: '$answers' } } },
        { $group: { _id: null, total: { $sum: '$answerCount' } } },
      ]),
      User.countDocuments({ lastLogin: { $gte: today } }),
    ])

    // Course enrollment counts
    const courseEnrollments = await Progress.aggregate([
      { $group: { _id: '$courseId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])

    // Completion stats
    const completionStats = await Progress.aggregate([
      {
        $group: {
          _id: '$courseId',
          enrolled: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $ne: ['$completedAt', null] }, 1, 0] },
          },
          avgTopics: { $avg: { $size: '$completedTopics' } },
        },
      },
    ])

    // Registration trend (last 30 days)
    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    // Top professions
    const professions = await User.aggregate([
      { $match: { profession: { $ne: '' } } },
      { $group: { _id: '$profession', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ])

    res.json({
      users: {
        total: totalUsers,
        today: usersToday,
        thisWeek: usersThisWeek,
        thisMonth: usersThisMonth,
        blocked: blockedUsers,
        activeToday,
      },
      courses: {
        enrollments: courseEnrollments,
        completionStats,
      },
      community: {
        totalQuestions,
        totalAnswers: totalAnswers[0]?.total || 0,
      },
      registrationTrend,
      professions,
    })
  } catch (err) {
    console.error('Admin stats error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ──────────────────────────────────────
// GET /api/admin/users — List all users
// ──────────────────────────────────────
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sort = '-createdAt', role, blocked } = req.query
    const skip = (page - 1) * limit

    const filter = {}
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { profession: { $regex: search, $options: 'i' } },
      ]
    }
    if (role) filter.role = role
    if (blocked === 'true') filter.isBlocked = true
    if (blocked === 'false') filter.isBlocked = false

    const [users, total] = await Promise.all([
      User.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ])

    // Get progress for each user
    const userIds = users.map(u => u._id)
    const progressDocs = await Progress.find({ user: { $in: userIds } })
    const progressMap = {}
    progressDocs.forEach(p => {
      if (!progressMap[p.user.toString()]) progressMap[p.user.toString()] = []
      progressMap[p.user.toString()].push(p)
    })

    // Get question counts per user
    const questionCounts = await Question.aggregate([
      { $match: { author: { $in: userIds } } },
      { $group: { _id: '$author', count: { $sum: 1 } } },
    ])
    const questionMap = {}
    questionCounts.forEach(q => { questionMap[q._id.toString()] = q.count })

    const enrichedUsers = users.map(u => ({
      ...u.toJSON(),
      progress: progressMap[u._id.toString()] || [],
      questionCount: questionMap[u._id.toString()] || 0,
    }))

    res.json({
      users: enrichedUsers,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    console.error('Admin users error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ──────────────────────────────────────
// GET /api/admin/users/:id — Single user detail
// ──────────────────────────────────────
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    const [progress, questions] = await Promise.all([
      Progress.find({ user: user._id }),
      Question.find({ author: user._id }).sort('-createdAt').limit(20),
    ])

    res.json({ user, progress, questions })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ──────────────────────────────────────
// PUT /api/admin/users/:id — Update user
// ──────────────────────────────────────
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, role, isBlocked, password, phone, age, profession } = req.body
    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Prevent admin from blocking themselves
    if (req.params.id === req.userId && isBlocked) {
      return res.status(400).json({ error: 'Cannot block yourself' })
    }

    if (name !== undefined) user.name = name
    if (email !== undefined) user.email = email
    if (role !== undefined) user.role = role
    if (isBlocked !== undefined) user.isBlocked = isBlocked
    if (phone !== undefined) user.phone = phone
    if (age !== undefined) user.age = age
    if (profession !== undefined) user.profession = profession

    // Change password (pre-save hook will hash it)
    if (password && password.length >= 6) {
      user.password = password
    }

    await user.save()
    res.json({ user })
  } catch (err) {
    console.error('Admin update user error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ──────────────────────────────────────
// POST /api/admin/users — Create user as admin
// ──────────────────────────────────────
router.post('/users', async (req, res) => {
  try {
    const { name, email, password, phone, age, profession, role } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    const user = new User({
      name,
      email,
      password,
      phone: phone || '',
      age,
      profession: profession || '',
      role: role || 'user',
    })
    await user.save()

    res.status(201).json({ user })
  } catch (err) {
    console.error('Admin create user error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ──────────────────────────────────────
// DELETE /api/admin/users/:id — Delete user
// ──────────────────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    if (req.params.id === req.userId) {
      return res.status(400).json({ error: 'Cannot delete yourself' })
    }

    const user = await User.findById(req.params.id)
    if (!user) return res.status(404).json({ error: 'User not found' })

    // Clean up all user data
    await Promise.all([
      Progress.deleteMany({ user: user._id }),
      Question.deleteMany({ author: user._id }),
      User.findByIdAndDelete(user._id),
    ])

    res.json({ message: 'User and all associated data deleted' })
  } catch (err) {
    console.error('Admin delete user error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ──────────────────────────────────────
// GET /api/admin/activity — Recent activity feed
// ──────────────────────────────────────
router.get('/activity', async (req, res) => {
  try {
    const { limit = 50 } = req.query

    // Gather recent activities from multiple sources
    const [recentUsers, recentProgress, recentQuestions] = await Promise.all([
      User.find().sort('-createdAt').limit(Number(limit)).select('name email createdAt lastLogin'),
      Progress.find().sort('-updatedAt').limit(Number(limit)).populate('user', 'name email'),
      Question.find().sort('-createdAt').limit(Number(limit)).populate('author', 'name email'),
    ])

    // Build unified activity feed
    const activities = []

    recentUsers.forEach(u => {
      activities.push({
        type: 'registration',
        user: { name: u.name, email: u.email },
        detail: 'New user registered',
        timestamp: u.createdAt,
      })
      if (u.lastLogin) {
        activities.push({
          type: 'login',
          user: { name: u.name, email: u.email },
          detail: 'User logged in',
          timestamp: u.lastLogin,
        })
      }
    })

    recentProgress.forEach(p => {
      activities.push({
        type: 'progress',
        user: p.user ? { name: p.user.name, email: p.user.email } : null,
        detail: `Course: ${p.courseId} — ${p.completedTopics.length} topics completed`,
        courseId: p.courseId,
        timestamp: p.updatedAt,
      })
    })

    recentQuestions.forEach(q => {
      activities.push({
        type: 'question',
        user: q.author ? { name: q.author.name, email: q.author.email } : null,
        detail: `Asked: "${q.title}"`,
        timestamp: q.createdAt,
      })
    })

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    res.json({ activities: activities.slice(0, Number(limit)) })
  } catch (err) {
    console.error('Admin activity error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// ──────────────────────────────────────
// GET /api/admin/questions — All questions (moderation)
// ──────────────────────────────────────
router.get('/questions', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query
    const skip = (page - 1) * limit

    const filter = {}
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
      ]
    }

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit))
        .populate('author', 'name email'),
      Question.countDocuments(filter),
    ])

    res.json({
      questions,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ──────────────────────────────────────
// DELETE /api/admin/questions/:id — Delete any question
// ──────────────────────────────────────
router.delete('/questions/:id', async (req, res) => {
  try {
    await Question.findByIdAndDelete(req.params.id)
    res.json({ message: 'Question deleted' })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
