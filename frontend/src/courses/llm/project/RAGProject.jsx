import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

/* ================================================================
   RAG CHATBOT PROJECT — Hands-On
   Steps:
   1. Intro: What is RAG & why it matters
   2. Pick a Document (sample PDFs)
   3. Chunk the Document (interactive)
   4. Create Embeddings (visual)
   5. Ask a Question → Retrieve relevant chunks
   6. Generate answer using LLM + context
   7. Full Pipeline playground
================================================================ */

const SAMPLE_DOCS = [
  {
    id: 'solar',
    name: 'The Solar System',
    icon: '🪐',
    text: `The Solar System consists of the Sun and the objects that orbit it. The Sun is a star at the center of our Solar System. It contains 99.86% of all mass in the Solar System. The eight planets in order from the Sun are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Earth is the third planet from the Sun and the only known planet to support life. Mars is often called the Red Planet because of iron oxide on its surface. Jupiter is the largest planet, with a mass greater than all other planets combined. Saturn is famous for its prominent ring system made of ice and rock particles. The asteroid belt lies between Mars and Jupiter. Beyond Neptune lies the Kuiper Belt, home to dwarf planet Pluto. The Solar System formed approximately 4.6 billion years ago from the gravitational collapse of a giant molecular cloud.`,
  },
  {
    id: 'ai',
    name: 'History of AI',
    icon: '🤖',
    text: `Artificial Intelligence was founded as an academic discipline in 1956 at the Dartmouth Conference. Early AI research focused on problem solving and symbolic methods. In the 1960s, the US Department of Defense started funding AI research. The first AI winter occurred in the 1970s when funding was cut due to unmet expectations. Expert systems became popular in the 1980s, using rule-based approaches. The second AI winter hit in the late 1980s when expert systems proved expensive to maintain. Machine learning gained momentum in the 1990s with statistical approaches. Deep learning emerged in 2006 when Geoffrey Hinton showed deep neural networks could be trained effectively. In 2012, AlexNet won the ImageNet competition, sparking the deep learning revolution. GPT-3 was released in 2020 with 175 billion parameters. ChatGPT launched in November 2022 and reached 100 million users in two months. Modern AI systems use transformer architectures and massive datasets for training.`,
  },
  {
    id: 'nutrition',
    name: 'Healthy Nutrition',
    icon: '🥗',
    text: `A balanced diet includes proteins, carbohydrates, fats, vitamins, and minerals. Proteins are essential for building and repairing body tissues. Good protein sources include meat, fish, eggs, beans, and nuts. Carbohydrates are the body's primary energy source. Complex carbohydrates like whole grains provide sustained energy. Simple sugars should be consumed in moderation. Healthy fats from olive oil, avocados, and nuts support brain function. Trans fats found in processed foods should be avoided. Vitamins and minerals are needed in small amounts but are crucial for health. Vitamin C supports the immune system and is found in citrus fruits. Iron is essential for blood health and is found in red meat and spinach. Drinking at least 8 glasses of water daily is recommended. Fiber from fruits, vegetables, and whole grains aids digestion. A Mediterranean diet rich in fruits, vegetables, and olive oil has been linked to longer life expectancy.`,
  },
]

