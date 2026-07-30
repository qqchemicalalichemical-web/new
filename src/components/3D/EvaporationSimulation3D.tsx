import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Flame,
  Gauge,
  Droplet,
  Wind,
  Sliders,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  Info,
  Layers,
  Activity
} from 'lucide-react';

export const EvaporationSimulation3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation State Controls
  const [steamTemp, setSteamTemp] = useState<number>(120); // °C
  const [feedRate, setFeedRate] = useState<number>(8000); // kg/h
  const [feedConc, setFeedConc] = useState<number>(10); // % solute
  const [vacuumPress, setVacuumPress] = useState<number>(50); // kPa abs
  const [liquidLevelPct, setLiquidLevelPct] = useState<number>(55); // % of calandria height
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  // Calculated Real-Time Engineering Physics Parameters
  // Saturation temperature of water at operating vacuum pressure (approx Antoine equation)
  const tSatBoiling = 100 * Math.pow(vacuumPress / 101.325, 0.27);
  const tempDiff = Math.max(0, steamTemp - tSatBoiling);
  
  // Heat latent of vaporization ~ 2260 kJ/kg
  const latentHeat = 2260; 
  // Evaporation Rate V (kg/h) proportional to temperature difference & heating surface area
  const U = 1800; // W/m2.K heat transfer coefficient
  const areaM2 = 25; // m2 calandria surface
  const qKw = (U * areaM2 * tempDiff) / 1000; // kW
  const maxPossibleVaporKgh = (qKw * 3600) / latentHeat;
  
  // Actual Vapor Rate (capped by feed liquid available)
  const actualVaporKgh = Math.min(feedRate * 0.85, maxPossibleVaporKgh);
  const productRateKgh = Math.max(0, feedRate - actualVaporKgh);
  const productConc = productRateKgh > 0 ? Math.min(75, (feedRate * feedConc) / productRateKgh) : 75;
  const economyFactor = (actualVaporKgh / (actualVaporKgh * 1.05)).toFixed(2);
  const vaporVelMps = (actualVaporKgh / (3600 * 0.8)).toFixed(2);

  // Three.js Scene References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const liquidMeshRef = useRef<THREE.Mesh | null>(null);
  const vaporParticlesRef = useRef<THREE.Points | null>(null);
  const bubbleParticlesRef = useRef<THREE.Points | null>(null);
  const downtakeParticlesRef = useRef<THREE.Points | null>(null);
  const calandriaTubesRef = useRef<THREE.Group | null>(null);
  const isPlayingRef = useRef<boolean>(true);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Three.js Setup & Animation Loop
  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(5.5, 2.5, 7.5);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xf59e0b, 1.4); // Steam amber light
    dirLight1.position.set(10, 15, 8);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x0284c7, 1.0); // Cyan coolant light
    dirLight2.position.set(-10, -8, -8);
    scene.add(dirLight2);

    // Floor Grid
    const grid = new THREE.GridHelper(12, 12, 0x334155, 0x1e293b);
    grid.position.y = -3.2;
    scene.add(grid);

    // Root Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // =========================================================================
    // EVAPORATOR 3D GEOMETRY CONSTRUCTION
    // =========================================================================

    // 1. Transparent Glass Shell (Disengagement Dome & Calandria Body)
    const shellGeo = new THREE.CylinderGeometry(1.4, 1.4, 4.6, 32);
    const shellMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.3,
      transmission: 0.85,
      roughness: 0.1,
      metalness: 0.1
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    shellMesh.name = 'جسم المبخر الزجاجي (Vapor Disengagement Vessel)';
    rootGroup.add(shellMesh);

    // 2. Bottom Conical Discharge Section
    const coneGeo = new THREE.CylinderGeometry(1.4, 0.35, 1.2, 32);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const coneMesh = new THREE.Mesh(coneGeo, coneMat);
    coneMesh.position.y = -2.9;
    coneMesh.name = 'القمع السفلي لتصريف المحلول (Concentrated Liquid Outlet Cone)';
    rootGroup.add(coneMesh);

    // 3. Top Overhead Vapor Duct & Elbow Pipe
    const ductGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.4, 24);
    const ductMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.85, roughness: 0.2 });
    const ductMesh = new THREE.Mesh(ductGeo, ductMat);
    ductMesh.position.y = 3.0;
    ductMesh.name = 'أنبوب خروج البخار العلوي (Overhead Vapor Duct)';
    rootGroup.add(ductMesh);

    // 4. Demister Pad Mesh at Vapor Outlet
    const demisterGeo = new THREE.CylinderGeometry(1.35, 1.35, 0.2, 32);
    const demisterMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, wireframe: true });
    const demisterMesh = new THREE.Mesh(demisterGeo, demisterMat);
    demisterMesh.position.y = 1.7;
    demisterMesh.name = 'مانع رذاذ القطرات Demister Mesh';
    rootGroup.add(demisterMesh);

    // 5. Steam Inlet Nozzle & Chest Ring
    const steamNozzleGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.5, 16);
    steamNozzleGeo.rotateZ(Math.PI / 2);
    const steamNozzleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 });
    const steamNozzle = new THREE.Mesh(steamNozzleGeo, steamNozzleMat);
    steamNozzle.position.set(-1.5, -1.0, 0);
    steamNozzle.name = 'أنبوب إمداد البخار المشبع (Heating Steam Inlet Pipe)';
    rootGroup.add(steamNozzle);

    // 6. Condensate Drain Nozzle
    const condNozzleGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 16);
    condNozzleGeo.rotateZ(Math.PI / 2);
    const condNozzleMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8 });
    const condNozzle = new THREE.Mesh(condNozzleGeo, condNozzleMat);
    condNozzle.position.set(1.4, -1.8, 0);
    condNozzle.name = 'مخرج متكثف البخار (Steam Condensate Drain)';
    rootGroup.add(condNozzle);

    // 7. Feed Inlet Pipe
    const feedNozzleGeo = new THREE.CylinderGeometry(0.14, 0.14, 1.4, 16);
    feedNozzleGeo.rotateZ(Math.PI / 2);
    const feedNozzleMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8 });
    const feedNozzle = new THREE.Mesh(feedNozzleGeo, feedNozzleMat);
    feedNozzle.position.set(1.4, 0.1, 0);
    feedNozzle.name = 'مأنبوب تغذية السائل الخام (Raw Feed Inlet Pipe)';
    rootGroup.add(feedNozzle);

    // 8. Calandria Vertical Heating Tube Bundle
    const calandriaGroup = new THREE.Group();
    const tubeCount = 18;
    for (let i = 0; i < tubeCount; i++) {
      const angle = (i / tubeCount) * Math.PI * 2;
      const radius = 0.92;
      const tubeGeo = new THREE.CylinderGeometry(0.075, 0.075, 2.0, 16);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.9,
        roughness: 0.2
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      tubeMesh.position.set(Math.cos(angle) * radius, -1.0, Math.sin(angle) * radius);
      tubeMesh.name = `أنابيب التسخين العمودية (Calandria Tube #${i + 1})`;
      calandriaGroup.add(tubeMesh);
    }
    calandriaTubesRef.current = calandriaGroup;
    rootGroup.add(calandriaGroup);

    // 9. Central Downtake Recirculation Pipe
    const downGeo = new THREE.CylinderGeometry(0.45, 0.45, 2.0, 32);
    const downMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.85, roughness: 0.3 });
    const downtakeMesh = new THREE.Mesh(downGeo, downMat);
    downtakeMesh.position.y = -1.0;
    downtakeMesh.name = 'أنبوب التدوير المركزي الهابط (Central Downtake Pipe)';
    rootGroup.add(downtakeMesh);

    // 10. Dynamic Boiling Liquid Pool Mesh (Liquid Level Height Controlled)
    const liquidGeo = new THREE.CylinderGeometry(1.36, 1.36, 1.0, 32);
    const liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.75,
      transmission: 0.6,
      roughness: 0.1
    });
    const liquidMesh = new THREE.Mesh(liquidGeo, liquidMat);
    liquidMesh.position.y = -1.5;
    liquidMesh.name = 'مستوى السائل المغلي المركز (Boiling Liquid Pool Level)';
    liquidMeshRef.current = liquidMesh;
    rootGroup.add(liquidMesh);

    // 11. Rising Vapor Particles
    const pCount = 120;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 2.2;
      pPos[i + 1] = -0.5 + Math.random() * 3.8;
      pPos[i + 2] = (Math.random() - 0.5) * 2.2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 0.1,
      transparent: true,
      opacity: 0.85
    });
    const vaporParticles = new THREE.Points(pGeo, pMat);
    vaporParticlesRef.current = vaporParticles;
    rootGroup.add(vaporParticles);

    // 12. Boiling Micro-Bubbles inside Liquid Pool
    const bCount = 60;
    const bGeo = new THREE.BufferGeometry();
    const bPos = new Float32Array(bCount * 3);
    for (let i = 0; i < bCount * 3; i += 3) {
      bPos[i] = (Math.random() - 0.5) * 2.0;
      bPos[i + 1] = -2.0 + Math.random() * 1.5;
      bPos[i + 2] = (Math.random() - 0.5) * 2.0;
    }
    bGeo.setAttribute('position', new THREE.BufferAttribute(bPos, 3));
    const bMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.08,
      transparent: true,
      opacity: 0.9
    });
    const bubbleParticles = new THREE.Points(bGeo, bMat);
    bubbleParticlesRef.current = bubbleParticles;
    rootGroup.add(bubbleParticles);

    // 13. Central Downtake Recirculation Flow Particles
    const dCount = 30;
    const dGeo = new THREE.BufferGeometry();
    const dPos = new Float32Array(dCount * 3);
    for (let i = 0; i < dCount * 3; i += 3) {
      dPos[i] = (Math.random() - 0.5) * 0.7;
      dPos[i + 1] = -0.1 - Math.random() * 1.8;
      dPos[i + 2] = (Math.random() - 0.5) * 0.7;
    }
    dGeo.setAttribute('position', new THREE.BufferAttribute(dPos, 3));
    const dMat = new THREE.PointsMaterial({ color: 0x0284c7, size: 0.07, transparent: true, opacity: 0.8 });
    const downtakeParticles = new THREE.Points(dGeo, dMat);
    downtakeParticlesRef.current = downtakeParticles;
    rootGroup.add(downtakeParticles);

    // Mouse Controls for 3D Orbiting
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMousePos.x;
      const deltaY = e.clientY - prevMousePos.y;

      rootGroup.rotation.y += deltaX * 0.008;
      rootGroup.rotation.x += deltaY * 0.008;

      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Raycaster for Click Inspection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onClick = (e: MouseEvent) => {
      const rect = domElem.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(rootGroup.children, true);
      if (intersects.length > 0) {
        const hitName = intersects[0].object.name;
        if (hitName) {
          setSelectedComponent(hitName);
        }
      }
    };
    domElem.addEventListener('click', onClick);

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (isPlayingRef.current) {
        // Slow auto rotation
        rootGroup.rotation.y += 0.003;

        // 1. Animate Rising Vapor Particles
        if (vaporParticlesRef.current) {
          const positions = vaporParticlesRef.current.geometry.attributes.position.array as Float32Array;
          const vSpeed = 0.015 + (actualVaporKgh / 10000) * 0.03;
          for (let i = 1; i < positions.length; i += 3) {
            positions[i] += vSpeed;
            if (positions[i] > 3.2) {
              positions[i] = liquidMeshRef.current ? liquidMeshRef.current.position.y + 0.2 : -0.5;
            }
          }
          vaporParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // 2. Animate Boiling Micro-bubbles in Liquid Pool
        if (bubbleParticlesRef.current) {
          const bPositions = bubbleParticlesRef.current.geometry.attributes.position.array as Float32Array;
          const bSpeed = 0.008 + tempDiff * 0.0003;
          for (let i = 1; i < bPositions.length; i += 3) {
            bPositions[i] += bSpeed;
            const topBoundary = liquidMeshRef.current ? liquidMeshRef.current.position.y + 0.4 : 0.2;
            if (bPositions[i] > topBoundary) {
              bPositions[i] = -2.4;
            }
          }
          bubbleParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }

        // 3. Animate Central Downtake Recirculation Flow
        if (downtakeParticlesRef.current) {
          const dPositions = downtakeParticlesRef.current.geometry.attributes.position.array as Float32Array;
          for (let i = 1; i < dPositions.length; i += 3) {
            dPositions[i] -= 0.02;
            if (dPositions[i] < -2.2) {
              dPositions[i] = 0.0;
            }
          }
          downtakeParticlesRef.current.geometry.attributes.position.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('click', onClick);
      if (containerRef.current && domElem) {
        containerRef.current.removeChild(domElem);
      }
    };
  }, []);

  // Update Dynamic Visual Props (Liquid Level & Calandria Glowing Color)
  useEffect(() => {
    // 1. Scale Liquid Level Mesh
    if (liquidMeshRef.current) {
      const heightVal = (liquidLevelPct / 100) * 2.2; // 0.2m to 2.2m
      liquidMeshRef.current.scale.set(1, heightVal, 1);
      liquidMeshRef.current.position.y = -2.0 + heightVal / 2;
    }

    // 2. Heating Tube Glow Color based on Steam Temperature
    if (calandriaTubesRef.current) {
      const heatFactor = Math.min(1, Math.max(0, (steamTemp - 90) / 60)); // 90C to 150C
      const r = 0.95;
      const g = 0.3 + heatFactor * 0.5;
      const b = 0.1;

      calandriaTubesRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh) {
          (child.material as THREE.MeshStandardMaterial).color.setRGB(r, g, b);
        }
      });
    }
  }, [liquidLevelPct, steamTemp]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 space-y-5 font-mono dir-rtl text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3 gap-3">
        <div>
          <h2 className="text-base font-bold text-cyan-400 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            محاكي التبخير الهندسي 3D وتتبع مستوى السائل وتصاعد البخار (3D Evaporator Simulator)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            محاكاة تفاعلية لحساب معدل التبخير V، اقتصادية البخار، وتفاعل مستوى السائل داخل مبخر الـ Calandria
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center gap-1.5"
          >
            {isPlaying ? <Pause className="w-4 h-4 text-amber-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
            <span>{isPlaying ? 'إيقاف الحركة' : 'تشغيل الحركة'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Controls & Parameters Sidebar (5 Columns) */}
        <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4 text-xs">
          <h3 className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1.5 border-b border-slate-800 pb-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            المتغيرات التشغيلية للمبخر (Process Parameters):
          </h3>

          {/* Steam Temperature Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                درجة حرارة البخار المشبع (Steam Temp Ts):
              </span>
              <span className="text-amber-400 font-bold">{steamTemp} °C</span>
            </div>
            <input
              type="range"
              min="90"
              max="160"
              step="1"
              value={steamTemp}
              onChange={e => setSteamTemp(+e.target.value)}
              className="w-full accent-amber-500 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>90 °C (بخار منخفض)</span>
              <span>160 °C (بخار مرتفع الضغط)</span>
            </div>
          </div>

          {/* Liquid Feed Flow Rate Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300 flex items-center gap-1">
                <Droplet className="w-3.5 h-3.5 text-cyan-400" />
                معدل تغذية السائل (Raw Feed F):
              </span>
              <span className="text-cyan-400 font-bold">{feedRate.toLocaleString()} kg/h</span>
            </div>
            <input
              type="range"
              min="1000"
              max="20000"
              step="500"
              value={feedRate}
              onChange={e => setFeedRate(+e.target.value)}
              className="w-full accent-cyan-500 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
          </div>

          {/* Vacuum Pressure Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
                الضغط المطلق في غرفة البخار (Vacuum P):
              </span>
              <span className="text-purple-400 font-bold">{vacuumPress} kPa</span>
            </div>
            <input
              type="range"
              min="15"
              max="101"
              step="1"
              value={vacuumPress}
              onChange={e => setVacuumPress(+e.target.value)}
              className="w-full accent-purple-500 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>15 kPa (تفريغ قوي)</span>
              <span>101 kPa (ضغط جوي)</span>
            </div>
          </div>

          {/* Liquid Level Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                ارتفاع مستوى السائل المغلي (Liquid Level):
              </span>
              <span className="text-emerald-400 font-bold">{liquidLevelPct}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              step="5"
              value={liquidLevelPct}
              onChange={e => setLiquidLevelPct(+e.target.value)}
              className="w-full accent-emerald-500 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
          </div>

          {/* Concentration Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-bold">
              <span className="text-slate-300">تركيز المواد الصلبة في التغذية (Feed x_f):</span>
              <span className="text-slate-200 font-bold">{feedConc}%</span>
            </div>
            <input
              type="range"
              min="2"
              max="30"
              step="1"
              value={feedConc}
              onChange={e => setFeedConc(+e.target.value)}
              className="w-full accent-blue-500 bg-slate-800 rounded h-1.5 cursor-pointer"
            />
          </div>

          {/* Telemetry Real-time Calculation Panel */}
          <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 mt-2">
            <h4 className="text-[11px] font-bold text-cyan-300 border-b border-slate-800 pb-1 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              قراءات الأداء الحراري والتبخير اللحظي:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">معدل التبخير V:</span>
                <span className="font-bold text-amber-400">{actualVaporKgh.toFixed(0)} kg/h</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">تركيز المنتج النهائي x_p:</span>
                <span className="font-bold text-emerald-400">{productConc.toFixed(1)} %</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">الحرارة المنقولة Q:</span>
                <span className="font-bold text-purple-300">{qKw.toFixed(0)} kW</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">درجة غليان السائل T_boil:</span>
                <span className="font-bold text-cyan-300">{tSatBoiling.toFixed(1)} °C</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3D Viewport Stage & Inspector (7 Columns) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="relative w-full h-[420px] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-inner">
            <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

            {/* Floating Overlay Controls Info */}
            <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-300 pointer-events-none flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>اسحب بالفأرة للتدوير 3D | انقر على الأجزاء لمعاينتها</span>
            </div>

            {/* Selected Component Tooltip Bar */}
            {selectedComponent && (
              <div className="absolute bottom-3 right-3 left-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>المكون المحدد: <strong className="text-white">{selectedComponent}</strong></span>
                </div>
                <button
                  onClick={() => setSelectedComponent(null)}
                  className="text-slate-400 hover:text-white font-bold text-xs"
                >
                  إغلاق
                </button>
              </div>
            )}
          </div>

          {/* Quick Legend Bar */}
          <div className="flex flex-wrap items-center justify-between text-[11px] bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                بخار التسخين (Steam)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                السائل المغلي (Boiling Pool)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
                أنابيب Calandria
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">McCabe Evaporator Design Spec</span>
          </div>
        </div>
      </div>
    </div>
  );
};
