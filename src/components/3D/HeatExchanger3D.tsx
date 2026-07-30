import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ExchangerType } from '../../types';
import { Play, Pause, RotateCcw, Eye, Layers, FastForward } from 'lucide-react';

interface HeatExchanger3DProps {
  exchangerType: ExchangerType;
  flowDirection: 'counter' | 'parallel' | 'shell12';
}

export const HeatExchanger3D: React.FC<HeatExchanger3DProps> = ({
  exchangerType,
  flowDirection
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [isTransparentShell, setIsTransparentShell] = useState(true);
  const [isExploded, setIsExploded] = useState(false);
  const [activeModel, setActiveModel] = useState<ExchangerType>(exchangerType);

  useEffect(() => {
    setActiveModel(exchangerType);
  }, [exchangerType]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  // Group references for explosion view & particles animation
  const hotParticlesRef = useRef<THREE.InstancedMesh | null>(null);
  const coldParticlesRef = useRef<THREE.InstancedMesh | null>(null);
  const shellGroupRef = useRef<THREE.Group | null>(null);
  const tubeBundleGroupRef = useRef<THREE.Group | null>(null);
  const baffleGroupRef = useRef<THREE.Group | null>(null);
  const plateGroupRef = useRef<THREE.Group | null>(null);

  // Particle position states
  const numParticles = 120;
  const hotParticleData = useRef<Array<{ x: number; y: number; z: number; speed: number; phase: number }>>([]);
  const coldParticleData = useRef<Array<{ x: number; y: number; z: number; speed: number; phase: number }>>([]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 400;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0e1a28);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(12, 8, 16);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(15, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x4fb3d9, 0.6);
    dirLight2.position.set(-15, -10, -15);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xe08238, 1, 30);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // Grid helper
    const grid = new THREE.GridHelper(30, 30, 0x24405f, 0x1b2f4a);
    grid.position.y = -5;
    scene.add(grid);

    // 5. Build 3D Models
    buildExchangerModel(scene, activeModel, isTransparentShell);

    // 6. Simple Orbit Controls implementation (mouse drag & scroll)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = new THREE.Spherical().setFromVector3(camera.position);

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !cameraRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      spherical.theta -= deltaX * 0.005;
      spherical.phi -= deltaY * 0.005;
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));

      cameraRef.current.position.setFromSpherical(spherical);
      cameraRef.current.lookAt(0, 0, 0);

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (!cameraRef.current) return;
      spherical.radius += e.deltaY * 0.01;
      spherical.radius = Math.max(5, Math.min(40, spherical.radius));
      cameraRef.current.position.setFromSpherical(spherical);
      cameraRef.current.lookAt(0, 0, 0);
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domEl.addEventListener('wheel', onWheel, { passive: true });

    // 7. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (isPlaying) {
        // Animate particles along tube / shell paths
        updateParticles(delta * speed, flowDirection, activeModel);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight || 400;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domEl.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [activeModel, isTransparentShell, flowDirection]);

  // Handle explosion view toggle
  useEffect(() => {
    if (!shellGroupRef.current || !baffleGroupRef.current || !tubeBundleGroupRef.current) return;

    if (isExploded) {
      shellGroupRef.current.position.y = 4;
      baffleGroupRef.current.position.z = -3;
      tubeBundleGroupRef.current.position.y = -2;
    } else {
      shellGroupRef.current.position.set(0, 0, 0);
      baffleGroupRef.current.position.set(0, 0, 0);
      tubeBundleGroupRef.current.position.set(0, 0, 0);
    }
  }, [isExploded]);

  const buildExchangerModel = (scene: THREE.Scene, modelType: ExchangerType, transparentShell: boolean) => {
    // Clear old elements
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }

    // Re-add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(30, 30, 0x24405f, 0x1b2f4a);
    grid.position.y = -5;
    scene.add(grid);

    if (modelType === 'plate_and_frame') {
      buildPlateExchanger(scene);
    } else if (modelType === 'double_pipe') {
      buildDoublePipeExchanger(scene, transparentShell);
    } else {
      // Default: Shell and Tube
      buildShellAndTubeExchanger(scene, transparentShell);
    }
  };

  const buildShellAndTubeExchanger = (scene: THREE.Scene, transparentShell: boolean) => {
    const shellGroup = new THREE.Group();
    const tubeBundleGroup = new THREE.Group();
    const baffleGroup = new THREE.Group();
    shellGroupRef.current = shellGroup;
    tubeBundleGroupRef.current = tubeBundleGroup;
    baffleGroupRef.current = baffleGroup;

    // Outer Shell Cylinder
    const shellGeo = new THREE.CylinderGeometry(2.5, 2.5, 10, 32, 1, true);
    const shellMat = new THREE.MeshStandardMaterial({
      color: 0x335577,
      metalness: 0.8,
      roughness: 0.2,
      transparent: transparentShell,
      opacity: transparentShell ? 0.35 : 0.9,
      side: THREE.DoubleSide
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.rotation.z = Math.PI / 2;
    shellGroup.add(shellMesh);

    // Shell Nozzles (Inlet/Outlet)
    const nozzleMat = new THREE.MeshStandardMaterial({ color: 0x4fb3d9, metalness: 0.7 });

    const inletNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16), nozzleMat);
    inletNozzle.position.set(-3.5, 2.8, 0);
    shellGroup.add(inletNozzle);

    const outletNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 1.5, 16), nozzleMat);
    outletNozzle.position.set(3.5, -2.8, 0);
    shellGroup.add(outletNozzle);

    // Tube Sheets (Header Plates at both ends)
    const tubeSheetGeo = new THREE.CylinderGeometry(2.6, 2.6, 0.4, 32);
    const tubeSheetMat = new THREE.MeshStandardMaterial({ color: 0x8ea3bb, metalness: 0.9 });

    const sheetLeft = new THREE.Mesh(tubeSheetGeo, tubeSheetMat);
    sheetLeft.rotation.z = Math.PI / 2;
    sheetLeft.position.x = -5;
    shellGroup.add(sheetLeft);

    const sheetRight = new THREE.Mesh(tubeSheetGeo, tubeSheetMat);
    sheetRight.rotation.z = Math.PI / 2;
    sheetRight.position.x = 5;
    shellGroup.add(sheetRight);

    // Tube Bundle (Inner tubes arranged in ring)
    const tubeGeo = new THREE.CylinderGeometry(0.12, 0.12, 10, 16);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0xdd7733, metalness: 0.8, roughness: 0.3 });

    const numTubesInRing = 16;
    for (let i = 0; i < numTubesInRing; i++) {
      const angle = (i / numTubesInRing) * Math.PI * 2;
      const radius = 1.4;
      const y = Math.sin(angle) * radius;
      const z = Math.cos(angle) * radius;

      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.rotation.z = Math.PI / 2;
      tube.position.set(0, y, z);
      tubeBundleGroup.add(tube);
    }

    // Inner center tube
    const centerTube = new THREE.Mesh(tubeGeo, tubeMat);
    centerTube.rotation.z = Math.PI / 2;
    tubeBundleGroup.add(centerTube);

    // Segmental Baffles along shell
    const baffleGeo = new THREE.CylinderGeometry(2.3, 2.3, 0.1, 32, 1, false, 0, Math.PI * 1.5);
    const baffleMat = new THREE.MeshStandardMaterial({ color: 0x5fbf8f, metalness: 0.6, side: THREE.DoubleSide });

    for (let i = -3; i <= 3; i += 2) {
      const baffle = new THREE.Mesh(baffleGeo, baffleMat);
      baffle.rotation.z = Math.PI / 2;
      baffle.rotation.x = i % 4 === 0 ? 0 : Math.PI;
      baffle.position.x = i;
      baffleGroup.add(baffle);
    }

    scene.add(shellGroup);
    scene.add(tubeBundleGroup);
    scene.add(baffleGroup);

    // Instantiate Hot Fluid Particles (Inside Tubes - Red/Orange)
    buildParticleSystems(scene, 'shell_and_tube');
  };

  const buildDoublePipeExchanger = (scene: THREE.Scene, transparentShell: boolean) => {
    const mainGroup = new THREE.Group();
    shellGroupRef.current = mainGroup;

    // Outer Pipe (Annulus for cold fluid)
    const outerGeo = new THREE.CylinderGeometry(1.8, 1.8, 12, 32, 1, true);
    const outerMat = new THREE.MeshStandardMaterial({
      color: 0x4fb3d9,
      metalness: 0.7,
      transparent: transparentShell,
      opacity: transparentShell ? 0.4 : 0.9,
      side: THREE.DoubleSide
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    outerMesh.rotation.z = Math.PI / 2;
    mainGroup.add(outerMesh);

    // Inner Pipe (Hot fluid stream)
    const innerGeo = new THREE.CylinderGeometry(0.8, 0.8, 13, 32);
    const innerMat = new THREE.MeshStandardMaterial({ color: 0xe08238, metalness: 0.9, roughness: 0.2 });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    innerMesh.rotation.z = Math.PI / 2;
    mainGroup.add(innerMesh);

    scene.add(mainGroup);
    buildParticleSystems(scene, 'double_pipe');
  };

  const buildPlateExchanger = (scene: THREE.Scene) => {
    const plateGroup = new THREE.Group();
    plateGroupRef.current = plateGroup;

    const numPlates = 14;
    const plateWidth = 4;
    const plateHeight = 6;
    const plateThickness = 0.15;

    for (let i = 0; i < numPlates; i++) {
      const isHotChannel = i % 2 === 0;
      const mat = new THREE.MeshStandardMaterial({
        color: isHotChannel ? 0xe08238 : 0x4fb3d9,
        metalness: 0.8,
        roughness: 0.3
      });

      const plateGeo = new THREE.BoxGeometry(plateWidth, plateHeight, plateThickness);
      const plate = new THREE.Mesh(plateGeo, mat);
      plate.position.z = (i - numPlates / 2) * 0.4;
      plateGroup.add(plate);
    }

    // Heavy End Compression Plates
    const endPlateMat = new THREE.MeshStandardMaterial({ color: 0x1b2f4a, metalness: 0.9 });
    const endLeft = new THREE.Mesh(new THREE.BoxGeometry(plateWidth + 0.5, plateHeight + 0.5, 0.5), endPlateMat);
    endLeft.position.z = (-numPlates / 2 - 1) * 0.4;
    plateGroup.add(endLeft);

    const endRight = new THREE.Mesh(new THREE.BoxGeometry(plateWidth + 0.5, plateHeight + 0.5, 0.5), endPlateMat);
    endRight.position.z = (numPlates / 2 + 1) * 0.4;
    plateGroup.add(endRight);

    scene.add(plateGroup);
    buildParticleSystems(scene, 'plate_and_frame');
  };

  const buildParticleSystems = (scene: THREE.Scene, modelType: ExchangerType) => {
    const hotGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const hotMat = new THREE.MeshBasicMaterial({ color: 0xff4411 });
    const hotMesh = new THREE.InstancedMesh(hotGeo, hotMat, numParticles);

    const coldGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const coldMat = new THREE.MeshBasicMaterial({ color: 0x00ccff });
    const coldMesh = new THREE.InstancedMesh(coldGeo, coldMat, numParticles);

    hotParticlesRef.current = hotMesh;
    coldParticlesRef.current = coldMesh;

    hotParticleData.current = [];
    coldParticleData.current = [];

    const dummy = new THREE.Object3D();

    for (let i = 0; i < numParticles; i++) {
      // Initialize random positions
      const hData = {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 1.5,
        z: (Math.random() - 0.5) * 1.5,
        speed: 2 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      };
      hotParticleData.current.push(hData);

      dummy.position.set(hData.x, hData.y, hData.z);
      dummy.updateMatrix();
      hotMesh.setMatrixAt(i, dummy.matrix);

      const cData = {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 2.2,
        z: (Math.random() - 0.5) * 2.2,
        speed: 1.5 + Math.random() * 2,
        phase: Math.random() * Math.PI * 2
      };
      coldParticleData.current.push(cData);

      dummy.position.set(cData.x, cData.y, cData.z);
      dummy.updateMatrix();
      coldMesh.setMatrixAt(i, dummy.matrix);
    }

    hotMesh.instanceMatrix.needsUpdate = true;
    coldMesh.instanceMatrix.needsUpdate = true;

    scene.add(hotMesh);
    scene.add(coldMesh);
  };

  const updateParticles = (dt: number, flowDir: string, modelType: ExchangerType) => {
    if (!hotParticlesRef.current || !coldParticlesRef.current) return;

    const dummy = new THREE.Object3D();
    const isCounter = flowDir !== 'parallel';

    // 1. Hot Fluid Stream (Left to Right)
    for (let i = 0; i < numParticles; i++) {
      const p = hotParticleData.current[i];
      p.x += dt * p.speed;
      if (p.x > 5) p.x = -5;

      dummy.position.set(p.x, p.y + Math.sin(p.x + p.phase) * 0.05, p.z + Math.cos(p.x + p.phase) * 0.05);
      dummy.updateMatrix();
      hotParticlesRef.current.setMatrixAt(i, dummy.matrix);
    }
    hotParticlesRef.current.instanceMatrix.needsUpdate = true;

    // 2. Cold Fluid Stream (Right to Left if Counter, Left to Right if Parallel)
    for (let i = 0; i < numParticles; i++) {
      const p = coldParticleData.current[i];
      if (isCounter) {
        p.x -= dt * p.speed;
        if (p.x < -5) p.x = 5;
      } else {
        p.x += dt * p.speed;
        if (p.x > 5) p.x = -5;
      }

      dummy.position.set(p.x, p.y + Math.cos(p.x * 2 + p.phase) * 0.15, p.z + Math.sin(p.x * 2 + p.phase) * 0.15);
      dummy.updateMatrix();
      coldParticlesRef.current.setMatrixAt(i, dummy.matrix);
    }
    coldParticlesRef.current.instanceMatrix.needsUpdate = true;
  };

  return (
    <div className="relative w-full h-[450px] bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 right-4 left-4 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-lg border border-slate-700/80 shadow-lg text-sm">
        {/* Model Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-md border border-slate-800">
          <button
            onClick={() => setActiveModel('shell_and_tube')}
            className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
              activeModel === 'shell_and_tube'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            قشرة وأنبوب (Shell & Tube)
          </button>
          <button
            onClick={() => setActiveModel('double_pipe')}
            className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
              activeModel === 'double_pipe'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            أنبوب مزدوج (Double Pipe)
          </button>
          <button
            onClick={() => setActiveModel('plate_and_frame')}
            className={`px-3 py-1.5 rounded-md font-medium text-xs transition ${
              activeModel === 'plate_and_frame'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ألواح (Plate)
          </button>
        </div>

        {/* Action Toggles */}
        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition"
            title={isPlaying ? 'إيقاف الحركة' : 'تشغيل الحركة'}
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
          </button>

          {/* Speed Control */}
          <button
            onClick={() => setSpeed(s => (s >= 2.5 ? 0.5 : s + 0.5))}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs rounded-md border border-slate-700"
            title="سرعة محاكاة الجريان"
          >
            <FastForward className="w-3.5 h-3.5 text-cyan-400" />
            {speed}x
          </button>

          {/* Transparent Shell Toggle */}
          <button
            onClick={() => setIsTransparentShell(!isTransparentShell)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border transition ${
              isTransparentShell
                ? 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="إظهار الأجزاء الداخلية بشفافية"
          >
            <Eye className="w-3.5 h-3.5" />
            شفافية الغلاف
          </button>

          {/* Explosion View Toggle */}
          <button
            onClick={() => setIsExploded(!isExploded)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium border transition ${
              isExploded
                ? 'bg-amber-950/80 border-amber-500/50 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="تفكيك مكونات المبادل لتعليم الطلاب"
          >
            <Layers className="w-3.5 h-3.5" />
            عرض تفكيكي
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-sm px-4 py-2.5 rounded-lg border border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50 animate-pulse" />
            <span>السائل الساخن (Inside Tubes)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50 animate-pulse" />
            <span>السائل البارد (Shell Side)</span>
          </div>
        </div>
        <div className="text-slate-400 font-mono text-[11px] hidden sm:block">
          اسحب بالماوس للتدوير 360° | استخدم التكبير (Scroll) للتكبير والتقريب
        </div>
      </div>
    </div>
  );
};
