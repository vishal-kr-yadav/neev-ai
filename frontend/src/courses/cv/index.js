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

  goal: {
    title: 'The Story of This Course',
    vision: "Imagine you're hired by Tata Motors. Their paint line produces 500 car bodies per day, and human inspectors catch only 85% of defects — costing crores in recalls. Your job: build an AI system that sees defects humans miss. But you can't just download a model and plug it in. You need to understand HOW machines see, from the ground up. This course takes you on that journey — from \"what is a pixel?\" all the way to deploying a working defect detection system on a factory floor. Each topic is a layer in the pipeline, and by the end, you'll have built the complete stack.",
    points: [
      'We start at the very bottom: what IS an image to a computer? Just numbers in a grid — pixels and color channels. Once you see this, everything else clicks.',
      'Raw images are messy, so we clean them (preprocessing). Then we need a brain that can look at pixels and understand "this is a scratch" — that brain is a CNN.',
      'CNNs classify images, but factories need to know WHERE the defect is. That\'s object detection (YOLO). And YOLO needs training data — so you learn to annotate and label.',
      'Finally, you train your model, measure if it\'s actually working (metrics), and deploy the full system on a production line — the complete industrial AI pipeline.',
    ],
    hindiTitle: 'इस कोर्स की कहानी',
    hindiExplanation: 'सोचो तुम्हें Tata Motors ने hire किया है। उनकी paint line रोज़ 500 car bodies बनाती है, और human inspectors सिर्फ 85% defects पकड़ पाते हैं — बाकी 15% से करोड़ों का नुकसान होता है। तुम्हारा काम: एक AI system बनाओ जो वो defects देखे जो इंसान miss कर देते हैं। लेकिन सिर्फ model download करके नहीं चलेगा — तुम्हें समझना होगा कि machine "देखती" कैसे है। पहले हम समझेंगे कि image क्या है — pixels और colors (Topic 1-2)। फिर images को clean करेंगे preprocessing से (Topic 3)। फिर CNN बनाएंगे — जो pixels को देखकर बताए "यह scratch है" (Topic 4)। फिर Object Detection — defect कहां है (Topic 5)। फिर training data कैसे बनाएं (Topic 6), model कैसे evaluate करें (Topic 7), और finally factory में कैसे deploy करें (Topic 8)। हर topic एक layer है — और अंत में तुम्हारे पास पूरी pipeline होगी।',
  },

  topics: [
    // --- Day 1: Visual Foundations (Topics 1-2, ~2 hrs) ---
    { id: 1, title: 'What is Computer Vision?', subtitle: 'From human sight to machine perception — see how AI interprets the visual world.', icon: '👁️', duration: '~50 min', day: 1, content: Topic1Content, quiz: Topic1Quiz },
    { id: 2, title: 'Pixels & Color Channels', subtitle: 'Zoom into the atoms of an image — pixels, RGB, and how machines read visual data.', icon: '🎨', duration: '~55 min', day: 1, content: Topic2Content, quiz: Topic2Quiz,
      storyLink: 'You\'ve seen what Computer Vision can do — detect objects, read faces, inspect factory parts at superhuman speed. Impressive! But how does a machine actually "see"? It doesn\'t have eyes or a brain. All it has is a grid of numbers. Every image — your selfie, a factory photo, an X-ray — is just numbers arranged in rows and columns. Understanding pixels and color channels is the foundation everything else builds on.' },

    // --- Day 2: Data Pipeline (Topics 3-4, ~2 hrs) ---
    { id: 3, title: 'Image Preprocessing', subtitle: 'Resize, normalize, augment — prepare images so AI can learn from them.', icon: '🔧', duration: '~50 min', day: 2, content: Topic3Content, quiz: Topic3Quiz,
      storyLink: 'You know that images are grids of pixels with RGB color values. But real-world images are messy — different sizes (1080p vs 4K), different lighting (bright sun vs dim factory), different angles. If you feed raw images directly into an AI model, it gets confused. Before AI can learn, images need to be cleaned, resized, normalized, and augmented. This "data cleaning" step is boring but critical — garbage in, garbage out.' },
    { id: 4, title: 'Convolutional Neural Networks', subtitle: 'The engine behind vision AI — explore filters, feature maps, and pooling.', icon: '🧠', duration: '~60 min', day: 2, content: Topic4Content, quiz: Topic4Quiz,
      storyLink: 'Your images are clean, standardized, and augmented. Now you need a BRAIN — something that can look at these pixels and understand "this is a scratch", "this is a crack", "this is a good part." That brain is a Convolutional Neural Network (CNN). Just like the Transformer is the engine behind text AI, the CNN is the engine behind vision AI. It uses small filters that slide across the image, detecting edges, textures, shapes, and finally whole objects.' },

    // --- Day 3: Detection & Labeling (Topics 5-6, ~2 hrs) ---
    { id: 5, title: 'Object Detection & YOLO', subtitle: 'From sliding windows to real-time detection — how AI finds objects.', icon: '🎯', duration: '~55 min', day: 3, content: Topic5Content, quiz: Topic5Quiz,
      storyLink: 'CNNs can classify an entire image: "this image contains a defect." But in a real factory, you need more: WHERE is the defect? Is it a scratch on the left door or a dent on the bumper? How many defects are there? Object detection does exactly this — it draws bounding boxes around objects and labels each one. And YOLO (You Only Look Once) does it in real-time, fast enough for a moving production line.' },
    { id: 6, title: 'Annotations & Data Labeling', subtitle: 'The human step — bounding boxes, polygons, and building training datasets.', icon: '🏷️', duration: '~50 min', day: 3, content: Topic6Content, quiz: Topic6Quiz,
      storyLink: 'YOLO can detect objects at lightning speed — but only AFTER it\'s been trained. And training needs labeled data: thousands of images with bounding boxes drawn by humans saying "this is a scratch", "this is a dent", "this is normal." Who draws those boxes? How do you ensure quality? How many images do you need? This is the human step that makes or breaks your AI — and most teams get it wrong.' },

    // --- Day 4: Production AI (Topics 7-8, ~2 hrs) ---
    { id: 7, title: 'Training & Evaluation Metrics', subtitle: 'Loss curves, mAP, precision, recall — measure how well your model learns.', icon: '📊', duration: '~55 min', day: 4, content: Topic7Content, quiz: Topic7Quiz,
      storyLink: 'You have a CNN/YOLO architecture and thousands of labeled images. Time to train! You hit "start training" and... numbers start scrolling. Loss: 2.3, 1.8, 0.9... mAP: 0.45, 0.62, 0.78... But what do these numbers MEAN? Is your model actually learning? When should you stop training? Is 0.78 mAP good enough for production? These metrics are your dashboard — without them, you\'re driving blind.' },
    { id: 8, title: 'Industrial Quality Inspection', subtitle: 'Deploy CV in factories — defect detection, edge AI, and production lines.', icon: '🏭', duration: '~50 min', day: 4, content: Topic8Content, quiz: Topic8Quiz,
      storyLink: 'You\'ve built the entire pipeline: pixels → preprocessing → CNNs → object detection → annotation → training → evaluation. Every piece works. Now the grand finale: deploy ALL of this in a real factory. Cameras on the production line, edge devices running inference, real-time defect alerts, human review dashboards. This is where your coursework becomes a real product — an AI system that catches defects humans miss, saving crores in quality costs.' },

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
