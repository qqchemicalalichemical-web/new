import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Eye, Info, Layers, Sparkles } from 'lucide-react';

interface Modular3DViewerProps {
  moduleType: string;
  titleAr: string;
  subTitleAr?: string;
  componentList?: Array<{ nameAr: string; nameEn: string; descAr: string }>;
}

export const Modular3DViewer: React.FC<Modular3DViewerProps> = ({
  moduleType,
  titleAr,
  subTitleAr,
  componentList = []
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d); // Slate-950 background

    // 2. Camera Setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(6, 4, 8);
    camera.lookAt(0, 0, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Clear previous canvas
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xf59e0b, 1.2); // Warm Amber
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.8); // Cool Cyan
    dirLight2.position.set(-10, -10, -10);
    scene.add(dirLight2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(14, 14, 0x334155, 0x1e293b);
    gridHelper.position.y = -2;
    scene.add(gridHelper);

    // Main 3D Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Animation references
    let particlesGroup: THREE.Points | null = null;
    let rotatingParts: THREE.Object3D[] = [];
    let particleSpeedY = 0.02;

    const mType = moduleType.toLowerCase();

    // =========================================================================
    // 3D GEOMETRY BUILDERS FOR EACH SPECIFIC ENGINEERING MODULE
    // =========================================================================

    if (mType.includes('distillation')) {
      // 1. DISTILLATION COLUMN (McCabe-Thiele Unit)
      const colGeo = new THREE.CylinderGeometry(1.2, 1.2, 5, 32);
      const colMat = new THREE.MeshPhysicalMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        transmission: 0.8
      });
      const column = new THREE.Mesh(colGeo, colMat);
      column.name = 'برج التقطير (Distillation Column Shell)';
      modelGroup.add(column);

      // Trays & Downcomers
      for (let i = -2; i <= 2; i += 0.8) {
        const trayGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.08, 32);
        const trayMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
        const tray = new THREE.Mesh(trayGeo, trayMat);
        tray.position.y = i;
        tray.name = `صينية تقطير (Tray #${Math.round(i + 3)})`;
        modelGroup.add(tray);
      }

      // Reboiler at bottom
      const rebGeo = new THREE.SphereGeometry(1.0, 32, 16);
      const rebMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.5, roughness: 0.2 });
      const reboiler = new THREE.Mesh(rebGeo, rebMat);
      reboiler.position.set(-2.2, -2.5, 0);
      reboiler.name = 'الغلاية السفلية (Reboiler Kettle)';
      modelGroup.add(reboiler);

      // Overhead Condenser
      const condGeo = new THREE.CylinderGeometry(0.7, 0.7, 2, 32);
      condGeo.rotateZ(Math.PI / 2);
      const condMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.7 });
      const condenser = new THREE.Mesh(condGeo, condMat);
      condenser.position.set(2.2, 2.5, 0);
      condenser.name = 'المكثف العلوي (Overhead Condenser)';
      modelGroup.add(condenser);

      // FEED STREAM PIPE (Orange/Red Pipe entering middle stage)
      const feedPipeGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.2, 16);
      feedPipeGeo.rotateZ(Math.PI / 2);
      const feedPipeMat = new THREE.MeshStandardMaterial({ color: 0xf97316, metalness: 0.8 });
      const feedPipe = new THREE.Mesh(feedPipeGeo, feedPipeMat);
      feedPipe.position.set(-1.8, 0, 0);
      feedPipe.name = 'أنبوب الـ Feed (Feed Inlet Stream Pipe)';
      modelGroup.add(feedPipe);

      // REFLUX STREAM PIPE (Cyan/Blue recirculation line from condenser to top tray)
      const refluxPipeGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.4, 16);
      refluxPipeGeo.rotateZ(Math.PI / 2);
      const refluxPipeMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8 });
      const refluxPipe = new THREE.Mesh(refluxPipeGeo, refluxPipeMat);
      refluxPipe.position.set(1.4, 2.2, 0);
      refluxPipe.name = 'خط الـ Reflux (Recirculating Reflux Stream)';
      modelGroup.add(refluxPipe);

      // Dynamic Vapor Stream (Rising Yellow/Amber Particles)
      const pCount = 80;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 1.6;
        pPos[i + 1] = (Math.random() - 0.5) * 4.2;
        pPos[i + 2] = (Math.random() - 0.5) * 1.6;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xfbbf24, size: 0.1, transparent: true, opacity: 0.85 });
      particlesGroup = new THREE.Points(pGeo, pMat);
      modelGroup.add(particlesGroup);
    } else if (mType.includes('ion_exchange')) {
      // ION EXCHANGE COLUMN WITH RESIN BEADS
      const colGeo = new THREE.CylinderGeometry(1.3, 1.3, 5.0, 32);
      const colMat = new THREE.MeshPhysicalMaterial({ color: 0xa855f7, transparent: true, opacity: 0.3, transmission: 0.85 });
      const col = new THREE.Mesh(colGeo, colMat);
      col.name = 'عمود التبادل الأيوني (Ion Exchange Vessel)';
      modelGroup.add(col);

      // Resin Bead Bed (Spherical beads)
      for (let b = 0; b < 60; b++) {
        const beadGeo = new THREE.SphereGeometry(0.12, 12, 12);
        const beadMat = new THREE.MeshStandardMaterial({ color: 0xec4899, metalness: 0.6, roughness: 0.2 });
        const bead = new THREE.Mesh(beadGeo, beadMat);
        bead.position.set((Math.random() - 0.5) * 2.0, -1.8 + Math.random() * 3.6, (Math.random() - 0.5) * 2.0);
        bead.name = 'حبيبة راتنج التبادل الأيوني (Ion Exchange Resin Bead)';
        modelGroup.add(bead);
      }
    } else if (mType.includes('adsorption')) {
      // ADSORPTION PACKED BED
      const colGeo = new THREE.CylinderGeometry(1.4, 1.4, 5.0, 32);
      const colMat = new THREE.MeshPhysicalMaterial({ color: 0x10b981, transparent: true, opacity: 0.35, transmission: 0.85 });
      const col = new THREE.Mesh(colGeo, colMat);
      col.name = 'عمود الادمصاص (Adsorption Carbon Bed)';
      modelGroup.add(col);

      // Activated Carbon Particles Bed
      for (let b = 0; b < 50; b++) {
        const pSize = 0.14 + Math.random() * 0.1;
        const pGeo = new THREE.BoxGeometry(pSize, pSize, pSize);
        const pMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
        const pMesh = new THREE.Mesh(pGeo, pMat);
        pMesh.position.set((Math.random() - 0.5) * 2.2, -1.8 + Math.random() * 3.6, (Math.random() - 0.5) * 2.2);
        pMesh.rotation.set(Math.random(), Math.random(), Math.random());
        pMesh.name = 'دقيقة الفحم المنشط الممص (Activated Carbon Granule)';
        modelGroup.add(pMesh);
      }
    } else if (
      mType.includes('absorption') ||
      mType.includes('humidification')
    ) {
      // 2. PACKED ABSORPTION / STRIPPING / ADSORPTION TOWER
      const towerGeo = new THREE.CylinderGeometry(1.3, 1.3, 5.2, 32);
      const towerMat = new THREE.MeshPhysicalMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.3,
        transmission: 0.85
      });
      const tower = new THREE.Mesh(towerGeo, towerMat);
      tower.name = 'عمود الامتصاص والتعبئة (Packed Absorber Shell)';
      modelGroup.add(tower);

      // Packed Bed Section (Raschig Rings Simulation)
      for (let y = -1.5; y <= 1.5; y += 0.5) {
        for (let r = 0; r < 6; r++) {
          const angle = (r / 6) * Math.PI * 2;
          const ringGeo = new THREE.TorusGeometry(0.2, 0.06, 8, 16);
          const ringMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.7 });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.position.set(Math.cos(angle) * 0.6, y, Math.sin(angle) * 0.6);
          ring.rotation.set(Math.random(), Math.random(), Math.random());
          ring.name = 'حلقات تعبئة راشيج (Raschig Packing Rings)';
          modelGroup.add(ring);
        }
      }

      // Top Spray Distributor
      const distGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.1, 16);
      const distMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.8 });
      const distributor = new THREE.Mesh(distGeo, distMat);
      distributor.position.y = 2.1;
      distributor.name = 'موزع السائل العلوي (Liquid Spray Distributor)';
      modelGroup.add(distributor);

      // Liquid Droplets Moving Downward
      const pCount = 100;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 2.0;
        pPos[i + 1] = (Math.random() - 0.5) * 4.8;
        pPos[i + 2] = (Math.random() - 0.5) * 2.0;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.09, transparent: true, opacity: 0.85 });
      particlesGroup = new THREE.Points(pGeo, pMat);
      particleSpeedY = -0.025; // Falling droplets
      modelGroup.add(particlesGroup);
    } else if (mType.includes('extraction')) {
      // 3. MIXER-SETTLER EXTRACTION UNIT
      // Mixing Tank Left
      const mixGeo = new THREE.CylinderGeometry(1.3, 1.3, 3.2, 32);
      const mixMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, transmission: 0.8 });
      const mixTank = new THREE.Mesh(mixGeo, mixMat);
      mixTank.position.x = -2.2;
      mixTank.name = 'وعاء الخلط (Agitated Mixer Tank)';
      modelGroup.add(mixTank);

      // Impeller inside Mixer
      const impellerGroup = new THREE.Group();
      impellerGroup.position.set(-2.2, -0.4, 0);
      for (let b = 0; b < 4; b++) {
        const bladeGeo = new THREE.BoxGeometry(0.8, 0.25, 0.05);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.rotation.y = (b * Math.PI) / 2;
        impellerGroup.add(blade);
      }
      modelGroup.add(impellerGroup);
      rotatingParts.push(impellerGroup);

      // Settling Tank Right (Rectangular)
      const setGeo = new THREE.BoxGeometry(3.5, 2.2, 2.0);
      const setMat = new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.3, transmission: 0.9 });
      const setTank = new THREE.Mesh(setGeo, setMat);
      setTank.position.x = 1.2;
      setTank.name = 'حوض الترويق وفصل الطبقات (Settling Tank)';
      modelGroup.add(setTank);

      // Phase Separation Layers inside Settler
      const heavyPhase = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.9, 1.9),
        new THREE.MeshStandardMaterial({ color: 0x0284c7, transparent: true, opacity: 0.7 })
      );
      heavyPhase.position.set(1.2, -0.5, 0);
      heavyPhase.name = 'الطبقة الثقيلة (Heavy Phase / Raffinate)';
      modelGroup.add(heavyPhase);

      const lightPhase = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 0.9, 1.9),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.7 })
      );
      lightPhase.position.set(1.2, 0.4, 0);
      lightPhase.name = 'الطبقة الخفيفة (Light Phase / Extract)';
      modelGroup.add(lightPhase);
    } else if (mType.includes('drying')) {
      // 4. ROTARY DRUM DRYER
      const drumGeo = new THREE.CylinderGeometry(1.6, 1.6, 5.5, 32);
      drumGeo.rotateZ(Math.PI / 2);
      const drumMat = new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.7, roughness: 0.3 });
      const drum = new THREE.Mesh(drumGeo, drumMat);
      drum.name = 'الأسطوانة الدوارة للمجفف (Rotary Dryer Drum Shell)';
      drum.rotation.z = 0.1; // Slight slope
      modelGroup.add(drum);
      rotatingParts.push(drum);

      // Riding Rings (Trunnions)
      for (let rx of [-1.8, 1.8]) {
        const ringGeo = new THREE.TorusGeometry(1.7, 0.15, 16, 32);
        ringGeo.rotateY(Math.PI / 2);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.x = rx;
        ring.name = 'حلقة التدوير والارتكاز (Drum Riding Ring)';
        modelGroup.add(ring);
      }

      // Hot Air Stream Particles
      const pCount = 80;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 5.0;
        pPos[i + 1] = (Math.random() - 0.5) * 2.2;
        pPos[i + 2] = (Math.random() - 0.5) * 2.2;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xef4444, size: 0.1, transparent: true, opacity: 0.85 });
      particlesGroup = new THREE.Points(pGeo, pMat);
      modelGroup.add(particlesGroup);
    } else if (mType.includes('filtration')) {
      // 5. ROTARY DRUM VACUUM FILTER
      const drumGeo = new THREE.CylinderGeometry(1.8, 1.8, 3.2, 32);
      drumGeo.rotateZ(Math.PI / 2);
      const drumMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 });
      const drum = new THREE.Mesh(drumGeo, drumMat);
      drum.name = 'أسطوانة الترشيح المفرغة (Rotary Vacuum Drum)';
      modelGroup.add(drum);
      rotatingParts.push(drum);

      // Slurry Trough (Semi-submerged tank)
      const troughGeo = new THREE.CylinderGeometry(2.1, 2.1, 3.3, 32, 1, false, 0, Math.PI);
      troughGeo.rotateZ(Math.PI / 2);
      troughGeo.rotateX(Math.PI);
      const troughMat = new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.5 });
      const trough = new THREE.Mesh(troughGeo, troughMat);
      trough.position.y = -0.5;
      trough.name = 'حوض الراسب / السائل المراد ترشيحه (Slurry Trough)';
      modelGroup.add(trough);

      // Scraper Knife
      const knifeGeo = new THREE.BoxGeometry(0.2, 0.1, 3.2);
      const knifeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9 });
      const knife = new THREE.Mesh(knifeGeo, knifeMat);
      knife.position.set(1.85, 0.4, 0);
      knife.name = 'سكين كشط الكعكة المرشحة (Filter Cake Scraper Blade)';
      modelGroup.add(knife);
    } else if (mType.includes('evaporation')) {
      // 6. CALANDRIA EVAPORATOR (Short-Tube Vertical Calandria Evaporator)
      // Main Vessel Shell (Transparent Glass Body)
      const bodyGeo = new THREE.CylinderGeometry(1.5, 1.5, 4.5, 32);
      const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.35, transmission: 0.85 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.name = 'جسم المبخر وغرفة فصل البخار (Evaporator Vapor Disengagement Shell)';
      modelGroup.add(body);

      // Bottom Conical Discharge Head (Liquor Outlet)
      const bottomConeGeo = new THREE.CylinderGeometry(1.5, 0.4, 1.2, 32);
      const bottomConeMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
      const bottomCone = new THREE.Mesh(bottomConeGeo, bottomConeMat);
      bottomCone.position.y = -2.85;
      bottomCone.name = 'القمع السفلي لتصريف المحلول المركز (Concentrated Product Bottom Cone)';
      modelGroup.add(bottomCone);

      // Top Vapor Outlet Duct / Elbow Pipe
      const topDuctGeo = new THREE.CylinderGeometry(0.35, 0.35, 1.4, 24);
      const topDuctMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.8 });
      const topDuct = new THREE.Mesh(topDuctGeo, topDuctMat);
      topDuct.position.y = 2.95;
      topDuct.name = 'أنبوب خروج البخار العلوي (Overhead Vapor Duct to Condenser)';
      modelGroup.add(topDuct);

      // Demister Pad / Mist Eliminator Mesh at Top Head
      const demisterGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.25, 32);
      const demisterMat = new THREE.MeshStandardMaterial({ color: 0x64748b, wireframe: true });
      const demister = new THREE.Mesh(demisterGeo, demisterMat);
      demister.position.y = 1.6;
      demister.name = 'مانع رذاذ القطرات (Mesh Demister / Entrainment Separator)';
      modelGroup.add(demister);

      // Calandria Heating Tube Bundle (Vertical Tubes)
      for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2;
        const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.0, 16);
        const tubeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.position.set(Math.cos(angle) * 0.95, -1.0, Math.sin(angle) * 0.95);
        tube.name = `أنبوب تسخين عمودي بـ Calandria (Calandria Vertical Tube #${i + 1})`;
        modelGroup.add(tube);
      }

      // Central Downtake Tube (Large Diameter Recirculation Tube)
      const downGeo = new THREE.CylinderGeometry(0.48, 0.48, 2.0, 32);
      const downMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
      const downtake = new THREE.Mesh(downGeo, downMat);
      downtake.position.y = -1.0;
      downtake.name = 'أنبوب التدوير المركزي الهابط (Central Downtake Recirculation Pipe)';
      modelGroup.add(downtake);

      // Steam Inlet Pipe to Calandria Shell (Red/Orange Steam Feed)
      const steamInletGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.6, 16);
      steamInletGeo.rotateZ(Math.PI / 2);
      const steamInletMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 });
      const steamInlet = new THREE.Mesh(steamInletGeo, steamInletMat);
      steamInlet.position.set(-1.6, -1.0, 0);
      steamInlet.name = 'خط إمداد البخار المشبع للتسخين (Heating Steam Inlet Nozzle)';
      modelGroup.add(steamInlet);

      // Condensate Drain Pipe (Bottom of Calandria Shell)
      const condDrainGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.4, 16);
      condDrainGeo.rotateZ(Math.PI / 2);
      const condDrainMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8 });
      const condDrain = new THREE.Mesh(condDrainGeo, condDrainMat);
      condDrain.position.set(1.5, -1.8, 0);
      condDrain.name = 'خط تصريف المياه المتكثفة (Steam Condensate Drain Nozzle)';
      modelGroup.add(condDrain);

      // Feed Inlet Pipe (Middle Liquid Feed)
      const feedNozzleGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.4, 16);
      feedNozzleGeo.rotateZ(Math.PI / 2);
      const feedNozzleMat = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.8 });
      const feedNozzle = new THREE.Mesh(feedNozzleGeo, feedNozzleMat);
      feedNozzle.position.set(1.5, 0.2, 0);
      feedNozzle.name = 'خط تغذية السائل المراد تركيزه (Raw Liquid Feed Inlet Nozzle)';
      modelGroup.add(feedNozzle);

      // Boiling Liquid Level Surface (Transparent Aqua Disk)
      const levelGeo = new THREE.CylinderGeometry(1.48, 1.48, 0.05, 32);
      const levelMat = new THREE.MeshPhysicalMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.7, roughness: 0.1 });
      const levelMesh = new THREE.Mesh(levelGeo, levelMat);
      levelMesh.position.y = 0.3;
      levelMesh.name = 'مستوى السائل المغلي داخل المبخر (Boiling Liquor Liquid Level)';
      modelGroup.add(levelMesh);

      // Dynamic Rising Vapor Steam Particles
      const pCount = 110;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 2.4;
        pPos[i + 1] = -1.0 + Math.random() * 4.2;
        pPos[i + 2] = (Math.random() - 0.5) * 2.4;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xf0f9ff, size: 0.1, transparent: true, opacity: 0.85 });
      particlesGroup = new THREE.Points(pGeo, pMat);
      modelGroup.add(particlesGroup);
    } else if (mType.includes('crystallization')) {
      // 7. CRYSTALLIZER VESSEL (DTB Crystallizer)
      const vesselGeo = new THREE.CylinderGeometry(1.6, 1.0, 4.0, 32);
      const vesselMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, transmission: 0.85 });
      const vessel = new THREE.Mesh(vesselGeo, vesselMat);
      vessel.name = 'وعاء البلورة مخروطي القاع (Crystallizer Vessel Shell)';
      modelGroup.add(vessel);

      // Growing Crystal Cubes inside
      for (let c = 0; c < 20; c++) {
        const cubeSize = 0.15 + Math.random() * 0.2;
        const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
        const cubeMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.1,
          metalness: 0.9,
          transparent: true,
          opacity: 0.9
        });
        const crystal = new THREE.Mesh(cubeGeo, cubeMat);
        crystal.position.set((Math.random() - 0.5) * 2.2, (Math.random() - 0.5) * 2.5, (Math.random() - 0.5) * 2.2);
        crystal.rotation.set(Math.random(), Math.random(), Math.random());
        crystal.name = 'بلورة نائية متنامية (Growing Crystal Particle)';
        modelGroup.add(crystal);
      }
    } else if (mType.includes('sedimentation')) {
      // 8. SEDIMENTATION TANK / GRAVITY CLARIFIER
      const tankGeo = new THREE.CylinderGeometry(2.8, 1.0, 2.2, 32);
      const tankMat = new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.4, transmission: 0.8 });
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.name = 'خزان الترسيب والترويق (Circular Clarifier Tank)';
      modelGroup.add(tank);

      // Rotating Rake Mechanism
      const rakeGroup = new THREE.Group();
      const shaftGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 16);
      const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0x475569 }));
      rakeGroup.add(shaft);

      const armGeo = new THREE.BoxGeometry(4.8, 0.1, 0.15);
      const armMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
      const arm = new THREE.Mesh(armGeo, armMat);
      arm.position.y = -0.8;
      rakeGroup.add(arm);

      modelGroup.add(rakeGroup);
      rotatingParts.push(rakeGroup);

      // Sludge Settling Particles
      const pCount = 100;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 4.5;
        pPos[i + 1] = (Math.random() - 0.5) * 1.8;
        pPos[i + 2] = (Math.random() - 0.5) * 4.5;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0x78350f, size: 0.1 });
      particlesGroup = new THREE.Points(pGeo, pMat);
      particleSpeedY = -0.015; // Slow settling
      modelGroup.add(particlesGroup);
    } else if (mType.includes('cyclone')) {
      // 9. CYCLONE SEPARATOR
      const topGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.0, 32);
      const topMesh = new THREE.Mesh(topGeo, new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.4 }));
      topMesh.position.y = 1.0;
      topMesh.name = 'الجزء الأسطواني للفرّازة الحلزونية (Cyclone Upper Cylinder)';
      modelGroup.add(topMesh);

      const coneGeo = new THREE.CylinderGeometry(1.6, 0.4, 3.0, 32);
      const coneMesh = new THREE.Mesh(coneGeo, new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.4 }));
      coneMesh.position.y = -1.5;
      coneMesh.name = 'القمع المخروطي للفرّازة (Cyclone Lower Cone)';
      modelGroup.add(coneMesh);

      // Vortex Finder Tube at top
      const vortexGeo = new THREE.CylinderGeometry(0.6, 0.6, 1.8, 32);
      const vortexMesh = new THREE.Mesh(vortexGeo, new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 }));
      vortexMesh.position.y = 1.2;
      vortexMesh.name = 'أنبوب خروج الغاز النقي المركزي (Vortex Finder Pipe)';
      modelGroup.add(vortexMesh);

      // Swirling Dust Particles Spiral
      const pCount = 120;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        const radius = 0.3 + Math.random() * 1.1;
        const angle = Math.random() * Math.PI * 2;
        pPos[i] = Math.cos(angle) * radius;
        pPos[i + 1] = (Math.random() - 0.5) * 4.0;
        pPos[i + 2] = Math.sin(angle) * radius;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.09 });
      particlesGroup = new THREE.Points(pGeo, pMat);
      modelGroup.add(particlesGroup);
    } else if (mType.includes('fluidization')) {
      // 10. FLUIDIZED BED REACTOR
      const bedGeo = new THREE.CylinderGeometry(1.5, 1.5, 4.5, 32);
      const bedMesh = new THREE.Mesh(bedGeo, new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35, transmission: 0.85 }));
      bedMesh.name = 'مفاعل المهاد التسييلي (Fluidized Bed Vessel Shell)';
      modelGroup.add(bedMesh);

      // Distributor Plate
      const distGeo = new THREE.CylinderGeometry(1.45, 1.45, 0.1, 32);
      const distMesh = new THREE.Mesh(distGeo, new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.9 }));
      distMesh.position.y = -1.8;
      distMesh.name = 'صفيحة توزيع الغاز السفلية (Gas Distributor Plate)';
      modelGroup.add(distMesh);

      // Bubbling Catalyst Particles
      const pCount = 140;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 2.6;
        pPos[i + 1] = -1.7 + Math.random() * 2.8;
        pPos[i + 2] = (Math.random() - 0.5) * 2.6;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xec4899, size: 0.11 });
      particlesGroup = new THREE.Points(pGeo, pMat);
      modelGroup.add(particlesGroup);
    } else if (mType.includes('mixing')) {
      // 11. AGITATED MIXING TANK
      const tankGeo = new THREE.CylinderGeometry(1.7, 1.7, 4.0, 32);
      const tankMesh = new THREE.Mesh(tankGeo, new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3, transmission: 0.9 }));
      tankMesh.name = 'وعاء الخلط بالتقليب (Agitated Tank)';
      modelGroup.add(tankMesh);

      // Shaft and Rushton Turbine Impeller
      const shaftGeo = new THREE.CylinderGeometry(0.1, 0.1, 4.2, 16);
      const shaft = new THREE.Mesh(shaftGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 }));
      modelGroup.add(shaft);

      const impellerGroup = new THREE.Group();
      for (let a = 0; a < 6; a++) {
        const bladeGeo = new THREE.BoxGeometry(0.7, 0.3, 0.05);
        const bladeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.rotation.y = (a * Math.PI) / 3;
        blade.position.x = Math.cos((a * Math.PI) / 3) * 0.4;
        blade.position.z = Math.sin((a * Math.PI) / 3) * 0.4;
        impellerGroup.add(blade);
      }
      impellerGroup.position.y = -1.0;
      modelGroup.add(impellerGroup);
      rotatingParts.push(impellerGroup);
    } else if (mType.includes('membrane')) {
      // 12. MEMBRANE SEPARATION / RO PRESSURE VESSEL
      const shellGeo = new THREE.CylinderGeometry(1.2, 1.2, 5.2, 32);
      shellGeo.rotateZ(Math.PI / 2);
      const shellMesh = new THREE.Mesh(shellGeo, new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.4 }));
      shellMesh.name = 'أنبوب الضغط للمغشاء (RO Membrane Pressure Vessel)';
      modelGroup.add(shellMesh);

      // Central Permeate Tube
      const permGeo = new THREE.CylinderGeometry(0.2, 0.2, 5.4, 32);
      permGeo.rotateZ(Math.PI / 2);
      const permMesh = new THREE.Mesh(permGeo, new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8 }));
      permMesh.name = 'أنبوب تجميع الماء النقي المركزي (Central Permeate Tube)';
      modelGroup.add(permMesh);

      // Spiral Wound Layers
      for (let r = 0.4; r <= 1.0; r += 0.2) {
        const rollGeo = new THREE.CylinderGeometry(r, r, 5.0, 32, 1, true);
        rollGeo.rotateZ(Math.PI / 2);
        const rollMesh = new THREE.Mesh(rollGeo, new THREE.MeshStandardMaterial({ color: 0x94a3b8, wireframe: true }));
        rollMesh.name = 'طبقات الغشاء الحلزوني (Spiral Wound Membrane Leaf)';
        modelGroup.add(rollMesh);
      }
    } else if (mType.includes('conduction') || mType.includes('transient')) {
      // 13. MULTI-LAYER COMPOSITE WALL CONDUCTION
      const layer1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 3.5, 3.5),
        new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.3 })
      );
      layer1.position.x = -1.2;
      layer1.name = 'الطبقة الداخلية الساخنة (Hot Inner Layer - Firebrick)';
      modelGroup.add(layer1);

      const layer2 = new THREE.Mesh(
        new THREE.BoxGeometry(1.0, 3.5, 3.5),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.2 })
      );
      layer2.position.x = -0.3;
      layer2.name = 'طبقة العازل الحراري (Thermal Insulation Layer)';
      modelGroup.add(layer2);

      const layer3 = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 3.5, 3.5),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.7 })
      );
      layer3.position.x = 0.5;
      layer3.name = 'الطبقة الخارجية المعدنية (Outer Steel Sheet)';
      modelGroup.add(layer3);
    } else if (mType.includes('fin')) {
      // 14. FINNED HEAT SINK ARRAY
      const baseGeo = new THREE.BoxGeometry(5, 0.4, 3);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.name = 'القاعدة الساخنة (Hot Base Surface)';
      modelGroup.add(base);

      for (let x = -2; x <= 2; x += 0.8) {
        const finGeo = new THREE.BoxGeometry(0.18, 2.5, 2.8);
        const finMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8, roughness: 0.2 });
        const fin = new THREE.Mesh(finGeo, finMat);
        fin.position.set(x, 1.4, 0);
        fin.name = `زعنفة تبريد (Cooling Fin #${Math.round(x + 3)})`;
        modelGroup.add(fin);
      }
    } else if (mType.includes('radiation')) {
      // 15. THERMAL RADIATION PLATES
      const plate1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 3.2, 3.2),
        new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 })
      );
      plate1.position.x = -2.0;
      plate1.name = 'السطح المشع الساخن (Hot Emitter Plate T1)';
      modelGroup.add(plate1);

      const plate2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 3.2, 3.2),
        new THREE.MeshStandardMaterial({ color: 0x06b6d4, metalness: 0.8 })
      );
      plate2.position.x = 2.0;
      plate2.name = 'السطح المستقل البارد (Cool Absorber Plate T2)';
      modelGroup.add(plate2);

      // Radiation Beam Particles
      const pCount = 80;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = -1.8 + Math.random() * 3.6;
        pPos[i + 1] = (Math.random() - 0.5) * 3.0;
        pPos[i + 2] = (Math.random() - 0.5) * 3.0;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.1 });
      particlesGroup = new THREE.Points(pGeo, pMat);
      modelGroup.add(particlesGroup);
    } else if (mType.includes('natural') || mType.includes('convection')) {
      // 16. CONVECTION FLOW / HEATED PIPE
      const pipeGeo = new THREE.CylinderGeometry(0.8, 0.8, 4.8, 32);
      const pipeMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 });
      const pipe = new THREE.Mesh(pipeGeo, pipeMat);
      pipe.name = 'الأنبوب الساخن المسبب للحمل (Heated Vertical Pipe)';
      modelGroup.add(pipe);

      // Plume particles rising
      const pCount = 90;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        const angle = Math.random() * Math.PI * 2;
        const rad = 0.9 + Math.random() * 0.8;
        pPos[i] = Math.cos(angle) * rad;
        pPos[i + 1] = (Math.random() - 0.5) * 4.5;
        pPos[i + 2] = Math.sin(angle) * rad;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.09 });
      particlesGroup = new THREE.Points(pGeo, pMat);
      modelGroup.add(particlesGroup);
    } else if (mType.includes('boiling')) {
      // 17. POOL BOILING
      const vesselGeo = new THREE.CylinderGeometry(2.0, 2.0, 3.5, 32);
      const vesselMat = new THREE.MeshPhysicalMaterial({ color: 0x0284c7, transparent: true, opacity: 0.35, transmission: 0.9 });
      const vessel = new THREE.Mesh(vesselGeo, vesselMat);
      vessel.name = 'خزان الغليان (Boiling Pool Vessel)';
      modelGroup.add(vessel);

      // Heating Element Coil at bottom
      const coilGeo = new THREE.TorusGeometry(1.2, 0.12, 16, 32);
      coilGeo.rotateX(Math.PI / 2);
      const coilMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9 });
      const coil = new THREE.Mesh(coilGeo, coilMat);
      coil.position.y = -1.2;
      coil.name = 'عنصر التسخين المغمور (Submerged Heating Coil)';
      modelGroup.add(coil);

      // Rising Vapor Bubbles
      const pCount = 100;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        pPos[i] = (Math.random() - 0.5) * 2.8;
        pPos[i + 1] = -1.2 + Math.random() * 2.8;
        pPos[i + 2] = (Math.random() - 0.5) * 2.8;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.1 });
      particlesGroup = new THREE.Points(pGeo, pMat);
      modelGroup.add(particlesGroup);
    } else if (mType.includes('condensation')) {
      // 18. CONDENSATION FILM ON VERTICAL TUBE
      const tubeGeo = new THREE.CylinderGeometry(0.8, 0.8, 4.8, 32);
      const tubeMat = new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.9 });
      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      tube.name = 'أنبوب التكثيف البارد (Cold Condenser Tube)';
      modelGroup.add(tube);

      // Falling Liquid Droplets Film
      const pCount = 90;
      const pGeo = new THREE.BufferGeometry();
      const pPos = new Float32Array(pCount * 3);
      for (let i = 0; i < pCount * 3; i += 3) {
        const angle = Math.random() * Math.PI * 2;
        pPos[i] = Math.cos(angle) * 0.85;
        pPos[i + 1] = (Math.random() - 0.5) * 4.5;
        pPos[i + 2] = Math.sin(angle) * 0.85;
      }
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
      const pMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.1 });
      particlesGroup = new THREE.Points(pGeo, pMat);
      particleSpeedY = -0.03;
      modelGroup.add(particlesGroup);
    } else if (mType.includes('critical') || mType.includes('overall')) {
      // 19. CRITICAL RADIUS INSULATED PIPE
      const innerPipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.6, 0.6, 5.0, 32),
        new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.8 })
      );
      innerPipe.rotateZ(Math.PI / 2);
      innerPipe.name = 'الأنبوب الداخلي الساخن (Hot Bare Pipe)';
      modelGroup.add(innerPipe);

      const insulGeo = new THREE.CylinderGeometry(1.2, 1.2, 4.8, 32);
      insulGeo.rotateZ(Math.PI / 2);
      const insulMat = new THREE.MeshPhysicalMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.6 });
      const insulation = new THREE.Mesh(insulGeo, insulMat);
      insulation.name = 'طبقة العزل الحراري (Critical Radius Insulation Layer)';
      modelGroup.add(insulation);
    } else {
      // 20. DEFAULT SHELL & TUBE HEAT EXCHANGER (For LMTD / NTU / Exchanger Selection)
      const shellGeo = new THREE.CylinderGeometry(1.6, 1.6, 5, 32);
      shellGeo.rotateZ(Math.PI / 2);
      const shellMat = new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        transmission: 0.85
      });
      const shell = new THREE.Mesh(shellGeo, shellMat);
      shell.name = 'غلاف المبادل الحراري (Outer Shell)';
      modelGroup.add(shell);

      // Tube Bundle
      for (let i = 0; i < 24; i++) {
        const angle = (i / 24) * Math.PI * 2;
        const rad = 0.4 + (i % 2) * 0.5;
        const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 5.2, 16);
        tubeGeo.rotateZ(Math.PI / 2);
        const tubeMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
        const tube = new THREE.Mesh(tubeGeo, tubeMat);
        tube.position.set(0, Math.sin(angle) * rad, Math.cos(angle) * rad);
        tube.name = `أنبوب داخلي (Tube #${i + 1})`;
        modelGroup.add(tube);
      }

      // Baffles
      for (let b = -1.8; b <= 1.8; b += 1.2) {
        const baffleGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.08, 32);
        baffleGeo.rotateZ(Math.PI / 2);
        const baffleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.5 });
        const baffle = new THREE.Mesh(baffleGeo, baffleMat);
        baffle.position.x = b;
        baffle.name = `حاجز توجيه (Baffle Cut Plate)`;
        modelGroup.add(baffle);
      }
    }

    // 5. Orbit Control with Mouse Dragging & Zooming
    let isMouseDown = false;
    let previousMousePosition = { x: 0, y: 0 };

    const handleMouseDown = (e: MouseEvent) => {
      isMouseDown = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      modelGroup.rotation.y += deltaX * 0.01;
      modelGroup.rotation.x += deltaY * 0.01;

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isMouseDown = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z += e.deltaY * 0.005;
      camera.position.z = Math.max(3, Math.min(20, camera.position.z));
    };

    // Raycasting for object selection on click
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(modelGroup.children, true);

      if (intersects.length > 0) {
        const clickedObj = intersects[0].object;
        setSelectedPart(clickedObj.name || 'مكون هندسي تفاعلي');
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    domElement.addEventListener('wheel', handleWheel, { passive: false });
    domElement.addEventListener('click', handleClick);

    // 6. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (isPlaying) {
        modelGroup.rotation.y += 0.003;

        // Rotate impellers / drums / rakes
        rotatingParts.forEach(part => {
          part.rotation.y += 0.05;
        });

        // Particle movement
        if (particlesGroup && particlesGroup.geometry) {
          const positions = particlesGroup.geometry.attributes.position.array as Float32Array;
          for (let i = 1; i < positions.length; i += 3) {
            positions[i] += particleSpeedY;
            if (particleSpeedY > 0 && positions[i] > 2.5) positions[i] = -2.5;
            if (particleSpeedY < 0 && positions[i] < -2.5) positions[i] = 2.5;
          }
          particlesGroup.geometry.attributes.position.needsUpdate = true;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      domElement.removeEventListener('wheel', handleWheel);
      domElement.removeEventListener('click', handleClick);
      renderer.dispose();
    };
  }, [moduleType, isPlaying]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 font-mono">
      {/* 3D Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            {titleAr} (نموذج 3D تفاعلي حي)
          </h3>
          {subTitleAr && <p className="text-[11px] text-slate-400 mt-0.5">{subTitleAr}</p>}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition shadow"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-amber-500" />
                <span>إيقاف الحركة</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>تشغيل الحركة</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Interactive 3D Canvas Viewport */}
      <div className="relative w-full h-[380px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800/80 cursor-grab active:cursor-grabbing">
        <div ref={containerRef} className="w-full h-full" />

        {/* Selected Part Badge */}
        {selectedPart && (
          <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-amber-500/50 px-3.5 py-2 rounded-xl text-xs text-amber-400 shadow-xl flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400" />
            <span>المكون المحدد: <strong>{selectedPart}</strong></span>
          </div>
        )}

        {/* Navigation Guidance overlay */}
        <div className="absolute bottom-3 right-3 left-3 flex justify-between items-center text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800">
          <span>👇 انقر على أي جزء للاستكشاف</span>
          <span>🖱️ عجلة الماور للتكبير Zoom</span>
          <span>🖱️ اسحب للتدوير 360°</span>
        </div>
      </div>
    </div>
  );
};
