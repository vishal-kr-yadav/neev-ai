import Topic1Content from './topics/Topic1_WhatIsCV'
import Topic1Quiz from './quizzes/Quiz1_VisionBasics'
import Topic2Content from './topics/Topic2_PixelsChannels'
import Topic2Quiz from './quizzes/Quiz2_PixelExplorer'
import Topic3Content from './topics/Topic3_Preprocessing'
import Topic3Quiz from './quizzes/Quiz3_TransformLab'
import Topic4Content from './topics/Topic4_CNNs'
import Topic4Quiz from './quizzes/Quiz4_FilterBuilder'
import Topic5Content from './topics/Topic5_ObjectDetection'
import Topic5Quiz from './quizzes/Quiz5_DetectorMatch'
import Topic6Content from './topics/Topic6_Annotations'
import Topic6Quiz from './quizzes/Quiz6_LabelChallenge'
import Topic7Content from './topics/Topic7_TrainingMetrics'
import Topic7Quiz from './quizzes/Quiz7_MetricsQuiz'
import Topic8Content from './topics/Topic8_IndustrialQC'
import Topic8Quiz from './quizzes/Quiz8_QualityInspector'

const cvCourse = {
  id: 'cv',
  title: 'Computer Vision',
  subtitle: 'How machines see the world — from pixels to industrial quality control.',
  description: 'Master computer vision through interactive visuals: pixels, CNNs, object detection, and real-world manufacturing inspection.',
  icon: '👁️',
  gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
  color: '#0ea5e9',
  duration: '1 Week · ~10 hrs',
  level: 'All Levels',
  available: true,

  topics: [
    // --- Day 1: Visual Foundations (Topics 1-2, ~2 hrs) ---
    { id: 1, title: 'What is Computer Vision?', subtitle: 'From human sight to machine perception — see how AI interprets the visual world.', icon: '👁️', duration: '~50 min', day: 1, content: Topic1Content, quiz: Topic1Quiz },
    { id: 2, title: 'Pixels & Color Channels', subtitle: 'Zoom into the atoms of an image — pixels, RGB, and how machines read visual data.', icon: '🎨', duration: '~55 min', day: 1, content: Topic2Content, quiz: Topic2Quiz },

    // --- Day 2: Data Pipeline (Topics 3-4, ~2 hrs) ---
    { id: 3, title: 'Image Preprocessing', subtitle: 'Resize, normalize, augment — prepare images so AI can learn from them.', icon: '🔧', duration: '~50 min', day: 2, content: Topic3Content, quiz: Topic3Quiz },
    { id: 4, title: 'Convolutional Neural Networks', subtitle: 'The engine behind vision AI — explore filters, feature maps, and pooling.', icon: '🧠', duration: '~60 min', day: 2, content: Topic4Content, quiz: Topic4Quiz },

    // --- Day 3: Detection & Labeling (Topics 5-6, ~2 hrs) ---
    { id: 5, title: 'Object Detection & YOLO', subtitle: 'From sliding windows to real-time detection — how AI finds objects.', icon: '🎯', duration: '~55 min', day: 3, content: Topic5Content, quiz: Topic5Quiz },
    { id: 6, title: 'Annotations & Data Labeling', subtitle: 'The human step — bounding boxes, polygons, and building training datasets.', icon: '🏷️', duration: '~50 min', day: 3, content: Topic6Content, quiz: Topic6Quiz },

    // --- Day 4: Production AI (Topics 7-8, ~2 hrs) ---
    { id: 7, title: 'Training & Evaluation Metrics', subtitle: 'Loss curves, mAP, precision, recall — measure how well your model learns.', icon: '📊', duration: '~55 min', day: 4, content: Topic7Content, quiz: Topic7Quiz },
    { id: 8, title: 'Industrial Quality Inspection', subtitle: 'Deploy CV in factories — defect detection, edge AI, and production lines.', icon: '🏭', duration: '~50 min', day: 4, content: Topic8Content, quiz: Topic8Quiz },

    // --- Day 5-7: Project + Assignments + Final Quiz (~4 hrs) ---
  ],

  assignments: [
    { id: 1, title: 'Automotive Paint Line Inspector', subtitle: 'Design a CV-based paint defect detection system for a luxury car manufacturer — from data collection to deployment.', icon: '🚗', duration: '~45 min' },
    { id: 2, title: 'PCB Defect Detection System', subtitle: 'Build an AI-powered quality control upgrade for a PCB factory — reduce false positives while maintaining 99% catch rate.', icon: '🔌', duration: '~40 min' },
    { id: 3, title: 'Steel Mill Continuous Improvement', subtitle: 'Diagnose accuracy drop, handle data drift, and scale a deployed model to new production lines at a steel plant.', icon: '🏭', duration: '~35 min' },
  ],

  project: {
    title: 'CV Projects',
    subtitle: 'Hands-on projects to master computer vision concepts.',
    icon: '👁️',
  },

  projects: [
    { id: 'steel', title: 'Steel Defect Inspector', subtitle: 'Build a complete defect detection pipeline — annotate steel surfaces, configure YOLO, train a model, and run real-time quality inspection.', icon: '🔬' },
    { id: 'numberplate', title: 'Vehicle Number Plate Detection', subtitle: 'Build an Indian ANPR system — annotate vehicles, train YOLO, detect plates, extract text with OCR, and deploy for toll plazas & smart parking.', icon: '🚗' },
  ],
}

export default cvCourse
