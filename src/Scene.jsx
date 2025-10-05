import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Stars } from '@react-three/drei';
import { TextureLoader, Color, Vector3, LineBasicMaterial, BufferGeometry } from 'three';
import gsap from 'gsap';

// --- Helper Components ---

function HabitableZone() {
  // Adjusted for the smaller orbit radius
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <ringGeometry args={[12, 18, 64]} />
      <meshBasicMaterial 
        color="#B0E0E6"
        opacity={0.2}
        transparent={true} 
        side={2}
      />
    </mesh>
  );
}

// The simple, persistent orbit trail you liked
function OrbitTrail({ orbitRadius }) {
    const points = useMemo(() => {
        const pts = [];
        for (let i = 0; i <= 128; i++) {
            const angle = (i / 128) * Math.PI * 2;
            pts.push(new Vector3(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius));
        }
        return pts;
    }, [orbitRadius]);

    return (
        <line>
            <bufferGeometry attach="geometry">
                <bufferAttribute
                    attach="attributes-position"
                    count={points.length}
                    array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial 
                color={0xffffff} 
                transparent 
                opacity={0.3} 
            />
        </line>
    );
}


function ExoplanetSystem({ result, sunRef, planetRef }) {
    const [planetTexture, sunTexture] = useLoader(TextureLoader, [
      '/gas_giant_texture.jpg',
      '/sun_texture.jpg'
    ]);

    // Restored the smaller scales for the "tiny" look
    const sunScale = 1.5;
    const planetScale = 0.2;
    const orbitRadius = 15;
  
    useFrame(({ clock }) => {
      if (sunRef.current) {
        sunRef.current.rotation.y -= 0.001;
      }
      if (planetRef.current) {
        const angle = clock.getElapsedTime() * 0.1;
        planetRef.current.position.set(Math.cos(angle) * orbitRadius, 0, Math.sin(angle) * orbitRadius); 
        planetRef.current.rotation.y += 0.002;
      }
    });
  
    if (!result || !result.is_planet) return null;
  
    return (
      <group>
        <mesh ref={sunRef}>
          <sphereGeometry args={[sunScale, 32, 32]} />
          <meshBasicMaterial map={sunTexture} toneMapped={false} />
        </mesh>
  
        <mesh ref={planetRef}>
          <sphereGeometry args={[planetScale, 64, 64]} />
          <meshStandardMaterial 
              map={planetTexture} 
              roughness={0.9}
              metalness={0.1}
              emissiveMap={planetTexture}
              emissive="#FFFFFF"
              emissiveIntensity={0.8} // Slightly brighter to be more visible when tiny
          />
        </mesh>
  
        {/* Adjusted HabitableZone to be smaller */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
            <ringGeometry args={[20, 24, 64]} />
            <meshBasicMaterial color="#B0E0E6" opacity={0.2} transparent={true} side={2} />
        </mesh>
        
        <OrbitTrail orbitRadius={orbitRadius} />
      </group>
    );
}


// --- Main Scene Component ---
export default function Scene({ analysisResult, viewMode }) {
  const cameraRef = useRef();
  const controlsRef = useRef();
  const sunRef = useRef();
  const planetRef = useRef();

  // Stable camera animation function
  const animateCameraTo = (targetPosition, cameraPosition) => {
    if (!controlsRef.current || !cameraRef.current) return;

    gsap.to(controlsRef.current.target, {
        x: targetPosition.x, y: targetPosition.y, z: targetPosition.z,
        duration: 1.5, ease: 'power3.inOut',
    });

    gsap.to(cameraRef.current.position, {
        x: cameraPosition.x, y: cameraPosition.y, z: cameraPosition.z,
        duration: 1.5, ease: 'power3.inOut',
    });
  };

  // Effect to handle view toggling, with adjusted distances for the "tiny" scale
  useEffect(() => {
    if (analysisResult?.is_planet) {
        if (viewMode === 'system') {
            animateCameraTo(new Vector3(0, 0, 0), new Vector3(0, 15, 45));
        } else if (viewMode === 'planet' && planetRef.current) {
            const planetWorldPos = new Vector3();
            planetRef.current.getWorldPosition(planetWorldPos);
            animateCameraTo(planetWorldPos, new Vector3(planetWorldPos.x + 1, planetWorldPos.y + 0.5, planetWorldPos.z + 1));
        }
    } else {
        animateCameraTo(new Vector3(0, 0, 0), new Vector3(0, 5, 80));
    }
  }, [viewMode, analysisResult]);


  return (
    <Canvas style={{ position: 'absolute', top: 0, left: 0 }}>
      <color attach="background" args={['#000005']} />
      <PerspectiveCamera ref={cameraRef} makeDefault position={[0, 5, 80]} fov={75} />
      <OrbitControls ref={controlsRef} enablePan={true} enableZoom={true} minDistance={0.5} maxDistance={100} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 0, 0]} intensity={2.5} color="#FFDDC1" />
      <Stars radius={75} depth={120} count={7000} factor={7} saturation={0} fade speed={1} />
      <ExoplanetSystem result={analysisResult} sunRef={sunRef} planetRef={planetRef} />
    </Canvas>
  );
}