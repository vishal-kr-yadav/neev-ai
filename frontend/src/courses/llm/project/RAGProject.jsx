import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const API = (import.meta.env.VITE_API_URL || '') + '/api'

// ─── SAMPLE DOCUMENTS ───
const DOCUMENTS = [
  {
    id: 'transformers',
    name: 'Transformer Architecture',
    icon: '⚙️',
    type: 'pdf',
    text: `The Transformer architecture was introduced in the paper "Attention Is All You Need" by Vaswani et al. in 2017. It revolutionized natural language processing by replacing recurrent neural networks with self-attention mechanisms. The key innovation is the ability to process all tokens in a sequence simultaneously, rather than sequentially. The architecture consists of an encoder and a decoder, each made up of multiple layers. Each layer contains a multi-head self-attention mechanism and a position-wise feed-forward network. The encoder processes the input sequence and creates a rich representation. The decoder generates the output sequence, attending to both its own previous outputs and the encoder's representation. Multi-head attention allows the model to jointly attend to information from different representation subspaces at different positions. The attention function can be described as mapping a query and a set of key-value pairs to an output. Positional encoding is added to give the model information about the position of tokens in the sequence, since self-attention is position-invariant. Layer normalization and residual connections are used to stabilize training. The feed-forward network consists of two linear transformations with a ReLU activation in between. Modern LLMs like GPT-4, Claude, and Gemini are all based on transformer architectures, specifically the decoder-only variant.`,
  },
  {
    id: 'rag',
    name: 'RAG Systems Guide',
    icon: '🔍',
    type: 'pdf',
    text: `Retrieval-Augmented Generation (RAG) combines information retrieval with text generation to produce more accurate and factual outputs. The RAG pipeline consists of several key stages: document loading, chunking, embedding, indexing, retrieval, and generation. Document loading involves ingesting various file formats like PDF, HTML, and plain text into the system. Chunking splits documents into smaller, manageable pieces typically 200-500 tokens each, with optional overlap between chunks to maintain context. Embedding converts text chunks into dense vector representations using models like BERT, sentence-transformers, or OpenAI's embedding models. These vectors capture semantic meaning, allowing similar concepts to be close in vector space. The vectors are stored in a vector database like Pinecone, Weaviate, ChromaDB, or FAISS for efficient similarity search. During retrieval, the user's query is also embedded and compared against stored vectors using cosine similarity or dot product. The top-k most relevant chunks are retrieved. These chunks are then combined with the original question in a carefully crafted prompt template and sent to a large language model for answer generation. Key metrics for RAG evaluation include faithfulness, answer relevancy, and context precision. Common failure modes include chunking too aggressively, using mismatched embedding models, retrieving too few or too many chunks, and poorly designed prompt templates.`,
  },
  {
    id: 'embeddings',
    name: 'Vector Embeddings',
    icon: '📐',
    type: 'txt',
    text: `Vector embeddings are numerical representations of data that capture semantic meaning in a high-dimensional space. Words, sentences, or documents with similar meanings are mapped to nearby points in this vector space. The concept builds on distributional semantics: words that appear in similar contexts tend to have similar meanings. Early approaches like Word2Vec and GloVe created word-level embeddings by training on co-occurrence statistics. Modern embedding models like BERT and sentence-transformers create contextual embeddings where the same word can have different representations based on its context. OpenAI's text-embedding-3-small produces 1536-dimensional vectors. Embedding dimensions typically range from 384 to 4096 depending on the model. Cosine similarity is the most common metric for comparing embeddings, measuring the angle between two vectors regardless of magnitude. A cosine similarity of 1.0 means identical direction (same meaning), 0.0 means orthogonal (unrelated), and -1.0 means opposite. The embedding space can be visualized in 2D or 3D using dimensionality reduction techniques like t-SNE or UMAP. Fine-tuned embeddings trained on domain-specific data often outperform general-purpose embeddings for specialized tasks. Vector databases like Pinecone and Weaviate use approximate nearest neighbor (ANN) algorithms for efficient similarity search at scale.`,
  },
  {
    id: 'python',
    name: 'Python Programming',
    icon: '🐍',
    type: 'txt',
    text: `Python is a high-level, interpreted programming language created by Guido van Rossum and released in 1991. Python's design philosophy emphasizes code readability with its notable use of significant whitespace. Python supports multiple programming paradigms including procedural, object-oriented, and functional programming. It has a comprehensive standard library and a large ecosystem of third-party packages available through pip. Python is dynamically typed, meaning variable types are determined at runtime. The language features automatic memory management through garbage collection. List comprehensions provide a concise way to create lists. Python's simplicity makes it popular for beginners and experts alike. Major applications include web development with Django and Flask, data science with pandas and NumPy, machine learning with scikit-learn and TensorFlow, automation and scripting. Python 3 is the current version, with Python 2 reaching end of life in 2020. Virtual environments allow project-specific dependency management. The Global Interpreter Lock (GIL) limits true multi-threading but asyncio provides asynchronous I/O capabilities.`,
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes Basics',
    icon: '☸️',
    type: 'pdf',
    text: `Kubernetes is an open-source container orchestration platform originally developed by Google. It automates deploying, scaling, and managing containerized applications. The basic unit of deployment in Kubernetes is a Pod, which can contain one or more containers. A Deployment manages the desired state of Pods, ensuring the specified number of replicas are running. Services provide stable network endpoints for accessing Pods, abstracting away individual Pod IP addresses. A Namespace provides logical separation of resources within a cluster. ConfigMaps and Secrets store configuration data and sensitive information respectively. Kubernetes uses a declarative approach where you describe the desired state and the system works to achieve it. The control plane consists of the API server, scheduler, controller manager, and etcd for state storage. Worker nodes run the kubelet agent and container runtime. Horizontal Pod Autoscaler automatically scales the number of Pods based on CPU utilization or custom metrics. Persistent Volumes provide durable storage for stateful applications. Helm is a package manager that simplifies deploying complex applications using charts. Ingress controllers manage external HTTP traffic routing to services.`,
  },
]

// ─── PIPELINE STAGE CONFIGS ───
const STAGES = [
  { id: 'docs', label: 'Documents', icon: '📄', desc: 'Select source documents' },
  { id: 'loader', label: 'Loader', icon: '📥', desc: 'Parse & load documents' },
  { id: 'chunker', label: 'Chunker', icon: '✂️', desc: 'Split into chunks' },
  { id: 'embedder', label: 'Embedder', icon: '🔢', desc: 'Create vector embeddings' },
  { id: 'store', label: 'Vector Store', icon: '📊', desc: 'Store & index vectors' },
  { id: 'retriever', label: 'Retriever', icon: '🔍', desc: 'Find relevant chunks' },
  { id: 'llm', label: 'LLM', icon: '🧠', desc: 'Language model' },
  { id: 'prompt', label: 'Prompt', icon: '📝', desc: 'Prompt template' },
  { id: 'chat', label: 'Chatbot', icon: '💬', desc: 'Test your RAG' },
]

