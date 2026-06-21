const express = require('express')
const Progress = require('../models/Progress')
const auth = require('../middleware/auth')

const router = express.Router()

// All progress routes require authentication
router.use(auth)

// GET /api/progress/:courseId — get user's progress for a course
router.get('/:courseId', async (req, res) => {
  try {
    let progress = await Progress.findOne({
      user: req.userId,
      courseId: req.params.courseId,
    })

    if (!progress) {
      // Create fresh progress
      progress = new Progress({
        user: req.userId,
        courseId: req.params.courseId,
      })
      await progress.save()
    }

    res.json({ progress })
  } catch (err) {
    console.error('Get progress error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/progress — get all progress for user (dashboard)
router.get('/', async (req, res) => {
  try {
    const progressList = await Progress.find({ user: req.userId })
    res.json({ progress: progressList })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/progress/:courseId/topic — mark a topic complete
router.put('/:courseId/topic', async (req, res) => {
  try {
    const { topicIndex } = req.body

    let progress = await Progress.findOne({
      user: req.userId,
      courseId: req.params.courseId,
    })

    if (!progress) {
      progress = new Progress({
        user: req.userId,
        courseId: req.params.courseId,
      })
    }

    if (!progress.completedTopics.includes(topicIndex)) {
      progress.completedTopics.push(topicIndex)
    }
    progress.lastAccessedTopic = topicIndex
    await progress.save()

    res.json({ progress })
  } catch (err) {
    console.error('Update topic error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/progress/:courseId/quiz — save a quiz score
router.put('/:courseId/quiz', async (req, res) => {
  try {
    const { topicIndex, score } = req.body

    let progress = await Progress.findOneAndUpdate(
      { user: req.userId, courseId: req.params.courseId },
      {
        $set: {
          [`quizScores.${topicIndex}`]: score,
          [`quizAttempts.${topicIndex}.score`]: score,
          [`quizAttempts.${topicIndex}.lastAttemptAt`]: new Date(),
        },
        $inc: { [`quizAttempts.${topicIndex}.attempts`]: 1 },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.json({ progress })
  } catch (err) {
    console.error('Update quiz error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/progress/:courseId/final-quiz — save final quiz score
router.put('/:courseId/final-quiz', async (req, res) => {
  try {
    const { score } = req.body

    const progress = await Progress.findOneAndUpdate(
      { user: req.userId, courseId: req.params.courseId },
      {
        finalQuizScore: score,
        finalQuizLastAt: new Date(),
        $inc: { finalQuizAttempts: 1 },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.json({ progress })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/progress/:courseId/project — mark project complete (supports multi-project)
router.put('/:courseId/project', async (req, res) => {
  try {
    const { projectId } = req.body
    const updateObj = { projectCompleted: true, completedAt: new Date() }

    if (projectId) {
      updateObj.$addToSet = { completedProjects: projectId }
    }

    const progress = await Progress.findOneAndUpdate(
      { user: req.userId, courseId: req.params.courseId },
      updateObj,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.json({ progress })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/progress/:courseId/assignment — save assignment responses
router.put('/:courseId/assignment', async (req, res) => {
  try {
    const { assignmentId, responses, submitted } = req.body

    if (!assignmentId) {
      return res.status(400).json({ error: 'assignmentId is required' })
    }

    const progress = await Progress.findOneAndUpdate(
      { user: req.userId, courseId: req.params.courseId },
      {
        $set: {
          [`assignmentResponses.${assignmentId}`]: {
            responses: responses || {},
            savedAt: new Date(),
            submitted: submitted || false,
          },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    res.json({ progress })
  } catch (err) {
    console.error('Save assignment error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/progress/:courseId/assignment/:assignmentId — get saved assignment responses
router.get('/:courseId/assignment/:assignmentId', async (req, res) => {
  try {
    const progress = await Progress.findOne({
      user: req.userId,
      courseId: req.params.courseId,
    })

    if (!progress) {
      return res.json({ responses: null })
    }

    const assignment = progress.assignmentResponses?.get(req.params.assignmentId)
    res.json({ assignment: assignment || null })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
