'use strict';
/* ── 3D-МОБЫ: пекарь спрайтов v2 ──
   Каждый кадр атласа рендерится отдельно (cell×cell), камера подгоняется под модель,
   поворот модели точно соответствует экранному направлению движения. */
const MobBaker=(()=>{
const DIRS=8, FRAMES=4;
const CELL=128, BOSS_CELL=192;
const THETA0=2.159; // точная калибровка под камеру (7,9,10.5)->(0,1.3,0)
const atlases={},ready={},pending={},groundPix={};
let baker=null;

function mat(color,roughness=0.6,metalness=0.1,emissive=null,emissiveIntensity=0){
const o={color,roughness,metalness};
if(emissive)o.emissive=new THREE.Color(emissive);
if(emissiveIntensity)o.emissiveIntensity=emissiveIntensity;
return new THREE.MeshStandardMaterial(o);}
const RED_EYE=0xff0000;

function createSpider(){
const group=new THREE.Group();
const bodyMat=mat(0x3a2a1a,0.85),legMat=mat(0x2a1a0a,0.8),jointMat=mat(0x1a0a00,0.9);
const legDefs=[{side:-1,zAngle:0.35},{side:-1,zAngle:-0.35},{side:-1,zAngle:1.1},{side:-1,zAngle:-1.1},
{side:1,zAngle:0.35},{side:1,zAngle:-0.35},{side:1,zAngle:1.1},{side:1,zAngle:-1.1}];
legDefs.forEach(p=>{
const root=new THREE.Vector3(p.side*0.6,0.65,p.zAngle*0.35);
const len1=0.7,len2=0.65;
const bj=new THREE.Mesh(new THREE.SphereGeometry(0.09,8,8),jointMat);bj.position.copy(root);group.add(bj);
const s1g=new THREE.CylinderGeometry(0.04,0.06,len1,6);s1g.translate(0,-len1/2,0);
const s1=new THREE.Mesh(s1g,legMat);s1.position.copy(root);s1.rotation.z=p.side*p.zAngle;s1.rotation.x=0.2;group.add(s1);
const d1=new THREE.Vector3(0,-1,0);d1.applyEuler(new THREE.Euler(0.2,0,s1.rotation.z));
const jp=root.clone().add(d1.multiplyScalar(len1));
const mj=new THREE.Mesh(new THREE.SphereGeometry(0.08,8,8),jointMat);mj.position.copy(jp);group.add(mj);
const s2g=new THREE.CylinderGeometry(0.03,0.05,len2,6);s2g.translate(0,-len2/2,0);
const s2=new THREE.Mesh(s2g,legMat);s2.position.copy(jp);s2.rotation.z=s1.rotation.z+p.side*0.6;s2.rotation.x=0.15;group.add(s2);});
const abdomen=new THREE.Mesh(new THREE.SphereGeometry(0.8,16,16),bodyMat);
abdomen.scale.set(1,0.75,1.2);abdomen.position.set(0,0.7,-0.5);group.add(abdomen);
const cephalo=new THREE.Mesh(new THREE.SphereGeometry(0.55,16,16),mat(0x2a1a0a,0.7));
cephalo.scale.set(1,0.9,1);cephalo.position.set(0,0.75,0.6);group.add(cephalo);
const eyeMat=mat(RED_EYE,0.1,0.1,RED_EYE,0.9);
for(let i=0;i<4;i++){const eye=new THREE.Mesh(new THREE.SphereGeometry(0.08,16,16),eyeMat);
const xOff=(i%2===0)?-0.15:0.15,zOff=(i<2)?0.1:-0.1;
eye.position.set(xOff,1.0,0.85+zOff);group.add(eye);}
const mm=mat(0x4a3a2a,0.6);
const m1=new THREE.Mesh(new THREE.ConeGeometry(0.08,0.15,8),mm);
m1.position.set(-0.1,0.55,1.25);m1.rotation.x=0.5;m1.rotation.z=-0.3;group.add(m1);
const m2=m1.clone();m2.position.set(0.1,0.55,1.25);m2.rotation.z=0.3;group.add(m2);
return group;}

function createBeetle(){
const group=new THREE.Group();
const bodyMat=mat(0x2d6a4f,0.3,0.8,0x1a3a2a,0.2);
const body=new THREE.Mesh(new THREE.SphereGeometry(0.9,16,16),bodyMat);
body.scale.set(1.3,0.7,1);body.position.set(0,0.5,0);group.add(body);
const shellMat=mat(0x3a8a5f,0.2,0.9,0x2a6a4f,0.3);
const shell1=new THREE.Mesh(new THREE.SphereGeometry(0.89,16,16),shellMat);
shell1.scale.set(1.28,0.65,1);shell1.position.set(-0.22,0.55,0);shell1.rotation.z=0.05;group.add(shell1);
const shell2=shell1.clone();shell2.position.set(0.22,0.55,0);shell2.rotation.z=-0.05;group.add(shell2);
const head=new THREE.Mesh(new THREE.SphereGeometry(0.35,16,16),mat(0x1a4a3a,0.5,0.2));
head.scale.set(0.8,1,1);head.position.set(0,0.7,-1.0);group.add(head);
const eyeMat=mat(RED_EYE,0.1,0.1,RED_EYE,0.5);
for(let i=0;i<2;i++){const eye=new THREE.Mesh(new THREE.SphereGeometry(0.12,16,16),eyeMat);
eye.position.set(i===0?-0.25:0.25,0.85,-1.15);group.add(eye);}
const antMat=mat(0x2a5a4a,0.6);
for(let i=0;i<2;i++){const xOff=i===0?-0.15:0.15;
const ant=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.05,0.6,6),antMat);
ant.position.set(xOff,0.85,-1.2);ant.rotation.x=0.5;ant.rotation.z=i===0?-0.4:0.4;group.add(ant);
const tip=new THREE.Mesh(new THREE.SphereGeometry(0.04,8,8),mat(0x4a8a6a));
tip.position.set(xOff+(i===0?-0.15:0.15),1.1,-1.4);group.add(tip);}
const legMat=mat(0x1a3a2a,0.7);
const legData=[{x:-0.7,z:-0.65,rot:0.65},{x:0.7,z:-0.65,rot:-0.65},{x:-0.8,z:0,rot:1},{x:0.8,z:0,rot:-1},{x:-0.7,z:0.65,rot:0.8},{x:0.7,z:0.65,rot:-0.8}];
legData.forEach(p=>{
const joint=new THREE.Mesh(new THREE.SphereGeometry(0.07,8,8),legMat);joint.position.set(p.x,0.52,p.z);group.add(joint);
const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.06,0.6,6),legMat);
leg.position.set(p.x,0.25,p.z);leg.rotation.z=p.rot;
const foot=new THREE.Mesh(new THREE.SphereGeometry(0.04,8,8),legMat);
const dir=new THREE.Vector3(0,-0.3,0);dir.applyEuler(new THREE.Euler(0,0,p.rot));
foot.position.set(p.x+dir.x,0.25+dir.y,p.z+dir.z);group.add(leg);group.add(foot);});
const glow=new THREE.Mesh(new THREE.SphereGeometry(0.4,16,16),mat(0x88ffaa,0.1,0,0x88ffaa,0.8));
glow.scale.set(1.2,0.3,1.2);glow.position.set(0,0.1,0.3);group.add(glow);
return group;}

