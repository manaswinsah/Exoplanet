// src/Homepage2.jsx - COMPLETE MODIFIED VERSION (CLEAR PLANET + TRANSPARENT BUTTON)
import React, { useRef, useState, useEffect, Suspense, useMemo } from 'react'; 
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  useTexture, 
  OrbitControls, 
  Stars, 
  Float, 
  Sparkles,
} from '@react-three/drei';
import * as THREE from 'three'; 
import './Homepage2.css';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

import backgroundImage from '../public/assets/space.png';
import planetTexture from '../public/assets/OIP.webp';
import asteroidTexture1 from '../public/assets/ast.jpg'; 
import asteroidTexture2 from '../public/assets/asteroid2.png';
// import ringsystemTexture from './assets/ringsystem.png';

// --- CLEAR PLANET (NO WHITE LAYER) ---
function SpinningPlanet({ mapTexture, ...props }) {
  const meshRef = useRef();
  const texture = useTexture(mapTexture);
  
  const [hovered, setHovered] = useState(false);
  const scale = hovered ? [1.1, 1.1, 1.1] : [1, 1, 1];
  // const ringTexture = useTexture(ringsystemTexture);
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
      meshRef.current.rotation.x = 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
      <group 
        scale={scale}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        {...props}
      >
        {/* Planet Core - CLEAN AND CLEAR */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[props.size, 128, 128]} />
          <meshStandardMaterial 
            map={texture}
            roughness={0.7}
            metalness={0.1}
            emissive={new THREE.Color(0x000000)}
            emissiveIntensity={0}
          />
        </mesh>

        {/* Subtle Atmosphere Glow - REDUCED */}
        <mesh scale={[1.08, 1.08, 1.08]}>
          <sphereGeometry args={[props.size, 32, 32]} />
          <meshBasicMaterial
            color="#4a90e2"
            transparent
            opacity={0.05}
            blending={THREE.AdditiveBlending}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Minimal Rim Light - ONLY VISIBLE ON EDGES */}
        <mesh scale={[1.03, 1.03, 1.03]}>
          <sphereGeometry args={[props.size, 64, 64]} />
          <shaderMaterial
            transparent
            blending={THREE.AdditiveBlending}
            uniforms={{
              color: { value: new THREE.Color(0x6eb5ff) }
            }}
            vertexShader={`
              varying vec3 vNormal;
              varying vec3 vViewPosition;
              void main() {
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                vNormal = normalize(normalMatrix * normal);
                gl_Position = projectionMatrix * mvPosition;
              }
            `}
            fragmentShader={`
              uniform vec3 color;
              varying vec3 vNormal;
              varying vec3 vViewPosition;
              void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float intensity = pow(0.9 - dot(normal, viewDir), 3.0);
                gl_FragColor = vec4(color, 1.0) * intensity * 0.3;
              }
            `}
          />
        </mesh>
      </group>
    </Float>
  );
}