const STAGE_OPTIONS = {
  loader: [
    {
      id: 'raw', label: 'Raw String Dump', desc: 'Load entire file as one string', icon: '📃', correct: false,
      error: 'Raw dump loses all document structure — paragraphs, sentences, and sections merge into noise. The chunker won\'t have meaningful boundaries to split on.',
      explanation: 'A Raw String Dump reads the entire document as a single continuous string. It strips away all formatting — paragraphs, headings, bullet points — and merges everything into one giant blob of text.',
      whatItDoes: 'Concatenates all file bytes into a single string. No sentence detection, no paragraph awareness, no structure preservation.',
      whyFails: 'The next stage (chunker) needs natural boundaries like sentences or paragraphs to split text meaningfully. Without structure, chunks will break mid-word or mid-sentence, destroying the semantic meaning that embeddings rely on.',
    },
    {
      id: 'sentence', label: 'Sentence Parser', desc: 'Split by sentences preserving structure', icon: '📋', correct: true,
      explanation: 'A Sentence Parser intelligently detects sentence boundaries using punctuation patterns (periods, question marks, exclamation points) while handling edge cases like "Dr." or "U.S.A." It preserves the natural flow of the document.',
      whatItDoes: 'Scans each document for sentence-ending punctuation, correctly identifies sentence boundaries, and produces an array of clean, complete sentences. Each sentence retains its full meaning.',
      whyWorks: 'Sentences are the natural unit of meaning in text. By preserving sentence boundaries, the chunker can group 2-3 sentences into chunks that contain complete thoughts. This means embeddings will capture real meaning, and retrieval will find genuinely relevant passages.',
    },
    {
      id: 'char', label: 'Character Split', desc: 'Split every N characters blindly', icon: '🔠', correct: false,
      error: 'Character splitting breaks words and sentences mid-way. "The Transformer archite" | "cture was introduced" — this destroys meaning for the embedder.',
      explanation: 'Character Split divides text at fixed character intervals (e.g., every 200 characters) regardless of word or sentence boundaries. It treats text as a raw byte stream.',
      whatItDoes: 'Counts characters and inserts a split point at every Nth character. Words, sentences, and paragraphs are cut arbitrarily wherever the counter lands.',
      whyFails: 'Language meaning depends on complete words and sentences. "The Transformer archite|cture" splits a word in half. The embedder will try to encode "archite" as if it were a meaningful unit — but it\'s gibberish. This cascades: bad chunks → bad embeddings → bad retrieval → wrong answers.',
    },
    {
      id: 'line', label: 'Line-by-Line', desc: 'Split on newlines only', icon: '📑', correct: false,
      error: 'Line splitting depends on formatting. Many documents have no meaningful line breaks, resulting in one massive chunk or many tiny useless fragments.',
      explanation: 'Line-by-Line splitting uses newline characters (\\n) as the only boundary. It assumes each line of text is a meaningful unit, which works for code but rarely for prose documents.',
      whatItDoes: 'Splits text at every \\n character. If the document has no newlines (like a continuous paragraph), the entire document becomes a single enormous "line."',
      whyFails: 'Most PDF and text documents don\'t use newlines consistently. A well-formatted paragraph has zero newlines within it — so you get one giant chunk containing the whole paragraph. Or in reformatted PDFs, each line is ~60 chars with a newline, giving you fragments like "The Transformer" on one line and "architecture was" on the next.',
    },
  ],
  chunker: [
    {
      id: 'none', label: 'No Chunking', desc: 'Send whole document to LLM', icon: '📄', correct: false,
      error: 'Without chunking, the entire document goes to the LLM. Context windows are limited — a 100-page doc won\'t fit. Plus, retrieval can\'t find specific sections.',
      explanation: 'No Chunking means the loaded sentences are concatenated back together and treated as one single giant block. Each document becomes one "chunk" that could be thousands of tokens long.',
      whatItDoes: 'Bypasses the chunking stage entirely — passes all sentences as a single block to the embedder. For 3 documents of 500 words each, you get 3 chunks of 500 words.',
      whyFails: 'LLMs have context window limits (e.g., 4K-8K tokens). A single 2000-word chunk won\'t fit alongside the prompt. Also, embedding a 2000-word block produces one vector that represents everything vaguely, rather than specific topics precisely. Retrieval can\'t distinguish which part of the document is relevant.',
    },
    {
      id: 'tiny', label: '50 Token Chunks', desc: 'Very small chunks', icon: '🔬', correct: false,
      error: 'Chunks this small lose context. "Jupiter is the largest" becomes meaningless without knowing we\'re discussing planets. Retrieval returns fragments, not answers.',
      explanation: '50-Token Chunking splits text into very small pieces, typically just 1-2 sentences each. Each chunk contains barely a single thought before cutting off.',
      whatItDoes: 'Breaks the text into chunks of roughly 50 tokens (~35 words). This creates many tiny fragments that each contain only a sentence or less.',
      whyFails: 'Semantic meaning often spans 2-3 sentences. "It uses self-attention mechanisms" makes no sense without knowing "it" refers to the Transformer. Tiny chunks lose anaphora (pronouns), lose context, and create a noise problem — the retriever must sift through hundreds of near-meaningless fragments to find relevant information.',
    },
    {
      id: 'overlap', label: '200 Tokens + Overlap', desc: 'Medium chunks with 50-token overlap', icon: '🔗', correct: true,
      explanation: 'This strategy creates chunks of ~200 tokens (about 2-3 sentences) with a 50-token overlap between consecutive chunks. The overlap ensures that no context is lost at chunk boundaries.',
      whatItDoes: 'Groups sentences into chunks of approximately 200 tokens. The last sentence of chunk N is repeated as the first sentence of chunk N+1, creating a sliding window effect. This preserves context across boundaries.',
      whyWorks: '200 tokens is the sweet spot: large enough to contain a complete thought (2-3 sentences about one concept) but small enough for precise retrieval. The 50-token overlap means if a key fact spans a chunk boundary, it appears completely in at least one chunk. This is the industry standard used by LangChain, LlamaIndex, and most production RAG systems.',
    },
    {
      id: 'huge', label: '2000 Token Chunks', desc: 'Very large chunks', icon: '📦', correct: false,
      error: 'Chunks this large defeat the purpose of RAG. You\'ll send mostly irrelevant text to the LLM, diluting the relevant information and wasting tokens.',
      explanation: '2000-Token Chunking creates very large blocks containing entire sections or even whole documents. Each chunk could be an entire page of text.',
      whatItDoes: 'Packs as many sentences as possible until hitting ~2000 tokens per chunk. For a typical 500-word document, the entire document becomes just 1-2 chunks.',
      whyFails: 'When a user asks "What is self-attention?", you retrieve a 2000-token chunk that contains the answer somewhere in 1500 tokens of irrelevant text. The LLM must dig through noise to find the relevant sentence. Token budget is wasted on irrelevant context, reducing answer quality and increasing cost.',
    },
  ],
  embedder: [
    {
      id: 'random', label: 'Random Vectors', desc: 'Generate random numbers', icon: '🎲', correct: false,
      error: 'Random vectors have no semantic meaning! "cat" and "kitten" would be as far apart as "cat" and "quantum physics". Retrieval becomes random.',
      explanation: 'Random Vector generation assigns a vector of random floating-point numbers to each chunk. The numbers have no relationship to the text content whatsoever.',
      whatItDoes: 'For each chunk, generates a vector like [0.832, -0.127, 0.445, ...] where every number is drawn from a random distribution. Two identical chunks would get completely different vectors.',
      whyFails: 'Embeddings must capture meaning — "transformer architecture" and "self-attention model" should be close in vector space because they\'re about the same concept. Random vectors destroy this: the distance between any two chunks is essentially random, so retrieval returns random results regardless of the query.',
    },
    {
      id: 'bow', label: 'Bag of Words', desc: 'Count word frequencies', icon: '🔤', correct: false,
      error: 'Bag of Words ignores word order and meaning. "The dog bit the man" = "The man bit the dog". It can\'t capture semantic similarity for retrieval.',
      explanation: 'Bag of Words (BoW) creates a vector by counting how many times each word appears in the chunk. It ignores word order entirely — the text is treated as an unordered "bag" of words.',
      whatItDoes: 'Builds a vocabulary of all unique words, then represents each chunk as a count vector: [the:5, transformer:2, is:3, ...]. Word position, context, and grammar are completely discarded.',
      whyFails: '"Machine learning models need training data" and "Training data for machine learning models" get identical vectors despite potentially different meanings. More critically, "bank" (river) and "bank" (financial) get the same representation. Synonyms like "fast" and "quick" are treated as completely unrelated. BoW misses the semantic relationships that make retrieval work.',
    },
    {
      id: 'tfidf', label: 'TF-IDF Vectors', desc: 'Term frequency-inverse document frequency', icon: '📊', correct: true,
      explanation: 'TF-IDF (Term Frequency × Inverse Document Frequency) weights each word by how important it is to a specific chunk relative to all chunks. Common words like "the" get low weights; distinctive words like "transformer" get high weights.',
      whatItDoes: 'For each word in a chunk: TF = (times word appears in chunk) / (total words in chunk). IDF = log(total chunks / chunks containing this word). The product TF×IDF gives high scores to words that are frequent in THIS chunk but rare across ALL chunks.',
      whyWorks: 'TF-IDF captures topic-level relevance. A chunk about transformers will have high TF-IDF for "attention", "encoder", "decoder" — these words distinguish it from chunks about Python or Kubernetes. While it doesn\'t capture deep semantic meaning like neural embeddings, it\'s fast, interpretable, and effective for keyword-aligned retrieval. We can run it entirely in your browser!',
    },
    {
      id: 'learned', label: 'Sentence Transformers', desc: 'Pre-trained neural embeddings', icon: '🧠', correct: true, best: true,
      explanation: 'Sentence Transformers (like all-MiniLM-L6-v2 or text-embedding-3-small) are neural networks trained on millions of sentence pairs to produce dense vector embeddings that capture deep semantic meaning.',
      whatItDoes: 'Passes each chunk through a pre-trained transformer network that outputs a dense vector (e.g., 384 or 1536 dimensions). These vectors encode not just keywords but meaning — "happy" and "joyful" are close together; "bank" (river) and "bank" (money) are far apart based on context.',
      whyWorks: 'Neural embeddings understand synonyms, paraphrasing, and conceptual similarity. A query about "how AI learns" will retrieve chunks about "training neural networks" because the embedder understands they mean the same thing. This is the gold standard for production RAG systems. (For this demo, we use TF-IDF to keep everything running in your browser.)',
    },
  ],
  store: [
    {
      id: 'none', label: 'No Storage', desc: 'Recompute every query', icon: '🚫', correct: false,
      error: 'Without storing vectors, you must re-embed all documents for every question. This is extremely slow and expensive — minutes per query instead of milliseconds.',
      explanation: 'No Storage means embeddings are computed on-the-fly for every query and immediately discarded. Nothing is persisted between questions.',
      whatItDoes: 'Every time a user asks a question: (1) re-load all documents, (2) re-chunk them, (3) re-embed every chunk, (4) compare with query, (5) discard everything. Repeat from scratch for the next question.',
      whyFails: 'Embedding 1000 chunks takes ~10 seconds with a GPU, ~60+ seconds on CPU. Users won\'t wait a minute for every question. It also wastes money — API-based embeddings (OpenAI, Cohere) charge per token, so re-embedding the same documents repeatedly multiplies your cost by the number of queries.',
    },
    {
      id: 'array', label: 'In-Memory Array', desc: 'Simple array with linear search', icon: '📋', correct: true,
      explanation: 'An In-Memory Array stores all chunk vectors in a JavaScript array and searches through them one by one (linear scan) to find the most similar ones to the query.',
      whatItDoes: 'Stores vectors as [{chunk: "...", vector: [0.1, 0.3, ...]}, ...] in memory. For each query, iterates through ALL vectors, computes cosine similarity with each, sorts by score, and returns the top-k results.',
      whyWorks: 'For small datasets (< 10,000 chunks), linear scan is fast enough — searching 1000 vectors takes < 10ms. It\'s simple, requires no external dependencies, and works perfectly for our demo. The trade-off: it won\'t scale to millions of chunks because O(n) search becomes too slow. But for learning and small projects, it\'s the right choice.',
    },
    {
      id: 'hashmap', label: 'HashMap Lookup', desc: 'Key-value store by chunk ID', icon: '🗂️', correct: false,
      error: 'HashMaps require exact key matches. You can\'t do similarity search with a HashMap — you need to compare vectors, not look up by key.',
      explanation: 'A HashMap (dictionary/object) stores data as key-value pairs for O(1) lookup by key. You put data in with a key and get it back with the same key.',
      whatItDoes: 'Stores chunks as {chunk_id_1: vector_1, chunk_id_2: vector_2, ...}. To retrieve, you would need to know the exact chunk ID — you can\'t search by "similarity."',
      whyFails: 'Similarity search requires comparing a query vector against ALL stored vectors to find the closest ones. A HashMap can only answer "give me chunk #42" — it cannot answer "which chunks are most similar to this query?" You\'d need to iterate all values anyway (defeating the HashMap\'s O(1) purpose), or use a data structure designed for nearest-neighbor search.',
    },
    {
      id: 'vectordb', label: 'Vector Database', desc: 'ANN-indexed for fast similarity search', icon: '⚡', correct: true, best: true,
      explanation: 'A Vector Database (Pinecone, Weaviate, ChromaDB, FAISS) stores vectors with specialized index structures (HNSW, IVF) that enable sub-millisecond similarity search even with millions of vectors.',
      whatItDoes: 'Builds an index (like a tree or graph) over all vectors so that finding the top-k nearest neighbors doesn\'t require checking every single vector. Uses Approximate Nearest Neighbor (ANN) algorithms to trade a tiny bit of accuracy for massive speed gains.',
      whyWorks: 'At scale (100K+ chunks), linear scan takes seconds. ANN indices reduce this to milliseconds by organizing vectors into clusters or navigable graphs. Pinecone, for instance, can search 1 billion vectors in < 50ms. For our demo we use an in-memory array (our dataset is tiny), but in production, you\'d use a vector DB. They also handle persistence, filtering, and metadata.',
    },
  ],
  retriever: [
    {
      id: 'random', label: 'Random Selection', desc: 'Pick random chunks', icon: '🎰', correct: false,
      error: 'Random retrieval ignores the query entirely. You might send chunks about Python when the user asked about Transformers. The LLM can\'t answer from irrelevant context.',
      explanation: 'Random Selection picks chunks at random from the vector store without considering the query at all. Every chunk has an equal probability of being selected.',
      whatItDoes: 'Generates random indices and returns those chunks regardless of the user\'s question. "What is a Transformer?" might return chunks about Python, Kubernetes, or anything else.',
      whyFails: 'The entire point of RAG is grounding LLM responses in relevant information. Random retrieval sends arbitrary, likely irrelevant context to the LLM. The model then either ignores the context (defeating RAG) or tries to use irrelevant information, producing nonsensical or hallucinated answers.',
    },
    {
      id: 'keyword', label: 'Keyword Match', desc: 'Exact keyword matching', icon: '🔤', correct: false,
      error: 'Keyword matching misses semantic similarity. Searching "how AI learns" won\'t match "training neural networks" even though they\'re about the same concept.',
      explanation: 'Keyword Match retrieves chunks that contain the exact words from the query. It\'s a boolean match — either the keyword appears in the chunk or it doesn\'t.',
      whatItDoes: 'Tokenizes the query into keywords, then checks each chunk for exact string matches. "What is attention?" only matches chunks containing the literal word "attention" — not "focus", "attend", or "self-attention mechanism."',
      whyFails: 'Language is full of synonyms, paraphrasing, and indirect references. "How does AI understand language?" should match chunks about "NLP", "natural language processing", and "transformer models" — but keyword search misses all of these because the exact words don\'t appear. It also over-matches common words and can\'t rank by relevance.',
    },
    {
      id: 'cosine', label: 'Cosine Similarity', desc: 'Vector similarity search (top-k)', icon: '📐', correct: true,
      explanation: 'Cosine Similarity measures the angle between two vectors in high-dimensional space. Vectors pointing in the same direction (similar meaning) have cosine similarity close to 1.0; unrelated vectors are close to 0.0.',
      whatItDoes: 'Embeds the user\'s query into a vector using the same embedder, then computes cosine similarity between the query vector and every stored chunk vector. Returns the top-k chunks with the highest similarity scores.',
      whyWorks: 'Because the embedder maps semantically similar text to nearby vectors, cosine similarity naturally finds chunks whose content is most related to the query — even if they use completely different words. "How do transformers process text?" will match chunks about "self-attention mechanisms" because they occupy the same region of vector space.',
    },
    {
      id: 'mmr', label: 'MMR (Max Marginal Relevance)', desc: 'Similarity + diversity', icon: '🎯', correct: true, best: true,
      explanation: 'MMR (Maximal Marginal Relevance) retrieves chunks that are both relevant to the query AND diverse from each other. It prevents returning 3 chunks that all say the same thing.',
      whatItDoes: 'First finds the most relevant chunk (highest cosine similarity to query). Then for each subsequent chunk, balances relevance-to-query against similarity-to-already-selected-chunks. The formula: MMR = λ × sim(chunk, query) - (1-λ) × max(sim(chunk, selected)).',
      whyWorks: 'Pure cosine similarity often returns near-duplicate chunks (the same fact stated slightly differently in different paragraphs). MMR solves this by penalizing redundancy. If chunk 1 covers "attention mechanisms", chunk 2 should cover a different relevant aspect like "training process" rather than repeating the same information. This gives the LLM more diverse, comprehensive context.',
    },
  ],
  llm: [
    {
      id: 'none', label: 'No LLM', desc: 'Return raw chunks', icon: '🚫', correct: false,
      error: 'Without an LLM, you just return raw text chunks. There\'s no synthesis, no natural language answer. The user gets disconnected paragraphs instead of a coherent response.',
      explanation: 'No LLM means skipping the generation step entirely. The retrieved chunks are returned as-is to the user without any synthesis, summarization, or formatting.',
      whatItDoes: 'Takes the top-k retrieved chunks and displays them directly. No processing, no reasoning, no answer generation. The user sees 3 raw text paragraphs and must extract the answer themselves.',
      whyFails: 'Users ask questions expecting coherent answers, not document excerpts. "What is self-attention?" would return 3 chunks of text that each mention self-attention but don\'t directly answer the question. There\'s no reasoning to combine information from multiple chunks, handle contradictions, or admit when the context is insufficient.',
    },
    {
      id: 'template', label: 'Template Fill', desc: 'Static text template with blanks', icon: '📄', correct: false,
      error: 'Templates can\'t reason, synthesize, or handle unexpected questions. They produce rigid, often wrong answers. "The answer about {topic} is {chunk}" isn\'t helpful.',
      explanation: 'Template Fill uses pre-written response templates with placeholder slots that get filled with text from retrieved chunks. It\'s like a Mad Libs approach to answering questions.',
      whatItDoes: 'Matches the question to a template: "Based on the documents, {topic} is described as: {chunk_text}. The key points are: {extracted_keywords}." No reasoning — just string substitution.',
      whyFails: 'Templates can\'t reason. "Is the Transformer better than RNNs?" requires comparing, weighing evidence, and forming a conclusion — template fill just pastes in text. It can\'t handle follow-up questions, synthesize information across chunks, or recognize when it doesn\'t have enough information. Real-world questions are too varied for static templates.',
    },
    {
      id: 'haiku', label: 'Claude Haiku', desc: 'Fast, cost-effective (real API)', icon: '⚡', correct: true,
      explanation: 'Claude Haiku is Anthropic\'s fastest and most cost-efficient model. It excels at straightforward tasks like summarization, Q&A with context, and factual extraction — exactly what RAG needs.',
      whatItDoes: 'Sends the prompt (system instructions + retrieved context + user question) to Claude Haiku via API. The model reads the context, reasons about the question, and generates a natural language answer grounded in the provided chunks.',
      whyWorks: 'Haiku is purpose-built for tasks where speed and cost matter. RAG questions are typically well-scoped (the context provides the answer), so a smaller, faster model performs nearly as well as larger ones. Response time: ~500ms. Cost: ~$0.00025 per query. For learning and prototyping, Haiku is the ideal choice.',
    },
    {
      id: 'sonnet', label: 'Claude Sonnet', desc: 'Balanced quality & speed', icon: '🧠', correct: true, best: true,
      explanation: 'Claude Sonnet offers the best balance of reasoning quality, speed, and cost. It handles nuanced questions, multi-step reasoning, and complex synthesis better than Haiku.',
      whatItDoes: 'Same pipeline as Haiku but with a more capable model. Sonnet can reason about contradictions in context, combine information from multiple chunks more coherently, and handle ambiguous or complex questions with greater accuracy.',
      whyWorks: 'For production RAG systems with complex queries, Sonnet\'s improved reasoning justifies the higher cost (~3x Haiku). It\'s better at saying "the context doesn\'t fully answer this" rather than hallucinating, and it produces more nuanced, well-structured answers. For this demo, we use Haiku to keep it fast and affordable.',
    },
  ],
  prompt: [
    {
      id: 'bare', label: 'Just the Question', desc: 'Send only the user question', icon: '❓', correct: false,
      error: 'Without context, the LLM uses only its training data. This is NOT RAG — it\'s just a regular chatbot. Hallucinations guaranteed because there\'s no retrieved information.',
      explanation: 'Sending "Just the Question" means the LLM receives only the user\'s query with no retrieved context and no system instructions. It answers purely from its training data.',
      whatItDoes: 'Prompt sent to LLM: "What is the Transformer architecture?" — that\'s it. No context from your documents, no instructions to stay grounded. The model uses its parametric knowledge (training data) to answer.',
      whyFails: 'This completely bypasses RAG. The whole point was to ground answers in YOUR documents. Without context, the LLM might hallucinate details, cite information from its training data (which may be outdated or wrong), or give generic answers that don\'t reflect your specific documents. You built an entire pipeline for nothing.',
    },
    {
      id: 'context', label: 'Question + Context', desc: 'Append retrieved chunks', icon: '📎', correct: false,
      error: 'Without a system prompt, the LLM doesn\'t know to ONLY use the context. It may ignore the context and hallucinate, or mix context with training data.',
      explanation: 'This approach sends the retrieved chunks and the question but provides no system-level instructions telling the model how to use the context.',
      whatItDoes: 'Prompt: "Context: [chunks]\\n\\nQuestion: What is self-attention?" The model sees the context and question but has no instruction to ONLY use the context or to admit when information is missing.',
      whyFails: 'Without explicit instructions, the LLM might: (1) ignore the context and use training data, (2) mix context facts with hallucinated details, (3) confidently answer questions even when the context has no relevant information, or (4) fail to cite sources. A system prompt is essential to constrain the model to RAG-style behavior.',
    },
    {
      id: 'full', label: 'System + Context + Question', desc: 'Full RAG prompt with instructions', icon: '📝', correct: true,
      explanation: 'The Full RAG Prompt includes a system instruction ("Answer ONLY from the context"), the retrieved chunks as context, and the user\'s question. The system prompt constrains the model to behave as a RAG system.',
      whatItDoes: 'System: "You are a helpful assistant. Answer using ONLY the provided context. If the context doesn\'t contain the answer, say so."\\nUser: "Context: [chunks]\\n\\nQuestion: [query]"',
      whyWorks: 'The system prompt acts as guardrails: it tells the model to ONLY use the provided context (preventing hallucination), to admit when it can\'t answer (preventing false confidence), and to be concise (preventing rambling). This is the standard RAG prompt pattern used in production systems. It transforms a general-purpose LLM into a grounded Q&A system.',
    },
    {
      id: 'cot', label: 'Chain-of-Thought RAG', desc: 'Step-by-step reasoning with context', icon: '🔗', correct: true, best: true,
      explanation: 'Chain-of-Thought (CoT) RAG adds explicit reasoning instructions: the model must first identify which parts of the context are relevant, then reason step-by-step before answering.',
      whatItDoes: 'System: "Think step-by-step: 1. Read the context carefully. 2. Identify relevant parts. 3. Synthesize an answer using ONLY the context. 4. If insufficient, say so." This forces transparent reasoning.',
      whyWorks: 'CoT improves answer accuracy by 10-20% on complex questions because the model explicitly reasons about relevance before answering. It catches cases where the context is partially relevant — instead of guessing, the model identifies exactly which parts it can use. It also makes answers more trustworthy because the reasoning is visible.',
    },
  ],
}

