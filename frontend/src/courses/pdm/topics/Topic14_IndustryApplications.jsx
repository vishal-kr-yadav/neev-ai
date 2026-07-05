import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Neuron, { SectionBlock, InteractiveDemo, NeuronTip } from '../../../components/Neuron'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   TOPIC 14 — Industry Applications
   Where PdM works: Manufacturing, Energy, Transport, Healthcare,
   Smart Buildings, and the Universal Pattern
================================================================ */

/* ─── Utility ──────────────────────────────────────────────────── */
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v))
}

/* ================================================================
   SECTION 1 — Manufacturing: The Factory Floor
================================================================ */
const manufacturingEquipment = [
  {
    id: 'cnc',
    label: 'CNC Machine',
    icon: '🔩',
    color: '#6366f1',
    pos: { top: '10%', left: '8%' },
    sensors: ['Spindle vibration (51.2 kHz)', 'Tool current draw', 'Spindle temperature'],
    failureModes: ['Bearing wear', 'Tool wear/breakage', 'Spindle imbalance', 'Chatter'],
    predictionTargets: ['Tool remaining life (cuts)', 'Bearing RUL (days)', 'Surface quality degradation'],
    roi: '₹35–60L/year',
    roiDetail: 'Avoids broken tool scrap events (₹2–5L each) and unplanned spindle overhauls',
    mission: 'Mission: Zero scrap parts from tool wear. Alert tool change 200 cuts in advance.',
  },
  {
    id: 'pump',
    label: 'Industrial Pump',
    icon: '💧',
    color: '#0ea5e9',
    pos: { top: '10%', left: '40%' },
    sensors: ['Drive-end bearing vibration', 'Discharge pressure', 'Flow rate', 'Motor current'],
    failureModes: ['Cavitation', 'Seal failure', 'Impeller wear', 'Bearing degradation'],
    predictionTargets: ['Cavitation onset (hours)', 'Seal failure probability', 'MTBF projection'],
    roi: '₹25–45L/year',
    roiDetail: 'Prevents catastrophic seal failures that flood process floors; eliminates unplanned stops',
    mission: 'Mission: Detect cavitation 48 hours before it damages the impeller.',
  },
  {
    id: 'conveyor',
    label: 'Conveyor System',
    icon: '🏭',
    color: '#10b981',
    pos: { top: '10%', left: '72%' },
    sensors: ['Drive motor current', 'Belt tension (acoustic)', 'Roller bearing temperature', 'Speed encoder'],
    failureModes: ['Belt wear & tears', 'Roller bearing failure', 'Belt misalignment', 'Drive pulley wear'],
    predictionTargets: ['Belt splice failure risk', 'Roller replacement schedule', 'Motor overload warning'],
    roi: '₹20–40L/year',
    roiDetail: 'Belt tear stops entire production line; PdM gives 72-hour advance warning',
    mission: 'Mission: Never let a belt tear stop the line. 3-day advance warning, always.',
  },
  {
    id: 'hydraulic',
    label: 'Hydraulic Press',
    icon: '🔧',
    color: '#f59e0b',
    pos: { top: '58%', left: '18%' },
    sensors: ['System pressure (100 Hz)', 'Oil temperature', 'Hydraulic pump vibration', 'Cylinder position'],
    failureModes: ['Valve leak', 'Cylinder seal failure', 'Pump cavitation', 'Oil degradation'],
    predictionTargets: ['Valve wear score', 'Seal replacement timeline', 'Oil change optimization'],
    roi: '₹30–55L/year',
    roiDetail: 'Prevents high-pressure oil leaks (safety hazard + ₹8L cleanup) and die damage',
    mission: 'Mission: Predict valve leaks before pressure loss affects part quality.',
  },
  {
    id: 'robot',
    label: 'Robotic Arm',
    icon: '🤖',
    color: '#ec4899',
    pos: { top: '58%', left: '60%' },
    sensors: ['Joint torque (all 6 axes)', 'Encoder feedback', 'Servo motor current', 'End-effector force'],
    failureModes: ['Gear wear in joints', 'Encoder drift', 'Servo motor degradation', 'Cable wear'],
    predictionTargets: ['Gearbox RUL per joint', 'Encoder recalibration window', 'Welding quality degradation'],
    roi: '₹50–80L/year',
    roiDetail: 'Robotic arm downtime stops welding/assembly lines worth ₹10–50L per hour',
    mission: 'Mission: Keep robotic arms at 99.2% uptime. Predict joint gear failure 2 weeks out.',
  },
]

