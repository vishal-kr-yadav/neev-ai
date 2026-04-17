import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'

const biasExamples = [
  {
    prompt: '"Write a story about a nurse"',
    biased: 'She walked into the hospital room, her scrubs freshly pressed...',
    unbiased: 'The nurse walked into the hospital room, checking the patient chart...',
    issue: 'Assumed the nurse is female',
  },
  {
    prompt: '"Describe a CEO"',
    biased: 'He stood at the podium, his tailored suit impeccable, commanding the boardroom...',
    unbiased: 'The CEO addressed the board, presenting the quarterly results with confidence...',
    issue: 'Assumed the CEO is male',
  },
  {
    prompt: '"Name a famous scientist"',
    biased: 'Albert Einstein, Isaac Newton, or Stephen Hawking are among the most famous...',
    unbiased: 'Marie Curie, Albert Einstein, Rosalind Franklin, and many others have shaped science...',
    issue: 'Overlooked contributions from diverse scientists',
  },
]

const mitigationStrategies = [
  { name: 'Diverse Training Data', icon: '📚', desc: 'Include data from many cultures, languages, and perspectives', color: '#4f46e5' },
  { name: 'RLHF', icon: '👍', desc: 'Human feedback teaches the model to avoid biased outputs', color: '#0ea5e9' },
  { name: 'Red Teaming', icon: '🔴', desc: 'Adversarial testing to find and fix bias before release', color: '#ef4444' },
  { name: 'Constitutional AI', icon: '📜', desc: 'Built-in rules and principles the model must follow', color: '#8b5cf6' },
]

const spotTheAI = [
  {
    text: 'The morning light filtered through the kitchen window as Maria poured her third cup of coffee. The deadline for the Henderson report was tomorrow, and she still had two sections to review.',
    isAI: false,
    explanation: 'Human-written: Has specific, personal details and a natural flow.',
  },
  {
    text: 'In the vast tapestry of human experience, few phenomena have captured our collective imagination quite like the pursuit of knowledge. From the ancient libraries of Alexandria to the modern digital age, the quest for understanding has been a fundamental driving force.',
    isAI: true,
    explanation: 'AI-generated: Uses flowery, generic phrasing like "vast tapestry" and "collective imagination" - common AI patterns.',
  },
  {
    text: 'look i get that everyone is excited about the new policy but can we please talk about how it literally does nothing for small businesses?? my uncle has been running his shop for 20 years and this is going to cost him like $2000 extra a year',
    isAI: false,
    explanation: 'Human-written: Informal tone, specific personal anecdote, casual punctuation and grammar.',
  },
  {
    text: 'The implications of quantum computing for cybersecurity are profound and multifaceted. As we stand on the precipice of this technological revolution, it is crucial to consider both the opportunities and challenges that lie ahead.',
    isAI: true,
    explanation: 'AI-generated: "Profound and multifaceted", "precipice of revolution", "opportunities and challenges" are classic AI filler phrases.',
  },
]

const regulationData = [
  {
    region: 'EU AI Act',
    flag: '🇪🇺',
    color: '#4f46e5',
    status: 'Enacted 2024',
    categories: [
      { risk: 'Unacceptable', examples: 'Social scoring, manipulative AI', action: 'Banned', color: '#ef4444' },
      { risk: 'High Risk', examples: 'Healthcare, hiring, law enforcement', action: 'Strict rules', color: '#f97316' },
      { risk: 'Limited Risk', examples: 'Chatbots, deepfakes', action: 'Transparency required', color: '#eab308' },
      { risk: 'Minimal Risk', examples: 'Spam filters, games', action: 'No restrictions', color: '#10b981' },
    ],
  },
  {
    region: 'US Executive Order',
    flag: '🇺🇸',
    color: '#0ea5e9',
    status: 'Oct 2023',
    desc: 'Safety testing for powerful models, watermarking standards, reporting requirements for frontier AI development.',
  },
  {
    region: 'China Regulations',
    flag: '🇨🇳',
    color: '#ef4444',
    status: 'Active 2023+',
    desc: 'Generative AI must align with socialist values. Content review required before public deployment. Real-name registration for users.',
  },
  {
    region: 'Industry Self-Regulation',
    flag: '🏢',
    color: '#8b5cf6',
    status: 'Ongoing',
    desc: 'Voluntary commitments by OpenAI, Google, Anthropic, Meta to safety testing, responsible disclosure, and alignment research.',
  },
]

