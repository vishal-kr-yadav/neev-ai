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
  title: 'How AI Actually Works',
  subtitle: 'From tokens to transformers — understand ChatGPT, build RAG pipelines, and master prompt engineering.',
  description: 'Understand how LLMs read, learn, and generate text through interactive visuals, 3D models, and hands-on exercises.',
  icon: '🧠',
  gradient: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  color: '#4f46e5',
  duration: '1 Week · ~10 hrs',
  level: 'All Levels',
  available: true,

  goal: {
    title: 'The Story of This Course',
    vision: "Imagine you're building a house. You wouldn't just start placing bricks randomly — you'd need to understand foundations, walls, plumbing, electricity, and roofing in the right order. This course is your blueprint for AI. Each topic is a brick that builds on the last. By the end, you won't just understand AI — you'll have the complete toolkit to architect AI solutions for any real-world problem. Every concept here is a tool. We're not teaching theory — we're handing you the same engineering skills that teams at OpenAI, Google, and Anthropic use daily.",
    points: [
      'We start with the question everyone asks: "What IS an LLM?" — then immediately show you the first secret: how AI reads your words (Tokenization)',
      'Once you see how AI reads, we reveal the engine (Transformer) and its superpower (Attention) — now you understand the architecture behind ChatGPT',
      'Knowing HOW it works unlocks the real power: Prompt Engineering, building RAG pipelines, detecting hallucinations — the practical skills that create real products',
      'By the end, you can build an AI chatbot for a bank, a content moderation system, or a legal document analyzer — not because you memorized steps, but because you understand every layer',
    ],
    hindiTitle: 'इस कोर्स की कहानी',
    hindiExplanation: 'सोचो तुम एक घर बना रहे हो। पहले foundation (नींव) डालोगे, फिर दीवारें, फिर plumbing, फिर बिजली, फिर छत। अगर सीधे छत लगाने लगो तो घर गिर जाएगा! AI सीखना भी ऐसा ही है। पहले हम समझेंगे कि LLM क्या है (Topic 1) — फिर देखेंगे कि AI हमारे words कैसे पढ़ता है (Tokenization) — फिर engine कैसे काम करता है (Transformer) — फिर उसकी superpower क्या है (Attention) — फिर वो कैसे सीखता है (Training)। यहां तक आते-आते तुम्हें AI की पूरी machine समझ आ जाएगी। फिर हम असली काम करेंगे — Prompt Engineering, RAG pipelines, AI Agents। हर topic पिछले topic पर बनता है, जैसे एक कहानी में हर chapter पिछले से जुड़ा होता है। कोर्स के बाद तुम bank chatbot, content moderation system, या legal AI — कुछ भी बना सकोगे, क्योंकि तुमने हर layer समझी है।',
  },

  topics: [
    // --- Day 1: Foundations (Topics 1-3, ~2.5 hrs) ---
    { id: 1, title: 'What is an LLM?', subtitle: 'Discover what makes a Large Language Model tick — no jargon, just visuals.', icon: '🧠', duration: '~45 min', day: 1, content: Topic1Content, quiz: Topic1Quiz },
    { id: 2, title: 'Tokenization', subtitle: 'See how AI breaks language into tiny building blocks before it can "read".', icon: '🔤', duration: '~45 min', day: 1, content: Topic2Content, quiz: Topic2Quiz,
      storyLink: 'You now know what an LLM is — a giant next-word prediction machine. But here\'s the thing: machines don\'t understand English, Hindi, or any human language. They only understand numbers. So how does ChatGPT "read" your message? It breaks your words into tiny pieces called tokens. This is the very first step — before any intelligence happens, your text must become numbers.' },
    { id: 3, title: 'Transformer Architecture', subtitle: 'The engine behind every modern LLM — explore it layer by layer.', icon: '⚙️', duration: '~50 min', day: 1, content: Topic3Content, quiz: Topic3Quiz,
      storyLink: 'Great — you\'ve seen how AI breaks words into tokens (numbers). But a list of numbers sitting in memory doesn\'t do anything. You need an ENGINE to process these tokens, find patterns between them, and predict what comes next. That engine is called the Transformer — invented in 2017, it\'s the architecture behind every modern AI model.' },

    // --- Day 2: Core Mechanics (Topics 4-5, ~2 hrs) ---
    { id: 4, title: 'Attention Mechanism', subtitle: 'How does AI decide which words matter most? Find out interactively.', icon: '🎯', duration: '~55 min', day: 2, content: Topic4Content, quiz: Topic4Quiz,
      storyLink: 'You\'ve explored the Transformer — layers, embeddings, feed-forward networks. But its real superpower, the invention that changed everything, is one special component inside it: Attention. When you type "The bank near the river", how does AI know "bank" means riverbank and not a financial bank? Attention lets every word look at every other word to understand context.' },
    { id: 5, title: 'Training Process', subtitle: 'From random noise to intelligent conversation — the journey of an LLM.', icon: '🏋️', duration: '~50 min', day: 2, content: Topic5Content, quiz: Topic5Quiz,
      storyLink: 'You now understand the complete machine: tokenization converts text to numbers, the Transformer processes them with Attention to find patterns. But here\'s the question — this machine starts COMPLETELY random. It knows nothing. How does it go from gibberish to writing poetry and code? The answer is training — feeding it trillions of words and letting it learn, one prediction at a time.' },

    // --- Day 3: Using LLMs (Topics 6-8, ~2 hrs) ---
    { id: 6, title: 'Prompt Engineering', subtitle: 'The art of talking to AI — small changes, huge differences.', icon: '💬', duration: '~45 min', day: 3, content: Topic6Content, quiz: Topic6Quiz,
      storyLink: 'You\'ve seen the architecture AND how training works. Here\'s the exciting part: you already have access to trained LLMs — ChatGPT, Claude, Gemini. They\'re ready to use right now. The skill that separates great AI users from average ones? How you talk to it. The same question asked two different ways can give you a useless answer or a brilliant one. This skill is called Prompt Engineering.' },
    { id: 7, title: 'Hallucinations & Limits', subtitle: 'AI is powerful but not perfect. Learn where it breaks.', icon: '⚠️', duration: '~35 min', day: 3, content: Topic7Content, quiz: Topic7Quiz,
      storyLink: 'You\'re getting good at prompting — crafting precise instructions, using system messages, chaining prompts. But here\'s an uncomfortable truth you MUST know before building anything real: AI lies. Confidently. Fluently. It will cite papers that don\'t exist, invent statistics, and give you wrong code that looks perfect. If you don\'t know where AI breaks, you\'ll ship dangerous bugs to production.' },
    { id: 8, title: 'Playground', subtitle: 'Experiment freely — predict words, control randomness, and build intuition.', icon: '🎮', duration: '~40 min', day: 3, content: Topic8Content, quiz: Topic8Quiz,
      storyLink: 'You know the theory — architecture, training, prompting, and where AI fails. Now it\'s time to FEEL it hands-on. The Playground is your sandbox: change temperature and watch outputs go from boring to creative to insane. Adjust max tokens and see how length changes. Build real intuition by experimenting — this is where theory becomes muscle memory.' },

    // --- Day 4: Advanced Techniques (Topics 9-11, ~2 hrs) ---
    { id: 9, title: 'Fine-Tuning & RLHF', subtitle: 'How base models become helpful assistants — from LoRA to human feedback.', icon: '🔧', duration: '~45 min', day: 4, content: Topic9Content, quiz: Topic9Quiz,
      storyLink: 'You\'ve used pre-trained models in the Playground and know their strengths and limits. But what if you need AI that speaks YOUR domain — medical terminology, legal jargon, your company\'s internal knowledge? The base model is general-purpose. Fine-tuning makes it specialized — and RLHF is how raw models become helpful, harmless assistants like ChatGPT.' },
    { id: 10, title: 'Major LLM Models', subtitle: 'GPT-4, Claude, Gemini, Llama, Mistral — compare them all.', icon: '🏆', duration: '~35 min', day: 4, content: Topic10Content, quiz: Topic10Quiz,
      storyLink: 'You understand how LLMs are built, trained, and fine-tuned. But the market has dozens of models — GPT-4, Claude, Gemini, Llama, Mistral, Phi. Each has different strengths: some are cheaper, some are smarter, some run on your laptop. Which one should you pick for YOUR use case? This topic is your comparison guide.' },
    { id: 11, title: 'Multimodal AI & Vision', subtitle: 'LLMs that can see images, hear audio, and understand video.', icon: '👁️', duration: '~40 min', day: 4, content: Topic11Content, quiz: Topic11Quiz,
      storyLink: 'So far, everything we\'ve built understands only text. But the real world is visual — images, documents with charts, screenshots, videos. The next evolution of AI isn\'t just reading your words — it\'s SEEING your world. Multimodal models combine the language understanding you\'ve learned with vision capabilities.' },

    // --- Day 5: Frontier AI (Topics 12-14, ~2 hrs) ---
    { id: 12, title: 'Image Generation', subtitle: 'How AI creates images from text — diffusion, DALL-E, Stable Diffusion.', icon: '🎨', duration: '~40 min', day: 5, content: Topic12Content, quiz: Topic12Quiz,
      storyLink: 'You\'ve seen AI that can UNDERSTAND images — describe what\'s in a photo, read charts, analyze screenshots. But what about CREATING images from nothing? Type "a cat riding a bicycle on Mars" and get a photorealistic image in seconds. This is generative AI for visuals — and the technology behind it (diffusion models) is beautifully different from Transformers.' },
    { id: 13, title: 'Embeddings & Vectors', subtitle: 'The secret language of AI — how meaning becomes numbers.', icon: '📐', duration: '~45 min', day: 5, content: Topic13Content, quiz: Topic13Quiz,
      storyLink: 'We\'ve covered text understanding, image understanding, and image generation. But there\'s a hidden layer powering ALL of this — and it\'s the key to building real AI products like search engines and RAG chatbots. Embeddings convert meaning into numbers (vectors) so that "king" is close to "queen" but far from "bicycle". This is how AI remembers and retrieves knowledge.' },
    { id: 14, title: 'AI Agents & Tool Use', subtitle: 'When LLMs can browse, code, and take actions in the real world.', icon: '🤖', duration: '~40 min', day: 5, content: Topic14Content, quiz: Topic14Quiz,
      storyLink: 'Embeddings let AI search and retrieve knowledge from documents. But what if AI could go further — browse the web, run code, call APIs, book flights, and take real actions in the world? That\'s the leap from "AI as a chatbot" to "AI as an agent." This is the frontier of AI right now — autonomous systems that think, plan, and act.' },

    // --- Day 6-7: Ethics, Projects & Assignments (Topics 15-16 + Projects + Assignments) ---
    { id: 15, title: 'Open vs Closed Source', subtitle: 'Llama, Mistral, GPT-4 — which approach wins and when?', icon: '🔓', duration: '~35 min', day: 6, content: Topic15Content, quiz: Topic15Quiz,
      storyLink: 'You now have the full technical toolkit: architecture, training, prompting, vision, embeddings, agents. Before you build your product, there\'s a critical business decision: do you use OpenAI\'s API (powerful but you depend on them and pay per call) or run Llama/Mistral on your own servers (free but you manage everything)? This choice affects cost, privacy, control, and performance.' },
    { id: 16, title: 'AI Safety & Future', subtitle: 'Ethics, bias, alignment, and what comes next for AI.', icon: '🛡️', duration: '~40 min', day: 6, content: Topic16Content, quiz: Topic16Quiz,
      storyLink: 'You\'ve mastered how AI works, how to use it, and how to choose and deploy models. The final and most important piece: responsibility. AI trained on internet data inherits biases. AI that generates text can spread misinformation. AI agents that take actions can cause real harm. Before you ship anything, you need to understand safety, alignment, and the ethical guardrails that separate helpful AI from dangerous AI.' },
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
