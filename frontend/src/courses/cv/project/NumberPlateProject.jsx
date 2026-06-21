import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HindiExplainer from '../../../components/HindiExplainer'

/* ================================================================
   NUMBER PLATE DETECTION — Indian Vehicle ANPR Pipeline Builder
   ================================================================
   Students build a complete Indian vehicle number plate detection system:
   1. Project briefing & dataset exploration
   2. Interactive bounding box annotation
   3. Data augmentation pipeline
   4. YOLOv8 model configuration
   5. Training simulation with live metrics
   6. Detection & prediction on new images
   7. OCR text extraction pipeline
   8. Deployment architecture & use cases
================================================================ */

// ─── VEHICLE DATASET ───
const VEHICLE_DATASET = [
  { id: 'img_001', plate: 'MH 12 AB 1234', color: '#ffffff', type: 'car', label: 'White Maruti Swift', plateColor: '#ffffff', plateY: 0.72, plateX: 0.35, bodyShape: 'hatchback' },
  { id: 'img_002', plate: 'DL 4C AF 5678', color: '#3b82f6', type: 'car', label: 'Blue Hyundai i20', plateColor: '#ffffff', plateY: 0.74, plateX: 0.34, bodyShape: 'hatchback' },
  { id: 'img_003', plate: 'KA 05 MJ 9012', color: '#1a1a2e', type: 'suv', label: 'Black Toyota Innova', plateColor: '#ffffff', plateY: 0.70, plateX: 0.32, bodyShape: 'suv' },
  { id: 'img_004', plate: 'TN 09 AQ 3456', color: '#eab308', type: 'auto', label: 'Yellow Auto-Rickshaw', plateColor: '#eab308', plateY: 0.68, plateX: 0.30, bodyShape: 'auto' },
  { id: 'img_005', plate: 'UP 32 BX 7890', color: '#dc2626', type: 'car', label: 'Red Honda City', plateColor: '#ffffff', plateY: 0.73, plateX: 0.35, bodyShape: 'sedan' },
  { id: 'img_006', plate: 'GJ 01 XX 2345', color: '#e5e7eb', type: 'truck', label: 'White Truck', plateColor: '#eab308', plateY: 0.65, plateX: 0.28, bodyShape: 'truck' },
  { id: 'img_007', plate: 'RJ 14 CA 6789', color: '#16a34a', type: 'car', label: 'Green Tata Nexon', plateColor: '#ffffff', plateY: 0.72, plateX: 0.34, bodyShape: 'suv_compact' },
  { id: 'img_008', plate: 'HR 26 DK 0123', color: '#c0c0c0', type: 'car', label: 'Silver Maruti Alto', plateColor: '#ffffff', plateY: 0.75, plateX: 0.36, bodyShape: 'hatchback_small' },
]

// Annotation-stage vehicles (different set)
const ANNOTATION_VEHICLES = [
  { id: 'ann_001', plate: 'MP 09 CD 4321', color: '#6366f1', type: 'car', label: 'Indigo Sedan', plateColor: '#ffffff', plateY: 0.73, plateX: 0.35, bodyShape: 'sedan' },
  { id: 'ann_002', plate: 'PB 10 EF 8765', color: '#f97316', type: 'car', label: 'Orange Hatchback', plateColor: '#ffffff', plateY: 0.74, plateX: 0.35, bodyShape: 'hatchback' },
  { id: 'ann_003', plate: 'WB 06 GH 2109', color: '#0ea5e9', type: 'auto', label: 'Blue Auto-Rickshaw', plateColor: '#eab308', plateY: 0.68, plateX: 0.30, bodyShape: 'auto' },
  { id: 'ann_004', plate: 'TN 22 JK 5432', color: '#a855f7', type: 'suv', label: 'Purple SUV', plateColor: '#ffffff', plateY: 0.70, plateX: 0.32, bodyShape: 'suv' },
  { id: 'ann_005', plate: 'AP 31 LM 7654', color: '#84cc16', type: 'car', label: 'Lime Compact', plateColor: '#ffffff', plateY: 0.75, plateX: 0.36, bodyShape: 'hatchback_small' },
]

// Test-stage vehicles (unseen)
const TEST_VEHICLES = [
  { id: 'test_001', plate: 'CH 01 NP 1122', color: '#b91c1c', type: 'car', label: 'Maroon Sedan', plateColor: '#ffffff', plateY: 0.73, plateX: 0.35, bodyShape: 'sedan' },
  { id: 'test_002', plate: 'MH 04 QR 3344', color: '#059669', type: 'suv', label: 'Teal SUV', plateColor: '#ffffff', plateY: 0.70, plateX: 0.32, bodyShape: 'suv' },
  { id: 'test_003', plate: 'DL 8S TU 5566', color: '#d97706', type: 'auto', label: 'Amber Auto', plateColor: '#eab308', plateY: 0.68, plateX: 0.30, bodyShape: 'auto' },
  { id: 'test_004', plate: 'KA 01 VW 7788', color: '#4338ca', type: 'car', label: 'Indigo Hatchback', plateColor: '#ffffff', plateY: 0.74, plateX: 0.35, bodyShape: 'hatchback' },
  { id: 'test_005', plate: 'GJ 05 YZ 9900', color: '#be123c', type: 'truck', label: 'Red Truck', plateColor: '#eab308', plateY: 0.65, plateX: 0.28, bodyShape: 'truck' },
  { id: 'test_006', plate: 'RJ 27 AB 1357', color: '#737373', type: 'car', label: 'Grey Compact', plateColor: '#ffffff', plateY: 0.75, plateX: 0.36, bodyShape: 'hatchback_small' },
]

const STAGES = [
  { id: 'briefing', label: 'Briefing', icon: '📋', desc: 'Project & dataset' },
  { id: 'annotate', label: 'Annotate', icon: '✏️', desc: 'Draw bounding boxes' },
  { id: 'augment', label: 'Augment', icon: '🔄', desc: 'Data augmentation' },
  { id: 'config', label: 'Config', icon: '⚙️', desc: 'Model settings' },
  { id: 'train', label: 'Train', icon: '🏋️', desc: 'Train model' },
  { id: 'detect', label: 'Detect', icon: '🔍', desc: 'Run detection' },
  { id: 'ocr', label: 'OCR', icon: '🔤', desc: 'Extract text' },
  { id: 'deploy', label: 'Deploy', icon: '🚀', desc: 'Use cases' },
]

