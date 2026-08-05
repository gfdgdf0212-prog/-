'use strict';
/* ── 3D-МОБЫ: пекарь спрайтов ──
   Рендерит процедурные Three.js-модели в атласы спрайтов (8 направлений × 6 кадров).
   Свет идентичен свету дерева (ACES + солнце из Tree3D) — единый стиль сцены. */
const MobBaker = (() => {
  const DIRS = 8, FRAMES = 6;
  const CELL = 96, BOSS_CELL = 128;
  const ATLAS_W = CELL * DIRS;          // 768
  const ATLAS_H = CELL * FRAMES;        // 576
  const BOSS_ATLAS_W = BOSS_CELL * DIRS; // 1024
  const BOSS_ATLAS_H = BOSS_CELL * FRAMES; // 768

  const atlases = {};   // type -> HTMLCanvasElement
  const ready = {};
  const pending = {};
  let baker = null;

  // === Функция материала (копия из присланного) ===
  function mat(color, roughness = 0.6, metalness = 0.1, emissive = null, emissiveIntensity = 0) {
    const options = { color, roughness, metalness };
    if (emissive) options.emissive = new THREE.Color(emissive);
    if (emissiveIntensity) options.emissiveIntensity = emissiveIntensity;
    return new THREE.MeshStandardMaterial(options);
  }
  const RED_EYE = 0xff0000;

  // ========== ПАУК ==========
  function createSpider() {
    const group = new THREE.Group();
    const bodyMat = mat(0x3a2a1a, 0.85);
    const legMat = mat(0x2a1a0a, 0.8);
    const jointMat = mat(0x1a0a00, 0.9);
    const legDefs = [
      { side: -1, zAngle: 0.35 }, { side: -1, zAngle: -0.35 },
      { side: -1, zAngle: 1.1 },  { side: -1, zAngle: -1.1 },
      { side:  1, zAngle: 0.35 }, { side:  1, zAngle: -0.35 },
      { side:  1, zAngle: 1.1 },  { side:  1, zAngle: -1.1 }
    ];
    legDefs.forEach((p) => {
      const root = new THREE.Vector3(p.side * 0.6, 0.65, p.zAngle * 0.35);
      const len1 = 0.7, len2 = 0.65;
      const bodyJoint = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), jointMat);
      bodyJoint.position.copy(root); group.add(bodyJoint);
      const seg1Geo = new THREE.CylinderGeometry(0.04, 0.06, len1, 6);
      seg1Geo.translate(0, -len1 / 2, 0);
      const seg1 = new THREE.Mesh(seg1Geo, legMat);
      seg1.position.copy(root); seg1.rotation.z = p.side * p.zAngle; seg1.rotation.x = 0.2;
      group.add(seg1);
      const dir1 = new THREE.Vector3(0, -1, 0);
      dir1.applyEuler(new THREE.Euler(0.2, 0, seg1.rotation.z));
      const jointPos = root.clone().add(dir1.multiplyScalar(len1));
      const midJoint = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), jointMat);
      midJoint.position.copy(jointPos); group.add(midJoint);
      const seg2Geo = new THREE.CylinderGeometry(0.03, 0.05, len2, 6);
      seg2Geo.translate(0, -len2 / 2, 0);
      const seg2 = new THREE.Mesh(seg2Geo, legMat);
      seg2.position.copy(jointPos); seg2.rotation.z = seg1.rotation.z + p.side * 0.6; seg2.rotation.x = 0.15;
      group.add(seg2);
    });
    const abdomen = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), bodyMat);
    abdomen.scale.set(1, 0.75, 1.2); abdomen.position.set(0, 0.7, -0.5); group.add(abdomen);
    const cephalo = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 16), mat(0x2a1a0a, 0.7));
    cephalo.scale.set(1, 0.9, 1); cephalo.position.set(0, 0.75, 0.6); group.add(cephalo);
    const eyeMat = mat(RED_EYE, 0.1, 0.1, RED_EYE, 0.9);
    for (let i = 0; i < 4; i++) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), eyeMat);
      const xOff = (i % 2 === 0) ? -0.15 : 0.15;
      const zOff = (i < 2) ? 0.1 : -0.1;
      eye.position.set(xOff, 1.0, 0.85 + zOff); group.add(eye);
    }
    const mandibleMat = mat(0x4a3a2a, 0.6);
    const m1 = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.15, 8), mandibleMat);
    m1.position.set(-0.1, 0.55, 1.25); m1.rotation.x = 0.5; m1.rotation.z = -0.3; group.add(m1);
    const m2 = m1.clone(); m2.position.set(0.1, 0.55, 1.25); m2.rotation.z = 0.3; group.add(m2);
    group.userData.pivot = new THREE.Vector3(0, 0, 0.3);
    return group;
  }

  // ========== ЖУК ==========
  function createBeetle() {
    const group = new THREE.Group();
    const bodyMat = mat(0x2d6a4f, 0.3, 0.8, 0x1a3a2a, 0.2);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 16), bodyMat);
    body.scale.set(1.3, 0.7, 1); body.position.set(0, 0.5, 0); group.add(body);
    const shellMat = mat(0x3a8a5f, 0.2, 0.9, 0x2a6a4f, 0.3);
    const shell1 = new THREE.Mesh(new THREE.SphereGeometry(0.89, 16, 16), shellMat);
    shell1.scale.set(1.28, 0.65, 1); shell1.position.set(-0.22, 0.55, 0); shell1.rotation.z = 0.05; group.add(shell1);
    const shell2 = shell1.clone(); shell2.position.set(0.22, 0.55, 0); shell2.rotation.z = -0.05; group.add(shell2);
    const headMat = mat(0x1a4a3a, 0.5, 0.2);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), headMat);
    head.scale.set(0.8, 1, 1); head.position.set(0, 0.7, -1.0); group.add(head);
    const eyeMat = mat(RED_EYE, 0.1, 0.1, RED_EYE, 0.5);
    for (let i = 0; i < 2; i++) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), eyeMat);
      eye.position.set(i === 0 ? -0.25 : 0.25, 0.85, -1.15); group.add(eye);
    }
    const antMat = mat(0x2a5a4a, 0.6);
    for (let i = 0; i < 2; i++) {
      const xOff = i === 0 ? -0.15 : 0.15;
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.05, 0.6, 6), antMat);
      ant.position.set(xOff, 0.85, -1.2); ant.rotation.x = 0.5; ant.rotation.z = i === 0 ? -0.4 : 0.4; group.add(ant);
      const tip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), mat(0x4a8a6a));
      tip.position.set(xOff + (i === 0 ? -0.15 : 0.15), 1.1, -1.4); group.add(tip);
    }
    const legMat = mat(0x1a3a2a, 0.7);
    const legData = [
      { x: -0.7, z: -0.65, rot: 0.65 }, { x: 0.7, z: -0.65, rot: -0.65 },
      { x: -0.8, z: 0.0, rot: 1.0 },    { x: 0.8, z: 0.0, rot: -1.0 },
      { x: -0.7, z: 0.65, rot: 0.8 },   { x: 0.7, z: 0.65, rot: -0.8 }
    ];
    legData.forEach((p) => {
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), legMat);
      joint.position.set(p.x, 0.52, p.z); group.add(joint);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 0.6, 6), legMat);
      leg.position.set(p.x, 0.25, p.z); leg.rotation.z = p.rot;
      const foot = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), legMat);
      const dir = new THREE.Vector3(0, -0.3, 0);
      dir.applyEuler(new THREE.Euler(0, 0, p.rot));
      foot.position.set(p.x + dir.x, 0.25 + dir.y, p.z + dir.z);
      group.add(leg); group.add(foot);
    });
    const glowMat = mat(0x88ffaa, 0.1, 0, 0x88ffaa, 0.8);
    const glow = new THREE.Mesh(new THREE.SphereGeometry(0.4, 16, 16), glowMat);
    glow.scale.set(1.2, 0.3, 1.2); glow.position.set(0, 0.1, 0.3); group.add(glow);
    group.userData.pivot = new THREE.Vector3(0, 0, -0.3);
    return group;
  }

  // ========== ЧЕРВЯК (дух) ==========
  function createMossBug() {
    const group = new THREE.Group();
    const segMatA = mat(0x2a4a2a, 0.9, 0.1);
    const segMatB = mat(0x1a3a1a, 0.9, 0.1);
    const legMat = mat(0x1a2a1a, 0.9);
    const segCount = 6;
    for (let i = 0; i < segCount; i++) {
      const z = -i * 0.7 + 1.5;
      const size = 0.5 - i * 0.04;
      const seg = new THREE.Mesh(new THREE.SphereGeometry(size, 12, 12), i % 2 === 0 ? segMatA : segMatB);
      seg.scale.set(1, 0.8, 1); seg.position.set(0, 0.4, z); group.add(seg);
      for (let side = -1; side <= 1; side += 2) {
        const joint = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), legMat);
        joint.position.set(side * 0.3, 0.35, z); group.add(joint);
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.04, 0.3, 6), legMat);
        leg.position.set(side * 0.35, 0.12, z); leg.rotation.z = side * 0.35; group.add(leg);
      }
      if (i % 2 === 0 && i > 0) {
        const leafMat = mat(0x4a8a3a, 0.8);
        const leaf1 = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.1), leafMat);
        leaf1.position.set(0, 0.85, z); leaf1.rotation.x = 0.5; leaf1.rotation.z = 0.2; group.add(leaf1);
        const leaf2 = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.08), leafMat);
        leaf2.position.set(0.25, 0.75, z); leaf2.rotation.x = -0.4; leaf2.rotation.z = -0.3; group.add(leaf2);
      }
    }
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 12, 12), mat(0x3a5a3a, 0.8));
    head.scale.set(1, 1.1, 0.9); head.position.set(0, 0.6, 1.8); group.add(head);
    const eyeMat = mat(RED_EYE, 0.1, 0.1, RED_EYE, 0.4);
    for (let i = 0; i < 2; i++) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), eyeMat);
      eye.position.set(i === 0 ? -0.2 : 0.2, 0.8, 2.0); group.add(eye);
    }
    const tailGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.18, 12, 12),
      mat(0x66ff66, 0.1, 0.1, 0x66ff66, 0.7)
    );
    tailGlow.position.set(0, 0.2, -2.45); group.add(tailGlow);
    group.userData.pivot = new THREE.Vector3(0, 0, 0);
    return group;
  }

  // ========== МЕДВЕДЬ (эво-босс) ==========
  function createBear() {
    const group = new THREE.Group();
    const furMat = mat(0x5a3d2c, 0.9, 0.05);
    const darkFur = mat(0x3a2518, 0.9, 0.05);
    const noseMat = mat(0x1a1a1a, 0.5);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.95, 24, 24), furMat);
    body.scale.set(1.2, 1.0, 1.3); body.position.set(0, 0.75, 0.2); group.add(body);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.6, 20, 20), mat(0x4a3320, 0.9));
    belly.scale.set(0.9, 0.8, 0.8); belly.position.set(0, 0.5, 0.5); group.add(belly);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 24), furMat);
    head.position.set(0, 1.1, 1.2); group.add(head);
    const snout = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), mat(0x4a3520, 0.7));
    snout.scale.set(0.9, 0.7, 0.7); snout.position.set(0, 0.95, 1.75); group.add(snout);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), noseMat);
    nose.position.set(0, 1.0, 2.0); group.add(nose);
    const eyeMat = mat(RED_EYE, 0.1, 0.1, RED_EYE, 0.2);
    for (let i = -1; i <= 1; i += 2) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 12), eyeMat);
      eye.position.set(i * 0.25, 1.3, 1.75); group.add(eye);
    }
    for (let i = -1; i <= 1; i += 2) {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), darkFur);
      ear.position.set(i * 0.4, 1.75, 1.0); group.add(ear);
    }
    const legMat = mat(0x3a2518, 0.9);
    const legPositions = [
      { x: -0.55, z: 0.8 }, { x: 0.55, z: 0.8 },
      { x: -0.45, z: -0.5 }, { x: 0.45, z: -0.5 }
    ];
    legPositions.forEach(p => {
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.15, 10, 10), legMat);
      joint.position.set(p.x, 0.65, p.z); group.add(joint);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 0.7, 10), legMat);
      leg.position.set(p.x, 0.3, p.z); group.add(leg);
    });
    group.userData.pivot = new THREE.Vector3(0, 0, 0.5);
    return group;
  }

  // ========== БЕЛКА (декоративная) ==========
  function createSquirrel() {
    const group = new THREE.Group();
    const furMat = mat(0xd97a38, 0.8, 0.05);
    const bellyMat = mat(0xf5c99b, 0.8);
    const darkMat = mat(0x8b4513, 0.8);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.55, 20, 20), furMat);
    body.scale.set(1, 0.9, 1.2); body.position.set(0, 0.55, 0); group.add(body);
    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), bellyMat);
    belly.scale.set(0.8, 0.8, 0.8); belly.position.set(0, 0.45, 0.2); group.add(belly);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 16), furMat);
    head.position.set(0, 0.85, 0.9); group.add(head);
    const eyeMat = mat(0x111111, 0.2);
    for (let i = -1; i <= 1; i += 2) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.08, 12, 12), eyeMat);
      eye.position.set(i * 0.18, 0.95, 1.2); group.add(eye);
    }
    for (let i = -1; i <= 1; i += 2) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.2, 8), darkMat);
      ear.position.set(i * 0.15, 1.15, 0.85); ear.rotation.x = 0.2; group.add(ear);
    }
    for (let i = -1; i <= 1; i += 2) {
      const fJoint = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), darkMat);
      fJoint.position.set(i * 0.18, 0.3, 0.38); group.add(fJoint);
      const fLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.25, 6), darkMat);
      fLeg.position.set(i * 0.2, 0.15, 0.4); fLeg.rotation.z = i * 0.3; group.add(fLeg);
      const bJoint = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), darkMat);
      bJoint.position.set(i * 0.18, 0.3, -0.32); group.add(bJoint);
      const bLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.25, 6), darkMat);
      bLeg.position.set(i * 0.2, 0.15, -0.3); bLeg.rotation.z = i * 0.3; group.add(bLeg);
    }
    const tailCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.6, -0.72), new THREE.Vector3(0, 1.0, -1.05),
      new THREE.Vector3(0, 1.5, -1.15), new THREE.Vector3(0, 1.8, -0.75),
      new THREE.Vector3(0, 1.75, -0.25), new THREE.Vector3(0, 1.4, 0.0),
      new THREE.Vector3(0, 1.0, -0.15), new THREE.Vector3(0, 0.7, -0.45)
    ]);
    const tailGeo = new THREE.TubeGeometry(tailCurve, 40, 0.13, 10, false);
    const tail = new THREE.Mesh(tailGeo, furMat); group.add(tail);
    const tailTip = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), mat(0xf0a060));
    tailTip.position.set(0, 0.7, -0.45); group.add(tailTip);
    group.userData.pivot = new THREE.Vector3(0, 0, 0.1);
    return group;
  }

  // ========== ВОЛК (босс) ==========
  function createWolf() {
    const group = new THREE.Group();
    const furMat = mat(0x4a4a4a, 0.9, 0.1);
    const lightFur = mat(0x7a7a7a, 0.8);
    const darkFur = mat(0x2a2a2a, 0.9);
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.75, 24, 24), furMat);
    body.scale.set(0.85, 0.82, 1.65); body.position.set(0, 0.7, 0.1); group.add(body);
    const chest = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 16), lightFur);
    chest.scale.set(0.85, 0.85, 0.8); chest.position.set(0, 0.55, 0.95); group.add(chest);
    const headBase = new THREE.Mesh(new THREE.SphereGeometry(0.48, 20, 20), furMat);
    headBase.position.set(0, 1.0, 1.0); group.add(headBase);
    const snout = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.6, 10), lightFur);
    snout.position.set(0, 0.95, 1.45); snout.rotation.x = Math.PI/2; group.add(snout);
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), mat(0x111111, 0.5));
    nose.position.set(0, 0.95, 1.8); group.add(nose);
    const eyeMat = mat(RED_EYE, 0.1, 0.1, RED_EYE, 0.4);
    for (let i = -1; i <= 1; i += 2) {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), eyeMat);
      eye.position.set(i * 0.2, 1.2, 1.35); group.add(eye);
    }
    for (let i = -1; i <= 1; i += 2) {
      const ear = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.4, 8), darkFur);
      ear.position.set(i * 0.22, 1.5, 0.95); ear.rotation.z = i * 0.15; ear.rotation.x = 0.2; group.add(ear);
    }
    const legMat = mat(0x3a3a3a, 0.8);
    const legPositions = [
      { x: -0.4, z: 0.75 }, { x: 0.4, z: 0.75 },
      { x: -0.35, z: -0.5 }, { x: 0.35, z: -0.5 }
    ];
    legPositions.forEach(p => {
      const joint = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), legMat);
      joint.position.set(p.x, 0.6, p.z); group.add(joint);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.75, 8), legMat);
      leg.position.set(p.x, 0.25, p.z); group.add(leg);
    });
    const tailSegments = [
      { x: 0, y: 0.75, z: -0.9, rx: 0.5, rTop: 0.09, rBot: 0.12, h: 0.5 },
      { x: 0, y: 0.55, z: -1.25, rx: 0.75, rTop: 0.07, rBot: 0.09, h: 0.5 },
      { x: 0, y: 0.35, z: -1.55, rx: 1.0, rTop: 0.05, rBot: 0.07, h: 0.45 },
      { x: 0, y: 0.2, z: -1.8, rx: 1.25, rTop: 0.03, rBot: 0.05, h: 0.4 },
      { x: 0, y: 0.1, z: -2.0, rx: 1.45, rTop: 0.02, rBot: 0.03, h: 0.35 }
    ];
    tailSegments.forEach(s => {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(s.rTop, s.rBot, s.h, 8), darkFur);
      seg.position.set(s.x, s.y, s.z); seg.rotation.x = s.rx; group.add(seg);
    });
    group.userData.pivot = new THREE.Vector3(0, 0, 0.3);
    return group;
  }

  // === Фабрика моделей ===
  const FACTORY = {
    spider: createSpider,
    beetle: createBeetle,
    bug: createMossBug,
    bear: createBear,
    squirrel: createSquirrel,
    wolf: createWolf
  };

  // === Пекарь ===
  function ensureBaker() {
    if (baker) return true;
    if (!THREE) return false;
    try {
      const c = document.createElement('canvas');
      c.width = BOSS_ATLAS_W; c.height = BOSS_ATLAS_H;
      const r = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: true, preserveDrawingBuffer: true });
      r.setSize(BOSS_ATLAS_W, BOSS_ATLAS_H);
      r.setPixelRatio(1); r.setClearColor(0x000000, 0);
      r.toneMapping = THREE.ACESFilmicToneMapping;
      r.toneMappingExposure = 1.2;
      const scene = new THREE.Scene();
      scene.add(new THREE.AmbientLight(0x8db2c4, 0.9));
      const sun = new THREE.DirectionalLight(0xfff5e6, 4.5);
      sun.position.set(10, 15, 5); scene.add(sun);
      const fill = new THREE.DirectionalLight(0xb3d0e0, 1.0);
      fill.position.set(-5, 2, -3); scene.add(fill);
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      baker = { renderer: r, scene, camera, canvas: c };
      return true;
    } catch (e) { console.warn('MobBaker init failed', e); return false; }
  }

  function bakeType(type, isBoss) {
    if (!ensureBaker()) return null;
    if (ready[type] || pending[type]) return null;
    pending[type] = true;

    const cell = isBoss ? BOSS_CELL : CELL;
    const atlasW = cell * DIRS;
    const atlasH = cell * FRAMES;

    const factory = FACTORY[type];
    if (!factory) { pending[type] = false; return null; }
    const model = factory();
    baker.scene.add(model);

    // камера — тот же ракурс, что у дерева
    baker.camera.position.set(7, 9, 10.5);
    baker.camera.lookAt(0, 1.3, 0);
    baker.camera.updateProjectionMatrix();
    baker.camera.aspect = 1;
    baker.camera.updateProjectionMatrix();

    const atlas = document.createElement('canvas');
    atlas.width = atlasW; atlas.height = atlasH;
    const ctx = atlas.getContext('2d');
    ctx.clearRect(0, 0, atlasW, atlasH);

    const pivot = model.userData.pivot || new THREE.Vector3(0, 0, 0);

    for (let d = 0; d < DIRS; d++) {
      for (let f = 0; f < FRAMES; f++) {
        const phi = (d / DIRS) * Math.PI * 2;
        const t = f / FRAMES;
        model.position.set(-pivot.x, -pivot.y + Math.sin(t * Math.PI * 2) * 0.05, -pivot.z);
        model.rotation.set(0, phi + Math.sin(t * Math.PI * 2) * 0.06, 0);
        // червяк: лёгкое сжатие по Z
        if (type === 'bug') model.scale.set(1, 1, 1 + Math.sin(t * Math.PI * 2) * 0.08);
        else model.scale.set(1, 1, 1);
        baker.renderer.render(baker.scene, baker.camera);
        ctx.drawImage(baker.canvas, d * cell, f * cell, cell, cell);
      }
    }
    baker.scene.remove(model);
    atlases[type] = atlas;
    ready[type] = true;
    pending[type] = false;
    return atlas;
  }

  // === Публичные методы ===
  function request(type, isBoss) {
    if (ready[type] || pending[type]) return;
    setTimeout(() => bakeType(type, isBoss), 50);
  }

  function isReady(type) { return !!ready[type]; }

  function getSprite(type, dir, frame) {
    const atlas = atlases[type];
    if (!atlas) return null;
    const isBoss = (type === 'wolf' || type === 'bear');
    const cell = isBoss ? BOSS_CELL : CELL;
    const sx = ((dir % DIRS) + DIRS) % DIRS * cell;
    const sy = ((frame % FRAMES) + FRAMES) % FRAMES * cell;
    return { atlas, sx, sy, sw: cell, sh: cell, cell };
  }

  return { request, isReady, getSprite };
})();
