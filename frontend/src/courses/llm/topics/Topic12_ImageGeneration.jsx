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
const generations = [
  {
    era: '2014',
    name: 'GANs',
    full: 'Generative Adversarial Networks',
    color: ORANGE,
    icon: '⚔️',
    desc: 'Two neural networks fight: the Generator creates fakes, the Discriminator tries to spot them. They improve each other.',
    pros: ['Fast generation', 'Sharp images'],
    cons: ['Mode collapse', 'Hard to train', 'Unstable'],
  },
  {
    era: '2013-18',
    name: 'VAEs',
    full: 'Variational Autoencoders',
    color: SKY,
    icon: '🔄',
    desc: 'Compress images into a compact latent space, then decode back. Learns a smooth, continuous representation.',
    pros: ['Stable training', 'Smooth latent space'],
    cons: ['Blurry outputs', 'Less detail'],
  },
  {
    era: '2020+',
    name: 'Diffusion',
    full: 'Diffusion Models',
    color: VIOLET,
    icon: '🌊',
    desc: 'Learn to remove noise step-by-step. Start from pure static and gradually denoise into a crisp image. Current state of the art.',
    pros: ['Best quality', 'Diverse outputs', 'Controllable'],
    cons: ['Slow generation', 'Compute-heavy'],
  },
]

const diffusionSteps = [
  { label: 'Clean', noise: 0, color: EMERALD },
  { label: 'Light noise', noise: 0.2, color: '#22c55e' },
  { label: 'Medium noise', noise: 0.5, color: ORANGE },
  { label: 'Heavy noise', noise: 0.75, color: '#ef4444' },
  { label: 'Pure noise', noise: 1.0, color: PINK },
]

const majorModels = [
  {
    name: 'DALL-E 3',
    org: 'OpenAI',
    color: INDIGO,
    icon: '🎨',
    strength: 'Best text understanding',
    desc: 'Excels at following complex, detailed prompts. Built-in prompt rewriting improves results automatically.',
    features: ['Integrated in ChatGPT', 'Great typography', 'Prompt rewriting'],
  },
  {
    name: 'Midjourney',
    org: 'Midjourney Inc.',
    color: SKY,
    icon: '🖌️',
    strength: 'Best aesthetics',
    desc: 'Known for stunning, artistic image quality. Particularly strong at photorealistic and cinematic styles.',
    features: ['Discord-based', 'Style controls', 'Upscaling'],
  },
  {
    name: 'Stable Diffusion',
    org: 'Stability AI',
    color: EMERALD,
    icon: '🔓',
    strength: 'Open source & customisable',
    desc: 'Fully open-source. Run locally, fine-tune on your own data, build custom pipelines. Huge ecosystem.',
    features: ['Open weights', 'LoRA fine-tuning', 'ComfyUI / A1111'],
  },
  {
    name: 'Imagen 3',
    org: 'Google DeepMind',
    color: ORANGE,
    icon: '📷',
    strength: 'Photorealism',
    desc: 'Google\'s latest image model with exceptional photorealism and text rendering capabilities.',
    features: ['Photorealistic', 'Text in images', 'Safety filters'],
  },
  {
    name: 'Flux',
    org: 'Black Forest Labs',
    color: VIOLET,
    icon: '⚡',
    strength: 'Latest open model',
    desc: 'Created by ex-Stability AI researchers. Uses a flow-matching architecture for faster, higher-quality generation.',
    features: ['Flow matching', 'Open weights', 'Fast inference'],
  },
]

const promptExamples = [
  {
    base: 'A cat sitting on a chair',
    variations: [
      { change: '+ "oil painting style"', result: 'Classical oil painting with rich brush strokes, warm gallery lighting, thick impasto texture', color: ORANGE },
      { change: '+ "cyberpunk neon"', result: 'Futuristic neon-lit scene, holographic cat, glowing circuit patterns on chair, rain-slicked streets', color: PINK },
      { change: '+ "Studio Ghibli"', result: 'Soft watercolour, whimsical details, warm afternoon light, hand-drawn feel, cosy room', color: EMERALD },
      { change: '+ "photorealistic 8K"', result: 'Ultra-detailed photograph, shallow depth of field, natural light, visible fur texture', color: SKY },
    ],
  },
]