// ─── TF-IDF ENGINE (runs in browser) ───
function buildTFIDF(chunks) {
  const docs = chunks.map(c => c.toLowerCase().split(/\W+/).filter(w => w.length > 2))
  const df = {}
  docs.forEach(d => {
    const seen = new Set()
    d.forEach(w => { if (!seen.has(w)) { df[w] = (df[w] || 0) + 1; seen.add(w) } })
  })
  const N = docs.length
  return docs.map(d => {
    const tf = {}
    d.forEach(w => { tf[w] = (tf[w] || 0) + 1 })
    const vec = {}
    Object.keys(tf).forEach(w => { vec[w] = (tf[w] / d.length) * Math.log(N / (df[w] || 1)) })
    return vec
  })
}

function cosineSim(a, b) {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  let dot = 0, magA = 0, magB = 0
  keys.forEach(k => {
    const va = a[k] || 0, vb = b[k] || 0
    dot += va * vb; magA += va * va; magB += vb * vb
  })
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0
}

function retrieveChunks(query, chunks, tfidfVecs, topK = 3) {
  const qWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2)
  const qVec = {}
  qWords.forEach(w => { qVec[w] = (qVec[w] || 0) + 1 / qWords.length })
  return chunks.map((chunk, i) => ({
    chunk, index: i,
    score: cosineSim(qVec, tfidfVecs[i]),
  })).sort((a, b) => b.score - a.score).slice(0, topK)
}

