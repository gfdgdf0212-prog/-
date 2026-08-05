'use strict';
function ell(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,TAU);ctx.fill();}
function rr(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);
ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function radg(x,y,r0,r1,stops){const g=ctx.createRadialGradient(x,y,r0,x,y,r1);
for(const s of stops)g.addColorStop(s[0],s[1]);return g;}
function drawSceneryObj(s){
const swayBase=Math.sin(windT*.7)*3+gust*7;
const sway=(Math.sin(windT*1.1+s.ph)*2+swayBase)*s.sw;
if(s.type==='bush'){
const r=14*s.s;
ctx.fillStyle='rgba(38,62,48,.92)';
ctx.beginPath();ctx.arc(s.x+sway*.4,s.y-r*.5,r,0,TAU);ctx.arc(s.x-r*.6+sway*.3,s.y-r*.2,r*.7,0,TAU);ctx.arc(s.x+r*.6+sway*.3,s.y-r*.2,r*.7,0,TAU);ctx.fill();
ctx.fillStyle='rgba(56,92,68,.7)';ctx.beginPath();ctx.arc(s.x-r*.2+sway*.4,s.y-r*.8,r*.5,0,TAU);ctx.fill();
}else{
const h=70*s.s,r=24*s.s;
ctx.fillStyle='rgba(30,44,36,.95)';
ctx.beginPath();ctx.moveTo(s.x-3*s.s,s.y);ctx.lineTo(s.x-2*s.s+sway*.3,s.y-h*.6);ctx.lineTo(s.x+2*s.s+sway*.3,s.y-h*.6);ctx.lineTo(s.x+3*s.s,s.y);ctx.closePath();ctx.fill();
ctx.fillStyle='rgba(34,56,44,.95)';
ctx.beginPath();ctx.arc(s.x+sway*.6,s.y-h*.7,r,0,TAU);ctx.arc(s.x-r*.6+sway*.5,s.y-h*.5,r*.7,0,TAU);ctx.arc(s.x+r*.6+sway*.5,s.y-h*.5,r*.7,0,TAU);ctx.fill();
ctx.fillStyle='rgba(44,72,56,.7)';ctx.beginPath();ctx.arc(s.x+sway*.6,s.y-h*.95,r*.6,0,TAU);ctx.fill();
}
}
 /* ── ОПТИМИЗАЦИЯ: кэш спрайтов свечения вместо shadowBlur ── */