/* ---- Step 1: Intro ---- */
function StepIntro({ onNext }) {
  return (
    <div>
      <Neuron mood="excited" size="large"
        message="Welcome to your first hands-on AI project! 🎉 You're going to build a RAG Chatbot — a system that can answer questions about ANY document you give it. This is the exact same technique that powers ChatGPT with file uploads, Notion AI, and enterprise search tools."
      />

      <SectionBlock icon="🔍" title="What is RAG?" color="#4f46e5" style={{ marginTop: 32 }}>
        <p style={{ fontSize: 17, lineHeight: 1.75, color: 'var(--text-secondary)', marginBottom: 20 }}>
          <strong>RAG = Retrieval-Augmented Generation.</strong> Instead of relying only on what the LLM memorized during training,
          RAG first <em>retrieves</em> relevant information from your documents, then feeds that context to the LLM to <em>generate</em> an accurate answer.
        </p>

        {/* RAG Pipeline Diagram */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', padding: 20, background: 'var(--bg-secondary)', borderRadius: 16, marginBottom: 20 }}>
          {['📄 Your Document', '→', '✂️ Chunk It', '→', '🔢 Embed Chunks', '→', '❓ User Question', '→', '🔍 Find Relevant Chunks', '→', '🧠 LLM + Context', '→', '💬 Accurate Answer'].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ padding: s === '→' ? '0 2px' : '10px 14px', background: s === '→' ? 'transparent' : 'var(--bg-card)', borderRadius: 10, fontSize: s === '→' ? 18 : 13, fontWeight: s === '→' ? 400 : 600, color: s === '→' ? 'var(--accent)' : 'var(--text-primary)', border: s === '→' ? 'none' : '1px solid var(--border)' }}>
              {s}
            </motion.div>
          ))}
        </div>

        <NeuronTip type="example">
          <strong>Why not just give the LLM the whole document?</strong> LLMs have limited context windows. A 500-page PDF won't fit.
          RAG solves this by only sending the <em>relevant parts</em> — like a librarian who finds the right page instead of handing you the whole book.
        </NeuronTip>
      </SectionBlock>

      <SectionBlock icon="🛠️" title="What You'll Build" color="#0ea5e9">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          {[
            { step: '1', label: 'Pick a Document', icon: '📄', desc: 'Choose a sample PDF/text' },
            { step: '2', label: 'Chunk It', icon: '✂️', desc: 'Split into small pieces' },
            { step: '3', label: 'Create Embeddings', icon: '🔢', desc: 'Convert text to vectors' },
            { step: '4', label: 'Ask & Retrieve', icon: '🔍', desc: 'Find relevant chunks' },
            { step: '5', label: 'Generate Answer', icon: '🧠', desc: 'LLM + context = answer' },
            { step: '6', label: 'Full Pipeline', icon: '🚀', desc: 'Run it end-to-end' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }}
              style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 14, textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Step {s.step}: {s.label}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <motion.button onClick={onNext} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          style={{ padding: '18px 48px', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: 16, fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)', cursor: 'pointer', boxShadow: 'var(--shadow-accent)' }}>
          Let's Start Building →
        </motion.button>
      </div>
    </div>
  )
}