// ─── VEHICLE CANVAS RENDERER ───
function drawVehicle(ctx, vehicle, w, h, options = {}) {
  const { brightness = 1, rotation = 0, blur = false, night = false, rain = false, fog = false } = options

  ctx.save()
  ctx.clearRect(0, 0, w, h)

  // Background - road scene
  if (night) {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, '#0a0a1a')
    grad.addColorStop(0.5, '#111827')
    grad.addColorStop(1, '#1f2937')
    ctx.fillStyle = grad
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, h)
    grad.addColorStop(0, `rgb(${Math.floor(135 * brightness)},${Math.floor(206 * brightness)},${Math.floor(235 * brightness)})`)
    grad.addColorStop(0.55, `rgb(${Math.floor(186 * brightness)},${Math.floor(220 * brightness)},${Math.floor(241 * brightness)})`)
    grad.addColorStop(0.55, `rgb(${Math.floor(107 * brightness)},${Math.floor(114 * brightness)},${Math.floor(128 * brightness)})`)
    grad.addColorStop(1, `rgb(${Math.floor(75 * brightness)},${Math.floor(85 * brightness)},${Math.floor(99 * brightness)})`)
    ctx.fillStyle = grad
  }
  ctx.fillRect(0, 0, w, h)

  // Road markings
  ctx.strokeStyle = night ? 'rgba(255,255,200,0.3)' : `rgba(255,255,255,${0.4 * brightness})`
  ctx.lineWidth = 2
  ctx.setLineDash([12, 8])
  ctx.beginPath()
  ctx.moveTo(0, h * 0.6)
  ctx.lineTo(w, h * 0.6)
  ctx.stroke()
  ctx.setLineDash([])

  // Apply rotation
  if (rotation !== 0) {
    ctx.translate(w / 2, h / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.translate(-w / 2, -h / 2)
  }

  const color = vehicle.color
  const plateText = vehicle.plate

  // Parse color to RGB
  const parseColor = (c) => {
    if (c.startsWith('#')) {
      const hex = c.slice(1)
      return [parseInt(hex.substr(0, 2), 16), parseInt(hex.substr(2, 2), 16), parseInt(hex.substr(4, 2), 16)]
    }
    return [128, 128, 128]
  }

  const [cr, cg, cb] = parseColor(color)
  const br = brightness
  const mainColor = `rgb(${Math.floor(cr * br)},${Math.floor(cg * br)},${Math.floor(cb * br)})`
  const darkColor = `rgb(${Math.floor(cr * br * 0.7)},${Math.floor(cg * br * 0.7)},${Math.floor(cb * br * 0.7)})`
  const lightColor = `rgb(${Math.min(255, Math.floor(cr * br * 1.2))},${Math.min(255, Math.floor(cg * br * 1.2))},${Math.min(255, Math.floor(cb * br * 1.2))})`

  if (vehicle.bodyShape === 'auto') {
    // Auto-rickshaw body
    const bx = w * 0.2, by = h * 0.3, bw = w * 0.6, bh = h * 0.4

    // Roof canopy
    ctx.fillStyle = mainColor
    ctx.beginPath()
    ctx.moveTo(bx + bw * 0.1, by)
    ctx.quadraticCurveTo(bx + bw * 0.5, by - bh * 0.3, bx + bw * 0.9, by)
    ctx.lineTo(bx + bw, by + bh * 0.6)
    ctx.lineTo(bx, by + bh * 0.6)
    ctx.closePath()
    ctx.fill()

    // Body
    ctx.fillStyle = darkColor
    ctx.fillRect(bx, by + bh * 0.6, bw, bh * 0.4)

    // Windshield
    ctx.fillStyle = night ? 'rgba(100,150,200,0.5)' : `rgba(180,220,250,${0.7 * br})`
    ctx.beginPath()
    ctx.moveTo(bx + bw * 0.15, by + bh * 0.05)
    ctx.lineTo(bx + bw * 0.45, by + bh * 0.05)
    ctx.lineTo(bx + bw * 0.4, by + bh * 0.5)
    ctx.lineTo(bx + bw * 0.1, by + bh * 0.5)
    ctx.closePath()
    ctx.fill()

    // Open side
    ctx.fillStyle = night ? 'rgba(40,40,60,0.6)' : `rgba(60,60,80,${0.3 * br})`
    ctx.fillRect(bx + bw * 0.5, by + bh * 0.1, bw * 0.4, bh * 0.5)

    // Wheels
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(bx + bw * 0.2, by + bh + 4, h * 0.06, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(bx + bw * 0.8, by + bh + 4, h * 0.06, 0, Math.PI * 2)
    ctx.fill()
    // Wheel highlights
    ctx.fillStyle = '#444'
    ctx.beginPath()
    ctx.arc(bx + bw * 0.2, by + bh + 4, h * 0.03, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(bx + bw * 0.8, by + bh + 4, h * 0.03, 0, Math.PI * 2)
    ctx.fill()

    // Headlight
    ctx.fillStyle = night ? '#ffee88' : '#fffde0'
    ctx.fillRect(bx + 2, by + bh * 0.65, bw * 0.06, bh * 0.12)

    // Number plate
    const pw = bw * 0.35, ph = bh * 0.16
    const px = bx + bw * 0.3, py = by + bh * 0.78
    ctx.fillStyle = vehicle.plateColor === '#eab308' ? '#eab308' : '#ffffff'
    ctx.fillRect(px, py, pw, ph)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.strokeRect(px, py, pw, ph)
    ctx.fillStyle = '#000000'
    ctx.font = `bold ${Math.max(8, Math.floor(ph * 0.6))}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(plateText, px + pw / 2, py + ph / 2)
    ctx.textAlign = 'start'

  } else if (vehicle.bodyShape === 'truck') {
    // Truck
    const cabW = w * 0.3, cabH = h * 0.35
    const cabX = w * 0.1, cabY = h * 0.25
    const bedW = w * 0.55, bedH = h * 0.28
    const bedX = cabX + cabW - 2, bedY = cabY + cabH - bedH

    // Cargo bed
    ctx.fillStyle = darkColor
    ctx.fillRect(bedX, bedY, bedW, bedH)
    ctx.strokeStyle = mainColor
    ctx.lineWidth = 2
    for (let i = 1; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(bedX + (bedW * i) / 5, bedY)
      ctx.lineTo(bedX + (bedW * i) / 5, bedY + bedH)
      ctx.stroke()
    }

    // Cab
    ctx.fillStyle = mainColor
    ctx.beginPath()
    ctx.moveTo(cabX, cabY + cabH * 0.3)
    ctx.quadraticCurveTo(cabX + cabW * 0.1, cabY, cabX + cabW * 0.8, cabY)
    ctx.lineTo(cabX + cabW, cabY + cabH * 0.1)
    ctx.lineTo(cabX + cabW, cabY + cabH)
    ctx.lineTo(cabX, cabY + cabH)
    ctx.closePath()
    ctx.fill()

    // Windshield
    ctx.fillStyle = night ? 'rgba(80,120,180,0.5)' : `rgba(170,210,240,${0.75 * br})`
    ctx.fillRect(cabX + cabW * 0.08, cabY + cabH * 0.08, cabW * 0.5, cabH * 0.45)

    // Bumper
    ctx.fillStyle = '#888'
    ctx.fillRect(cabX - 4, cabY + cabH - 4, cabW + 8, 8)

    // Wheels (larger for truck)
    const wheelR = h * 0.07
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(cabX + cabW * 0.4, cabY + cabH + wheelR - 2, wheelR, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(bedX + bedW * 0.5, cabY + cabH + wheelR - 2, wheelR, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(bedX + bedW * 0.75, cabY + cabH + wheelR - 2, wheelR, 0, Math.PI * 2)
    ctx.fill()
    // Hubs
    ctx.fillStyle = '#555'
    for (const cx of [cabX + cabW * 0.4, bedX + bedW * 0.5, bedX + bedW * 0.75]) {
      ctx.beginPath()
      ctx.arc(cx, cabY + cabH + wheelR - 2, wheelR * 0.4, 0, Math.PI * 2)
      ctx.fill()
    }

    // Headlights
    ctx.fillStyle = night ? '#ffee88' : '#ffffcc'
    ctx.fillRect(cabX - 2, cabY + cabH * 0.55, 6, cabH * 0.15)
    ctx.fillRect(cabX - 2, cabY + cabH * 0.75, 6, cabH * 0.15)

    // Number plate
    const pw = cabW * 0.6, ph = cabH * 0.14
    const px = cabX + cabW * 0.15, py = cabY + cabH * 0.82
    ctx.fillStyle = vehicle.plateColor === '#eab308' ? '#eab308' : '#ffffff'
    ctx.fillRect(px, py, pw, ph)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.strokeRect(px, py, pw, ph)
    ctx.fillStyle = '#000000'
    ctx.font = `bold ${Math.max(8, Math.floor(ph * 0.65))}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(plateText, px + pw / 2, py + ph / 2)
    ctx.textAlign = 'start'

  } else {
    // Car variants: sedan, hatchback, suv, suv_compact, hatchback_small
    const isSuv = vehicle.bodyShape === 'suv' || vehicle.bodyShape === 'suv_compact'
    const isSedan = vehicle.bodyShape === 'sedan'
    const isSmall = vehicle.bodyShape === 'hatchback_small'

    const bodyW = isSmall ? w * 0.55 : w * 0.65
    const bodyH = isSuv ? h * 0.28 : h * 0.22
    const bodyX = (w - bodyW) / 2
    const bodyY = h * (isSuv ? 0.38 : 0.42)

    // Car body
    ctx.fillStyle = mainColor
    ctx.beginPath()
    ctx.moveTo(bodyX + 8, bodyY + bodyH)
    ctx.lineTo(bodyX, bodyY + bodyH * 0.3)
    ctx.quadraticCurveTo(bodyX + bodyW * 0.05, bodyY + bodyH * 0.1, bodyX + bodyW * 0.15, bodyY + bodyH * 0.1)
    ctx.lineTo(bodyX + bodyW * (isSedan ? 0.85 : 0.8), bodyY + bodyH * 0.1)
    ctx.quadraticCurveTo(bodyX + bodyW * 0.95, bodyY + bodyH * 0.1, bodyX + bodyW, bodyY + bodyH * 0.3)
    ctx.lineTo(bodyX + bodyW - 4, bodyY + bodyH)
    ctx.closePath()
    ctx.fill()

    // Roof/cabin
    const roofH = bodyH * (isSuv ? 0.85 : 0.7)
    const roofW = bodyW * (isSedan ? 0.55 : isSmall ? 0.5 : 0.52)
    const roofX = bodyX + bodyW * (isSedan ? 0.2 : 0.22)
    const roofY = bodyY - roofH + bodyH * 0.15

    ctx.fillStyle = lightColor
    ctx.beginPath()
    ctx.moveTo(roofX + 4, bodyY + bodyH * 0.12)
    ctx.quadraticCurveTo(roofX + roofW * 0.1, roofY, roofX + roofW * 0.3, roofY)
    ctx.lineTo(roofX + roofW * 0.7, roofY)
    ctx.quadraticCurveTo(roofX + roofW * 0.95, roofY, roofX + roofW, bodyY + bodyH * 0.12)
    ctx.closePath()
    ctx.fill()

    // Windows
    ctx.fillStyle = night ? 'rgba(60,100,160,0.6)' : `rgba(160,210,245,${0.75 * br})`
    // Front window
    ctx.beginPath()
    ctx.moveTo(roofX + 8, bodyY + bodyH * 0.12)
    ctx.quadraticCurveTo(roofX + roofW * 0.15, roofY + 6, roofX + roofW * 0.3, roofY + 6)
    ctx.lineTo(roofX + roofW * 0.42, roofY + 6)
    ctx.lineTo(roofX + roofW * 0.42, bodyY + bodyH * 0.08)
    ctx.closePath()
    ctx.fill()
    // Rear window
    ctx.beginPath()
    ctx.moveTo(roofX + roofW * 0.48, bodyY + bodyH * 0.08)
    ctx.lineTo(roofX + roofW * 0.48, roofY + 6)
    ctx.lineTo(roofX + roofW * 0.7, roofY + 6)
    ctx.quadraticCurveTo(roofX + roofW * 0.92, roofY + 6, roofX + roofW - 6, bodyY + bodyH * 0.12)
    ctx.closePath()
    ctx.fill()

    // Window divider
    ctx.strokeStyle = mainColor
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(roofX + roofW * 0.45, roofY + 6)
    ctx.lineTo(roofX + roofW * 0.45, bodyY + bodyH * 0.1)
    ctx.stroke()

    // Wheels
    const wheelR = isSuv ? h * 0.065 : h * 0.055
    const wheelY = bodyY + bodyH + wheelR * 0.3
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.arc(bodyX + bodyW * 0.2, wheelY, wheelR, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(bodyX + bodyW * 0.8, wheelY, wheelR, 0, Math.PI * 2)
    ctx.fill()
    // Hubcaps
    ctx.fillStyle = '#666'
    ctx.beginPath()
    ctx.arc(bodyX + bodyW * 0.2, wheelY, wheelR * 0.45, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(bodyX + bodyW * 0.8, wheelY, wheelR * 0.45, 0, Math.PI * 2)
    ctx.fill()

    // Headlights
    ctx.fillStyle = night ? '#ffee88' : '#ffffcc'
    ctx.beginPath()
    ctx.ellipse(bodyX + 4, bodyY + bodyH * 0.5, 5, bodyH * 0.12, 0, 0, Math.PI * 2)
    ctx.fill()
    // Tail lights
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.ellipse(bodyX + bodyW - 4, bodyY + bodyH * 0.5, 4, bodyH * 0.1, 0, 0, Math.PI * 2)
    ctx.fill()

    // Door line
    ctx.strokeStyle = darkColor
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(bodyX + bodyW * 0.45, bodyY + bodyH * 0.15)
    ctx.lineTo(bodyX + bodyW * 0.45, bodyY + bodyH * 0.95)
    ctx.stroke()

    // Door handle
    ctx.fillStyle = '#999'
    ctx.fillRect(bodyX + bodyW * 0.48, bodyY + bodyH * 0.5, bodyW * 0.04, 3)

    // Number plate
    const pw = bodyW * 0.25, ph = bodyH * 0.18
    const px = bodyX + bodyW * vehicle.plateX - pw * 0.2, py = bodyY + bodyH * vehicle.plateY
    ctx.fillStyle = vehicle.plateColor === '#eab308' ? '#eab308' : '#ffffff'
    ctx.fillRect(px, py, pw, ph)
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    ctx.strokeRect(px, py, pw, ph)
    ctx.fillStyle = '#000000'
    ctx.font = `bold ${Math.max(7, Math.floor(ph * 0.6))}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(plateText, px + pw / 2, py + ph / 2)
    ctx.textAlign = 'start'
  }

  // Fog overlay
  if (fog) {
    ctx.fillStyle = 'rgba(200,200,210,0.45)'
    ctx.fillRect(0, 0, w, h)
  }

  // Rain overlay
  if (rain) {
    ctx.strokeStyle = 'rgba(180,200,220,0.5)'
    ctx.lineWidth = 1
    for (let i = 0; i < 60; i++) {
      const rx = Math.random() * w
      const ry = Math.random() * h
      ctx.beginPath()
      ctx.moveTo(rx, ry)
      ctx.lineTo(rx - 2, ry + 8 + Math.random() * 6)
      ctx.stroke()
    }
  }

  ctx.restore()
}

// Get plate bounding box in pixel coords for validation
function getPlateBox(vehicle, w, h) {
  if (vehicle.bodyShape === 'auto') {
    const bx = w * 0.2, by = h * 0.3, bw = w * 0.6, bh = h * 0.4
    const pw = bw * 0.35, ph = bh * 0.16
    return { x: bx + bw * 0.3, y: by + bh * 0.78, w: pw, h: ph }
  } else if (vehicle.bodyShape === 'truck') {
    const cabW = w * 0.3, cabH = h * 0.35, cabX = w * 0.1, cabY = h * 0.25
    const pw = cabW * 0.6, ph = cabH * 0.14
    return { x: cabX + cabW * 0.15, y: cabY + cabH * 0.82, w: pw, h: ph }
  } else {
    const isSmall = vehicle.bodyShape === 'hatchback_small'
    const isSuv = vehicle.bodyShape === 'suv' || vehicle.bodyShape === 'suv_compact'
    const bodyW = isSmall ? w * 0.55 : w * 0.65
    const bodyH = isSuv ? h * 0.28 : h * 0.22
    const bodyX = (w - bodyW) / 2
    const bodyY = h * (isSuv ? 0.38 : 0.42)
    const pw = bodyW * 0.25, ph = bodyH * 0.18
    return { x: bodyX + bodyW * vehicle.plateX - pw * 0.2, y: bodyY + bodyH * vehicle.plateY, w: pw, h: ph }
  }
}

// ─── VEHICLE CANVAS COMPONENT ───
function VehicleCanvas({ vehicle, width = 400, height = 280, options = {}, style = {} }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    drawVehicle(ctx, vehicle, width, height, options)
  }, [vehicle, width, height, options])

  return <canvas ref={canvasRef} width={width} height={height} style={{ borderRadius: 10, display: 'block', ...style }} />
}


/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function NumberPlateProject() {
  const [activeStage, setActiveStage] = useState(0)
  const [stageStatus, setStageStatus] = useState({})
  const [annotations, setAnnotations] = useState({})
  const [augmentConfig, setAugmentConfig] = useState(null)
  const [modelConfig, setModelConfig] = useState(null)
  const [trainingResults, setTrainingResults] = useState(null)
  const [detections, setDetections] = useState({})
  const [ocrResults, setOcrResults] = useState({})

  const isComplete = (idx) => stageStatus[STAGES[idx]?.id] === 'success'
  const canAccess = (idx) => idx === 0 || isComplete(idx - 1)

  const completeStage = (stageId) => {
    setStageStatus(s => ({ ...s, [stageId]: 'success' }))
    const idx = STAGES.findIndex(s => s.id === stageId)
    if (idx < STAGES.length - 1) setActiveStage(idx + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Pipeline navigation */}
      <div style={{
        padding: '28px 20px', background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        borderRadius: 20, marginBottom: 32, border: '1px solid #334155', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20,
          fontSize: 13, color: '#94a3b8', fontWeight: 600, letterSpacing: 1,
        }}>
          <span style={{ color: '#f59e0b' }}>&#9670;</span> INDIAN VEHICLE NUMBER PLATE DETECTION PIPELINE
          <span style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b' }}>
            {Object.values(stageStatus).filter(s => s === 'success').length}/{STAGES.length} complete
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
            let borderColor = '#334155', bgColor = '#1e293b', textColor = '#64748b', glow = 'none'
            if (status === 'success') {
              borderColor = '#22c55e'; bgColor = '#052e16'; textColor = '#4ade80'
              glow = '0 0 12px #22c55e30'
            } else if (active) {
              borderColor = '#f59e0b'; bgColor = '#422006'; textColor = '#fbbf24'
              glow = '0 0 16px #f59e0b30'
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
                    padding: '14px 14px', minWidth: 82,
                    background: bgColor, border: `2px solid ${borderColor}`,
                    borderRadius: 14, cursor: accessible ? 'pointer' : 'default',
                    boxShadow: glow, opacity: accessible ? 1 : 0.4,
                    transition: 'all 0.3s',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{stage.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: textColor, whiteSpace: 'nowrap' }}>{stage.label}</span>
                  {status === 'success' && <span style={{ fontSize: 9, color: '#22c55e' }}>Done</span>}
                </motion.button>
                {i < STAGES.length - 1 && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: 20, height: 2, background: status === 'success' ? '#22c55e' : '#334155' }} />
                    <div style={{ width: 0, height: 0, borderTop: '4px solid transparent', borderBottom: '4px solid transparent', borderLeft: `5px solid ${status === 'success' ? '#22c55e' : '#334155'}` }} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Stage content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeStage} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          {activeStage === 0 && <Stage1Briefing onComplete={() => completeStage('briefing')} done={isComplete(0)} />}
          {activeStage === 1 && <Stage2Annotate annotations={annotations} setAnnotations={setAnnotations} onComplete={() => completeStage('annotate')} done={isComplete(1)} />}
          {activeStage === 2 && <Stage3Augment onComplete={(cfg) => { setAugmentConfig(cfg); completeStage('augment') }} done={isComplete(2)} />}
          {activeStage === 3 && <Stage4Config onComplete={(cfg) => { setModelConfig(cfg); completeStage('config') }} done={isComplete(3)} config={modelConfig} />}
          {activeStage === 4 && <Stage5Train modelConfig={modelConfig} annotations={annotations} onComplete={(r) => { setTrainingResults(r); completeStage('train') }} done={isComplete(4)} results={trainingResults} />}
          {activeStage === 5 && <Stage6Detect detections={detections} setDetections={setDetections} onComplete={() => completeStage('detect')} done={isComplete(5)} />}
          {activeStage === 6 && <Stage7OCR detections={detections} ocrResults={ocrResults} setOcrResults={setOcrResults} onComplete={() => completeStage('ocr')} done={isComplete(6)} />}
          {activeStage === 7 && <Stage8Deploy />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}


/* ─── STAGE 1: PROJECT BRIEFING & DATASET ─── */
function Stage1Briefing({ onComplete, done }) {
  const [selectedVehicle, setSelectedVehicle] = useState(null)

  const stats = [
    { label: 'Dataset Images', value: '500+', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Vehicle Types', value: '4', color: '#8b5cf6', bg: '#f5f3ff' },
    { label: 'Indian States', value: '10', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Target Accuracy', value: '95%+', color: '#22c55e', bg: '#f0fdf4' },
  ]

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>📋</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Project Briefing: Indian ANPR System
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Build an Automatic Number Plate Recognition system for Indian Smart City infrastructure
          </p>
        </div>
      </div>

      {/* Scenario description */}
      <div style={{ padding: 20, background: 'linear-gradient(135deg, #fefce8, #fef3c7)', borderRadius: 14, border: '1px solid #fde68a', marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>Mission Brief</div>
        <p style={{ fontSize: 14, color: '#78350f', lineHeight: 1.8, margin: 0 }}>
          The Government of India's Smart Cities Mission requires an ANPR (Automatic Number Plate Recognition) system for deployment across toll plazas, smart parking facilities, and traffic enforcement cameras. Your task is to build a complete detection pipeline that can identify and read Indian vehicle number plates in real-time, handling diverse vehicle types, lighting conditions, and the standardized Indian plate format (XX 00 XX 0000).
        </p>
      </div>

      <HindiExplainer
        concept="ANPR (Automatic Number Plate Recognition)"
        english="Automatic Number Plate Recognition"
        explanation="ANPR ek aisi technology hai jo camera se vehicle ki number plate ko automatically padh leti hai. Jaise toll plaza par aapki gaadi ka number automatically detect hota hai — yahi ANPR hai."
        example="Socho jab aap highway toll se guzarte ho, camera aapki gaadi ki plate ka photo leta hai aur uska number padh leta hai. Isse manually likhne ki zaroorat nahi hoti — sab automatic hota hai!"
        terms={[
          { hindi: 'नंबर प्लेट', english: 'Number Plate', meaning: 'Gaadi ki pehchaan plate jisme registration number hota hai' },
          { hindi: 'पहचान', english: 'Detection', meaning: 'Image mein plate ki jagah dhoondhna' },
          { hindi: 'स्वचालित', english: 'Automatic', meaning: 'Bina insaan ki madad ke kaam karna' },
        ]}
      />

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12, marginBottom: 24, marginTop: 20 }}>
        {stats.map(s => (
          <div key={s.label} style={{ padding: '14px 16px', background: s.bg, borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color, fontFamily: 'var(--font-heading)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Vehicle gallery */}
      <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Sample Dataset</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
        {VEHICLE_DATASET.map((v, i) => (
          <motion.div
            key={v.id}
            onClick={() => setSelectedVehicle(v)}
            whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            style={{
              borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
              border: `2px solid ${selectedVehicle?.id === v.id ? '#f59e0b' : 'var(--border)'}`,
              background: 'var(--bg-secondary)',
            }}
          >
            <VehicleCanvas vehicle={v} width={200} height={140} />
            <div style={{ padding: '8px 10px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>{v.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 4, marginTop: 3, flexWrap: 'wrap' }}>
                <span style={{ padding: '1px 6px', borderRadius: 4, background: '#dbeafe', color: '#1e40af', fontFamily: 'monospace', fontWeight: 600 }}>{v.plate}</span>
                <span style={{ padding: '1px 6px', borderRadius: 4, background: '#fef3c7', color: '#92400e' }}>{v.type}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedVehicle && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: 20, padding: 20, background: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <VehicleCanvas vehicle={selectedVehicle} width={360} height={252} />
              <div style={{ flex: 1, minWidth: 200 }}>
                <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>{selectedVehicle.label}</h4>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 2 }}>
                  <div>Type: <strong>{selectedVehicle.type}</strong></div>
                  <div>Plate Number: <strong style={{ fontFamily: 'monospace' }}>{selectedVehicle.plate}</strong></div>
                  <div>Plate Color: <strong>{selectedVehicle.plateColor === '#eab308' ? 'Yellow (Commercial)' : 'White (Private)'}</strong></div>
                  <div>Body Style: <strong>{selectedVehicle.bodyShape}</strong></div>
                </div>
                <div style={{ marginTop: 10, padding: '8px 14px', background: '#eff6ff', borderRadius: 8, fontSize: 12, color: '#1e40af' }}>
                  Indian plate format: <strong>STATE DISTRICT SERIES NUMBER</strong>
                  <br />Example: MH 12 AB 1234 = Maharashtra, Pune RTO
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!done && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <motion.button onClick={onComplete} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            Dataset Reviewed — Start Annotating
          </motion.button>
        </div>
      )}
    </div>
  )
}


/* ─── STAGE 2: ANNOTATION TOOL ─── */
function Stage2Annotate({ annotations, setAnnotations, onComplete, done }) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [drawing, setDrawing] = useState(false)
  const [startPos, setStartPos] = useState(null)
  const [currentBox, setCurrentBox] = useState(null)
  const [showExample, setShowExample] = useState(true)
  const canvasRef = useRef(null)
  const overlayRef = useRef(null)
  const CW = 400, CH = 280

  const vehicle = ANNOTATION_VEHICLES[currentIdx]
  const sampleAnns = annotations[vehicle?.id] || []
  const trueBox = vehicle ? getPlateBox(vehicle, CW, CH) : null

  // Draw vehicle on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !vehicle) return
    const ctx = canvas.getContext('2d')
    drawVehicle(ctx, vehicle, CW, CH)
  }, [vehicle, currentIdx])

  const getPos = (e) => {
    const rect = overlayRef.current.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  const handleMouseDown = (e) => {
    if (done) return
    const pos = getPos(e)
    setDrawing(true)
    setStartPos(pos)
    setCurrentBox(null)
  }

  const handleMouseMove = (e) => {
    if (!drawing || !startPos) return
    const pos = getPos(e)
    setCurrentBox({
      x: Math.min(startPos.x, pos.x),
      y: Math.min(startPos.y, pos.y),
      w: Math.abs(pos.x - startPos.x),
      h: Math.abs(pos.y - startPos.y),
    })
  }

  const handleMouseUp = () => {
    if (!drawing || !currentBox || currentBox.w < 10 || currentBox.h < 10) {
      setDrawing(false)
      setCurrentBox(null)
      return
    }
    // Validate proximity to actual plate
    const isGood = trueBox && (
      Math.abs(currentBox.x - trueBox.x) < CW * 0.15 &&
      Math.abs(currentBox.y - trueBox.y) < CH * 0.15 &&
      Math.abs(currentBox.w - trueBox.w) < CW * 0.2 &&
      Math.abs(currentBox.h - trueBox.h) < CH * 0.2
    )
    const newAnn = { ...currentBox, quality: isGood ? 'good' : 'poor' }
    setAnnotations(prev => ({ ...prev, [vehicle.id]: [...(prev[vehicle.id] || []), newAnn] }))
    setDrawing(false)
    setCurrentBox(null)
  }

  const removeAnnotation = (idx) => {
    setAnnotations(prev => ({
      ...prev,
      [vehicle.id]: (prev[vehicle.id] || []).filter((_, i) => i !== idx),
    }))
  }

  const annotatedCount = ANNOTATION_VEHICLES.filter(v => (annotations[v.id] || []).length > 0).length

  // YOLO format conversion
  const toYolo = (box) => {
    const xc = ((box.x + box.w / 2) / CW).toFixed(6)
    const yc = ((box.y + box.h / 2) / CH).toFixed(6)
    const bw = (box.w / CW).toFixed(6)
    const bh = (box.h / CH).toFixed(6)
    return `0 ${xc} ${yc} ${bw} ${bh}`
  }

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>✏️</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Annotate Number Plates
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Click and drag to draw a bounding box around each vehicle's number plate
          </p>
        </div>
        <div style={{ marginLeft: 'auto', padding: '6px 16px', borderRadius: 100, background: annotatedCount >= 3 ? '#d1fae5' : '#fef3c7', color: annotatedCount >= 3 ? '#065f46' : '#92400e', fontSize: 13, fontWeight: 700 }}>
          {annotatedCount}/{ANNOTATION_VEHICLES.length} images
        </div>
      </div>

      <HindiExplainer
        concept="Bounding Box Annotation"
        english="Bounding Box Annotation"
        explanation="Annotation ka matlab hai image mein object ke charon taraf ek rectangle box banana. Jaise aap number plate ke charon taraf box draw karte ho — isse model ko sikhaate ho ki plate kahan hoti hai."
        example="Jaise school mein teacher board par important words ko box karke highlight karte hain, waise hi hum number plate ko box karke model ko bataate hain — 'yeh hai number plate, isko dhundho!'"
        terms={[
          { hindi: 'बाउंडिंग बॉक्स', english: 'Bounding Box', meaning: 'Object ke charon taraf ka rectangle' },
          { hindi: 'एनोटेशन', english: 'Annotation', meaning: 'Image mein labels aur boxes lagana' },
          { hindi: 'YOLO फॉर्मैट', english: 'YOLO Format', meaning: 'Class x_center y_center width height — ek standard tarika' },
        ]}
      />

      {/* Good vs Bad annotation example */}
      <AnimatePresence>
        {showExample && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
            style={{ margin: '16px 0', padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Annotation Guide</span>
              <button onClick={() => setShowExample(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 14 }}>Dismiss</button>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 160, padding: 12, background: '#f0fdf4', borderRadius: 10, border: '2px solid #22c55e' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', marginBottom: 6 }}>Good Annotation</div>
                <div style={{ fontSize: 11, color: '#166534', lineHeight: 1.6 }}>
                  - Box tightly fits the plate<br />
                  - No extra space around edges<br />
                  - Includes full plate text
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 160, padding: 12, background: '#fef2f2', borderRadius: 10, border: '2px solid #ef4444' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>Bad Annotation</div>
                <div style={{ fontSize: 11, color: '#991b1b', lineHeight: 1.6 }}>
                  - Box too large or too small<br />
                  - Plate text partially cut off<br />
                  - Box on wrong area of vehicle
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 16 }}>
        {/* Canvas area */}
        <div style={{ position: 'relative' }}>
          <canvas ref={canvasRef} width={CW} height={CH} style={{ borderRadius: 10, display: 'block', border: '2px solid var(--border)' }} />
          <div
            ref={overlayRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { setDrawing(false); setCurrentBox(null) }}
            style={{
              position: 'absolute', top: 0, left: 0, width: CW, height: CH,
              cursor: done ? 'default' : 'crosshair', borderRadius: 10,
            }}
          >
            {/* Current drawing box */}
            {currentBox && (
              <div style={{
                position: 'absolute', left: currentBox.x, top: currentBox.y,
                width: currentBox.w, height: currentBox.h,
                border: '2px dashed #f59e0b', background: 'rgba(245,158,11,0.15)',
                pointerEvents: 'none',
              }} />
            )}
            {/* Existing annotations */}
            {sampleAnns.map((a, i) => (
              <div key={i} style={{
                position: 'absolute', left: a.x, top: a.y, width: a.w, height: a.h,
                border: `2px solid ${a.quality === 'good' ? '#22c55e' : '#ef4444'}`, borderRadius: 2,
                pointerEvents: 'none',
              }}>
                <span style={{
                  position: 'absolute', top: -18, left: 0, fontSize: 9, fontWeight: 700,
                  color: a.quality === 'good' ? '#22c55e' : '#ef4444',
                  background: 'rgba(0,0,0,0.75)', padding: '1px 5px', borderRadius: 3,
                }}>
                  plate {a.quality === 'good' ? '(good)' : '(adjust)'}
                </span>
              </div>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
            <button onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}
              style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: currentIdx === 0 ? 'default' : 'pointer', opacity: currentIdx === 0 ? 0.4 : 1, color: 'var(--text-primary)', fontWeight: 600 }}>
              Prev
            </button>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              {currentIdx + 1} / {ANNOTATION_VEHICLES.length} - {vehicle?.label}
            </span>
            <button onClick={() => setCurrentIdx(Math.min(ANNOTATION_VEHICLES.length - 1, currentIdx + 1))} disabled={currentIdx === ANNOTATION_VEHICLES.length - 1}
              style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', cursor: currentIdx === ANNOTATION_VEHICLES.length - 1 ? 'default' : 'pointer', opacity: currentIdx === ANNOTATION_VEHICLES.length - 1 ? 0.4 : 1, color: 'var(--text-primary)', fontWeight: 600 }}>
              Next
            </button>
          </div>
        </div>

        {/* Annotations panel */}
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
            Annotations for {vehicle?.id}
          </div>

          {sampleAnns.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, background: 'var(--bg-secondary)', borderRadius: 10 }}>
              No annotations yet. Draw a box around the number plate!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {sampleAnns.map((a, i) => (
                <div key={i} style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: `4px solid ${a.quality === 'good' ? '#22c55e' : '#ef4444'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: a.quality === 'good' ? '#22c55e' : '#ef4444' }}>
                      {a.quality === 'good' ? 'Good' : 'Needs adjustment'}
                    </span>
                    {!done && <button onClick={() => removeAnnotation(i)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 700 }}>x</button>}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--bg-primary)', padding: '4px 8px', borderRadius: 4 }}>
                    YOLO: {toYolo(a)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Progress tracker */}
          <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-secondary)', borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8 }}>ANNOTATION PROGRESS</div>
            {ANNOTATION_VEHICLES.map(v => {
              const count = (annotations[v.id] || []).length
              const hasGood = (annotations[v.id] || []).some(a => a.quality === 'good')
              return (
                <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: hasGood ? '#22c55e' : count > 0 ? '#f59e0b' : 'var(--text-muted)' }}>
                    {hasGood ? 'OK' : count > 0 ? '~' : 'o'}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>{v.label}</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{count} box{count !== 1 ? 'es' : ''}</span>
                </div>
              )
            })}
          </div>

          {/* YOLO export preview */}
          {annotatedCount >= 1 && (
            <div style={{ marginTop: 12, padding: 10, background: '#0f172a', borderRadius: 8, maxHeight: 100, overflowY: 'auto' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', marginBottom: 4 }}>YOLO Format Export</div>
              {ANNOTATION_VEHICLES.map(v => (
                (annotations[v.id] || []).map((a, i) => (
                  <div key={`${v.id}-${i}`} style={{ fontSize: 10, fontFamily: 'monospace', color: '#22c55e' }}>
                    {toYolo(a)}
                  </div>
                ))
              ))}
            </div>
          )}
        </div>
      </div>

      {annotatedCount >= 3 && !done && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <motion.button onClick={onComplete} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            {annotatedCount} Images Annotated — Continue to Augmentation
          </motion.button>
        </div>
      )}
    </div>
  )
}


