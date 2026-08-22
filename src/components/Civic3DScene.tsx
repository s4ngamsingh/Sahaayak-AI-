import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { Sparkles, Layers, RefreshCw, Eye, ShieldCheck, Zap, Activity } from 'lucide-react';
import { DEPARTMENTS } from '../data/mockData';

interface Civic3DSceneProps {
  onSelectDepartment?: (deptId: string) => void;
  activeDeptId?: string;
}

export const Civic3DScene: React.FC<Civic3DSceneProps> = ({
  onSelectDepartment,
  activeDeptId,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'CORE' | 'NODES' | 'RADAR'>('CORE');
  const [hoveredNode, setHoveredNode] = useState<{ id: string; name: string; sla: number } | null>(null);
  const [isRotating, setIsRotating] = useState(true);

  // References for Three.js objects
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const coreGroupRef = useRef<THREE.Group | null>(null);
  const satellitesGroupRef = useRef<THREE.Group | null>(null);
  const ringsGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const nodeMeshesRef = useRef<{ mesh: THREE.Mesh; dept: typeof DEPARTMENTS[0] }[]>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 8.5);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x6366f1, 3, 20);
    pointLight1.position.set(4, 4, 4);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 3, 20);
    pointLight2.position.set(-4, -2, -4);
    scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x10b981, 2, 15);
    pointLight3.position.set(0, 5, 0);
    scene.add(pointLight3);

    // 5. Holographic Core Group
    const coreGroup = new THREE.Group();
    coreGroupRef.current = coreGroup;
    scene.add(coreGroup);

    // Inner glowing crystal
    const innerGeom = new THREE.OctahedronGeometry(1.0, 0);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x6366f1,
      emissive: 0x4338ca,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.2,
      transmission: 0.8,
      transparent: true,
      opacity: 0.9,
    });
    const innerCore = new THREE.Mesh(innerGeom, innerMat);
    coreGroup.add(innerCore);

    // Outer Geodesic Icosahedron Wireframe Sphere
    const icosaGeom = new THREE.IcosahedronGeometry(1.6, 2);
    const icosaWireMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const outerIcosa = new THREE.Mesh(icosaGeom, icosaWireMat);
    coreGroup.add(outerIcosa);

    // Subtle Core Shield
    const shieldGeom = new THREE.IcosahedronGeometry(1.58, 1);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const shield = new THREE.Mesh(shieldGeom, shieldMat);
    coreGroup.add(shield);

    // 6. Orbiting Rings
    const ringsGroup = new THREE.Group();
    ringsGroupRef.current = ringsGroup;
    scene.add(ringsGroup);

    const createRing = (radius: number, tube: number, color: number, rotX: number, rotY: number) => {
      const ringGeom = new THREE.TorusGeometry(radius, tube, 16, 100);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        wireframe: true,
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.rotation.x = rotX;
      ring.rotation.y = rotY;
      ringsGroup.add(ring);
      return ring;
    };

    const ring1 = createRing(2.6, 0.015, 0x818cf8, Math.PI / 3, 0);
    const ring2 = createRing(3.2, 0.012, 0x38bdf8, -Math.PI / 4, Math.PI / 6);
    const ring3 = createRing(3.8, 0.01, 0x34d399, Math.PI / 6, -Math.PI / 3);

    // 7. Department Satellite Beacons
    const satellitesGroup = new THREE.Group();
    satellitesGroupRef.current = satellitesGroup;
    scene.add(satellitesGroup);

    nodeMeshesRef.current = [];
    const deptColors = [0x38bdf8, 0x60a5fa, 0xf59e0b, 0xec4899, 0x10b981, 0xa855f7, 0x14b8a6];

    DEPARTMENTS.forEach((dept, i) => {
      const angle = (i / DEPARTMENTS.length) * Math.PI * 2;
      const radius = 3.2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = Math.sin(angle * 2) * 0.7;

      const nodeGeom = new THREE.SphereGeometry(0.24, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: deptColors[i % deptColors.length],
        emissive: deptColors[i % deptColors.length],
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const nodeMesh = new THREE.Mesh(nodeGeom, nodeMat);
      nodeMesh.position.set(x, y, z);
      nodeMesh.userData = { deptId: dept.id, name: dept.name, sla: dept.standardSlaHours };

      // Halo ring around node
      const haloGeom = new THREE.RingGeometry(0.3, 0.35, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: deptColors[i % deptColors.length],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const halo = new THREE.Mesh(haloGeom, haloMat);
      halo.lookAt(0, 0, 0);
      nodeMesh.add(halo);

      // Connection beam to center
      const lineMat = new THREE.LineBasicMaterial({
        color: deptColors[i % deptColors.length],
        transparent: true,
        opacity: 0.25,
      });
      const lineGeom = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, y, z),
      ]);
      const line = new THREE.Line(lineGeom, lineMat);
      satellitesGroup.add(line);

      satellitesGroup.add(nodeMesh);
      nodeMeshesRef.current.push({ mesh: nodeMesh, dept });
    });

    // 8. 3D Particle Swarm
    const particleCount = 450;
    const particleGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const baseColor1 = new THREE.Color(0x818cf8);
    const baseColor2 = new THREE.Color(0x38bdf8);
    const baseColor3 = new THREE.Color(0x34d399);

    for (let i = 0; i < particleCount; i++) {
      const r = 1.5 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const mixedColor = baseColor1.clone().lerp(
        Math.random() > 0.5 ? baseColor2 : baseColor3,
        Math.random()
      );
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeom, particleMat);
    particlesRef.current = particleSystem;
    scene.add(particleSystem);

    // GSAP Entrance Timeline
    const tl = gsap.timeline();
    tl.from(camera.position, {
      z: 18,
      y: 8,
      duration: 2.2,
      ease: 'power3.out',
    });
    tl.from(
      coreGroup.scale,
      {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 1.8,
        ease: 'elastic.out(1, 0.75)',
      },
      '-=1.5'
    );
    tl.from(
      satellitesGroup.scale,
      {
        x: 0,
        y: 0,
        z: 0,
        duration: 1.5,
        ease: 'power2.out',
      },
      '-=1.2'
    );

    // 9. Raycasting for interactive hover and click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Parallax effect on camera using GSAP
      gsap.to(camera.position, {
        x: mouse.x * 1.2,
        y: 2 + mouse.y * 0.8,
        duration: 1.2,
        ease: 'power1.out',
      });

      raycaster.setFromCamera(mouse, camera);
      const meshes = nodeMeshesRef.current.map((item) => item.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const info = nodeMeshesRef.current.find((item) => item.mesh === hit);
        if (info) {
          setHoveredNode({
            id: info.dept.id,
            name: info.dept.name,
            sla: info.dept.standardSlaHours,
          });
          gsap.to(hit.scale, { x: 1.4, y: 1.4, z: 1.4, duration: 0.3 });
        }
      } else {
        setHoveredNode(null);
        nodeMeshesRef.current.forEach((item) => {
          gsap.to(item.mesh.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        });
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = nodeMeshesRef.current.map((item) => item.mesh);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Mesh;
        const info = nodeMeshesRef.current.find((item) => item.mesh === hit);
        if (info && onSelectDepartment) {
          onSelectDepartment(info.dept.id);
          // Pulse animation on click
          gsap.timeline()
            .to(hit.scale, { x: 1.8, y: 1.8, z: 1.8, duration: 0.15 })
            .to(hit.scale, { x: 1.2, y: 1.2, z: 1.2, duration: 0.3 });
        }
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (coreGroup) {
        coreGroup.rotation.y = elapsedTime * 0.25;
        coreGroup.rotation.x = Math.sin(elapsedTime * 0.3) * 0.15;
        innerCore.rotation.y = -elapsedTime * 0.5;
      }

      if (ringsGroup) {
        ring1.rotation.z = elapsedTime * 0.15;
        ring2.rotation.z = -elapsedTime * 0.2;
        ring3.rotation.z = elapsedTime * 0.12;
      }

      if (satellitesGroup) {
        satellitesGroup.rotation.y = elapsedTime * 0.12;
      }

      if (particleSystem) {
        particleSystem.rotation.y = elapsedTime * 0.04;
        particleSystem.rotation.x = Math.cos(elapsedTime * 0.05) * 0.05;
      }

      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };

    animate();

    // 11. Responsive Resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newW, height: newH } = entry.contentRect;
        if (newW > 0 && newH > 0) {
          camera.aspect = newW / newH;
          camera.updateProjectionMatrix();
          renderer.setSize(newW, newH);
        }
      }
    });

    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      resizeObserver.disconnect();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [onSelectDepartment]);

  // Mode Switch Camera Transitions via GSAP
  const handleModeChange = (mode: 'CORE' | 'NODES' | 'RADAR') => {
    setViewMode(mode);
    if (!cameraRef.current) return;

    if (mode === 'CORE') {
      gsap.to(cameraRef.current.position, {
        x: 0,
        y: 2,
        z: 8.5,
        duration: 1.4,
        ease: 'power2.inOut',
      });
    } else if (mode === 'NODES') {
      gsap.to(cameraRef.current.position, {
        x: 4.5,
        y: 4.5,
        z: 6.5,
        duration: 1.4,
        ease: 'power2.inOut',
      });
    } else if (mode === 'RADAR') {
      gsap.to(cameraRef.current.position, {
        x: 0,
        y: 8.5,
        z: 0.5,
        duration: 1.4,
        ease: 'power2.inOut',
      });
    }
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] rounded-3xl overflow-hidden bg-white/[0.02] border border-white/10 backdrop-blur-2xl shadow-2xl flex flex-col justify-between p-4 sm:p-6 group">
      {/* 3D Canvas Host */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Top Header Overlay */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 backdrop-blur-md">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <span>Smart City 3D Nodal Core</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                LIVE 60 FPS
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Interactive 3D Grid • 7 Integrated Departments</p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="pointer-events-auto flex items-center gap-1 bg-black/40 backdrop-blur-xl p-1 rounded-xl border border-white/10 text-xs">
          <button
            onClick={() => handleModeChange('CORE')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'CORE'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Hologram Core
          </button>
          <button
            onClick={() => handleModeChange('NODES')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'NODES'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SLA Network
          </button>
          <button
            onClick={() => handleModeChange('RADAR')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'RADAR'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Top Radar
          </button>
        </div>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredNode && (
        <div className="absolute top-20 left-6 z-20 pointer-events-none bg-slate-950/90 border border-indigo-500/50 backdrop-blur-2xl p-3.5 rounded-2xl shadow-2xl max-w-xs animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold mb-1">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Department Node</span>
          </div>
          <p className="text-sm font-bold text-white">{hoveredNode.name}</p>
          <div className="flex items-center justify-between text-xs text-slate-400 mt-2 pt-2 border-t border-white/10">
            <span>Standard SLA:</span>
            <span className="font-mono text-emerald-400 font-bold">{hoveredNode.sla} Hours</span>
          </div>
          <p className="text-[10px] text-indigo-300 mt-1">Click node to filter complaints</p>
        </div>
      )}

      {/* Bottom Controls & Legend */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none pt-4 border-t border-white/10">
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            <span>AI Central Triage Engine</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Nodal Orbit Beacons</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Resolved Ticket Flux</span>
          </span>
        </div>

        <span className="text-[11px] text-slate-500 italic hidden sm:inline">
          Move mouse to steer camera • Click any department satellite to inspect
        </span>
      </div>
    </div>
  );
};
