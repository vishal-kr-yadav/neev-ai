const mongoose = require('mongoose')

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: String,
    required: true,
  },
  completedTopics: {
    type: [Number],
    default: [],
  },
  quizScores: {
    type: Map,
    of: Number,
    default: {},
  },
  finalQuizScore: {
    type: Number,
    default: null,
  },
  projectCompleted: {
    type: Boolean,
    default: false,
  },
  lastAccessedTopic: {
    type: Number,
    default: 0,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
})

// Compound index: one progress doc per user per course
progressSchema.index({ user: 1, courseId: 1 }, { unique: true })

module.exports = mongoose.model('Progress', progressSchema)