/* ---- Step 2: Pick a Document ---- */
function StepPickDocument({ onSelect }) {
  return (
    <div>
      <Neuron mood="explaining" size="medium"
        message="First, we need a document for our chatbot to learn from. In real RAG systems, this could be PDFs, websites, databases — anything. Pick one of these sample documents:"
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginTop: 28 }}>
        {SAMPLE_DOCS.map(doc => (
          <motion.button key={doc.id} onClick={() => onSelect(doc)}
            whileHover={{ y: -6, boxShadow: 'var(--shadow-md)' }} whileTap={{ scale: 0.97 }}
            style={{ padding: 28, background: 'var(--bg-card)', border: '2px solid var(--border)', borderRadius: 20, cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>{doc.icon}</div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{doc.name}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {doc.text.slice(0, 120)}...
            </div>
            <div style={{ marginTop: 14, fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>
              📄 {doc.text.split(' ').length} words · Click to select
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

/* ---- Step 3: Chunk the Document ---- */
function StepChunk({ doc, onDone }) {
  const [chunkSize, setChunkSize] = useState(2)
  const sentences = doc.text.match(/[^.!?]+[.!?]+/g) || [doc.text]
  const chunks = []
  for (let i = 0; i < sentences.length; i += chunkSize) {
    chunks.push(sentences.slice(i, i + chunkSize).join(' ').trim())
  }
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div>
      <Neuron mood="explaining" size="medium"
        message="Now we need to split your document into smaller pieces called 'chunks'. Why? Because when someone asks a question, we only want to send the RELEVANT pieces to the LLM — not the whole thing. Try adjusting the chunk size below!"
      />

      <InteractiveDemo title="Chunk Your Document" instruction="Drag the slider to change chunk size (sentences per chunk). Watch how the document splits differently.">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Sentences per chunk:</span>
          <input type="range" min="1" max="4" value={chunkSize} onChange={e => { setChunkSize(parseInt(e.target.value)); setConfirmed(false) }}
            style={{ flex: 1, accentColor: '#4f46e5' }} />
          <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent)', minWidth: 30 }}>{chunkSize}</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          {chunks.map((chunk, i) => (
            <motion.div key={`${chunkSize}-${i}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              style={{ flex: '1 1 300px', padding: 16, background: 'var(--bg-card)', borderRadius: 14, border: `2px solid ${['#4f46e5', '#0ea5e9', '#10b981', '#f97316', '#ec4899', '#8b5cf6'][i % 6]}33`, fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -10, left: 12, padding: '2px 10px', background: ['#4f46e5', '#0ea5e9', '#10b981', '#f97316', '#ec4899', '#8b5cf6'][i % 6], color: 'white', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                Chunk {i + 1}
              </div>
              <div style={{ marginTop: 6 }}>{chunk}</div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: 'var(--bg-secondary)', borderRadius: 12 }}>
          <span style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            📊 <strong>{chunks.length} chunks</strong> created from {sentences.length} sentences
          </span>
          <motion.button onClick={() => { setConfirmed(true); setTimeout(onDone, 600) }}
            whileHover={{ scale: 1.04 }} disabled={confirmed}
            style={{ padding: '10px 24px', background: confirmed ? '#10b981' : 'var(--accent)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 600, cursor: confirmed ? 'default' : 'pointer', fontSize: 14 }}>
            {confirmed ? '✓ Chunks Confirmed!' : 'Confirm Chunks →'}
          </motion.button>
        </div>
      </InteractiveDemo>

      <NeuronTip type="deep">
        <strong>Chunk size matters:</strong> Too small = loses context. Too big = wastes the LLM's context window and reduces precision.
        Real RAG systems use 200-500 tokens per chunk with overlapping windows for best results.
      </NeuronTip>
    </div>
  )
}

/* ---- Step 4: Embeddings ---- */
function StepEmbeddings({ doc, onDone }) {
  const [embedded, setEmbedded] = useState([])
  const [processing, setProcessing] = useState(false)
  const sentences = doc.text.match(/[^.!?]+[.!?]+/g) || [doc.text]
  const chunks = []
  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push(sentences.slice(i, i + 2).join(' ').trim())
  }

  const startEmbedding = () => {
    setProcessing(true)
    setEmbedded([])
    chunks.forEach((_, i) => {
      setTimeout(() => {
        setEmbedded(prev => [...prev, i])
        if (i === chunks.length - 1) {
          setProcessing(false)
          setTimeout(onDone, 800)
        }
      }, (i + 1) * 400)
    })
  }

  // Fake embedding vector for display
  const fakeVector = (seed) => {
    const v = []
    for (let i = 0; i < 8; i++) v.push(((Math.sin(seed * (i + 1) * 7.3) + 1) / 2).toFixed(3))
    return v
  }

  return (
    <div>
      <Neuron mood="thinking" size="medium"
        message="Now comes the magic ✨ We convert each chunk into a list of numbers called an 'embedding' or 'vector'. These numbers capture the MEANING of the text — similar meanings have similar numbers. This is how we'll find relevant chunks later!"
      />

      <InteractiveDemo title="Create Embeddings" instruction="Click the button to convert each chunk into a vector embedding. Watch the numbers appear!">
        <div style={{ marginBottom: 20 }}>
          {chunks.map((chunk, i) => (
            <motion.div key={i}
              animate={embedded.includes(i) ? { borderColor: '#10b981' } : {}}
              style={{ display: 'flex', gap: 16, padding: 16, marginBottom: 10, background: 'var(--bg-card)', borderRadius: 14, border: `2px solid ${embedded.includes(i) ? '#10b981' : 'var(--border)'}`, alignItems: 'center', transition: 'border-color 0.3s' }}>
              <div style={{ minWidth: 70, textAlign: 'center' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>Chunk {i + 1}</div>
                {embedded.includes(i) ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ fontSize: 20 }}>✅</motion.div>
                ) : (
                  <div style={{ fontSize: 20 }}>📄</div>
                )}
              </div>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {chunk.slice(0, 100)}{chunk.length > 100 ? '...' : ''}
              </div>
              <div style={{ minWidth: 200, fontFamily: 'monospace', fontSize: 11, color: embedded.includes(i) ? '#10b981' : 'var(--text-muted)' }}>
                {embedded.includes(i) ? `[${fakeVector(i).join(', ')}]` : '[?, ?, ?, ?, ?, ?, ?, ?]'}
              </div>
            </motion.div>
          ))}
        </div>

        {embedded.length === 0 && (
          <motion.button onClick={startEmbedding} whileHover={{ scale: 1.04 }} disabled={processing}
            style={{ padding: '14px 32px', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)' }}>
            🔢 Generate Embeddings
          </motion.button>
        )}

        {embedded.length > 0 && embedded.length < chunks.length && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--accent)', fontWeight: 600, fontSize: 15 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>⚙️</motion.div>
            Processing chunk {embedded.length + 1} of {chunks.length}...
          </div>
        )}

        {embedded.length === chunks.length && embedded.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: 16, background: '#d1fae5', borderRadius: 12, color: '#065f46', fontWeight: 600, fontSize: 15, textAlign: 'center' }}>
            ✅ All {chunks.length} chunks embedded! Each is now a vector of numbers representing its meaning.
          </motion.div>
        )}
      </InteractiveDemo>

      <NeuronTip type="tip">
        In real systems, embeddings use models like OpenAI's <code>text-embedding-3-small</code> which produces 1536-dimensional vectors.
        We're showing 8 dimensions here for simplicity. These vectors live in a <strong>vector database</strong> (like Pinecone or ChromaDB) for fast similarity search.
      </NeuronTip>
    </div>
  )
}

/* ---- Step 5: Ask & Retrieve ---- */
function StepRetrieve({ doc, onDone }) {
  const [question, setQuestion] = useState('')
  const [retrieved, setRetrieved] = useState(null)
  const sentences = doc.text.match(/[^.!?]+[.!?]+/g) || [doc.text]
  const chunks = []
  for (let i = 0; i < sentences.length; i += 2) {
    chunks.push(sentences.slice(i, i + 2).join(' ').trim())
  }

  const sampleQuestions = doc.id === 'solar'
    ? ['What is the largest planet?', 'How old is the Solar System?', 'What is Mars called?']
    : doc.id === 'ai'
    ? ['When was AI founded?', 'What is ChatGPT?', 'What happened in 2012?']
    : ['What are good protein sources?', 'How much water should I drink?', 'What is a Mediterranean diet?']

  const retrieve = (q) => {
    const query = q || question
    if (!query.trim()) return
    setQuestion(query)
    // Simple keyword matching to simulate retrieval
    const scored = chunks.map((chunk, i) => {
      const words = query.toLowerCase().split(/\s+/)
      const score = words.reduce((acc, w) => acc + (chunk.toLowerCase().includes(w) ? 1 : 0), 0)
      return { chunk, index: i, score }
    }).sort((a, b) => b.score - a.score)
    setRetrieved(scored.slice(0, 3))
  }

  return (
    <div>
      <Neuron mood="explaining" size="medium"
        message="Now the fun part! 🔍 Type a question (or pick a suggested one). We'll search through our embedded chunks to find the most relevant ones. This is the 'Retrieval' in RAG!"
      />

      <InteractiveDemo title="Ask & Retrieve" instruction="Type a question about your document, then watch the system find the most relevant chunks.">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input value={question} onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && retrieve()}
            placeholder="Ask a question about the document..."
            style={{ flex: 1, padding: '14px 20px', borderRadius: 14, border: '2px solid var(--border)', fontSize: 16, background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <motion.button onClick={() => retrieve()} whileHover={{ scale: 1.04 }}
            style={{ padding: '14px 28px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: 15, whiteSpace: 'nowrap' }}>
            🔍 Search
          </motion.button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: '32px' }}>Try:</span>
          {sampleQuestions.map(q => (
            <motion.button key={q} onClick={() => retrieve(q)} whileHover={{ y: -2 }}
              style={{ padding: '6px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: 'var(--accent)', fontWeight: 500 }}>
              {q}
            </motion.button>
          ))}
        </div>

        {retrieved && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              🔍 Top 3 relevant chunks for: "{question}"
            </div>
            {retrieved.map((r, i) => (
              <motion.div key={r.index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                style={{ padding: 18, marginBottom: 10, background: i === 0 ? '#f0fdf4' : 'var(--bg-card)', borderRadius: 14, border: `2px solid ${i === 0 ? '#10b981' : 'var(--border)'}`, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 40, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: i === 0 ? '#10b981' : 'var(--text-muted)' }}>#{i + 1}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? '#10b981' : 'var(--text-muted)' }}>
                    {r.score > 0 ? `${Math.min(r.score * 33, 99)}%` : '10%'}
                  </div>
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  {r.chunk}
                </div>
              </motion.div>
            ))}
            <div style={{ textAlign: 'center', marginTop: 20 }}>
              <motion.button onClick={onDone} whileHover={{ scale: 1.04 }}
                style={{ padding: '12px 28px', background: '#10b981', color: 'white', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 15 }}>
                Got the chunks! Generate answer →
              </motion.button>
            </div>
          </motion.div>
        )}
      </InteractiveDemo>
    </div>
  )
}

/* ---- Step 6: Generate Answer ---- */
function StepGenerate({ doc, onDone }) {
  const [question, setQuestion] = useState('')
  const [generating, setGenerating] = useState(false)
  const [answer, setAnswer] = useState(null)
  const sentences = doc.text.match(/[^.!?]+[.!?]+/g) || [doc.text]
  const chunks = []
  for (let i = 0; i < sentences.length; i += 2) chunks.push(sentences.slice(i, i + 2).join(' ').trim())

  const sampleQs = doc.id === 'solar'
    ? ['What is the largest planet?', 'What is Earth?', 'How old is the Solar System?']
    : doc.id === 'ai'
    ? ['When was AI founded?', 'What is deep learning?', 'How many users did ChatGPT reach?']
    : ['What are good protein sources?', 'What fats should be avoided?', 'What is the Mediterranean diet?']

  const generate = (q) => {
    const query = q || question
    if (!query.trim()) return
    setQuestion(query)
    setGenerating(true)
    setAnswer(null)

    // Find relevant chunks
    const scored = chunks.map((chunk, i) => {
      const words = query.toLowerCase().split(/\s+/)
      const score = words.reduce((acc, w) => acc + (chunk.toLowerCase().includes(w) ? 1 : 0), 0)
      return { chunk, score }
    }).sort((a, b) => b.score - a.score)
    const topChunks = scored.slice(0, 2)
    const context = topChunks.map(c => c.chunk).join(' ')

    // Simulate LLM generation with a delay
    setTimeout(() => {
      // Extract a relevant sentence from context as the "generated" answer
      const contextSentences = context.match(/[^.!?]+[.!?]+/g) || [context]
      const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
      let best = contextSentences[0]
      let bestScore = 0
      contextSentences.forEach(s => {
        const sc = queryWords.reduce((acc, w) => acc + (s.toLowerCase().includes(w) ? 1 : 0), 0)
        if (sc > bestScore) { bestScore = sc; best = s }
      })

      setAnswer({
        context: topChunks.map(c => c.chunk),
        response: `Based on the document: ${best.trim()} This information was retrieved from the relevant sections of your uploaded document.`,
      })
      setGenerating(false)
    }, 2000)
  }

  return (
    <div>
      <Neuron mood="excited" size="medium"
        message="This is the final piece! 🧠 We take the retrieved chunks, combine them with your question into a prompt, and send it to the LLM. The LLM generates an answer grounded in YOUR document — not from its training data!"
      />

      <InteractiveDemo title="Generate RAG Answer" instruction="Ask a question. Watch the full pipeline: Question → Retrieve → Prompt → Generate.">
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input value={question} onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="Ask anything about the document..."
            style={{ flex: 1, padding: '14px 20px', borderRadius: 14, border: '2px solid var(--border)', fontSize: 16, background: 'var(--bg-card)', color: 'var(--text-primary)', outline: 'none' }}
          />
          <motion.button onClick={() => generate()} whileHover={{ scale: 1.04 }} disabled={generating}
            style={{ padding: '14px 28px', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, cursor: generating ? 'wait' : 'pointer', fontSize: 15 }}>
            {generating ? '⚙️ Generating...' : '🧠 Ask RAG'}
          </motion.button>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {sampleQs.map(q => (
            <motion.button key={q} onClick={() => generate(q)} whileHover={{ y: -2 }}
              style={{ padding: '6px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: 'var(--accent)', fontWeight: 500 }}>
              {q}
            </motion.button>
          ))}
        </div>

        {generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: 24, background: 'var(--bg-secondary)', borderRadius: 16, textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginBottom: 16 }}>
              {['🔍 Retrieving...', '📎 Building prompt...', '🧠 Generating...'].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0.3 }} animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.5 }}
                  style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)' }}>
                  {s}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {answer && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {/* The prompt visualization */}
            <div style={{ padding: 20, background: '#faf5ff', borderRadius: 16, border: '1px solid #e9d5ff', marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#6b21a8', marginBottom: 10 }}>📋 PROMPT SENT TO LLM:</div>
              <div style={{ fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6, color: '#4c1d95' }}>
                <div style={{ color: '#9333ea' }}>System: Answer based ONLY on the context below.</div>
                <div style={{ marginTop: 8 }}>Context:</div>
                {answer.context.map((c, i) => (
                  <div key={i} style={{ padding: 8, background: 'rgba(139,92,246,0.1)', borderRadius: 6, margin: '4px 0', fontSize: 12 }}>
                    [{i + 1}] {c.slice(0, 150)}...
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>Question: <strong>{question}</strong></div>
              </div>
            </div>

            {/* The answer */}
            <div style={{ padding: 24, background: '#f0fdf4', borderRadius: 16, border: '2px solid #86efac' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#065f46', marginBottom: 10 }}>🤖 RAG CHATBOT ANSWER:</div>
              <div style={{ fontSize: 17, lineHeight: 1.75, color: '#166534' }}>{answer.response}</div>
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <motion.button onClick={onDone} whileHover={{ scale: 1.04 }}
                style={{ padding: '14px 32px', background: '#10b981', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: 16, fontFamily: 'var(--font-heading)' }}>
                🎉 Complete Project →
              </motion.button>
            </div>
          </motion.div>
        )}
      </InteractiveDemo>
    </div>
  )
}

/* ---- Step 7: Completion ---- */
function StepComplete({ doc, onRestart }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
        style={{ fontSize: 80, marginBottom: 20 }}>🎉</motion.div>
      <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 36, fontWeight: 800, marginBottom: 12, color: 'var(--text-primary)' }}>
        Project Complete!
      </h2>
      <p style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 600, margin: '0 auto 32px' }}>
        You just built a RAG chatbot from scratch! You picked a document, chunked it, created embeddings,
        retrieved relevant sections, and generated grounded answers.
      </p>

      <SectionBlock icon="📝" title="What You Learned" color="#4f46e5">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { icon: '✂️', title: 'Chunking', desc: 'Splitting documents into digestible pieces for better retrieval precision' },
            { icon: '🔢', title: 'Embeddings', desc: 'Converting text to numerical vectors that capture semantic meaning' },
            { icon: '🔍', title: 'Retrieval', desc: 'Finding the most relevant chunks using vector similarity search' },
            { icon: '🧠', title: 'Generation', desc: 'Using retrieved context to ground LLM answers in facts' },
            { icon: '🔗', title: 'RAG Pipeline', desc: 'Connecting all pieces into an end-to-end question-answering system' },
            { icon: '⚡', title: 'Why RAG', desc: 'Reducing hallucinations by giving the LLM real source material' },
          ].map(item => (
            <motion.div key={item.title} whileHover={{ y: -3 }}
              style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 14, textAlign: 'center', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: 'var(--text-primary)' }}>{item.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      <NeuronTip type="deep">
        <strong>Next steps in the real world:</strong> Use LangChain or LlamaIndex to build production RAG pipelines.
        Store embeddings in vector databases like Pinecone, Weaviate, or ChromaDB. Use OpenAI or local models for generation.
        Add re-ranking, hybrid search, and evaluation metrics like faithfulness and relevancy scoring.
      </NeuronTip>

      <motion.button onClick={onRestart} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
        style={{ padding: '16px 40px', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: 16, fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading)', cursor: 'pointer', boxShadow: 'var(--shadow-accent)', marginTop: 24 }}>
        Try with a different document ↻
      </motion.button>
    </div>
  )
}

/* ================================================================
   MAIN PROJECT COMPONENT — Step Controller
================================================================ */
export default function RAGProject() {
  const [step, setStep] = useState(0) // 0=intro, 1=pick, 2=chunk, 3=embed, 4=retrieve, 5=generate, 6=done
  const [selectedDoc, setSelectedDoc] = useState(null)

  const steps = [
    { label: 'Intro', icon: '📖' },
    { label: 'Pick Doc', icon: '📄' },
    { label: 'Chunk', icon: '✂️' },
    { label: 'Embed', icon: '🔢' },
    { label: 'Retrieve', icon: '🔍' },
    { label: 'Generate', icon: '🧠' },
    { label: 'Done', icon: '🎉' },
  ]

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 40, justifyContent: 'center', flexWrap: 'wrap' }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <motion.div
              animate={i === step ? { scale: [1, 1.1, 1] } : {}}
              transition={i === step ? { repeat: Infinity, duration: 2 } : {}}
              style={{
                padding: '8px 16px', borderRadius: 10,
                background: i < step ? '#d1fae5' : i === step ? 'var(--accent)' : 'var(--bg-secondary)',
                color: i < step ? '#065f46' : i === step ? 'white' : 'var(--text-muted)',
                fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
                border: `1px solid ${i < step ? '#86efac' : i === step ? 'var(--accent)' : 'var(--border)'}`,
              }}>
              <span>{s.icon}</span> {s.label}
            </motion.div>
            {i < steps.length - 1 && (
              <div style={{ width: 20, height: 2, background: i < step ? '#10b981' : 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
          {step === 0 && <StepIntro onNext={() => setStep(1)} />}
          {step === 1 && <StepPickDocument onSelect={(doc) => { setSelectedDoc(doc); setStep(2) }} />}
          {step === 2 && selectedDoc && <StepChunk doc={selectedDoc} onDone={() => setStep(3)} />}
          {step === 3 && selectedDoc && <StepEmbeddings doc={selectedDoc} onDone={() => setStep(4)} />}
          {step === 4 && selectedDoc && <StepRetrieve doc={selectedDoc} onDone={() => setStep(5)} />}
          {step === 5 && selectedDoc && <StepGenerate doc={selectedDoc} onDone={() => setStep(6)} />}
          {step === 6 && <StepComplete doc={selectedDoc} onRestart={() => { setStep(1); setSelectedDoc(null) }} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
