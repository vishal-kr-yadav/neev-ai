const express = require('express')
const mongoose = require('mongoose')
const router = express.Router()
const Activity = require('../models/Activity')
const UserStats = require('../models/UserStats')
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

// POST /api/activity/event — Log a single activity event
router.post('/event', auth, async (req, res) => {
  try {
    const { type, courseId, topicId, assignmentId, duration, startedAt, endedAt,
            quizData, interactionData, sessionId, page, referrer, device,
            scrollDepth, metadata } = req.body

    const activity = new Activity({
      user: req.userId,
      type, courseId, topicId, assignmentId, duration, startedAt, endedAt,
      quizData, interactionData, sessionId, page, referrer, device,
      scrollDepth, metadata
    })
    await activity.save()

    // Update daily stats
    const today = new Date().toISOString().split('T')[0]
    const statsUpdate = { isActive: true }
    const statsInc = {}

    if (type === 'topic_view') statsInc.topicsViewed = 1
    if (type === 'topic_exit' && duration) {
      statsInc.totalTimeSpent = duration
      statsInc.pagesVisited = 1
    }
    if (type === 'quiz_complete') {
      statsInc.quizzesAttempted = 1
      if (quizData?.totalScore >= 3) statsInc.quizzesPassed = 1
    }
    if (type === 'interactive_use') statsInc.interactionsCount = 1
    if (type === 'assignment_save') statsInc.assignmentsSaved = 1
    if (type === 'assignment_submit') statsInc.assignmentsSubmitted = 1
    if (type === 'session_start') statsInc.sessionsCount = 1

    if (Object.keys(statsInc).length > 0) {
      const updateOp = { $set: statsUpdate, $inc: statsInc }
      if (courseId) updateOp.$addToSet = { uniqueCoursesAccessed: courseId }
      await UserStats.findOneAndUpdate(
        { user: req.userId, date: today },
        updateOp,
        { upsert: true }
      )
    }

    res.json({ success: true })
  } catch (err) {
    console.error('Activity log error:', err.message)
    res.json({ success: true })
  }
})

// POST /api/activity/batch — Log multiple events at once (for buffered sends)
router.post('/batch', auth, async (req, res) => {
  try {
    const { events } = req.body
    if (!Array.isArray(events) || events.length === 0) return res.json({ success: true })

    const docs = events.slice(0, 50).map(e => ({ ...e, user: req.userId }))
    await Activity.insertMany(docs, { ordered: false })
    res.json({ success: true, count: docs.length })
  } catch (err) {
    console.error('Batch activity error:', err.message)
    res.json({ success: true })
  }
})