/* ─── STAGE 3: DATA AUGMENTATION ─── */
function Stage3Augment({ onComplete, done }) {
  const [augmentations, setAugmentations] = useState({
    brightness: false, rotation: false, blur: false, night: false, rain: false, fog: false,
  })
  const [previewVehicle] = useState(ANNOTATION_VEHICLES[0])
  const originalRef = useRef(null)
  const augmentedRef = useRef(null)

  const toggleAug = (key) => setAugmentations(prev => ({ ...prev, [key]: !prev[key] }))

  const activeCount = Object.values(augmentations).filter(Boolean).length
  const augmentedTotal = 5 * (1 + activeCount * 2)

  // Draw original
  useEffect(() => {
    if (!originalRef.current) return
    const ctx = originalRef.current.getContext('2d')
    drawVehicle(ctx, previewVehicle, 350, 245)
  }, [previewVehicle])

  // Draw augmented preview
  useEffect(() => {
    if (!augmentedRef.current) return
    const ctx = augmentedRef.current.getContext('2d')
    drawVehicle(ctx, previewVehicle, 350, 245, {
      brightness: augmentations.brightness ? 0.7 + Math.random() * 0.4 : 1,
      rotation: augmentations.rotation ? (Math.random() - 0.5) * 10 : 0,
      blur: augmentations.blur,
      night: augmentations.night,
      rain: augmentations.rain,
      fog: augmentations.fog,
    })
  }, [augmentations, previewVehicle])

  const AUG_OPTIONS = [
    { key: 'brightness', label: 'Brightness/Contrast', icon: 'SUN', desc: 'Random brightness variations (0.6x - 1.4x)' },
    { key: 'rotation', label: 'Rotation (+-5 deg)', icon: 'ROT', desc: 'Slight random rotation to handle camera angles' },
    { key: 'blur', label: 'Motion Blur', icon: 'BLR', desc: 'Simulate camera shake or moving vehicles' },
    { key: 'night', label: 'Night Mode', icon: 'NIT', desc: 'Dark environment simulation with low-light' },
    { key: 'rain', label: 'Rain Overlay', icon: 'RAN', desc: 'Simulate rainy weather conditions' },
    { key: 'fog', label: 'Fog/Haze', icon: 'FOG', desc: 'Simulate foggy visibility conditions' },
  ]

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>🔄</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Data Augmentation Pipeline
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Toggle augmentations to increase training data diversity
          </p>
        </div>
      </div>

      <HindiExplainer
        concept="Data Augmentation"
        english="Data Augmentation"
        explanation="Data augmentation ka matlab hai original images ko thoda modify karke nayi images banana. Jaise ek photo ko halka rotate karo, brightness change karo, ya rain effect daalo — ab ek image se kai images ban gayi!"
        example="Jaise ek passport photo se aap different backgrounds, lighting mein photos bana sakte ho editing se — waise hi ek car ki photo se hum rain, fog, night jaise conditions mein photos banate hain taaki model har haal mein plate dhundh sake."
        terms={[
          { hindi: 'ऑगमेंटेशन', english: 'Augmentation', meaning: 'Data ko badhana aur diverse banana' },
          { hindi: 'विविधता', english: 'Diversity', meaning: 'Alag-alag tarah ke examples' },
          { hindi: 'ओवरफिटिंग', english: 'Overfitting', meaning: 'Model sirf training data pe accha kare, naye data pe bura' },
        ]}
      />

      {/* Before/After comparison */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', margin: '20px 0' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase' }}>Original</div>
          <canvas ref={originalRef} width={350} height={245} style={{ borderRadius: 10, border: '2px solid var(--border)' }} />
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 8, textTransform: 'uppercase' }}>Augmented Preview</div>
          <canvas ref={augmentedRef} width={350} height={245} style={{ borderRadius: 10, border: '2px solid #f59e0b' }} />
        </div>
      </div>

      {/* Augmentation toggles */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, marginBottom: 20 }}>
        {AUG_OPTIONS.map(aug => (
          <motion.button key={aug.key} onClick={() => !done && toggleAug(aug.key)}
            whileHover={!done ? { scale: 1.02 } : {}}
            style={{
              padding: '14px 16px', borderRadius: 12, textAlign: 'left', cursor: done ? 'default' : 'pointer',
              background: augmentations[aug.key] ? '#f0fdf4' : 'var(--bg-secondary)',
              border: `2px solid ${augmentations[aug.key] ? '#22c55e' : 'var(--border)'}`,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: augmentations[aug.key] ? '#22c55e' : 'var(--bg-primary)',
                color: augmentations[aug.key] ? '#fff' : 'var(--text-muted)',
                fontSize: 10, fontWeight: 800,
              }}>
                {aug.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{aug.label}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{aug.desc}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ padding: '10px 20px', background: '#eff6ff', borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#3b82f6' }}>Original</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1e40af' }}>5</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 20, color: 'var(--text-muted)' }}>-&gt;</div>
        <div style={{ padding: '10px 20px', background: '#f0fdf4', borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e' }}>Augmented</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>{augmentedTotal}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-muted)' }}>
          ({activeCount} augmentation{activeCount !== 1 ? 's' : ''} active, {activeCount * 2}x multiplier per augmentation)
        </div>
      </div>

      {activeCount >= 2 && !done && (
        <div style={{ textAlign: 'center' }}>
          <motion.button onClick={() => onComplete(augmentations)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            {augmentedTotal} Images Ready — Configure Model
          </motion.button>
        </div>
      )}
    </div>
  )
}


/* ─── STAGE 4: MODEL CONFIGURATION ─── */
function Stage4Config({ onComplete, done, config }) {
  const [params, setParams] = useState(config || {
    modelSize: 'yolov8s', resolution: 640, batchSize: 16, lr: 0.005, epochs: 100,
  })
  const update = (k, v) => setParams(p => ({ ...p, [k]: v }))

  const MODEL_SIZES = [
    { id: 'yolov8n', label: 'YOLOv8n (Nano)', params: '3.2M', layers: 168, flops: '8.7 GFLOPs', time: '~8 min' },
    { id: 'yolov8s', label: 'YOLOv8s (Small)', params: '11.2M', layers: 225, flops: '28.6 GFLOPs', time: '~18 min' },
    { id: 'yolov8m', label: 'YOLOv8m (Medium)', params: '25.9M', layers: 295, flops: '78.9 GFLOPs', time: '~40 min' },
  ]
  const selectedModel = MODEL_SIZES.find(m => m.id === params.modelSize) || MODEL_SIZES[1]

  // Estimated training time
  const baseTime = { yolov8n: 8, yolov8s: 18, yolov8m: 40 }[params.modelSize] || 18
  const resMulti = { 320: 0.5, 416: 0.75, 640: 1, }[params.resolution] || 1
  const batchMulti = { 8: 1.3, 16: 1, 32: 0.85 }[params.batchSize] || 1
  const epochMulti = params.epochs / 100
  const estTime = Math.round(baseTime * resMulti * batchMulti * epochMulti)

  // YAML preview
  const yamlPreview = `# YOLOv8 Number Plate Detection Config
model: ${params.modelSize}.pt
data: plate_dataset.yaml
imgsz: ${params.resolution}
batch: ${params.batchSize}
epochs: ${params.epochs}
lr0: ${params.lr}
task: detect
classes: 1  # number_plate
optimizer: AdamW
patience: 20
workers: 4`

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>⚙️</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Configure YOLOv8 for Plate Detection
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>Select model size, resolution, and training parameters</p>
        </div>
      </div>

      {/* Model size selector */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Model Size</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {MODEL_SIZES.map(m => (
            <motion.button key={m.id} onClick={() => !done && update('modelSize', m.id)}
              whileHover={!done ? { y: -2 } : {}}
              style={{
                padding: 16, borderRadius: 12, textAlign: 'left', cursor: done ? 'default' : 'pointer',
                background: params.modelSize === m.id ? '#fffbeb' : 'var(--bg-secondary)',
                border: `2px solid ${params.modelSize === m.id ? '#f59e0b' : 'var(--border)'}`,
              }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 6 }}>{m.label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, fontSize: 11 }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Params:</span> <strong>{m.params}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Layers:</span> <strong>{m.layers}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>FLOPs:</span> <strong>{m.flops}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Est. Time:</span> <strong>{m.time}</strong></div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginBottom: 20 }}>
        {/* Input Resolution */}
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Input Resolution</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Higher resolution detects smaller plates but trains slower</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[320, 416, 640].map(v => (
              <button key={v} onClick={() => !done && update('resolution', v)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${params.resolution === v ? '#f59e0b' : 'var(--border)'}`, background: params.resolution === v ? '#fffbeb' : 'var(--bg-card)', cursor: done ? 'default' : 'pointer', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Batch Size */}
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Batch Size</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Larger batches use more GPU memory but stabilize training</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[8, 16, 32].map(v => (
              <button key={v} onClick={() => !done && update('batchSize', v)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${params.batchSize === v ? '#f59e0b' : 'var(--border)'}`, background: params.batchSize === v ? '#fffbeb' : 'var(--bg-card)', cursor: done ? 'default' : 'pointer', fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Learning Rate */}
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Learning Rate</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Controls how fast the model learns</div>
          <input type="range" min={0.001} max={0.01} step={0.001} value={params.lr}
            onChange={e => !done && update('lr', parseFloat(e.target.value))}
            disabled={done} style={{ width: '100%' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginTop: 4 }}>
            <span style={{ color: 'var(--text-muted)' }}>0.001</span>
            <span style={{ fontWeight: 700, color: '#f59e0b' }}>{params.lr.toFixed(3)}</span>
            <span style={{ color: 'var(--text-muted)' }}>0.01</span>
          </div>
        </div>

        {/* Epochs */}
        <div style={{ padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Epochs</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>Number of full training passes</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[50, 100, 150, 200].map(v => (
              <button key={v} onClick={() => !done && update('epochs', v)}
                style={{ flex: 1, padding: '8px', borderRadius: 8, border: `2px solid ${params.epochs === v ? '#f59e0b' : 'var(--border)'}`, background: params.epochs === v ? '#fffbeb' : 'var(--bg-card)', cursor: done ? 'default' : 'pointer', fontWeight: 700, fontSize: 12, color: 'var(--text-primary)' }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Model summary & estimated time */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 200, padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>Model Architecture Summary</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 12 }}>
            <div style={{ color: 'var(--text-muted)' }}>Model:</div><div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedModel.label}</div>
            <div style={{ color: 'var(--text-muted)' }}>Parameters:</div><div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedModel.params}</div>
            <div style={{ color: 'var(--text-muted)' }}>Layers:</div><div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedModel.layers}</div>
            <div style={{ color: 'var(--text-muted)' }}>FLOPs:</div><div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{selectedModel.flops}</div>
            <div style={{ color: 'var(--text-muted)' }}>Est. Train Time:</div><div style={{ fontWeight: 700, color: '#f59e0b' }}>~{estTime} min</div>
          </div>
        </div>

        {/* YAML preview */}
        <div style={{ flex: 1, minWidth: 250, padding: 16, background: '#0f172a', borderRadius: 12, border: '1px solid #334155' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8 }}>CONFIG YAML</div>
          <pre style={{ fontSize: 11, color: '#22c55e', fontFamily: 'monospace', whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6 }}>
            {yamlPreview}
          </pre>
        </div>
      </div>

      {!done && (
        <div style={{ textAlign: 'center' }}>
          <motion.button onClick={() => onComplete(params)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            Configuration Saved — Start Training
          </motion.button>
        </div>
      )}
    </div>
  )
}


/* ─── STAGE 5: TRAINING SIMULATION ─── */
function Stage5Train({ modelConfig, annotations, onComplete, done, results }) {
  const [training, setTraining] = useState(false)
  const [epoch, setEpoch] = useState(0)
  const [metrics, setMetrics] = useState([])
  const [logs, setLogs] = useState([])
  const [finished, setFinished] = useState(!!results)
  const [earlyStopped, setEarlyStopped] = useState(false)
  const lossCanvasRef = useRef(null)
  const mapCanvasRef = useRef(null)
  const logRef = useRef(null)

  const totalEpochs = Math.min((modelConfig?.epochs || 100), 60)

  const simulateTraining = useCallback(() => {
    setTraining(true)
    setMetrics([])
    setLogs([])
    setEpoch(0)
    setFinished(false)
    setEarlyStopped(false)

    const lr = modelConfig?.lr || 0.005
    let i = 0
    let staleCount = 0
    let prevMap = 0

    const interval = setInterval(() => {
      if (i >= totalEpochs) {
        clearInterval(interval)
        setTraining(false)
        setFinished(true)
        return
      }

      const progress = i / totalEpochs
      const noise = () => (Math.random() - 0.5) * 0.03

      const boxLoss = Math.max(0.15, 2.8 * Math.exp(-3.5 * progress) + noise() * 0.15)
      const objLoss = Math.max(0.08, 1.5 * Math.exp(-4 * progress) + noise() * 0.1)
      const clsLoss = Math.max(0.05, 0.8 * Math.exp(-3 * progress) + noise() * 0.08)
      const mAP = Math.min(0.92, 0.92 * (1 - Math.exp(-4.5 * progress)) + noise())
      const precision = Math.min(0.95, 0.95 * (1 - Math.exp(-3.5 * progress)) + noise())
      const recall = Math.min(0.90, 0.90 * (1 - Math.exp(-4 * progress)) + noise())

      // Check for early stopping
      if (i > 20 && Math.abs(mAP - prevMap) < 0.002) {
        staleCount++
      } else {
        staleCount = 0
      }
      prevMap = mAP

      if (staleCount >= 8 && i > 30) {
        clearInterval(interval)
        setTraining(false)
        setFinished(true)
        setEarlyStopped(true)
        setLogs(prev => [...prev, `[Epoch ${i + 1}] Early stopping triggered - mAP plateau detected`])
        return
      }

      const m = { epoch: i + 1, boxLoss, objLoss, clsLoss, mAP, precision, recall }
      setMetrics(prev => [...prev, m])
      setEpoch(i + 1)

      // Log messages
      const logMsg = `[Epoch ${String(i + 1).padStart(3)}/${totalEpochs}] box_loss: ${boxLoss.toFixed(4)} | obj_loss: ${objLoss.toFixed(4)} | cls_loss: ${clsLoss.toFixed(4)} | mAP@50: ${(mAP * 100).toFixed(1)}%`
      setLogs(prev => [...prev, logMsg])

      i++
    }, 100)

    return () => clearInterval(interval)
  }, [modelConfig, totalEpochs])

  // Draw loss curves
  useEffect(() => {
    if (!lossCanvasRef.current || metrics.length < 2) return
    const ctx = lossCanvasRef.current.getContext('2d')
    const w = 480, h = 140
    ctx.clearRect(0, 0, w, h)

    // Background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    // Grid lines
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 0.5
    for (let gy = 0; gy < 5; gy++) {
      ctx.beginPath()
      ctx.moveTo(0, (gy / 4) * h)
      ctx.lineTo(w, (gy / 4) * h)
      ctx.stroke()
    }

    const maxLoss = 3
    const drawLine = (data, color) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      data.forEach((val, idx) => {
        const x = (idx / Math.max(data.length - 1, 1)) * w
        const y = h - (Math.min(val, maxLoss) / maxLoss) * h
        if (idx === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
    }

    drawLine(metrics.map(m => m.boxLoss), '#ef4444')
    drawLine(metrics.map(m => m.objLoss), '#f59e0b')
    drawLine(metrics.map(m => m.clsLoss), '#8b5cf6')

    // Legend
    const legend = [
      { label: 'box_loss', color: '#ef4444' },
      { label: 'obj_loss', color: '#f59e0b' },
      { label: 'cls_loss', color: '#8b5cf6' },
    ]
    legend.forEach((l, i) => {
      ctx.fillStyle = l.color
      ctx.fillRect(w - 120, 8 + i * 14, 10, 10)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px monospace'
      ctx.fillText(l.label, w - 105, 17 + i * 14)
    })
  }, [metrics])

  // Draw mAP curve
  useEffect(() => {
    if (!mapCanvasRef.current || metrics.length < 2) return
    const ctx = mapCanvasRef.current.getContext('2d')
    const w = 480, h = 140
    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    // Grid
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth = 0.5
    for (let gy = 0; gy < 5; gy++) {
      ctx.beginPath()
      ctx.moveTo(0, (gy / 4) * h)
      ctx.lineTo(w, (gy / 4) * h)
      ctx.stroke()
    }

    // mAP line
    ctx.strokeStyle = '#22c55e'
    ctx.lineWidth = 2
    ctx.beginPath()
    metrics.forEach((m, idx) => {
      const x = (idx / Math.max(metrics.length - 1, 1)) * w
      const y = h - m.mAP * h
      if (idx === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Precision line
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    metrics.forEach((m, idx) => {
      const x = (idx / Math.max(metrics.length - 1, 1)) * w
      const y = h - m.precision * h
      if (idx === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Recall line
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    metrics.forEach((m, idx) => {
      const x = (idx / Math.max(metrics.length - 1, 1)) * w
      const y = h - m.recall * h
      if (idx === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Legend
    const legend = [
      { label: 'mAP@50', color: '#22c55e' },
      { label: 'Precision', color: '#3b82f6' },
      { label: 'Recall', color: '#a855f7' },
    ]
    legend.forEach((l, i) => {
      ctx.fillStyle = l.color
      ctx.fillRect(w - 100, 8 + i * 14, 10, 10)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '10px monospace'
      ctx.fillText(l.label, w - 85, 17 + i * 14)
    })
  }, [metrics])

  // Auto-scroll logs
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logs])

  const finalMetrics = results || (metrics.length > 0 ? metrics[metrics.length - 1] : null)

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>🏋️</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Training Dashboard
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {training ? `Training epoch ${epoch}/${totalEpochs}...` : finished ? 'Training complete!' : 'Ready to start training'}
          </p>
        </div>
        {training && (
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: '50%', border: '3px solid #334155', borderTopColor: '#f59e0b' }} />
        )}
      </div>

      {/* Start button */}
      {!training && !finished && !done && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <motion.button onClick={simulateTraining} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '16px 40px', background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 18, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(34,197,94,0.3)' }}>
            Start Training
          </motion.button>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
            Model: {modelConfig?.modelSize} | Resolution: {modelConfig?.resolution} | LR: {modelConfig?.lr} | Epochs: {totalEpochs}
          </p>
        </div>
      )}

      {(training || finished || done) && (
        <>
          {/* Metrics cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Epoch', value: `${epoch}/${totalEpochs}`, color: '#94a3b8' },
              { label: 'Box Loss', value: finalMetrics?.boxLoss?.toFixed(3), color: '#ef4444' },
              { label: 'mAP@50', value: ((finalMetrics?.mAP || 0) * 100).toFixed(1) + '%', color: '#22c55e' },
              { label: 'Precision', value: ((finalMetrics?.precision || 0) * 100).toFixed(1) + '%', color: '#3b82f6' },
              { label: 'Recall', value: ((finalMetrics?.recall || 0) * 100).toFixed(1) + '%', color: '#a855f7' },
            ].map(s => (
              <div key={s.label} style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 10, borderLeft: `4px solid ${s.color}` }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>{s.value || '-'}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {training && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ height: 8, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div animate={{ width: `${(epoch / totalEpochs) * 100}%` }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #22c55e)', borderRadius: 4 }} />
              </div>
            </div>
          )}

          {/* Charts */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>TRAINING LOSS</div>
              <canvas ref={lossCanvasRef} width={480} height={140} style={{ borderRadius: 10, border: '1px solid #334155' }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 6 }}>mAP / PRECISION / RECALL</div>
              <canvas ref={mapCanvasRef} width={480} height={140} style={{ borderRadius: 10, border: '1px solid #334155' }} />
            </div>
          </div>

          {/* Training logs */}
          <div ref={logRef} style={{
            maxHeight: 150, overflowY: 'auto', padding: 14, background: '#0f172a',
            borderRadius: 10, border: '1px solid #334155', fontFamily: 'monospace', fontSize: 10, lineHeight: 1.8, marginBottom: 16,
          }}>
            {logs.map((l, i) => (
              <div key={i} style={{ color: l.includes('Early stopping') ? '#f59e0b' : '#94a3b8' }}>{l}</div>
            ))}
            {training && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} style={{ color: '#22c55e' }}>|</motion.span>}
          </div>

          {/* Early stopping notification */}
          {earlyStopped && (
            <div style={{ padding: 12, background: '#fef3c7', borderRadius: 10, border: '1px solid #fde68a', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
              <strong>Early Stopping:</strong> Training halted at epoch {epoch} — mAP@50 plateaued. Model saved at best checkpoint.
            </div>
          )}

          {/* Final metrics summary */}
          {finished && finalMetrics && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: 20, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', borderRadius: 14, border: '2px solid #22c55e', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#065f46', marginBottom: 10 }}>Training Complete - Final Metrics</div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: '#166534' }}>
                <div>mAP@50: <strong>{(finalMetrics.mAP * 100).toFixed(1)}%</strong></div>
                <div>Precision: <strong>{(finalMetrics.precision * 100).toFixed(1)}%</strong></div>
                <div>Recall: <strong>{(finalMetrics.recall * 100).toFixed(1)}%</strong></div>
                <div>Final Box Loss: <strong>{finalMetrics.boxLoss.toFixed(4)}</strong></div>
                <div>Epochs Trained: <strong>{epoch}</strong></div>
              </div>
            </motion.div>
          )}
        </>
      )}

      {finished && !done && (
        <div style={{ textAlign: 'center' }}>
          <motion.button onClick={() => onComplete(finalMetrics)} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            Accept Results — Run Detection
          </motion.button>
        </div>
      )}
    </div>
  )
}


/* ─── STAGE 6: DETECTION & PREDICTION ─── */
function Stage6Detect({ detections, setDetections, onComplete, done }) {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5)
  const [scanningId, setScanningId] = useState(null)
  const canvasRefs = useRef({})

  // Draw vehicles
  useEffect(() => {
    TEST_VEHICLES.forEach(v => {
      const canvas = canvasRefs.current[v.id]
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      drawVehicle(ctx, v, 380, 266)
    })
  }, [])

  const runDetection = (vehicle) => {
    setScanningId(vehicle.id)

    // Simulate scanning animation
    setTimeout(() => {
      const plateBox = getPlateBox(vehicle, 380, 266)
      const jitter = () => (Math.random() - 0.5) * 6
      const confidence = 0.82 + Math.random() * 0.15
      const inferenceTime = (12 + Math.random() * 8).toFixed(1)

      setDetections(prev => ({
        ...prev,
        [vehicle.id]: {
          bbox: {
            x: plateBox.x + jitter(),
            y: plateBox.y + jitter(),
            w: plateBox.w + jitter() * 0.5,
            h: plateBox.h + jitter() * 0.5,
          },
          confidence,
          inferenceTime,
          plate: vehicle.plate,
        },
      }))
      setScanningId(null)
    }, 1200)
  }

  const detectedCount = Object.keys(detections).length
  const passedCount = Object.values(detections).filter(d => d.confidence >= confidenceThreshold).length

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>🔍</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Detection & Prediction
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Run your trained model on unseen vehicle images
          </p>
        </div>
      </div>

      <HindiExplainer
        concept="Object Detection Inference"
        english="Object Detection Inference"
        explanation="Inference ka matlab hai trained model ko nayi image dena aur usse poochna — 'isme number plate kahan hai?' Model apna seekha hua knowledge use karke plate dhundhta hai aur uske charon taraf box draw karta hai."
        example="Jaise ek experienced traffic police wala ek nazar mein gaadi ka number padh leta hai — waise hi trained model ek image mein turant plate dhundh leta hai aur uska number bata deta hai."
        terms={[
          { hindi: 'इंफरेंस', english: 'Inference', meaning: 'Trained model se prediction lena' },
          { hindi: 'कॉन्फिडेंस', english: 'Confidence', meaning: 'Model ko apne answer par kitna bharosa hai (0-100%)' },
          { hindi: 'थ्रेशोल्ड', english: 'Threshold', meaning: 'Kitne confidence se upar ki detection accept karni hai' },
        ]}
      />

      {/* Confidence threshold slider */}
      <div style={{ margin: '20px 0', padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Confidence Threshold</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: '#f59e0b', fontFamily: 'monospace' }}>{(confidenceThreshold * 100).toFixed(0)}%</span>
          {detectedCount > 0 && (
            <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
              {passedCount}/{detectedCount} detections pass threshold
            </span>
          )}
        </div>
        <input type="range" min={0.1} max={0.95} step={0.05} value={confidenceThreshold}
          onChange={e => setConfidenceThreshold(parseFloat(e.target.value))}
          style={{ width: '100%' }} />
      </div>

      {/* Vehicle grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16 }}>
        {TEST_VEHICLES.map((v, i) => {
          const det = detections[v.id]
          const isScanning = scanningId === v.id
          const passes = det && det.confidence >= confidenceThreshold

          return (
            <motion.div key={v.id}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{
                borderRadius: 14, overflow: 'hidden',
                border: `2px solid ${det ? (passes ? '#22c55e' : '#ef4444') : 'var(--border)'}`,
                background: 'var(--bg-secondary)',
              }}>
              <div style={{ position: 'relative' }}>
                <canvas ref={el => { if (el) canvasRefs.current[v.id] = el }} width={380} height={266}
                  style={{ display: 'block', borderRadius: '12px 12px 0 0' }} />

                {/* Scanning animation */}
                {isScanning && (
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: 266 }}
                    transition={{ duration: 1, ease: 'linear' }}
                    style={{
                      position: 'absolute', left: 0, width: '100%', height: 3,
                      background: 'linear-gradient(90deg, transparent, #22c55e, transparent)',
                      boxShadow: '0 0 12px #22c55e',
                    }}
                  />
                )}

                {/* Detection box overlay */}
                {det && passes && (
                  <svg style={{ position: 'absolute', top: 0, left: 0, width: 380, height: 266, pointerEvents: 'none' }}>
                    <rect
                      x={det.bbox.x} y={det.bbox.y} width={det.bbox.w} height={det.bbox.h}
                      fill="none" stroke="#22c55e" strokeWidth={2.5}
                    />
                    <rect
                      x={det.bbox.x} y={det.bbox.y - 18}
                      width={Math.max(det.plate.length * 8 + 60, 120)} height={18}
                      fill="#22c55e" rx={3}
                    />
                    <text x={det.bbox.x + 4} y={det.bbox.y - 5} fill="white" fontSize={11} fontWeight="bold" fontFamily="monospace">
                      plate {(det.confidence * 100).toFixed(1)}% | {det.plate}
                    </text>
                  </svg>
                )}

                {det && !passes && (
                  <div style={{
                    position: 'absolute', top: 8, right: 8, padding: '4px 10px',
                    background: 'rgba(239,68,68,0.9)', borderRadius: 6, fontSize: 10,
                    fontWeight: 700, color: 'white',
                  }}>
                    Below threshold ({(det.confidence * 100).toFixed(0)}% &lt; {(confidenceThreshold * 100).toFixed(0)}%)
                  </div>
                )}
              </div>

              <div style={{ padding: '10px 14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{v.label}</div>
                    {det && (
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontFamily: 'monospace' }}>
                        Conf: {(det.confidence * 100).toFixed(1)}% | Time: {det.inferenceTime}ms | BBox: [{Math.round(det.bbox.x)}, {Math.round(det.bbox.y)}, {Math.round(det.bbox.w)}, {Math.round(det.bbox.h)}]
                      </div>
                    )}
                  </div>
                  {!det && (
                    <motion.button onClick={() => runDetection(v)} whileHover={{ scale: 1.05 }} disabled={isScanning}
                      style={{ padding: '6px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 11, cursor: isScanning ? 'wait' : 'pointer' }}>
                      {isScanning ? 'Scanning...' : 'Run Detection'}
                    </motion.button>
                  )}
                  {det && (
                    <span style={{
                      padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700, fontFamily: 'monospace',
                      background: passes ? '#d1fae5' : '#fef2f2',
                      color: passes ? '#065f46' : '#991b1b',
                    }}>
                      {det.plate}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {detectedCount >= 4 && !done && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <motion.button onClick={onComplete} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            {detectedCount} Plates Detected — Proceed to OCR
          </motion.button>
        </div>
      )}
    </div>
  )
}


/* ─── STAGE 7: OCR & TEXT EXTRACTION ─── */
function Stage7OCR({ detections, ocrResults, setOcrResults, onComplete, done }) {
  const [processingId, setProcessingId] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)

  const detectedVehicles = TEST_VEHICLES.filter(v => detections[v.id])

  const OCR_STEPS = ['Original Crop', 'Grayscale', 'Threshold/Binarize', 'Character Segmentation', 'Character Recognition']

  const runOCR = (vehicle) => {
    setProcessingId(vehicle.id)
    setCurrentStep(0)

    const plate = vehicle.plate
    const chars = plate.replace(/\s/g, '').split('')

    let step = 0
    const interval = setInterval(() => {
      step++
      setCurrentStep(step)
      if (step >= OCR_STEPS.length) {
        clearInterval(interval)

        // Generate per-character confidence
        const charResults = chars.map(ch => ({
          char: ch,
          confidence: 0.85 + Math.random() * 0.14,
          recognized: Math.random() > 0.05 ? ch : (Math.random() > 0.5 ? 'O' : '0'),
        }))

        const extractedText = charResults.map(c => c.recognized).join('')
        const formattedExtracted = extractedText.slice(0, 2) + ' ' + extractedText.slice(2, 4) + ' ' + extractedText.slice(4, 6) + ' ' + extractedText.slice(6)
        const accuracy = charResults.filter(c => c.char === c.recognized).length / charResults.length

        // Validate Indian format XX 00 XX 0000
        const formatRegex = /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/
        const isValidFormat = formatRegex.test(extractedText.replace(/\s/g, ''))

        setOcrResults(prev => ({
          ...prev,
          [vehicle.id]: {
            chars: charResults,
            extractedText: formattedExtracted,
            groundTruth: plate,
            accuracy,
            isValidFormat,
          },
        }))
        setProcessingId(null)
      }
    }, 600)
  }

  const ocrCount = Object.keys(ocrResults).length

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>🔤</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            OCR: Text Extraction from Plates
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Extract and validate number plate text using the OCR pipeline
          </p>
        </div>
      </div>

      <HindiExplainer
        concept="OCR (Optical Character Recognition)"
        english="Optical Character Recognition"
        explanation="OCR ek technology hai jo image mein likhe hue text ko padhti hai. Pehle plate ki image ko black-and-white banate hain, phir har ek character (letter/number) ko alag karte hain, aur phir unhe pehchaan te hain."
        example="Jaise aap WhatsApp par screenshot se text copy karte ho — wahi kaam OCR karta hai! Number plate ki photo se actual number nikaalna, jaise MH 12 AB 1234 — yahi OCR hai."
        terms={[
          { hindi: 'ग्रेस्केल', english: 'Grayscale', meaning: 'Rangin image ko black-and-white banana' },
          { hindi: 'थ्रेशोल्डिंग', english: 'Thresholding', meaning: 'Image ko sirf black aur white pixels mein convert karna' },
          { hindi: 'सेगमेंटेशन', english: 'Segmentation', meaning: 'Har ek character ko alag-alag karna' },
        ]}
      />

      {/* OCR Pipeline visualization */}
      <div style={{ margin: '20px 0', padding: 16, background: 'var(--bg-secondary)', borderRadius: 12, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>OCR Processing Pipeline</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {OCR_STEPS.map((step, i) => (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                padding: '8px 14px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: processingId && currentStep >= i ? '#d1fae5' : processingId && currentStep === i - 1 ? '#fef3c7' : 'var(--bg-primary)',
                color: processingId && currentStep >= i ? '#065f46' : 'var(--text-muted)',
                border: `1px solid ${processingId && currentStep >= i ? '#22c55e' : 'var(--border)'}`,
              }}>
                {i + 1}. {step}
              </div>
              {i < OCR_STEPS.length - 1 && <span style={{ color: 'var(--text-muted)' }}>-&gt;</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Vehicle OCR cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {detectedVehicles.map((v, i) => {
          const ocr = ocrResults[v.id]
          const isProcessing = processingId === v.id

          return (
            <motion.div key={v.id}
              initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              style={{
                padding: 20, background: 'var(--bg-secondary)', borderRadius: 14,
                border: `1px solid ${ocr ? '#22c55e' : 'var(--border)'}`,
              }}>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{v.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8 }}>Detected plate region from Stage 6</div>

                  {/* Simulated cropped plate */}
                  <div style={{
                    padding: '12px 20px', background: v.plateColor === '#eab308' ? '#eab308' : '#ffffff',
                    borderRadius: 6, border: '2px solid #333', display: 'inline-block',
                  }}>
                    <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'monospace', color: '#000', letterSpacing: 2 }}>
                      {v.plate}
                    </span>
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: 250 }}>
                  {!ocr && !isProcessing && (
                    <motion.button onClick={() => runOCR(v)} whileHover={{ scale: 1.04 }}
                      style={{ padding: '10px 24px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                      Run OCR Pipeline
                    </motion.button>
                  )}

                  {isProcessing && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                        style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #ddd', borderTopColor: '#f59e0b' }} />
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Processing step {currentStep + 1}/{OCR_STEPS.length}: {OCR_STEPS[currentStep] || 'Finalizing...'}</span>
                    </div>
                  )}

                  {ocr && (
                    <div>
                      {/* Character-by-character results */}
                      <div style={{ display: 'flex', gap: 3, marginBottom: 12, flexWrap: 'wrap' }}>
                        {ocr.chars.map((c, ci) => (
                          <div key={ci} style={{
                            width: 32, height: 40, display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center',
                            background: c.char === c.recognized ? '#f0fdf4' : '#fef2f2',
                            border: `2px solid ${c.char === c.recognized ? '#22c55e' : '#ef4444'}`,
                            borderRadius: 6,
                          }}>
                            <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)' }}>{c.recognized}</span>
                            <span style={{ fontSize: 8, color: 'var(--text-muted)' }}>{(c.confidence * 100).toFixed(0)}%</span>
                          </div>
                        ))}
                      </div>

                      {/* Results summary */}
                      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12 }}>
                        <div style={{ padding: '6px 12px', background: 'var(--bg-primary)', borderRadius: 8 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Extracted: </span>
                          <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{ocr.extractedText}</strong>
                        </div>
                        <div style={{ padding: '6px 12px', background: 'var(--bg-primary)', borderRadius: 8 }}>
                          <span style={{ color: 'var(--text-muted)' }}>Ground Truth: </span>
                          <strong style={{ fontFamily: 'monospace', color: 'var(--text-primary)' }}>{ocr.groundTruth}</strong>
                        </div>
                        <div style={{ padding: '6px 12px', borderRadius: 8, background: ocr.accuracy >= 0.9 ? '#d1fae5' : '#fef3c7', color: ocr.accuracy >= 0.9 ? '#065f46' : '#92400e', fontWeight: 700 }}>
                          Accuracy: {(ocr.accuracy * 100).toFixed(0)}%
                        </div>
                        <div style={{ padding: '6px 12px', borderRadius: 8, background: ocr.isValidFormat ? '#d1fae5' : '#fef2f2', color: ocr.isValidFormat ? '#065f46' : '#991b1b', fontWeight: 700 }}>
                          Format: {ocr.isValidFormat ? 'Valid' : 'Invalid'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {ocrCount >= 3 && !done && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <motion.button onClick={onComplete} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #f59e0b, #f97316)', color: 'white', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: 16, cursor: 'pointer', fontFamily: 'var(--font-heading)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
            {ocrCount} Plates Extracted — View Deployment
          </motion.button>
        </div>
      )}
    </div>
  )
}


/* ─── STAGE 8: DEPLOYMENT & USE CASES ─── */
function Stage8Deploy() {
  const [selectedQuantization, setSelectedQuantization] = useState('FP16')
  const archCanvasRef = useRef(null)

  const QUANTIZATION = {
    FP32: { size: '52 MB', speed: '30 ms', accuracy: '95.2%', color: '#3b82f6' },
    FP16: { size: '26 MB', speed: '18 ms', accuracy: '95.0%', color: '#f59e0b' },
    INT8: { size: '13 MB', speed: '9 ms', accuracy: '93.8%', color: '#22c55e' },
  }

  const EDGE_DEVICES = [
    { name: 'NVIDIA Jetson Nano', power: '10W', fps: '25 FPS', price: 'Rs 15,000', suitable: 'INT8/FP16' },
    { name: 'Raspberry Pi 4', power: '5W', fps: '5 FPS', price: 'Rs 5,000', suitable: 'INT8 only' },
    { name: 'Intel NCS2', power: '1.5W', fps: '12 FPS', price: 'Rs 8,000', suitable: 'FP16' },
  ]

  const USE_CASES = [
    {
      title: 'Toll Plaza (FASTag Backup)',
      icon: 'TOLL',
      desc: 'Automatic toll collection when FASTag fails or is missing',
      savings: 'Reduces manual toll processing by 85%, saving Rs 2.5 Cr/year per plaza',
      color: '#3b82f6',
    },
    {
      title: 'Smart Parking System',
      icon: 'PARK',
      desc: 'Automatic entry/exit tracking with duration-based billing',
      savings: 'Eliminates ticket printing, reduces exit time from 30s to 3s',
      color: '#8b5cf6',
    },
    {
      title: 'Traffic Enforcement',
      icon: 'CAM',
      desc: 'Speed cameras capture plate + speed for automated challans',
      savings: 'Processes 10,000+ violations/day vs 200 manual challans/day',
      color: '#ef4444',
    },
    {
      title: 'Stolen Vehicle Alert',
      icon: 'ALRT',
      desc: 'Real-time matching against stolen vehicle database',
      savings: 'Average alert time: 0.5s vs hours with manual checking',
      color: '#f59e0b',
    },
  ]

  // Draw architecture diagram
  useEffect(() => {
    const canvas = archCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = 700, h = 200
    ctx.clearRect(0, 0, w, h)

    // Background
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    const boxes = [
      { x: 20, y: 70, w: 80, h: 60, label: 'Camera', sub: 'IP/CCTV', color: '#3b82f6' },
      { x: 130, y: 70, w: 90, h: 60, label: 'Edge Device', sub: 'Jetson/RPi', color: '#8b5cf6' },
      { x: 250, y: 70, w: 100, h: 60, label: 'YOLO Model', sub: 'Plate Detection', color: '#f59e0b' },
      { x: 380, y: 70, w: 80, h: 60, label: 'OCR Engine', sub: 'Text Extract', color: '#22c55e' },
      { x: 490, y: 70, w: 80, h: 60, label: 'Database', sub: 'PostgreSQL', color: '#ef4444' },
      { x: 600, y: 70, w: 80, h: 60, label: 'Dashboard', sub: 'Web UI', color: '#06b6d4' },
    ]

    // Draw connections
    ctx.strokeStyle = '#475569'
    ctx.lineWidth = 2
    for (let i = 0; i < boxes.length - 1; i++) {
      const from = boxes[i]
      const to = boxes[i + 1]
      ctx.beginPath()
      ctx.moveTo(from.x + from.w, from.y + from.h / 2)
      ctx.lineTo(to.x, to.y + to.h / 2)
      ctx.stroke()
      // Arrow
      ctx.fillStyle = '#475569'
      ctx.beginPath()
      ctx.moveTo(to.x, to.y + to.h / 2)
      ctx.lineTo(to.x - 8, to.y + to.h / 2 - 4)
      ctx.lineTo(to.x - 8, to.y + to.h / 2 + 4)
      ctx.closePath()
      ctx.fill()
    }

    // Draw boxes
    boxes.forEach(box => {
      // Box shadow
      ctx.fillStyle = box.color + '20'
      ctx.fillRect(box.x + 2, box.y + 2, box.w, box.h)

      ctx.fillStyle = '#1e293b'
      ctx.strokeStyle = box.color
      ctx.lineWidth = 2
      ctx.fillRect(box.x, box.y, box.w, box.h)
      ctx.strokeRect(box.x, box.y, box.w, box.h)

      ctx.fillStyle = box.color
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(box.label, box.x + box.w / 2, box.y + box.h / 2 - 4)
      ctx.fillStyle = '#94a3b8'
      ctx.font = '9px sans-serif'
      ctx.fillText(box.sub, box.x + box.w / 2, box.y + box.h / 2 + 12)
      ctx.textAlign = 'start'
    })

    // Title
    ctx.fillStyle = '#94a3b8'
    ctx.font = 'bold 12px sans-serif'
    ctx.fillText('ANPR System Architecture', 20, 30)

    // Data flow label
    ctx.fillStyle = '#64748b'
    ctx.font = '10px sans-serif'
    ctx.fillText('Image Capture -> Detection -> Recognition -> Storage -> Visualization', 20, h - 20)
  }, [])

  return (
    <div style={{ padding: 32, background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <span style={{ fontSize: 28 }}>🚀</span>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            Deployment & Real-World Use Cases
          </h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            How to deploy your ANPR system in production
          </p>
        </div>
      </div>

      {/* Architecture diagram */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>System Architecture</div>
        <canvas ref={archCanvasRef} width={700} height={200}
          style={{ borderRadius: 12, border: '1px solid #334155', width: '100%', maxWidth: 700 }} />
      </div>

      {/* Use case cards */}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Use Cases</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: 24 }}>
        {USE_CASES.map(uc => (
          <motion.div key={uc.title} whileHover={{ y: -4 }}
            style={{
              padding: 18, borderRadius: 14, background: 'var(--bg-secondary)',
              border: `1px solid var(--border)`, borderLeft: `4px solid ${uc.color}`,
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: uc.color + '20', color: uc.color, fontSize: 10, fontWeight: 800,
              }}>
                {uc.icon}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{uc.title}</div>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 8 }}>{uc.desc}</p>
            <div style={{ padding: '6px 10px', background: '#f0fdf4', borderRadius: 6, fontSize: 11, color: '#166534', fontWeight: 600 }}>
              {uc.savings}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance optimization */}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Performance Optimization</div>

      {/* Quantization toggle */}
      <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Model Quantization</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {Object.keys(QUANTIZATION).map(q => (
            <motion.button key={q} onClick={() => setSelectedQuantization(q)}
              whileHover={{ scale: 1.03 }}
              style={{
                flex: 1, padding: '12px', borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                background: selectedQuantization === q ? QUANTIZATION[q].color + '15' : 'var(--bg-primary)',
                border: `2px solid ${selectedQuantization === q ? QUANTIZATION[q].color : 'var(--border)'}`,
              }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: QUANTIZATION[q].color }}>{q}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {QUANTIZATION[q].size} | {QUANTIZATION[q].speed}
              </div>
            </motion.button>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          <div style={{ padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>MODEL SIZE</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{QUANTIZATION[selectedQuantization].size}</div>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>INFERENCE TIME</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{QUANTIZATION[selectedQuantization].speed}</div>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: 8, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>ACCURACY</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{QUANTIZATION[selectedQuantization].accuracy}</div>
          </div>
        </div>
      </div>

      {/* Edge deployment options */}
      <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Edge Deployment Options</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {EDGE_DEVICES.map(d => (
            <div key={d.name} style={{ padding: 14, background: 'var(--bg-primary)', borderRadius: 10, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{d.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                <div>Power: <strong>{d.power}</strong></div>
                <div>Performance: <strong>{d.fps}</strong></div>
                <div>Price: <strong>{d.price}</strong></div>
                <div>Best with: <strong>{d.suitable}</strong></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Final project summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ padding: 24, borderRadius: 16, background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #22c55e', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>&#127942;</div>
        <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 700, color: '#065f46', marginBottom: 8 }}>
          Project Complete!
        </h3>
        <p style={{ fontSize: 14, color: '#16a34a', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
          You have built a complete Indian Vehicle Number Plate Detection system — from dataset annotation, through data augmentation and model training, to real-time detection with OCR text extraction. This pipeline mirrors production ANPR systems deployed across Indian smart cities.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
          {[
            { label: 'Images Annotated', value: '5+' },
            { label: 'Model Trained', value: 'YOLOv8' },
            { label: 'Plates Detected', value: '6' },
            { label: 'OCR Extracted', value: '3+' },
            { label: 'Pipeline Stages', value: '8/8' },
          ].map(s => (
            <div key={s.label} style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.7)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#16a34a' }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#065f46' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
