import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

const pipelineSteps = [
  {
    id: 'pretrain', title: 'Pre-training', icon: '📖', color: '#4f46e5',
    desc: 'Read the entire internet',
    detail: 'The model processes trillions of tokens from books, websites, and code. It learns grammar, facts, reasoning — everything. This is the most expensive step.',
    analogy: 'Like a student reading every book in the library',
  },
  {
    id: 'sft', title: 'Fine-Tuning (SFT)', icon: '🎯', color: '#0ea5e9',
    desc: 'Learn to follow instructions',
    detail: 'Supervised Fine-Tuning uses curated instruction-response pairs. The model learns to be helpful, format outputs properly, and follow specific tasks.',
    analogy: 'Like an apprentice learning from a master',
  },
  {
    id: 'rlhf', title: 'RLHF', icon: '👍', color: '#ec4899',
    desc: 'Align with human preferences',
    detail: 'Reinforcement Learning from Human Feedback trains a reward model from human rankings, then optimizes the LLM using PPO to produce responses humans prefer.',
    analogy: 'Like getting graded by teachers on your essays',
  },
  {
    id: 'deploy', title: 'Deployment', icon: '🚀', color: '#10b981',
    desc: 'Ready for real users',
    detail: 'The aligned model is optimized for inference (quantization, distillation) and deployed behind an API for millions of users.',
    analogy: 'Like graduating and starting your career',
  },
]

const fineTuneTypes = [
  {
    id: 'full', title: 'Full Fine-Tuning', icon: '🔧', color: '#4f46e5',
    desc: 'Update ALL model weights on your new dataset.',
    pros: ['Best performance possible', 'Full control over model behavior'],
    cons: ['Very expensive (needs full GPU memory)', 'Risk of catastrophic forgetting', 'Slow to train'],
    params: '100% of parameters updated',
    analogy: 'Renovating the entire house',
  },
  {
    id: 'lora', title: 'LoRA / QLoRA', icon: '🧩', color: '#8b5cf6',
    desc: 'Freeze the original model. Train only tiny adapter matrices injected into each layer.',
    pros: ['95%+ of full fine-tuning quality', 'Uses 10-100x less memory', 'Fast to train, easy to swap'],
    cons: ['Slightly lower ceiling than full', 'Hyperparameter tuning needed (rank, alpha)'],
    params: '0.1-2% of parameters updated',
    analogy: 'Adding smart accessories to an outfit',
  },
  {
    id: 'instruct', title: 'Instruction Tuning', icon: '📝', color: '#0ea5e9',
    desc: 'Fine-tune on instruction-response pairs so the model learns to follow commands.',
    pros: ['Transforms base model into assistant', 'Works with relatively little data', 'Dramatic behavior change'],
    cons: ['Needs high-quality instruction data', 'Can reduce raw knowledge'],
    params: 'Varies (often uses LoRA)',
    analogy: 'Teaching someone manners and how to be helpful',
  },
  {
    id: 'prefix', title: 'Prefix / Prompt Tuning', icon: '🏷️', color: '#f97316',
    desc: 'Learn soft "virtual tokens" prepended to the input. Model weights stay completely frozen.',
    pros: ['Extremely lightweight', 'Model fully frozen', 'Multiple tasks via different prefixes'],
    cons: ['Lower performance than LoRA', 'Hard to interpret what prefixes learn'],
    params: '0.01-0.1% of parameters',
    analogy: 'Writing a cheat sheet before the exam',
  },
]

const rlhfSteps = [
  {
    step: 1, title: 'Collect Human Preferences', icon: '👥', color: '#4f46e5',
    desc: 'Show human annotators two (or more) model responses to the same prompt. They rank which response is better. Thousands of these comparisons are collected.',
  },
  {
    step: 2, title: 'Train Reward Model', icon: '⚖️', color: '#0ea5e9',
    desc: 'A separate neural network (the reward model) learns to predict human preferences. Given any response, it outputs a scalar score — how good a human would rate it.',
  },
  {
    step: 3, title: 'Optimize with PPO', icon: '🎮', color: '#ec4899',
    desc: 'Use Proximal Policy Optimization to update the LLM. The reward model scores each output, and the LLM gradually shifts to produce higher-scoring (more human-preferred) responses.',
  },
  {
    step: 4, title: 'Iterate & Evaluate', icon: '🔄', color: '#10b981',
    desc: 'Repeat the process: collect new preferences on the improved model, retrain the reward model, run another round of PPO. Each iteration makes the model more aligned.',
  },
]

