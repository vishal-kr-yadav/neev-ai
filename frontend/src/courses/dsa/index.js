import Topic1Content from './topics/Topic1_WhatIsAlgorithm'
import Topic1Quiz from './quizzes/Quiz1_Algorithm'
import Topic2Content from './topics/Topic2_ArraysMemory'
import Topic2Quiz from './quizzes/Quiz2_Arrays'
import Topic3Content from './topics/Topic3_BigO'
import Topic3Quiz from './quizzes/Quiz3_BigO'
import Topic4Content from './topics/Topic4_BubbleSort'
import Topic4Quiz from './quizzes/Quiz4_BubbleSort'
import Topic5Content from './topics/Topic5_SelectionInsertionSort'
import Topic5Quiz from './quizzes/Quiz5_SelectionInsertion'
import Topic6Content from './topics/Topic6_MergeSort'
import Topic6Quiz from './quizzes/Quiz6_MergeSort'
import Topic7Content from './topics/Topic7_QuickSort'
import Topic7Quiz from './quizzes/Quiz7_QuickSort'
import Topic8Content from './topics/Topic8_BinarySearch'
import Topic8Quiz from './quizzes/Quiz8_BinarySearch'
import Topic9Content from './topics/Topic9_Stacks'
import Topic9Quiz from './quizzes/Quiz9_Stacks'
import Topic10Content from './topics/Topic10_Queues'
import Topic10Quiz from './quizzes/Quiz10_Queues'
import Topic11Content from './topics/Topic11_LinkedLists'
import Topic11Quiz from './quizzes/Quiz11_LinkedLists'
import Topic12Content from './topics/Topic12_HashMaps'
import Topic12Quiz from './quizzes/Quiz12_HashMaps'
import Topic13Content from './topics/Topic13_Recursion'
import Topic13Quiz from './quizzes/Quiz13_Recursion'
import Topic14Content from './topics/Topic14_BinaryTrees'
import Topic14Quiz from './quizzes/Quiz14_BinaryTrees'
import Topic15Content from './topics/Topic15_BST'
import Topic15Quiz from './quizzes/Quiz15_BST'
import Topic16Content from './topics/Topic16_Heaps'
import Topic16Quiz from './quizzes/Quiz16_Heaps'
import Topic17Content from './topics/Topic17_Graphs'
import Topic17Quiz from './quizzes/Quiz17_Graphs'
import Topic18Content from './topics/Topic18_BFS_DFS'
import Topic18Quiz from './quizzes/Quiz18_BFS_DFS'
import Topic19Content from './topics/Topic19_Dijkstra'
import Topic19Quiz from './quizzes/Quiz19_Dijkstra'
import Topic20Content from './topics/Topic20_DynamicProgramming'
import Topic20Quiz from './quizzes/Quiz20_DP'
import Topic21Content from './topics/Topic21_GreedyAlgorithms'
import Topic21Quiz from './quizzes/Quiz21_Greedy'
import Topic22Content from './topics/Topic22_TwoPointers'
import Topic22Quiz from './quizzes/Quiz22_TwoPointers'
import Topic23Content from './topics/Topic23_SQL_Basics'
import Topic23Quiz from './quizzes/Quiz23_SQL_Basics'
import Topic24Content from './topics/Topic24_SQL_Joins'
import Topic24Quiz from './quizzes/Quiz24_SQL_Joins'
import Topic25Content from './topics/Topic25_SQL_Advanced'
import Topic25Quiz from './quizzes/Quiz25_SQL_Advanced'

