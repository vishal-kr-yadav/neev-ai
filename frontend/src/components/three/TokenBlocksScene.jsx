import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text, RoundedBox, Float } from '@react-three/drei'
import * as THREE from 'three'

const tokenColors = ['#4f46e5', '#0ea5e9', '#fd79a8', '#fdcb6e', '#10b981']

function TokenBlock({ position, text, color, index, split }) {
  const ref = useRef()
  const targetX = split ? position[0] + (index % 2 === 0 ? -0.3 : 0.3) : position[0]

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.position.x += (targetX - ref.current.position.x) * 0.05
      ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.5 + index) * 0.1
      ref.current.position.y = position[1] + Math.sin(clock.elapsedTime + index * 0.5) * 0.05
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={ref} position={position}>
        <RoundedBox args={[0.8, 0.5, 0.3]} radius={0.08} smoothness={4}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.2}
            roughness={0.3}
            metalness={0.5}
            transparent
            opacity={0.85}
          />
        </RoundedBox>
        <Text
          position={[0, 0, 0.18]}
          fontSize={0.15}
          color="white"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {text}
        </Text>
        {/* Token ID */}
        <Text
          position={[0.3, 0.2, 0.18]}
          fontSize={0.08}
          color="white"
          anchorX="center"
          opacity={0.6}
        >
          #{index}
        </Text>
      </group>
    </Float>
  )
}

function SplitEffect({ active }) {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (ref.current && active) {
      ref.current.material.opacity = 0.3 + Math.sin(clock.elapsedTime * 4) * 0.2
    }
  })

  if (!active) return null
  return (
    <mesh ref={ref} position={[0, 0, -0.5]}>
      <planeGeometry args={[8, 4]} />
      <meshBasicMaterial color="#4f46e5" transparent opacity={0.1} />
    </mesh>
  )
}

function TextToTokens() {
  const tokens = [
    { text: 'Trans', color: tokenColors[0] },
    { text: 'form', color: tokenColors[1] },
    { text: 'ers', color: tokenColors[2] },
    { text: 'are', color: tokenColors[3] },
    { text: 'cool', color: tokenColors[4] },
  ]

  return (
    <group>
      {tokens.map((token, i) => (
        <TokenBlock
          key={token.text}
          position={[(i - 2) * 1, 0, 0]}
          text={token.text}
          color={token.color}
          index={i}
          split={false}
        />
      ))}

      {/* Arrow showing flow */}
      {tokens.slice(0, -1).map((_, i) => (
        <mesh key={i} position={[(i - 1.5) * 1, 0, 0]}>
          <coneGeometry args={[0.05, 0.15, 8]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Floating particles around tokens */}
      <FloatingParticles />
    </group>
  )
}

function FloatingParticles() {
  const count = 40
  const ref = useRef()
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 6
      p[i * 3 + 1] = (Math.random() - 0.5) * 3
      p[i * 3 + 2] = (Math.random() - 0.5) * 2
    }
    return p
  }, [])

  useFrame(({ clock }) => {
    if (ref.current) {
      const pos = ref.current.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(clock.elapsedTime * 2 + i) * 0.003
        pos[i * 3] += Math.cos(clock.elapsedTime + i * 0.5) * 0.001
      }
      ref.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#818cf8" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

export default function TokenBlocksScene() {
  return (
    <div style={{ width: '100%', height: 350, borderRadius: 20, overflow: 'hidden', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)' }}>
      <Canvas camera={{ position: [0, 0.5, 4], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#4f46e5" />
        <pointLight position={[-5, -3, 3]} intensity={0.4} color="#0ea5e9" />
        <TextToTokens />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.8}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  )
}
