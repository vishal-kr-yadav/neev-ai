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
  quizAttempts: {
    type: Map,
    of: new mongoose.Schema({
      score: Number,
      attempts: { type: Number, default: 1 },
      lastAttemptAt: { type: Date, default: Date.now },
    }, { _id: false }),
    default: {},
  },
  finalQuizScore: {
    type: Number,
    default: null,
  },
  finalQuizAttempts: {
    type: Number,
    default: 0,
  },
  finalQuizLastAt: {
    type: Date,
    default: null,
  },
  projectCompleted: {
    type: Boolean,
    default: false,
  },
  completedProjects: {
    type: [String],
    default: [],
  },
  assignmentResponses: {
    type: Map,
    of: new mongoose.Schema({
      responses: { type: mongoose.Schema.Types.Mixed, default: {} },
      savedAt: { type: Date, default: Date.now },
      submitted: { type: Boolean, default: false },
      evaluation: {
        type: new mongoose.Schema({
          sections: { type: Map, of: new mongoose.Schema({ score: Number, feedback: String, suggestion: String }, { _id: false }) },
          totalScore: Number,
          maxScore: Number,
          overallFeedback: String,
          improvements: [String],
          strengths: [String],
          evaluatedAt: Date,
          model: String,
        }, { _id: false }),
        default: null,
      },
    }, { _id: false }),
    default: {},
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