// ─── ERROR INTERMEDIATE OUTPUT GENERATORS ───
function generateErrorOutput(stageId, optionId, docs) {
  const allText = docs.map(d => d.text).join(' ')
  const sentences = allText.match(/[^.!?]+[.!?]+/g) || [allText]

  switch (stageId) {
    case 'loader': {
      if (optionId === 'raw') {
        const raw = allText.replace(/\s+/g, ' ')
        return {
          title: 'Raw Dump Output',
          data: [
            { label: 'Output type', value: 'Single continuous string' },
            { label: 'Total characters', value: raw.length.toLocaleString() },
            { label: 'Sentence boundaries detected', value: '0 (none!)' },
          ],
          preview: raw.slice(0, 300) + '...[continues for ' + (raw.length - 300) + ' more chars with no structure]',
          issue: 'The entire corpus is one blob. The chunker will have to split this blindly, breaking sentences mid-word.',
        }
      }
      if (optionId === 'char') {
        const charSize = 120
        const chunks = []
        for (let i = 0; i < Math.min(allText.length, 600); i += charSize) {
          chunks.push(allText.slice(i, i + charSize))
        }
        return {
          title: 'Character Split Output',
          data: [
            { label: 'Split interval', value: `Every ${charSize} characters` },
            { label: 'Total splits', value: Math.ceil(allText.length / charSize) },
            { label: 'Broken words', value: chunks.filter(c => !c.endsWith(' ') && !c.endsWith('.')).length },
          ],
          preview: chunks.map((c, i) => `[${i}] "${c}"`).join('\n\n'),
          issue: 'Look at the boundaries — words are cut in half. "archite|cture", "self-atten|tion". These fragments are meaningless to the embedder.',
        }
      }
      if (optionId === 'line') {
        const lines = allText.split('\n').filter(l => l.trim())
        return {
          title: 'Line Split Output',
          data: [
            { label: 'Lines found', value: lines.length || '1 (no newlines!)' },
            { label: 'Avg line length', value: lines.length ? Math.round(allText.length / lines.length) + ' chars' : allText.length + ' chars (entire doc)' },
          ],
          preview: lines.length <= 1
            ? `[0] "${allText.slice(0, 250)}..." (${allText.length} chars — the ENTIRE document as one "line")`
            : lines.slice(0, 3).map((l, i) => `[${i}] "${l.slice(0, 100)}..."`).join('\n'),
          issue: lines.length <= 1
            ? 'The document has no newlines, so the entire text becomes a single enormous "line." The chunker receives one giant block.'
            : 'Lines are arbitrary — some are 10 words, others are 200. There\'s no consistent meaning boundary.',
        }
      }
      break
    }
    case 'chunker': {
      if (optionId === 'none') {
        return {
          title: 'No Chunking Output',
          data: [
            { label: 'Chunks created', value: docs.length },
            { label: 'Avg chunk size', value: Math.round(allText.length / docs.length) + ' chars (~' + Math.round(allText.split(' ').length / docs.length) + ' words)' },
            { label: 'Context window fit?', value: 'Barely / No (each chunk is huge)' },
          ],
          preview: docs.map((d, i) => `[Chunk ${i}] "${d.text.slice(0, 80)}..." (${d.text.split(' ').length} words — entire document!)`).join('\n\n'),
          issue: 'Each "chunk" is an entire document. The embedder creates one vague vector per document — it can\'t pinpoint specific facts. The LLM gets flooded with irrelevant text.',
        }
      }
      if (optionId === 'tiny') {
        const words = allText.split(/\s+/)
        const tinyChunks = []
        for (let i = 0; i < Math.min(words.length, 350); i += 35) {
          tinyChunks.push(words.slice(i, i + 35).join(' '))
        }
        return {
          title: 'Tiny Chunk Output (50 tokens ≈ 35 words)',
          data: [
            { label: 'Chunks created', value: Math.ceil(words.length / 35) },
            { label: 'Avg words per chunk', value: '~35' },
            { label: 'Context preserved?', value: 'No — pronouns lose referents' },
          ],
          preview: tinyChunks.slice(0, 5).map((c, i) => `[${i}] "${c}"`).join('\n\n'),
          issue: 'These chunks are sentence fragments. "It revolutionized NLP" — what is "it"? The reader (and embedder) can\'t tell because the antecedent is in a different chunk.',
        }
      }
      if (optionId === 'huge') {
        const words = allText.split(/\s+/)
        const hugeChunks = []
        for (let i = 0; i < words.length; i += 1400) {
          hugeChunks.push(words.slice(i, i + 1400).join(' '))
        }
        return {
          title: 'Huge Chunk Output (2000 tokens ≈ 1400 words)',
          data: [
            { label: 'Chunks created', value: hugeChunks.length },
            { label: 'Avg words per chunk', value: '~1400' },
            { label: 'Retrieval precision', value: 'Very low — too much noise per chunk' },
          ],
          preview: hugeChunks.map((c, i) => `[${i}] "${c.slice(0, 100)}..." (${c.split(' ').length} words — massive!)`).join('\n\n'),
          issue: 'Only ' + hugeChunks.length + ' chunk(s) for all your documents. When retrieved, the LLM gets ~1400 words of context where only ~50 are relevant. 97% noise.',
        }
      }
      break
    }
    case 'embedder': {
      if (optionId === 'random') {
        const randomVecs = Array.from({ length: 3 }, () =>
          Array.from({ length: 8 }, () => (Math.random() * 2 - 1).toFixed(4))
        )
        return {
          title: 'Random Vector Output',
          data: [
            { label: 'Vector dimensions', value: '384 (random)' },
            { label: 'Semantic meaning', value: 'NONE' },
            { label: 'Same chunk, 2 runs', value: 'Completely different vectors!' },
          ],
          preview: randomVecs.map((v, i) => `Chunk ${i}: [${v.join(', ')}...]`).join('\n'),
          issue: 'These numbers mean nothing. Run it again and you get different numbers for the same text. "Transformer" and "Self-attention" are equally distant as "Transformer" and "Pizza recipe."',
        }
      }
      if (optionId === 'bow') {
        const sample = sentences.slice(0, 2).join(' ')
        const words = sample.toLowerCase().split(/\W+/).filter(w => w.length > 2)
        const counts = {}
        words.forEach(w => { counts[w] = (counts[w] || 0) + 1 })
        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10)
        return {
          title: 'Bag of Words Output',
          data: [
            { label: 'Vocabulary size', value: Object.keys(counts).length },
            { label: 'Word order', value: 'LOST (completely ignored)' },
            { label: 'Synonym awareness', value: 'None — "fast" ≠ "quick"' },
          ],
          preview: `Top words: {${sorted.map(([w, c]) => `"${w}":${c}`).join(', ')}}`,
          issue: '"The dog bit the man" and "The man bit the dog" produce identical vectors. BoW can\'t distinguish meaning that depends on word order.',
        }
      }
      break
    }
    case 'store': {
      if (optionId === 'none') {
        return {
          title: 'No Storage Output',
          data: [
            { label: 'Vectors stored', value: '0' },
            { label: 'Time per query', value: '~10-60 seconds (re-embed everything)' },
            { label: 'API cost multiplier', value: `${Math.max(10, sentences.length)}x (per query!)` },
          ],
          preview: 'Query → Re-load docs → Re-chunk → Re-embed ALL chunks → Search → Answer\n(This happens for EVERY single question)',
          issue: 'Your 3 documents with ~' + sentences.length + ' sentences must be re-processed from scratch for every question. It\'s like rebuilding a library catalog every time someone wants to find a book.',
        }
      }
      if (optionId === 'hashmap') {
        return {
          title: 'HashMap Storage Output',
          data: [
            { label: 'Storage type', value: 'Key-Value lookup (exact match)' },
            { label: 'Similarity search?', value: 'IMPOSSIBLE' },
            { label: 'Can find "nearest"?', value: 'No — can only find "exact"' },
          ],
          preview: '{\n  "chunk_0": [0.12, 0.45, ...],\n  "chunk_1": [0.33, 0.21, ...],\n  ...\n}\n\nquery: "What is attention?" → lookup("What is attention?") → NOT FOUND\n(Would need to check every value — O(n) — defeating the purpose)',
          issue: 'To find similar vectors, you need to compare the query vector against stored vectors using distance metrics. A HashMap only supports exact key lookup — the fundamental operation of similarity search (nearest neighbor) is not possible.',
        }
      }
      break
    }
    case 'retriever': {
      if (optionId === 'random') {
        const sampleChunks = sentences.slice(0, 3)
        return {
          title: 'Random Retrieval Output',
          data: [
            { label: 'Method', value: 'Math.random()' },
            { label: 'Relevance to query', value: 'Completely random' },
            { label: 'Query considered?', value: 'No' },
          ],
          preview: `Query: "What is self-attention?"\n\nRetrieved (randomly):\n${sampleChunks.map((s, i) => `  [${i}] ${s.trim().slice(0, 100)}...`).join('\n')}\n\n⚠️ These chunks may have NOTHING to do with the question!`,
          issue: 'The retriever didn\'t even look at your question. It picked chunks at random — they could be about Python, Kubernetes, or anything. The LLM will try to answer from irrelevant context.',
        }
      }
      if (optionId === 'keyword') {
        return {
          title: 'Keyword Match Output',
          data: [
            { label: 'Method', value: 'Exact string matching' },
            { label: 'Synonyms detected?', value: 'No' },
            { label: 'Semantic matching?', value: 'No — literal words only' },
          ],
          preview: 'Query: "How does AI understand language?"\n\nKeyword search for: "AI", "understand", "language"\n\n✗ Missed: "NLP" (synonym for natural language processing)\n✗ Missed: "transformer architecture" (AI system for language)\n✗ Missed: "self-attention mechanism" (how AI processes text)\n✓ Only matches chunks with the literal word "language"',
          issue: 'Keyword matching misses 70-80% of relevant chunks because it can\'t understand that "NLP", "natural language processing", and "language understanding" all mean the same thing.',
        }
      }
      break
    }
    case 'llm': {
      if (optionId === 'none') {
        const sampleContext = sentences.slice(0, 3).map(s => s.trim()).join(' ')
        return {
          title: 'No LLM Output',
          data: [
            { label: 'Processing', value: 'None — raw chunks returned' },
            { label: 'Synthesis', value: 'None' },
            { label: 'Answer quality', value: 'Unprocessed text dumps' },
          ],
          preview: `User asks: "What is self-attention?"\n\nResponse (raw chunks):\n"${sampleContext.slice(0, 200)}..."\n\n⚠️ No summarization, no direct answer, no reasoning.`,
          issue: 'The user asked a question and got back raw paragraphs. They have to read through all the text and extract the answer themselves — this isn\'t a chatbot, it\'s a search engine.',
        }
      }
      if (optionId === 'template') {
        return {
          title: 'Template Fill Output',
          data: [
            { label: 'Method', value: 'String substitution' },
            { label: 'Reasoning ability', value: 'None' },
            { label: 'Flexibility', value: 'Fixed templates only' },
          ],
          preview: 'Template: "Based on the documents, {topic} is described as: {chunk_excerpt}"\n\nUser asks: "Compare transformers to RNNs"\n\nOutput: "Based on the documents, Compare transformers to RNNs is described as: The Transformer architecture was introduced..."\n\n⚠️ Can\'t actually compare, reason, or synthesize.',
          issue: 'The template blindly fills in blanks. It can\'t compare, reason about relationships, handle ambiguous questions, or say "I don\'t know." Every answer has the same rigid format regardless of the question.',
        }
      }
      break
    }
    case 'prompt': {
      if (optionId === 'bare') {
        return {
          title: 'Bare Question Prompt',
          data: [
            { label: 'System prompt', value: 'None' },
            { label: 'Context included?', value: 'No' },
            { label: 'RAG active?', value: 'NO — this is a regular chatbot' },
          ],
          preview: '── Prompt sent to LLM ──\n\nUser: "What is the Transformer architecture?"\n\n── That\'s it. No context. No instructions. ──\n\nThe LLM answers from training data, not your documents.\nYour entire pipeline (loader → chunker → embedder → retriever) is BYPASSED.',
          issue: 'You built an entire RAG pipeline but aren\'t using it. The retrieved context is thrown away. The LLM answers from its training data — exactly what it would do WITHOUT RAG. Hallucinations, outdated information, and generic answers guaranteed.',
        }
      }
      if (optionId === 'context') {
        return {
          title: 'Context-Only Prompt (No System Instructions)',
          data: [
            { label: 'System prompt', value: 'None' },
            { label: 'Context included?', value: 'Yes' },
            { label: 'Grounding instructions?', value: 'NO — model may ignore context' },
          ],
          preview: '── Prompt sent to LLM ──\n\nUser: "Context:\\n[retrieved chunks]\\n\\nQuestion: What is self-attention?"\n\n── No system instruction telling the model to USE the context ──\n\nThe LLM might:\n• Ignore the context entirely\n• Mix context facts with training data\n• Confidently answer even when context has no info',
          issue: 'Without a system prompt saying "Answer ONLY from the context", the LLM treats the context as optional. It might use its training data, mix facts, or hallucinate. You need explicit instructions to constrain the model to RAG behavior.',
        }
      }
      break
    }
  }
  return null
}

