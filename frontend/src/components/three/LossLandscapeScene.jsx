import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import * as THREE from 'three'

function LossLandscape() {
  const meshRef = useRef()
  const ballRef = useRef()
  const trailRef = useRef()
  const timeRef = useRef(0)

  // Generate a loss landscape surface
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(6, 6, 60, 60)
    const positions = geo.attributes.position.array
    const colors = new Float32Array(positions.length)

    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i]
      const z = positions[i + 1]
      // Create a bowl-like shape with some bumps (loss landscape)
      const y = (x * x + z * z) * 0.15
        + Math.sin(x * 2) * 0.15
        + Math.cos(z * 2) * 0.1
        + Math.sin(x * z) * 0.08
      positions[i + 2] = y

      // Color based on height (loss value)
      const t = Math.min(y / 2, 1)
      colors[i] = t * 1.0 // Red
      colors[i + 1] = (1 - t) * 0.93 // Green
      colors[i + 2] = (1 - t) * 0.77 // Blue
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [])

  // Animated ball rolling down to minimum
  useFrame(({ clock }) => {
    timeRef.current = clock.elapsedTime

    if (ballRef.current) {
      const t = (clock.elapsedTime * 0.3) % 4
      const progress = Math.min(t / 3, 1)
      // Spiral path to minimum
      const radius = 2.5 * (1 - progress * 0.85)
      const angle = progress * Math.PI * 6
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const y = (x * x + z * z) * 0.15 + 0.15

      ballRef.current.position.set(x, y, z)

      // Color based on height
      const loss = y
      const r = Math.min(loss, 1)
      const g = Math.max(1 - loss, 0)
      ballRef.current.material.color.setRGB(r, g, 0.3)
      ballRef.current.material.emissive.setRGB(r * 0.5, g * 0.5, 0.15)
    }
  })

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* Surface */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          transparent
          opacity={0.7}
          roughness={0.6}
          metalness={0.2}
          wireframe={false}
        />
      </mesh>

      {/* Wireframe overlay */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          vertexColors
          wireframe
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Rolling ball (gradient descent) */}
      <mesh ref={ballRef} position={[2, 1.5, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#ff6b6b"
          emissive="#ff6b6b"
          emissiveIntensity={0.5}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Minimum marker */}
      <mesh position={[0, 0.08, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Labels */}
      <Text position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]} fontSize={0.15} color="#10b981" anchorX="center">
        Minimum
      </Text>
    </group>
  )
}

export default function LossLandscapeScene() {
  return (
    <div style={{
      width: '100%', height: 420, borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)',
    }}>
      <Canvas camera={{ position: [4, 4, 4], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 8, 5]} intensity={1} color="#fdcb6e" />
        <pointLight position={[-5, 3, -5]} intensity={0.4} color="#4f46e5" />
        <directionalLight position={[0, 10, 0]} intensity={0.3} />
        <LossLandscape />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 2.5}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  )
}