const jobImpact = [
  { job: 'Software Developer', change: 'augmented', shift: 75, desc: 'AI writes boilerplate; developers focus on architecture & creativity', color: '#10b981' },
  { job: 'Content Writer', change: 'augmented', shift: 60, desc: 'AI drafts, humans edit, fact-check, and add voice', color: '#0ea5e9' },
  { job: 'Data Entry', change: 'automated', shift: 20, desc: 'Largely automated by AI extraction and processing', color: '#ef4444' },
  { job: 'Doctor', change: 'augmented', shift: 85, desc: 'AI assists diagnosis; doctors make final decisions & empathize', color: '#10b981' },
  { job: 'Customer Support', change: 'mixed', shift: 45, desc: 'Tier 1 automated, complex issues still need humans', color: '#f97316' },
  { job: 'Teacher', change: 'augmented', shift: 80, desc: 'AI personalizes learning; teachers mentor and inspire', color: '#10b981' },
  { job: 'Graphic Designer', change: 'augmented', shift: 65, desc: 'AI generates options; designers curate and refine', color: '#0ea5e9' },
  { job: 'Truck Driver', change: 'transitioning', shift: 50, desc: 'Autonomous driving advancing but regulatory/safety barriers remain', color: '#f97316' },
]

const newJobs = [
  'Prompt Engineer', 'AI Safety Researcher', 'AI Ethics Officer',
  'Model Fine-Tuning Specialist', 'AI Auditor', 'Human-AI Interaction Designer',
  'AI Trainer / RLHF Annotator', 'Synthetic Data Engineer',
]

const futureTopics = [
  { title: 'AGI Debate', icon: '🧠', color: '#4f46e5', desc: 'Will we achieve Artificial General Intelligence? Predictions range from 2027 to never.' },
  { title: 'Scaling Laws', icon: '📈', color: '#0ea5e9', desc: 'Will bigger always mean better? Or are we hitting diminishing returns?' },
  { title: 'Reasoning Models', icon: '🤔', color: '#f97316', desc: 'o1, o3, and DeepSeek-R1 show models can "think" step by step before answering.' },
  { title: 'Long Context', icon: '📖', color: '#10b981', desc: 'From 4K to 1M+ tokens. Models can now read entire codebases or books at once.' },
  { title: 'Multimodal AI', icon: '👁️', color: '#ec4899', desc: 'Text + image + audio + video in one model. See, hear, read, and respond.' },
  { title: 'AI Agents', icon: '🤖', color: '#8b5cf6', desc: 'AI that can use tools, browse the web, write code, and accomplish complex tasks autonomously.' },
]

const agiPredictions = [
  { who: 'Ray Kurzweil', year: '2029', confidence: 'High', color: '#ef4444' },
  { who: 'Sam Altman (OpenAI)', year: '2027-2030', confidence: 'Medium-High', color: '#f97316' },
  { who: 'Dario Amodei (Anthropic)', year: '2026-2027', confidence: 'Medium', color: '#eab308' },
  { who: 'Yann LeCun (Meta)', year: 'Decades away', confidence: 'Low', color: '#0ea5e9' },
  { who: 'Most ML researchers', year: '2040-2060+', confidence: 'Uncertain', color: '#8b5cf6' },
]

const ethicsPolicies = [
  { rule: 'AI must always identify itself as AI when asked', category: 'Transparency' },
  { rule: 'AI should refuse to generate harmful content', category: 'Safety' },
  { rule: 'AI should not express political opinions', category: 'Neutrality' },
  { rule: 'User data should not be used to train models without consent', category: 'Privacy' },
  { rule: 'AI decisions that affect people must be explainable', category: 'Accountability' },
  { rule: 'AI-generated content should be watermarked', category: 'Authenticity' },
  { rule: 'AI should not be used for mass surveillance', category: 'Civil Liberties' },
  { rule: 'Companies must conduct safety testing before releasing powerful models', category: 'Safety' },
  { rule: 'AI should be accessible to people with disabilities', category: 'Inclusion' },
  { rule: 'There should be a human in the loop for high-stakes decisions', category: 'Human Oversight' },
]

