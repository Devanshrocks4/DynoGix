import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'

export default function ThreeBackground({ intensity = 0.4 }) {
  const mountRef = useRef(null)
  const rafRef = useRef(null)
  const starsRef = useRef(null)
  const orbsRef = useRef([])

  // ✅ FPS LIMIT (30 FPS)
  let lastTime = 0

  const animate = useCallback((time = 0) => {
    rafRef.current = requestAnimationFrame(animate)

    // limit FPS
    if (time - lastTime < 1000 / 30) return
    lastTime = time

    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002
      starsRef.current.rotation.x += 0.0001
    }

    orbsRef.current.forEach((orb, i) => {
      orb.rotation.y += 0.005 * (i % 2 === 0 ? 1 : -1)
      orb.rotation.x += 0.002
      orb.position.y += Math.sin(time * 0.0003 + i) * 0.01
    })

    if (mountRef.current?.renderer) {
      mountRef.current.renderer.render(
        mountRef.current.scene,
        mountRef.current.camera
      )
    }
  }, [])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Scene
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      2000
    )
    camera.position.z = 80

    // Renderer (OPTIMIZED)
    const renderer = new THREE.WebGLRenderer({
      antialias: false, // 🔥 reduce load
      alpha: true,
      powerPreference: 'low-power'
    })

    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(1) // 🔥 very important (was heavy before)
    renderer.setClearColor(0x000000, 0)

    mount.appendChild(renderer.domElement)

    mount.scene = scene
    mount.camera = camera
    mount.renderer = renderer

    // ⭐ REDUCE PARTICLES (IMPORTANT)
    const starsCount = 800 // 🔥 was 2000 (heavy)
    const starPositions = new Float32Array(starsCount * 3)
    const starColors = new Float32Array(starsCount * 3)

    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3

      starPositions[i3] = (Math.random() - 0.5) * 2000
      starPositions[i3 + 1] = (Math.random() - 0.5) * 2000
      starPositions[i3 + 2] = (Math.random() - 0.5) * 2000

      const color = new THREE.Color(0xF5C542).multiplyScalar(intensity)
      starColors[i3] = color.r
      starColors[i3 + 1] = color.g
      starColors[i3 + 2] = color.b
    }

    const starsGeometry = new THREE.BufferGeometry()
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))

    const starsMaterial = new THREE.PointsMaterial({
      size: 2,
      vertexColors: true,
      transparent: true,
      opacity: intensity * 0.6,
      depthWrite: false
    })

    const stars = new THREE.Points(starsGeometry, starsMaterial)
    starsRef.current = stars
    scene.add(stars)

    // 🔥 REDUCE ORBS
    const orbsGeometry = new THREE.SphereGeometry(2, 8, 8)
    const orbsMaterial = new THREE.MeshBasicMaterial({
      color: 0xF5C542,
      wireframe: true,
      opacity: 0.1 * intensity,
      transparent: true
    })

    for (let i = 0; i < 5; i++) { // 🔥 was 12
      const orb = new THREE.Mesh(orbsGeometry, orbsMaterial)
      orb.position.set(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 200
      )
      scene.add(orb)
      orbsRef.current.push(orb)
    }

    // Resize
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener('resize', handleResize)

    animate(0)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)

      if (starsRef.current) {
        scene.remove(starsRef.current)
        starsRef.current.geometry.dispose()
        starsRef.current.material.dispose()
      }

      orbsRef.current.forEach((orb) => {
        scene.remove(orb)
        orb.geometry.dispose()
        orb.material.dispose()
      })

      orbsRef.current = []

      if (mount.renderer) {
        mount.renderer.dispose()
        mount.removeChild(mount.renderer.domElement)
      }
    }
  }, [intensity, animate])

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  )
}