// GET /api/activity/my-stats — User's own stats summary
router.get('/my-stats', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId)

    // Total time on platform
    const totalTime = await Activity.aggregate([
      { $match: { user: userId, type: 'topic_exit', duration: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ])

    // Streak calculation
    const last30Days = await UserStats.find({
      user: req.userId,
      isActive: true
    }).sort({ date: -1 }).limit(30).select('date')

    let streak = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split('T')[0]
      if (last30Days.some(d => d.date === dateStr)) streak++
      else if (i > 0) break
    }

    // Topics with most time spent
    const topTopics = await Activity.aggregate([
      { $match: { user: userId, type: 'topic_exit', duration: { $gt: 0 } } },
      { $group: { _id: { courseId: '$courseId', topicId: '$topicId' }, totalTime: { $sum: '$duration' }, visits: { $sum: 1 } } },
      { $sort: { totalTime: -1 } },
      { $limit: 10 }
    ])

    // Quiz performance
    const quizPerf = await Activity.aggregate([
      { $match: { user: userId, type: 'quiz_complete' } },
      { $group: { _id: '$courseId', attempts: { $sum: 1 }, avgScore: { $avg: '$quizData.totalScore' } } }
    ])

    // Activity by hour of day
    const hourlyPattern = await Activity.aggregate([
      { $match: { user: userId } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ])

    res.json({
      totalTimeSpent: totalTime[0]?.total || 0,
      streak,
      activeDays: last30Days.length,
      topTopics,
      quizPerformance: quizPerf,
      hourlyPattern,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/activity/admin/overview — Admin analytics overview
router.get('/admin/overview', auth, admin, async (req, res) => {
  try {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)

    // DAU/WAU/MAU
    const dau = await UserStats.countDocuments({ date: today, isActive: true })
    const wau = await UserStats.distinct('user', { date: { $gte: weekAgo.toISOString().split('T')[0] }, isActive: true })
    const mau = await UserStats.distinct('user', { date: { $gte: monthAgo.toISOString().split('T')[0] }, isActive: true })

    // Total platform time today
    const todayTime = await UserStats.aggregate([
      { $match: { date: today } },
      { $group: { _id: null, total: { $sum: '$totalTimeSpent' } } }
    ])

    // Average time per user per day (last 7 days)
    const avgTimePerDay = await UserStats.aggregate([
      { $match: { date: { $gte: weekAgo.toISOString().split('T')[0] }, totalTimeSpent: { $gt: 0 } } },
      { $group: { _id: null, avgTime: { $avg: '$totalTimeSpent' }, totalUsers: { $sum: 1 } } }
    ])

    // Most popular courses (by views this week)
    const popularCourses = await Activity.aggregate([
      { $match: { type: 'topic_view', createdAt: { $gte: weekAgo } } },
      { $group: { _id: '$courseId', views: { $sum: 1 }, uniqueUsers: { $addToSet: '$user' } } },
      { $project: { _id: 1, views: 1, uniqueUsers: { $size: '$uniqueUsers' } } },
      { $sort: { views: -1 } }
    ])

    // Drop-off analysis
    const dropOff = await Activity.aggregate([
      { $match: { type: { $in: ['topic_view', 'topic_exit'] }, createdAt: { $gte: monthAgo } } },
      { $group: {
        _id: { courseId: '$courseId', topicId: '$topicId' },
        views: { $sum: { $cond: [{ $eq: ['$type', 'topic_view'] }, 1, 0] } },
        avgDuration: { $avg: { $cond: [{ $eq: ['$type', 'topic_exit'] }, '$duration', null] } }
      }},
      { $sort: { views: -1 } },
      { $limit: 20 }
    ])

    // Quiz pass rates per course
    const quizStats = await Activity.aggregate([
      { $match: { type: 'quiz_complete', createdAt: { $gte: monthAgo } } },
      { $group: {
        _id: '$courseId',
        attempts: { $sum: 1 },
        passed: { $sum: { $cond: [{ $gte: ['$quizData.totalScore', 3] }, 1, 0] } },
        avgScore: { $avg: '$quizData.totalScore' }
      }}
    ])

    // Hourly activity pattern (platform-wide)
    const hourlyPlatform = await Activity.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: { $hour: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } }
    ])

    // Daily active users trend (last 30 days)
    const dauTrend = await UserStats.aggregate([
      { $match: { date: { $gte: monthAgo.toISOString().split('T')[0] }, isActive: true } },
      { $group: { _id: '$date', count: { $sum: 1 }, totalTime: { $sum: '$totalTimeSpent' } } },
      { $sort: { _id: 1 } }
    ])

    // Top 10 most active users this week
    const topUsers = await UserStats.aggregate([
      { $match: { date: { $gte: weekAgo.toISOString().split('T')[0] } } },
      { $group: { _id: '$user', totalTime: { $sum: '$totalTimeSpent' }, activeDays: { $sum: 1 }, sessions: { $sum: '$sessionsCount' } } },
      { $sort: { totalTime: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userInfo' } },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      { $project: { name: { $ifNull: ['$userInfo.name', 'Unknown'] }, email: { $ifNull: ['$userInfo.email', ''] }, totalTime: 1, activeDays: 1, sessions: 1 } }
    ])

    // Interaction engagement
    const interactionStats = await Activity.aggregate([
      { $match: { type: 'interactive_use', createdAt: { $gte: monthAgo } } },
      { $group: { _id: '$interactionData.component', uses: { $sum: 1 }, uniqueUsers: { $addToSet: '$user' } } },
      { $project: { _id: 1, uses: 1, uniqueUsers: { $size: '$uniqueUsers' } } },
      { $sort: { uses: -1 } },
      { $limit: 15 }
    ])

    res.json({
      engagement: { dau, wau: wau.length, mau: mau.length },
      todayTotalTime: todayTime[0]?.total || 0,
      avgTimePerUserPerDay: avgTimePerDay[0]?.avgTime || 0,
      popularCourses,
      dropOff,
      quizStats,
      hourlyPlatform,
      dauTrend,
      topUsers,
      interactionStats,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/activity/admin/user/:userId — Detailed activity for a specific user
router.get('/admin/user/:userId', auth, admin, async (req, res) => {
  try {
    const userId = req.params.userId

    const recentActivity = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('type courseId topicId duration quizData createdAt page sessionId scrollDepth')

    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    const dailyStats = await UserStats.find({
      user: userId,
      date: { $gte: monthAgo.toISOString().split('T')[0] }
    }).sort({ date: 1 })

    const courseTime = await Activity.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), type: 'topic_exit', duration: { $gt: 0 } } },
      { $group: { _id: '$courseId', totalTime: { $sum: '$duration' }, visits: { $sum: 1 } } },
      { $sort: { totalTime: -1 } }
    ])

    const quizHistory = await Activity.find({
      user: userId, type: 'quiz_complete'
    }).sort({ createdAt: -1 }).limit(30).select('courseId topicId quizData createdAt')

    res.json({ recentActivity, dailyStats, courseTime, quizHistory })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