function createMossBug(){
const group=new THREE.Group();
const segMatA=mat(0x2a4a2a,0.9,0.1),segMatB=mat(0x1a3a1a,0.9,0.1),legMat=mat(0x1a2a1a,0.9);
for(let i=0;i<6;i++){const z=-i*0.7+1.5,size=0.5-i*0.04;
const seg=new THREE.Mesh(new THREE.SphereGeometry(size,12,12),i%2===0?segMatA:segMatB);
seg.scale.set(1,0.8,1);seg.position.set(0,0.4,z);group.add(seg);
for(let side=-1;side<=1;side+=2){
const joint=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8),legMat);joint.position.set(side*0.3,0.35,z);group.add(joint);
const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.04,0.3,6),legMat);
leg.position.set(side*0.35,0.12,z);leg.rotation.z=side*0.35;group.add(leg);}
if(i%2===0&&i>0){const leafMat=mat(0x4a8a3a,0.8);
const l1=new THREE.Mesh(new THREE.PlaneGeometry(0.2,0.1),leafMat);
l1.position.set(0,0.85,z);l1.rotation.x=0.5;l1.rotation.z=0.2;group.add(l1);
const l2=new THREE.Mesh(new THREE.PlaneGeometry(0.15,0.08),leafMat);
l2.position.set(0.25,0.75,z);l2.rotation.x=-0.4;l2.rotation.z=-0.3;group.add(l2);}}
const head=new THREE.Mesh(new THREE.SphereGeometry(0.35,12,12),mat(0x3a5a3a,0.8));
head.scale.set(1,1.1,0.9);head.position.set(0,0.6,1.8);group.add(head);
const eyeMat=mat(RED_EYE,0.1,0.1,RED_EYE,0.4);
for(let i=0;i<2;i++){const eye=new THREE.Mesh(new THREE.SphereGeometry(0.08,12,12),eyeMat);
eye.position.set(i===0?-0.2:0.2,0.8,2.0);group.add(eye);}
const tailGlow=new THREE.Mesh(new THREE.SphereGeometry(0.18,12,12),mat(0x66ff66,0.1,0.1,0x66ff66,0.7));
tailGlow.position.set(0,0.2,-2.45);group.add(tailGlow);
return group;}

