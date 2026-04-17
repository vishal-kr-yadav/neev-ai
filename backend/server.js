const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const authRoutes = require('./routes/auth')
const progressRoutes = require('./routes/progress')
const questionRoutes = require('./routes/questions')

const app = express()

// Middleware
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/progress', progressRoutes)
app.use('/api/questions', questionRoutes)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message)
    process.exit(1)
  })
