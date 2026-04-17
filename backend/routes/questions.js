const express = require('express')
const Question = require('../models/Question')
const auth = require('../middleware/auth')

const router = express.Router()

// GET /api/questions — list questions (with pagination, filters)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, courseId, topicId, tag, sort = 'newest', search } = req.query
    const filter = {}
    if (courseId) filter.courseId = courseId
    if (topicId) filter.topicId = parseInt(topicId)
    if (tag) filter.tags = tag
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { body: { $regex: search, $options: 'i' } },
    ]

    const sortMap = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      popular: { views: -1 },
      unanswered: { createdAt: -1 },
    }
    const sortOpt = sortMap[sort] || sortMap.newest
    if (sort === 'unanswered') filter['answers.0'] = { $exists: false }

    const total = await Question.countDocuments(filter)
    const questions = await Question.find(filter)
      .sort(sortOpt)
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .populate('author', 'name profession avatar')
      .select('-answers.body') // don't send full answer bodies in list
      .lean()

    // Add answer count
    const qs = questions.map(q => ({
      ...q,
      answerCount: q.answers?.length || 0,
      upvoteCount: q.upvotes?.length || 0,
      answers: undefined,
    }))

    res.json({ questions: qs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (err) {
    console.error('List questions error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/questions/:id — get single question with answers
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name profession avatar')
      .populate('answers.author', 'name profession avatar')

    if (!question) return res.status(404).json({ error: 'Question not found' })
    res.json({ question })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/questions — create question (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { title, body, tags, courseId, topicId } = req.body
    if (!title || title.length > 200) return res.status(400).json({ error: 'Title required (max 200 chars)' })
    if (!body || body.length > 2500) return res.status(400).json({ error: 'Body required (max ~500 words)' })

    const question = new Question({
      author: req.userId,
      title: title.trim(),
      body: body.trim(),
      tags: tags?.slice(0, 5).map(t => t.trim().toLowerCase()) || [],
      courseId: courseId || '',
      topicId: topicId != null ? parseInt(topicId) : null,
    })
    await question.save()
    await question.populate('author', 'name profession avatar')
    res.status(201).json({ question })
  } catch (err) {
    console.error('Create question error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/questions/:id/answers — add answer (auth required)
router.post('/:id/answers', auth, async (req, res) => {
  try {
    const { body } = req.body
    if (!body || body.length > 25000) return res.status(400).json({ error: 'Answer required (max ~5000 words)' })

    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ error: 'Question not found' })
    if (question.isClosed) return res.status(400).json({ error: 'Question is closed' })

    question.answers.push({ author: req.userId, body: body.trim() })
    await question.save()
    await question.populate('answers.author', 'name profession avatar')
    res.json({ question })
  } catch (err) {
    console.error('Add answer error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/questions/:id/upvote — toggle upvote on question
router.put('/:id/upvote', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ error: 'Not found' })

    const idx = question.upvotes.indexOf(req.userId)
    if (idx === -1) question.upvotes.push(req.userId)
    else question.upvotes.splice(idx, 1)
    await question.save()
    res.json({ upvoteCount: question.upvotes.length, upvoted: idx === -1 })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/questions/:id/answers/:answerId/upvote — toggle upvote on answer
router.put('/:id/answers/:answerId/upvote', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ error: 'Not found' })

    const answer = question.answers.id(req.params.answerId)
    if (!answer) return res.status(404).json({ error: 'Answer not found' })

    const idx = answer.upvotes.indexOf(req.userId)
    if (idx === -1) answer.upvotes.push(req.userId)
    else answer.upvotes.splice(idx, 1)
    await question.save()
    res.json({ upvoteCount: answer.upvotes.length, upvoted: idx === -1 })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/questions/:id/answers/:answerId/accept — accept answer (question author only)
router.put('/:id/answers/:answerId/accept', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ error: 'Not found' })
    if (question.author.toString() !== req.userId) return res.status(403).json({ error: 'Only question author can accept' })

    question.answers.forEach(a => { a.isAccepted = false })
    const answer = question.answers.id(req.params.answerId)
    if (answer) answer.isAccepted = true
    await question.save()
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// DELETE /api/questions/:id — delete question (author only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
    if (!question) return res.status(404).json({ error: 'Not found' })
    if (question.author.toString() !== req.userId) return res.status(403).json({ error: 'Not authorized' })
    await Question.findByIdAndDelete(req.params.id)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
