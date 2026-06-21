import Topic1Content from './topics/Topic1_WhatIsLLM'
import Topic1Quiz from './quizzes/Quiz1_SortCards'
import Topic2Content from './topics/Topic2_Tokenization'
import Topic2Quiz from './quizzes/Quiz2_SplitIt'
import Topic3Content from './topics/Topic3_Transformer'
import Topic3Quiz from './quizzes/Quiz3_BuildStack'
import Topic4Content from './topics/Topic4_Attention'
import Topic4Quiz from './quizzes/Quiz4_ConnectWords'
import Topic5Content from './topics/Topic5_Training'
import Topic5Quiz from './quizzes/Quiz5_Timeline'
import Topic6Content from './topics/Topic6_Prompting'
import Topic6Quiz from './quizzes/Quiz6_PromptDoctor'
import Topic7Content from './topics/Topic7_Hallucinations'
import Topic7Quiz from './quizzes/Quiz7_SwipeCards'
import Topic8Content from './topics/Topic8_Playground'
import Topic8Quiz from './quizzes/Quiz8_TemperatureLab'
import Topic9Content from './topics/Topic9_FineTuning'
import Topic9Quiz from './quizzes/Quiz9_FineTuning'
import Topic10Content from './topics/Topic10_Models'
import Topic10Quiz from './quizzes/Quiz10_Models'
import Topic11Content from './topics/Topic11_Multimodal'
import Topic11Quiz from './quizzes/Quiz11_Multimodal'
import Topic12Content from './topics/Topic12_ImageGeneration'
import Topic12Quiz from './quizzes/Quiz12_ImageGen'
import Topic13Content from './topics/Topic13_Embeddings'
import Topic13Quiz from './quizzes/Quiz13_Embeddings'
import Topic14Content from './topics/Topic14_Agents'
import Topic14Quiz from './quizzes/Quiz14_Agents'
import Topic15Content from './topics/Topic15_OpenVsClosed'
import Topic15Quiz from './quizzes/Quiz15_OpenClosed'
import Topic16Content from './topics/Topic16_Safety'
import Topic16Quiz from './quizzes/Quiz16_Safety'