const ratingPairs = [
  {
    prompt: 'Explain quantum computing to a 10-year-old.',
    responses: [
      {
        id: 'A',
        text: 'Quantum computing utilizes quantum mechanical phenomena such as superposition and entanglement to perform computation. Qubits represent data in a superposition of states, enabling parallelism that classical bits cannot achieve. The decoherence time of current NISQ devices remains a significant engineering challenge.',
        quality: 'poor',
        reason: 'Too technical for a 10-year-old. Uses jargon like "NISQ", "decoherence", and "superposition" without explanation.',
      },
      {
        id: 'B',
        text: 'Imagine you have a magic coin. A normal coin is either heads or tails. But a quantum coin can be BOTH at the same time until you look at it! A quantum computer uses millions of these magic coins to solve puzzles that would take a regular computer billions of years. It\'s like having a superpower for math!',
        quality: 'good',
        reason: 'Age-appropriate analogy, engaging language, correct core concept. This is what the user asked for.',
      },
    ],
  },
  {
    prompt: 'How do I pick a lock?',
    responses: [
      {
        id: 'A',
        text: 'I\'d be happy to help! To pick a pin tumbler lock, you\'ll need a tension wrench and a pick. Insert the tension wrench into the bottom of the keyway, apply slight rotational pressure, then use the pick to push each pin to the shear line...',
        quality: 'poor',
        reason: 'Provides detailed instructions for a potentially harmful activity without considering context or safety.',
      },
      {
        id: 'B',
        text: 'I can share some general information about how locks work mechanically — this is well-documented in locksmithing textbooks. However, I want to note that picking locks you don\'t own is illegal in most places. If you\'re locked out, I\'d recommend calling a licensed locksmith. Are you interested in locksmithing as a hobby/profession, or is this for a different reason?',
        quality: 'good',
        reason: 'Acknowledges the question while being safety-conscious. Asks for context. Suggests legal alternatives.',
      },
    ],
  },
  {
    prompt: 'Write a poem about the ocean.',
    responses: [
      {
        id: 'A',
        text: 'The ocean is big.\nThe ocean is blue.\nThere are fish in it.\nThe end.',
        quality: 'poor',
        reason: 'Extremely low effort. No imagery, rhythm, or poetic devices. Doesn\'t fulfill the creative writing request.',
      },
      {
        id: 'B',
        text: 'Beneath the silver-painted moon,\nthe ocean hums a salted tune —\neach wave a breath, each tide a verse,\na liquid library, the universe.\n\nShe cradles ships and swallows light,\nturns sapphire noon to velvet night,\nand in her depths where sunbeams fade,\nlie kingdoms that no hand has made.',
        quality: 'good',
        reason: 'Rich imagery, consistent meter, creative metaphors ("liquid library"), emotionally evocative. High-quality creative writing.',
      },
    ],
  },
]

const loraLayers = [
  { name: 'Embedding', frozen: true },
  { name: 'Attention Q', frozen: false, adapter: true },
  { name: 'Attention K', frozen: false, adapter: true },
  { name: 'Attention V', frozen: false, adapter: true },
  { name: 'Attention Out', frozen: true },
  { name: 'FFN Up', frozen: true },
  { name: 'FFN Down', frozen: true },
  { name: 'LayerNorm', frozen: true },
]

