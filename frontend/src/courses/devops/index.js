import Topic1Content from './topics/Topic1_TheProblem'
import Topic1Quiz from './quizzes/Quiz1_DeploymentChaos'
import Topic2Content from './topics/Topic2_WhatAreContainers'
import Topic2Quiz from './quizzes/Quiz2_ContainerMatch'
import Topic3Content from './topics/Topic3_DockerArchitecture'
import Topic3Quiz from './quizzes/Quiz3_ArchitecturePuzzle'
import Topic4Content from './topics/Topic4_Dockerfile'
import Topic4Quiz from './quizzes/Quiz4_DockerfileFix'
import Topic5Content from './topics/Topic5_DockerCommands'
import Topic5Quiz from './quizzes/Quiz5_TerminalChallenge'
import Topic6Content from './topics/Topic6_VolumesNetworking'
import Topic6Quiz from './quizzes/Quiz6_NetworkingPuzzle'
import Topic7Content from './topics/Topic7_DockerCompose'
import Topic7Quiz from './quizzes/Quiz7_ComposeBuilder'
import Topic8Content from './topics/Topic8_RealWorldDeploy'
import Topic8Quiz from './quizzes/Quiz8_ProductionReady'

const devopsCourse = {
  id: 'devops',
  title: 'DevOps & CloudOps',
  subtitle: 'Master containerization, deployment, and cloud operations — from Docker basics to production pipelines.',
  description: 'Learn Docker, containers, and real-world deployment through cinematic visuals, interactive simulations, and hands-on exercises.',
  icon: '🐳',
  gradient: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
  color: '#0ea5e9',
  duration: 'Coming Soon',
  level: 'All Levels',
  available: false,

  topics: [
    // --- Docker Fundamentals ---
    { id: 1, title: 'The Problem', subtitle: '"Works on my machine" — the deployment disaster that started it all.', icon: '🔥', content: Topic1Content, quiz: Topic1Quiz },
    { id: 2, title: 'What Are Containers?', subtitle: 'From shipping ports to software — the container revolution explained.', icon: '📦', content: Topic2Content, quiz: Topic2Quiz },
    { id: 3, title: 'Docker Architecture', subtitle: 'Engine, Daemon, Images, Containers — how the pieces fit together.', icon: '🏗️', content: Topic3Content, quiz: Topic3Quiz },
    { id: 4, title: 'Dockerfile', subtitle: 'Write the recipe that builds your perfect container — layer by layer.', icon: '📜', content: Topic4Content, quiz: Topic4Quiz },

    // --- Docker in Practice ---
    { id: 5, title: 'Docker Commands', subtitle: 'Master the terminal — pull, run, build, stop, and everything between.', icon: '⌨️', content: Topic5Content, quiz: Topic5Quiz },
    { id: 6, title: 'Volumes & Networking', subtitle: 'Persistent data and container communication — the plumbing of Docker.', icon: '🔌', content: Topic6Content, quiz: Topic6Quiz },
    { id: 7, title: 'Docker Compose', subtitle: 'Orchestrate multi-container apps with a single YAML file.', icon: '🎼', content: Topic7Content, quiz: Topic7Quiz },
    { id: 8, title: 'Real-World Deployment', subtitle: 'CI/CD pipelines, registries, scaling, and production best practices.', icon: '🚀', content: Topic8Content, quiz: Topic8Quiz },
  ],

  project: null,
}

export default devopsCourse
