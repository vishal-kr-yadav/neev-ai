const express = require('express')
const OpenAI = require('openai')
const Progress = require('../models/Progress')

const router = express.Router()

const ASSIGNMENT_RUBRICS = {
  scale: {
    1: {
      name: 'Scale a RAG Application',
      sections: ['Architecture Analysis', 'Bottleneck Identification', 'Scaling Strategy', 'Cost Analysis', 'Infrastructure Design', 'Optimization Plan', 'Monitoring Strategy', 'Executive Summary'],
    },
    2: {
      name: 'Deploy to Production',
      sections: ['Environment Design', 'CI/CD Pipeline', 'Branching Strategy', 'Rollback Plan', 'Security Configuration', 'Monitoring Setup', 'Go-Live Checklist'],
    },
    3: {
      name: 'Git Workflow Challenge',
      sections: ['Repository Setup', 'Branching Strategy', 'Merge Conflict Resolution', 'CI/CD Configuration', 'Code Review Process', 'Release Management', 'Team Workflow'],
    },
    4: {
      name: 'Database Scaling for BookKart',
      sections: ['Crisis Analysis', 'Connection Pooling Design', 'Indexing Strategy', 'Read Replica Architecture', 'Sharding Decision', 'SQL vs NoSQL Evaluation'],
    },
  },
  llm: {
    1: {
      name: 'Enterprise Banking Chatbot',
      sections: ['Scenario Briefing', 'System Prompt Design', 'Intent Classification', 'Handling Sensitive Data', 'Edge Cases & Escalation', 'Multi-turn Conversation', 'Testing & Evaluation', 'Final Architecture'],
    },
    2: {
      name: 'Social Media Content Moderator',
      sections: ['Platform Analysis', 'Content Classification', 'Multilingual Support', 'Bias Detection', 'Compliance Framework', 'Escalation Pipeline', 'System Architecture'],
    },
    3: {
      name: 'Legal Document Intelligence',
      sections: ['Document Analysis', 'Clause Extraction', 'Hallucination Prevention', 'RAG Pipeline', 'Case Law Search', 'Risk Assessment', 'System Design'],
    },
  },
  cv: {
    1: {
      name: 'Paint Line Defect Detection',
      sections: ['Problem Analysis', 'Data Pipeline', 'Model Selection', 'Training Strategy', 'Evaluation Metrics', 'Deployment Plan'],
    },
    2: {
      name: 'PCB Quality Inspection',
      sections: ['Defect Categories', 'Data Augmentation', 'Architecture Design', 'Performance Optimization', 'Integration Plan'],
    },
    3: {
      name: 'Steel Mill Surface Inspection',
      sections: ['Problem Scope', 'Dataset Strategy', 'Model Architecture', 'Real-time Pipeline', 'Quality Metrics', 'Production Deployment'],
    },
  },
}

router.post('/:courseId/assignment/:assignmentId', async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params

    const progress = await Progress.findOne({
      user: req.userId,
      courseId,
    })

    if (!progress) {
      return res.status(404).json({ error: 'No progress found for this course' })
    }

    const assignment = progress.assignmentResponses?.get(String(assignmentId))
    if (!assignment || !assignment.responses) {
      return res.status(400).json({ error: 'No responses found. Please save your assignment first.' })
    }

    if (!assignment.submitted) {
      return res.status(400).json({ error: 'Please submit the assignment before requesting evaluation.' })
    }

    const rubric = ASSIGNMENT_RUBRICS[courseId]?.[Number(assignmentId)]
    if (!rubric) {
      return res.status(400).json({ error: 'No rubric found for this assignment.' })
    }

    const responsesText = Object.entries(assignment.responses)
      .map(([key, value]) => `Question ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`)
      .join('\n\n')

    const systemPrompt = `You are an expert technical evaluator for an interactive learning platform called Neev. You are evaluating a student's assignment submission for "${rubric.name}".

Evaluate the student's responses across these sections: ${rubric.sections.join(', ')}.

For each section, provide:
1. A score from 0-10 (be fair but rigorous)
2. Specific feedback (2-3 sentences) highlighting what was good and what needs improvement
3. One concrete suggestion for improvement

Also provide:
- An overall score (percentage)
- Overall feedback (2-3 sentences summarizing strengths and areas for growth)
- Top 3 specific improvements the student should make

IMPORTANT: Be encouraging but honest. Highlight genuine understanding and penalize vague or generic answers. Give credit for real-world awareness and practical considerations.

Respond in this exact JSON format:
{
  "sections": {
    "1": { "score": 8, "feedback": "...", "suggestion": "..." },
    "2": { "score": 7, "feedback": "...", "suggestion": "..." }
  },
  "totalScore": 75,
  "maxScore": 100,
  "overallFeedback": "...",
  "improvements": ["...", "...", "..."],
  "strengths": ["...", "..."]
}`

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return res.status(503).json({ error: 'AI evaluation is not configured. Please add an OpenAI API key.' })
    }

    const client = new OpenAI({ apiKey })

    let evaluation
    try {
      const response = await client.responses.create({
        model: 'gpt-5.4-mini',
        instructions: systemPrompt,
        input: `Student's Assignment Responses:\n\n${responsesText}`,
      })
      const text = response.output_text || ''
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : null
    } catch (err) {
      console.error('Responses API error:', err.message)
      try {
        const completion = await client.chat.completions.create({
          model: 'gpt-4o-mini',
          max_tokens: 2048,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Student's Assignment Responses:\n\n${responsesText}` },
          ],
        })
        const text = completion.choices[0]?.message?.content || ''
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        evaluation = jsonMatch ? JSON.parse(jsonMatch[0]) : null
      } catch (err2) {
        console.error('Chat completions fallback error:', err2.message)
        return res.status(503).json({ error: 'AI evaluation temporarily unavailable. Please try again later.' })
      }
    }

    if (!evaluation) {
      return res.status(500).json({ error: 'Failed to parse AI evaluation response.' })
    }

    evaluation.evaluatedAt = new Date()
    evaluation.model = 'gpt'

    await Progress.findOneAndUpdate(
      { user: req.userId, courseId },
      {
        $set: {
          [`assignmentResponses.${assignmentId}.evaluation`]: evaluation,
        },
      }
    )

    res.json({ evaluation })
  } catch (err) {
    console.error('Evaluation error:', err)
    res.status(500).json({ error: 'Server error during evaluation.' })
  }
})

router.get('/:courseId/assignment/:assignmentId', async (req, res) => {
  try {
    const { courseId, assignmentId } = req.params
    const progress = await Progress.findOne({ user: req.userId, courseId })
    if (!progress) return res.json({ evaluation: null })

    const assignment = progress.assignmentResponses?.get(String(assignmentId))
    res.json({ evaluation: assignment?.evaluation || null })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
