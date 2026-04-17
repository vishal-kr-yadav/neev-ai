import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Float, Text, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function Neuron({ position, color, size = 0.15, pulse = false }) {
  const ref = useRef()
  const glowRef = useRef()

  useFrame(({ clock }) => {
    if (pulse && ref.current) {
      ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.15)
    }
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.12 + Math.sin(clock.elapsedTime * 3 + position[1]) * 0.06
    }
  })

  return (
    <group position={position}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 2.5, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </mesh>
      <mesh ref={ref}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

function Connection({ start, end, color, speed = 1 }) {
  const curve = useMemo(() => {
    return new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(...start),
      new THREE.Vector3(
        (start[0] + end[0]) / 2,
        (start[1] + end[1]) / 2 + 0.3,
        (start[2] + end[2]) / 2
      ),
      new THREE.Vector3(...end)
    )
  }, [start, end])

  const points = curve.getPoints(30)
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])

  const pulseRef = useRef()
  useFrame(({ clock }) => {
    if (pulseRef.current) {
      const t = (clock.elapsedTime * speed * 0.3) % 1
      const p = curve.getPoint(t)
      pulseRef.current.position.copy(p)
    }
  })

  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={0.15} />
      </line>
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}

function DataParticles({ count = 60 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4
      pos[i * 3 + 2] = (Math.random() - 0.5) * 4
    }
    return pos
  }, [count])

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y = clock.elapsedTime * 0.05
      const pos = ref.current.geometry.attributes.position.array
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += Math.sin(clock.elapsedTime + i) * 0.002
      }
      ref.current.geometry.attributes.position.needsUpdate = true
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#818cf8" transparent opacity={0.4} sizeAttenuation />
    </points>
  )
}

function NeuralNetwork() {
  const layers = [
    { neurons: 4, x: -2, color: '#4f46e5' },
    { neurons: 6, x: 0, color: '#0ea5e9' },
    { neurons: 3, x: 2, color: '#10b981' },
  ]

  const getNeuronPos = (layerIdx, neuronIdx) => {
    const layer = layers[layerIdx]
    const yOffset = (layer.neurons - 1) / 2
    return [layer.x, (neuronIdx - yOffset) * 0.5, 0]
  }

  const connections = []
  for (let l = 0; l < layers.length - 1; l++) {
    for (let i = 0; i < layers[l].neurons; i++) {
      for (let j = 0; j < layers[l + 1].neurons; j++) {
        connections.push({
          start: getNeuronPos(l, i),
          end: getNeuronPos(l + 1, j),
          color: layers[l].color,
          speed: 0.5 + Math.random() * 1.5,
        })
      }
    }
  }

  return (
    <group>
      {connections.map((conn, i) => (
        <Connection key={i} {...conn} />
      ))}
      {layers.map((layer, li) =>
        Array.from({ length: layer.neurons }).map((_, ni) => (
          <Neuron
            key={`${li}-${ni}`}
            position={getNeuronPos(li, ni)}
            color={layer.color}
            size={0.12}
            pulse
          />
        ))
      )}
      <Text position={[-2, -1.8, 0]} fontSize={0.18} color="#4f46e5" anchorX="center">
        Input
      </Text>
      <Text position={[0, -2.2, 0]} fontSize={0.18} color="#0ea5e9" anchorX="center">
        Hidden
      </Text>
      <Text position={[2, -1.4, 0]} fontSize={0.18} color="#10b981" anchorX="center">
        Output
      </Text>
      <DataParticles />
    </group>
  )
}

export default function NeuralNetworkScene() {
  return (
    <div style={{
      width: '100%', height: 420, borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      border: '1px solid var(--border)',
      boxShadow: 'var(--shadow-md)',
    }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#818cf8" />
        <pointLight position={[-5, -5, 3]} intensity={0.5} color="#0ea5e9" />
        <NeuralNetwork />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>
    </div>
  )
}

export function BrainScene() {
  return (
    <div style={{
      width: '100%', height: 300, borderRadius: 20, overflow: 'hidden',
      background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
      border: '1px solid var(--border)',
    }}>
      <Canvas camera={{ position: [0, 0, 3], fov: 50 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[3, 3, 3]} intensity={1} color="#818cf8" />
        <pointLight position={[-3, -3, 2]} intensity={0.5} color="#0ea5e9" />
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
          <mesh>
            <icosahedronGeometry args={[0.6, 2]} />
            <MeshDistortMaterial
              color="#4f46e5"
              emissive="#4f46e5"
              emissiveIntensity={0.3}
              roughness={0.2}
              metalness={0.8}
              distort={0.3}
              speed={2}
            />
          </mesh>
        </Float>
        <DataParticles count={100} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1} />
      </Canvas>
    </div>
  )
}