const controlTechniques = [
  {
    name: 'ControlNet',
    icon: '🎛️',
    color: INDIGO,
    desc: 'Add spatial control via edge maps, depth maps, pose skeletons, or segmentation masks. The output follows the structure of your control image.',
    flow: ['Control image (edges/pose/depth)', 'ControlNet encoder', 'Guides diffusion process', 'Structurally matched output'],
  },
  {
    name: 'img2img',
    icon: '🔄',
    color: SKY,
    desc: 'Start from an existing image instead of pure noise. The model adds noise then denoises, keeping the original composition while changing style or details.',
    flow: ['Source image', 'Add partial noise', 'Denoise with new prompt', 'Modified image'],
  },
  {
    name: 'Inpainting',
    icon: '🖌️',
    color: EMERALD,
    desc: 'Mask a region of an image and regenerate only that area. Perfect for removing objects, changing backgrounds, or fixing faces.',
    flow: ['Original + mask region', 'Encode unmasked context', 'Generate masked area', 'Seamless result'],
  },
]

const realLifeUses = [
  { icon: '📸', title: 'Product Photography', desc: 'Generate product shots in any setting without a studio. E-commerce companies save thousands on photo shoots.', color: INDIGO },
  { icon: '🎮', title: 'Concept Art & Games', desc: 'Game designers rapidly iterate on character designs, environments, and props. Hours of work become minutes.', color: PINK },
  { icon: '🏗️', title: 'Architecture', desc: 'Visualise building designs in different styles, lighting, and seasons before construction begins.', color: SKY },
  { icon: '👗', title: 'Fashion Design', desc: 'Generate clothing designs, pattern variations, and virtual try-on mockups for rapid prototyping.', color: VIOLET },
  { icon: '🎬', title: 'Film & Animation', desc: 'Storyboards, matte paintings, and visual effects concepts generated in seconds.', color: ORANGE },
  { icon: '📚', title: 'Education & Books', desc: 'Illustrate textbooks, children\'s books, and educational materials at a fraction of traditional cost.', color: EMERALD },
]

