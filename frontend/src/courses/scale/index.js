import Topic1Content from './topics/Topic1_CPU'
import Topic1Quiz from './quizzes/Quiz1_CPU'
import Topic2Content from './topics/Topic2_MemoryIO'
import Topic2Quiz from './quizzes/Quiz2_MemoryIO'
import Topic3Content from './topics/Topic3_ScalingStrategies'
import Topic3Quiz from './quizzes/Quiz3_Scaling'
import Topic4Content from './topics/Topic4_Threading'
import Topic4Quiz from './quizzes/Quiz4_Threading'
import Topic5Content from './topics/Topic5_MultiProcessing'
import Topic5Quiz from './quizzes/Quiz5_MultiProcessing'
import Topic6Content from './topics/Topic6_FastAPI'
import Topic6Quiz from './quizzes/Quiz6_FastAPI'
import Topic7Content from './topics/Topic7_RequestAnatomy'
import Topic7Quiz from './quizzes/Quiz7_RequestAnatomy'
import Topic8Content from './topics/Topic8_Percentiles'
import Topic8Quiz from './quizzes/Quiz8_Percentiles'
import Topic9Content from './topics/Topic9_ScalingSimulator'
import Topic9Quiz from './quizzes/Quiz9_ScalingSimulator'
import Topic10Content from './topics/Topic10_Optimization'
import Topic10Quiz from './quizzes/Quiz10_Optimization'
import Topic11Content from './topics/Topic11_Environments'
import Topic11Quiz from './quizzes/Quiz11_Environments'
import Topic12Content from './topics/Topic12_GitFundamentals'
import Topic12Quiz from './quizzes/Quiz12_Git'
import Topic13Content from './topics/Topic13_BranchingCI'
import Topic13Quiz from './quizzes/Quiz13_BranchingCI'
import Topic14Content from './topics/Topic14_DBConnections'
import Topic14Quiz from './quizzes/Quiz14_DBConnections'
import Topic15Content from './topics/Topic15_Indexing'
import Topic15Quiz from './quizzes/Quiz15_Indexing'
import Topic16Content from './topics/Topic16_Sharding'
import Topic16Quiz from './quizzes/Quiz16_Sharding'

