import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { NeuronTip, SectionBlock, InteractiveDemo } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ─── colour palette ─── */
const INDIGO  = '#4f46e5'
const SKY     = '#0ea5e9'
const EMERALD = '#10b981'
const ORANGE  = '#f97316'
const PINK    = '#ec4899'
const VIOLET  = '#8b5cf6'

/* ─── data ─── */
const modalities = [
  { icon: '📝', label: 'Text', color: INDIGO },
  { icon: '🖼️', label: 'Image', color: SKY },
  { icon: '🔊', label: 'Audio', color: EMERALD },
  { icon: '🎬', label: 'Video', color: ORANGE },
]

const visionModels = [
  {
    name: 'GPT-4V / GPT-4o',
    org: 'OpenAI',
    color: INDIGO,
    desc: 'Sees images and generates detailed text about them. GPT-4o adds native audio and video understanding.',
    strengths: ['Rich image descriptions', 'OCR & document reading', 'Code from screenshots'],
  },
  {
    name: 'Claude Vision',
    org: 'Anthropic',
    color: VIOLET,
    desc: 'Excellent at document understanding, chart reading, and careful visual analysis with nuanced reasoning.',
    strengths: ['Chart & table parsing', 'PDF analysis', 'Safety-aware outputs'],
  },
  {
    name: 'Gemini',
    org: 'Google DeepMind',
    color: EMERALD,
    desc: 'Natively multimodal — trained on text, images, video, and audio simultaneously from the ground up.',
    strengths: ['Long video understanding', 'Interleaved modalities', 'Multilingual vision'],
  },
  {
    name: 'LLaVA',
    org: 'Open Source',
    color: ORANGE,
    desc: 'An open-source vision-language model that pairs a CLIP vision encoder with LLaMA, fine-tuned on instruction data.',
    strengths: ['Fully open weights', 'Fine-tunable', 'Active community'],
  },
]

const useCases = [
  {
    icon: '🧾', title: 'Receipt Scanning',
    flow: ['Upload receipt photo', 'Vision encoder reads text', 'AI extracts items & total', 'Structured JSON output'],
    color: INDIGO,
  },
  {
    icon: '🩻', title: 'Medical Imaging',
    flow: ['Upload X-ray / scan', 'Image encoder processes pixels', 'AI highlights areas of concern', 'Report with findings'],
    color: PINK,
  },
  {
    icon: '💻', title: 'Screenshot to Code',
    flow: ['Take screenshot of UI', 'Vision model analyses layout', 'AI identifies components', 'Generates HTML/CSS/React code'],
    color: SKY,
  },
  {
    icon: '🎥', title: 'Video Summarisation',
    flow: ['Upload video clip', 'Sample key frames', 'Analyse visual + audio tracks', 'Text summary of events'],
    color: EMERALD,
  },
]

const quizScenarios = [
  {
    description: 'The image shows a golden retriever sitting on a green lawn next to a red frisbee. A child is standing 3 metres away with arms outstretched.',
    question: 'What would a vision-language model answer if asked "What is happening in this photo?"',
    options: [
      'A child is about to play fetch with a golden retriever on a lawn.',
      'A cat is sleeping on a couch.',
      'Two people are shaking hands in an office.',
    ],
    correct: 0,
  },
  {
    description: 'A bar chart showing quarterly revenue: Q1 $2M, Q2 $3.5M, Q3 $4.1M, Q4 $5.8M. Title reads "2025 Revenue Growth".',
    question: 'What would the AI extract from this chart?',
    options: [
      'Revenue declined over the year.',
      'Revenue grew each quarter, reaching $5.8M in Q4 2025.',
      'The chart shows employee headcount.',
    ],
    correct: 1,
  },
  {
    description: 'A handwritten note on lined paper reading: "Pick up milk, eggs, bread. Call dentist at 3pm."',
    question: 'What would the AI read from this image?',
    options: [
      'A recipe for banana bread.',
      'A to-do list: buy milk, eggs, bread and call dentist at 3 pm.',
      'Driving directions to the supermarket.',
    ],
    correct: 1,
  },
]