/* ─── helpers ─── */
function ArrowDown({ color = 'var(--text-muted)' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
      <svg width="18" height="28" viewBox="0 0 18 28" fill="none">
        <path d="M9 0v22m0 0l-6-6m6 6l6-6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function ArrowRight({ color = 'var(--text-muted)' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
      <svg width="28" height="18" viewBox="0 0 28 18" fill="none">
        <path d="M0 9h22m0 0l-6-6m6 6l-6 6" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

/* noise pattern helper — generates CSS for a grid-based visual noise simulation */
function NoiseBlock({ level, size = 120 }) {
  const cells = 10
  return (
    <div style={{
      width: size, height: size, borderRadius: 14,
      display: 'grid', gridTemplateColumns: `repeat(${cells}, 1fr)`,
      gridTemplateRows: `repeat(${cells}, 1fr)`,
      overflow: 'hidden', border: '1.5px solid var(--border)',
    }}>
      {Array.from({ length: cells * cells }).map((_, i) => {
        const isNoisy = Math.random() < level
        const baseHue = 200 + (i % cells) * 5
        const baseLightness = 40 + (Math.floor(i / cells)) * 4
        const noisyColor = `hsl(${Math.random() * 360}, ${50 + Math.random() * 50}%, ${30 + Math.random() * 60}%)`
        const cleanColor = `hsl(${baseHue}, 60%, ${baseLightness}%)`
        return (
          <div key={i} style={{
            background: isNoisy ? noisyColor : cleanColor,
          }} />
        )
      })}
    </div>
  )
}

/* ─── MAIN ─── */
export default function Topic12_ImageGeneration() {
  const [denoiseSlider, setDenoiseSlider] = useState(100)
  const [activePromptVar, setActivePromptVar] = useState(0)
  const [expandedTech, setExpandedTech] = useState(null)

  /* Convert slider 0-100 to noise level: 100 = full noise, 0 = clean */
  const noiseLevel = denoiseSlider / 100

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* ─── Neuron Intro ─── */}
      <Neuron mood="excited" size="large" typed message='How does AI CREATE images from text? Let me show you the magic of diffusion — the technology behind DALL-E, Stable Diffusion, and Midjourney!' />

      <div style={{ height: 48 }} />

      {/* ─── 1  Three Generations Timeline ─── */}
      <SectionBlock icon="📅" title="The 3 Generations of Image AI" color={ORANGE}>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 28 }}>
          Image generation AI has evolved dramatically. Each generation brought a leap in quality and controllability.
        </p>

        {/* Timeline */}
        <div style={{ position: 'relative', paddingLeft: 32 }}>
          {/* vertical line */}
          <div style={{
            position: 'absolute', left: 14, top: 0, bottom: 0, width: 3,
            background: 'linear-gradient(to bottom, ' + ORANGE + ', ' + SKY + ', ' + VIOLET + ')',
            borderRadius: 2,
          }} />

          {generations.map((gen, i) => (
            <motion.div key={gen.name}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              style={{ marginBottom: 28, position: 'relative' }}
            >
              {/* dot on timeline */}
              <div style={{
                position: 'absolute', left: -25, top: 18,
                width: 16, height: 16, borderRadius: '50%',
                background: gen.color, border: '3px solid var(--bg-card)',
                boxShadow: `0 0 0 2px ${gen.color}`,
              }} />

              <div style={{
                padding: 24, borderRadius: 18,
                background: `${gen.color}08`, border: `1.5px solid ${gen.color}25`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>{gen.icon}</span>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: gen.color,
                    padding: '3px 10px', borderRadius: 6, background: `${gen.color}15`,
                  }}>
                    {gen.era}
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    {gen.name}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>({gen.full})</span>
                </div>
                <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 12px' }}>
                  {gen.desc}
                </p>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: EMERALD, fontWeight: 700, marginBottom: 4 }}>Pros</div>
                    {gen.pros.map(p => (
                      <div key={p} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>+ {p}</div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#ef4444', fontWeight: 700, marginBottom: 4 }}>Cons</div>
                    {gen.cons.map(c => (
                      <div key={c} style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 2 }}>- {c}</div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* ─── 2  How Diffusion Works ─── */}
      <SectionBlock icon="🌊" title="How Diffusion Models Work" color={VIOLET}>
        <HindiExplainer
          concept="AI से तस्वीर बनाना"
          english="Image Generation"
          explanation="अब AI text पढ़कर तस्वीर बना सकता है! बस लिखो 'sunset over mountains with a lake' और AI एक beautiful painting बना देगा। ये Diffusion Model कहलाता है — noise से शुरू करके धीरे-धीरे clear image बनाता है।"
          example="जैसे TV पर static/snow दिखता है ना — अब imagine करो वो static धीरे-धीरे clear होकर एक painting बन जाए! DALL-E और Midjourney ऐसे ही काम करते हैं — random dots से शुरू, clear art पर ख़त्म।"
          terms={[
            { hindi: 'डिफ़्यूज़न', english: 'Diffusion', meaning: 'noise से image बनाने की प्रक्रिया — धीरे-धीरे clear करना' },
            { hindi: 'प्रॉम्प्ट', english: 'Prompt', meaning: 'text description जो AI को बताता है क्या बनाना है' },
            { hindi: 'स्टेबल डिफ़्यूज़न', english: 'Stable Diffusion', meaning: 'free, open-source image generator' },
          ]}
        />
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
          The core idea is beautifully simple: <strong style={{ color: 'var(--text-primary)' }}>teach a model to remove noise</strong>. If you can remove noise step-by-step, you can start from pure static and end up with a crisp image.
        </p>

        {/* Forward process */}
        <div style={{
          padding: 24, borderRadius: 18,
          background: 'var(--bg-secondary)', marginBottom: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            Forward Process: Adding Noise
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {diffusionSteps.map((step, i) => (
              <motion.div key={step.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div style={{ textAlign: 'center' }}>
                  <NoiseBlock level={step.noise} size={80} />
                  <div style={{ fontSize: 11, fontWeight: 600, color: step.color, marginTop: 6 }}>{step.label}</div>
                </div>
                {i < diffusionSteps.length - 1 && (
                  <ArrowRight color="#ef4444" />
                )}
              </motion.div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
            Gradually add Gaussian noise until the image is completely destroyed.
          </p>
        </div>

        {/* Reverse process */}
        <div style={{
          padding: 24, borderRadius: 18,
          background: 'var(--bg-secondary)', marginBottom: 20,
        }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: EMERALD, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
            Reverse Process: Removing Noise (The Magic!)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[...diffusionSteps].reverse().map((step, i) => (
              <motion.div key={step.label + '-rev'}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div style={{ textAlign: 'center' }}>
                  <NoiseBlock level={step.noise} size={80} />
                  <div style={{ fontSize: 11, fontWeight: 600, color: step.color, marginTop: 6 }}>{step.label}</div>
                </div>
                {i < diffusionSteps.length - 1 && (
                  <ArrowRight color={EMERALD} />
                )}
              </motion.div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
            The model learns to predict and remove noise at each step, reconstructing the image.
          </p>
        </div>

        <NeuronTip type="simple">
          Imagine someone slowly scribbling over a photo until it is all scribbles. Diffusion models learn to UNDO the scribbles — one tiny eraser stroke at a time — until the photo reappears. To generate a NEW image, start with all scribbles and let the model erase its way to a picture!
        </NeuronTip>
      </SectionBlock>

      {/* ─── 3  Interactive: Denoising Slider ─── */}
      <InteractiveDemo title="Watch Denoising in Action" instruction="Drag the slider from right (pure noise) to left (clean image) to simulate the denoising process.">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          {/* Visual representation */}
          <div style={{ position: 'relative', width: 240, height: 240 }}>
            {/* Clean "image" layer */}
            <div style={{
              width: '100%', height: '100%', borderRadius: 20,
              background: `linear-gradient(135deg, ${INDIGO}30, ${SKY}40, ${EMERALD}30, ${ORANGE}20)`,
              position: 'absolute', top: 0, left: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden',
            }}>
              {/* Simulated landscape elements */}
              <div style={{
                width: '100%', height: '40%',
                background: `linear-gradient(to bottom, ${SKY}60, ${SKY}30)`,
              }} />
              <div style={{
                width: '100%', height: '20%',
                background: `linear-gradient(to bottom, ${EMERALD}50, ${EMERALD}30)`,
              }} />
              <div style={{
                width: '100%', height: '40%',
                background: `linear-gradient(to bottom, ${EMERALD}20, ${ORANGE}15)`,
              }} />
              {/* Sun */}
              <div style={{
                position: 'absolute', top: '15%', right: '20%',
                width: 36, height: 36, borderRadius: '50%',
                background: `radial-gradient(circle, #fbbf24, ${ORANGE})`,
                boxShadow: `0 0 20px #fbbf2480`,
              }} />
              {/* Mountain */}
              <div style={{
                position: 'absolute', bottom: '38%', left: '10%',
                width: 0, height: 0,
                borderLeft: '60px solid transparent',
                borderRight: '60px solid transparent',
                borderBottom: `80px solid ${VIOLET}40`,
              }} />
              <div style={{
                position: 'absolute', bottom: '38%', left: '40%',
                width: 0, height: 0,
                borderLeft: '45px solid transparent',
                borderRight: '45px solid transparent',
                borderBottom: `60px solid ${INDIGO}35`,
              }} />
            </div>

            {/* Noise overlay */}
            <div style={{
              width: '100%', height: '100%', borderRadius: 20,
              position: 'absolute', top: 0, left: 0,
              opacity: noiseLevel,
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: 'cover',
              mixBlendMode: 'normal',
              background: noiseLevel > 0.5
                ? `repeating-conic-gradient(from 0deg, ${PINK}30 0%, ${INDIGO}20 2%, ${SKY}25 4%, ${ORANGE}20 6%, ${VIOLET}30 8%)`
                : `repeating-conic-gradient(from 0deg, ${PINK}15 0%, transparent 3%, ${SKY}10 6%, transparent 9%)`,
            }} />

            {/* Additional grain layer for realism */}
            <div style={{
              width: '100%', height: '100%', borderRadius: 20,
              position: 'absolute', top: 0, left: 0,
              opacity: noiseLevel * 0.8,
              background: `radial-gradient(circle at ${30 + noiseLevel * 40}% ${20 + noiseLevel * 30}%, rgba(0,0,0,0.3) 0%, transparent 50%),
                           radial-gradient(circle at ${70 - noiseLevel * 20}% ${60 + noiseLevel * 20}%, rgba(255,255,255,0.2) 0%, transparent 40%)`,
            }} />
          </div>

          {/* Labels */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 16, fontWeight: 700,
              color: noiseLevel < 0.3 ? EMERALD : noiseLevel < 0.7 ? ORANGE : PINK,
            }}>
              {noiseLevel < 0.15 ? 'Clean Image!' :
               noiseLevel < 0.3 ? 'Almost there...' :
               noiseLevel < 0.5 ? 'Getting clearer' :
               noiseLevel < 0.7 ? 'Some structure visible' :
               noiseLevel < 0.9 ? 'Mostly noise' :
               'Pure noise — starting point'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
              Denoising step: {100 - denoiseSlider}%
            </div>
          </div>

          {/* Slider */}
          <div style={{ width: '100%', maxWidth: 400 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>
              <span style={{ color: EMERALD, fontWeight: 600 }}>Clean Image</span>
              <span style={{ color: PINK, fontWeight: 600 }}>Pure Noise</span>
            </div>
            <input type="range" min={0} max={100} value={denoiseSlider}
              onChange={e => setDenoiseSlider(Number(e.target.value))}
              style={{
                width: '100%', height: 8, borderRadius: 4,
                appearance: 'none', outline: 'none', cursor: 'pointer',
                background: `linear-gradient(to right, ${EMERALD}, ${ORANGE}, ${PINK})`,
              }}
            />
          </div>
        </div>
      </InteractiveDemo>

      {/* ─── 4  Text-to-Image Pipeline ─── */}
      <SectionBlock icon="🔧" title="Text-to-Image Pipeline" color={INDIGO}>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
          Here is how a text prompt becomes a generated image, step by step:
        </p>

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
          padding: 28, background: 'var(--bg-secondary)', borderRadius: 18,
        }}>
          {[
            { icon: '💬', label: 'Text Prompt', detail: '"A castle on a cliff at sunset, oil painting"', color: INDIGO },
            { icon: '📐', label: 'CLIP Text Encoder', detail: 'Converts text into a semantic embedding vector', color: SKY },
            { icon: '🔗', label: 'Cross-Attention into U-Net', detail: 'Text embedding guides the denoising at each step', color: VIOLET },
            { icon: '🔄', label: 'Iterative Denoising (20-50 steps)', detail: 'U-Net predicts & removes noise, guided by the text', color: ORANGE },
            { icon: '🖼️', label: 'VAE Decoder', detail: 'Upscales from latent space to full pixel image', color: EMERALD },
            { icon: '✨', label: 'Final Image', detail: 'A beautiful castle on a cliff at sunset!', color: PINK },
          ].map((step, i, arr) => (
            <div key={step.label}>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '14px 22px', borderRadius: 14,
                  background: `${step.color}10`, border: `1.5px solid ${step.color}30`,
                  minWidth: 320,
                }}
              >
                <div style={{
                  minWidth: 44, height: 44, borderRadius: 12,
                  background: `${step.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>
                  {step.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: step.color }}>{step.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{step.detail}</div>
                </div>
              </motion.div>
              {i < arr.length - 1 && <ArrowDown color={step.color} />}
            </div>
          ))}
        </div>

        <NeuronTip type="deep">
          <strong>Latent Diffusion:</strong> Stable Diffusion works in a compressed "latent space" (64x64) rather than full pixel space (512x512). This makes it 10-100x faster. The VAE compresses the image before diffusion and decompresses after — same quality, way less compute.
        </NeuronTip>
      </SectionBlock>

      {/* ─── 5  Major Models ─── */}
      <SectionBlock icon="🏆" title="Major Image Generation Models" color={PINK}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
          {majorModels.map(m => (
            <motion.div key={m.name}
              whileHover={{ y: -4 }}
              style={{
                padding: 24, borderRadius: 18,
                background: `${m.color}08`, border: `1.5px solid ${m.color}25`,
                display: 'flex', flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.org}</div>
                </div>
              </div>
              <div style={{
                padding: '4px 10px', borderRadius: 8, alignSelf: 'flex-start',
                background: `${m.color}15`, fontSize: 11, fontWeight: 700, color: m.color,
                marginBottom: 10,
              }}>
                {m.strength}
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 12px', flex: 1 }}>
                {m.desc}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {m.features.map(f => (
                  <span key={f} style={{
                    padding: '3px 8px', borderRadius: 6,
                    background: 'var(--bg-secondary)', fontSize: 11, color: 'var(--text-muted)',
                  }}>
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* ─── 6  Interactive: Prompt Engineering ─── */}
      <InteractiveDemo title="Prompt Engineering for Images" instruction="See how adding style keywords to a base prompt dramatically changes the generated result.">
        <div>
          <div style={{
            padding: '14px 20px', borderRadius: 12,
            background: 'rgba(255,255,255,0.7)', border: '1.5px solid #93b4f8',
            marginBottom: 20, fontFamily: 'monospace', fontSize: 15,
            color: 'var(--text-primary)',
          }}>
            Base prompt: <strong>"{promptExamples[0].base}"</strong>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
            {promptExamples[0].variations.map((v, i) => (
              <motion.button key={i}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setActivePromptVar(i)}
                style={{
                  padding: '10px 18px', borderRadius: 12,
                  background: activePromptVar === i ? `${v.color}20` : 'rgba(255,255,255,0.5)',
                  border: `1.5px solid ${activePromptVar === i ? v.color : '#d0d5dd'}`,
                  fontSize: 13, fontWeight: 600,
                  color: activePromptVar === i ? v.color : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {v.change}
              </motion.button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activePromptVar}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                padding: 24, borderRadius: 16,
                background: `${promptExamples[0].variations[activePromptVar].color}08`,
                border: `1.5px solid ${promptExamples[0].variations[activePromptVar].color}30`,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: promptExamples[0].variations[activePromptVar].color, textTransform: 'uppercase', marginBottom: 8 }}>
                Described Result
              </div>
              <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
                {promptExamples[0].variations[activePromptVar].result}
              </p>

              {/* Visual representation using color blocks */}
              <div style={{
                display: 'flex', gap: 6, marginTop: 16, flexWrap: 'wrap',
              }}>
                {Array.from({ length: 8 }).map((_, i) => {
                  const vc = promptExamples[0].variations[activePromptVar].color
                  return (
                    <motion.div key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        width: 40, height: 40, borderRadius: 8,
                        background: `linear-gradient(${135 + i * 20}deg, ${vc}${(20 + i * 8).toString(16).padStart(2, '0')}, ${vc}${(50 + i * 5).toString(16).padStart(2, '0')})`,
                      }}
                    />
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </InteractiveDemo>

      {/* ─── 7  ControlNet, img2img, Inpainting ─── */}
      <SectionBlock icon="🎛️" title="Advanced Control Techniques" color={SKY}>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 24 }}>
          Diffusion models are not just text-to-image. These techniques give you fine-grained control over the output.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {controlTechniques.map((tech, idx) => (
            <motion.div key={tech.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.button
                onClick={() => setExpandedTech(expandedTech === idx ? null : idx)}
                whileHover={{ scale: 1.01 }}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  padding: '20px 24px', borderRadius: expandedTech === idx ? '18px 18px 0 0' : 18,
                  background: `${tech.color}08`, border: `1.5px solid ${tech.color}25`,
                  borderBottom: expandedTech === idx ? 'none' : `1.5px solid ${tech.color}25`,
                  display: 'flex', alignItems: 'center', gap: 14,
                }}
              >
                <span style={{ fontSize: 28 }}>{tech.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{tech.name}</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{tech.desc.slice(0, 80)}...</div>
                </div>
                <motion.span
                  animate={{ rotate: expandedTech === idx ? 180 : 0 }}
                  style={{ fontSize: 18, color: 'var(--text-muted)' }}
                >
                  ▼
                </motion.span>
              </motion.button>

              <AnimatePresence>
                {expandedTech === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{
                      overflow: 'hidden',
                      background: `${tech.color}05`,
                      border: `1.5px solid ${tech.color}25`,
                      borderTop: 'none',
                      borderRadius: '0 0 18px 18px',
                    }}
                  >
                    <div style={{ padding: 24 }}>
                      <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 0, marginBottom: 16 }}>
                        {tech.desc}
                      </p>

                      {/* Flow diagram */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
                        {tech.flow.map((step, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{
                              padding: '10px 16px', borderRadius: 12,
                              background: `${tech.color}15`, border: `1px solid ${tech.color}30`,
                              fontSize: 12, fontWeight: 600, color: tech.color,
                              textAlign: 'center', maxWidth: 140,
                            }}>
                              {step}
                            </div>
                            {i < tech.flow.length - 1 && <ArrowRight color={tech.color} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* ─── 8  Real-Life Uses ─── */}
      <SectionBlock icon="🌍" title="Real-Life Applications" color={EMERALD}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
          {realLifeUses.map((use, i) => (
            <motion.div key={use.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              style={{
                padding: 22, borderRadius: 16,
                background: `${use.color}06`, border: `1.5px solid ${use.color}20`,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>{use.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{use.title}</div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{use.desc}</p>
            </motion.div>
          ))}
        </div>
      </SectionBlock>

      {/* ─── 9  NeuronTips ─── */}
      <NeuronTip type="deep">
        <strong>CFG Scale (Classifier-Free Guidance):</strong> Controls how closely the image follows your prompt. Low CFG (1-4) gives creative, loose interpretations. High CFG (10-20) follows the prompt strictly but can look oversaturated. Sweet spot is usually 7-12.
      </NeuronTip>

      <NeuronTip type="tip">
        <strong>Steps & Samplers:</strong> More denoising steps generally means better quality, but with diminishing returns after 30-50. Samplers (Euler, DPM++, DDIM) are different algorithms for the denoising process. DPM++ 2M Karras is a popular all-rounder.
      </NeuronTip>

      <NeuronTip type="example">
        <strong>Negative Prompts:</strong> Tell the model what you DON'T want. For example: <em>"blurry, low quality, extra fingers, deformed"</em>. This steers the denoising away from common artefacts and dramatically improves output quality.
      </NeuronTip>

      <NeuronTip type="fun">
        <strong>The Noise Schedule:</strong> Not all denoising steps are equal! Early steps define the overall composition and layout. Middle steps refine structure and shapes. Late steps add fine details and textures. This is why 20 steps can look almost as good as 50.
      </NeuronTip>

      <NeuronTip type="simple">
        Think of image generation like sculpting from marble. The prompt tells the sculptor what to carve. CFG is how strictly they follow instructions. Steps are how many chisel strokes they take. A negative prompt is a list of mistakes to avoid.
      </NeuronTip>

      {/* ─── Neuron Outro ─── */}
      <div style={{ height: 32 }} />
      <Neuron mood="happy" message="From pure noise to stunning images — diffusion models are one of the most magical achievements in AI. The ability to create visual art from words is changing creative industries forever." />
    </div>
  )
}
