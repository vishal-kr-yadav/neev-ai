import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Community from './pages/Community'
import TopicPage from './pages/TopicPage'
import FinalQuiz from './pages/FinalQuiz'
import ProjectPage from './pages/ProjectPage'
import Admin from './pages/Admin'
import AssignmentPage from './pages/AssignmentPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/community" element={<Community />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/course/:courseId/:topicId" element={<TopicPage />} />
      <Route path="/course/:courseId/final-quiz" element={<FinalQuiz />} />
      <Route path="/course/:courseId/project" element={<ProjectPage />} />
      <Route path="/course/:courseId/project/:projectId" element={<ProjectPage />} />
      <Route path="/course/:courseId/assignment/:assignmentId" element={<AssignmentPage />} />
    </Routes>
  )
}

export default App