// --- Enhanced Asteroid with Glow Trail ---
function MovingAsteroid({ mapTexture, initialPosition, speed, size }) {
  const meshRef = useRef();
  // const trailRef = useRef([]);
  const texture = useTexture(mapTexture);
  const [hovered, setHovered] = useState(false);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed * 0.3;
      meshRef.current.rotation.y += delta * speed * 0.2;

      const time = state.clock.getElapsedTime();
      
      // Elliptical orbit
      const orbitRadiusX = 2.5;
      const orbitRadiusY = 1.5;
      meshRef.current.position.x = initialPosition[0] + Math.sin(time * speed * 0.2) * orbitRadiusX;
      meshRef.current.position.y = initialPosition[1] + Math.cos(time * speed * 0.2) * orbitRadiusY;
      meshRef.current.position.z = initialPosition[2] + Math.sin(time * speed * 0.1) * 0.5;
    }
  });

  return (
    <group>
      <mesh 
        ref={meshRef} 
        position={initialPosition}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <dodecahedronGeometry args={[size, 0]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.8}
          metalness={0.3}
          emissive={new THREE.Color(0x4a4a4a)}
          emissiveIntensity={hovered ? 0.6 : 0.2}
        />
      </mesh>
      
      {/* Glow effect when hovered */}
      {hovered && (
        <mesh position={meshRef.current?.position}>
          <dodecahedronGeometry args={[size * 1.2, 0]} />
          <meshBasicMaterial
            color="#4a90e2"
            transparent
            opacity={0.3}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
}

// --- Particle Field for Depth ---
function ParticleField() {
  const points = useRef();
  const particlesCount = 2000;
  
  const positions = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.01;
      points.current.rotation.x = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particlesCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#4a90e2"
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// --- Enhanced Background ---
function BackgroundSphere({ mapTexture }) {
  const texture = useTexture(mapTexture);
  return (
    <>
      <mesh>
        <sphereGeometry args={[100, 64, 64]} />
        <meshBasicMaterial map={texture} side={THREE.BackSide} />
      </mesh>
      <Stars 
        radius={50}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </>
  );
}

// --- Camera Animation on Load ---
function CameraAnimation() {
  const { camera } = useThree();
  
  useEffect(() => {
    // Animate camera on load
    const startZ = 10;
    const endZ = 4;
    let progress = 0;
    
    const animate = () => {
      progress += 0.02;
      if (progress <= 1) {
        camera.position.z = startZ + (endZ - startZ) * Math.pow(progress, 2);
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, [camera]);
  
  return null;
}

// --- Simple Bloom Effect (Manual Implementation) ---
function SimpleBloomEffect() {
  // const meshRef = useRef();
  
  return (
    <mesh>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial
        color="#4a90e2"
        transparent
        opacity={0.05}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// --- Main Homepage Component ---
export default function Homepage() {
  const navigate = useNavigate();
  const overlayRef = useRef();
  const [loaded, setLoaded] = useState(false);
  const [buttonHover, setButtonHover] = useState(false);
  
  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
  }, []);

  const handleExplore = () => {
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: 'power2.in',
      onComplete: () => navigate('/explore')
    });
  };

  const parallaxStyle = useParallax(15);

  return (
    <div className={`homepage-wrapper ${loaded ? 'loaded' : ''}`}>
      
      <div className="threejs-canvas-container">
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 60 }} 
          dpr={[1, 2]}
          gl={{ 
            antialias: true, 
            alpha: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.2
          }}
        >
          <Suspense fallback={null}>
            <CameraAnimation />
            
            {/* Environment and Lighting */}
            <fog attach="fog" args={['#000', 5, 50]} />
            <ambientLight intensity={0.3} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4a90e2" />
            <directionalLight position={[0, 5, 5]} intensity={0.5} color="#ffffff" />
            
            <BackgroundSphere mapTexture={backgroundImage} />
            <ParticleField />
            
            {/* Main Planet - CLEAR VERSION */}
            <SpinningPlanet 
              mapTexture={planetTexture} 
              position={[0, -2, -1]} 
              size={1.5} 
            />
            
            {/* Asteroids with enhanced orbits */}
            <MovingAsteroid 
              mapTexture={asteroidTexture1} 
              initialPosition={[-1, 1, 0]} 
              speed={0.8}
              size={0.4} 
            />
            
            <MovingAsteroid 
              mapTexture={asteroidTexture2} 
              initialPosition={[1.5, -0.5, 0.5]} 
              speed={1.2}
              size={0.25} 
            />
            
            {/* Floating particles for atmosphere */}
            <Sparkles 
              count={100}
              scale={10}
              size={2}
              speed={0.5}
              color="#4a90e2"
            />
            
            {/* Manual bloom effect overlay */}
            <SimpleBloomEffect />
          </Suspense>
          
          <OrbitControls 
            enableZoom={false} 
            enablePan={false} 
            enableRotate={true}
            autoRotate
            autoRotateSpeed={0.5}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 3}
            target={[0, 0, -1.0]} 
          />
        </Canvas>
      </div>

      {/* Enhanced UI Overlay */}
      <div className="ui-overlay">
        <div className="welcome-box centered-content" style={parallaxStyle}>
          <div className="title-container">
            <h1 className="title glitch" data-text="EXOPLANETS">
              EXOPLANETS
            </h1>
            <div className="title-underline"></div>
          </div>
          
          <p className="subtitle typewriter">
            Discover new worlds beyond our solar system
          </p>
          
          <button 
            className={`explore-button ${buttonHover ? 'hover' : ''}`}
            onClick={handleExplore}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
          >
            <span className="button-text">EXPLORE FURTHER</span>
            <span className="button-icon">→</span>
          </button>
          
          {/* <div className="scroll-indicator">
            <span>Scroll to interact</span>
            <div className="scroll-arrow"></div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

// --- Enhanced Parallax Hook ---
const useParallax = (strength = 15) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * strength;
      const y = (event.clientY / window.innerHeight - 0.5) * strength;
      
      // Smooth transition
      requestAnimationFrame(() => {
        setPosition({ x, y });
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [strength]);

  return { 
    transform: `translate(${-position.x}px, ${-position.y}px) scale(1.02)`,
    transition: 'transform 0.2s ease-out'
  };
};