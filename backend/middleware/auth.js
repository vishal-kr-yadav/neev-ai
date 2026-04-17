const jwt = require('jsonwebtoken')

module.exports = function (req, res, next) {
  const header = req.header('Authorization')
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token, access denied' })
  }

  try {
    const token = header.replace('Bearer ', '')
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
