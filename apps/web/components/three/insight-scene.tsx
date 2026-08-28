'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line, Sphere } from '@react-three/drei'
import type { Group, Mesh } from 'three'

const BRAND_BLUE = '#178fe7'
const SKY = '#49bcf7'
const INK = '#0f2249'

function EvidenceNode({ position, delay }: { position: [number, number, number]; delay: number }) {
  const meshRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    const pulse = Math.sin(state.clock.elapsedTime * 1.4 + delay) * 0.15 + 1
    meshRef.current.scale.setScalar(pulse)
  })

  return (
    <Sphere ref={meshRef} args={[0.07, 16, 16]} position={position}>
      <meshStandardMaterial color={SKY} emissive={SKY} emissiveIntensity={0.6} />
    </Sphere>
  )
}

function OrbitingEvidence() {
  const groupRef = useRef<Group>(null)

  const nodes = useMemo(() => {
    const count = 10
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2
      const radius = 1.9 + (index % 3) * 0.22
      const height = Math.sin(angle * 2) * 0.6
      return {
        position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius] as [number, number, number],
        delay: index * 0.6,
      }
    })
  }, [])

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.16
  })

  return (
    <group ref={groupRef}>
      {nodes.map((node, index) => (
        <group key={index}>
          <EvidenceNode position={node.position} delay={node.delay} />
          <Line points={[[0, 0, 0], node.position]} color={BRAND_BLUE} transparent opacity={0.22} lineWidth={1} />
        </group>
      ))}
    </group>
  )
}

function InsightCore() {
  const meshRef = useRef<Mesh>(null)

  useFrame((_, delta) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y += delta * 0.22
    meshRef.current.rotation.x += delta * 0.06
  })

  return (
    <Float speed={1.6} rotationIntensity={0.3} floatIntensity={0.7}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.05, 1]} />
        <meshStandardMaterial color={INK} emissive={BRAND_BLUE} emissiveIntensity={0.35} wireframe />
      </mesh>
      <mesh scale={0.62}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color={BRAND_BLUE} emissive={SKY} emissiveIntensity={0.5} transparent opacity={0.85} />
      </mesh>
    </Float>
  )
}

export function InsightScene() {
  return (
    <Canvas
      dpr={[1, 1.6]}
      camera={{ position: [0, 0.6, 5.4], fov: 42 }}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[4, 4, 4]} intensity={90} color={SKY} />
      <pointLight position={[-4, -3, -2]} intensity={40} color={BRAND_BLUE} />
      <InsightCore />
      <OrbitingEvidence />
    </Canvas>
  )
}
