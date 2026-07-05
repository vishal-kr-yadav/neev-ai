const mongoose = require('mongoose')

const userStatsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true }, // YYYY-MM-DD format

  // Time tracking
  totalTimeSpent: { type: Number, default: 0 }, // ms total on platform
  topicTimeSpent: { type: Map, of: Number, default: {} }, // courseId_topicId → ms

  // Activity counts
  topicsViewed: { type: Number, default: 0 },
  topicsCompleted: { type: Number, default: 0 },
  quizzesAttempted: { type: Number, default: 0 },
  quizzesPassed: { type: Number, default: 0 },
  interactionsCount: { type: Number, default: 0 },
  assignmentsSaved: { type: Number, default: 0 },
  assignmentsSubmitted: { type: Number, default: 0 },

  // Session info
  sessionsCount: { type: Number, default: 0 },
  avgSessionDuration: { type: Number, default: 0 }, // ms

  // Engagement
  pagesVisited: { type: Number, default: 0 },
  uniqueCoursesAccessed: [String],

  // Streak tracking
  isActive: { type: Boolean, default: false },
}, {
  timestamps: true
})

userStatsSchema.index({ user: 1, date: -1 })
userStatsSchema.index({ date: -1 })

module.exports = mongoose.model('UserStats', userStatsSchema)
