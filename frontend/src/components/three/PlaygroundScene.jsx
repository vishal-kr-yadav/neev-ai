import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, Float, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function TokenStream() {
  const groupRef = useRef()
  const tokenCount = 12

  const tokens = useMemo(() =>
    Array.from({ length: tokenCount }).map((_, i) => ({
      text: ['The', 'AI', 'can', 'learn', 'to', 'write', 'code', 'and', 'solve', 'hard', 'math', 'problems'][i],
      color: ['#4f46e5', '#0ea5e9', '#fdcb6e', '#10b981', '#fd79a8', '#818cf8',
              '#4f46e5', '#0ea5e9', '#fdcb6e', '#10b981', '#fd79a8', '#818cf8'][i],
    })), [])

  useFrame(({ clock }) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = clock.elapsedTime * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      {tokens.map((token, i) => {
        const angle = (i / tokenCount) * Math.PI * 2
        const radius = 2.2
        const y = (i / tokenCount) * 2 - 1
        return (
          <StreamToken
            key={i}
            text={token.text}
            color={token.color}
            position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius]}
            index={i}
          />
        )
      })}
    </group>
  )
}

function StreamToken({ text, color, position, index }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.lookAt(0, ref.current.position.y, 0)
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime + index * 0.5) * 0.1
    }
  })

  return (
    <Float speed={1.5} floatIntensity={0.2}>
      <group ref={ref} position={position}>
        <mesh>
          <boxGeometry args={[0.6, 0.3, 0.08]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            transparent
            opacity={0.8}
            roughness={0.3}
            metalness={0.5}
          />
        </mesh>
        <Text position={[0, 0, 0.05]} fontSize={0.1} color="white" anchorX="center">
          {text}
        </Text>
      </group>
    </Float>
  )
}

function CentralCore() {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.5
      ref.current.rotation.x = Math.sin(clock.elapsedTime * 0.3) * 0.2
    }
  })

  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.5, 2]} />
      <MeshDistortMaterial
        color="#4f46e5"
        emissive="#4f46e5"
        emissiveIntensity={0.4}
        roughness={0.2}
        metalness={0.8}
        distort={0.4}
        speed={3}
      />
    </mesh>
  )
}

function EnergyRings() {
  return (
    <>
      {[1.0, 1.6, 2.2].map((radius, i) => (
        <Ring key={i} radius={radius} color={['#4f46e5', '#0ea5e9', '#fdcb6e'][i]} speed={0.3 + i * 0.2} />
      ))}
    </>
  )
}

function Ring({ radius, color, speed }) {
  const ref = useRef()

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.z = clock.elapsedTime * speed
      ref.current.rotation.x = Math.PI / 2 + Math.sin(clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.015, 8, 64]} />
      <meshBasicMaterial color={color} transparent opacity={0.3} />
    </mesh>
  )
}

function Sparks() {
  const count = 80
  const ref = useRef()
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2
      const r = 1 + Math.random() * 2
      p[i * 3] = Math.cos(angle) * r
      p[i * 3 + 1] = (Math.random() - 0.5) * 3
      p[i * 3 + 2] = Math.sin(angle) * r
    }
    return p
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.1
      const pos = ref.current.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(clock.elapsedTime * 2 + i) * 0.003
      }
      ref.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#818cf8" transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

export default function PlaygroundScene() {
  return (
    <div style={{
      width: '100%', height: 400, borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
    }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#4f46e5" />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="#0ea5e9" />
        <spotLight position={[0, 8, 0]} angle={0.3} intensity={0.5} color="#fdcb6e" />
        <CentralCore />
        <TokenStream />
        <EnergyRings />
        <Sparks />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.7}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 4}
        />
      </Canvas>
    </div>
  )
}
