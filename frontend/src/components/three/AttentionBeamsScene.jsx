import { useRef, useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float } from '@react-three/drei'
import * as THREE from 'three'

const words = ['The', 'cat', 'sat', 'on', 'mat']
const attentionWeights = [
  // from "cat" to each word
  [0.1, 0.4, 0.3, 0.05, 0.15],
]

function WordNode({ position, text, isSelected, weight, onClick }) {
  const ref = useRef()
  const glowRef = useRef()

  useFrame(({ clock }) => {
    if (glowRef.current) {
      glowRef.current.material.opacity = (weight || 0.1) * 0.4 + Math.sin(clock.elapsedTime * 2) * 0.05
    }
    if (ref.current) {
      ref.current.scale.setScalar(1 + (weight || 0) * 0.3)
    }
  })

  const color = isSelected ? '#4f46e5' : weight > 0.2 ? '#10b981' : '#a0a0b8'

  return (
    <group position={position} onClick={onClick}>
      {/* Glow sphere */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.35, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>

      {/* Core sphere */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <mesh ref={ref}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.6 : weight > 0.2 ? 0.4 : 0.1}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
      </Float>

      {/* Text label */}
      <Text
        position={[0, -0.45, 0]}
        fontSize={0.14}
        color={color}
        anchorX="center"
      >
        {text}
      </Text>

      {/* Weight label */}
      {weight > 0.05 && (
        <Text
          position={[0, 0.4, 0]}
          fontSize={0.09}
          color={color}
          anchorX="center"
        >
          {Math.round(weight * 100)}%
        </Text>
      )}
    </group>
  )
}

function AttentionBeam({ from, to, weight, color }) {
  const ref = useRef()
  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...from),
      new THREE.Vector3(
        (from[0] + to[0]) / 2,
        Math.max(from[1], to[1]) + weight * 1.5 + 0.5,
        (from[2] + to[2]) / 2 + 0.3
      ),
      new THREE.Vector3(...to)
    )
  }, [from, to, weight])

  const points = curve.getPoints(40)
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  // Animated pulse
  const pulseRef = useRef()
  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const t = (clock.elapsedTime * 0.5) % 1
      const p = curve.getPoint(t)
      pulseRef.current.position.copy(p)
      pulseRef.current.material.opacity = weight
    }
  })

  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={weight * 0.6} linewidth={2} />
      </line>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.04 + weight * 0.04, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={weight} />
      </mesh>
    </group>
  )
}

function AttentionVis() {
  const [selectedIdx] = useState(1) // "cat"
  const weights = attentionWeights[0]

  const positions = words.map((_, i) => {
    const angle = (i / words.length) * Math.PI * 2 - Math.PI / 2
    return [Math.cos(angle) * 2, 0, Math.sin(angle) * 2]
  })

  return (
    <group>
      {/* Attention beams from selected word */}
      {words.map((_, i) => {
        if (i === selectedIdx) return null
        const w = weights[i]
        return (
          <AttentionBeam
            key={i}
            from={positions[selectedIdx]}
            to={positions[i]}
            weight={w}
            color={w > 0.2 ? '#10b981' : '#818cf8'}
          />
        )
      })}

      {/* Word nodes */}
      {words.map((word, i) => (
        <WordNode
          key={word}
          position={positions[i]}
          text={word}
          isSelected={i === selectedIdx}
          weight={i === selectedIdx ? 1 : weights[i]}
        />
      ))}

      {/* Center label */}
      <Text position={[0, -1.2, 0]} fontSize={0.12} color="#6b6b80" anchorX="center">
        Attention from "cat"
      </Text>
    </group>
  )
}

function AmbientParticles() {
  const count = 50
  const ref = useRef()
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 6
      p[i * 3 + 1] = (Math.random() - 0.5) * 4
      p[i * 3 + 2] = (Math.random() - 0.5) * 6
    }
    return p
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.03
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#4f46e5" transparent opacity={0.3} sizeAttenuation />
    </points>
  )
}

export default function AttentionBeamsScene() {
  return (
    <div style={{
      width: '100%', height: 420, borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
    }}>
      <Canvas camera={{ position: [0, 3, 4], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 5, 3]} intensity={0.8} color="#4f46e5" />
        <pointLight position={[-3, 3, -3]} intensity={0.4} color="#0ea5e9" />
        <AttentionVis />
        <AmbientParticles />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.4}
          maxPolarAngle={Math.PI / 2.2}
          minPolarAngle={Math.PI / 5}
        />
      </Canvas>
    </div>
  )
}