function ManufacturingExplorer() {
  const [activeEquip, setActiveEquip] = useState(null)
  const ae = manufacturingEquipment.find(e => e.id === activeEquip)

  return (
    <div>
      {/* Factory floor map */}
      <div style={{
        position: 'relative',
        background: 'var(--bg-secondary)',
        borderRadius: 18,
        padding: 20,
        minHeight: 300,
        marginBottom: 20,
        overflow: 'hidden',
      }}>
        {/* Grid lines */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} preserveAspectRatio="none">
          {Array.from({ length: 10 }, (_, i) => (
            <line key={`h${i}`} x1="0" y1={`${i * 12}%`} x2="100%" y2={`${i * 12}%`} stroke="#ffffff06" strokeWidth="1" />
          ))}
          {Array.from({ length: 14 }, (_, i) => (
            <line key={`v${i}`} x1={`${i * 8}%`} y1="0" x2={`${i * 8}%`} y2="100%" stroke="#ffffff06" strokeWidth="1" />
          ))}
        </svg>

        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 8, letterSpacing: 1 }}>
          FACTORY FLOOR — Click equipment to see PdM details
        </div>

        {manufacturingEquipment.map(eq => (
          <button
            key={eq.id}
            onClick={() => setActiveEquip(activeEquip === eq.id ? null : eq.id)}
            style={{
              position: 'absolute',
              top: eq.pos.top,
              left: eq.pos.left,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              textAlign: 'center',
            }}
          >
            <motion.div
              whileHover={{ scale: 1.14 }}
              style={{
                width: 64,
                height: 64,
                borderRadius: 14,
                background: activeEquip === eq.id ? eq.color : `${eq.color}22`,
                border: `2px solid ${activeEquip === eq.id ? eq.color : `${eq.color}55`}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                boxShadow: activeEquip === eq.id ? `0 4px 24px ${eq.color}55` : 'none',
              }}
            >
              {eq.icon}
            </motion.div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 4, maxWidth: 72, lineHeight: 1.2 }}>
              {eq.label}
            </div>
            {activeEquip === eq.id && (
              <motion.div
                animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                style={{
                  position: 'absolute',
                  top: 0, left: 0,
                  width: 64, height: 64,
                  borderRadius: 14,
                  border: `2px solid ${eq.color}`,
                  pointerEvents: 'none',
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {ae && (
          <motion.div
            key={ae.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            style={{
              background: `${ae.color}0c`,
              border: `1.5px solid ${ae.color}44`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 30 }}>{ae.icon}</span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 20, color: 'var(--text-primary)' }}>{ae.label}</div>
                <div style={{ fontSize: 13, color: ae.color, fontWeight: 600, marginTop: 2 }}>{ae.mission}</div>
              </div>
              <div style={{
                marginLeft: 'auto',
                background: `${ae.color}18`,
                border: `1px solid ${ae.color}44`,
                borderRadius: 12,
                padding: '8px 16px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 10, color: 'var(--text-secondary)', fontWeight: 700 }}>TYPICAL ROI</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: ae.color }}>{ae.roi}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {/* Sensors */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: ae.color, marginBottom: 10 }}>SENSORS USED</div>
                {ae.sensors.map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginBottom: 8 }}
                  >
                    <motion.div
                      animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                      transition={{ repeat: Infinity, duration: 1.6, delay: i * 0.3 }}
                      style={{ width: 7, height: 7, borderRadius: '50%', background: ae.color, marginTop: 4, flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s}</span>
                  </motion.div>
                ))}
              </div>

              {/* Failure Modes */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>FAILURE MODES</div>
                {ae.failureModes.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#ef4444' }}>⚠</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Prediction Targets */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 10 }}>PREDICTION TARGETS</div>
                {ae.predictionTargets.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#10b981' }}>→</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, padding: '8px 10px', background: '#10b98118', borderRadius: 10, fontSize: 11, color: '#10b981', lineHeight: 1.5 }}>
                  {ae.roiDetail}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!ae && (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 14, padding: 20 }}>
          Click any equipment on the factory floor above to see its PdM details
        </div>
      )}
    </div>
  )
}

/* ================================================================
   SECTION 2 — Energy: Power Plants & Wind Farms
================================================================ */
const energyAssets = [
  {
    id: 'wind',
    label: 'Wind Turbine',
    icon: '🌬️',
    color: '#06b6d4',
    dataSources: ['Gearbox vibration (3-axis)', 'Blade pitch angle', 'Generator temperature', 'Tower vibration', 'Wind speed & direction'],
    failureModes: [
      { mode: 'Gearbox failure', cost: '₹1.5–3Cr repair', note: 'Most expensive — requires crane (₹50L per visit)' },
      { mode: 'Blade crack', cost: '₹40–80L per blade', note: 'Detected via acoustic emission + visual ML' },
      { mode: 'Generator bearing', cost: '₹20–40L', note: 'Vibration signature 3–6 weeks before failure' },
    ],
    uniqueChallenge: 'Turbines in remote locations — repair requires crane (₹50L per visit). Each unnecessary crane dispatch wastes ₹50L. PdM ensures crane is dispatched ONLY when needed.',
    approach: 'Vibration signatures + SCADA operational data → XGBoost model predicts failure 30–60 days ahead. Fleet-wide learning: 200 turbines teach each other.',
  },
  {
    id: 'gasturbine',
    label: 'Gas Turbine',
    icon: '🔥',
    color: '#f59e0b',
    dataSources: ['Exhaust temperature (all sections)', 'Compressor efficiency index', 'Vibration (rotor)', 'Fuel flow rate', 'Inlet air conditions'],
    failureModes: [
      { mode: 'Blade erosion', cost: '₹5–15Cr overhaul', note: 'Detected via compressor efficiency degradation curve' },
      { mode: 'Combustor failure', cost: '₹2–6Cr', note: 'Temperature profile distortion is early warning sign' },
      { mode: 'Rotor imbalance', cost: '₹1–3Cr', note: '1x vibration spike 2–4 weeks before critical' },
    ],
    uniqueChallenge: 'Gas turbines run at 3,000–15,000 RPM. Failure can be catastrophic, not just expensive. PdM is as much about safety as economics.',
    approach: 'Physics-informed ML: deviation from manufacturer\'s performance curves triggers investigation. Exhaust temperature spread (all sections vs. baseline) is the key signal.',
  },
  {
    id: 'solar',
    label: 'Solar Panel',
    icon: '☀️',
    color: '#eab308',
    dataSources: ['IV curve sweep (daily)', 'Module temperature', 'Irradiance sensor', 'String current monitoring', 'Inverter efficiency'],
    failureModes: [
      { mode: 'Cell degradation', cost: '₹2–5L per string', note: 'IV curve shape change detects shading, micro-cracks' },
      { mode: 'Hotspot formation', cost: 'Fire risk!', note: 'Thermal imaging + current mismatch detection' },
      { mode: 'Inverter failure', cost: '₹5–15L', note: 'Efficiency drop + harmonic distortion signals' },
    ],
    uniqueChallenge: 'Thousands of panels across hectares of land. Manual inspection is impossible at scale. PdM uses string-level monitoring to identify exactly which panel/string is degrading.',
    approach: 'IV curve shape analysis + per-string current comparison. Anomaly detection flags underperforming strings. 1MW farm: 4,000 panels monitored by 120 sensors.',
  },
  {
    id: 'transformer',
    label: 'Transformer',
    icon: '⚡',
    color: '#8b5cf6',
    dataSources: ['Dissolved Gas Analysis (DGA)', 'Oil temperature', 'Winding temperature', 'Load current', 'Partial discharge monitoring'],
    failureModes: [
      { mode: 'Insulation breakdown', cost: '₹15–50Cr replacement', note: 'DGA detects hydrogen/acetylene buildup weeks before failure' },
      { mode: 'Overheating', cost: '₹5–20Cr', note: 'Winding hot-spot temperature model predicts thermal limit' },
      { mode: 'Moisture ingress', cost: '₹2–8Cr oil treatment', note: 'Oil moisture % tracks insulation paper degradation rate' },
    ],
    uniqueChallenge: 'A 400kV transformer failure can black out an entire city. Repair takes 6–18 months. PdM for transformers is about preventing societal disruption, not just cost.',
    approach: 'Dissolved Gas Analysis is the gold standard. Key gas ratios (Duval Triangle method) diagnose fault type. Combined with thermal models, gives 3–12 month advance warning.',
  },
]

function EnergyExplorer() {
  const [activeAsset, setActiveAsset] = useState('wind')
  const asset = energyAssets.find(a => a.id === activeAsset)

  return (
    <div>
      {/* Asset selector */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {energyAssets.map(a => (
          <motion.button
            key={a.id}
            onClick={() => setActiveAsset(a.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '16px 12px',
              borderRadius: 16,
              border: `2px solid ${activeAsset === a.id ? a.color : 'var(--border)'}`,
              background: activeAsset === a.id ? `${a.color}15` : 'var(--bg-card)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 28, marginBottom: 6 }}>{a.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: activeAsset === a.id ? a.color : 'var(--text-primary)' }}>
              {a.label}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {asset && (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: `${asset.color}0a`,
              border: `1.5px solid ${asset.color}44`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 32 }}>{asset.icon}</span>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{asset.label}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              {/* Data Sources */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: asset.color, marginBottom: 10 }}>DATA SOURCES</div>
                {asset.dataSources.map((d, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7 }}>
                    <span style={{ color: asset.color, fontSize: 12 }}>●</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d}</span>
                  </div>
                ))}
              </div>

              {/* Failure Modes */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>FAILURE MODES & COST</div>
                {asset.failureModes.map((f, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{f.mode}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#ef4444' }}>{f.cost}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{f.note}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Unique Challenge */}
            <div style={{ background: '#ef444410', border: '1px solid #ef444430', borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>UNIQUE CHALLENGE</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{asset.uniqueChallenge}</div>
            </div>

            {/* Approach */}
            <div style={{ background: `${asset.color}10`, border: `1px solid ${asset.color}30`, borderRadius: 12, padding: 14 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: asset.color, marginBottom: 4 }}>PdM APPROACH</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{asset.approach}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   SECTION 3 — Transportation: Wheels, Wings & Rails
================================================================ */
const transportSectors = [
  {
    id: 'railways',
    label: 'Indian Railways',
    icon: '🚂',
    color: '#b45309',
    dataVolume: '1 TB / day per locomotive',
    sensors: ['Axle box temperature', 'Wheel profile laser scan', 'Acoustic emission', 'Bogie vibration'],
    achievements: [
      '200 potential derailments prevented (estimated)',
      '₹2,400 Cr annual savings (Indian Railways estimate)',
      '99.1% bearing failure detection rate',
      'Wheel flat detection: catches 2mm+ flats before ride quality degrades',
    ],
    keyInsight: 'Axle box bearing failure is the #1 cause of derailments. Temperature rise 3°C above baseline = alert. PdM saved more lives than any other transport application in India.',
    dataChallenge: 'Trains pass fixed trackside sensors at 130 km/h — you get only 0.3 seconds of data per axle per sensor point. Edge AI extracts features in real-time.',
  },
  {
    id: 'airlines',
    label: 'Airlines',
    icon: '✈️',
    color: '#0369a1',
    dataVolume: '5 TB / flight (B787 generates 5TB per flight)',
    sensors: ['Engine vibration (N1, N2 shafts)', 'Oil debris analysis (chip detectors)', 'EGT spread across turbine sections', 'ACARS real-time telemetry'],
    achievements: [
      'Boeing 787: 5,000+ parameters monitored per engine',
      'GE LEAP engine: predicts maintenance need 2 weeks ahead',
      'IndiGo/Air India: predictive MRO saves ₹50–100L per aircraft per year',
      'AOG (Aircraft on Ground) events reduced by 40%',
    ],
    keyInsight: 'FADEC (Full Authority Digital Engine Control) logs every parameter at 25 Hz. Airlines share fleet-wide data — your engine in Mumbai learns from a similar engine in London.',
    dataChallenge: 'Aviation is safety-critical: false negatives (missed failures) are catastrophic; false positives (unnecessary grounding) cost ₹1Cr+ per AOG event. Model precision must be >99.9%.',
  },
  {
    id: 'fleet',
    label: 'Fleet Vehicles',
    icon: '🚛',
    color: '#16a34a',
    dataVolume: '10–50 MB / day per vehicle',
    sensors: ['OBD-II diagnostics (200+ parameters)', 'Tire pressure TPMS', 'GPS + telematics', 'Driver behavior scoring', 'Fuel consumption delta'],
    achievements: [
      'Delhivery/Amazon logistics: PdM reduces breakdown en-route by 65%',
      'Savings: ₹2–5L per prevented roadside breakdown',
      'Fuel efficiency monitoring identifies 8–12% fuel waste from mechanical issues',
      'Preventive brake pad changes reduce accident risk by 30%',
    ],
    keyInsight: 'OBD-II is free data — every truck made after 2001 has it. Engine coolant temp + RPM patterns + fuel trim = 85% accurate engine overhaul predictor 3 months ahead.',
    dataChallenge: 'Fleet vehicles operate in varying conditions (Mumbai highway vs. Himalayan mountain roads). Contextual normalization is key — same vibration means different things at different road conditions.',
  },
  {
    id: 'metro',
    label: 'Metro Systems',
    icon: '🚇',
    color: '#7c3aed',
    dataVolume: '500 GB / day (Delhi Metro)',
    sensors: ['Door motor current profiles', 'HVAC compressor vibration', 'Pantograph contact force', 'Wheel wear ultrasonic', 'Traction motor temperature'],
    achievements: [
      'Delhi Metro: 99.4% on-time performance maintained',
      'Door mechanism failures reduced by 72% (most common cause of delays)',
      'HVAC failures (passenger comfort + safety) predicted 5 days ahead',
      'Annual savings: ₹85–120 Cr across all lines',
    ],
    keyInsight: 'Metro doors open/close 400+ times per day per train. Door motor current signature changes subtly 2,000 cycles before failure. PdM catches this trend — humans cannot.',
    dataChallenge: 'Metro systems are safety-critical and politically visible. Any false alarm causing service disruption makes headlines. Alert thresholds are calibrated conservatively.',
  },
]

function TransportExplorer() {
  const [activeSector, setActiveSector] = useState('railways')
  const sector = transportSectors.find(s => s.id === activeSector)

  return (
    <div>
      {/* Data volume comparison banner */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 14,
        padding: '16px 20px',
        marginBottom: 24,
        display: 'flex',
        gap: 20,
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>DATA VOLUMES COMPARED:</div>
        {[
          { icon: '🚂', label: 'Train', volume: '1 TB/day', color: '#b45309' },
          { icon: '✈️', label: 'Aircraft', volume: '5 TB/flight', color: '#0369a1' },
          { icon: '🚛', label: 'Truck', volume: '50 MB/day', color: '#16a34a' },
          { icon: '🚇', label: 'Metro', volume: '500 GB/day', color: '#7c3aed' },
        ].map(d => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 18 }}>{d.icon}</span>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{d.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: d.color }}>{d.volume}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Sector tabs */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {transportSectors.map(s => (
          <motion.button
            key={s.id}
            onClick={() => setActiveSector(s.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '10px 18px',
              borderRadius: 12,
              border: `2px solid ${activeSector === s.id ? s.color : 'var(--border)'}`,
              background: activeSector === s.id ? `${s.color}15` : 'var(--bg-card)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span style={{ fontSize: 18 }}>{s.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: activeSector === s.id ? s.color : 'var(--text-primary)' }}>
              {s.label}
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {sector && (
          <motion.div
            key={sector.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: `${sector.color}0a`,
              border: `1.5px solid ${sector.color}44`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 32 }}>{sector.icon}</span>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{sector.label}</h3>
                <div style={{ fontSize: 12, color: sector.color, fontWeight: 600, marginTop: 2 }}>
                  Data volume: {sector.dataVolume}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                {/* Sensors */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: sector.color, marginBottom: 10 }}>SENSOR SYSTEMS</div>
                  {sector.sensors.map((s, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 7, alignItems: 'flex-start' }}>
                      <span style={{ color: sector.color, fontSize: 10, marginTop: 3 }}>■</span>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s}</span>
                    </div>
                  ))}
                </div>

                {/* Data Challenge */}
                <div style={{ background: '#f59e0b10', border: '1px solid #f59e0b30', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>DATA CHALLENGE</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{sector.dataChallenge}</div>
                </div>
              </div>

              <div>
                {/* Achievements */}
                <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 10 }}>ACHIEVEMENTS</div>
                  {sector.achievements.map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'flex-start' }}
                    >
                      <div style={{
                        width: 20, height: 20, borderRadius: '50%',
                        background: '#10b98120',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, color: '#10b981', fontWeight: 700, flexShrink: 0,
                      }}>✓</div>
                      <span style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>{a}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Key Insight */}
                <div style={{ background: `${sector.color}10`, border: `1px solid ${sector.color}30`, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: sector.color, marginBottom: 4 }}>KEY INSIGHT</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{sector.keyInsight}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   SECTION 4 — Healthcare: Medical Equipment
================================================================ */
const medicalEquipment = [
  {
    id: 'mri',
    label: 'MRI Machine',
    icon: '🧲',
    color: '#0ea5e9',
    sensors: ['Helium level (cryogen)', 'Gradient coil temperature', 'RF power output', 'Chiller performance', 'Quench pipe pressure'],
    criticalEvent: 'Quench — superconducting magnet loses superconductivity, releases all helium instantly',
    criticalCost: '₹2–3 Cr per quench event (helium refill + magnet re-ramping)',
    failureModes: ['Helium boil-off (slow leak)', 'Gradient coil overheating', 'RF amplifier degradation', 'Chiller compressor failure'],
    lifeCritical: 'An MRI quench forces emergency evacuation, interrupts all imaging including emergency neuro scans.',
    pdmImpact: 'Helium level trend + chiller efficiency tracking → predict quench risk 72 hours ahead. Zero unplanned quenches at Apollo (18 months).',
  },
  {
    id: 'ct',
    label: 'CT Scanner',
    icon: '💊',
    color: '#6366f1',
    sensors: ['X-ray tube kV/mA hours', 'Anode wear index', 'Cooling oil temperature', 'Rotation bearing vibration', 'Detector calibration drift'],
    criticalEvent: 'X-ray tube failure — most expensive consumable in CT scanner',
    criticalCost: '₹25–60L per tube replacement (unplanned adds ₹5–10L in emergency service)',
    failureModes: ['Anode wear', 'Tube vacuum loss', 'High-voltage arcing', 'Bearing wear in gantry'],
    lifeCritical: 'CT scanner failure delays cancer staging, trauma diagnosis, stroke confirmation — all time-critical.',
    pdmImpact: 'Tube hours + kVp pattern + anode wear model → predict optimal tube replacement window. Reduces tube cost by 15–25% by maximizing useful life without unexpected failure.',
  },
  {
    id: 'ventilator',
    label: 'Ventilator',
    icon: '🫁',
    color: '#10b981',
    sensors: ['Inspiratory pressure waveform', 'Flow sensor output', 'PEEP valve position', 'Motor current signature', 'Battery charge cycles'],
    criticalEvent: 'Valve failure during ventilation — patient loses respiratory support',
    criticalCost: 'Human life — no monetary equivalent',
    failureModes: ['Inspiratory valve wear', 'Flow sensor drift', 'Compressor motor degradation', 'Battery capacity loss'],
    lifeCritical: 'A ventilator failure during ICU use is immediately life-threatening. Redundancy + PdM is mandatory in ICU settings.',
    pdmImpact: 'Pressure waveform shape analysis detects valve seal degradation before it affects delivered volume. Battery capacity tracking ensures no failure during power cuts.',
  },
  {
    id: 'infusion',
    label: 'Infusion Pump',
    icon: '💉',
    color: '#f59e0b',
    sensors: ['Motor current (dosing accuracy)', 'Occlusion pressure sensor', 'Battery voltage curve', 'Flow rate verification', 'Air-in-line detector'],
    criticalEvent: 'Dosing inaccuracy — wrong drug dose delivered to patient',
    criticalCost: 'Patient safety risk + regulatory shutdown + liability',
    failureModes: ['Peristaltic motor wear (dosing drift)', 'Battery degradation', 'Occlusion sensor drift', 'Air detector false alarm'],
    lifeCritical: 'Chemotherapy and insulin pumps: ±5% dosing error can be fatal. PdM ensures motor calibration is maintained.',
    pdmImpact: 'Motor current vs. flow rate correlation detects dosing drift before it exceeds ±2% threshold. Proactive calibration scheduling based on use hours, not calendar time.',
  },
]

function HealthcareGallery() {
  const [activeDevice, setActiveDevice] = useState('mri')
  const device = medicalEquipment.find(d => d.id === activeDevice)

  return (
    <div>
      {/* Life-critical banner */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #fef2f2, #fff5f5)',
          border: '2px solid #fca5a5',
          borderRadius: 14,
          padding: '14px 20px',
          marginBottom: 24,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 24 }}>🏥</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: '#991b1b' }}>
            Healthcare PdM: It's not just money — it's lives
          </div>
          <div style={{ fontSize: 13, color: '#7f1d1d', marginTop: 2 }}>
            In healthcare, equipment downtime doesn't just cost money — it risks patient lives. PdM is literally life-saving.
          </div>
        </div>
      </motion.div>

      {/* Device tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
        {medicalEquipment.map(d => (
          <motion.button
            key={d.id}
            onClick={() => setActiveDevice(d.id)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            style={{
              padding: '14px 10px',
              borderRadius: 14,
              border: `2px solid ${activeDevice === d.id ? d.color : 'var(--border)'}`,
              background: activeDevice === d.id ? `${d.color}15` : 'var(--bg-card)',
              cursor: 'pointer',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>{d.icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: activeDevice === d.id ? d.color : 'var(--text-primary)', lineHeight: 1.2 }}>
              {d.label}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {device && (
          <motion.div
            key={device.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              background: `${device.color}0a`,
              border: `1.5px solid ${device.color}44`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontSize: 32 }}>{device.icon}</span>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{device.label}</h3>
            </div>

            {/* Critical event highlight */}
            <div style={{
              background: '#ef444415',
              border: '1.5px solid #ef444440',
              borderRadius: 12,
              padding: '12px 16px',
              marginBottom: 20,
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              gap: 16,
              alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 2 }}>CRITICAL FAILURE EVENT</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{device.criticalEvent}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{device.lifeCritical}</div>
              </div>
              <div style={{ textAlign: 'center', minWidth: 100 }}>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>COST</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: '#ef4444' }}>{device.criticalCost}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              {/* Sensors */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: device.color, marginBottom: 10 }}>MONITORED PARAMETERS</div>
                {device.sensors.map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 7, alignItems: 'flex-start' }}>
                    <span style={{ color: device.color, fontSize: 10, marginTop: 3 }}>◆</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s}</span>
                  </div>
                ))}
              </div>

              {/* Failure Modes */}
              <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 10 }}>FAILURE MODES</div>
                {device.failureModes.map((f, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#ef4444' }}>⚠</span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* PdM Impact */}
              <div style={{ background: '#10b98110', borderRadius: 14, padding: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#10b981', marginBottom: 10 }}>PdM IMPACT</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{device.pdmImpact}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ================================================================
   SECTION 5 — Smart Buildings & HVAC
================================================================ */
function SmartBuildingDemo() {
  const [selectedUnit, setSelectedUnit] = useState(null)
  const [filterStrategy, setFilterStrategy] = useState('preventive')
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 800)
    return () => clearInterval(id)
  }, [])

  // 20 HVAC units for a simplified floor (5x4 grid)
  const units = Array.from({ length: 20 }, (_, i) => {
    const seed = (i * 37 + 13) % 100
    const health = seed < 20 ? 'critical' : seed < 45 ? 'warning' : 'healthy'
    const clogPct = seed < 20 ? 85 + (seed % 10) : seed < 45 ? 60 + (seed % 20) : 20 + (seed % 30)
    return {
      id: i + 1,
      health,
      clogPct,
      compressorAmp: health === 'critical' ? 14 + Math.random() * 3 : health === 'warning' ? 11 + Math.random() * 2 : 8 + Math.random(),
      refrigerantPSI: health === 'critical' ? 185 + Math.random() * 20 : health === 'warning' ? 155 + Math.random() * 20 : 120 + Math.random() * 15,
      filterDays: Math.round(seed * 0.9),
    }
  })

  const selectedData = selectedUnit !== null ? units[selectedUnit] : null

  const healthColor = (h) => h === 'critical' ? '#ef4444' : h === 'warning' ? '#f59e0b' : '#10b981'

  const preventiveChanges = units.filter(u => u.filterDays >= 90).length
  const predictiveChanges = units.filter(u => u.clogPct >= 85).length
  const preventiveWaste = preventiveChanges - predictiveChanges
  const savingsPerFilter = 8000

  return (
    <div>
      {/* Building header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>Commercial Building — 50 Floors, 200 HVAC Units</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Showing 1 representative floor (20 units)</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { id: 'preventive', label: 'Preventive (every 3 months)' },
            { id: 'predictive', label: 'Predictive (at 85% clog)' },
          ].map(s => (
            <button
              key={s.id}
              onClick={() => setFilterStrategy(s.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: `1.5px solid ${filterStrategy === s.id ? 'var(--accent)' : 'var(--border)'}`,
                background: filterStrategy === s.id ? 'var(--accent)' : 'var(--bg-secondary)',
                color: filterStrategy === s.id ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Floor plan grid */}
      <div style={{
        background: 'var(--bg-secondary)',
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, marginBottom: 12 }}>
          FLOOR PLAN — Click any unit to see health details
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {units.map((unit, i) => {
            const isSelected = selectedUnit === i
            const color = healthColor(unit.health)
            return (
              <motion.button
                key={i}
                onClick={() => setSelectedUnit(selectedUnit === i ? null : i)}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 6px',
                  borderRadius: 10,
                  border: `2px solid ${isSelected ? color : `${color}44`}`,
                  background: isSelected ? `${color}20` : `${color}10`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span style={{ fontSize: 16 }}>❄️</span>
                <div style={{ fontSize: 10, fontWeight: 700, color }}>U{unit.id}</div>
                <div style={{
                  width: '100%', height: 4, borderRadius: 2,
                  background: 'var(--bg-card)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    width: `${unit.clogPct}%`,
                    background: color,
                    borderRadius: 2,
                  }} />
                </div>
              </motion.button>
            )
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          {[
            { color: '#10b981', label: 'Healthy' },
            { color: '#f59e0b', label: 'Warning' },
            { color: '#ef4444', label: 'Critical' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected unit detail */}
      <AnimatePresence>
        {selectedData && (
          <motion.div
            key={selectedUnit}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 20 }}
          >
            <div style={{
              background: `${healthColor(selectedData.health)}0c`,
              border: `1.5px solid ${healthColor(selectedData.health)}44`,
              borderRadius: 16,
              padding: 20,
            }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)', marginBottom: 14 }}>
                Unit {selectedData.id} — Health Score
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
                {[
                  { label: 'Filter Clog', value: `${selectedData.clogPct}%`, color: healthColor(selectedData.health), bar: true, pct: selectedData.clogPct },
                  { label: 'Compressor', value: `${selectedData.compressorAmp.toFixed(1)} A`, color: selectedData.compressorAmp > 13 ? '#ef4444' : '#10b981', bar: false },
                  { label: 'Refrigerant', value: `${selectedData.refrigerantPSI.toFixed(0)} PSI`, color: selectedData.refrigerantPSI > 175 ? '#ef4444' : '#10b981', bar: false },
                  { label: 'Filter Age', value: `${selectedData.filterDays} days`, color: selectedData.filterDays > 85 ? '#f59e0b' : '#10b981', bar: false },
                ].map(m => (
                  <div key={m.label} style={{ background: 'var(--bg-card)', borderRadius: 12, padding: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{m.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: m.color }}>{m.value}</div>
                    {m.bar && (
                      <div style={{ marginTop: 6, height: 6, background: 'var(--bg-secondary)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${m.pct}%`, background: m.color, borderRadius: 3 }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {selectedData.clogPct >= 85 && (
                <motion.div
                  animate={{ opacity: [1, 0.7, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  style={{ marginTop: 12, background: '#ef444415', border: '1px solid #ef444440', borderRadius: 10, padding: '8px 14px', fontSize: 13, color: '#ef4444', fontWeight: 700 }}
                >
                  ⚠️ Filter replacement recommended — airflow reduced {selectedData.clogPct - 70}% below optimal
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Strategy comparison ROI */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', marginBottom: 14 }}>
          Filter Strategy ROI (this floor, per quarter)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          {[
            { label: 'Preventive changes', value: preventiveChanges, unit: 'filters', color: '#3b82f6', sub: 'Every unit over 90 days' },
            { label: 'Predictive changes', value: predictiveChanges, unit: 'filters', color: '#10b981', sub: 'Only at 85%+ clog' },
            { label: 'Quarterly savings', value: `₹${(preventiveWaste * savingsPerFilter).toLocaleString('en-IN')}`, unit: '', color: '#6366f1', sub: `${preventiveWaste} unnecessary changes avoided` },
          ].map(r => (
            <div key={r.label} style={{ background: `${r.color}10`, border: `1px solid ${r.color}30`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>{r.label}</div>
              <div style={{ fontSize: 24, fontWeight: 900, color: r.color }}>{r.value}</div>
              <div style={{ fontSize: 11, color: r.color }}>{r.unit}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{r.sub}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 12, lineHeight: 1.6 }}>
          Scale to 200 units across 50 floors: annual filter savings alone = ₹{(preventiveWaste * savingsPerFilter * 10 * 4).toLocaleString('en-IN')}+.
          Add compressor life extension and energy savings → total HVAC PdM ROI: ₹1.5–2.5 Cr/year for this building.
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 6 — The Universal PdM Pattern
================================================================ */
const universalPipeline = {
  headers: ['Step', 'Manufacturing', 'Energy', 'Transport', 'Healthcare'],
  rows: [
    {
      step: 'Sensors',
      manufacturing: { value: 'Vibration, Temp, Current', detail: 'Accelerometers on bearings, CT clamps on motors, thermocouples on housings. 25.6 kHz typical sampling for vibration.' },
      energy: { value: 'Wind speed, Temp, Output', detail: 'SCADA sensors on turbines, DGA analyzers on transformers, irradiance sensors on solar farms. 1-second to 1-Hz sampling.' },
      transport: { value: 'Axle temp, OBD, GPS', detail: 'Trackside acoustic sensors, OBD-II dongles in vehicles, embedded sensors in aircraft engines. Data logged continuously.' },
      healthcare: { value: 'Helium level, tube hours', detail: 'Cryogenic level sensors, X-ray tube counters, motor current clamps on ventilators. Safety-grade redundant sensors.' },
    },
    {
      step: 'Features',
      manufacturing: { value: 'MTBF, deviation, kurtosis', detail: 'RMS vibration, spectral kurtosis, crest factor, temperature rate-of-change, current imbalance ratio.' },
      energy: { value: 'Power curve deviation', detail: 'Actual vs. expected power curve at given wind speed. Compressor isentropic efficiency. Dissolved gas ratios (Duval Triangle).' },
      transport: { value: 'Mileage, usage cycles', detail: 'Cumulative mileage since last service, bearing temperature delta, wheel profile wear rate, OBD fault code frequency.' },
      healthcare: { value: 'Hours, cycles, dose', detail: 'X-ray tube kVp-mAs accumulation, helium boil-off rate, ventilator breath cycle count, infusion motor torque trend.' },
    },
    {
      step: 'Model',
      manufacturing: { value: 'XGBoost / RF', detail: 'Gradient boosted trees dominate because they handle tabular features well, are interpretable, and work with small failure datasets.' },
      energy: { value: 'Random Forest / PINN', detail: 'Random Forest for wind turbine gearbox. Physics-Informed Neural Networks for gas turbines (incorporate thermodynamic equations as constraints).' },
      transport: { value: 'LightGBM / LSTM', detail: 'LightGBM for OBD-based fleet models. LSTM for sequential railway bearing data where time-ordering matters critically.' },
      healthcare: { value: 'XGBoost / Threshold', detail: 'XGBoost for complex interactions (MRI). Simple threshold models for safety-critical devices — interpretability and auditability are paramount.' },
    },
    {
      step: 'Output',
      manufacturing: { value: 'Risk tier (Green/Yellow/Red)', detail: 'Equipment health score + days-to-action. Green: normal. Yellow: monitor closely. Red: schedule maintenance within 72 hours.' },
      energy: { value: 'RUL in days', detail: 'Remaining Useful Life in days. For wind turbines: days until gearbox replacement needed. Triggers spare parts procurement.' },
      transport: { value: 'Replace schedule', detail: 'Maintenance schedule pushed to CMMs/SAP. For railways: immediate removal from service if critical threshold crossed.' },
      healthcare: { value: 'Downtime alert', detail: 'Alert to biomedical engineering team. For life-critical devices: redundancy switched in immediately, maintenance scheduled same day.' },
    },
  ],
}

function UniversalPatternTable() {
  const [activeCell, setActiveCell] = useState(null)

  const industryColors = {
    Manufacturing: '#6366f1',
    Energy: '#f59e0b',
    Transport: '#10b981',
    Healthcare: '#0ea5e9',
  }

  const stepColors = {
    Sensors: '#8b5cf6',
    Features: '#06b6d4',
    Model: '#ec4899',
    Output: '#10b981',
  }

  return (
    <div>
      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
          <thead>
            <tr>
              {universalPipeline.headers.map(h => (
                <th key={h} style={{
                  padding: '12px 14px',
                  textAlign: 'left',
                  fontSize: 12,
                  fontWeight: 800,
                  color: h === 'Step' ? 'var(--text-secondary)' : industryColors[h] || 'var(--text-primary)',
                  background: 'var(--bg-secondary)',
                  borderBottom: '2px solid var(--border)',
                  letterSpacing: 0.5,
                }}>
                  {h.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {universalPipeline.rows.map((row, ri) => (
              <tr key={row.step}>
                <td style={{
                  padding: '12px 14px',
                  fontWeight: 800,
                  fontSize: 13,
                  color: stepColors[row.step],
                  background: `${stepColors[row.step]}0a`,
                  borderBottom: '1px solid var(--border)',
                }}>
                  {row.step}
                </td>
                {['manufacturing', 'energy', 'transport', 'healthcare'].map((col, ci) => {
                  const cellKey = `${ri}-${ci}`
                  const isActive = activeCell === cellKey
                  const industryKey = universalPipeline.headers[ci + 1]
                  const color = industryColors[industryKey]
                  return (
                    <td
                      key={col}
                      onClick={() => setActiveCell(isActive ? null : cellKey)}
                      style={{
                        padding: '10px 14px',
                        fontSize: 12,
                        color: isActive ? color : 'var(--text-primary)',
                        background: isActive ? `${color}12` : ri % 2 === 0 ? 'var(--bg-card)' : 'transparent',
                        borderBottom: '1px solid var(--border)',
                        cursor: 'pointer',
                        fontWeight: isActive ? 700 : 400,
                        transition: 'all 0.2s',
                      }}
                    >
                      {row[col].value}
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          style={{
                            marginTop: 6,
                            fontSize: 11,
                            color: 'var(--text-secondary)',
                            fontWeight: 400,
                            lineHeight: 1.5,
                            borderTop: `1px solid ${color}30`,
                            paddingTop: 6,
                          }}
                        >
                          {row[col].detail}
                        </motion.div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #6366f110, #0ea5e910)',
        border: '1.5px solid #6366f130',
        borderRadius: 16,
        padding: 20,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
          The Universal Insight
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
          Every industry follows the <strong style={{ color: 'var(--text-primary)' }}>same 4-step PdM pattern</strong>:
          Sensors → Features → Model → Action.
          The domain changes. The pipeline does not.
          <strong style={{ color: '#6366f1' }}> Master one domain and you can apply PdM to ANY industry.</strong>
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   SECTION 7 — Hindi Summary
================================================================ */

/* ================================================================
   MAIN EXPORT
================================================================ */
export default function Topic14Content() {
  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 4px' }}>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 48, padding: '40px 24px 32px' }}
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ fontSize: 64, marginBottom: 16 }}
        >
          🌐
        </motion.div>
        <h1 style={{ fontSize: 'clamp(26px, 5vw, 40px)', fontWeight: 900, color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.2 }}>
          Industry Applications of PdM
        </h1>
        <p style={{ fontSize: 17, color: 'var(--text-secondary)', maxWidth: 640, margin: '0 auto 20px', lineHeight: 1.7 }}>
          From factory floors to wind farms, from airplanes to hospital MRI machines — PdM is transforming every industry.
          Five domains. One universal pattern. Infinite opportunity.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Manufacturing', 'Energy', 'Transportation', 'Healthcare', 'Smart Buildings', 'Universal Pattern'].map(tag => (
            <span key={tag} style={{
              fontSize: 12, padding: '5px 14px', borderRadius: 20,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: 'var(--text-secondary)', fontWeight: 600,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </motion.div>

      <Neuron
        mood="excited"
        size="large"
        message="Welcome to the industry tour! Each sector here is a Mission you can take on as a PdM engineer. Master the manufacturing floor, then jump to wind farms, then to hospital equipment — the skills transfer perfectly. Let's explore!"
        style={{ marginBottom: 40 }}
      />

      {/* ── Section 1: Manufacturing ── */}
      <SectionBlock icon="🏭" title="Manufacturing — The Factory Floor" color="#6366f1">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          Manufacturing is where PdM was born. Every machine on the factory floor is a candidate for predictive monitoring.
          Click each equipment type to see its sensors, failure modes, prediction targets, and typical ROI.
        </p>

        <Neuron
          mood="explaining"
          message="Think of each piece of equipment as a Mission. CNC machines: prevent scrap. Pumps: prevent floods. Conveyor: prevent line stoppages. Each mission has the same structure: sense → predict → act."
          style={{ marginBottom: 20 }}
        />

        <InteractiveDemo
          title="Factory Floor Explorer"
          instruction="Click any equipment on the factory floor to reveal its PdM profile — sensors, failure modes, prediction targets, and ROI"
        >
          <ManufacturingExplorer />
        </InteractiveDemo>

        <NeuronTip type="example">
          A mid-size Indian auto components plant with 50 machines typically sees ₹2–4 Cr in PdM savings in year one.
          The top three wins: avoiding CNC spindle crashes (₹30–80L each), pump seal failures (₹5–15L each), and robotic arm downtime (₹10–50L per hour of line stop).
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="Manufacturing PdM — Assembly Line की रक्षा"
        english="Manufacturing Predictive Maintenance"
        explanation="Factory floor में हर machine एक mission है। CNC machine: tool wear predict करो — broken tool = scrap parts = ₹2-5L waste। Industrial pump: cavitation detect करो 48 घंटे पहले — seal failure = process floor flood = ₹15L। Conveyor: belt tear predict करो 3 दिन पहले — belt tear = पूरी production line stop = ₹10-50L per hour। Robotic arm: joint gear failure predict करो — arm downtime = welding line stop। सब में एक ही pattern: sensors → features → prediction → action।"
        example="Maruti Suzuki plant में robotic welding arm की gearbox failure पहले से predict हुई। Weekend में planned maintenance हुई — ₹25L की spare part cost। बिना PdM: Monday morning arm fail होता, production line 6 घंटे बंद रहती — ₹3 Cr नुकसान। PdM ने ₹2.75 Cr बचाए।"
        terms={[
          { hindi: 'स्पिंडल', english: 'Spindle', meaning: 'CNC machine का rotating part जो tool hold करता है — इसकी failure सबसे महंगी' },
          { hindi: 'गुहिकायन', english: 'Cavitation', meaning: 'Pump में bubbles बनना जो impeller को damage करता है — 48 hours में detect possible' },
          { hindi: 'MTBF', english: 'Mean Time Between Failures', meaning: 'Average time दो failures के बीच — बड़ा MTBF = reliable machine' },
        ]}
      />

      {/* ── Section 2: Energy ── */}
      <SectionBlock icon="⚡" title="Energy — Power Plants & Wind Farms" color="#f59e0b">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          Energy assets are expensive, remote, and critical to society. PdM in energy is not just about saving money — it's about keeping the lights on.
          Explore each energy asset type to understand the unique challenges and approaches.
        </p>

        <Neuron
          mood="thinking"
          message="Mission: Wind Turbine Engineer. Your turbines are 100km from the nearest city. A gearbox failure requires a crane — ₹50L for the visit alone. Your job: never dispatch that crane unnecessarily, and never miss a real failure."
          style={{ marginBottom: 20 }}
        />

        <InteractiveDemo
          title="Energy Sector Explorer"
          instruction="Select an energy asset type to explore its data sources, failure modes, unique challenges, and PdM approach"
        >
          <EnergyExplorer />
        </InteractiveDemo>

        <NeuronTip type="deep">
          Physics-Informed Neural Networks (PINNs) are emerging as the gold standard for gas turbines. They combine the Brayton cycle thermodynamic equations as model constraints with data-driven learning —
          meaning the model cannot predict physically impossible states, dramatically improving reliability.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="Energy PdM — Wind Turbines से Power Plants तक"
        english="Energy Sector Predictive Maintenance"
        explanation="Energy sector में assets remote और expensive होते हैं। Wind turbine: Rajasthan के desert में अकेला turbine — gearbox fail होने पर crane बुलानी पड़ती है ₹50L खर्च। PdM बताता है 30-60 दिन पहले — एक crane में सब fix हो जाता है। Gas turbine: 3000 RPM पर चलता है, failure = catastrophic explosion। Solar farm: 4000 panels manually inspect करना impossible। Transformer: failure = city blackout 6-18 months। हर case में PdM का mission है: कम से कम unexpected failures।"
        example="Adani Wind farm में 200 turbines हैं। एक turbine की gearbox AUC signature July में बदलने लगी — model ने 45 days advance warning दी। एक crane visit में सभी 3 failing turbines fix हो गए। बिना PdM: तीन अलग-अलग crane visits = ₹1.5 Cr। PdM से: एक visit = ₹50L। Savings: ₹1 Cr।"
        terms={[
          { hindi: 'SCADA', english: 'SCADA System', meaning: 'Supervisory Control and Data Acquisition — industrial monitoring system जो turbines का data collect करता है' },
          { hindi: 'घुलित गैस विश्लेषण', english: 'Dissolved Gas Analysis (DGA)', meaning: 'Transformer oil में dissolved gases measure करना — hydrogen/acetylene = fault early warning' },
          { hindi: 'बिजली वक्र', english: 'Power Curve', meaning: 'Wind speed vs power output relationship — deviation from expected = gearbox efficiency loss' },
        ]}
      />

      {/* ── Section 3: Transportation ── */}
      <SectionBlock icon="🚂" title="Transportation — Wheels, Wings & Rails" color="#10b981">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          Transportation PdM operates at national scale with extraordinary safety requirements.
          Indian Railways alone generates 1 TB of sensor data per locomotive per day. Aircraft generate 5 TB per flight.
        </p>

        <Neuron
          mood="excited"
          message="Mission: Indian Railways bearing engineer. 200 derailments prevented. That's not a statistic — those are real trains, real passengers, real lives. This is why transportation PdM might be the highest-impact application of ML in India."
          style={{ marginBottom: 20 }}
        />

        <InteractiveDemo
          title="Transport Sector Explorer"
          instruction="Select a transport sector to explore sensors, data challenges, and real achievements"
        >
          <TransportExplorer />
        </InteractiveDemo>

        <NeuronTip type="tip">
          The transportation sector has the most mature PdM deployments globally. Airlines have been doing it since the 1990s (ACARS engine health monitoring).
          What's new is the democratization: OBD-II + cloud ML means even a 10-truck logistics company can now do fleet PdM for ₹5,000/month.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="Transport PdM — Trains, Planes और Trucks"
        english="Transportation Predictive Maintenance"
        explanation="Transportation PdM में safety सबसे important है — machine fail नहीं हो सकती जब passengers onboard हों। Indian Railways: axle box bearing की temperature monitoring — 3°C rise = alert — 200 derailments रोके गए। Airlines: Boeing 787 में 5000+ parameters monitor होते हैं per engine, 5TB data per flight। Fleet trucks: OBD-II free data — हर truck का engine health predict होता है। Delhi Metro: door motor current signature 2000 cycles पहले बदलती है failure से — passengers को कभी पता नहीं चलता।"
        example="Indian Railways का bearing failure detection system: trackside sensor train pass होने पर 0.3 seconds में axle temperature scan करता है। Baseline से 3°C ज़्यादा = immediate alert। Train अगले station पर रुकती है, bearing check होती है। Derailment prevent हुआ। यही PdM का highest-impact application है India में।"
        terms={[
          { hindi: 'OBD-II', english: 'OBD-II Port', meaning: 'सभी modern vehicles में built-in diagnostic port — engine health data free में मिलता है' },
          { hindi: 'AOG', english: 'Aircraft on Ground', meaning: 'जब aircraft fly नहीं कर सकता — हर AOG event ₹1 Cr+ नुकसान' },
          { hindi: 'पटरी से उतरना', english: 'Derailment', meaning: 'Train का track से निकलना — bearing failure इसका #1 cause है India में' },
        ]}
      />

      {/* ── Section 4: Healthcare ── */}
      <SectionBlock icon="🏥" title="Healthcare — Medical Equipment" color="#0ea5e9">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          Healthcare PdM is unique: the cost of failure is not just financial — it is human life.
          An MRI machine quench costs ₹2–3 Cr. A ventilator failure during ICU use is immediately life-threatening.
          PdM here is as much about patient safety as hospital economics.
        </p>

        <Neuron
          mood="explaining"
          message="Mission: Biomedical Engineer at a 500-bed hospital. 3 MRI machines. 8 CT scanners. 120 ventilators. 400 infusion pumps. Every one of them is a potential patient safety incident waiting to happen. PdM is your early warning system."
          style={{ marginBottom: 20 }}
        />

        <InteractiveDemo
          title="Medical Equipment Gallery"
          instruction="Explore each medical device to understand the critical failure events PdM prevents"
        >
          <HealthcareGallery />
        </InteractiveDemo>

        <NeuronTip type="warning">
          Healthcare PdM models face strict regulatory requirements (CDSCO in India, FDA in US, CE in Europe). Any ML system that influences patient care must be validated, documented, and auditable.
          Interpretable models (XGBoost with SHAP) are preferred over black-box deep learning for this reason.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="Healthcare PdM — जहाँ Machine failure = Patient risk"
        english="Healthcare Equipment PdM"
        explanation="Hospital में equipment PdM सिर्फ पैसे की नहीं, जान की बात है। MRI machine quench = ₹2.5 Cr + emergency evacuation। CT scanner tube failure = cancer staging delay, stroke confirmation delay। Ventilator failure = ICU patient की immediate life risk। Infusion pump dosing error = wrong drug dose। इसीलिए healthcare PdM में false negatives (missed failures) absolutely unacceptable हैं। Simple, interpretable models preferred हैं — black box deep learning नहीं।"
        example="Apollo Hospital, Chennai में MRI-02 का helium boil-off rate February से slightly बढ़ रहा था। PdM system ने 72 hours advance warning दी। Biomedical engineer ने chiller serviced किया। Quench prevent हुआ — ₹2.5 Cr बचे और 200+ scheduled MRI scans cancel नहीं हुए। यही है zero unplanned quenches का record।"
        terms={[
          { hindi: 'क्वेंच', english: 'Quench', meaning: 'MRI में superconducting magnet का suddenly normal conductor बनना — सारा helium release होता है' },
          { hindi: 'बायोमेडिकल इंजीनियर', english: 'Biomedical Engineer', meaning: 'Hospital equipment maintain करने वाला engineer — PdM का primary user' },
          { hindi: 'नियामक अनुपालन', english: 'Regulatory Compliance', meaning: 'CDSCO/FDA approval — medical ML systems को validate करना legally required है' },
        ]}
      />

      {/* ── Section 5: Smart Buildings ── */}
      <SectionBlock icon="🏢" title="Smart Buildings & HVAC" color="#8b5cf6">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          A modern commercial building is a factory — hundreds of HVAC units, elevators, pumps, and chillers running 24/7.
          PdM for buildings often pays for itself within 6–9 months through energy savings and extended equipment life.
        </p>

        <Neuron
          mood="happy"
          message="Mission: Facilities Manager at a 50-floor office tower. 200 HVAC units. Your goal: zero tenant complaints about temperature, zero unexpected equipment failures, and cut maintenance costs by 30%. Click around the floor plan — every unit is telling you something."
          style={{ marginBottom: 20 }}
        />

        <InteractiveDemo
          title="Smart Building HVAC Monitor"
          instruction="Click any HVAC unit to see its health score. Toggle between Preventive and Predictive filter strategy to see the ROI difference"
        >
          <SmartBuildingDemo />
        </InteractiveDemo>

        <NeuronTip type="fun">
          The energy savings from PdM-optimized HVAC often exceed the maintenance savings. A clogged filter forces the compressor to work 15–30% harder, wasting electricity.
          A building with 200 HVAC units at ₹8/kWh can save ₹40–80L/year in electricity alone by replacing filters at the optimal clog level, not on a fixed schedule.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="Smart Building PdM — Office Tower की देखभाल"
        english="Smart Building and HVAC Predictive Maintenance"
        explanation="एक 50-floor office tower में 200 HVAC units, 40 elevators, fire suppression system, chillers — सब PdM candidates हैं। HVAC filter जो हर 90 days replace होती है preventively — PdM में सिर्फ 85% clog पर replace करो। Result: 30% कम filter changes, 20% कम energy use, zero tenant complaints। Elevator: door motor की current signature failure से 2000 cycles पहले बदलती है — PdM weekend maintenance schedule करता है।"
        example="Mumbai के BKC में एक 50-floor office tower: 200 HVAC units। Preventive strategy: हर unit quarterly filter change = 200 changes per year। PdM strategy: सिर्फ 85%+ clog वाले = ~60 changes per year। Savings: 140 unnecessary filter changes × ₹8000 = ₹11.2L + energy savings ₹40L = ₹51L annually। 6 months में ROI!'"
        terms={[
          { hindi: 'HVAC', english: 'HVAC System', meaning: 'Heating, Ventilation, Air Conditioning — building की cooling और air quality system' },
          { hindi: 'फ़िल्टर बंद होना', english: 'Filter Clog', meaning: 'HVAC filter में dust जमना — 85%+ clog पर compressor ज़्यादा power use करता है' },
          { hindi: 'सुविधाएं प्रबंधक', english: 'Facilities Manager', meaning: 'Building के सारे mechanical/electrical systems manage करने वाला person' },
        ]}
      />

      {/* ── Section 6: Universal Pattern ── */}
      <SectionBlock icon="🔄" title="The Universal PdM Pattern" color="#06b6d4">
        <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.8, marginBottom: 20 }}>
          After exploring 5 industries, a powerful truth emerges: every PdM system follows the same 4-step pipeline.
          The domain changes. The sensors change. But the structure is always identical.
          Click any table cell to see the full details for that industry-step combination.
        </p>

        <Neuron
          mood="excited"
          message="This is the career insight: PdM is a transferable skill. An engineer who masters the pipeline in manufacturing can move to energy, healthcare, or transportation and hit the ground running. The domain knowledge takes months to learn — the ML pipeline you already know."
          style={{ marginBottom: 20 }}
        />

        <InteractiveDemo
          title="Cross-Industry Comparison Table"
          instruction="Click any cell to see the full explanation for that step in that industry"
        >
          <UniversalPatternTable />
        </InteractiveDemo>

        <NeuronTip type="deep">
          The one thing that DOES change significantly across industries is the <strong>failure dataset size</strong>.
          Aviation has decades of failure records. A new wind farm has none. This is why transfer learning and physics-informed models matter more in energy and new industrial deployments.
        </NeuronTip>
      </SectionBlock>

      <HindiExplainer
        concept="Universal PdM Pattern — हर industry में एक ही pipeline"
        english="The Universal PdM Pattern"
        explanation="पाँच industries देखीं — Manufacturing, Energy, Transport, Healthcare, Smart Buildings — और एक powerful truth सामने आई: हर जगह same 4-step pattern है। Step 1: Sensors data collect करते हैं (vibration, temperature, OBD, helium level, current)। Step 2: Features निकालो (deviation, MTBF, rolling mean, lifecycle ratio)। Step 3: ML model train करो (XGBoost, Random Forest, LightGBM)। Step 4: Action लो (risk tier, work order, alert)। Domain बदलता है, pipeline नहीं।"
        example="एक engineer जो SteelForge factory में pump failure predict करना सीखा — वो Wind turbine gearbox, Indian Railways bearing, hospital MRI, और office HVAC सब में same pipeline apply कर सकता है। Domain knowledge (turbine vs pump) कुछ महीनों में सीखी जाती है। ML pipeline तुम पहले से जानते हो — यही career transferability है।"
        terms={[
          { hindi: 'सार्वभौमिक पैटर्न', english: 'Universal Pattern', meaning: 'Sensors → Features → Model → Action — हर industry में same 4-step PdM structure' },
          { hindi: 'स्थानांतरण योग्यता', english: 'Transferability', meaning: 'एक domain में सीखी skills दूसरे में apply करने की ability — PdM engineer की superpower' },
          { hindi: 'भौतिकी-सूचित ML', english: 'Physics-Informed ML', meaning: 'ML model में physics equations को constraints के रूप में include करना — gas turbines के लिए ideal' },
        ]}
      />

      {/* ── Section 7: Hindi Summary ── */}
      <SectionBlock icon="🇮🇳" title="Hindi Summary — हिंदी में समझें" color="#ff9933">
        <Neuron
          mood="explaining"
          message="अब हम यही concept हिंदी में समझते हैं — हर industry में PdM का एक ही universal pattern है। Manufacturing, Energy, Transport, Healthcare — सब में वही sensors → features → model → action pipeline काम करता है।"
          style={{ marginBottom: 20 }}
        />

        <HindiExplainer
          concept="उद्योग अनुप्रयोग"
          english="Industry Applications of Predictive Maintenance"
          explanation="PdM सिर्फ एक industry के लिए नहीं है — यह हर जगह काम करती है। Manufacturing में CNC machines और pumps की failure predict होती है। Energy में wind turbines और gas turbines की। Transportation में Indian Railways के bearings और airplanes के engines की। Healthcare में MRI machines और ventilators की। Smart Buildings में HVAC units की। हर जगह एक ही pattern: sensors data collect करते हैं → features निकाले जाते हैं → ML model predict करता है → maintenance team action लेती है। एक बार यह pipeline सीख लो, तो किसी भी industry में apply कर सकते हो।"
          example="उदाहरण: Indian Railways के bearing PdM system ने estimated 200 derailments रोके। एक derailment prevent करने से पूरा PdM system 10 बार recover हो जाता है। Wind turbine PdM में एक remote turbine का gearbox failure predict किया — unnecessary crane dispatch (₹50L) avoid हुई। Hospital में MRI machine का helium leak early detect हुआ — ₹2.5 Cr का quench event टल गया। यही है PdM का real-world impact।"
          terms={[
            { hindi: 'विनिर्माण', english: 'Manufacturing', meaning: 'Factory में products बनाना — CNC machines, pumps, conveyors, robots की PdM' },
            { hindi: 'ऊर्जा', english: 'Energy', meaning: 'Wind turbines, gas turbines, solar panels, transformers की monitoring' },
            { hindi: 'परिवहन', english: 'Transportation', meaning: 'Trains, airplanes, trucks, metro — safety-critical PdM' },
            { hindi: 'स्वास्थ्य सेवा', english: 'Healthcare', meaning: 'MRI, CT scanner, ventilator, infusion pump — life-critical equipment monitoring' },
            { hindi: 'स्मार्ट भवन', english: 'Smart Building', meaning: 'Commercial buildings में HVAC, elevators, chillers की predictive maintenance' },
            { hindi: 'सार्वभौमिक पाइपलाइन', english: 'Universal Pipeline', meaning: 'Sensors → Features → Model → Action — हर industry में same 4-step pattern' },
          ]}
        />
      </SectionBlock>

      {/* Closing mascot */}
      <Neuron
        mood="waving"
        size="large"
        message="You've just completed the Industry Applications tour! Five industries, one universal pipeline. Whether you end up at a wind farm in Rajasthan, a railway workshop in Lucknow, or a hospital biomedical engineering department in Chennai — you now know the PdM playbook for all of them. The missions await!"
        style={{ marginTop: 8, marginBottom: 40 }}
      />

    </div>
  )
}