const scaleCourse = {
  id: 'scale',
  title: 'Scaling Systems',
  subtitle: 'From localhost to 10K concurrent users — master the engineering behind production-grade systems.',
  description: 'Understand CPU cores, threading, capacity planning, scaling strategies, deployment, and Git through interactive simulations and real-world math.',
  icon: '🚀',
  gradient: 'linear-gradient(135deg, #059669, #10b981)',
  color: '#059669',
  duration: '2 Weeks · ~19 hrs',
  level: 'Intermediate',
  available: true,

  goal: {
    title: 'The Story of This Course',
    vision: "You've built an app. It works perfectly on your laptop. You demo it, everyone loves it, and then — you deploy. Suddenly, 1,000 users hit it at once and everything crashes. Why? Because building an app and running an app at scale are completely different skills. This course is the journey from 'it works on my machine' to 'it handles 10,000 users in production.' Each topic builds on the last — we start at the hardware level (CPU, memory), zoom into your code (threading, async), then zoom out to infrastructure (deployment, databases). By the end, you'll have the complete engineering toolkit to design, deploy, and scale production systems.",
    points: [
      'We start where software meets hardware: CPU cores, memory, I/O — because you can\'t fix performance if you don\'t understand the machine your code runs on',
      'Then we zoom into your code: threading, multiprocessing, async — and do the exact math to calculate how many requests your server can handle',
      'Next, the deployment pipeline: Git, branching, CI/CD, environments — how real teams ship code from laptop to production without breaking things',
      'Finally, the database layer: connection pooling, indexing, sharding — because at scale, the database is always the bottleneck',
    ],
    hindiTitle: 'इस कोर्स की कहानी',
    hindiExplanation: 'सोचो तुमने एक app बनाया। Localhost पर perfectly चलता है। Demo दिया, सबको पसंद आया, deploy किया — और 1,000 users ने एक साथ hit किया तो crash हो गया! क्यों? क्योंकि app बनाना और app को scale पर चलाना — दो अलग skills हैं। यह कोर्स उस gap को भरता है। हम नीचे से शुरू करेंगे — CPU कैसे काम करता है, memory कहां bottleneck बनती है (Topic 1-2)। फिर code level — threading, multiprocessing, FastAPI workers (Topic 4-6)। फिर exact math — 10,000 users के लिए कितने servers चाहिए (Topic 7-10)। फिर deployment — Git, CI/CD, environments (Topic 11-13)। और finally database — connection pooling, indexing, sharding (Topic 14-16)। हर topic पिछले पर बनता है। कोर्स के बाद तुम confidently production systems design, deploy, और scale कर पाओगे — क्योंकि तुमने हर layer समझी है।',
  },

  topics: [
    // --- Module 1: System Foundations (Day 1-2, ~3 hrs) ---
    { id: 1, title: 'CPU, Cores & Execution', subtitle: 'How your computer actually runs code — cores, clock speed, and task scheduling.', icon: '🖥️', duration: '~55 min', day: 1, content: Topic1Content, quiz: Topic1Quiz },
    { id: 2, title: 'Memory & I/O Bottlenecks', subtitle: 'RAM, heap, disk, network — where your application really slows down.', icon: '💾', duration: '~50 min', day: 1, content: Topic2Content, quiz: Topic2Quiz,
      storyLink: 'You now understand how your CPU runs code — cores, threads, clock cycles. But here\'s the truth most developers miss: the CPU is almost never your bottleneck. Your app spends most of its time WAITING — waiting for memory, waiting for disk, waiting for network. These I/O bottlenecks are where your application actually slows down, and understanding them changes how you write code.' },
    { id: 3, title: 'Scaling Strategies', subtitle: 'Vertical vs horizontal, dedicated vs autoscale — choose your growth path.', icon: '📈', duration: '~55 min', day: 2, content: Topic3Content, quiz: Topic3Quiz,
      storyLink: 'You\'ve mapped the hardware landscape: CPU, memory, disk, network. You know WHERE bottlenecks happen. Now the big strategic question: when your single server can\'t handle the load anymore, what do you do? Buy a bigger machine (vertical scaling) or add more machines (horizontal scaling)? This decision shapes your entire architecture — and getting it wrong costs thousands of dollars.' },

    // --- Module 2: Concurrency Deep Dive (Day 3-4, ~3 hrs) ---
    { id: 4, title: 'Threading & Python\'s GIL', subtitle: 'Why Python threads lie to you — and when they actually help.', icon: '🧵', duration: '~55 min', day: 3, content: Topic4Content, quiz: Topic4Quiz,
      storyLink: 'You chose your scaling strategy. But before adding more servers (which costs money), let\'s squeeze maximum performance from ONE machine first. Threading promises parallelism — do 4 things at once on 4 cores! But in Python, there\'s a nasty surprise called the GIL (Global Interpreter Lock) that changes everything. Understanding this is critical before you design any Python backend.' },
    { id: 5, title: 'Multi-processing & True Parallelism', subtitle: 'Break free from the GIL — real parallelism with multiple processes.', icon: '⚡', duration: '~50 min', day: 3, content: Topic5Content, quiz: Topic5Quiz,
      storyLink: 'The GIL means Python threads can\'t truly run in parallel for CPU work. So how does Python achieve real parallelism? The answer: separate processes, each with its own Python interpreter and its own GIL. It\'s like hiring 4 separate chefs instead of trying to make 1 chef use 4 hands. More overhead, but true parallel execution.' },
    { id: 6, title: 'FastAPI Under the Hood', subtitle: '2 workers, 2 vCPUs — exactly how many requests can you handle?', icon: '🔧', duration: '~55 min', day: 4, content: Topic6Content, quiz: Topic6Quiz,
      storyLink: 'You understand threading and multiprocessing in theory. But how does your web framework actually USE these? When you deploy FastAPI with `workers=2` on a machine with 2 vCPUs, exactly how many requests can you handle per second? This topic does the real math — no hand-waving, actual numbers you can use for capacity planning.' },

    // --- Module 3: Capacity Planning (Day 5-7, ~4 hrs) ---
    { id: 7, title: 'Anatomy of a Production Request', subtitle: 'Auth → Embedding → Vector Search → LLM — trace a real RAG request end-to-end.', icon: '🔬', duration: '~50 min', day: 5, content: Topic7Content, quiz: Topic7Quiz,
      storyLink: 'You can calculate how many requests one server handles. But a real production request isn\'t just "receive HTTP → send response." It\'s a chain: Auth check (20ms) → Generate Embedding (50ms) → Vector Search (30ms) → LLM Call (2000ms) → Format Response (5ms). Each step has its own latency and failure modes. Let\'s trace a real request end-to-end.' },
    { id: 8, title: 'Latency Percentiles & SLAs', subtitle: 'P50, P90, P99 — the numbers that decide if your app feels fast or broken.', icon: '📊', duration: '~55 min', day: 5, content: Topic8Content, quiz: Topic8Quiz,
      storyLink: 'You\'ve traced a full request pipeline and know each step\'s latency. But how do you measure if the overall experience is "fast enough"? Here\'s the trap: average latency LIES to you. If 99 users get 100ms and 1 user gets 10 seconds, the average is 199ms — sounds fine! But that 1 user is furious. The real metrics are P50, P90, P99 — the numbers that decide if users stay or leave.' },
    { id: 9, title: 'From 100 to 10,000 Users', subtitle: 'Watch your servers struggle in real-time as load increases — and learn to fix it.', icon: '🌊', duration: '~60 min', day: 6, content: Topic9Content, quiz: Topic9Quiz,
      storyLink: 'You can measure latency, trace requests, and calculate per-server capacity. Now let\'s put it all together: watch a live simulation of your infrastructure as user load goes from 100 → 500 → 1,000 → 5,000 → 10,000. See exactly where things break, which server maxes out first, and what interventions save the day.' },
    { id: 10, title: 'The Optimization Playbook', subtitle: 'Caching, pooling, async, batching — the toolkit that makes scale possible.', icon: '🛠️', duration: '~55 min', day: 7, content: Topic10Content, quiz: Topic10Quiz,
      storyLink: 'You watched servers buckle under 10,000 users. You saw the bottlenecks — CPU saturation, memory pressure, connection exhaustion. Now the toolkit to fix ALL of it: caching (avoid redundant work), connection pooling (reuse expensive connections), async I/O (stop blocking), and request batching (do more with less). These four techniques are what make scale possible.' },

    // --- Module 4: Deployment & Git (Day 8-10, ~4 hrs) ---
    { id: 11, title: 'Deployment Environments', subtitle: 'DEV → Staging → UAT → Production — why each gate exists and how code moves through.', icon: '🚀', duration: '~50 min', day: 8, content: Topic11Content, quiz: Topic11Quiz,
      storyLink: 'You can now build and optimize a scalable application. But how does your code actually get from your laptop to production servers where real users access it? You don\'t just copy files — code moves through a pipeline of environments: DEV → Staging → UAT → Production. Each gate exists to catch different types of bugs before they reach users.' },
    { id: 12, title: 'Git — The Complete Guide', subtitle: 'Commits, branches, merges, conflicts — master version control visually.', icon: '🌳', duration: '~60 min', day: 9, content: Topic12Content, quiz: Topic12Quiz,
      storyLink: 'Your code moves through environments on its way to production. But here\'s the challenge: you\'re not working alone. Five developers are all changing the same codebase simultaneously. How do you prevent chaos? Version control with Git. Most developers use 10% of Git\'s power — this topic gives you the full toolkit, visually.' },
    { id: 13, title: 'Branching Strategy & CI/CD', subtitle: 'Gitflow, GitHub Flow, pipelines — how real teams ship code to production.', icon: '🔄', duration: '~55 min', day: 10, content: Topic13Content, quiz: Topic13Quiz,
      storyLink: 'You know Git — commits, branches, merges, conflict resolution. Now the team-level question: how should branches be organized? When should code merge to main? How do tests run automatically before every merge? And how does merged code automatically deploy to staging and production? This is CI/CD — the automated pipeline that ships code safely, dozens of times per day.' },

    // --- Module 5: Database Scalability (Day 11-12, ~3 hrs) ---
    { id: 14, title: 'Database Connections & Connection Pooling', subtitle: 'Dedicated vs pooled connections, code-level management in Python, and why your app crashes at 100 users.', icon: '🔌', duration: '~55 min', day: 11, content: Topic14Content, quiz: Topic14Quiz,
      storyLink: 'Your app is deployed with CI/CD. Users are flowing in. But every single request hits the database — and each database connection costs real resources (memory, CPU, a process on PostgreSQL). At 100 concurrent users, your database starts choking because it\'s opening and closing connections for every request. The fix is connection pooling — and getting it right is the difference between an app that crashes and one that scales.' },
    { id: 15, title: 'Database Indexing & Query Performance', subtitle: 'B-Trees, compound indexes, explain plans — why your query takes 3 seconds and how to make it take 3ms.', icon: '📑', duration: '~55 min', day: 11, content: Topic15Content, quiz: Topic15Quiz,
      storyLink: 'You fixed connection pooling — your app efficiently reuses database connections. But now users are complaining: "search is slow", "the product list takes forever to load." The connections are fine, but your QUERIES are scanning millions of rows one by one. The fix? Indexes — like the index at the back of a textbook, they let the database jump straight to the right data instead of reading every page.' },
    { id: 16, title: 'Sharding, Replication & Scaling Limits', subtitle: 'When one server is not enough — horizontal partitioning, read replicas, and the hard limits of SQL and NoSQL.', icon: '🗄️', duration: '~60 min', day: 12, content: Topic16Content, quiz: Topic16Quiz,
      storyLink: 'Connection pooling keeps connections efficient. Indexes keep queries fast. But what happens when your single database server simply cannot hold all your data or handle all your traffic? You\'ve hit the ceiling of vertical scaling for databases. The next step: split your data across multiple servers (sharding) and distribute read traffic (replicas). This is where database architecture gets serious — and where you must understand the hard limits of both SQL and NoSQL.' },
  ],

  project: null,
  projects: [],

  assignments: [
    { id: 1, title: 'Scale a RAG Application', subtitle: 'Given a RAG app doing 2.5s per request — design the infrastructure to handle 10K concurrent users within budget.', icon: '🏗️', duration: '~45 min' },
    { id: 2, title: 'Deploy to Production', subtitle: 'Design a complete deployment pipeline — environments, branching strategy, CI/CD, and rollback plan for an e-commerce platform.', icon: '🚀', duration: '~40 min' },
    { id: 3, title: 'Git Workflow Challenge', subtitle: 'Resolve merge conflicts, design branching strategy, and set up CI/CD for a 5-developer team building a fintech app.', icon: '🌳', duration: '~35 min' },
    { id: 4, title: 'Database Scaling for BookKart', subtitle: 'Design connection pooling, indexing, sharding, and replica strategy for an e-commerce platform hitting 2M users.', icon: '🗄️', duration: '~45 min' },
  ],
}

export default scaleCourse
