const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    required: true,
    enum: ['topic_view', 'topic_exit', 'quiz_start', 'quiz_complete', 'quiz_answer',
           'assignment_start', 'assignment_save', 'assignment_submit',
           'interactive_use', 'session_start', 'session_end', 'page_navigate',
           'course_start', 'project_complete', 'video_play'],
    index: true
  },
  courseId: { type: String, index: true },
  topicId: { type: Number },
  assignmentId: { type: Number },

  // Time tracking
  duration: { type: Number }, // milliseconds spent
  startedAt: { type: Date },
  endedAt: { type: Date },

  // Quiz details
  quizData: {
    questionIndex: Number,
    selectedAnswer: Number,
    correctAnswer: Number,
    isCorrect: Boolean,
    timeSpent: Number, // ms per question
    totalScore: Number,
    totalQuestions: Number,
  },

  // Interaction details
  interactionData: {
    component: String, // which interactive component
    action: String, // click, drag, toggle, submit
    value: mongoose.Schema.Types.Mixed, // any relevant value
  },

  // Session/navigation
  sessionId: { type: String, index: true },
  page: { type: String }, // current page path
  referrer: { type: String }, // previous page

  // Device info
  device: {
    userAgent: String,
    screenWidth: Number,
    screenHeight: Number,
    platform: String,
  },

  // Scroll tracking
  scrollDepth: { type: Number }, // 0-100 percentage

  // Metadata
  metadata: { type: mongoose.Schema.Types.Mixed },
}, {
  timestamps: true,
  // TTL index: keep detailed events for 1 year, then auto-delete
  // (aggregated stats are stored separately)
})

// Compound indexes for common queries
activitySchema.index({ user: 1, type: 1, createdAt: -1 })
activitySchema.index({ courseId: 1, topicId: 1, type: 1 })
activitySchema.index({ createdAt: -1 })
activitySchema.index({ sessionId: 1, createdAt: 1 })

module.exports = mongoose.model('Activity', activitySchema)