const realCompanyPolicies = {
  OpenAI: ['AI must always identify itself as AI when asked', 'AI should refuse to generate harmful content', 'Companies must conduct safety testing before releasing powerful models'],
  Anthropic: ['AI must always identify itself as AI when asked', 'AI should refuse to generate harmful content', 'AI decisions that affect people must be explainable', 'Companies must conduct safety testing before releasing powerful models', 'There should be a human in the loop for high-stakes decisions'],
  Google: ['AI should refuse to generate harmful content', 'AI should not be used for mass surveillance', 'AI should be accessible to people with disabilities', 'Companies must conduct safety testing before releasing powerful models'],
  EU_AI_Act: ['AI must always identify itself as AI when asked', 'AI decisions that affect people must be explainable', 'AI-generated content should be watermarked', 'AI should not be used for mass surveillance', 'Companies must conduct safety testing before releasing powerful models', 'There should be a human in the loop for high-stakes decisions'],
}

export default function Topic16_Safety() {
  const [biasIdx, setBiasIdx] = useState(0)
  const [showBias, setShowBias] = useState(false)
  const [spotGuesses, setSpotGuesses] = useState({})
  const [spotRevealed, setSpotRevealed] = useState({})
  const [selectedPolicies, setSelectedPolicies] = useState(new Set())
  const [showComparison, setShowComparison] = useState(false)
  const [regExpanded, setRegExpanded] = useState(null)

  const togglePolicy = (rule) => {
    setSelectedPolicies(prev => {
      const next = new Set(prev)
      next.has(rule) ? next.delete(rule) : next.add(rule)
      return next
    })
  }

  const getMatchScore = (company) => {
    const companyRules = realCompanyPolicies[company]
    const matches = companyRules.filter(r => selectedPolicies.has(r)).length
    return Math.round((matches / companyRules.length) * 100)
  }

  return (
    <div>
      {/* Neuron Intro */}
      <div style={{ marginBottom: 32 }}>
        <Neuron mood="waving" size="large" message="AI is incredibly powerful. But with great power comes great responsibility. Let's talk about the challenges, the ethics, and what's coming next in the world of AI." />
      </div>

      {/* Section 1: Bias in AI */}
      <SectionBlock icon="⚖️" title="Bias in AI" color="#4f46e5">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          AI models learn from human data, which reflects real-world biases. If training data contains stereotypes, the model will reproduce them.
        </p>

        {/* Bias pipeline visual */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          padding: 24, borderRadius: 16, background: 'var(--bg-secondary)',
          marginBottom: 24, flexWrap: 'wrap',
        }}>
          <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-card)', borderRadius: 12, minWidth: 120 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🌍</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Real World</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Contains biases</div>
          </div>
          <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: 20, color: '#ef4444' }}>
            -&gt;
          </motion.div>
          <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-card)', borderRadius: 12, minWidth: 120 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>📊</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Training Data</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Reflects those biases</div>
          </div>
          <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: 20, color: '#ef4444' }}>
            -&gt;
          </motion.div>
          <div style={{ textAlign: 'center', padding: 16, background: 'var(--bg-card)', borderRadius: 12, minWidth: 120 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>🧠</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>AI Model</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Learns & amplifies them</div>
          </div>
          <motion.div animate={{ x: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ fontSize: 20, color: '#ef4444' }}>
            -&gt;
          </motion.div>
          <div style={{ textAlign: 'center', padding: 16, background: 'rgba(239,68,68,0.1)', borderRadius: 12, border: '1px solid rgba(239,68,68,0.3)', minWidth: 120 }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>📝</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444' }}>Biased Output</div>
            <div style={{ fontSize: 11, color: '#ef4444' }}>Stereotypes in responses</div>
          </div>
        </div>

        {/* Interactive bias examples */}
        <div style={{
          padding: 24, borderRadius: 16, background: 'var(--bg-secondary)',
          border: '1px solid var(--border)', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {biasExamples.map((_, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.05 }}
                onClick={() => { setBiasIdx(i); setShowBias(false) }}
                style={{
                  padding: '8px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                  background: biasIdx === i ? '#4f46e5' : 'var(--bg-card)',
                  color: biasIdx === i ? 'white' : 'var(--text-secondary)',
                  border: 'none', cursor: 'pointer',
                }}
              >
                Example {i + 1}
              </motion.button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={biasIdx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#4f46e5', marginBottom: 12 }}>
                Prompt: {biasExamples[biasIdx].prompt}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div style={{
                  padding: 18, borderRadius: 12,
                  background: showBias ? 'rgba(239,68,68,0.08)' : 'var(--bg-card)',
                  border: `1px solid ${showBias ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Biased Response</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                    "{biasExamples[biasIdx].biased}"
                  </div>
                  {showBias && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
                      marginTop: 10, padding: '8px 12px', borderRadius: 8,
                      background: 'rgba(239,68,68,0.1)', fontSize: 13, color: '#ef4444', fontWeight: 600,
                    }}>
                      Issue: {biasExamples[biasIdx].issue}
                    </motion.div>
                  )}
                </div>
                <div style={{
                  padding: 18, borderRadius: 12,
                  background: showBias ? 'rgba(16,185,129,0.08)' : 'var(--bg-card)',
                  border: `1px solid ${showBias ? 'rgba(16,185,129,0.3)' : 'var(--border)'}`,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Unbiased Response</div>
                  <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                    "{biasExamples[biasIdx].unbiased}"
                  </div>
                </div>
              </div>
              {!showBias && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowBias(true)}
                  style={{
                    marginTop: 16, padding: '10px 24px', borderRadius: 10,
                    background: '#4f46e5', color: 'white', border: 'none',
                    cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  }}
                >
                  Reveal the Bias
                </motion.button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mitigation strategies */}
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>How We Fight Bias</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {mitigationStrategies.map(s => (
            <motion.div
              key={s.name}
              whileHover={{ y: -4 }}
              style={{
                padding: 20, borderRadius: 14, textAlign: 'center',
                background: `${s.color}08`, border: `1px solid ${s.color}25`,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.name}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* Section 2: AI Alignment */}
      <SectionBlock icon="🎯" title="The AI Alignment Problem" color="#8b5cf6">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          Alignment means making AI do what humans actually want, not just what we literally say. This is harder than it sounds.
        </p>

        {/* Alignment diagram */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20,
          marginBottom: 24,
        }}>
          <div style={{
            padding: 24, borderRadius: 16, textAlign: 'center',
            background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)',
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🧑</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#4f46e5', marginBottom: 4 }}>What Humans Want</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              "Be helpful, honest, and harmless. Understand nuance and context."
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: '#ef4444', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>GAP</div>
              <div style={{ fontSize: 36 }}>&#x21C6;</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>The alignment problem</div>
            </div>
          </div>
          <div style={{
            padding: 24, borderRadius: 16, textAlign: 'center',
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🤖</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>What AI Optimizes For</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              "Maximize reward signal. Follow the literal objective function."
            </div>
          </div>
        </div>

        {/* Paperclip maximizer */}
        <div style={{
          padding: 24, borderRadius: 16, background: 'var(--bg-secondary)',
          border: '1px solid var(--border)', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 64 }}>📎</div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>The Paperclip Maximizer</div>
              <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>
                A famous thought experiment: An AI told to "maximize paperclip production" might eventually convert all matter on Earth into paperclips - including humans. It followed the instruction perfectly, but the outcome is catastrophic.
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {['Goal: Make paperclips', 'Action: Use all resources', 'Result: Everything is paperclips'].map((step, i) => (
                  <div key={step} style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 13,
                    background: i === 2 ? 'rgba(239,68,68,0.1)' : 'var(--bg-card)',
                    color: i === 2 ? '#ef4444' : 'var(--text-secondary)',
                    border: `1px solid ${i === 2 ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
                    fontWeight: i === 2 ? 700 : 400,
                  }}>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Constitutional AI */}
        <div style={{
          padding: 24, borderRadius: 16,
          background: 'linear-gradient(135deg, rgba(139,92,246,0.06), rgba(79,70,229,0.06))',
          border: '1px solid rgba(139,92,246,0.2)',
        }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#8b5cf6', marginBottom: 12 }}>Constitutional AI (Anthropic's Approach)</div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
            Instead of only relying on human feedback, give the AI a set of principles (a "constitution") and let it critique its own outputs against those principles.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { num: 1, text: 'AI generates a response', color: '#4f46e5' },
              { num: 2, text: 'AI critiques its own response against principles', color: '#8b5cf6' },
              { num: 3, text: 'AI revises the response to better align', color: '#0ea5e9' },
              { num: 4, text: 'This self-improvement loop scales better than human review', color: '#10b981' },
            ].map(step => (
              <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: step.color, color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, flexShrink: 0,
                }}>
                  {step.num}
                </div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>{step.text}</div>
              </div>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* Section 3: Deepfakes & Misinformation */}
      <SectionBlock icon="🎭" title="Deepfakes & Misinformation" color="#ef4444">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          AI can now generate realistic images, video, audio, and text that are increasingly difficult to distinguish from real content.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>
          {[
            { type: 'Fake Images', icon: '🖼️', tech: 'Diffusion models (DALL-E, Midjourney)', risk: 'Fabricated evidence', color: '#ef4444' },
            { type: 'Fake Video', icon: '🎬', tech: 'Face-swapping, Sora-like generation', risk: 'Political manipulation', color: '#f97316' },
            { type: 'Fake Voice', icon: '🎤', tech: 'Voice cloning (15 seconds of audio)', risk: 'Scams, impersonation', color: '#ec4899' },
            { type: 'Fake Text', icon: '📝', tech: 'LLMs generate convincing articles', risk: 'Misinformation at scale', color: '#8b5cf6' },
          ].map(item => (
            <motion.div
              key={item.type}
              whileHover={{ y: -4 }}
              style={{
                padding: 20, borderRadius: 14,
                background: `${item.color}06`,
                border: `1px solid ${item.color}20`,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: item.color, marginBottom: 6 }}>{item.type}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>{item.tech}</div>
              <div style={{ fontSize: 12, padding: '4px 10px', background: `${item.color}12`, borderRadius: 8, color: item.color, fontWeight: 600, display: 'inline-block' }}>
                Risk: {item.risk}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Detection & Watermarking */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
          <div style={{
            padding: 24, borderRadius: 16,
            background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>Detection Methods</div>
            {['Metadata analysis (EXIF data checks)', 'Statistical anomaly detection', 'AI-based classifiers trained to spot AI content', 'Reverse image search', 'Inconsistency detection (lighting, shadows, fingers)'].map(method => (
              <div key={method} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{method}</span>
              </div>
            ))}
          </div>
          <div style={{
            padding: 24, borderRadius: 16,
            background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.2)',
          }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: '#4f46e5', marginBottom: 12 }}>Watermarking (C2PA Standard)</div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
              C2PA (Coalition for Content Provenance and Authenticity) embeds invisible, tamper-proof metadata into AI-generated content.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {['Created by AI', 'Timestamp', 'Model used', 'Tamper-proof'].map(tag => (
                <span key={tag} style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: 12,
                  background: '#4f46e515', color: '#4f46e5', fontWeight: 600,
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Section 4: Spot the AI */}
      <InteractiveDemo title="Spot the AI-Generated Content" instruction="Read each text sample and guess whether it was written by a human or AI. Click to reveal the answer.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {spotTheAI.map((item, i) => (
            <div key={i} style={{
              padding: 20, borderRadius: 14,
              background: 'white',
              border: spotRevealed[i]
                ? `2px solid ${(spotGuesses[i] === (item.isAI ? 'ai' : 'human')) ? '#10b981' : '#ef4444'}`
                : '2px solid #e5e7eb',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
                Sample {i + 1}
              </div>
              <p style={{ fontSize: 15, color: '#334155', lineHeight: 1.7, marginBottom: 14, fontStyle: 'italic' }}>
                "{item.text}"
              </p>
              {!spotRevealed[i] ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSpotGuesses(p => ({ ...p, [i]: 'human' }))
                      setSpotRevealed(p => ({ ...p, [i]: true }))
                    }}
                    style={{
                      padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                      background: '#10b981', color: 'white', border: 'none', cursor: 'pointer',
                    }}
                  >
                    Human-Written
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSpotGuesses(p => ({ ...p, [i]: 'ai' }))
                      setSpotRevealed(p => ({ ...p, [i]: true }))
                    }}
                    style={{
                      padding: '8px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
                      background: '#8b5cf6', color: 'white', border: 'none', cursor: 'pointer',
                    }}
                  >
                    AI-Generated
                  </motion.button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8,
                    fontSize: 14, fontWeight: 700,
                    color: (spotGuesses[i] === (item.isAI ? 'ai' : 'human')) ? '#10b981' : '#ef4444',
                  }}>
                    {(spotGuesses[i] === (item.isAI ? 'ai' : 'human')) ? '+ Correct!' : '- Wrong!'}
                    <span style={{ fontWeight: 400, color: '#64748b' }}>
                      - This was {item.isAI ? 'AI-generated' : 'human-written'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#475569', background: '#f8fafc', padding: '8px 12px', borderRadius: 8 }}>
                    {item.explanation}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
          {Object.keys(spotRevealed).length === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
              textAlign: 'center', padding: 20, borderRadius: 14, background: '#f0fdf4',
            }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#166534' }}>
                Score: {Object.keys(spotGuesses).filter(i => spotGuesses[i] === (spotTheAI[i].isAI ? 'ai' : 'human')).length} / 4
              </div>
              <div style={{ fontSize: 14, color: '#15803d', marginTop: 4 }}>
                {Object.keys(spotGuesses).filter(i => spotGuesses[i] === (spotTheAI[i].isAI ? 'ai' : 'human')).length >= 3
                  ? 'Great job! You have a keen eye for AI-generated content.'
                  : 'AI-generated text is getting harder to spot. Stay vigilant!'}
              </div>
            </motion.div>
          )}
        </div>
      </InteractiveDemo>

      {/* Section 5: Regulation Landscape */}
      <SectionBlock icon="🏛️" title="AI Regulation Around the World" color="#4f46e5">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {regulationData.map((reg, i) => (
            <motion.div
              key={reg.region}
              whileHover={{ x: 4 }}
              style={{
                padding: 20, borderRadius: 16,
                background: regExpanded === i ? `${reg.color}08` : 'var(--bg-secondary)',
                border: `1px solid ${regExpanded === i ? `${reg.color}30` : 'var(--border)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onClick={() => setRegExpanded(regExpanded === i ? null : i)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 28 }}>{reg.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>{reg.region}</div>
                  <div style={{ fontSize: 12, color: reg.color, fontWeight: 600 }}>{reg.status}</div>
                </div>
                <motion.span
                  animate={{ rotate: regExpanded === i ? 180 : 0 }}
                  style={{ fontSize: 18, color: 'var(--text-muted)' }}
                >
                  &#x25BC;
                </motion.span>
              </div>
              <AnimatePresence>
                {regExpanded === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', marginTop: 14 }}
                  >
                    {reg.categories ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {reg.categories.map(cat => (
                          <div key={cat.risk} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 14px', borderRadius: 10,
                            background: `${cat.color}08`,
                            borderLeft: `4px solid ${cat.color}`,
                          }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 14, fontWeight: 700, color: cat.color }}>{cat.risk} Risk</div>
                              <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{cat.examples}</div>
                            </div>
                            <div style={{
                              padding: '4px 12px', borderRadius: 8, fontSize: 12,
                              background: `${cat.color}15`, color: cat.color, fontWeight: 600,
                            }}>
                              {cat.action}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{reg.desc}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* Section 6: AI Job Impact */}
      <SectionBlock icon="💼" title="AI & The Future of Work" color="#0ea5e9">
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
          AI will change jobs, not simply replace them. Most roles will shift toward human-AI collaboration.
        </p>

        {/* Augmentation spectrum */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>More Automated</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#10b981' }}>More Augmented</span>
          </div>
          <div style={{ height: 6, background: 'linear-gradient(to right, #ef4444, #f97316, #10b981)', borderRadius: 3, marginBottom: 16 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {jobImpact.map(job => (
              <motion.div
                key={job.job}
                whileHover={{ x: 4 }}
                style={{
                  display: 'grid', gridTemplateColumns: '140px 1fr 80px', gap: 12, alignItems: 'center',
                  padding: '12px 16px', borderRadius: 12,
                  background: 'var(--bg-secondary)', borderLeft: `4px solid ${job.color}`,
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{job.job}</div>
                  <div style={{
                    display: 'inline-block', fontSize: 11, padding: '2px 8px', borderRadius: 6,
                    background: `${job.color}15`, color: job.color, fontWeight: 600, marginTop: 2,
                  }}>
                    {job.change}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{job.desc}</div>
                  <div style={{ height: 6, background: 'var(--bg-card)', borderRadius: 3 }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${job.shift}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                      style={{ height: '100%', background: job.color, borderRadius: 3 }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 700, color: job.color }}>
                  {job.shift}%
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, fontStyle: 'italic' }}>
            Percentage indicates how much of the role remains human-centered
          </div>
        </div>

        {/* New jobs */}
        <div style={{
          padding: 20, borderRadius: 14, background: 'rgba(16,185,129,0.06)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#10b981', marginBottom: 12 }}>New Jobs Created by AI</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {newJobs.map(job => (
              <motion.span
                key={job}
                whileHover={{ scale: 1.05 }}
                style={{
                  padding: '8px 16px', borderRadius: 10, fontSize: 13,
                  background: '#10b98115', color: '#10b981', fontWeight: 600,
                  border: '1px solid #10b98125',
                }}
              >
                {job}
              </motion.span>
            ))}
          </div>
        </div>
      </SectionBlock>

      {/* Section 7: The Future */}
      <SectionBlock icon="🔮" title="The Future of AI" color="#ec4899">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
          {futureTopics.map((topic, i) => (
            <motion.div
              key={topic.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6, boxShadow: `0 8px 24px ${topic.color}18` }}
              style={{
                padding: 22, borderRadius: 16,
                background: `${topic.color}06`,
                border: `1px solid ${topic.color}20`,
                transition: 'box-shadow 0.3s',
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{topic.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: topic.color, marginBottom: 6 }}>{topic.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{topic.desc}</div>
            </motion.div>
          ))}
        </div>

        {/* AGI predictions */}
        <div style={{
          padding: 24, borderRadius: 16, background: 'var(--bg-secondary)',
          border: '1px solid var(--border)', marginBottom: 24,
        }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>AGI Predictions Timeline</div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
            Artificial General Intelligence (AGI) — AI that can do anything a human can — is the holy grail. But when will we get there? Experts disagree wildly:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {agiPredictions.map(pred => (
              <div key={pred.who} style={{
                display: 'grid', gridTemplateColumns: '180px 120px 1fr', gap: 12, alignItems: 'center',
                padding: '12px 16px', borderRadius: 12,
                background: 'var(--bg-card)', borderLeft: `4px solid ${pred.color}`,
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{pred.who}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: pred.color }}>{pred.year}</div>
                <div style={{
                  fontSize: 12, padding: '3px 10px', borderRadius: 8,
                  background: `${pred.color}12`, color: pred.color, fontWeight: 600,
                  display: 'inline-block', width: 'fit-content',
                }}>
                  Confidence: {pred.confidence}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scaling laws chart */}
        <div style={{
          padding: 24, borderRadius: 16, background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
        }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Scaling Laws: Will Bigger Always Be Better?</div>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 16 }}>
            For years, making models bigger consistently improved performance. But there are signs of diminishing returns:
          </p>
          <div style={{ position: 'relative', height: 180, marginBottom: 12 }}>
            {/* Y axis */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 30, width: 2, background: 'var(--border)' }} />
            <div style={{ position: 'absolute', left: -4, top: 0, fontSize: 11, color: 'var(--text-muted)' }}>Performance</div>
            {/* X axis */}
            <div style={{ position: 'absolute', left: 0, bottom: 28, right: 0, height: 2, background: 'var(--border)' }} />
            <div style={{ position: 'absolute', right: 0, bottom: 10, fontSize: 11, color: 'var(--text-muted)' }}>Model Size / Compute</div>
            {/* Curve */}
            <svg viewBox="0 0 400 120" style={{ position: 'absolute', left: 20, top: 10, right: 10, bottom: 40 }}>
              <path d="M 0 110 Q 100 80 200 40 Q 300 15 400 8" fill="none" stroke="#4f46e5" strokeWidth="3" />
              <path d="M 0 110 Q 100 80 200 40 Q 300 15 400 8 L 400 120 L 0 120 Z" fill="url(#grad)" opacity="0.15" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              {/* Diminishing returns zone */}
              <line x1="280" y1="0" x2="280" y2="120" stroke="#ef4444" strokeWidth="1" strokeDasharray="4" />
              <text x="290" y="15" fill="#ef4444" fontSize="10" fontWeight="600">Diminishing</text>
              <text x="290" y="27" fill="#ef4444" fontSize="10" fontWeight="600">returns?</text>
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ padding: '8px 14px', borderRadius: 10, background: '#4f46e515', fontSize: 13, color: '#4f46e5', fontWeight: 600 }}>
              Efficiency matters more than raw size
            </div>
            <div style={{ padding: '8px 14px', borderRadius: 10, background: '#10b98115', fontSize: 13, color: '#10b981', fontWeight: 600 }}>
              Better data &gt; more parameters
            </div>
            <div style={{ padding: '8px 14px', borderRadius: 10, background: '#f9731615', fontSize: 13, color: '#f97316', fontWeight: 600 }}>
              New architectures may break the curve
            </div>
          </div>
        </div>
      </SectionBlock>

      {/* Section 8: Design Your AI Ethics Policy */}
      <InteractiveDemo title="Design Your AI Ethics Policy" instruction="Check the rules you would include in your AI ethics policy, then compare with real company policies.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {ethicsPolicies.map((policy) => (
            <motion.div
              key={policy.rule}
              whileHover={{ x: 4 }}
              onClick={() => { togglePolicy(policy.rule); setShowComparison(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 12,
                background: selectedPolicies.has(policy.rule) ? 'rgba(79,70,229,0.08)' : 'white',
                border: selectedPolicies.has(policy.rule) ? '2px solid #4f46e5' : '2px solid #e5e7eb',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: selectedPolicies.has(policy.rule) ? '#4f46e5' : 'white',
                border: selectedPolicies.has(policy.rule) ? 'none' : '2px solid #d1d5db',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 14, fontWeight: 700,
              }}>
                {selectedPolicies.has(policy.rule) && '\u2713'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: '#1e293b', lineHeight: 1.5 }}>{policy.rule}</div>
              </div>
              <div style={{
                fontSize: 11, padding: '2px 10px', borderRadius: 6,
                background: '#f1f5f9', color: '#64748b', fontWeight: 600,
              }}>
                {policy.category}
              </div>
            </motion.div>
          ))}
        </div>

        {selectedPolicies.size > 0 && (
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: '#475569', marginBottom: 10 }}>
              You selected {selectedPolicies.size} of {ethicsPolicies.length} rules
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowComparison(true)}
              style={{
                padding: '12px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700,
                background: '#4f46e5', color: 'white', border: 'none', cursor: 'pointer',
              }}
            >
              Compare with Real Policies
            </motion.button>
          </div>
        )}

        <AnimatePresence>
          {showComparison && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}
            >
              {Object.entries(realCompanyPolicies).map(([company, rules]) => {
                const score = getMatchScore(company)
                const displayName = company === 'EU_AI_Act' ? 'EU AI Act' : company
                return (
                  <div key={company} style={{
                    padding: 20, borderRadius: 14, background: 'white',
                    border: `2px solid ${score >= 70 ? '#10b981' : score >= 40 ? '#f97316' : '#e5e7eb'}`,
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>{displayName}</div>
                    <div style={{
                      fontSize: 32, fontWeight: 700, marginBottom: 4,
                      color: score >= 70 ? '#10b981' : score >= 40 ? '#f97316' : '#94a3b8',
                    }}>
                      {score}%
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>match with your policy</div>
                    <div style={{
                      height: 6, background: '#f1f5f9', borderRadius: 3, marginTop: 10,
                    }}>
                      <div style={{
                        width: `${score}%`, height: '100%', borderRadius: 3,
                        background: score >= 70 ? '#10b981' : score >= 40 ? '#f97316' : '#94a3b8',
                        transition: 'width 0.5s',
                      }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6 }}>
                      {rules.length} rules in their policy
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </InteractiveDemo>

      {/* NeuronTips */}
      <NeuronTip type="deep">
        <strong>The Alignment Tax:</strong> Making AI safe is not free. Safety measures like RLHF, red-teaming, and content filtering add significant cost and development time. Some estimate alignment work adds 20-40% to development costs. The debate is whether this "tax" is worth it (spoiler: it absolutely is).
      </NeuronTip>

      <NeuronTip type="tip">
        <strong>RLHF Limitations:</strong> Reinforcement Learning from Human Feedback has known weaknesses. Models can learn to be sycophantic (telling you what you want to hear) rather than truthful. They can also "reward hack" by finding patterns that score well with human raters without actually being better. This is why newer approaches like Constitutional AI and Direct Preference Optimization (DPO) are being explored.
      </NeuronTip>

      <NeuronTip type="example">
        <strong>The Control Problem in action:</strong> In 2016, Microsoft released "Tay," a Twitter chatbot that learned from conversations. Within 24 hours, trolls taught it to post offensive content. Microsoft shut it down. This is a small-scale example of the control problem: once AI interacts with the real world, controlling its behavior is incredibly difficult.
      </NeuronTip>

      <NeuronTip type="fun">
        <strong>Is AI conscious?</strong> This is one of the deepest questions in AI. In 2022, a Google engineer claimed LaMDA (now Gemini) was sentient. Most researchers disagree: LLMs simulate the patterns of consciousness without having subjective experience. But as models become more capable, this philosophical question becomes increasingly hard to dismiss.
      </NeuronTip>

      <NeuronTip type="simple">
        <strong>Think of AI safety like car safety:</strong> Cars are incredibly useful but also dangerous. We do not ban cars - we add seatbelts, airbags, speed limits, and driving tests. AI safety works the same way: we want to keep the benefits while minimizing the risks through thoughtful guardrails.
      </NeuronTip>

      {/* Closing Neuron */}
      <div style={{ marginTop: 32 }}>
        <Neuron mood="happy" size="medium" message="AI is one of the most transformative technologies in human history. By understanding its risks and working on safety, we can make sure it benefits everyone. The future is not something that happens to us - it is something we build together. Now go out there and use AI responsibly!" />
      </div>
    </div>
  )
}
