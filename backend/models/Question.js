const mongoose = require('mongoose')

const answerSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true, maxlength: 25000 }, // ~5k words
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAccepted: { type: Boolean, default: false },
}, { timestamps: true })

const questionSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 200, trim: true },
  body: { type: String, required: true, maxlength: 2500 }, // ~500 words
  tags: [{ type: String, trim: true, lowercase: true }],
  courseId: { type: String, default: '' }, // links to course if asked from course page
  topicId: { type: Number, default: null }, // links to specific topic
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  answers: [answerSchema],
  isClosed: { type: Boolean, default: false },
}, { timestamps: true })

// Indexes for fast queries
questionSchema.index({ createdAt: -1 })
questionSchema.index({ tags: 1 })
questionSchema.index({ courseId: 1, topicId: 1 })
questionSchema.index({ author: 1 })
questionSchema.index({ 'answers.author': 1 })

module.exports = mongoose.model('Question', questionSchema)