function createBear(){
const group=new THREE.Group();
const furMat=mat(0x5a3d2c,0.9,0.05),darkFur=mat(0x3a2518,0.9,0.05);
const body=new THREE.Mesh(new THREE.SphereGeometry(0.95,24,24),furMat);
body.scale.set(1.2,1.0,1.3);body.position.set(0,0.75,0.2);group.add(body);
const belly=new THREE.Mesh(new THREE.SphereGeometry(0.6,20,20),mat(0x4a3320,0.9));
belly.scale.set(0.9,0.8,0.8);belly.position.set(0,0.5,0.5);group.add(belly);
const head=new THREE.Mesh(new THREE.SphereGeometry(0.7,24,24),furMat);head.position.set(0,1.1,1.2);group.add(head);
const snout=new THREE.Mesh(new THREE.SphereGeometry(0.35,16,16),mat(0x4a3520,0.7));
snout.scale.set(0.9,0.7,0.7);snout.position.set(0,0.95,1.75);group.add(snout);
const nose=new THREE.Mesh(new THREE.SphereGeometry(0.1,12,12),mat(0x1a1a1a,0.5));
nose.position.set(0,1.0,2.0);group.add(nose);
const eyeMat=mat(RED_EYE,0.1,0.1,RED_EYE,0.2);
for(let i=-1;i<=1;i+=2){const eye=new THREE.Mesh(new THREE.SphereGeometry(0.1,12,12),eyeMat);
eye.position.set(i*0.25,1.3,1.75);group.add(eye);}
for(let i=-1;i<=1;i+=2){const ear=new THREE.Mesh(new THREE.SphereGeometry(0.2,12,12),darkFur);
ear.position.set(i*0.4,1.75,1.0);group.add(ear);}
const legMat=mat(0x3a2518,0.9);
[{x:-0.55,z:0.8},{x:0.55,z:0.8},{x:-0.45,z:-0.5},{x:0.45,z:-0.5}].forEach(p=>{
const joint=new THREE.Mesh(new THREE.SphereGeometry(0.15,10,10),legMat);joint.position.set(p.x,0.65,p.z);group.add(joint);
const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.22,0.25,0.7,10),legMat);leg.position.set(p.x,0.3,p.z);group.add(leg);});
return group;}