const glowCache={};
function glowSprite(rgb){let c=glowCache[rgb];if(c)return c;
c=document.createElement('canvas');c.width=c.height=32;
const g=c.getContext('2d');const gr=g.createRadialGradient(16,16,0,16,16,16);
gr.addColorStop(0,'rgba('+rgb+',.85)');gr.addColorStop(.35,'rgba('+rgb+',.32)');gr.addColorStop(1,'rgba('+rgb+',0)');
g.fillStyle=gr;g.fillRect(0,0,32,32);glowCache[rgb]=c;return c;}
function drawGlow(x,y,r,rgb){ctx.drawImage(glowSprite(rgb),x-r,y-r,r*2,r*2);}
let orbSprite=null,trailSprite=null,thornSprite=null;
function shotSprites(){if(orbSprite)return;
orbSprite=document.createElement('canvas');orbSprite.width=orbSprite.height=24;
let g=orbSprite.getContext('2d');
let gr=g.createRadialGradient(12,12,0,12,12,12);
gr.addColorStop(0,'rgba(255,230,160,.95)');gr.addColorStop(.4,'rgba(255,190,90,.5)');gr.addColorStop(1,'rgba(255,190,90,0)');
g.fillStyle=gr;g.fillRect(0,0,24,24);
gr=g.createRadialGradient(11.2,11.2,.4,12,12,3);
gr.addColorStop(0,'#fffbe8');gr.addColorStop(1,'#f0b45a');
g.fillStyle=gr;g.beginPath();g.arc(12,12,3,0,TAU);g.fill();
trailSprite=document.createElement('canvas');trailSprite.width=20;trailSprite.height=6;
g=trailSprite.getContext('2d');
const lg=g.createLinearGradient(0,3,20,3);
lg.addColorStop(0,'rgba(255,190,90,0)');lg.addColorStop(1,'rgba(255,210,120,.55)');
g.fillStyle=lg;g.fillRect(0,0,20,6);
thornSprite=document.createElement('canvas');thornSprite.width=36;thornSprite.height=10;
g=thornSprite.getContext('2d');
const lg2=g.createLinearGradient(0,5,26,5);
lg2.addColorStop(0,'rgba(160,210,120,0)');lg2.addColorStop(1,'rgba(200,235,150,.5)');
g.fillStyle=lg2;g.fillRect(0,4,26,2.4);
const lg3=g.createLinearGradient(20,5,35,5);
lg3.addColorStop(0,'#5a7a40');lg3.addColorStop(1,'#e8f6c0');
g.fillStyle=lg3;g.beginPath();g.moveTo(35,5);g.lineTo(20,1.8);g.lineTo(22,5);g.lineTo(20,8.2);g.closePath();g.fill();}
function drawFlies(dt){
for(const f of flies){f.y-=f.s*dt*.008;if(f.y<-.02){f.y=1.02;f.x=Math.random();}
const x=(f.x+Math.sin(T*.5+f.p)*.012)*W+gust*10,y=f.y*H;
const a=clamp(.22+.34*Math.sin(T*2+f.p),0,1);if(a<=0)continue;
ctx.globalAlpha=a;drawGlow(x,y,7,f.c);
ctx.fillStyle='rgba('+f.c+','+a.toFixed(2)+')';
ctx.beginPath();ctx.arc(x,y,1.8,0,TAU);ctx.fill();ctx.globalAlpha=1;}}
/* 2D-трава: только как fallback, когда 3D выключена/недоступна */
function drawGrassRing(){
const rx=FRR, ry=FRR*ISO;
const clumps=80;
const bladesPerClump=4;
const q=S.gfx.particles;const mul=q==='low'?0.5:q==='high'?1.3:1;
const n=Math.round(clumps*mul);
for(let i=0;i<n;i++){
const a=i/n*TAU;
const bx=cx+Math.cos(a)*rx;
const by=cy+Math.sin(a)*ry;
for(let j=0;j<bladesPerClump;j++){
const seed=i*31+j*17;
const dx=((seed*13)%100/100-.5)*9;
const dy=((seed*7)%100/100-.5)*4.5;
const x=bx+dx;
const y=by+dy;
const h=4+((seed*23)%100/100)*4+Math.sin(T*2+i*0.7+j)*1.5;
const sway=Math.sin(T*3+i*0.5+j*1.3)*2.5+gust*3+(((seed*41)%100/100)-.5)*2;
const lean=(((seed*59)%100/100)-.5)*0.4;
ctx.strokeStyle='rgba('+(j%2?'100,150,90':'120,170,100')+','+(0.55+((seed*71)%100/100)*0.2).toFixed(2)+')';
ctx.lineWidth=1.2+((seed*83)%100/100)*0.8;
ctx.beginPath();
ctx.moveTo(x,y);
ctx.quadraticCurveTo(x+sway*0.6+lean*h,y-h*0.6,x+sway*1.5+lean*h,y-h);
ctx.stroke();}}}
function drawRadiusIndicator(){
if(!showRadiusCheat)return;
const rx=FRR, ry=FRR*ISO;
ctx.strokeStyle='rgba(255,255,100,.85)';
ctx.lineWidth=2;
ctx.setLineDash([8,4]);
ctx.beginPath();
ctx.ellipse(cx,cy,rx,ry,0,0,TAU);
ctx.stroke();
ctx.setLineDash([]);
const cs=10;
ctx.strokeStyle='rgba(255,80,80,.95)';
ctx.lineWidth=2;
ctx.beginPath();
ctx.moveTo(cx-cs,cy);ctx.lineTo(cx+cs,cy);
ctx.moveTo(cx,cy-cs);ctx.lineTo(cx,cy+cs);
ctx.stroke();
ctx.fillStyle='rgba(255,80,80,1)';
ctx.beginPath();ctx.arc(cx,cy,3,0,TAU);ctx.fill();
ctx.fillStyle='rgba(255,255,100,.7)';
ctx.font='700 11px Manrope, sans-serif';
ctx.textAlign='center';
ctx.fillText('R='+Math.round(FRR),cx,cy-ry-8);
ctx.fillStyle='rgba(255,80,80,.9)';
ctx.font='700 9px Manrope, sans-serif';
ctx.fillText('ЦЕНТР',cx,cy+cs+12);}
function drawZones(){
for(const z of zones){
if(z.kind==='vine'){
const pr=smooth(clamp(z.t/z.dur,0,1));const sweep=pr*Math.PI*1.1*z.side;
ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=10;ctx.lineCap='round';
ctx.beginPath();
for(let k=0;k<=14;k++){const a=z.dir+sweep*(k/14);const r=z.R*(k/14);
const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*ISO+4;k===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
ctx.stroke();
const layers=[['rgba(38,66,30,.95)',9],['rgba(96,150,70,.95)',5.5],['rgba(170,220,130,.8)',2]];
for(const [c,w] of layers){ctx.strokeStyle=c;ctx.lineWidth=w;ctx.lineCap='round';
ctx.beginPath();
for(let k=0;k<=14;k++){const a=z.dir+sweep*(k/14);const r=z.R*(k/14);
const wig=Math.sin(k*1.7+z.t*20)*2.2*(k/14);
const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*ISO+wig;k===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}
ctx.stroke();}
for(let k=3;k<=14;k+=3){const a=z.dir+sweep*(k/14);const r=z.R*(k/14);
const x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*ISO;
ctx.fillStyle='rgba(140,200,100,.9)';ctx.save();ctx.translate(x,y);ctx.rotate(a+1.2);
ctx.beginPath();ctx.ellipse(0,0,5,2.2,0,0,TAU);ctx.fill();ctx.restore();}
}else if(z.kind==='spore'){
const fade=z.t>z.dur-0.6?clamp((z.dur-z.t)/0.6,0,1):1;const x=cx+z.x,y=cy+z.y*ISO;
ctx.fillStyle='rgba(0,0,0,'+(0.22*fade).toFixed(2)+')';ell(x,y+z.r*.55,z.r*.9,z.r*.34);
ctx.save();ctx.globalAlpha=fade;
const puffs=[[0,0,1],[-.5,.2,.6],[.5,.25,.62],[.15,-.35,.55],[-.25,-.3,.5]];
for(const p of puffs){const px=x+p[0]*z.r*.5,py=y-6+p[1]*z.r*.4,pr2=z.r*p[2]*(1+0.08*Math.sin(T*3+p[0]*9));
ctx.fillStyle=radg(px,py,2,pr2,[[0,'rgba(190,235,130,.55)'],[.6,'rgba(140,200,80,.3)'],[1,'rgba(120,180,70,0)']]);
ctx.beginPath();ctx.arc(px,py,pr2,0,TAU);ctx.fill();}
ctx.restore();
for(let k=0;k<6;k++){const a=T*1.5+k*1.05;const rr2=z.r*(0.35+0.3*((k*0.618)%1));
ctx.fillStyle='rgba(200,240,140,'+(0.4*fade).toFixed(2)+')';
ctx.beginPath();ctx.arc(x+Math.cos(a)*rr2,y-6+Math.sin(a)*rr2*0.6,2.2,0,TAU);ctx.fill();}
}else if(z.kind==='trap'){
const ph=z.t/z.dur;const rise=clamp(ph/0.25,0,1);const close=clamp((ph-0.25)/0.3,0,1);const sink=ph>0.8?clamp((ph-0.8)/0.2,0,1):0;
const x=cx+z.x,y=cy+z.y*ISO;const h=44*rise*(1-sink);const inward=close*0.62;
ctx.fillStyle='rgba(0,0,0,'+(0.25*(1-sink)).toFixed(2)+')';ell(x,y,z.R,z.R*ISO*.9);
for(let k=0;k<7;k++){const a=k/7*TAU+0.3;
const bx=x+Math.cos(a)*z.R,by=y+Math.sin(a)*z.R*ISO;
const tx2=x+Math.cos(a)*z.R*(1-inward),ty2=y+Math.sin(a)*z.R*(1-inward)*ISO-h;
const mxp=(bx+tx2)/2+Math.sin(a*3)*4,myp=(by+ty2)/2-7;
ctx.strokeStyle='rgba(30,20,12,'+(0.9*(1-sink)).toFixed(2)+')';ctx.lineWidth=7;ctx.lineCap='round';
ctx.beginPath();ctx.moveTo(bx,by);ctx.quadraticCurveTo(mxp,myp,tx2,ty2);ctx.stroke();
ctx.strokeStyle='rgba(122,86,54,'+(0.85*(1-sink)).toFixed(2)+')';ctx.lineWidth=3.4;
ctx.beginPath();ctx.moveTo(bx,by-1);ctx.quadraticCurveTo(mxp,myp-2,tx2,ty2);ctx.stroke();
ctx.fillStyle='rgba(225,255,215,'+(0.8*(1-sink)).toFixed(2)+')';
ctx.beginPath();ctx.moveTo(tx2,ty2-6);ctx.lineTo(tx2-3,ty2+2);ctx.lineTo(tx2+3,ty2+2);ctx.closePath();ctx.fill();}
}else if(z.kind==='puddle'){
const fade=z.t>z.dur-0.6?clamp((z.dur-z.t)/0.6,0,1):Math.min(1,z.t*4);const x=cx+z.x,y=cy+z.y*ISO;
ctx.save();ctx.globalAlpha=fade;
ctx.fillStyle=radg(x,y,2,z.r,[[0,'rgba(190,240,110,.65)'],[.7,'rgba(140,200,70,.45)'],[1,'rgba(140,200,70,0)']]);
ctx.beginPath();ctx.ellipse(x,y,z.r,z.r*ISO,0,0,TAU);ctx.fill();
ctx.strokeStyle='rgba(210,250,150,.55)';ctx.lineWidth=2;
ctx.beginPath();ctx.ellipse(x,y,z.r*.92,z.r*ISO*.92,0,0,TAU);ctx.stroke();
ctx.fillStyle='rgba(255,255,220,.25)';ctx.beginPath();ctx.ellipse(x-z.r*.3,y-z.r*ISO*.3,z.r*.3,z.r*.12,-.4,0,TAU);ctx.fill();
ctx.restore();
for(let k=0;k<3;k++){const a=T*2+k*2.1;const bx2=x+Math.cos(a)*z.r*.5,by2=y+Math.sin(a)*z.r*ISO*.5;
const bp=(T*1.5+k*.7)%1;
ctx.fillStyle='rgba(220,250,160,'+(0.5*(1-bp)*fade).toFixed(2)+')';
ctx.beginPath();ctx.arc(bx2,by2-bp*8,1.6+bp*1.4,0,TAU);ctx.fill();}
}
}
}
function drawRoots(){
for(const p of roots){
const Tx=cx+p.tx,Ty=cy+p.ty*ISO;
if(p.phase==='telegraph'){
const pr=p.strikeT/0.16;
ctx.fillStyle='rgba(92,66,40,'+(0.5*pr).toFixed(2)+')';ell(Tx,Ty,12+8*pr,5+3*pr);
ctx.strokeStyle='rgba(240,168,72,'+(0.45*pr).toFixed(2)+')';ctx.lineWidth=2;ctx.setLineDash([5,5]);
ctx.beginPath();ctx.ellipse(Tx,Ty,16,16*ISO,0,0,TAU);ctx.stroke();ctx.setLineDash([]);
}else if(p.phase==='spike'){
const pr=clamp(p.spikeT/0.24,0,1);const up=Math.sin(Math.min(1,pr*1.4)*Math.PI);const len=46*up;
ctx.strokeStyle='rgba(40,26,14,.8)';ctx.lineWidth=2;
ctx.beginPath();ctx.ellipse(Tx,Ty+2,10,4.5,0,0,TAU);ctx.stroke();
ctx.lineCap='round';
ctx.strokeStyle='rgba(74,50,30,.95)';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(Tx,Ty+4);ctx.lineTo(Tx,Ty-len);ctx.stroke();
ctx.strokeStyle='rgba(140,100,64,.9)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(Tx,Ty+4);ctx.lineTo(Tx,Ty-len);ctx.stroke();
ctx.fillStyle='rgba(225,255,215,.95)';ctx.beginPath();ctx.moveTo(Tx,Ty-len-8);ctx.lineTo(Tx-4,Ty-len+4);ctx.lineTo(Tx+4,Ty-len+4);ctx.closePath();ctx.fill();
ctx.save();ctx.globalCompositeOperation='lighter';
ctx.fillStyle=radg(Tx,Ty-len,0,14,[[0,'rgba(225,255,215,.8)'],[1,'rgba(140,230,160,0)']]);
ctx.beginPath();ctx.arc(Tx,Ty-len,14,0,TAU);ctx.fill();ctx.restore();
if(Math.random()<.6)parts.push({x:p.tx+rand(-7,7),y:p.ty*ISO+rand(-2,3),vx:rand(-16,16),vy:rand(-20,-3),l:.35,ml:.35,sz:rand(1.4,2.6),c:'92,66,40'});
}else{
const pr=clamp(p.t,0,1);ctx.fillStyle='rgba(92,66,40,'+(0.4*pr).toFixed(2)+')';ell(Tx,Ty,12*pr,5*pr);
}
}
}
/* ── 3D-дерево + 3D-ТРАВА (инстансинг модели; модель меняется одной константой) ── */
const Tree3D=(()=>{
const SIZE=448, BASE_Y=0.57;
/* ТРАВА ТЕПЕРЬ 2D-ИЗОМЕТРИЧЕСКАЯ на основном canvas (см. drawGrassRing ниже);
3D-модуль отвечает только за дерево и тени. */
let renderer,scene,camera;
let treeGroup,rootsGroup,ground;
let leafInstancedMesh=null;
let glCanvas=null,groundCanvas=null,treeCanvas=null,gctx=null,tctx=null;
let builtT=-1,ready=false,needGround=true;
let lastTreeRender=0,treeDirty=true;
let barkMat,barkDarkMat,leafMaterial,leafGeom;
function pseudoRandom(seed){let s=seed;return()=>{s=(s*16807+0)%2147483647;return(s-1)/2147483646;};}
function percentToAmplitude(p){return(p/100)*0.15;}
function ensureAssets(){
if(!barkMat){
barkMat=new THREE.MeshStandardMaterial({color:0x6b5138,roughness:0.85});
barkDarkMat=new THREE.MeshStandardMaterial({color:0x4a3826,roughness:0.9});
if(THREE.Plane){barkDarkMat.clippingPlanes=[new THREE.Plane(new THREE.Vector3(0,1,0),0.25)];barkDarkMat.clipShadows=true;}
leafMaterial=new THREE.MeshStandardMaterial({color:0x4b9463,roughness:0.4,side:THREE.DoubleSide});
const s=new THREE.Shape();s.moveTo(0,-0.5);s.bezierCurveTo(0.2,-0.3,0.3,0.3,0,0.5);s.bezierCurveTo(-0.3,0.3,-0.2,-0.3,0,-0.5);
leafGeom=new THREE.ShapeGeometry(s);leafGeom.scale(0.35,0.35,0.35);}}
function mergeGeoms(list){
if(!list.length)return null;
let vCount=0,iCount=0;
for(const g of list){vCount+=g.attributes.position.count;iCount+=g.index?g.index.count:0;}
const pos=new Float32Array(vCount*3),nor=new Float32Array(vCount*3),uv=new Float32Array(vCount*2);
const idx=vCount>65535?new Uint32Array(iCount):new Uint16Array(iCount);
let vOff=0,iOff=0;
for(const g of list){
pos.set(g.attributes.position.array,vOff*3);
if(g.attributes.normal)nor.set(g.attributes.normal.array,vOff*3);
if(g.attributes.uv)uv.set(g.attributes.uv.array,vOff*2);
if(g.index){for(let i=0;i<g.index.count;i++)idx[iOff+i]=g.index.getX(i)+vOff;iOff+=g.index.count;}
vOff+=g.attributes.position.count;
g.dispose();}
const out=new THREE.BufferGeometry();
out.setAttribute('position',new THREE.BufferAttribute(pos,3));
out.setAttribute('normal',new THREE.BufferAttribute(nor,3));
out.setAttribute('uv',new THREE.BufferAttribute(uv,2));
if(iCount)out.setIndex(new THREE.BufferAttribute(idx,1));
return out;}
function init(){
if(!THREE){ready=false;return;}
try{
glCanvas=document.createElement('canvas');glCanvas.width=SIZE;glCanvas.height=SIZE;
renderer=new THREE.WebGLRenderer({canvas:glCanvas,alpha:true,antialias:true,preserveDrawingBuffer:false});
renderer.setSize(SIZE,SIZE);renderer.setPixelRatio(1);renderer.setClearColor(0x000000,0);
renderer.localClippingEnabled=true;
renderer.shadowMap.enabled=S.gfx.shadows;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate=false;
renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
scene=new THREE.Scene();
camera=new THREE.PerspectiveCamera(45,1,0.5,80);
camera.position.set(7,9,10.5);camera.lookAt(0,1.3,0);
camera.updateMatrixWorld(true);
scene.add(new THREE.AmbientLight(0x8db2c4,0.9));
const sun=new THREE.DirectionalLight(0xfff5e6,4.5);
sun.position.set(10,15,5);sun.castShadow=S.gfx.shadows;
sun.shadow.mapSize.width=1024;sun.shadow.mapSize.height=1024;
sun.shadow.camera.near=0.5;sun.shadow.camera.far=60;
sun.shadow.camera.left=-12;sun.shadow.camera.right=12;
sun.shadow.camera.top=12;sun.shadow.camera.bottom=-6;
sun.bias=-0.0002;sun.shadow.normalBias=0.02;
scene.add(sun);
const fill=new THREE.DirectionalLight(0xb3d0e0,1.0);fill.position.set(-5,2,-3);scene.add(fill);
ground=new THREE.Mesh(new THREE.CircleGeometry(40,48),new THREE.ShadowMaterial({opacity:0.42}));
ground.rotation.x=-Math.PI/2;ground.position.y=0;ground.receiveShadow=true;scene.add(ground);
treeGroup=new THREE.Group();rootsGroup=new THREE.Group();
scene.add(treeGroup);scene.add(rootsGroup);
groundCanvas=document.createElement('canvas');groundCanvas.width=SIZE;groundCanvas.height=SIZE;gctx=groundCanvas.getContext('2d');
treeCanvas=document.createElement('canvas');treeCanvas.width=SIZE;treeCanvas.height=SIZE;tctx=treeCanvas.getContext('2d');
ensureAssets();ready=true;
}catch(e){ready=false;console.warn('3D init failed',e);}
}
function clearGroup(g){while(g.children.length){const c=g.children[0];g.remove(c);
if(c.geometry&&c.geometry!==leafGeom)c.geometry.dispose();}}
function buildCollar(baseR,randFn,darkList){
const pts=[];const h=baseR*2.0;
for(let i=0;i<=6;i++){const tt=i/6;pts.push(new THREE.Vector2(baseR*0.75+baseR*0.85*(1-Math.pow(tt,0.65)),tt*h));}
darkList.push(new THREE.LatheGeometry(pts,12));
const up=new THREE.Vector3(0,1,0);
for(let k=0;k<5;k++){const a=(k/5)*Math.PI*2+randFn()*0.7;
const g=new THREE.SphereGeometry(baseR*0.55,6,5);
const m=new THREE.Matrix4().compose(
new THREE.Vector3(Math.cos(a)*baseR*1.15,baseR*0.22,Math.sin(a)*baseR*1.15),
new THREE.Quaternion().setFromAxisAngle(up,randFn()*Math.PI),
new THREE.Vector3(1.35,0.55,1.35));
g.applyMatrix4(m);darkList.push(g);}}
function createRootGeom(start,directionAngle,straightLength,numDolphins,randFn,cfg){
const points=[];const segments=20;const dirX=Math.cos(directionAngle),dirZ=Math.sin(directionAngle);
const baseAmp=percentToAmplitude(cfg.baseWavinessPercent);const tipAmp=cfg.tipWaviness;const baseTh=cfg.baseThickness;
const dolphinPositions=[];
if(numDolphins>0){for(let i=0;i<numDolphins;i++){const tt=(i+0.5)/numDolphins+(randFn()-0.5)*0.2/numDolphins;
dolphinPositions.push(Math.max(0.1,Math.min(0.9,tt)));}dolphinPositions.sort((a,b)=>a-b);}
for(let i=0;i<=segments;i++){const tt=i/segments;const dist=tt*straightLength;
const x=start.x+dirX*dist;const z=start.z+dirZ*dist;
let y=start.y-tt*0.6-Math.pow(tt,2)*0.4;
const transition=tt<0.3?0:(tt-0.3)/0.4;
const amplitude=baseAmp+(tipAmp-baseAmp)*Math.min(1,transition);
const vertWave=Math.sin(tt*Math.PI*2.5+randFn()*6)*amplitude;
const lateralWave=Math.cos(tt*Math.PI*3.2+randFn()*5)*0.25;
y+=vertWave;
for(const dp of dolphinPositions){const dtd=Math.abs(tt-dp);const width=0.12/numDolphins+0.08;
if(dtd<width){const factor=Math.cos((dtd/width)*Math.PI*0.5);const height=(0.2+amplitude*2.5)*0.7;y+=height*factor;}}
const perpX=-dirZ,perpZ=dirX;
points.push(new THREE.Vector3(x+perpX*lateralWave,y,z+perpZ*lateralWave));}
const curve=new THREE.CatmullRomCurve3(points);
return new THREE.TubeGeometry(curve,segments,baseTh*0.5,5,false);}
function addBranches(start,length,radius,angleY,angleZ,depth,maxDepth,randFn,leafAcc,cfg,barkList){
const dir=new THREE.Vector3(Math.cos(angleY)*Math.sin(angleZ),Math.cos(angleZ),Math.sin(angleY)*Math.sin(angleZ)).normalize();
const end=start.clone().add(dir.clone().multiplyScalar(length));
const mid=start.clone().add(end).multiplyScalar(0.5);
const g=new THREE.CylinderGeometry(radius*0.8,radius,length,5);
g.applyMatrix4(new THREE.Matrix4().compose(mid,new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir),new THREE.Vector3(1,1,1)));
barkList.push(g);
if(depth===maxDepth){
const leafCount=Math.floor((20+length*18)*cfg.leafDensity);
const clusterRadius=(0.5+length*0.4)*cfg.leafDensity;const subClusters=4;const perSub=Math.floor(leafCount/subClusters);
for(let s=0;s<subClusters;s++){const a=(s/subClusters)*Math.PI*2;const dist=clusterRadius*0.5;
const scx=end.x+Math.cos(a)*dist;const scy=end.y+(randFn()-0.5)*clusterRadius*0.8;const scz=end.z+Math.sin(a)*dist;
for(let i=0;i<perSub;i++){
const pos=new THREE.Vector3(scx+(randFn()-0.5)*clusterRadius,scy+(randFn()-0.5)*clusterRadius*0.8,scz+(randFn()-0.5)*clusterRadius);
const rot=new THREE.Euler(randFn()*Math.PI,randFn()*Math.PI,randFn()*Math.PI);
leafAcc.push({pos,rot});}}
}else{
const numChildren=depth===0?3:2;
for(let i=0;i<numChildren;i++){
const childLen=length*(0.5+randFn()*0.3);const childRadius=radius*0.7;
const childAngleY=angleY+(randFn()-0.5)*1.2;
const childAngleZ=angleZ+(randFn()-0.5)*0.8;
addBranches(end,childLen,childRadius,childAngleY,childAngleZ,depth+1,maxDepth,randFn,leafAcc,cfg,barkList);}}}
function buildLeafInstancedMesh(leafData){
if(leafInstancedMesh){treeGroup.remove(leafInstancedMesh);if(leafInstancedMesh.dispose)leafInstancedMesh.dispose();leafInstancedMesh=null;}
if(!leafData.length)return;
leafInstancedMesh=new THREE.InstancedMesh(leafGeom,leafMaterial,leafData.length);
leafInstancedMesh.castShadow=S.gfx.shadows;leafInstancedMesh.receiveShadow=false;
leafInstancedMesh.matrixAutoUpdate=false;
const dummy=new THREE.Object3D();
leafData.forEach((d,i)=>{dummy.position.copy(d.pos);dummy.rotation.copy(d.rot);dummy.updateMatrix();leafInstancedMesh.setMatrixAt(i,dummy.matrix);});
leafInstancedMesh.instanceMatrix.needsUpdate=true;treeGroup.add(leafInstancedMesh);}
function build(t){
ensureAssets();
if(leafInstancedMesh){treeGroup.remove(leafInstancedMesh);if(leafInstancedMesh.dispose)leafInstancedMesh.dispose();leafInstancedMesh=null;}
clearGroup(treeGroup);clearGroup(rootsGroup);
const cfg={
rootCount:Math.round(12+(30-12)*t),
baseThickness:0.14+(0.2-0.14)*t,
baseWavinessPercent:0,
tipWaviness:0.12+(0.15-0.12)*t,
dolphinFrequency:0.5+(0.7-0.5)*t,
leafDensity:0.5+(1.8-0.5)*t};
const randFn=pseudoRandom(42);
const gR=3.2+(5.5-3.2)*t;
const treeScale=0.5;
const trunkHeight=(3.5+gR*0.7)*treeScale;
const trunkBaseRadius=(0.35+gR*0.04)*treeScale;
const trunkTopRadius=0.08*treeScale;
const mainBranchCount=Math.floor(6+gR*2.5);
const branchLength=(gR*0.45)*treeScale;
const branchRadius=(0.1+gR*0.01)*treeScale;
const barkList=[],darkList=[];
const trunkPts=[];
for(let i=0;i<=12;i++){const tt=i/12;
trunkPts.push(new THREE.Vector2(trunkBaseRadius+(trunkTopRadius-trunkBaseRadius)*Math.pow(tt,0.6),tt*trunkHeight));}
barkList.push(new THREE.LatheGeometry(trunkPts,12));
const leafAccum=[];
for(let i=0;i<mainBranchCount;i++){
const startY=trunkHeight*(0.2+(i/mainBranchCount)*0.5);
const angleY=(i/mainBranchCount)*Math.PI*2+(randFn()-0.5)*0.5;
const angleZ=0.6+randFn()*0.5;
const len=branchLength*(0.7+randFn()*0.5);const rad=branchRadius*(0.7+randFn()*0.5);
addBranches(new THREE.Vector3(0,startY,0),len,rad,angleY,angleZ,0,2,randFn,leafAccum,cfg,barkList);}
const rootStartY=-0.06;const startRadius=0.25;
for(let i=0;i<cfg.rootCount;i++){
const baseAngle=(i/cfg.rootCount)*Math.PI*2;const angle=baseAngle+(randFn()-0.5)*0.5;
const straightLength=gR*(0.75+randFn()*0.35);
const numDolphins=Math.max(0,Math.round(straightLength*cfg.dolphinFrequency));
const start=new THREE.Vector3(Math.cos(angle)*startRadius,rootStartY,Math.sin(angle)*startRadius);
darkList.push(createRootGeom(start,angle,straightLength,numDolphins,randFn,cfg));
if(randFn()<0.4){
const branchAngle=angle+(randFn()-0.5)*1.0;const bLen=straightLength*0.5;
const branchStart=new THREE.Vector3(start.x+Math.cos(angle)*straightLength*0.35,rootStartY-0.2,start.z+Math.sin(angle)*straightLength*0.35);
const branchDolphins=Math.max(0,Math.round(bLen*cfg.dolphinFrequency*0.7));
darkList.push(createRootGeom(branchStart,branchAngle,bLen,branchDolphins,randFn,cfg));}}
buildCollar(trunkBaseRadius,randFn,darkList);
const barkGeo=mergeGeoms(barkList);
if(barkGeo){const m=new THREE.Mesh(barkGeo,barkMat);m.castShadow=m.receiveShadow=true;m.matrixAutoUpdate=false;treeGroup.add(m);}
const darkGeo=mergeGeoms(darkList);
if(darkGeo){const m=new THREE.Mesh(darkGeo,barkDarkMat);m.castShadow=m.receiveShadow=true;m.matrixAutoUpdate=false;rootsGroup.add(m);}
buildLeafInstancedMesh(leafAccum);
builtT=t;treeDirty=true;
if(S.gfx.shadows)renderer.shadowMap.needsUpdate=true;
needGround=true;}
function setColors(trunkHex,leafHex,rootHex){
if(!ready)return;ensureAssets();
barkMat.color.set(trunkHex);leafMaterial.color.set(leafHex);barkDarkMat.color.set(rootHex||trunkHex);
needGround=true;treeDirty=true;}
function setTreePose(time,shake,staticPose){
const tiltX=-0.12+(staticPose?0:Math.cos(time*0.9)*0.008);
const tiltZ=staticPose?0:Math.sin(time*1.3)*0.015+(shake||0)*0.02*Math.sin(time*60);
treeGroup.rotation.x=tiltX;treeGroup.rotation.z=tiltZ;
rootsGroup.rotation.x=0;rootsGroup.rotation.z=0;}
function setTreeColorWrite(v){[barkMat,barkDarkMat,leafMaterial].forEach(m=>{if(m){m.colorWrite=v;m.depthWrite=v;}});}
function renderShadow(t){
if(!ready)return null;
const tq=Math.round(t*50)/50;
if(tq!==builtT)build(tq);
if(needGround){
try{
setTreePose(0,0,true);
ground.visible=true;treeGroup.visible=true;rootsGroup.visible=true;
setTreeColorWrite(false);
renderer.render(scene,camera);
gctx.clearRect(0,0,SIZE,SIZE);gctx.drawImage(glCanvas,0,0,SIZE,SIZE);
}finally{
setTreeColorWrite(true);needGround=false;}}
return groundCanvas;}
function renderTree(t,time,shake){
if(!ready)return null;
const tq=Math.round(t*50)/50;
if(tq!==builtT)build(tq);
if(needGround)renderShadow(tq);
const now=performance.now();
if(!treeDirty&&shake<=0&&now-lastTreeRender<33)return treeCanvas;
lastTreeRender=now;treeDirty=false;
try{
setTreePose(time,shake,false);
ground.visible=false;treeGroup.visible=true;rootsGroup.visible=true;
setTreeColorWrite(true);
renderer.render(scene,camera);
tctx.clearRect(0,0,SIZE,SIZE);tctx.drawImage(glCanvas,0,0,SIZE,SIZE);
}finally{ground.visible=true;}
return treeCanvas;}
return{init,renderShadow,renderTree,setColors,isReady:()=>ready,BASE_Y,SIZE};
})();
function applyTreeSkin(){
const ts=TREE_SKINS[S.treeSkin]||TREE_SKINS.oak;
Tree3D.setColors(ts.trunk[0],ts.canopy[2],ts.trunk[1]);}
function drawTree2DFallback(g,ts,bx,by,t){
const h=46+54*t,R=26+38*t;
ctx.fillStyle='rgba(0,0,0,.42)';ell(bx,by+4,R*1.15,R*.42);
ctx.lineCap='round';
ctx.strokeStyle=ts.trunk[1];
for(let i=0;i<5;i++){const a=(i/4-0.5)*1.7;
ctx.lineWidth=(2.5+3*t)*(1-Math.abs(i-2)*0.2);
ctx.beginPath();ctx.moveTo(bx,by+2);
ctx.quadraticCurveTo(bx+a*16,by+7,bx+a*(26+22*t),by+11+Math.abs(a)*6);ctx.stroke();}
const tw=5+7*t;
const tg2=ctx.createLinearGradient(bx-tw,by,bx+tw,by);
tg2.addColorStop(0,ts.trunk[1]);tg2.addColorStop(.5,ts.trunk[0]);tg2.addColorStop(1,ts.trunk[1]);
ctx.fillStyle=tg2;ctx.beginPath();
ctx.moveTo(bx-tw,by);ctx.quadraticCurveTo(bx-tw*.5,by-h*.45,bx-tw*.22,by-h*.78);
ctx.lineTo(bx+tw*.22,by-h*.78);ctx.quadraticCurveTo(bx+tw*.5,by-h*.45,bx+tw,by);ctx.closePath();ctx.fill();
ctx.strokeStyle=ts.trunk[0];ctx.lineWidth=2+3*t;
ctx.beginPath();ctx.moveTo(bx-tw*.2,by-h*.5);ctx.quadraticCurveTo(bx-R*.55,by-h*.72,bx-R*.75,by-h*.92);ctx.stroke();
ctx.beginPath();ctx.moveTo(bx+tw*.2,by-h*.62);ctx.quadraticCurveTo(bx+R*.5,by-h*.82,bx+R*.72,by-h*1.0);ctx.stroke();
ctx.beginPath();ctx.moveTo(bx,by-h*.7);ctx.quadraticCurveTo(bx-R*.2,by-h*.9,bx-R*.25,by-h*1.1);ctx.stroke();
const cy0=by-h;
for(let i=0;i<7;i++){const a=i/7*TAU+0.4;const rr2=R*(i%2?0.55:0.7);
const px=bx+Math.cos(a)*R*0.55,py=cy0+Math.sin(a)*R*0.35;
ctx.fillStyle=radg(px-rr2*.3,py-rr2*.3,rr2*.2,rr2,[[0,ts.canopy[3]],[.55,ts.canopy[1]],[1,ts.canopy[0]]]);
ctx.beginPath();ctx.arc(px,py,rr2,0,TAU);ctx.fill();}
ctx.fillStyle=radg(bx,cy0-R*.2,R*.2,R,[[0,ts.canopy[3]],[.6,ts.canopy[2]],[1,ts.canopy[0]]]);
ctx.beginPath();ctx.arc(bx,cy0,R*.8,0,TAU);ctx.fill();
ctx.fillStyle='rgba(255,255,255,.08)';
ctx.beginPath();ctx.arc(bx-R*.3,cy0-R*.35,R*.3,0,TAU);ctx.fill();}
function drawTreeGround(){
if(!S.gfx.shadows)return;
const g=treeGeom();const tv=g.tv;
const c=Tree3D.renderShadow(tv);if(!c)return;
const draw=Math.min(300+70*tv,Math.min(W,H)*0.62);
ctx.drawImage(c,cx-draw/2,cy-Tree3D.BASE_Y*draw,draw,draw);}
function drawTree(){
const g=treeGeom();const tv=g.tv;
const ts=TREE_SKINS[S.treeSkin]||TREE_SKINS.oak;
const bx=cx,by=cy;
if(S.gfx.glow){
ctx.fillStyle=radg(bx,by-60,10,150,[
[0,'rgba('+ts.glow+','+(0.10+pulse*0.45).toFixed(2)+')'],
[1,'rgba('+ts.glow+',0)']]);
ctx.beginPath();ctx.arc(bx,by-60,150,0,TAU);ctx.fill();}
const shake=(treeShakeT>0?treeShakeT:0)+(flinch>0?flinch*0.6:0);
if(S.gfx.use3d){
const c=Tree3D.renderTree(tv,T,shake);
if(c){
const draw=Math.min(300+70*tv,Math.min(W,H)*0.62);
ctx.drawImage(c,bx-draw/2,by-Tree3D.BASE_Y*draw,draw,draw);
}else{drawTree2DFallback(g,ts,bx,by,tv);}
}else{drawTree2DFallback(g,ts,bx,by,tv);}
if(branchFx>0&&abilPct('branch')>0){
const r=60+8*ab('branch');const a0=branchAng;const a1=branchAng+2.4*branchDir;
ctx.strokeStyle='rgba(160,120,70,'+(branchFx*.8).toFixed(2)+')';
ctx.lineWidth=5;ctx.lineCap='round';
ctx.beginPath();ctx.ellipse(bx,by,r,r*ISO,0,Math.min(a0,a1),Math.max(a0,a1));ctx.stroke();}
drawTreeHp(bx,by);}
function drawTreeHp(bx,by){
const pct=clamp(S.treeHp/treeMaxHp(),0,1);
ctx.fillStyle='rgba(8,12,9,.7)';rr(bx-38,by+16,76,6,3);ctx.fill();
if(S.shieldHp>0){ctx.fillStyle='rgba(124,201,232,.5)';rr(bx-37,by+17,Math.max(3,74*clamp(S.shieldHp/treeMaxHp(),0,1)),4,2);ctx.fill();}
if(pct>0){ctx.fillStyle=pct>.5?'#8fd68a':pct>.25?'#e8b64c':'#e0564f';rr(bx-37,by+17,Math.max(3,74*pct),4,2);ctx.fill();}
ctx.strokeStyle='rgba(255,255,255,.08)';ctx.lineWidth=1;rr(bx-38,by+16,76,6,3);ctx.stroke();}
function hpBar(x,y,w,pct,boss){const h=boss?5:3.5,r=h/2;
ctx.fillStyle='rgba(8,12,9,.7)';rr(x-w/2,y,w,h,r);ctx.fill();
if(pct>0){ctx.fillStyle=pct>.5?'#8fd68a':pct>.25?'#e8b64c':'#e0564f';rr(x-w/2+1,y+1,Math.max(2,(w-2)*pct),h-2,(h-2)/2);ctx.fill();}}
function drawEnemy(e){
const gx=cx+e.x,gy=cy+e.y*ISO;const sy=gy-e.lift;const r=e.r;
 /* ── 3D-спрайт моба (если запечён) ── */
const MOB3D_MAP = { beetle:'beetle', spider:'beetle', wolf:'wolf', golem:'bear', spirit:'bug', boss:'wolf', evoboss:'bear' };
const MOB3D_KEY = MOB3D_MAP[e.type];
if (MOB3D_KEY && MobBaker.isReady(MOB3D_KEY)) {
  // направление по вектору движения
  const sp = Math.hypot(e.vx, e.vy);
  let dir = 0;
  if (sp > 2) {
    const ang = Math.atan2(e.vy, e.vx);
    dir = Math.round(ang / (Math.PI / 4));
    if (dir < 0) dir += 8;
  }
  const frame = Math.floor((T * 8 + e.phase * 2) % 6);
  const sprite = MobBaker.getSprite(MOB3D_KEY, dir, frame);
  if (sprite) {
    const size = r * 3.2 * (e.type === 'boss' || e.type === 'evoboss' ? 1.6 : 1);
    // тень под мобом
    ctx.fillStyle = 'rgba(0,0,0,' + (.35 * (1 - e.lift / 30)).toFixed(2) + ')';
    ell(gx, gy + 2, size * 0.32, size * 0.14);
    // кольца эффектов
    if (e.slow > 0) { ctx.strokeStyle = 'rgba(124,201,232,.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(gx, sy - r * 0.35, size * 0.38, 0, TAU); ctx.stroke(); }
    if (e.freeze > 0) { ctx.strokeStyle = 'rgba(124,201,232,.7)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(gx, sy - r * 0.35, size * 0.42, 0, TAU); ctx.stroke(); }
    if (e.burn > 0) { ctx.fillStyle = 'rgba(255,140,60,.25)';
      ctx.beginPath(); ctx.arc(gx, sy - r * 0.35, size * 0.36, 0, TAU); ctx.fill(); }
    // сам спрайт
    ctx.globalAlpha = .25 + .75 * e.born;
    ctx.drawImage(sprite.atlas, sprite.sx, sprite.sy, sprite.sw, sprite.sh,
      gx - size / 2, sy - r * 0.35 - size * 0.55 + e.lift * 0.2, size, size);
    ctx.globalAlpha = 1;
    // вспышка попадания
    if (e.flash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,' + (e.flash * 0.5).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(gx, sy - r * 0.35, size * 0.36, 0, TAU); ctx.fill();
    }
    // held (корни)
    if (e.held > 0) { ctx.strokeStyle = 'rgba(120,90,50,.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(gx, sy - r * 0.35, size * 0.36, 0, TAU); ctx.stroke(); }
    if (e.bleed > 0 && e.bleedT > 0) { ctx.strokeStyle = 'rgba(168,220,120,.5)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(gx, sy - r * 0.35, size * 0.34, 0, TAU); ctx.stroke(); }
    // HP-бар
    if (e.born > .6) hpBar(gx, sy - r - 12, r * 2.2, e.hp / e.maxHp, e.type === 'boss' || e.type === 'evoboss');
    return; // выходим, векторный рендер не запускаем
  }
}
/* fallback: запросить запекание, если ещё не готово */
if (MOB3D_KEY && !MobBaker.isReady(MOB3D_KEY)) MobBaker.request(MOB3D_KEY, e.type === 'boss' || e.type === 'evoboss');
const perspScale=0.7+0.3*clamp(gy/H,0,1);
ctx.globalAlpha=(.25+.75*e.born)*perspScale;
ctx.fillStyle='rgba(0,0,0,'+(.35*(1-e.lift/30)).toFixed(2)+')';ell(gx,gy+2,r*.95*perspScale,r*.4*perspScale);
const walk=e.attacking?0:Math.sin(T*8+e.phase);
const bob=e.attacking?0:Math.cos(T*8+e.phase)*1.2;
const fa=Math.atan2(-e.y*ISO,-e.x);
const face=(e.type==='golem'||e.type==='boss'||e.type==='evoboss')?fa+Math.PI/2:fa;
const atkLunge=e.attacking?Math.sin((e.atkAnim||0)*Math.PI)*6:0;
const lungeX=Math.cos(fa)*atkLunge;
const lungeY=Math.sin(fa)*atkLunge*ISO;
ctx.save();
ctx.translate(gx+lungeX,sy-r*.35*perspScale+bob+lungeY);
ctx.scale(perspScale,perspScale);
ctx.rotate(face+clamp(Math.sin(T*8+e.phase)*.04,-.05,.05));
if(e.summonAnim>0){
const sp=e.summonAnim/1.5;
ctx.save();ctx.globalCompositeOperation='lighter';
ctx.fillStyle='rgba(255,107,138,'+(sp*0.3).toFixed(2)+')';
ctx.beginPath();ctx.arc(0,0,r*2*(1-sp*0.5),0,TAU);ctx.fill();ctx.restore();}
if(e.slow>0){ctx.strokeStyle='rgba(124,201,232,.5)';ctx.lineWidth=1.5;
ctx.beginPath();ctx.arc(0,0,r*1.15,0,TAU);ctx.stroke();}
if(e.freeze>0){ctx.strokeStyle='rgba(124,201,232,.7)';ctx.lineWidth=2;
ctx.beginPath();ctx.arc(0,0,r*1.25,0,TAU);ctx.stroke();
ctx.fillStyle='rgba(124,201,232,.15)';ctx.beginPath();ctx.arc(0,0,r*1.25,0,TAU);ctx.fill();}
if(e.burn>0){ctx.fillStyle='rgba(255,140,60,.25)';
ctx.beginPath();ctx.arc(0,0,r*1.1,0,TAU);ctx.fill();}
ctx.restore();
ctx.globalAlpha=1;
if(e.held>0){ctx.strokeStyle='rgba(120,90,50,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(gx,sy-r*.35,r*1.1*perspScale,0,TAU);ctx.stroke();}
if(e.bleed>0&&e.bleedT>0){ctx.strokeStyle='rgba(168,220,120,.5)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(gx,sy-r*.35,r*1.05*perspScale,0,TAU);ctx.stroke();}
if(e.flash>0){ctx.fillStyle='rgba(255,255,255,'+(e.flash*.5).toFixed(2)+')';ctx.beginPath();ctx.arc(gx,sy-r*.35,r*1.05*perspScale,0,TAU);ctx.fill();}
if(e.born>.6)hpBar(gx,sy-r*perspScale-12,r*2.2*perspScale,e.hp/e.maxHp,e.type==='boss'||e.type==='evoboss');
}
function drawSquirrel(){
  if (!squirrel) return;
  const p = squirrel.t / squirrel.dur;
  const x = lerp(squirrel.fx, squirrel.tx, p);
  const y = lerp(squirrel.fy, squirrel.ty, p) - Math.abs(Math.sin(p * Math.PI * 4)) * 14;
  // 3D-спрайт белки
  if (MobBaker.isReady('squirrel')) {
    const dir = squirrel.tx > squirrel.fx ? 4 : 0;
    const frame = Math.floor((T * 10) % 6);
    const sprite = MobBaker.getSprite('squirrel', dir, frame);
    if (sprite) {
      const size = 28;
      ctx.fillStyle = 'rgba(0,0,0,.3)';
      ctx.beginPath(); ctx.ellipse(x, y + 8, 7, 2.5, 0, 0, TAU); ctx.fill();
      ctx.drawImage(sprite.atlas, sprite.sx, sprite.sy, sprite.sw, sprite.sh,
        x - size / 2, y - size / 2 - 4, size, size);
      const pu = .5 + .5 * Math.sin(T * 6);
      ctx.fillStyle = 'rgba(124,201,232,' + (.4 + .3 * pu).toFixed(2) + ')';
      ctx.beginPath(); ctx.arc(x, y - 16, 2, 0, TAU); ctx.fill();
      return;
    }
  } else {
    MobBaker.request('squirrel', false);
  }
  // фолбэк — старый рендер, пока белка не запечена
  const dir = squirrel.tx > squirrel.fx ? 1 : -1;
  ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
  ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(0, 8, 7, 2.5, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#b06a3a'; ctx.beginPath(); ctx.ellipse(0, 0, 6, 4.5, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(5, -3, 3.4, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#c8824a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-4, -1); ctx.quadraticCurveTo(-10, -6 + Math.sin(T * 10 + squirrel.seed) * 2, -7, -10); ctx.stroke();
  ctx.fillStyle = '#3a2010'; ctx.beginPath(); ctx.arc(6.5, -3.5, 1, 0, TAU); ctx.fill();
  ctx.fillStyle = '#e0a060'; ctx.beginPath(); ctx.arc(4, -5.5, 1.4, 0, TAU); ctx.fill();
  ctx.restore();
  const pu = .5 + .5 * Math.sin(T * 6);
  ctx.fillStyle = 'rgba(124,201,232,' + (.4 + .3 * pu).toFixed(2) + ')';
  ctx.beginPath(); ctx.arc(x, y - 12, 2, 0, TAU); ctx.fill();
}
function drawShots(){
for(const s of shots){
if(s.kind==='branchfall'){const pr=clamp(s.t/s.dur,0,1);
ctx.fillStyle='rgba(0,0,0,'+(0.12+0.25*pr).toFixed(2)+')';ctx.beginPath();ctx.ellipse(cx+s.tx,cy+s.ty*ISO,20*(1-pr)+6,8*(1-pr)+2.5,0,0,TAU);ctx.fill();}
else if(s.kind==='fruit'){ctx.fillStyle='rgba(0,0,0,.22)';ctx.beginPath();ctx.ellipse(cx+s.tx,cy+s.ty*ISO,7,3,0,0,TAU);ctx.fill();}}
ctx.save();ctx.globalCompositeOperation='lighter';
for(const s of shots){
if(s.kind==='ring'){const x=cx+s.x,y=cy+s.y*ISO;ctx.save();ctx.translate(x,y);ctx.rotate(s.rot);
ctx.fillStyle='#a8dc92';ctx.beginPath();ctx.ellipse(0,0,5,2.4,0,0,TAU);ctx.fill();
ctx.strokeStyle='rgba(46,90,44,.7)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(-4,0);ctx.lineTo(4,0);ctx.stroke();ctx.restore();continue;}
if(s.kind==='thorn'){const x=cx+s.x,y=cy+s.y;const a=Math.atan2(s.vy,s.vx);
shotSprites();
ctx.save();ctx.translate(x,y);ctx.rotate(a);
ctx.drawImage(thornSprite,-26,-5);
ctx.restore();continue;}
if(s.kind==='branchfall'){const x=cx+s.x,y=cy+s.y;const pr=clamp(s.t/s.dur,0,1);
ctx.save();ctx.translate(x,y);ctx.rotate(0.6+pr*2);
const bg=ctx.createLinearGradient(-4,0,4,0);bg.addColorStop(0,'#3a2415');bg.addColorStop(.5,'#7a5232');bg.addColorStop(1,'#3a2415');
ctx.fillStyle=bg;rr(-3.5,-14,7,28,3.5);ctx.fill();
ctx.strokeStyle='rgba(120,160,90,.7)';ctx.lineWidth=1.4;
ctx.beginPath();ctx.moveTo(-2,-8);ctx.lineTo(-5,-11);ctx.moveTo(2,4);ctx.lineTo(5,1);ctx.stroke();
ctx.restore();continue;}
if(s.kind==='fruit'){const x=cx+(s.cx!=null?s.cx:s.x),y=cy+(s.cy!=null?s.cy:s.y);
const fg=ctx.createRadialGradient(x-2,y-2,1,x,y,7);fg.addColorStop(0,'#ffb07a');fg.addColorStop(.6,'#e07a48');fg.addColorStop(1,'#8a3a20');
ctx.fillStyle=fg;ctx.beginPath();ctx.arc(x,y,6.5,0,TAU);ctx.fill();
ctx.fillStyle='rgba(255,255,255,.5)';ctx.beginPath();ctx.arc(x-2,y-2.5,1.6,0,TAU);ctx.fill();
ctx.fillStyle='#5fae74';ctx.beginPath();ctx.ellipse(x+1,y-6.5,3,1.8,-.5,0,TAU);ctx.fill();continue;}
if(s.kind==='acidstream'){const x=cx+s.x,y=cy+s.y;
const va=Math.atan2(s.vy,s.vx);
for(let k=0;k<3;k++){const bx2=x-Math.cos(va)*k*9,by2=y-Math.sin(va)*k*9,br=5-k*1.3;
const ag=ctx.createRadialGradient(bx2-1,by2-1,0.5,bx2,by2,br+2);
ag.addColorStop(0,'rgba(220,255,150,.9)');ag.addColorStop(.6,'rgba(150,210,80,.7)');ag.addColorStop(1,'rgba(150,210,80,0)');
ctx.fillStyle=ag;ctx.beginPath();ctx.arc(bx2,by2,br+2,0,TAU);ctx.fill();}
continue;}
const x=cx+s.x,y=cy+s.y;
const tg2=(s.t&&!s.t.dead)?Math.atan2(s.t.y*ISO-s.t.r*.5-y,s.t.x-x):0;
shotSprites();
ctx.save();ctx.translate(x,y);ctx.rotate(tg2);
ctx.drawImage(trailSprite,-20,-3);ctx.restore();
ctx.drawImage(orbSprite,x-10,y-10,20,20);}
ctx.restore();}
function drawParts(){
for(const p of parts){const a=clamp(p.l/p.ml,0,1),x=cx+p.x,y=cy+p.y;
if(p.ring){ctx.strokeStyle='rgba('+p.c+','+(a*.7).toFixed(2)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x,y,p.r0+(p.r1-p.r0)*(1-a),0,TAU);ctx.stroke();}
else if(p.leaf){
if(p.lk==='snow'){ctx.fillStyle='rgba('+p.c+','+a.toFixed(2)+')';ctx.beginPath();ctx.arc(x,y,1.7,0,TAU);ctx.fill();}
else if(p.lk==='spark'){if(S.gfx.glow)drawGlow(x,y,5,p.c);ctx.fillStyle='rgba('+p.c+','+a.toFixed(2)+')';ctx.beginPath();ctx.arc(x,y,1.6,0,TAU);ctx.fill();}
else{ctx.save();ctx.translate(x,y);ctx.rotate(p.l*4+p.ph);ctx.fillStyle='rgba('+p.c+','+a.toFixed(2)+')';
ctx.beginPath();ctx.ellipse(0,0,p.lk==='petal'?2.8:3.4,p.lk==='petal'?1.9:1.6,0,0,TAU);ctx.fill();ctx.restore();}}
else{ctx.fillStyle='rgba('+p.c+','+a.toFixed(2)+')';ctx.beginPath();ctx.arc(x,y,p.sz*a+.4,0,TAU);ctx.fill();}
}
}
function drawFloats(){
ctx.textAlign='center';
for(const f of floats){const a=clamp(f.l/f.ml,0,1),x=cx+f.x,y=cy+f.y-(1-a)*26;
ctx.globalAlpha=a;ctx.font='800 '+f.sz+'px Manrope, sans-serif';
ctx.strokeStyle='rgba(6,10,7,.8)';ctx.lineWidth=3;ctx.strokeText(f.txt,x,y);ctx.fillStyle=f.c;ctx.fillText(f.txt,x,y);}
ctx.globalAlpha=1;}
/* ── ТРАВА: сплошное изометрическое кольцо по радиусу атаки ──
   Кэш травинок пересчитывается при смене радиуса/качества/размера;
   в кадре травинки участвуют в общем depth-сорте по Y (как мобы и древо). */
const GRASS_PAL=[[58,96,48],[74,118,58],[92,142,70],[116,168,86]];
let grassCacheKey='',grassBlades=[];
function ensureGrassCache(){
const key=Math.round(FRR)+'|'+S.gfx.particles+'|'+W+'|'+H;
if(key===grassCacheKey)return;
grassCacheKey=key;
const rx=FRR,ry=FRR*ISO;
const q=S.gfx.particles;
const step=q==='low'?4.6:q==='high'?2.2:3.1;
const rows=q==='low'?1:q==='high'?3:2;
const P=Math.PI*(3*(rx+ry)-Math.sqrt((3*rx+ry)*(rx+3*ry)));
const n=clamp(Math.round(P/step),60,1500);
grassBlades.length=0;
for(let r=0;r<rows;r++){
const off=(r-(rows-1)/2)*3.4;
const depth=rows>1?r/(rows-1):0.5;
for(let i=0;i<n;i++){
const a=((i+(r%2?0.5:0))/n)*TAU;
const hsh=((i*73856093)^((r+7)*19349663))>>>0;
const r1=(hsh&1023)/1023,r2=((hsh>>10)&1023)/1023,r3=((hsh>>20)&1023)/1023;
const x=cx+Math.cos(a)*(rx+off+(r1-.5)*2.6);
const y=cy+Math.sin(a)*(ry+off*ISO+(r1-.5)*1.5);
const ps=0.7+0.3*clamp(y/H,0,1);
const ns=Math.sin(a*3.1+r*1.7)+0.5*Math.sin(a*7.3+r*0.6)+0.25*Math.sin(a*15.7+r*2.3);
const ci=clamp(Math.round((0.25+depth*0.35+r3*0.4+ns*0.08)*3),0,3);
const al=0.55+r2*0.3;const c0=GRASS_PAL[ci];
grassBlades.push({
x,y,ps,
h:(7+ns*1.6+r3*4.5)*ps,
lean:ns*0.22+(r1-.5)*0.55,
w:(1.05+r2*0.75)*ps,
ci,al,
col:'rgba('+c0[0]+','+c0[1]+','+c0[2]+','+al.toFixed(2)+')',
hlCol:'rgba(168,216,128,'+(0.35*ps).toFixed(2)+')',
lw:0.7*ps,
hl:q!=='low'&&((hsh>>5)&3)===0,
ph:r2*6.28,
wy:(y-cy)/ISO});  // тот же ключ сортировки, что у мобов (e.y) и декораций
}
}
grassBlades.sort((a,b)=>a.wy-b.wy); // дальние раньше — для слияния в кадре
}
/* подстилка: всегда под всеми объектами */
function drawGrassBed(){
const rx=FRR,ry=FRR*ISO;
ctx.strokeStyle='rgba(46,74,40,.35)';ctx.lineWidth=8;
ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,TAU);ctx.stroke();
ctx.strokeStyle='rgba(74,110,60,.28)';ctx.lineWidth=4;
ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,TAU);ctx.stroke();}
function drawGrassBlade(b,wind){
const wave=Math.sin(T*2.2+b.ph+b.x*0.05+b.y*0.03);
const sway=(wave*1.6+wind*2.4)*b.ps;
const tx=b.x+b.lean*b.h+sway,ty=b.y-b.h;
const mx=b.x+b.lean*b.h*0.45+sway*0.38,my=b.y-b.h*0.55;
ctx.fillStyle=b.col;
ctx.beginPath();
ctx.moveTo(b.x-b.w,b.y);
ctx.quadraticCurveTo(mx-b.w*0.65,my,tx,ty);
ctx.quadraticCurveTo(mx+b.w*0.65,my,b.x+b.w,b.y);
ctx.closePath();
ctx.fill();
if(b.hl){
ctx.strokeStyle=b.hlCol;
ctx.lineWidth=b.lw;
ctx.beginPath();ctx.moveTo(b.x,b.y-0.6);
ctx.quadraticCurveTo(mx,my,tx,ty);
ctx.stroke();}
}
function render(dt){
ctx.setTransform(DPR,0,0,DPR,0,0);
if(ground)ctx.drawImage(ground,0,0,W,H);
else{ctx.fillStyle='#101c13';ctx.fillRect(0,0,W,H);}
drawFlies(dt);
ctx.save();
if(shakeM>0){
shakeM=Math.max(0,shakeM-dt*20);
if(S.shake)ctx.translate(rand(-1,1)*shakeM,rand(-1,1)*shakeM);}
drawTreeGround();
drawGrassBed();
drawZones();
drawRoots();
const objs=[];
for(const s of scenery){if(s.type!=='grass')objs.push({y:(s.y-cy)/ISO,fn:()=>drawSceneryObj(s)});}
for(const e of enemies)objs.push({y:e.y,fn:()=>drawEnemy(e)});
objs.push({y:0,fn:drawTree});
objs.sort((a,b)=>a.y-b.y);
/* слияние отсортированных травинок с отсортированными объектами:
   каждая травинка рисуется строго в своём Y-порядке */
ensureGrassCache();
const wind=Math.sin(T*0.8)*0.7+gust*1.6;
const GB=grassBlades;let gi=0;
for(const o of objs){
while(gi<GB.length&&GB[gi].wy<=o.y){drawGrassBlade(GB[gi++],wind);}
try{o.fn();}catch(err){if(!render.objErr){render.objErr=true;console.error('obj draw:',err);}}}
while(gi<GB.length){drawGrassBlade(GB[gi++],wind);}
drawSquirrel();drawShots();drawParts();drawFloats();
drawRadiusIndicator();
ctx.restore();}
let last=performance.now();
const fpsEl=$('#fpsMeter');
let fpsFrames=0,fpsAccum=0;
function loop(now){requestAnimationFrame(loop);
const rawDt=Math.max(.0001,(now-last)/1000);last=now;const dt=Math.min(rawDt,.05);
if(S.showFps){fpsFrames++;fpsAccum+=rawDt;
if(fpsAccum>=.5){const f=Math.round(fpsFrames/fpsAccum);fpsFrames=0;fpsAccum=0;
if(fpsEl){fpsEl.textContent=f+' FPS';fpsEl.style.color=f>=50?'#9fd8a8':f>=30?'#e8b64c':'#e0564f';}}}
const frozen=['boost','cards','powers','new'].includes(S.tutPhase);
const gdt=dt*((!S.over&&!frozen)?(S.speed||1):1);
T+=gdt;
FRR=rootReach();
try{if(!S.over)simulate(gdt);}catch(err){if(!loop.errS){loop.errS=true;console.error('sim:',err);}}
try{updateFx(gdt);render(gdt);}catch(err){if(!loop.errR){loop.errR=true;console.error('render:',err);}}
dispSeeds+=(S.seeds-dispSeeds)*Math.min(1,dt*10);
if(Math.abs(S.seeds-dispSeeds)<.5)dispSeeds=S.seeds;
const s=fmt(dispSeeds);if(s!==lastStr){lastStr=s;el.seeds.textContent=s;}}