const pipelineBlocks = [
  { id: 'img_enc', label: 'Image Encoder (ViT)', icon: '🖼️', color: SKY, type: 'encoder' },
  { id: 'txt_enc', label: 'Text Encoder', icon: '📝', color: INDIGO, type: 'encoder' },
  { id: 'cross_attn', label: 'Cross-Attention', icon: '🔗', color: VIOLET, type: 'fusion' },
  { id: 'txt_dec', label: 'Text Decoder', icon: '💬', color: EMERALD, type: 'decoder' },
]

const correctOrder = ['img_enc', 'txt_enc', 'cross_attn', 'txt_dec']

/* ─── helper components ─── */
function ArrowRight({ color = 'var(--text-muted)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
      <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
        <path d="M0 9h22m0 0l-6-6m6 6l-6 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function ArrowDown({ color = 'var(--text-muted)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
      <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
        <path d="M9 0v22m0 0l-6-6m6 6l6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/* ─── MAIN ─── */
export default function Topic11_Multimodal() {
  const [quizIdx, setQuizIdx] = useState(0)
  const [quizAnswer, setQuizAnswer] = useState(null)

  /* pipeline builder state */
  const [pipeline, setPipeline] = useState([])
  const [pipelineMsg, setPipelineMsg] = useState('')

  const availableBlocks = pipelineBlocks.filter(b => !pipeline.includes(b.id))

  const addToPipeline = (id) => {
    const next = [...pipeline, id]
    setPipeline(next)
    setPipelineMsg('')
  }

  const resetPipeline = () => { setPipeline([]); setPipelineMsg('') }

  const checkPipeline = () => {
    if (pipeline.length < 4) { setPipelineMsg('Add all 4 blocks first!'); return }
    const isCorrect = pipeline.every((id, i) => id === correctOrder[i])
    setPipelineMsg(isCorrect
      ? 'Correct! Image and text are encoded, fused via cross-attention, then decoded into text.'
      : 'Not quite — think about what needs to happen first (encode inputs), then fuse, then decode.')
  }

  const scenario = quizScenarios[quizIdx]

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* ─── Neuron Intro ─── */}
      <Neuron mood="excited" size="large" typed message="LLMs can now SEE images, HEAR audio, and even WATCH videos! Welcome to the world of Multimodal AI, where models understand more than just text." />

      <div style={{ height: 48 }} />

      {/* ─── 1  What is Multimodal? ─── */}
      <SectionBlock icon="🌐" title="What is Multimodal AI?" color={INDIGO}>
        <HindiExplainer
          concept="मल्टीमॉडल AI"
          english="Multimodal AI"
          explanation="पहले AI सिर्फ़ text समझता था। अब ये तस्वीरें, audio, video भी समझ सकता है! एक ही model text भी पढ़ सकता है, photo भी देख सकता है, और आवाज़ भी सुन सकता है।"
          example="पहले AI एक ऐसा दोस्त था जो सिर्फ़ chat कर सकता था। अब ये ऐसा दोस्त है जिसे photo भेजो तो बताता है 'ये Taj Mahal है', voice note भेजो तो सुनकर जवाब देता है। जैसे WhatsApp पर text + photo + voice सब भेज सकते हो!"
          terms={[
            { hindi: 'मल्टीमॉडल', english: 'Multimodal', meaning: 'एक से ज़्यादा format — text + image + audio' },
            { hindi: 'विज़न', english: 'Vision', meaning: 'AI की तस्वीर देखने की क्षमता' },
            { hindi: 'OCR', english: 'OCR', meaning: 'तस्वीर में लिखा text पढ़ना' },
          ]}
        />
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
          A <strong style={{ color: 'var(--text-primary)' }}>multimodal</strong> model can process <em>and</em> produce more than one type of data — text, images, audio, or video — all within a single architecture.
        </p>

        {/* Diagram: inputs → model → outputs */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
          padding: 28, background: 'var(--bg-secondary)', borderRadius: 18,
        }}>
          {/* Inputs row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {modalities.map(m => (
              <motion.div key={m.label} whileHover={{ scale: 1.08 }} style={{
                padding: '14px 22px', borderRadius: 14,
                background: `${m.color}15`, border: `1.5px solid ${m.color}40`,
                textAlign: 'center', minWidth: 90,
              }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{m.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: m.color }}>{m.label}</div>
              </motion.div>
            ))}
          </div>

          <ArrowDown color={INDIGO} />

          {/* Unified model */}
          <motion.div
            animate={{ boxShadow: [`0 0 0px ${INDIGO}33`, `0 0 24px ${INDIGO}55`, `0 0 0px ${INDIGO}33`] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            style={{
              padding: '20px 48px', borderRadius: 18,
              background: `linear-gradient(135deg, ${INDIGO}, ${VIOLET})`,
              color: '#fff', fontWeight: 700, fontSize: 18, textAlign: 'center',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Unified Multimodal Model
          </motion.div>

          <ArrowDown color={INDIGO} />

          {/* Outputs row */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            {modalities.map(m => (
              <div key={m.label + '-out'} style={{
                padding: '12px 20px', borderRadius: 14,
                background: `${m.color}10`, border: `1.5px dashed ${m.color}50`,
                textAlign: 'center', minWidth: 90,
              }}>
                <div style={{ fontSize: 22, marginBottom: 2 }}>{m.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: m.color }}>Output</div>
              </div>
            ))}
          </div>
        </div>

        <NeuronTip type="simple">
          Think of it like a person who can read, look at pictures, and listen to music — all at once — then talk about any of them.
        </NeuronTip>
      </SectionBlock>

      {/* ─── 2  How Vision-Language Models Work ─── */}
      <SectionBlock icon="👁️" title="How Vision-Language Models Work" color={SKY}>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
          The most common multimodal setup pairs a <strong style={{ color: 'var(--text-primary)' }}>vision encoder</strong> with a <strong style={{ color: 'var(--text-primary)' }}>language model</strong>. Here is the step-by-step flow:
        </p>

        {/* Step-by-step diagram */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: 24, background: 'var(--bg-secondary)', borderRadius: 18 }}>

          {/* Step 1 — Image Patches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontSize: 40, marginBottom: 4 }}>🖼️</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Input Image</div>
            </div>
            <ArrowRight color={SKY} />
            {/* Grid patches */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(4, 36px)', gap: 3,
            }}>
              {Array.from({ length: 16 }).map((_, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    width: 36, height: 36, borderRadius: 6,
                    background: `${SKY}${(20 + i * 4).toString(16)}`,
                    border: `1px solid ${SKY}40`,
                  }}
                />
              ))}
            </div>
            <ArrowRight color={SKY} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['v1', 'v2', 'v3', '...', 'v16'].map(v => (
                <div key={v} style={{
                  padding: '3px 14px', borderRadius: 8,
                  background: `${SKY}18`, fontSize: 12, fontFamily: 'monospace', color: SKY,
                  fontWeight: 600,
                }}>
                  {v}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 160 }}>
              <strong style={{ color: SKY }}>ViT Encoder</strong> splits image into patches and converts each to a vector embedding.
            </div>
          </div>

          <div style={{ height: 20 }} />

          {/* Step 2 — Text Encoder */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', minWidth: 100 }}>
              <div style={{ fontSize: 40, marginBottom: 4 }}>📝</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Question</div>
            </div>
            <ArrowRight color={INDIGO} />
            <div style={{ display: 'flex', gap: 6 }}>
              {['What', 'is', 'in', 'this', 'image', '?'].map(t => (
                <div key={t} style={{
                  padding: '6px 12px', borderRadius: 8,
                  background: `${INDIGO}15`, fontSize: 13, fontWeight: 600, color: INDIGO,
                }}>
                  {t}
                </div>
              ))}
            </div>
            <ArrowRight color={INDIGO} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {['t1', 't2', 't3', '...', 't6'].map(v => (
                <div key={v} style={{
                  padding: '3px 14px', borderRadius: 8,
                  background: `${INDIGO}18`, fontSize: 12, fontFamily: 'monospace', color: INDIGO,
                  fontWeight: 600,
                }}>
                  {v}
                </div>
              ))}
            </div>
          </div>

          <div style={{ height: 20 }} />

          {/* Step 3 — Cross-Attention */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
            padding: 20, borderRadius: 16,
            background: `linear-gradient(135deg, ${VIOLET}10, ${SKY}10)`,
            border: `1.5px solid ${VIOLET}30`,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ padding: '8px 16px', borderRadius: 10, background: `${SKY}20`, fontSize: 13, fontWeight: 700, color: SKY }}>Image Vectors</div>
              <span style={{ fontSize: 24, color: VIOLET }}>+</span>
              <div style={{ padding: '8px 16px', borderRadius: 10, background: `${INDIGO}20`, fontSize: 13, fontWeight: 700, color: INDIGO }}>Text Vectors</div>
            </div>
            <ArrowRight color={VIOLET} />
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{
                padding: '12px 24px', borderRadius: 14,
                background: `linear-gradient(135deg, ${VIOLET}, ${SKY})`,
                color: '#fff', fontWeight: 700, fontSize: 14,
              }}
            >
              Cross-Attention Fusion
            </motion.div>
            <ArrowRight color={EMERALD} />
            <div style={{ padding: '8px 16px', borderRadius: 10, background: `${EMERALD}20`, fontSize: 13, fontWeight: 700, color: EMERALD }}>
              Fused Representation
            </div>
          </div>

          <div style={{ height: 12 }} />
          <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
            The <strong style={{ color: VIOLET }}>cross-attention</strong> mechanism lets each text token "look at" every image patch to find relevant visual information — just like attention in Transformers, but across two modalities.
          </div>
        </div>

        <NeuronTip type="deep">
          <strong>Cross-Attention in detail:</strong> The text tokens produce Queries, while image patches produce Keys and Values. The attention scores tell the model which parts of the image are relevant to each word in the question.
        </NeuronTip>
      </SectionBlock>

      {/* ─── 3  Interactive: What Does the AI See? ─── */}
      <InteractiveDemo title="What Does the AI See?" instruction="Read the image description, then pick what the AI would answer.">
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Scenario {quizIdx + 1} of {quizScenarios.length}
          </div>

          {/* Simulated image card */}
          <div style={{
            padding: 24, borderRadius: 16,
            background: 'rgba(255,255,255,0.7)', border: '1.5px dashed #93b4f8',
            marginBottom: 16,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: INDIGO, marginBottom: 8 }}>Described Image:</div>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
              {scenario.description}
            </p>
          </div>

          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            {scenario.question}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {scenario.options.map((opt, i) => {
              const isCorrect = i === scenario.correct
              const isSelected = quizAnswer === i
              let bg = 'rgba(255,255,255,0.6)'
              let border = '#d0d5dd'
              if (quizAnswer !== null) {
                if (isCorrect) { bg = '#ecfdf5'; border = EMERALD }
                else if (isSelected && !isCorrect) { bg = '#fef2f2'; border = '#ef4444' }
              }
              return (
                <motion.button key={i}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => quizAnswer === null && setQuizAnswer(i)}
                  style={{
                    padding: '14px 20px', borderRadius: 12,
                    background: bg, border: `1.5px solid ${border}`,
                    textAlign: 'left', cursor: quizAnswer === null ? 'pointer' : 'default',
                    fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.6,
                  }}
                >
                  {opt}
                  {quizAnswer !== null && isCorrect && <span style={{ marginLeft: 8, color: EMERALD, fontWeight: 700 }}>Correct</span>}
                  {isSelected && !isCorrect && <span style={{ marginLeft: 8, color: '#ef4444', fontWeight: 700 }}>Incorrect</span>}
                </motion.button>
              )
            })}
          </div>

          {quizAnswer !== null && (
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              onClick={() => {
                setQuizAnswer(null)
                setQuizIdx((quizIdx + 1) % quizScenarios.length)
              }}
              style={{
                marginTop: 16, padding: '10px 24px', borderRadius: 10,
                background: INDIGO, color: '#fff', border: 'none',
                fontWeight: 600, fontSize: 14, cursor: 'pointer',
              }}
            >
              Next Scenario
            </motion.button>
          )}
        </div>
      </InteractiveDemo>

      {/* ─── 4  Real Models ─── */}
      <SectionBlock icon="🏆" title="Leading Vision-Language Models" color={VIOLET}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {visionModels.map(m => (
            <motion.div key={m.name}
              whileHover={{ y: -4 }}
              style={{
                padding: 24, borderRadius: 18,
                background: `${m.color}08`, border: `1.5px solid ${m.color}25`,
              }}
            >
              <div style={{ fontSize: 14, color: m.color, fontWeight: 700, marginBottom: 2, fontFamily: 'var(--font-heading)' }}>
                {m.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 10 }}>{m.org}</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 12, margin: '0 0 12px' }}>
                {m.desc}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {m.strengths.map(s => (
                  <span key={s} style={{
                    padding: '4px 10px', borderRadius: 8,
                    background: `${m.color}15`, fontSize: 11, fontWeight: 600, color: m.color,
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* ─── 5  Real-Life Use Cases ─── */}
      <SectionBlock icon="🚀" title="Real-Life Use Cases" color={EMERALD}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
          {useCases.map(uc => (
            <motion.div key={uc.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{
                padding: 24, borderRadius: 18,
                background: 'var(--bg-card)', border: `1.5px solid ${uc.color}25`,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{uc.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 14 }}>
                {uc.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {uc.flow.map((step, i) => (
                  <div key={i}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 14px', borderRadius: 10,
                      background: `${uc.color}${(8 + i * 4).toString(16).padStart(2, '0')}`,
                    }}>
                      <div style={{
                        minWidth: 22, height: 22, borderRadius: '50%',
                        background: uc.color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 700,
                      }}>
                        {i + 1}
                      </div>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{step}</span>
                    </div>
                    {i < uc.flow.length - 1 && (
                      <div style={{ marginLeft: 20, height: 14, borderLeft: `2px dashed ${uc.color}40` }} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* ─── 6  Interactive Pipeline Builder ─── */}
      <InteractiveDemo title="Multimodal Pipeline Builder" instruction="Drag the blocks in the correct order to build a vision-language pipeline. Add: Image Encoder, Text Encoder, Cross-Attention, then Text Decoder.">
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
            Available Blocks
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', minHeight: 52 }}>
            <AnimatePresence>
              {availableBlocks.map(b => (
                <motion.button key={b.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addToPipeline(b.id)}
                  style={{
                    padding: '10px 18px', borderRadius: 12,
                    background: `${b.color}15`, border: `1.5px solid ${b.color}40`,
                    fontSize: 13, fontWeight: 600, color: b.color,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span>{b.icon}</span> {b.label}
                </motion.button>
              ))}
            </AnimatePresence>
            {availableBlocks.length === 0 && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>All blocks placed!</span>
            )}
          </div>
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
          Your Pipeline
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
          minHeight: 60, padding: 16, borderRadius: 14,
          background: 'rgba(255,255,255,0.5)', border: '1.5px dashed #93b4f8',
        }}>
          <AnimatePresence>
            {pipeline.map((id, i) => {
              const b = pipelineBlocks.find(x => x.id === id)
              return (
                <motion.div key={id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {i > 0 && <ArrowRight color={b.color} />}
                  <div style={{
                    padding: '10px 16px', borderRadius: 12,
                    background: `${b.color}20`, border: `1.5px solid ${b.color}50`,
                    fontSize: 13, fontWeight: 700, color: b.color,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span>{b.icon}</span> {b.label}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
          {pipeline.length === 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Click blocks above to add them here...</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={checkPipeline}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: INDIGO, color: '#fff', border: 'none',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            Check Pipeline
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={resetPipeline}
            style={{
              padding: '10px 24px', borderRadius: 10,
              background: 'transparent', color: 'var(--text-secondary)',
              border: '1.5px solid var(--border)',
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}
          >
            Reset
          </motion.button>
        </div>

        {pipelineMsg && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              marginTop: 14, padding: '12px 18px', borderRadius: 12,
              background: pipelineMsg.startsWith('Correct') ? '#ecfdf5' : '#fef3c7',
              color: pipelineMsg.startsWith('Correct') ? '#065f46' : '#92400e',
              fontSize: 14, fontWeight: 600,
            }}
          >
            {pipelineMsg}
          </motion.div>
        )}
      </InteractiveDemo>

      {/* ─── 7  Audio Models ─── */}
      <SectionBlock icon="🎤" title="Audio & Speech Models" color={ORANGE}>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 20 }}>
          Multimodal AI is not just about vision. Audio understanding and generation are equally important.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {[
            { name: 'Whisper', org: 'OpenAI', desc: 'State-of-the-art speech-to-text. Handles accents, noise, and 99+ languages.', icon: '🎙️', color: INDIGO },
            { name: 'TTS Models', org: 'Various', desc: 'Convert text to natural-sounding speech. OpenAI TTS, ElevenLabs, Bark, and more.', icon: '🔊', color: EMERALD },
            { name: 'Audio Understanding', org: 'Gemini / GPT-4o', desc: 'Directly understand audio input — music, speech, environmental sounds — no transcription step needed.', icon: '🎵', color: VIOLET },
          ].map(m => (
            <div key={m.name} style={{
              padding: 22, borderRadius: 16,
              background: `${m.color}08`, border: `1.5px solid ${m.color}25`,
            }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: m.color, marginBottom: 4 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>{m.org}</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </SectionBlock>

      {/* ─── 8  NeuronTips ─── */}
      <NeuronTip type="deep">
        <strong>CLIP (Contrastive Language-Image Pretraining):</strong> Trained by OpenAI, CLIP learns to match images and text descriptions in a shared embedding space. It uses <em>contrastive learning</em> — pushing matching image-text pairs closer together and non-matching pairs apart. CLIP is the backbone of most vision-language models today.
      </NeuronTip>

      <NeuronTip type="fun">
        <strong>Token costs for images:</strong> When you send an image to GPT-4V, the image is converted to roughly 85-1700 tokens depending on resolution. A high-res photo costs as many tokens as a full essay! This is why multimodal APIs charge more for image inputs.
      </NeuronTip>

      <NeuronTip type="example">
        <strong>Contrastive Learning in plain English:</strong> Imagine 1000 photos each paired with a caption. CLIP looks at all 1,000,000 possible photo-caption combinations and learns which 1000 are the real matches. After training, it can match new photos to new captions it has never seen before.
      </NeuronTip>

      <NeuronTip type="tip">
        <strong>Getting better results from vision models:</strong> Be specific in your prompts! Instead of "What's in this image?", try "List every food item visible in this photo and estimate the total calories." The more specific you are, the more useful the output.
      </NeuronTip>

      {/* ─── Neuron Outro ─── */}
      <div style={{ height: 32 }} />
      <Neuron mood="happy" message="Multimodal AI is blurring the line between how humans and machines perceive the world. Next up, we will see how AI can CREATE images from scratch!" />
    </div>
  )
}