function createSquirrel(){
const group=new THREE.Group();
const furMat=mat(0xd97a38,0.8,0.05),bellyMat=mat(0xf5c99b,0.8),darkMat=mat(0x8b4513,0.8);
const body=new THREE.Mesh(new THREE.SphereGeometry(0.55,20,20),furMat);
body.scale.set(1,0.9,1.2);body.position.set(0,0.55,0);group.add(body);
const belly=new THREE.Mesh(new THREE.SphereGeometry(0.35,16,16),bellyMat);
belly.scale.set(0.8,0.8,0.8);belly.position.set(0,0.45,0.2);group.add(belly);
const head=new THREE.Mesh(new THREE.SphereGeometry(0.38,16,16),furMat);head.position.set(0,0.85,0.9);group.add(head);
const eyeMat=mat(0x111111,0.2);
for(let i=-1;i<=1;i+=2){const eye=new THREE.Mesh(new THREE.SphereGeometry(0.08,12,12),eyeMat);
eye.position.set(i*0.18,0.95,1.2);group.add(eye);}
for(let i=-1;i<=1;i+=2){const ear=new THREE.Mesh(new THREE.ConeGeometry(0.12,0.2,8),darkMat);
ear.position.set(i*0.15,1.15,0.85);ear.rotation.x=0.2;group.add(ear);}
for(let i=-1;i<=1;i+=2){
const fj=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8),darkMat);fj.position.set(i*0.18,0.3,0.38);group.add(fj);
const fl=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.05,0.25,6),darkMat);
fl.position.set(i*0.2,0.15,0.4);fl.rotation.z=i*0.3;group.add(fl);
const bj=new THREE.Mesh(new THREE.SphereGeometry(0.06,8,8),darkMat);bj.position.set(i*0.18,0.3,-0.32);group.add(bj);
const bl=new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.05,0.25,6),darkMat);
bl.position.set(i*0.2,0.15,-0.3);bl.rotation.z=i*0.3;group.add(bl);}
const tailCurve=new THREE.CatmullRomCurve3([
new THREE.Vector3(0,0.6,-0.72),new THREE.Vector3(0,1.0,-1.05),new THREE.Vector3(0,1.5,-1.15),
new THREE.Vector3(0,1.8,-0.75),new THREE.Vector3(0,1.75,-0.25),new THREE.Vector3(0,1.4,0.0),
new THREE.Vector3(0,1.0,-0.15),new THREE.Vector3(0,0.7,-0.45)]);
const tail=new THREE.Mesh(new THREE.TubeGeometry(tailCurve,40,0.13,10,false),furMat);group.add(tail);
const tailTip=new THREE.Mesh(new THREE.SphereGeometry(0.18,12,12),mat(0xf0a060));
tailTip.position.set(0,0.7,-0.45);group.add(tailTip);
return group;}

function createWolf(){
const group=new THREE.Group();
const furMat=mat(0x4a4a4a,0.9,0.1),lightFur=mat(0x7a7a7a,0.8),darkFur=mat(0x2a2a2a,0.9);
const body=new THREE.Mesh(new THREE.SphereGeometry(0.75,24,24),furMat);
body.scale.set(0.85,0.82,1.65);body.position.set(0,0.7,0.1);group.add(body);
const chest=new THREE.Mesh(new THREE.SphereGeometry(0.42,16,16),lightFur);
chest.scale.set(0.85,0.85,0.8);chest.position.set(0,0.55,0.95);group.add(chest);
const headBase=new THREE.Mesh(new THREE.SphereGeometry(0.48,20,20),furMat);headBase.position.set(0,1.0,1.0);group.add(headBase);
const snout=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.2,0.6,10),lightFur);
snout.position.set(0,0.95,1.45);snout.rotation.x=Math.PI/2;group.add(snout);
const nose=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),mat(0x111111,0.5));nose.position.set(0,0.95,1.8);group.add(nose);
const eyeMat=mat(RED_EYE,0.1,0.1,RED_EYE,0.4);
for(let i=-1;i<=1;i+=2){const eye=new THREE.Mesh(new THREE.SphereGeometry(0.09,12,12),eyeMat);
eye.position.set(i*0.2,1.2,1.35);group.add(eye);}
for(let i=-1;i<=1;i+=2){const ear=new THREE.Mesh(new THREE.ConeGeometry(0.14,0.4,8),darkFur);
ear.position.set(i*0.22,1.5,0.95);ear.rotation.z=i*0.15;ear.rotation.x=0.2;group.add(ear);}
const legMat=mat(0x3a3a3a,0.8);
[{x:-0.4,z:0.75},{x:0.4,z:0.75},{x:-0.35,z:-0.5},{x:0.35,z:-0.5}].forEach(p=>{
const joint=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,8),legMat);joint.position.set(p.x,0.6,p.z);group.add(joint);
const leg=new THREE.Mesh(new THREE.CylinderGeometry(0.11,0.13,0.75,8),legMat);leg.position.set(p.x,0.25,p.z);group.add(leg);});
[{y:0.75,z:-0.9,rx:0.5,rT:0.09,rB:0.12,h:0.5},{y:0.55,z:-1.25,rx:0.75,rT:0.07,rB:0.09,h:0.5},
{y:0.35,z:-1.55,rx:1.0,rT:0.05,rB:0.07,h:0.45},{y:0.2,z:-1.8,rx:1.25,rT:0.03,rB:0.05,h:0.4},
{y:0.1,z:-2.0,rx:1.45,rT:0.02,rB:0.03,h:0.35}].forEach(s=>{
const seg=new THREE.Mesh(new THREE.CylinderGeometry(s.rT,s.rB,s.h,8),darkFur);
seg.position.set(0,s.y,s.z);seg.rotation.x=s.rx;group.add(seg);});
return group;}

