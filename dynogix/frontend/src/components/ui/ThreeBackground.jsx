import { useRef, useEffect, useCallback } from 'react'
import * as THREE from 'three'

export default function ThreeBackground({ intensity = 0.4 }) {
  const mountRef = useRef(null)
  const rafRef = useRef(null)
  const starsRef = useRef(null)
  const orbsRef = useRef([])

  const animate = useCallback((time) => {
    rafRef.current = requestAnimationFrame(animate)

    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0003
      starsRef.current.rotation.x += 0.0002
    }

    orbsRef.current.forEach((orb, i) => {
      orb.rotation.y += 0.01 * (i % 2 === 0 ? 1 : -1)
      orb.rotation.x += 0.005
      orb.position.y += Math.sin(time * 0.0005 + i) * 0.02
    })

    if (mountRef.current?.renderer) {
      mountRef.current.renderer.render(mountRef.current.scene, mountRef.current.camera)
    }
  }, [])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 3000)
    camera.position.z = 80

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Store refs
    mount.scene = scene
    mount.camera = camera
    mount.renderer = renderer

    // Stars particles
    const starsCount = 2000
    const starPositions = new Float32Array(starsCount * 3)
    const starColors = new Float32Array(starsCount * 3)
    const starSizes = new Float32Array(starsCount)

    for (let i = 0; i < starsCount; i++) {
      const i3 = i * 3
      starPositions[i3] = (Math.random() - 0.5) * 3000
      starPositions[i3 + 1] = (Math.random() - 0.5) * 3000
      starPositions[i3 + 2] = (Math.random() - 0.5) * 3000

      // Gold/violet/pink gradient
      const colorMix = Math.sin(i * 0.1) * 0.5 + 0.5
      const color = new THREE.Color().lerpColors(
        new THREE.Color(0xF5C542), // gold
        new THREE.Color(0xFF7EB6), // pink
        colorMix
      ).multiplyScalar(intensity)
      starColors[i3] = color.r
      starColors[i3 + 1] = color.g
      starColors[i3 + 2] = color.b

      starSizes[i] = Math.random() * 2 + 1
    }

    const starsGeometry = new THREE.BufferGeometry()
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3))
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1))

    const starsMaterial = new THREE.PointsMaterial({ 
      size: 3, 
      vertexColors: true, 
      transparent: true, 
      opacity: intensity * 0.8,
      sizeAttenuation: true,
      depthWrite: false 
    })

    const stars = new THREE.Points(starsGeometry, starsMaterial)
    starsRef.current = stars
    scene.add(stars)

    // Floating gold orbs
    const orbsGeometry = new THREE.SphereGeometry(2, 16, 16)
    const orbsMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xF5C542, 
      transparent: true, 
      opacity: 0.15 * intensity,
      wireframe: true 
    })

    for (let i = 0; i < 12; i++) {
      const orb = new THREE.Mesh(orbsGeometry, orbsMaterial)
      orb.position.set(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 200
      )
      scene.add(orb)
      orbsRef.current.push(orb)
    }

    // Lighting for depth
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3 * intensity)
    scene.add(ambientLight)

    // Resize handler
    const handleResize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }
    window.addEventListener('resize', handleResize)

    // Start animation
    animate(0)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)

      // Cleanup
      if (starsRef.current) {
        scene.remove(starsRef.current)
        starsRef.current.geometry.dispose()
        starsRef.current.material.dispose()
      }
      orbsRef.current.forEach(orb => {
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

  return <div ref={mountRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }} />
}