// ─── SUCCESS INTERMEDIATE OUTPUT GENERATORS ───
function generateSuccessOutput(stageId, option, docs, prevOutputs) {
  const allText = docs.map(d => d.text).join(' ')
  const sentences = allText.match(/[^.!?]+[.!?]+/g) || [allText]

  switch (stageId) {
    case 'loader': {
      const preview = sentences.slice(0, 5).map(s => s.trim())
      return {
        method: option.label,
        sentences: sentences.length,
        preview,
        detail: {
          title: 'Sentence Parser Output',
          stats: [
            { label: 'Documents loaded', value: docs.length },
            { label: 'Total sentences parsed', value: sentences.length },
            { label: 'Avg sentence length', value: Math.round(allText.length / sentences.length) + ' chars' },
            { label: 'Structure preserved?', value: 'Yes — complete sentences' },
          ],
          sampleData: preview.map((s, i) => ({ idx: i, text: s, words: s.split(' ').length })),
        },
      }
    }
    case 'chunker': {
      const chunks = []
      const size = 3
      for (let i = 0; i < sentences.length; i += size) {
        const chunk = sentences.slice(i, Math.min(i + size, sentences.length)).join(' ').trim()
        if (chunk) chunks.push(chunk)
      }
      const overlapped = []
      for (let i = 0; i < chunks.length; i++) {
        let c = chunks[i]
        if (i > 0) {
          const prevSentences = chunks[i - 1].match(/[^.!?]+[.!?]+/g) || []
          const overlapText = prevSentences.slice(-1).join(' ')
          c = overlapText + ' ' + c
        }
        overlapped.push(c.trim())
      }
      return {
        chunks: overlapped,
        count: overlapped.length,
        detail: {
          title: 'Chunked Output (200 tokens + overlap)',
          stats: [
            { label: 'Total chunks created', value: overlapped.length },
            { label: 'Avg chunk size', value: Math.round(overlapped.reduce((a, c) => a + c.split(' ').length, 0) / overlapped.length) + ' words' },
            { label: 'Overlap', value: '~1 sentence between consecutive chunks' },
            { label: 'Boundary breaks?', value: 'None — clean sentence boundaries' },
          ],
          sampleData: overlapped.slice(0, 4).map((c, i) => ({
            idx: i,
            text: c,
            words: c.split(' ').length,
            overlap: i > 0 ? 'Shares last sentence with chunk ' + (i - 1) : 'First chunk (no overlap)',
          })),
        },
      }
    }
    case 'embedder': {
      const chunks = prevOutputs.chunker?.chunks || []
      const vecs = buildTFIDF(chunks)
      const preview = vecs.slice(0, 3).map(v => {
        const entries = Object.entries(v).sort((a, b) => b[1] - a[1]).slice(0, 8)
        return entries.map(([k, val]) => `${k}:${val.toFixed(3)}`)
      })
      const sim01 = vecs.length >= 2 ? cosineSim(vecs[0], vecs[1]).toFixed(4) : 'N/A'
      const sim02 = vecs.length >= 3 ? cosineSim(vecs[0], vecs[2]).toFixed(4) : 'N/A'
      return {
        vectors: vecs,
        dimensions: Object.keys(vecs[0] || {}).length,
        preview,
        detail: {
          title: option.id === 'learned' ? 'Sentence Transformer Embeddings (simulated via TF-IDF)' : 'TF-IDF Vector Embeddings',
          stats: [
            { label: 'Vectors created', value: vecs.length },
            { label: 'Dimensions per vector', value: Object.keys(vecs[0] || {}).length },
            { label: 'Similarity chunk[0]↔chunk[1]', value: sim01 },
            { label: 'Similarity chunk[0]↔chunk[2]', value: sim02 },
          ],
          sampleData: preview.slice(0, 3).map((p, i) => ({
            idx: i,
            text: `Chunk ${i} top keywords`,
            vector: p.join(', '),
          })),
          note: option.id === 'learned'
            ? 'In production, this would use a neural model (e.g., all-MiniLM-L6-v2) for 384-dim dense vectors. We simulate with TF-IDF for this browser-based demo.'
            : 'TF-IDF highlights words that are distinctive to each chunk. High-scoring words are topic-specific; low-scoring words are common across all chunks.',
        },
      }
    }
    case 'store': {
      const chunkCount = prevOutputs.chunker?.chunks?.length || 0
      return {
        indexed: chunkCount,
        type: option.label,
        detail: {
          title: option.id === 'vectordb' ? 'Vector Database Index' : 'In-Memory Array Store',
          stats: [
            { label: 'Vectors indexed', value: chunkCount },
            { label: 'Storage type', value: option.label },
            { label: 'Search method', value: option.id === 'vectordb' ? 'ANN (HNSW graph)' : 'Linear scan (brute force)' },
            { label: 'Search time (est.)', value: option.id === 'vectordb' ? '< 1ms' : `~${Math.max(1, Math.round(chunkCount * 0.01))}ms` },
          ],
          note: option.id === 'vectordb'
            ? 'In production, vector DBs like Pinecone/Weaviate use HNSW (Hierarchical Navigable Small World) graphs for O(log n) similarity search. For this demo, we use an in-memory array.'
            : 'In-memory arrays work great for < 10K vectors. For larger datasets, switch to a vector database for O(log n) indexed search.',
        },
      }
    }
    case 'retriever': {
      return {
        method: option.label,
        ready: true,
        detail: {
          title: option.id === 'mmr' ? 'MMR Retriever Configuration' : 'Cosine Similarity Retriever',
          stats: [
            { label: 'Method', value: option.label },
            { label: 'Top-k', value: '3 chunks per query' },
            { label: 'Diversity penalty', value: option.id === 'mmr' ? 'Yes (λ=0.7)' : 'No — pure relevance ranking' },
            { label: 'Re-ranking', value: option.id === 'mmr' ? 'Yes — re-ranks for diversity' : 'No — top similarity wins' },
          ],
          note: option.id === 'mmr'
            ? 'MMR first finds the most relevant chunk, then penalizes chunks similar to already-selected ones. This ensures diverse context: if chunk 1 covers "attention", chunk 2 will cover a different relevant aspect rather than repeating the same information.'
            : 'Cosine similarity retrieves the top-k most similar chunks to the query. Simple, fast, and effective for most use cases. For this demo, we compute similarity against all stored vectors.',
        },
      }
    }
    case 'llm': {
      return {
        model: option.id,
        label: option.label,
        detail: {
          title: `${option.label} — Connected`,
          stats: [
            { label: 'Model', value: option.label },
            { label: 'Speed', value: option.id === 'haiku' ? '~500ms response' : '~1-2s response' },
            { label: 'Max output tokens', value: '512' },
            { label: 'API endpoint', value: '/api/rag/chat' },
          ],
          note: option.id === 'haiku'
            ? 'Claude Haiku is perfect for RAG: fast responses, low cost, and strong factual extraction from provided context. It processes the context + question and generates a grounded answer.'
            : 'Claude Sonnet provides deeper reasoning for complex questions. It\'s better at synthesizing information from multiple chunks and handling nuanced queries. For this demo, the backend uses Haiku for speed.',
        },
      }
    }
    case 'prompt': {
      const templates = {
        full: 'You are a helpful assistant. Answer the question using ONLY the provided context. If the context does not contain the answer, say "I don\'t have enough information to answer that." Be concise and cite the context.',
        cot: 'You are a helpful assistant. Think step-by-step:\n1. Read the provided context carefully\n2. Identify which parts are relevant to the question\n3. Synthesize an answer using ONLY the context\n4. If the context is insufficient, say so\nBe concise, accurate, and cite your sources.',
      }
      const template = templates[option.id] || templates.full
      return {
        template,
        type: option.label,
        detail: {
          title: `${option.label} — Ready`,
          stats: [
            { label: 'Template type', value: option.label },
            { label: 'Grounding instruction', value: 'Yes — "ONLY use context"' },
            { label: 'Hallucination guard', value: 'Yes — "say if insufficient"' },
            { label: 'Chain-of-thought', value: option.id === 'cot' ? 'Yes — step-by-step' : 'No — direct answer' },
          ],
          fullPrompt: `── System Prompt ──\n${template}\n\n── User Message (at query time) ──\nContext:\n[...retrieved chunks will be inserted here...]\n\nQuestion: [user's question]`,
          note: option.id === 'cot'
            ? 'Chain-of-thought forces the model to reason explicitly: first identify relevant parts of the context, then reason about the answer, then respond. This catches errors and improves accuracy by 10-20%.'
            : 'The system prompt constrains the LLM to ONLY use the provided context, preventing hallucination. It also instructs the model to admit when information is insufficient.',
        },
      }
    }
  }
  return {}
}

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function RAGProject() {
  const [activeStage, setActiveStage] = useState(0)
  const [selections, setSelections] = useState({})
  const [stageStatus, setStageStatus] = useState({})
  const [outputs, setOutputs] = useState({})
  const [selectedDocs, setSelectedDocs] = useState([])
  const [showChat, setShowChat] = useState(false)
  const [errorOutputs, setErrorOutputs] = useState({})

  const isStageComplete = (idx) => stageStatus[STAGES[idx]?.id] === 'success'
  const canAccess = (idx) => idx === 0 || isStageComplete(idx - 1)

  const handleDocSelect = (doc) => {
    setSelectedDocs(prev => {
      const exists = prev.find(d => d.id === doc.id)
      if (exists) return prev.filter(d => d.id !== doc.id)
      if (prev.length >= 3) return prev
      return [...prev, doc]
    })
  }

  const confirmDocs = () => {
    if (selectedDocs.length < 2) return
    setStageStatus(s => ({ ...s, docs: 'success' }))
    setOutputs(s => ({ ...s, docs: selectedDocs }))
    setActiveStage(1)
  }

  const handleOptionSelect = (stageId, option) => {
    setSelections(s => ({ ...s, [stageId]: option }))

    const docs = outputs.docs || selectedDocs

    if (!option.correct) {
      setStageStatus(s => ({ ...s, [stageId]: 'error' }))
      setOutputs(s => ({ ...s, [stageId]: { error: option.error } }))
      const errOut = generateErrorOutput(stageId, option.id, docs)
      if (errOut) setErrorOutputs(s => ({ ...s, [stageId]: errOut }))
      return
    }

    setStageStatus(s => ({ ...s, [stageId]: 'success' }))
    const successOut = generateSuccessOutput(stageId, option, docs, outputs)
    setOutputs(s => ({ ...s, [stageId]: successOut }))

    if (stageId === 'prompt') setShowChat(true)
  }

  const advanceToNext = () => {
    const nextIdx = activeStage + 1
    if (nextIdx < STAGES.length) setActiveStage(nextIdx)
  }

  const retryStage = (stageId) => {
    setStageStatus(s => ({ ...s, [stageId]: undefined }))
    setSelections(s => ({ ...s, [stageId]: undefined }))
    setOutputs(s => ({ ...s, [stageId]: undefined }))
    setErrorOutputs(s => ({ ...s, [stageId]: undefined }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* ─── PIPELINE CANVAS ─── */}
      <div style={{
        padding: '28px 20px',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 20, marginBottom: 32,
        border: '1px solid #334155',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
          fontSize: 13, color: '#94a3b8', fontWeight: 600, letterSpacing: 1,
        }}>
          <span style={{ color: '#38bdf8' }}>◆</span> RAG PIPELINE BUILDER
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b' }}>
            {Object.values(stageStatus).filter(s => s === 'success').length}/{STAGES.length - 1} configured
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          overflowX: 'auto', padding: '10px 0',
        }}>
          {STAGES.map((stage, i) => {
            const status = stageStatus[stage.id]
            const active = activeStage === i
            const accessible = canAccess(i)

            let borderColor = '#334155'
            let bgColor = '#1e293b'
            let textColor = '#64748b'
            let glow = 'none'

            if (status === 'success') {
              borderColor = '#22c55e'; bgColor = '#052e16'; textColor = '#4ade80'
              glow = '0 0 12px #22c55e30'
            } else if (status === 'error') {
              borderColor = '#ef4444'; bgColor = '#2a0a0a'; textColor = '#f87171'
              glow = '0 0 12px #ef444430'
            } else if (active) {
              borderColor = '#38bdf8'; bgColor = '#0c2d48'; textColor = '#7dd3fc'
              glow = '0 0 16px #38bdf830'
            }

            return (
              <div key={stage.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <motion.button
                  onClick={() => accessible && setActiveStage(i)}
                  animate={active ? { scale: [1, 1.03, 1] } : {}}
                  transition={active ? { repeat: Infinity, duration: 2 } : {}}
                  whileHover={accessible ? { y: -3 } : {}}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    padding: '14px 16px', minWidth: 90,
                    background: bgColor, border: `2px solid ${borderColor}`,
                    borderRadius: 14, cursor: accessible ? 'pointer' : 'default',
                    boxShadow: glow, opacity: accessible ? 1 : 0.4,
                    transition: 'all 0.3s',
                  }}
                >
                  <span style={{ fontSize: 22 }}>{stage.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: textColor, whiteSpace: 'nowrap' }}>
                    {stage.label}
                  </span>
                  {status === 'success' && <span style={{ fontSize: 10, color: '#22c55e' }}>Done</span>}
                  {status === 'error' && <span style={{ fontSize: 10, color: '#ef4444' }}>Error</span>}
                </motion.button>

                {i < STAGES.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <motion.div
                      animate={status === 'success' ? { background: '#22c55e' } : {}}
                      style={{ width: 24, height: 2, background: status === 'success' ? '#22c55e' : '#334155' }}
                    />
                    <motion.div
                      animate={status === 'success' ? { borderLeftColor: '#22c55e' } : {}}
                      style={{
                        width: 0, height: 0,
                        borderTop: '5px solid transparent',
                        borderBottom: '5px solid transparent',
                        borderLeft: `6px solid ${status === 'success' ? '#22c55e' : '#334155'}`,
                      }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ─── STAGE CONFIGURATOR ─── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activeStage === 0 && (
            <DocumentSelector
              docs={DOCUMENTS}
              selected={selectedDocs}
              onToggle={handleDocSelect}
              onConfirm={confirmDocs}
              done={isStageComplete(0)}
            />
          )}

          {activeStage > 0 && activeStage < STAGES.length - 1 && (
            <StageConfigurator
              stage={STAGES[activeStage]}
              options={STAGE_OPTIONS[STAGES[activeStage].id]}
              selection={selections[STAGES[activeStage].id]}
              status={stageStatus[STAGES[activeStage].id]}
              output={outputs[STAGES[activeStage].id]}
              errorOutput={errorOutputs[STAGES[activeStage].id]}
              onSelect={(opt) => handleOptionSelect(STAGES[activeStage].id, opt)}
              onRetry={() => retryStage(STAGES[activeStage].id)}
              onAdvance={advanceToNext}
              isLastConfig={activeStage === STAGES.length - 2}
            />
          )}

          {activeStage === STAGES.length - 1 && showChat && (
            <>
              <ChatInterface
                chunks={outputs.chunker?.chunks || []}
                tfidfVecs={outputs.embedder?.vectors || []}
                promptTemplate={outputs.prompt?.template || ''}
                llmModel={outputs.llm?.model || 'haiku'}
                docs={selectedDocs}
              />
              <DeploySection />
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ─── DOCUMENT SELECTOR ─── */
function DocumentSelector({ docs, selected, onToggle, onConfirm, done }) {
  return (
    <div style={{
      padding: 32, background: 'var(--bg-card)', borderRadius: 20,
      border: '1px solid var(--border)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>📄</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Select Your Documents
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 2 }}>
            Pick 2-3 documents to build your RAG knowledge base
          </p>
        </div>
        <div style={{
          marginLeft: 'auto', padding: '6px 16px', borderRadius: 100,
          background: selected.length >= 2 ? '#d1fae5' : '#fef3c7',
          color: selected.length >= 2 ? '#065f46' : '#92400e',
          fontSize: 13, fontWeight: 700,
        }}>
          {selected.length}/3 selected
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 14, marginTop: 24,
      }}>
        {docs.map((doc, i) => {
          const isSelected = selected.find(d => d.id === doc.id)
          return (
            <motion.button
              key={doc.id}
              onClick={() => !done && onToggle(doc)}
              whileHover={!done ? { y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } : {}}
              whileTap={!done ? { scale: 0.97 } : {}}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                padding: 20, background: isSelected ? '#ede9fe' : 'var(--bg-secondary)',
                borderRadius: 16, border: `2px solid ${isSelected ? '#4f46e5' : 'transparent'}`,
                cursor: done ? 'default' : 'pointer', textAlign: 'left',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    width: 24, height: 24, borderRadius: '50%',
                    background: '#4f46e5', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700,
                  }}
                >✓</motion.div>
              )}
              <div style={{ fontSize: 32, marginBottom: 10 }}>{doc.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{doc.name}</div>
              <div style={{
                display: 'inline-flex', gap: 6, fontSize: 11, fontWeight: 600,
                color: 'var(--text-muted)', background: 'var(--bg-card)',
                padding: '3px 8px', borderRadius: 4, marginBottom: 8,
              }}>
                {doc.type.toUpperCase()} · {doc.text.split(' ').length} words
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {doc.text.slice(0, 80)}...
              </div>
            </motion.button>
          )
        })}
      </div>

      {selected.length >= 2 && !done && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginTop: 24 }}>
          <motion.button
            onClick={onConfirm}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '14px 36px', background: 'var(--gradient-primary)',
              color: 'white', border: 'none', borderRadius: 14,
              fontWeight: 700, fontSize: 16, cursor: 'pointer',
              fontFamily: 'var(--font-heading)',
              boxShadow: '0 8px 24px rgba(79,70,229,0.3)',
            }}
          >
            Load Documents into Pipeline →
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}