const dsaCourse = {
  id: 'dsa',
  title: 'Think Like a Programmer',
  subtitle: 'Master problem-solving through visual algorithms — no coding required, just pure thinking.',
  description: 'Learn DSA & SQL through interactive visualizations, pseudo-code thinking, and real-world problem solving. See algorithms run, not read about them.',
  icon: '🧩',
  gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
  color: '#f59e0b',
  duration: '3 Weeks · ~30 hrs',
  level: 'All Levels',
  available: true,

  goal: {
    title: 'The Story of This Course',
    vision: "Everyone\'s using ChatGPT and Claude to write code now. So is programming dead? Absolutely not. AI writes CODE — but YOU solve PROBLEMS. When a client says \"our delivery system is too slow\", AI can\'t figure out that you need Dijkstra\'s shortest path algorithm. When your database query takes 30 seconds, AI won\'t know to add a B-Tree index unless YOU tell it. This course gives you the problem-solving BRAIN — the ability to look at any problem and think: \"I\'ve seen this pattern before. This is a graph problem. This needs dynamic programming.\" You won\'t write a single line of code. Instead, you\'ll THINK through problems visually, trace algorithms step-by-step, and build the intuition that separates a prompt-copy-paster from a real engineer.",
    points: [
      'We start with the most fundamental question: What IS an algorithm? Then we show you how data lives in memory — because you can\'t solve problems if you don\'t understand the building blocks',
      'Then sorting and searching — not to memorize code, but to SEE how different strategies (divide & conquer, partitioning, halving) solve the same problem at wildly different speeds',
      'Data structures are your toolkit: stacks, queues, hash maps, trees, graphs. Each one exists because arrays weren\'t enough for a specific type of problem. We teach you WHEN to reach for each tool',
      'By the end, you\'ll look at any problem — from GPS navigation to social network suggestions to database optimization — and immediately see the algorithm hiding inside it',
    ],
    hindiTitle: 'इस कोर्स की कहानी',
    hindiExplanation: 'आजकल सब ChatGPT से code लिखवा रहे हैं। तो क्या programming खत्म हो गई? बिल्कुल नहीं! AI CODE लिखता है — लेकिन PROBLEM तुम solve करते हो। जब client बोले "हमारी delivery system slow है", तो AI को कैसे पता कि Dijkstra\'s algorithm चाहिए? जब database query 30 seconds ले, तो AI कैसे बोलेगा "B-Tree index लगाओ" — जब तक तुम नहीं बताओगे? यह कोर्स तुम्हें वो problem-solving BRAIN देता है। हम एक भी line of code नहीं लिखेंगे। बस VISUAL तरीके से algorithms देखेंगे, step-by-step trace करेंगे, और वो intuition बनाएंगे जो एक real engineer को prompt-copy-paster से अलग करती है। Sorting, Searching, Trees, Graphs, Dynamic Programming, SQL — सब कुछ interactive animations से सीखोगे। कोर्स के बाद तुम कोई भी problem देखोगे और तुरंत बोलोगे: "यह graph problem है", "इसमें greedy algorithm लगेगा", "यहां hash map चाहिए।"',
  },

  topics: [
    // --- Module 1: Foundations (Day 1-2, ~3.5 hrs) ---
    { id: 1, title: 'What is an Algorithm?', subtitle: 'Before code, before AI — every solution starts with a step-by-step plan.', icon: '🧩', duration: '~45 min', day: 1, content: Topic1Content, quiz: Topic1Quiz },
    { id: 2, title: 'Arrays & How Memory Works', subtitle: 'Where your data actually lives — slots, addresses, and why position matters.', icon: '📦', duration: '~50 min', day: 1, content: Topic2Content, quiz: Topic2Quiz,
      storyLink: 'You now know what an algorithm is — a step-by-step recipe to solve a problem. But every recipe needs INGREDIENTS. In programming, your ingredients are DATA — and the most fundamental way to store data is an Array. Think of it as a row of boxes in memory, each with an address. Understanding arrays is understanding the foundation everything else is built on.' },
    { id: 3, title: 'Big O Notation', subtitle: 'Is your solution fast or slow? This simple math tells you — before you even run it.', icon: '⏱️', duration: '~50 min', day: 2, content: Topic3Content, quiz: Topic3Quiz,
      storyLink: 'You can create arrays and design algorithms. But here\'s the critical question: how do you know if your solution is GOOD? If sorting 100 items takes 1 second, will sorting 1 million items take 10 seconds or 10 HOURS? Big O notation is the universal language engineers use to measure algorithm speed — and it\'s the first thing interviewers test.' },

    // --- Module 2: Sorting Algorithms (Day 3-5, ~4 hrs) ---
    { id: 4, title: 'Bubble Sort', subtitle: 'The simplest sort — watch elements bubble up to their correct position.', icon: '🫧', duration: '~45 min', day: 3, content: Topic4Content, quiz: Topic4Quiz,
      storyLink: 'You understand Big O — O(n²) is slow, O(n log n) is fast. But those are just letters and numbers. Now let\'s SEE what they actually MEAN. Bubble Sort is the simplest sorting algorithm: compare neighbors, swap if wrong, repeat. It\'s O(n²) — and you\'re about to see WHY that\'s painfully slow with your own eyes.' },
    { id: 5, title: 'Selection Sort & Insertion Sort', subtitle: 'Two more simple strategies — find the minimum, or insert in place.', icon: '🔍', duration: '~50 min', day: 3, content: Topic5Content, quiz: Topic5Quiz,
      storyLink: 'Bubble Sort swaps neighbors until everything is sorted. But what if instead of bubbling, you just FIND the smallest element and put it first? That\'s Selection Sort. Or what if you pick each element and INSERT it into its correct position in a growing sorted section? That\'s Insertion Sort. Same goal, different strategies — and you\'ll see which one wins.' },
    { id: 6, title: 'Merge Sort', subtitle: 'Divide the problem in half, solve each half, merge them back — O(n log n) magic.', icon: '🔀', duration: '~55 min', day: 4, content: Topic6Content, quiz: Topic6Quiz,
      storyLink: 'Bubble Sort, Selection Sort, Insertion Sort — all O(n²). For 1 million items, that\'s a TRILLION operations. Can we do better? YES. The trick: stop trying to sort the whole array at once. Split it in half. Sort each half (by splitting again!). Then merge the sorted halves. This "divide and conquer" idea drops sorting from O(n²) to O(n log n) — from 1 trillion operations to just 20 million.' },
    { id: 7, title: 'Quick Sort', subtitle: 'Pick a pivot, partition around it — the fastest sort in practice.', icon: '⚡', duration: '~55 min', day: 4, content: Topic7Content, quiz: Topic7Quiz,
      storyLink: 'Merge Sort splits first, then merges. Quick Sort flips the idea: PARTITION first (put small items left, big items right of a "pivot"), then recursively sort each side. No merging needed! In practice, Quick Sort is often the fastest sorting algorithm — which is why most programming languages use it internally. But it has a dangerous worst case...' },

    // --- Module 3: Searching (Day 5, ~1 hr) ---
    { id: 8, title: 'Binary Search', subtitle: 'Why search one-by-one when you can cut the problem in HALF every step?', icon: '🎯', duration: '~50 min', day: 5, content: Topic8Content, quiz: Topic8Quiz,
      storyLink: 'You can now sort data efficiently. But what about FINDING something in sorted data? Checking every element is O(n) — for 1 million items, that\'s 1 million checks. Binary Search does it in just 20 checks. How? Open a dictionary to the middle. Is your word before or after? Eliminate half. Repeat. This is the most important search algorithm in computer science.' },

    // --- Module 4: Core Data Structures (Day 6-8, ~4 hrs) ---
    { id: 9, title: 'Stacks', subtitle: 'Last In, First Out — the undo button, the back button, the call stack.', icon: '📚', duration: '~50 min', day: 6, content: Topic9Content, quiz: Topic9Quiz,
      storyLink: 'Arrays let you store data in a line. Sorting and searching let you organize and find it. But some real-world problems need data that behaves in a specific way. A stack of plates: you always take from the TOP. Undo in Word: you always undo the LAST action. Browser back button: you go to the LAST page. This pattern is called a Stack — Last In, First Out.' },
    { id: 10, title: 'Queues', subtitle: 'First In, First Out — the fair waiting line, the printer queue, the task scheduler.', icon: '🚶‍♂️', duration: '~45 min', day: 6, content: Topic10Content, quiz: Topic10Quiz,
      storyLink: 'Stacks process the LAST item first (LIFO). But what about fairness? When you stand in a movie ticket line, the person who came FIRST gets served first. That\'s a Queue — First In, First Out (FIFO). Printer queues, task schedulers, message queues in WhatsApp — all use this pattern. And it\'s essential for graph algorithms you\'ll learn later.' },
    { id: 11, title: 'Linked Lists', subtitle: 'A chain of connected nodes — when arrays aren\'t flexible enough.', icon: '🔗', duration: '~55 min', day: 7, content: Topic11Content, quiz: Topic11Quiz,
      storyLink: 'Arrays store elements in a continuous block of memory. That\'s great for random access (give me element #500!) but terrible for inserting or deleting in the middle — you have to shift everything. A Linked List solves this: each element (node) stores its data AND a pointer to the next node. Inserting? Just change two pointers. No shifting. The tradeoff? You lose random access.' },
    { id: 12, title: 'Hash Maps', subtitle: 'The magic of O(1) lookup — how dictionaries, caches, and indexes actually work.', icon: '🗝️', duration: '~55 min', day: 7, content: Topic12Content, quiz: Topic12Quiz,
      storyLink: 'Arrays: O(1) access by index, but you need to know the position. Linked Lists: fast insertion, but O(n) to find something. What if you could look up ANY value in O(1) — constant time, regardless of size? Hash Maps use a clever trick: run the key through a "hash function" that converts it to an array index. This is the #1 most-used data structure in coding interviews.' },

    // --- Module 5: Recursion & Trees (Day 9-11, ~4 hrs) ---
    { id: 13, title: 'Recursion', subtitle: 'When a function calls itself — the mind-bending trick behind trees, graphs, and DP.', icon: '🪞', duration: '~55 min', day: 9, content: Topic13Content, quiz: Topic13Quiz,
      storyLink: 'You\'ve mastered the core data structures: arrays, stacks, queues, linked lists, hash maps. Now a concept that ties EVERYTHING together: recursion. When a function calls itself to solve a smaller version of the same problem. It sounds impossible, but it\'s the key to understanding trees, graphs, sorting (Merge Sort and Quick Sort use it!), and dynamic programming. Master recursion and the next 7 topics become easy.' },
    { id: 14, title: 'Binary Trees', subtitle: 'Data organized like a family tree — the foundation of databases, file systems, and AI.', icon: '🌳', duration: '~55 min', day: 9, content: Topic14Content, quiz: Topic14Quiz,
      storyLink: 'Recursion breaks big problems into smaller identical sub-problems. Trees ARE recursion in data form: every tree is a root node with two smaller trees (left and right). Your file system is a tree. HTML is a tree. Database indexes are trees. Family trees, org charts, decision trees — the real world is full of hierarchies, and Binary Trees are how we represent them in code.' },
    { id: 15, title: 'Binary Search Trees', subtitle: 'A sorted tree — search, insert, delete, all in O(log n).', icon: '🔎', duration: '~50 min', day: 10, content: Topic15Content, quiz: Topic15Quiz,
      storyLink: 'Binary Trees organize data hierarchically, but there\'s no ordering rule — finding a specific value means checking every node (O(n)). What if we ADD a rule: left child is always smaller, right child is always larger? Now searching becomes like Binary Search: go left or right at each step. O(log n). This is a Binary Search Tree — the engine behind database indexes and in-memory sorted containers.' },
    { id: 16, title: 'Heaps & Priority Queues', subtitle: 'The VIP line — always know the minimum (or maximum) in O(1).', icon: '⛰️', duration: '~50 min', day: 10, content: Topic16Content, quiz: Topic16Quiz,
      storyLink: 'BSTs give O(log n) for search, insert, and delete. But what if you only care about ONE thing: what\'s the SMALLEST (or LARGEST) element? A hospital ER doesn\'t sort all patients — it just needs the most critical one NEXT. A Heap is a tree where the parent is always smaller than children (min-heap). Finding the minimum? O(1). Always. This powers priority queues, job schedulers, and Dijkstra\'s algorithm.' },

    // --- Module 6: Graphs (Day 12-14, ~4 hrs) ---
    { id: 17, title: 'Graphs', subtitle: 'Networks, maps, social connections — when trees aren\'t enough.', icon: '🕸️', duration: '~50 min', day: 12, content: Topic17Content, quiz: Topic17Quiz,
      storyLink: 'Trees connect nodes in a hierarchy — each node has one parent. But the real world isn\'t always hierarchical. Friends connect to friends (social networks). Cities connect to cities (road maps). Tasks depend on tasks (project planning). When ANY node can connect to ANY other node, you have a Graph. Graphs are arguably the most important data structure in computer science — and they\'re everywhere.' },
    { id: 18, title: 'BFS & DFS', subtitle: 'Two ways to explore a graph — level-by-level or deep-dive-first.', icon: '🧭', duration: '~55 min', day: 12, content: Topic18Content, quiz: Topic18Quiz,
      storyLink: 'You have a graph — nodes and edges. But how do you EXPLORE it? Find all connected friends? Check if two cities are reachable? Two fundamental strategies: BFS (Breadth-First Search) explores level by level, like ripples in a pond — it finds the SHORTEST path. DFS (Depth-First Search) goes as deep as possible first, like exploring a maze — it\'s great for detecting cycles and finding paths.' },
    { id: 19, title: 'Dijkstra\'s Shortest Path', subtitle: 'How Google Maps finds the fastest route — the algorithm that powers GPS.', icon: '🗺️', duration: '~55 min', day: 13, content: Topic19Content, quiz: Topic19Quiz,
      storyLink: 'BFS finds the shortest path when all edges have equal weight. But roads have DIFFERENT distances — Mumbai to Pune is 150km, but Mumbai to Delhi is 1,400km. You need an algorithm that considers edge weights. Dijkstra\'s algorithm does exactly this: it finds the shortest path from one node to ALL other nodes, always picking the cheapest unexplored node next. This is literally how GPS navigation works.' },

    // --- Module 7: Advanced Patterns (Day 15-16, ~3.5 hrs) ---
    { id: 20, title: 'Dynamic Programming', subtitle: 'The hardest interview topic — broken down into visual, intuitive steps.', icon: '🧮', duration: '~60 min', day: 15, content: Topic20Content, quiz: Topic20Quiz,
      storyLink: 'Dijkstra finds optimal paths in graphs. But what about finding the OPTIMAL solution to any problem — minimum cost, maximum profit, number of ways? Dynamic Programming (DP) is the most feared interview topic, but the idea is simple: if you\'ve already solved a sub-problem, don\'t solve it again — REMEMBER the answer. We\'ll make this visual and intuitive, not scary.' },
    { id: 21, title: 'Greedy Algorithms', subtitle: 'Make the best choice at each step — sometimes that\'s enough to win.', icon: '🤑', duration: '~45 min', day: 15, content: Topic21Content, quiz: Topic21Quiz,
      storyLink: 'DP considers ALL possible choices to find the optimal answer — that\'s powerful but sometimes overkill. Greedy algorithms take a shortcut: at each step, just pick the BEST option right now. Making change? Pick the largest coin that fits. Scheduling meetings? Pick the one that ends earliest. Greedy doesn\'t always give the optimal answer — but when it does, it\'s beautifully simple and fast.' },
    { id: 22, title: 'Two Pointers & Sliding Window', subtitle: 'The #1 interview pattern — solve array problems in O(n) instead of O(n²).', icon: '👉👈', duration: '~50 min', day: 16, content: Topic22Content, quiz: Topic22Quiz,
      storyLink: 'DP and Greedy solve optimization problems. But many interview questions are simpler: "find a pair that sums to K", "find the longest substring without repeating characters." The brute force is O(n²) — check every pair. Two Pointers and Sliding Window do it in O(n) using a clever trick: instead of starting both pointers at the beginning, start them at opposite ends (or use a sliding window). This is THE most common interview pattern.' },

    // --- Module 8: SQL Problem Solving (Day 17-18, ~3 hrs) ---
    { id: 23, title: 'SQL Foundations', subtitle: 'Ask questions to your database — SELECT, WHERE, ORDER BY, and the mental model.', icon: '🗄️', duration: '~55 min', day: 17, content: Topic23Content, quiz: Topic23Quiz,
      storyLink: 'You\'ve mastered data structures and algorithms — the tools for solving problems with data in MEMORY. But most real-world data lives in DATABASES. SQL is how you talk to databases: "give me all orders over ₹1000 from last week, sorted by date." Same problem-solving mindset, different tool. And SQL interview questions are asked at every tech company — Google, Amazon, Flipkart, all of them.' },
    { id: 24, title: 'SQL JOINs & Aggregations', subtitle: 'Connect tables, summarize millions of rows — GROUP BY, HAVING, and the JOIN mental model.', icon: '🔗', duration: '~55 min', day: 17, content: Topic24Content, quiz: Topic24Quiz,
      storyLink: 'SELECT gets data from one table. But real databases have MANY related tables — users, orders, products, payments — and the interesting questions span across them: "show me each customer\'s total spending." JOINs connect tables by matching keys. GROUP BY collapses millions of rows into summaries. Together, they let you answer questions that would take hours to answer manually.' },
    { id: 25, title: 'SQL Window Functions & Subqueries', subtitle: 'RANK, ROW_NUMBER, running totals — the advanced SQL that impresses in interviews.', icon: '📊', duration: '~55 min', day: 18, content: Topic25Content, quiz: Topic25Quiz,
      storyLink: 'JOINs and GROUP BY answer "what is the total?" But some questions need MORE: "rank employees by salary within each department", "show each month\'s sales WITH the running total", "find customers who spent more than the average." Window Functions and Subqueries handle these — and they\'re the questions that separate a junior SQL user from someone who truly thinks in data. This is the level that impresses in interviews.' },
  ],

  project: null,
  projects: [],

  assignments: [
    { id: 1, title: 'Sort the Warehouse', subtitle: 'A logistics company needs to optimize package sorting — choose algorithms, analyze tradeoffs, and design the sorting pipeline.', icon: '📦', duration: '~45 min' },
    { id: 2, title: 'Build a Navigation System', subtitle: 'Design the algorithm behind a GPS navigator — graph modeling, shortest paths, and real-time rerouting for an Indian city.', icon: '🗺️', duration: '~50 min' },
    { id: 3, title: 'Social Network Analyzer', subtitle: 'Find friend recommendations, detect communities, and compute influence scores using graph algorithms and hash maps.', icon: '👥', duration: '~45 min' },
    { id: 4, title: 'E-Commerce Data Challenge', subtitle: 'Write SQL queries to analyze Flipkart-style sales data — revenue trends, customer segments, product rankings, and fraud detection.', icon: '🛒', duration: '~40 min' },
  ],
}

export default dsaCourse