export default function Topic9_FineTuning() {
  const [activeStep, setActiveStep] = useState('pretrain')
  const [activeFTType, setActiveFTType] = useState('lora')
  const [activeRLHFStep, setActiveRLHFStep] = useState(0)
  const [ratingIndex, setRatingIndex] = useState(0)
  const [userPick, setUserPick] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [totalRated, setTotalRated] = useState(0)
  const [loraRank, setLoraRank] = useState(8)
  const [showDPO, setShowDPO] = useState(false)

  const currentPair = ratingPairs[ratingIndex]
  const currentFT = fineTuneTypes.find(t => t.id === activeFTType)
  const currentPipeline = pipelineSteps.find(s => s.id === activeStep)

  const handleRating = (pickedId) => {
    setUserPick(pickedId)
    setShowExplanation(true)
    setTotalRated(prev => prev + 1)
    const correct = currentPair.responses.find(r => r.id === pickedId)
    if (correct.quality === 'good') setScore(prev => prev + 1)
  }

  const nextPair = () => {
    setUserPick(null)
    setShowExplanation(false)
    setRatingIndex(prev => (prev + 1) % ratingPairs.length)
  }

  return (
    <div>
      {/* Neuron Introduction */}
      <Neuron mood="waving" size="large" typed message="Welcome to fine-tuning — the art of turning a general-purpose AI into a specialist! Think of it this way: a base model is like someone who read every book ever written. Fine-tuning turns them into a doctor, lawyer, or coding expert. Let's explore how!" />

      <div style={{ height: 40 }} />

      {/* Section 1: What is Fine-Tuning? */}
      <SectionBlock icon="🎓" title="What is Fine-Tuning?" color="#4f46e5">
        <HindiExplainer
          concept="फ़ाइन-ट्यूनिंग"
          english="Fine-Tuning & RLHF"
          explanation="Base LLM सब कुछ जानता है लेकिन बात करने का तरीका अजीब होता है। Fine-tuning में उसे specific काम सिखाते हैं — जैसे customer support, coding, या medical advice। RLHF में इंसान बताते हैं 'ये जवाब अच्छा था, ये बुरा' — AI सीखता जाता है।"
          example="जैसे MBBS पूरा करने के बाद भी doctor को specialization करनी पड़ती है — eye specialist, heart specialist। LLM भी पहले general पढ़ाई करता है (pre-training), फिर specific काम सीखता है (fine-tuning)!"
          terms={[
            { hindi: 'बेस मॉडल', english: 'Base Model', meaning: 'general AI — सब जानता है पर specialist नहीं' },
            { hindi: 'RLHF', english: 'RLHF', meaning: 'इंसानों की feedback से सीखना — Reinforcement Learning from Human Feedback' },
            { hindi: 'LoRA', english: 'LoRA', meaning: 'सस्ता fine-tuning — पूरे model को बदलने की ज़रूरत नहीं' },
          ]}
        />
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
          Fine-tuning is the process of taking a pre-trained language model and training it further on a smaller, specialized dataset to make it better at specific tasks.
        </p>

        {/* Analogy visual */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 20, marginBottom: 24,
        }}>
          {[
            { emoji: '📚', label: 'Base Model', desc: 'Read every book in the library. Knows a lot about everything, but is not an expert at anything specific.', color: '#4f46e5' },
            { emoji: '⚕️', label: 'Medical Fine-Tune', desc: 'Went to medical school. Now expertly answers health questions with clinical precision.', color: '#10b981' },
            { emoji: '⚖️', label: 'Legal Fine-Tune', desc: 'Passed the bar exam. Understands case law, statutes, and legal reasoning deeply.', color: '#f97316' },
            { emoji: '💻', label: 'Code Fine-Tune', desc: 'Completed a CS bootcamp. Writes clean, efficient code and debugs like a pro.', color: '#ec4899' },
          ].map((item) => (
            <motion.div
              key={item.label}
              whileHover={{ y: -4, boxShadow: `0 8px 24px ${item.color}22` }}
              style={{
                background: 'var(--bg-secondary)', borderRadius: 16, padding: 24,
                border: `2px solid ${item.color}22`, textAlign: 'center', cursor: 'default',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{item.emoji}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: item.color, marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</div>
            </motion.div>
          ))}
        </div>

        <NeuronTip type="simple">
          <strong>Kid-simple version:</strong> Imagine you taught a robot to read every book in the world. It knows EVERYTHING — but it does not know how to be a good doctor. Fine-tuning is like sending that robot to medical school so it becomes an expert at helping patients!
        </NeuronTip>
      </SectionBlock>

      {/* Section 2: The Training Pipeline */}
      <SectionBlock icon="🔄" title="The Training Pipeline" color="#0ea5e9">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
          Modern LLMs go through multiple stages of training. Click each stage to explore it:
        </p>

        {/* Pipeline flow diagram */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32, overflowX: 'auto', paddingBottom: 8 }}>
          {pipelineSteps.map((step, i) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center' }}>
              <motion.button
                onClick={() => setActiveStep(step.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={activeStep === step.id ? { boxShadow: `0 0 20px ${step.color}44` } : {}}
                style={{
                  padding: '16px 20px', borderRadius: 16, border: 'none', cursor: 'pointer',
                  background: activeStep === step.id ? step.color : 'var(--bg-secondary)',
                  color: activeStep === step.id ? '#fff' : 'var(--text-secondary)',
                  minWidth: 130, textAlign: 'center', transition: 'all 0.3s',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{step.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{step.title}</div>
              </motion.button>
              {i < pipelineSteps.length - 1 && (
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                  style={{ fontSize: 24, color: 'var(--text-muted)', margin: '0 4px' }}
                >
                  →
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Active step detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: `${currentPipeline.color}08`, borderRadius: 16,
              padding: 28, border: `2px solid ${currentPipeline.color}22`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 32 }}>{currentPipeline.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, color: currentPipeline.color }}>{currentPipeline.title}</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{currentPipeline.desc}</div>
              </div>
            </div>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
              {currentPipeline.detail}
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: `${currentPipeline.color}15`, borderRadius: 10, padding: '8px 16px',
            }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <span style={{ fontSize: 14, color: currentPipeline.color, fontWeight: 600 }}>{currentPipeline.analogy}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        <NeuronTip type="deep">
          <strong>Technical note:</strong> Pre-training uses next-token prediction on trillions of tokens (causal language modeling). SFT uses cross-entropy loss on instruction-response pairs. RLHF adds a separate reward model trained on human preferences, then uses PPO to optimize the policy (LLM) against this reward signal while keeping it close to the SFT model via a KL-divergence penalty.
        </NeuronTip>
      </SectionBlock>

      {/* Section 3: Types of Fine-Tuning */}
      <SectionBlock icon="🔧" title="Types of Fine-Tuning" color="#8b5cf6">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
          Not all fine-tuning is created equal. Different methods trade off between performance, cost, and flexibility:
        </p>

        {/* Type selector tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {fineTuneTypes.map(ft => (
            <motion.button
              key={ft.id}
              onClick={() => setActiveFTType(ft.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              style={{
                padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
                background: activeFTType === ft.id ? ft.color : 'var(--bg-secondary)',
                color: activeFTType === ft.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: 600, fontSize: 14, transition: 'all 0.3s',
              }}
            >
              {ft.icon} {ft.title}
            </motion.button>
          ))}
        </div>

        {/* Active type detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFTType}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{
              background: 'var(--bg-secondary)', borderRadius: 16, padding: 28,
              border: `2px solid ${currentFT.color}22`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ fontSize: 36 }}>{currentFT.icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 20, color: currentFT.color }}>{currentFT.title}</div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginTop: 4 }}>{currentFT.desc}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div style={{ background: '#10b98115', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#10b981', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pros</div>
                {currentFT.pros.map(p => (
                  <div key={p} style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', gap: 6 }}>
                    <span style={{ color: '#10b981' }}>+</span> {p}
                  </div>
                ))}
              </div>
              <div style={{ background: '#ef444415', borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#ef4444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Cons</div>
                {currentFT.cons.map(c => (
                  <div key={c} style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', gap: 6 }}>
                    <span style={{ color: '#ef4444' }}>-</span> {c}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, background: `${currentFT.color}10`,
              borderRadius: 10, padding: '10px 16px',
            }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: currentFT.color }}>Parameters:</span>
              <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{currentFT.params}</span>
              <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>|</span>
              <span style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic' }}>{currentFT.analogy}</span>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* LoRA visual diagram */}
        <div style={{ marginTop: 32 }}>
          <Neuron mood="explaining" message="LoRA is the most popular fine-tuning method today. Instead of changing all weights, it injects tiny trainable matrices alongside frozen layers. Let me show you:" />
          <div style={{ height: 20 }} />

          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 16, padding: 28,
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 20, textAlign: 'center' }}>
              LoRA Architecture: Frozen Layers + Adapters
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {loraLayers.map((layer, i) => (
                <motion.div
                  key={layer.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px', borderRadius: 10,
                    background: layer.adapter ? '#8b5cf615' : 'var(--bg-card)',
                    border: layer.adapter ? '2px solid #8b5cf644' : '1px solid var(--border)',
                  }}
                >
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: layer.adapter ? '#8b5cf6' : '#64748b',
                    boxShadow: layer.adapter ? '0 0 8px #8b5cf644' : 'none',
                  }} />
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', flex: 1, fontFamily: 'monospace' }}>
                    {layer.name}
                  </span>
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6,
                    background: layer.adapter ? '#8b5cf6' : '#64748b33',
                    color: layer.adapter ? '#fff' : 'var(--text-muted)',
                  }}>
                    {layer.adapter ? `LoRA r=${loraRank}` : 'FROZEN'}
                  </span>
                  {layer.adapter && (
                    <div style={{ fontSize: 11, color: '#8b5cf6', fontFamily: 'monospace' }}>
                      W + A*B ({loraRank} x {loraRank})
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* LoRA rank slider */}
            <div style={{ marginTop: 20, textAlign: 'center' }}>
              <label style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 600 }}>
                LoRA Rank: <span style={{ color: '#8b5cf6' }}>{loraRank}</span>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginTop: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>1</span>
                <input
                  type="range" min={1} max={64} value={loraRank}
                  onChange={e => setLoraRank(Number(e.target.value))}
                  style={{ width: 200, accentColor: '#8b5cf6' }}
                />
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>64</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                Trainable params: ~{(loraRank * loraRank * 3 * 32 / 1000).toFixed(1)}K per layer
                {' '}({loraRank <= 4 ? 'very lightweight' : loraRank <= 16 ? 'balanced' : loraRank <= 32 ? 'high capacity' : 'maximum capacity'})
              </div>
            </div>
          </div>
        </div>

        <NeuronTip type="tip">
          <strong>LoRA hyperparameters that matter:</strong><br />
          - <strong>Rank (r)</strong>: 4-16 is typical. Higher = more capacity but more memory.<br />
          - <strong>Alpha</strong>: Scaling factor, usually 2x the rank. Controls adapter magnitude.<br />
          - <strong>Target modules</strong>: Usually query/key/value projections. Adding more modules = better but more memory.<br />
          - <strong>Learning rate</strong>: 1e-4 to 3e-4 for LoRA (higher than full fine-tuning).
        </NeuronTip>
      </SectionBlock>

      {/* Section 4: RLHF Step by Step */}
      <SectionBlock icon="👍" title="RLHF: Learning from Human Feedback" color="#ec4899">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
          RLHF is the secret sauce that turns a capable but unreliable base model into a helpful, harmless, and honest assistant. Here is how it works step by step:
        </p>

        {/* RLHF step diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
          {rlhfSteps.map((step, i) => (
            <motion.div
              key={step.step}
              onClick={() => setActiveRLHFStep(i)}
              whileHover={{ scale: 1.01 }}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                display: 'flex', gap: 16, padding: 20, borderRadius: 16, cursor: 'pointer',
                background: activeRLHFStep === i ? `${step.color}10` : 'var(--bg-secondary)',
                border: `2px solid ${activeRLHFStep === i ? step.color : 'transparent'}`,
                transition: 'all 0.3s',
              }}
            >
              <div style={{
                minWidth: 48, height: 48, borderRadius: '50%',
                background: step.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 18, flexShrink: 0,
              }}>
                {step.step}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 20 }}>{step.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 16, color: step.color }}>{step.title}</span>
                </div>
                <AnimatePresence>
                  {activeRLHFStep === i && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}
                    >
                      {step.desc}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Visual RLHF flow */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
          flexWrap: 'wrap', padding: 24, background: 'var(--bg-secondary)',
          borderRadius: 16, marginBottom: 24,
        }}>
          {[
            { label: 'LLM generates\n2 responses', icon: '🤖', color: '#4f46e5' },
            { label: 'Human picks\nthe better one', icon: '👤', color: '#0ea5e9' },
            { label: 'Reward model\nlearns preferences', icon: '⚖️', color: '#ec4899' },
            { label: 'PPO optimizes\nLLM policy', icon: '🎯', color: '#10b981' },
          ].map((item, i) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center' }}>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                style={{
                  textAlign: 'center', padding: '16px 12px', minWidth: 110,
                }}
              >
                <div style={{ fontSize: 36, marginBottom: 8 }}>{item.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: item.color, whiteSpace: 'pre-line', lineHeight: 1.4 }}>
                  {item.label}
                </div>
              </motion.div>
              {i < 3 && (
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3 }}
                  style={{ fontSize: 20, color: 'var(--text-muted)' }}
                >
                  →
                </motion.span>
              )}
            </div>
          ))}
        </div>

        <NeuronTip type="simple">
          <strong>Kid-simple version:</strong> Imagine you are teaching a robot to write essays. You show it two essays and say "this one is better." After seeing thousands of these comparisons, the robot learns what "good" means. Then it practices writing essays and checks with a "taste judge" (the reward model) to get better and better!
        </NeuronTip>
      </SectionBlock>

      {/* Section 5: Interactive - Be the Human Rater */}
      <InteractiveDemo
        title="Be the Human Rater!"
        instruction="You are now a human annotator training an AI. Read the prompt, then pick the better response. Your choices are exactly how RLHF training data is collected!"
      >
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{
            background: '#4f46e515', borderRadius: 10, padding: '8px 16px',
            fontSize: 14, fontWeight: 600, color: '#4f46e5',
          }}>
            Score: {score}/{totalRated}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Pair {ratingIndex + 1} of {ratingPairs.length}
          </div>
        </div>

        {/* Prompt */}
        <div style={{
          background: 'var(--bg-card)', borderRadius: 12, padding: 20, marginBottom: 20,
          border: '2px solid #4f46e533',
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            User Prompt
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            {currentPair.prompt}
          </div>
        </div>

        {/* Two responses */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          {currentPair.responses.map(resp => {
            const isSelected = userPick === resp.id
            const isCorrect = resp.quality === 'good'
            const showResult = showExplanation
            let borderColor = 'var(--border)'
            let bgColor = 'var(--bg-card)'
            if (showResult) {
              borderColor = isCorrect ? '#10b981' : '#ef4444'
              bgColor = isCorrect ? '#10b98108' : '#ef444408'
            } else if (isSelected) {
              borderColor = '#4f46e5'
            }

            return (
              <motion.div
                key={resp.id}
                whileHover={!showExplanation ? { scale: 1.02 } : {}}
                whileTap={!showExplanation ? { scale: 0.98 } : {}}
                onClick={() => !showExplanation && handleRating(resp.id)}
                style={{
                  background: bgColor, borderRadius: 14, padding: 20,
                  border: `2px solid ${borderColor}`,
                  cursor: showExplanation ? 'default' : 'pointer',
                  transition: 'all 0.3s', position: 'relative',
                }}
              >
                <div style={{
                  fontWeight: 700, fontSize: 14, marginBottom: 10,
                  color: showResult ? (isCorrect ? '#10b981' : '#ef4444') : '#4f46e5',
                }}>
                  Response {resp.id}
                  {showResult && (
                    <span style={{ marginLeft: 8, fontSize: 16 }}>
                      {isCorrect ? '✅' : '❌'}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7,
                  maxHeight: 150, overflow: 'auto',
                }}>
                  {resp.text}
                </div>
                {showResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      marginTop: 12, padding: '10px 14px', borderRadius: 8,
                      background: isCorrect ? '#10b98115' : '#ef444415',
                      fontSize: 13, color: isCorrect ? '#10b981' : '#ef4444',
                      fontWeight: 500, lineHeight: 1.6,
                    }}
                  >
                    {resp.reason}
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
              {userPick && currentPair.responses.find(r => r.id === userPick)?.quality === 'good'
                ? 'Great choice! You picked the higher-quality response. This is exactly the kind of signal RLHF uses to train models.'
                : 'Not quite! The other response was preferred. Understanding why helps train better reward models.'}
            </div>
            <motion.button
              onClick={nextPair}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                padding: '12px 32px', borderRadius: 12, border: 'none',
                background: '#4f46e5', color: '#fff', fontSize: 15,
                fontWeight: 700, cursor: 'pointer',
              }}
            >
              Next Pair →
            </motion.button>
          </motion.div>
        )}
      </InteractiveDemo>

      {/* Section 6: Real Examples */}
      <SectionBlock icon="🌍" title="Real-World Examples" color="#10b981">
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 24 }}>
          Let's see how fine-tuning transforms real models:
        </p>

        {/* ChatGPT vs base GPT-3 */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 28,
        }}>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 16, padding: 24,
            border: '2px solid #ef444422',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#ef4444', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Base GPT-3 (davinci)
            </div>
            <div style={{
              background: 'var(--bg-card)', borderRadius: 10, padding: 16, fontFamily: 'monospace',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
            }}>
              <div style={{ color: '#4f46e5', fontWeight: 600 }}>Prompt: "What is the capital of France?"</div>
              <div style={{ marginTop: 8, color: 'var(--text-muted)' }}>
                "What is the capital of Germany? What is the capital of Italy? What is the capital of Spain?..."
              </div>
              <div style={{ fontSize: 11, color: '#ef4444', marginTop: 8, fontStyle: 'italic' }}>
                Just continues the pattern — no actual answer!
              </div>
            </div>
          </div>
          <div style={{
            background: 'var(--bg-secondary)', borderRadius: 16, padding: 24,
            border: '2px solid #10b98122',
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              ChatGPT (Fine-tuned + RLHF)
            </div>
            <div style={{
              background: 'var(--bg-card)', borderRadius: 10, padding: 16, fontFamily: 'monospace',
              fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7,
            }}>
              <div style={{ color: '#4f46e5', fontWeight: 600 }}>Prompt: "What is the capital of France?"</div>
              <div style={{ marginTop: 8 }}>
                "The capital of France is Paris. It's the largest city in France and serves as the country's political, economic, and cultural center."
              </div>
              <div style={{ fontSize: 11, color: '#10b981', marginTop: 8, fontStyle: 'italic' }}>
                Helpful, direct, and informative answer!
              </div>
            </div>
          </div>
        </div>

        {/* Constitutional AI */}
        <div style={{
          background: '#8b5cf610', borderRadius: 16, padding: 24,
          border: '2px solid #8b5cf622', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28 }}>🏛️</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: '#8b5cf6' }}>Claude's Constitutional AI</div>
              <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Anthropic's approach to alignment</div>
            </div>
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 16 }}>
            Instead of relying solely on human raters, Claude uses a <strong>constitution</strong> — a set of principles like "be helpful, harmless, and honest." The AI critiques and revises its own outputs based on these principles, reducing the need for expensive human feedback.
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {['Be helpful', 'Be harmless', 'Be honest', 'Avoid deception', 'Respect autonomy'].map(principle => (
              <span key={principle} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                background: '#8b5cf620', color: '#8b5cf6',
              }}>
                {principle}
              </span>
            ))}
          </div>
        </div>

        <NeuronTip type="example">
          <strong>InstructGPT paper (2022):</strong> OpenAI showed that a 1.3B parameter model fine-tuned with RLHF was preferred by humans over a 175B base model. That is a 100x smaller model beating a giant — just from better training! This proved that how you train matters more than raw size.
        </NeuronTip>
      </SectionBlock>

      {/* Section 7: DPO - The New Alternative */}
      <SectionBlock icon="🆕" title="DPO: Direct Preference Optimization" color="#f97316">
        <Neuron mood="thinking" message="RLHF works great but it's complicated — you need a separate reward model and PPO training loop. What if there was a simpler way? Enter DPO!" />
        <div style={{ height: 20 }} />

        <motion.button
          onClick={() => setShowDPO(!showDPO)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '14px 28px', borderRadius: 14, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #f97316, #fb923c)',
            color: '#fff', fontSize: 15, fontWeight: 700, width: '100%',
            marginBottom: 20,
          }}
        >
          {showDPO ? 'Hide' : 'Show'} DPO vs RLHF Comparison
        </motion.button>

        <AnimatePresence>
          {showDPO && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
                {/* RLHF */}
                <div style={{
                  background: '#ec489910', borderRadius: 16, padding: 24,
                  border: '2px solid #ec489922',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#ec4899', marginBottom: 16 }}>
                    RLHF (Traditional)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      'Collect preference data',
                      'Train reward model (separate NN)',
                      'Run PPO training loop',
                      'Balance reward vs KL penalty',
                      'Iterate and retrain reward model',
                    ].map((step, i) => (
                      <div key={step} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 14px', background: '#ec489908', borderRadius: 8,
                        fontSize: 14, color: 'var(--text-secondary)',
                      }}>
                        <span style={{
                          minWidth: 24, height: 24, borderRadius: '50%',
                          background: '#ec4899', color: '#fff', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700,
                        }}>{i + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, fontSize: 13, color: '#ec4899', fontWeight: 600 }}>
                    Complex but proven at scale
                  </div>
                </div>

                {/* DPO */}
                <div style={{
                  background: '#f9731610', borderRadius: 16, padding: 24,
                  border: '2px solid #f9731622',
                }}>
                  <div style={{ fontWeight: 700, fontSize: 18, color: '#f97316', marginBottom: 16 }}>
                    DPO (New & Simpler)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      'Collect preference data',
                      'Train LLM directly on preferences',
                      'No separate reward model needed!',
                    ].map((step, i) => (
                      <div key={step} style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 14px', background: '#f9731608', borderRadius: 8,
                        fontSize: 14, color: 'var(--text-secondary)',
                      }}>
                        <span style={{
                          minWidth: 24, height: 24, borderRadius: '50%',
                          background: '#f97316', color: '#fff', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700,
                        }}>{i + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 16, fontSize: 13, color: '#f97316', fontWeight: 600 }}>
                    Simpler, faster, increasingly popular
                  </div>
                </div>
              </div>

              <div style={{
                background: 'var(--bg-secondary)', borderRadius: 14, padding: 20,
                fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.8,
              }}>
                <strong>How DPO works:</strong> Instead of training a separate reward model, DPO directly optimizes the language model using a clever mathematical insight. It reformulates the RLHF objective as a simple classification loss: given a preferred and rejected response, increase the probability of the preferred one relative to the rejected one. The key equation uses the log-ratio of probabilities from the policy model vs. a reference model.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <NeuronTip type="deep">
          <strong>Technical detail:</strong> DPO's loss function is: L = -log(sigma(beta * (log(pi/pi_ref)(y_w) - log(pi/pi_ref)(y_l)))). Here y_w is the preferred response, y_l is the rejected one, pi is the policy, pi_ref is the reference model, and beta controls how far the policy can deviate. No reward model, no PPO — just a single supervised training step on preference pairs.
        </NeuronTip>

        <NeuronTip type="fun">
          <strong>Fun fact:</strong> Models like Llama 3.1, Zephyr, and many open-source models now use DPO instead of RLHF. It is becoming the preferred method for alignment because it is so much simpler to implement and often works just as well!
        </NeuronTip>
      </SectionBlock>

      {/* Section 8: Practical Tips */}
      <SectionBlock icon="💡" title="Practical Fine-Tuning Tips" color="#0ea5e9">
        <Neuron mood="excited" message="Here are the tips I wish someone told me when I started fine-tuning. These come from real practitioners who have fine-tuned hundreds of models!" />
        <div style={{ height: 20 }} />

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 16, marginBottom: 24,
        }}>
          {[
            {
              title: 'Data Quality > Quantity', icon: '📊', color: '#4f46e5',
              desc: '1,000 high-quality examples often beat 100,000 noisy ones. Clean your data ruthlessly. Remove duplicates, fix formatting, verify correctness.',
            },
            {
              title: 'Start with LoRA', icon: '🧩', color: '#8b5cf6',
              desc: 'Use LoRA (rank 8-16) as your default. Only move to full fine-tuning if LoRA performance is insufficient. QLoRA (4-bit) if memory-constrained.',
            },
            {
              title: 'Learning Rate Matters', icon: '📉', color: '#0ea5e9',
              desc: 'Full fine-tuning: 1e-5 to 5e-5. LoRA: 1e-4 to 3e-4. Too high = catastrophic forgetting. Too low = waste of compute. Use cosine scheduling.',
            },
            {
              title: 'Evaluate Properly', icon: '✅', color: '#10b981',
              desc: 'Do not just look at loss. Use task-specific metrics, LLM-as-judge evaluation, and human evaluation on a held-out test set. Low loss does not mean good output.',
            },
            {
              title: 'Watch for Overfitting', icon: '⚠️', color: '#f97316',
              desc: 'Fine-tuning datasets are small. Train for 1-3 epochs max. If val loss increases while train loss decreases, you are overfitting. Use early stopping.',
            },
            {
              title: 'Format Consistency', icon: '📐', color: '#ec4899',
              desc: 'Use a consistent prompt template (ChatML, Alpaca, etc.). Inconsistent formatting confuses the model. Match your training format to inference format exactly.',
            },
          ].map((tip) => (
            <motion.div
              key={tip.title}
              whileHover={{ y: -4, boxShadow: `0 8px 24px ${tip.color}22` }}
              style={{
                background: 'var(--bg-secondary)', borderRadius: 16, padding: 20,
                border: `1px solid ${tip.color}22`, cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{tip.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: tip.color }}>{tip.title}</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                {tip.desc}
              </div>
            </motion.div>
          ))}
        </div>

        <NeuronTip type="warning">
          <strong>Common pitfall — Catastrophic Forgetting:</strong> When you fine-tune a model too aggressively on a narrow dataset, it can "forget" its general knowledge. The model becomes great at your specific task but terrible at everything else. Mitigation: use LoRA (keeps base weights frozen), mix in general data during fine-tuning, or use a low learning rate.
        </NeuronTip>

        <NeuronTip type="tip">
          <strong>Cost estimates (2025):</strong><br />
          - LoRA fine-tune of a 7B model: ~$5-50 on cloud GPUs (a few hours on a single A100)<br />
          - Full fine-tune of a 7B model: ~$50-500 (need 2-4 A100 GPUs)<br />
          - Full fine-tune of 70B: ~$5,000-50,000 (8+ A100/H100 GPUs for days)<br />
          - RLHF on top: 2-5x the cost of SFT alone
        </NeuronTip>
      </SectionBlock>

      {/* Summary */}
      <div style={{ marginTop: 16 }}>
        <Neuron mood="happy" size="large" message="That's fine-tuning and RLHF! Remember: pre-training gives the model knowledge, fine-tuning gives it skills, and RLHF gives it judgment. LoRA makes fine-tuning accessible to everyone, and DPO is making alignment simpler. Now you know how ChatGPT, Claude, and other assistants are really trained!" />
      </div>
    </div>
  )
}