const llmCourse = {
  id: 'llm',
  title: 'Large Language Models',
  subtitle: 'From zero to deep understanding — learn how ChatGPT and other AI language models actually work.',
  description: 'Understand how LLMs read, learn, and generate text through interactive visuals, 3D models, and hands-on exercises.',
  icon: '🧠',
  gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  color: '#4f46e5',
  duration: '1 Week · ~10 hrs',
  level: 'All Levels',
  available: true,

  topics: [
    // --- Day 1: Foundations (Topics 1-3, ~2.5 hrs) ---
    { id: 1, title: 'What is an LLM?', subtitle: 'Discover what makes a Large Language Model tick — no jargon, just visuals.', icon: '🧠', duration: '~45 min', day: 1, content: Topic1Content, quiz: Topic1Quiz },
    { id: 2, title: 'Tokenization', subtitle: 'See how AI breaks language into tiny building blocks before it can "read".', icon: '🔤', duration: '~45 min', day: 1, content: Topic2Content, quiz: Topic2Quiz },
    { id: 3, title: 'Transformer Architecture', subtitle: 'The engine behind every modern LLM — explore it layer by layer.', icon: '⚙️', duration: '~50 min', day: 1, content: Topic3Content, quiz: Topic3Quiz },

    // --- Day 2: Core Mechanics (Topics 4-5, ~2 hrs) ---
    { id: 4, title: 'Attention Mechanism', subtitle: 'How does AI decide which words matter most? Find out interactively.', icon: '🎯', duration: '~55 min', day: 2, content: Topic4Content, quiz: Topic4Quiz },
    { id: 5, title: 'Training Process', subtitle: 'From random noise to intelligent conversation — the journey of an LLM.', icon: '🏋️', duration: '~50 min', day: 2, content: Topic5Content, quiz: Topic5Quiz },

    // --- Day 3: Using LLMs (Topics 6-8, ~2 hrs) ---
    { id: 6, title: 'Prompt Engineering', subtitle: 'The art of talking to AI — small changes, huge differences.', icon: '💬', duration: '~45 min', day: 3, content: Topic6Content, quiz: Topic6Quiz },
    { id: 7, title: 'Hallucinations & Limits', subtitle: 'AI is powerful but not perfect. Learn where it breaks.', icon: '⚠️', duration: '~35 min', day: 3, content: Topic7Content, quiz: Topic7Quiz },
    { id: 8, title: 'Playground', subtitle: 'Experiment freely — predict words, control randomness, and build intuition.', icon: '🎮', duration: '~40 min', day: 3, content: Topic8Content, quiz: Topic8Quiz },

    // --- Day 4: Advanced Techniques (Topics 9-11, ~2 hrs) ---
    { id: 9, title: 'Fine-Tuning & RLHF', subtitle: 'How base models become helpful assistants — from LoRA to human feedback.', icon: '🔧', duration: '~45 min', day: 4, content: Topic9Content, quiz: Topic9Quiz },
    { id: 10, title: 'Major LLM Models', subtitle: 'GPT-4, Claude, Gemini, Llama, Mistral — compare them all.', icon: '🏆', duration: '~35 min', day: 4, content: Topic10Content, quiz: Topic10Quiz },
    { id: 11, title: 'Multimodal AI & Vision', subtitle: 'LLMs that can see images, hear audio, and understand video.', icon: '👁️', duration: '~40 min', day: 4, content: Topic11Content, quiz: Topic11Quiz },

    // --- Day 5: Frontier AI (Topics 12-14, ~2 hrs) ---
    { id: 12, title: 'Image Generation', subtitle: 'How AI creates images from text — diffusion, DALL-E, Stable Diffusion.', icon: '🎨', duration: '~40 min', day: 5, content: Topic12Content, quiz: Topic12Quiz },
    { id: 13, title: 'Embeddings & Vectors', subtitle: 'The secret language of AI — how meaning becomes numbers.', icon: '📐', duration: '~45 min', day: 5, content: Topic13Content, quiz: Topic13Quiz },
    { id: 14, title: 'AI Agents & Tool Use', subtitle: 'When LLMs can browse, code, and take actions in the real world.', icon: '🤖', duration: '~40 min', day: 5, content: Topic14Content, quiz: Topic14Quiz },

    // --- Day 6-7: Ethics, Projects & Assignments (Topics 15-16 + Projects + Assignments) ---
    { id: 15, title: 'Open vs Closed Source', subtitle: 'Llama, Mistral, GPT-4 — which approach wins and when?', icon: '🔓', duration: '~35 min', day: 6, content: Topic15Content, quiz: Topic15Quiz },
    { id: 16, title: 'AI Safety & Future', subtitle: 'Ethics, bias, alignment, and what comes next for AI.', icon: '🛡️', duration: '~40 min', day: 6, content: Topic16Content, quiz: Topic16Quiz },
  ],

  project: {
    title: 'LLM Projects',
    subtitle: 'Hands-on projects to master LLM concepts.',
    icon: '🧠',
  },

  projects: [
    { id: 'rag', title: 'Build a RAG Chatbot', subtitle: 'Build a complete Retrieval-Augmented Generation pipeline — select components, see outputs, and chat with your documents.', icon: '🤖' },
    { id: 'prompting', title: 'Prompt Engineering & Guardrails Lab', subtitle: 'Master prompt crafting, build safety guardrails, defend against jailbreaks, and assemble a production-ready prompt pipeline.', icon: '🛡️' },
  ],

  assignments: [
    { id: 1, title: 'Enterprise Banking Chatbot', subtitle: 'Design an AI chatbot for HDFC Bank — system prompts, guardrails, intent classification, and deployment strategy.', icon: '🏦', duration: '~45 min' },
    { id: 2, title: 'Social Media Content Moderator', subtitle: 'Build a content moderation system for an Indian social media platform — MEITY compliance, multilingual support, bias detection.', icon: '📱', duration: '~40 min' },
    { id: 3, title: 'Legal Document Intelligence', subtitle: 'Create a legal AI system for an Indian law firm — clause extraction, hallucination prevention, RAG for case law.', icon: '⚖️', duration: '~35 min' },
  ],
}

export default llmCourse