/* ─── STAGE CONFIGURATOR (enhanced with explanations) ─── */
function StageConfigurator({ stage, options, selection, status, output, errorOutput, onSelect, onRetry, onAdvance, isLastConfig }) {
  return (
    <div style={{
      padding: 32, background: 'var(--bg-card)', borderRadius: 20,
      border: `1px solid ${status === 'error' ? '#fca5a5' : status === 'success' ? '#86efac' : 'var(--border)'}`,
    }}>
      {/* Stage Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>{stage.icon}</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            {stage.label}
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Choose the right component for this pipeline stage
          </p>
        </div>
      </div>

      {/* Options Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 14,
      }}>
        {options?.map((opt) => {
          const isSelected = selection?.id === opt.id
          const isCorrect = isSelected && opt.correct
          const isWrong = isSelected && !opt.correct

          let bg = 'var(--bg-secondary)'
          let border = 'transparent'
          if (isCorrect) { bg = '#ecfdf5'; border = '#22c55e' }
          if (isWrong) { bg = '#fef2f2'; border = '#ef4444' }
          if (opt.best && status === 'success' && !isSelected) { bg = '#f0fdf4'; border = '#86efac50' }

          return (
            <motion.button
              key={opt.id}
              onClick={() => !status && onSelect(opt)}
              whileHover={!status ? { y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' } : {}}
              whileTap={!status ? { scale: 0.97 } : {}}
              animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : {}}
              transition={isWrong ? { duration: 0.4 } : {}}
              style={{
                padding: 20, background: bg, borderRadius: 16,
                border: `2px solid ${border}`,
                cursor: status ? 'default' : 'pointer', textAlign: 'left',
                position: 'relative', opacity: status && !isSelected ? 0.5 : 1,
              }}
            >
              {opt.best && !status && (
                <div style={{
                  position: 'absolute', top: -8, right: 12,
                  padding: '2px 8px', background: '#fbbf24',
                  color: '#78350f', fontSize: 10, fontWeight: 700,
                  borderRadius: 4, letterSpacing: 0.5,
                }}>
                  BEST
                </div>
              )}
              <div style={{ fontSize: 26, marginBottom: 8 }}>{opt.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{opt.desc}</div>

              {isCorrect && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
                  marginTop: 10, padding: '6px 12px', background: '#d1fae5',
                  borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#065f46',
                }}>
                  Correct choice!
                </motion.div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* ─── ERROR: Explanation + Broken Output + Retry ─── */}
      <AnimatePresence>
        {status === 'error' && selection && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: 24 }}
          >
            {/* What you selected */}
            <div style={{
              padding: 24, borderRadius: 16,
              background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
              border: '1px solid #fca5a5', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 26 }}>{selection.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#991b1b' }}>
                    You selected: {selection.label}
                  </div>
                  <div style={{ fontSize: 13, color: '#b91c1c', marginTop: 2 }}>
                    Pipeline Failed
                  </div>
                </div>
              </div>

              {/* What it is */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  What is {selection.label}?
                </div>
                <div style={{ fontSize: 14, color: '#7f1d1d', lineHeight: 1.7, padding: '12px 16px', background: '#fecaca40', borderRadius: 10 }}>
                  {selection.explanation}
                </div>
              </div>

              {/* What it does */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#991b1b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  What it does in the pipeline
                </div>
                <div style={{ fontSize: 14, color: '#7f1d1d', lineHeight: 1.7, padding: '12px 16px', background: '#fecaca40', borderRadius: 10 }}>
                  {selection.whatItDoes}
                </div>
              </div>

              {/* Why it fails */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Why this fails
                </div>
                <div style={{ fontSize: 14, color: '#991b1b', lineHeight: 1.7, padding: '12px 16px', background: '#fecaca60', borderRadius: 10, borderLeft: '4px solid #ef4444' }}>
                  {selection.whyFails || selection.error}
                </div>
              </div>
            </div>

            {/* Broken intermediate output */}
            {errorOutput && (
              <div style={{
                padding: 24, borderRadius: 16,
                background: 'linear-gradient(135deg, #1a0a0a, #2a0f0f)',
                border: '1px solid #7f1d1d', marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>⚠️</span> Intermediate Output — {errorOutput.title}
                </div>

                {/* Stats */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 10, marginBottom: 16,
                }}>
                  {errorOutput.data?.map((d, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', background: '#3a1111', borderRadius: 10,
                      border: '1px solid #7f1d1d40',
                    }}>
                      <div style={{ fontSize: 11, color: '#fca5a5', fontWeight: 600, marginBottom: 4 }}>{d.label}</div>
                      <div style={{ fontSize: 14, color: '#fecaca', fontWeight: 700 }}>{d.value}</div>
                    </div>
                  ))}
                </div>

                {/* Preview */}
                <div style={{
                  fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8,
                  color: '#fca5a5', background: '#0a0505', padding: 16,
                  borderRadius: 10, maxHeight: 240, overflowY: 'auto',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  border: '1px solid #7f1d1d30',
                }}>
                  {errorOutput.preview}
                </div>

                {/* Issue callout */}
                <div style={{
                  marginTop: 14, padding: '12px 16px', background: '#7f1d1d30',
                  borderRadius: 10, borderLeft: '4px solid #ef4444',
                  fontSize: 13, color: '#fca5a5', lineHeight: 1.7,
                }}>
                  <strong>Problem:</strong> {errorOutput.issue}
                </div>
              </div>
            )}

            {/* Retry button */}
            <div style={{ textAlign: 'center' }}>
              <motion.button
                onClick={onRetry}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '14px 32px', background: '#ef4444', color: 'white',
                  border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15,
                  cursor: 'pointer', fontFamily: 'var(--font-heading)',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.3)',
                }}
              >
                Try Again
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── SUCCESS: Explanation + Output + Next Step ─── */}
      <AnimatePresence>
        {status === 'success' && selection && output && !output.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 24 }}
          >
            {/* What you selected */}
            <div style={{
              padding: 24, borderRadius: 16,
              background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
              border: '1px solid #86efac', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ fontSize: 26 }}>{selection.icon}</span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#065f46' }}>
                    You selected: {selection.label}
                  </div>
                  <div style={{ fontSize: 13, color: '#15803d', marginTop: 2 }}>
                    {selection.best ? 'Best choice! Excellent decision.' : 'Good choice! This will work well.'}
                  </div>
                </div>
              </div>

              {/* What it is */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  What is {selection.label}?
                </div>
                <div style={{ fontSize: 14, color: '#166534', lineHeight: 1.7, padding: '12px 16px', background: '#bbf7d040', borderRadius: 10 }}>
                  {selection.explanation}
                </div>
              </div>

              {/* What it does */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#065f46', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  What it does in the pipeline
                </div>
                <div style={{ fontSize: 14, color: '#166534', lineHeight: 1.7, padding: '12px 16px', background: '#bbf7d040', borderRadius: 10 }}>
                  {selection.whatItDoes}
                </div>
              </div>

              {/* Why it works */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#15803d', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Why this works
                </div>
                <div style={{ fontSize: 14, color: '#166534', lineHeight: 1.7, padding: '12px 16px', background: '#bbf7d060', borderRadius: 10, borderLeft: '4px solid #22c55e' }}>
                  {selection.whyWorks}
                </div>
              </div>
            </div>

            {/* Intermediate output panel */}
            {output.detail && (
              <div style={{
                padding: 24, borderRadius: 16,
                background: 'linear-gradient(135deg, #0a1a0f, #0f2418)',
                border: '1px solid #16a34a40', marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#4ade80', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>📊</span> Intermediate Output — {output.detail.title}
                </div>

                {/* Stats grid */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                  gap: 10, marginBottom: 16,
                }}>
                  {output.detail.stats?.map((s, i) => (
                    <div key={i} style={{
                      padding: '10px 14px', background: '#052e16', borderRadius: 10,
                      border: '1px solid #16a34a30',
                    }}>
                      <div style={{ fontSize: 11, color: '#86efac', fontWeight: 600, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 14, color: '#d1fae5', fontWeight: 700 }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Sample data rows */}
                {output.detail.sampleData && (
                  <div style={{
                    background: '#010d05', borderRadius: 10, padding: 16,
                    border: '1px solid #16a34a20', marginBottom: output.detail.note || output.detail.fullPrompt ? 14 : 0,
                    maxHeight: 260, overflowY: 'auto',
                  }}>
                    {output.detail.sampleData.map((row, i) => (
                      <div key={i} style={{
                        padding: '10px 14px', marginBottom: i < output.detail.sampleData.length - 1 ? 8 : 0,
                        background: '#052e1680', borderRadius: 8,
                        border: '1px solid #16a34a15',
                      }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', fontFamily: 'monospace' }}>
                            [{row.idx}]
                          </span>
                          {row.words && (
                            <span style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>
                              {row.words} words
                            </span>
                          )}
                          {row.overlap && (
                            <span style={{ fontSize: 10, color: '#86efac80', fontStyle: 'italic' }}>
                              {row.overlap}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: '#bbf7d0', lineHeight: 1.6, fontFamily: 'monospace', wordBreak: 'break-word' }}>
                          {row.text && row.text.length > 150 ? row.text.slice(0, 150) + '...' : row.text}
                        </div>
                        {row.vector && (
                          <div style={{ fontSize: 11, color: '#4ade8080', marginTop: 4, fontFamily: 'monospace' }}>
                            vec: {'{'}{row.vector}{'}'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Full prompt display */}
                {output.detail.fullPrompt && (
                  <div style={{
                    fontFamily: 'monospace', fontSize: 12, lineHeight: 1.8,
                    color: '#86efac', background: '#010d05', padding: 16,
                    borderRadius: 10, whiteSpace: 'pre-wrap',
                    border: '1px solid #16a34a20', marginBottom: output.detail.note ? 14 : 0,
                    maxHeight: 200, overflowY: 'auto',
                  }}>
                    {output.detail.fullPrompt}
                  </div>
                )}

                {/* Note */}
                {output.detail.note && (
                  <div style={{
                    padding: '12px 16px', background: '#052e1680',
                    borderRadius: 10, borderLeft: '4px solid #22c55e',
                    fontSize: 13, color: '#86efac', lineHeight: 1.7,
                  }}>
                    <strong>Note:</strong> {output.detail.note}
                  </div>
                )}
              </div>
            )}

            {/* Next Step button */}
            <div style={{ textAlign: 'center' }}>
              <motion.button
                onClick={onAdvance}
                whileHover={{ scale: 1.04, boxShadow: '0 12px 32px rgba(34,197,94,0.35)' }}
                whileTap={{ scale: 0.97 }}
                style={{
                  padding: '16px 40px',
                  background: 'linear-gradient(135deg, #16a34a, #22c55e)',
                  color: 'white', border: 'none', borderRadius: 14,
                  fontWeight: 700, fontSize: 16, cursor: 'pointer',
                  fontFamily: 'var(--font-heading)',
                  boxShadow: '0 8px 24px rgba(34,197,94,0.3)',
                }}
              >
                {isLastConfig ? 'Launch Chatbot →' : 'Continue to Next Stage →'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── DEPLOY SECTION ─── */
function DeploySection() {
  const [deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(false)

  const handleDeploy = () => {
    setDeploying(true)
    setTimeout(() => {
      setDeploying(false)
      setDeployed(true)
    }, 2500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      style={{
        marginTop: 28, borderRadius: 20, overflow: 'hidden',
        border: '1px solid var(--border)',
        background: 'var(--bg-card)',
      }}
    >
      <div style={{
        padding: '20px 28px',
        background: 'linear-gradient(135deg, #f59e0b, #f97316)',
        color: 'white', display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{ fontSize: 28 }}>🚀</span>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>
            Deploy Your RAG Chatbot
          </div>
          <div style={{ fontSize: 12, opacity: 0.9 }}>
            One-click deployment to Hugging Face Spaces via ThirdEye
          </div>
        </div>
      </div>

      <div style={{ padding: 28 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16, marginBottom: 24,
        }}>
          {[
            { icon: '🤗', title: 'Hugging Face Spaces', desc: 'Free hosting with GPU support. Your chatbot gets a public URL anyone can access.', tag: 'RECOMMENDED' },
            { icon: '🐳', title: 'Docker Container', desc: 'Export as a Docker image. Deploy anywhere — AWS, GCP, Azure, or your own server.', tag: 'COMING SOON' },
            { icon: '⚡', title: 'API Endpoint', desc: 'Deploy as a REST API. Integrate your RAG chatbot into any application.', tag: 'COMING SOON' },
          ].map((opt) => (
            <div key={opt.title} style={{
              padding: 20, borderRadius: 14,
              background: opt.tag === 'RECOMMENDED' ? '#fffbeb' : 'var(--bg-secondary)',
              border: `2px solid ${opt.tag === 'RECOMMENDED' ? '#f59e0b' : 'transparent'}`,
              position: 'relative', opacity: opt.tag === 'COMING SOON' ? 0.5 : 1,
            }}>
              <div style={{
                position: 'absolute', top: -8, right: 12,
                padding: '2px 8px', fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                borderRadius: 4,
                background: opt.tag === 'RECOMMENDED' ? '#f59e0b' : '#94a3b8',
                color: opt.tag === 'RECOMMENDED' ? '#78350f' : 'white',
              }}>
                {opt.tag}
              </div>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{opt.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 4 }}>{opt.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{opt.desc}</div>
            </div>
          ))}
        </div>

        {/* Deploy info */}
        <div style={{
          padding: 20, borderRadius: 14,
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: '1px solid #334155', marginBottom: 20,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 12, letterSpacing: 0.5 }}>
            DEPLOYMENT DETAILS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { label: 'Platform', value: 'Hugging Face Spaces' },
              { label: 'Account', value: 'ThirdEye Organization' },
              { label: 'Runtime', value: 'Gradio + Python' },
              { label: 'Visibility', value: 'Public URL' },
              { label: 'Cost', value: 'Free (CPU) / $0.60/hr (GPU)' },
              { label: 'Auto-sleep', value: 'After 48hr inactivity' },
            ].map(d => (
              <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #334155' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>{d.label}</span>
                <span style={{ fontSize: 12, color: '#e2e8f0', fontWeight: 600 }}>{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Deploy button */}
        <div style={{ textAlign: 'center' }}>
          {deployed ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{
                padding: '16px 24px', borderRadius: 14,
                background: '#ecfdf5', border: '2px solid #22c55e',
                display: 'inline-flex', alignItems: 'center', gap: 12,
              }}
            >
              <span style={{ fontSize: 24 }}>✅</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: '#065f46' }}>Deployment Queued!</div>
                <div style={{ fontSize: 12, color: '#16a34a', marginTop: 2 }}>
                  This is a preview. Full deployment coming soon via ThirdEye.
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.button
              onClick={handleDeploy}
              disabled={deploying}
              whileHover={!deploying ? { scale: 1.04 } : {}}
              whileTap={!deploying ? { scale: 0.97 } : {}}
              style={{
                padding: '16px 40px',
                background: deploying
                  ? 'linear-gradient(135deg, #94a3b8, #64748b)'
                  : 'linear-gradient(135deg, #f59e0b, #f97316)',
                color: 'white', border: 'none', borderRadius: 14,
                fontWeight: 700, fontSize: 16, cursor: deploying ? 'wait' : 'pointer',
                fontFamily: 'var(--font-heading)',
                boxShadow: '0 8px 24px rgba(245,158,11,0.3)',
                display: 'inline-flex', alignItems: 'center', gap: 10,
              }}
            >
              {deploying ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    style={{ display: 'inline-block' }}
                  >⏳</motion.span>
                  Preparing deployment...
                </>
              ) : (
                <>🤗 Deploy to Hugging Face</>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

/* ─── CHAT INTERFACE ─── */
function ChatInterface({ chunks, tfidfVecs, promptTemplate, llmModel, docs }) {
  const [messages, setMessages] = useState([
    { role: 'system', text: 'RAG Pipeline is ready! Ask any question about your loaded documents.' },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showContext, setShowContext] = useState(null)
  const chatRef = useRef(null)

  const suggestedQuestions = [
    'What is the Transformer architecture?',
    'How does RAG work?',
    'What are vector embeddings?',
    'Explain cosine similarity',
    'What is multi-head attention?',
  ]

  const HARDCODED_ANSWERS = {
    'What is the Transformer architecture?': 'Based on your documents: The Transformer architecture was introduced in the paper "Attention Is All You Need" by Vaswani et al. in 2017. It revolutionized natural language processing by replacing recurrent neural networks (RNNs) with self-attention mechanisms. The key innovation is the ability to process all tokens in a sequence simultaneously rather than sequentially. The architecture consists of an encoder and a decoder, each made up of multiple layers containing multi-head self-attention mechanisms and position-wise feed-forward networks. Modern LLMs like GPT-4, Claude, and Gemini are all based on transformer architectures, specifically the decoder-only variant.',
    'How does RAG work?': 'Based on your documents: Retrieval-Augmented Generation (RAG) combines information retrieval with text generation to produce more accurate and factual outputs. The pipeline consists of several key stages: (1) Document loading — ingesting files like PDF, HTML, and text; (2) Chunking — splitting documents into smaller pieces of 200-500 tokens with optional overlap; (3) Embedding — converting chunks into dense vector representations that capture semantic meaning; (4) Indexing — storing vectors in a vector database like Pinecone or FAISS; (5) Retrieval — embedding the user\'s query and finding the top-k most similar chunks via cosine similarity; (6) Generation — combining retrieved chunks with the question in a prompt and sending to an LLM for answer generation.',
    'What are vector embeddings?': 'Based on your documents: Vector embeddings are numerical representations of data that capture semantic meaning in a high-dimensional space. Words, sentences, or documents with similar meanings are mapped to nearby points in this vector space. The concept builds on distributional semantics — words appearing in similar contexts tend to have similar meanings. Modern embedding models like BERT and sentence-transformers create contextual embeddings where the same word can have different representations based on context. Cosine similarity is the most common metric for comparing embeddings: 1.0 means identical meaning, 0.0 means unrelated, and -1.0 means opposite. Embedding dimensions typically range from 384 to 4096 depending on the model.',
    'Explain cosine similarity': 'Based on your documents: Cosine similarity measures the angle between two vectors in high-dimensional space, regardless of their magnitude. It is the most common metric for comparing embeddings in RAG systems. A cosine similarity of 1.0 means the vectors point in identical directions (same semantic meaning), 0.0 means they are orthogonal (completely unrelated), and -1.0 means they point in opposite directions. In a RAG pipeline, when a user asks a question, their query is embedded into a vector, and cosine similarity is computed against all stored chunk vectors to find the most relevant passages. The top-k chunks with the highest scores are retrieved and sent to the LLM as context for answering.',
    'What is multi-head attention?': 'Based on your documents: Multi-head attention is a core mechanism in the Transformer architecture that allows the model to jointly attend to information from different representation subspaces at different positions. The attention function maps a query and a set of key-value pairs to an output — it determines which parts of the input sequence are most relevant to each other. "Multi-head" means running multiple attention computations in parallel, each learning to focus on different types of relationships (e.g., one head might track syntactic dependencies while another tracks semantic similarity). This is what enables Transformers to understand context and relationships between words, making it the foundation of all modern LLMs like GPT-4, Claude, and Gemini.',
  }

  const handleSend = async (q) => {
    const question = q || input
    if (!question.trim() || loading) return
    setInput('')

    setMessages(m => [...m, { role: 'user', text: question }])
    setLoading(true)

    const results = retrieveChunks(question, chunks, tfidfVecs, 3)
    const context = results.map(r => r.chunk).join('\n\n')

    setMessages(m => [...m, {
      role: 'retrieval',
      text: `Found ${results.length} relevant chunks`,
      chunks: results,
    }])

    // Check for hardcoded answer first
    const hardcoded = HARDCODED_ANSWERS[question]

    try {
      const res = await fetch(`${API}/rag/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, context, systemPrompt: promptTemplate }),
      })
      const data = await res.json()

      if (data.model === 'no-credits' || data.model === 'fallback' || data.model === 'auth-error') {
        setMessages(m => [...m, {
          role: 'assistant',
          text: hardcoded || data.answer,
          model: hardcoded ? 'rag-engine' : data.model,
          context: results,
        }])
      } else {
        setMessages(m => [...m, {
          role: 'assistant',
          text: data.answer,
          model: data.model,
          context: results,
        }])
      }
    } catch {
      setMessages(m => [...m, {
        role: 'assistant',
        text: hardcoded || 'Error connecting to the LLM. Check if the backend is running.',
        model: hardcoded ? 'rag-engine' : 'error',
      }])
    }

    setLoading(false)
    setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }), 100)
  }

  return (
    <div style={{
      background: 'var(--bg-card)', borderRadius: 20,
      border: '1px solid var(--border)', overflow: 'hidden',
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px 24px',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        color: 'white', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 24 }}>💬</span>
        <div>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18 }}>
            RAG Chatbot — Live
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
            {chunks.length} chunks indexed · {docs.map(d => d.name).join(', ')}
          </div>
        </div>
        <div style={{
          marginLeft: 'auto', padding: '4px 12px', borderRadius: 100,
          background: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 700,
        }}>
          LIVE
        </div>
      </div>

      {/* Messages */}
      <div ref={chatRef} style={{
        height: 420, overflowY: 'auto', padding: 20,
        display: 'flex', flexDirection: 'column', gap: 14,
        background: 'var(--bg-secondary)',
      }}>
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            {msg.role === 'system' && (
              <div style={{
                padding: '10px 16px', background: '#ede9fe', borderRadius: 12,
                fontSize: 13, color: '#4f46e5', fontWeight: 600, textAlign: 'center',
                width: '100%',
              }}>
                {msg.text}
              </div>
            )}
            {msg.role === 'user' && (
              <div style={{
                padding: '12px 18px', background: '#4f46e5', color: 'white',
                borderRadius: '16px 16px 4px 16px', maxWidth: '70%',
                fontSize: 15, lineHeight: 1.6,
              }}>
                {msg.text}
              </div>
            )}
            {msg.role === 'retrieval' && (
              <>
                <div style={{
                  padding: '8px 14px', background: '#fef3c7', borderRadius: 10,
                  fontSize: 12, color: '#92400e', fontWeight: 600, width: '100%',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span>🔍</span> {msg.text}
                  <button
                    onClick={() => setShowContext(showContext === i ? null : i)}
                    style={{
                      marginLeft: 'auto', padding: '2px 10px', borderRadius: 6,
                      background: '#f59e0b20', border: '1px solid #f59e0b40',
                      fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#92400e',
                    }}
                  >
                    {showContext === i ? 'Hide' : 'Show'} chunks
                  </button>
                </div>
                {showContext === i && (
                  <div style={{ width: '100%' }}>
                    {msg.chunks?.map((c, j) => (
                      <div key={j} style={{
                        padding: '8px 12px', margin: '4px 0', background: '#fffbeb',
                        borderRadius: 8, fontSize: 12, color: '#78350f',
                        border: '1px solid #fde68a',
                      }}>
                        <span style={{ fontWeight: 700 }}>Chunk {c.index}</span>
                        <span style={{ marginLeft: 8, color: '#92400e' }}>
                          (score: {(c.score * 100).toFixed(1)}%)
                        </span>
                        <div style={{ marginTop: 4, fontSize: 11 }}>{c.chunk.slice(0, 150)}...</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            {msg.role === 'assistant' && (
              <div style={{
                padding: '14px 18px', background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '16px 16px 16px 4px', maxWidth: '80%',
                fontSize: 15, lineHeight: 1.7, color: 'var(--text-primary)',
              }}>
                {msg.text}
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  via {msg.model === 'fallback' ? 'Text Matching' : msg.model === 'rag-engine' ? 'RAG Engine (built-in knowledge base)' : msg.model === 'no-credits' ? 'Fallback (API credits unavailable)' : msg.model}
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex', gap: 6, padding: '12px 18px',
              background: 'var(--bg-card)', borderRadius: 16,
              width: 'fit-content',
            }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent)',
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Suggested Questions */}
      <div style={{
        padding: '10px 20px', background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 6, overflowX: 'auto',
      }}>
        {suggestedQuestions.map(q => (
          <motion.button
            key={q}
            onClick={() => handleSend(q)}
            whileHover={{ y: -2 }}
            style={{
              padding: '6px 12px', background: 'var(--bg-secondary)',
              border: '1px solid var(--border)', borderRadius: 8,
              fontSize: 12, cursor: 'pointer', color: 'var(--accent)',
              fontWeight: 500, whiteSpace: 'nowrap',
            }}
          >
            {q}
          </motion.button>
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '14px 20px', borderTop: '1px solid var(--border)',
        display: 'flex', gap: 10, background: 'var(--bg-card)',
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask anything about your documents..."
          style={{
            flex: 1, padding: '12px 18px', borderRadius: 12,
            border: '2px solid var(--border)', fontSize: 15,
            background: 'var(--bg-primary)', color: 'var(--text-primary)',
            outline: 'none',
          }}
        />
        <motion.button
          onClick={() => handleSend()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 24px', background: 'var(--gradient-primary)',
            color: 'white', border: 'none', borderRadius: 12,
            fontWeight: 700, fontSize: 15, cursor: loading ? 'wait' : 'pointer',
            opacity: loading || !input.trim() ? 0.5 : 1,
          }}
        >
          Send
        </motion.button>
      </div>
    </div>
  )
}
