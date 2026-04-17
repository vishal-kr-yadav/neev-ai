import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox, Float, MeshTransmissionMaterial } from '@react-three/drei'
import * as THREE from 'three'

const layerData = [
  { label: 'Input', color: '#4f46e5', y: -2.5 },
  { label: 'Pos Enc', color: '#818cf8', y: -1.5 },
  { label: 'Attention', color: '#0ea5e9', y: -0.5 },
  { label: 'Feed Fwd', color: '#fdcb6e', y: 0.5 },
  { label: 'Norm', color: '#fd79a8', y: 1.5 },
  { label: 'Output', color: '#10b981', y: 2.5 },
]

function TransformerLayer({ label, color, y, index }) {
  const ref = useRef()
  const glowRef = useRef()

  useFrame(({ clock }) => {
    if (ref.current) {
      // Subtle breathing effect
      const s = 1 + Math.sin(clock.elapsedTime * 1.5 + index * 0.5) * 0.03
      ref.current.scale.set(s, 1, s)
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.06 + Math.sin(clock.elapsedTime * 2 + index) * 0.04
    }
  })

  return (
    <group position={[0, y, 0]}>
      {/* Glow plane */}
      <mesh ref={glowRef} position={[0, 0, 0]}>
        <boxGeometry args={[2.2, 0.55, 1.2]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} />
      </mesh>

      {/* Main block */}
      <mesh ref={ref}>
        <RoundedBox args={[1.8, 0.4, 0.9]} radius={0.1} smoothness={4}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.6}
            transparent
            opacity={0.8}
          />
        </RoundedBox>
      </mesh>

      {/* Label */}
      <Text
        position={[0, 0, 0.5]}
        fontSize={0.13}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  )
}

function DataFlow() {
  const particles = useRef([])
  const count = 8

  // Create multiple flowing particles
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <FlowParticle key={i} delay={i * 0.6} />
      ))}
    </>
  )
}

function FlowParticle({ delay }) {
  const ref = useRef()
  const speed = 0.4

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = ((clock.elapsedTime * speed + delay) % 6) - 3
      ref.current.position.y = t
      ref.current.position.x = Math.sin(clock.elapsedTime * 2 + delay) * 0.3
      ref.current.position.z = Math.cos(clock.elapsedTime * 2 + delay) * 0.2

      // Glow based on position
      const progress = (t + 3) / 6
      const colorIdx = Math.floor(progress * layerData.length)
      ref.current.material.opacity = 0.6 + Math.sin(clock.elapsedTime * 5) * 0.3
    }
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#ffffff" transparent opacity={0.7} />
    </mesh>
  )
}

function ConnectionBeams() {
  return (
    <>
      {layerData.slice(0, -1).map((layer, i) => {
        const next = layerData[i + 1]
        return (
          <mesh key={i} position={[0, (layer.y + next.y) / 2, 0]}>
            <cylinderGeometry args={[0.015, 0.015, Math.abs(next.y - layer.y) - 0.4, 8]} />
            <meshBasicMaterial color={layer.color} transparent opacity={0.2} />
          </mesh>
        )
      })}
    </>
  )
}

function SkipConnection() {
  const points = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(1.0, -0.5, 0),
      new THREE.Vector3(1.5, 0.5, 0.3),
      new THREE.Vector3(1.0, 1.5, 0),
    ])
    return curve.getPoints(30)
  }, [])

  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial color="#fd79a8" transparent opacity={0.4} />
      </line>
      <Text position={[1.7, 0.5, 0.3]} fontSize={0.09} color="#fd79a8" anchorX="center">
        Skip
      </Text>
    </group>
  )
}

export default function TransformerScene() {
  return (
    <div style={{
      width: '100%', height: 450, borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
    }}>
      <Canvas camera={{ position: [3, 0, 4], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#4f46e5" />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#0ea5e9" />
        <spotLight position={[0, 5, 3]} angle={0.3} intensity={0.6} color="#fdcb6e" />

        {/* Layers */}
        {layerData.map((layer, i) => (
          <TransformerLayer key={layer.label} {...layer} index={i} />
        ))}

        <ConnectionBeams />
        <DataFlow />
        <SkipConnection />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  )
}
