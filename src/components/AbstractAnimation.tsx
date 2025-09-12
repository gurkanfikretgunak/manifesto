'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const GeometricAssembly = () => {
  const groupRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { camera, gl } = useThree();
  
  // Store original positions for restoration
  const originalPositions = useRef<Map<THREE.Object3D, THREE.Vector3>>(new Map());
  
  const geometries = useMemo(() => {
    const group = new THREE.Group();
    
    // Central icosahedron (20-sided polyhedron)
    const icosahedron = new THREE.IcosahedronGeometry(1.2, 0);
    const icosahedronMesh = new THREE.Mesh(icosahedron);
    icosahedronMesh.position.set(0, 0, 0);
    icosahedronMesh.userData = { type: 'icosahedron', originalPosition: new THREE.Vector3(0, 0, 0) };
    group.add(icosahedronMesh);
    originalPositions.current.set(icosahedronMesh, new THREE.Vector3(0, 0, 0));
    
    // Surrounding octahedrons (8-sided polyhedrons)
    for (let i = 0; i < 6; i++) {
      const octahedron = new THREE.OctahedronGeometry(0.4, 0);
      const octahedronMesh = new THREE.Mesh(octahedron);
      const angle = (i / 6) * Math.PI * 2;
      const pos = new THREE.Vector3(
        Math.cos(angle) * 2.5,
        Math.sin(angle * 2) * 0.8,
        Math.sin(angle) * 2.5
      );
      octahedronMesh.position.copy(pos);
      octahedronMesh.userData = { type: 'octahedron', originalPosition: pos.clone() };
      group.add(octahedronMesh);
      originalPositions.current.set(octahedronMesh, pos.clone());
    }
    
    // Tetrahedrons (4-sided polyhedrons) in orbit
    for (let i = 0; i < 8; i++) {
      const tetrahedron = new THREE.TetrahedronGeometry(0.25, 0);
      const tetrahedronMesh = new THREE.Mesh(tetrahedron);
      const angle = (i / 8) * Math.PI * 2;
      const radius = 3.5;
      const pos = new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(i * Math.PI / 4) * 1.2,
        Math.sin(angle) * radius
      );
      tetrahedronMesh.position.copy(pos);
      tetrahedronMesh.userData = { type: 'tetrahedron', originalPosition: pos.clone() };
      group.add(tetrahedronMesh);
      originalPositions.current.set(tetrahedronMesh, pos.clone());
    }
    
    return group;
  }, []);

  // Generate soap bubble colors
  const generateBubbleColor = (time: number, offset: number = 0) => {
    const hue = (time * 0.1 + offset) % 360;
    const saturation = 80;
    const lightness = 60;
    return new THREE.Color().setHSL(hue / 360, saturation / 100, lightness / 100);
  };

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      
      if (!isHovered) {
        // Normal rotation and floating
        groupRef.current.rotation.x = Math.sin(time * 0.3) * 0.15;
        groupRef.current.rotation.y = time * 0.4;
        groupRef.current.rotation.z = Math.cos(time * 0.2) * 0.1;
        groupRef.current.position.y = Math.sin(time * 0.8) * 0.3;
        
        // Restore original positions
        groupRef.current.children.forEach((child, index) => {
          if (child instanceof THREE.Mesh) {
            const originalPos = originalPositions.current.get(child);
            if (originalPos) {
              child.position.lerp(originalPos, 0.1);
            }
          }
        });
      } else {
        // Fragment and follow mouse
        const mouse = new THREE.Vector2();
        mouse.x = (mousePosition.x / gl.domElement.clientWidth) * 2 - 1;
        mouse.y = -(mousePosition.y / gl.domElement.clientHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, camera);
        
        groupRef.current.children.forEach((child, index) => {
          if (child instanceof THREE.Mesh) {
            const originalPos = originalPositions.current.get(child);
            if (originalPos) {
              // Fragment effect - scatter pieces
              const scatterAmount = 2;
              const scatterX = (Math.random() - 0.5) * scatterAmount;
              const scatterY = (Math.random() - 0.5) * scatterAmount;
              const scatterZ = (Math.random() - 0.5) * scatterAmount;
              
              const targetPos = new THREE.Vector3(
                originalPos.x + scatterX + mouse.x * 3,
                originalPos.y + scatterY + mouse.y * 3,
                originalPos.z + scatterZ
              );
              
              child.position.lerp(targetPos, 0.15);
              
              // Add rotation when fragmented
              child.rotation.x += 0.02;
              child.rotation.y += 0.03;
              child.rotation.z += 0.01;
            }
          }
        });
      }
    }
  });

  const handlePointerMove = (event: React.PointerEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  return (
    <group 
      ref={groupRef}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => setIsHovered(false)}
      onPointerMove={handlePointerMove}
    >
      {geometries.children.map((child, index) => {
        if (child instanceof THREE.Mesh) {
          return (
            <mesh key={index} geometry={child.geometry} position={child.position}>
              <meshBasicMaterial 
                color={isHovered ? generateBubbleColor(Date.now() * 0.001, index * 50) : new THREE.Color('#222222')}
                wireframe 
                transparent 
                opacity={isHovered ? 0.8 : 0.7}
              />
            </mesh>
          );
        }
        return null;
      })}
    </group>
  );
};

const AbstractAnimation = () => {
  return (
    <div className="fixed top-0 right-0 w-96 h-96 pointer-events-auto z-0 opacity-25 hover:opacity-40 transition-opacity duration-300">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
        onPointerMissed={() => {}}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <pointLight position={[-5, -5, -5]} intensity={0.8} />
        <GeometricAssembly />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate={true}
          autoRotateSpeed={0.3}
          enableDamping
          dampingFactor={0.05}
          enabled={false}
        />
      </Canvas>
    </div>
  );
};

export default AbstractAnimation;