const FACTORY={spider:createSpider,beetle:createBeetle,bug:createMossBug,bear:createBear,squirrel:createSquirrel,wolf:createWolf};
const FACE_OFF={beetle:Math.PI,spider:0,bug:0,bear:0,squirrel:0,wolf:0};

function ensureBaker(){
if(baker)return true;
if(!THREE)return false;
try{
const c=document.createElement('canvas');
const r=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true,preserveDrawingBuffer:true});
r.setPixelRatio(1);r.setClearColor(0x000000,0);
r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.2;
const scene=new THREE.Scene();
scene.add(new THREE.AmbientLight(0x8db2c4,0.9));
const sun=new THREE.DirectionalLight(0xfff5e6,4.5);sun.position.set(10,15,5);scene.add(sun);
const fill=new THREE.DirectionalLight(0xb3d0e0,1.0);fill.position.set(-5,2,-3);scene.add(fill);
const camera=new THREE.PerspectiveCamera(45,1,0.1,500);
baker={renderer:r,scene,camera,canvas:c};
return true;
}catch(e){console.warn('MobBaker init failed',e);return false;}}

function fitCamera(model){
model.updateMatrixWorld(true);
let box=new THREE.Box3().setFromObject(model);
model.position.x-=(box.max.x+box.min.x)/2;
model.position.z-=(box.max.z+box.min.z)/2;
model.position.y-=box.min.y;
model.updateMatrixWorld(true);
box=new THREE.Box3().setFromObject(model);
const c=box.getCenter(new THREE.Vector3());
const s=box.getBoundingSphere(new THREE.Sphere());
const R=s.radius*1.12;
const dirV=new THREE.Vector3(7,9,10.5).normalize().multiplyScalar(R*2.6);
baker.camera.position.copy(dirV);
baker.camera.lookAt(0,c.y*0.9,0);
baker.camera.updateMatrixWorld(true);
model.userData.baseY=model.position.y;}

function bakeType(type,isBoss){
if(!ensureBaker()||ready[type]||pending[type])return;
pending[type]=true;
try{
const cell=isBoss?BOSS_CELL:CELL;
baker.renderer.setSize(cell,cell,false);
const model=FACTORY[type]();
baker.scene.add(model);
fitCamera(model);
const atlas=document.createElement('canvas');
atlas.width=cell*DIRS;atlas.height=cell*FRAMES;
const ctx=atlas.getContext('2d');
const faceOff=FACE_OFF[type]||0;
for(let d=0;d<DIRS;d++){
const alpha=(d/DIRS)*Math.PI*2;
for(let f=0;f<FRAMES;f++){
const t=f/FRAMES;
model.rotation.y=THETA0-alpha+faceOff+Math.sin(t*Math.PI*2)*0.06;
model.position.y=model.userData.baseY+Math.sin(t*Math.PI*2)*0.08;
baker.renderer.render(baker.scene,baker.camera);
ctx.drawImage(baker.canvas,0,0,cell,cell,d*cell,f*cell,cell,cell);}}
baker.scene.remove(model);
atlases[type]=atlas;ready[type]=true;
}catch(e){console.warn('bake failed',type,e);}
pending[type]=false;}

function request(type,isBoss){
if(ready[type]||pending[type])return;
setTimeout(()=>bakeType(type,isBoss),50);}
function isReady(type){return !!ready[type];}
function getSprite(type,dir,frame){
const atlas=atlases[type];if(!atlas)return null;
const cell=(type==='wolf'||type==='bear')?BOSS_CELL:CELL;
const sx=((dir%DIRS)+DIRS)%DIRS*cell, sy=((frame%FRAMES)+FRAMES)%FRAMES*cell;
return {atlas,sx,sy,sw:cell,sh:cell};}
return {request,isReady,getSprite};
})();
