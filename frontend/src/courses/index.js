/*
  Course Registry
  ===============
  Central registry of all courses. To add a new course:
  1. Create a folder: src/courses/<course-id>/
  2. Add topics/ and quizzes/ folders
  3. Create index.js with course config (see llm/index.js as template)
  4. Import and add to the `courses` array below
  5. Optionally add a project/ folder with a project component
*/

import llmCourse from './llm'
import cvCourse from './cv'
import rlCourse from './rl'

// All courses — order here = display order on Home page
export const courses = [
  llmCourse,
  cvCourse,
  rlCourse,
]

// Helpers
export function getCourse(courseId) {
  return courses.find(c => c.id === courseId) || null
}

export function getCourseTopic(courseId, topicIndex) {
  const course = getCourse(courseId)
  if (!course) return null
  return course.topics[topicIndex] || null
}

export function getCourseProject(courseId) {
  const course = getCourse(courseId)
  return course?.project || null
}
