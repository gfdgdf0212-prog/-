'use strict';
const cv=$('#game'),ctx=cv.getContext('2d');
let W=0,H=0,DPR=1,cx=0,cy=0,ground=null;
const spawnR=()=>Math.min(W*.46,H*.40/ISO,520)+20;
let scenery=[];
function buildScenery(){
scenery=[];const r=rng(98765);const edges=[];
for(let i=0;i<14;i++)edges.push({x:r()*W*0.18,y:r()*H});
for(let i=0;i<14;i++)edges.push({x:W-r()*W*0.18,y:r()*H});
for(let i=0;i<10;i++)edges.push({x:r()*W,y:r()*H*0.14});
for(let i=0;i<12;i++)edges.push({x:r()*W,y:H-r()*H*0.16});
edges.forEach((p)=>{const big=r()<.5;
scenery.push({type:big?'tree':'bush',x:p.x,y:p.y,s:big?(.7+r()*.6):(.6+r()*.5),ph:r()*TAU,sw:big?(.5+r()*.5):(.8+r()*.6)});});
}
function makeGround(){
ground=document.createElement('canvas');ground.width=cv.width;ground.height=cv.height;
const g=ground.getContext('2d');g.setTransform(DPR,0,0,DPR,0,0);
const bg=g.createRadialGradient(cx,cy,40,cx,cy,Math.max(W,H)*.72);
bg.addColorStop(0,'#2a4232');bg.addColorStop(.45,'#1d3024');bg.addColorStop(.8,'#15241a');bg.addColorStop(1,'#0e1a12');
g.fillStyle=bg;g.fillRect(0,0,W,H);
const maxR=Math.hypot(W,H)/2;
for(let i=0;i<320;i++){const a=rand(0,TAU),d=Math.pow(Math.random(),.6)*maxR;
g.fillStyle='rgba('+(Math.random()<.5?'142,188,148':'106,140,114')+','+rand(.05,.15).toFixed(2)+')';
g.beginPath();g.arc(cx+Math.cos(a)*d,cy+Math.sin(a)*d*ISO,rand(.7,2.1),0,TAU);g.fill();}
}
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;
cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);
cv.style.width=W+'px';cv.style.height=H+'px';
ctx.setTransform(DPR,0,0,DPR,0,0);cx=W/2;cy=H*.5;makeGround();buildScenery();}
addEventListener('resize',resize);
// -- ТАСОВКИ: фазовая система, авто-дуги, каскад/stagger/gap
const EASE={
linear:t=>t,
inQ:t=>t*t, outQ:t=>1-(1-t)*(1-t),
inC:t=>t*t*t, outC:t=>1-Math.pow(1-t,3),
inOutC:t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,
inOutS:t=>t*t*(3-2*t),
outBack:t=>{const c=1.25;return 1+(c+1)*Math.pow(t-1,3)+c*Math.pow(t-1,2);}
};
const N=9, SP=23, LEFT=-86, RIGHT=86, CENTER=0, CY=2, SPD=1.45;
const rint=n=>Math.floor(Math.random()*n);
const rr2=(a,b)=>a+Math.random()*(b-a);
function shuffleIdx(n){const a=Array.from({length:n},(_,i)=>i);for(let i=n-1;i>0;i--){const j=rint(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
function randParts(n,max){const out=[];let r=n;while(r>0){const v=Math.min(1+rint(max),r);out.push(v);r-=v;}return out;}
function randSplit(arr){
const A=[],B=[]; const idx=shuffleIdx(arr.length);
for(let i=0;i<arr.length;i++) (Math.random()<.5?A:B).push(arr[idx[i]]);
if(!A.length) B.pop(), A.push(arr[idx[0]]);
if(!B.length) A.pop(), B.push(arr[idx[arr.length-1]]);
return [A,B];
}
function randSplit3(arr){
const A=[],B=[],C=[]; const idx=shuffleIdx(arr.length);
for(let i=0;i<arr.length;i++){ const r=Math.random(); (r<.33?A:r<.66?B:C).push(arr[idx[i]]); }
if(!A.length){A.push(B.pop()||C.pop());}
if(!B.length){B.push(A.length>1?A.pop():C.pop());}
if(!C.length){C.push(A.length>1?A.pop():B.pop());}
return [A,B,C];
}
const interleave=(a,b)=>{const o=[],m=Math.max(a.length,b.length);for(let i=0;i<m;i++){if(i<a.length)o.push(a[i]);if(i<b.length)o.push(b[i]);}return o;};
const interleave3=(a,b,c)=>{const o=[],m=Math.max(a.length,b.length,c.length);for(let i=0;i<m;i++){if(i<a.length)o.push(a[i]);if(i<b.length)o.push(b[i]);if(i<c.length)o.push(c[i]);}return o;};
function stackPosObj(cx, seq, n, rotY=180){ return {x:cx+seq*1.5, y:CY+(seq-(n-1)/2)*2.4, rot:0, rotY, sc:1, z:(n-seq)+12}; }
function spreadPos(slot){ return {x:(slot-4)*SP, y:0, rot:(slot-4)*3, rotY:0, sc:1, z:slot+1}; }
function applyCard(c){
const el = cardEl(c.id);
if(!el) return;
el.style.transform =
`translate(-50%,-50%) translate(${c.cur.x}px,${c.cur.y}px) rotate(${c.cur.rot}deg) rotateY(${c.cur.rotY||0}deg) scale(${c.cur.sc})`;
el.style.zIndex = Math.round(c.cur.z)+20;
}
function animTo(c, tgt, dur, ease){
const s = {...c.cur}, efn = EASE[ease]||EASE.inOutC, t0 = performance.now(), ms = Math.max(70, dur*1000);
const tR = (tgt.rotY==null?0:tgt.rotY);
const dx=tgt.x-s.x, dy=tgt.y-s.y, len=Math.hypot(dx,dy)||1;
const px=-dy/len, py=dx/len;
const dist = Math.hypot(dx, dy);
const autoArc = (tgt.arc==null && dist > 28)
? Math.min(58, Math.max(18, dist * 0.38)) * (tgt.arcDir||1)
: (tgt.arc||0) * (tgt.arcDir||1);
(function f(now){
if(spinToken !== animTo.currentToken) return;
let p = (now-t0)/ms; if(p>1) p=1;
const k = efn(p);
const bow = Math.sin(Math.PI*p)*autoArc;
c.cur = {
x:s.x+(tgt.x-s.x)*k + px*bow,
y:s.y+(tgt.y-s.y)*k + py*bow,
rot:s.rot+(tgt.rot-s.rot)*k,
rotY:(s.rotY||0)+(tR-(s.rotY||0))*k,
sc:s.sc+(tgt.sc-s.sc)*k,
z:s.z+(tgt.z-s.z)*k
};
applyCard(c);
if(p<1) requestAnimationFrame(f);
})(t0);
}
function makePhase(ids, getPos, o={}){
return {cards:ids.slice(), pos:(id)=>getPos(id), dur:o.dur||.4, ease:o.ease||'inOutC',
stagger:o.stagger||0, gap:o.gap??90, onEnter:o.onEnter, trail:o.trail};
}
function playPhases(phases, done){
animTo.currentToken = spinToken;
let i=0;
(function step(){
if(spinToken !== animTo.currentToken) return;
if(i>=phases.length){ done&&done(); return; }
const p = phases[i++];
const items = p.cards.map(id => {
const c = cards.find(x=>x.id===id);
if(!c) return null;
const tgt = p.pos(id);
const dx = tgt.x - c.cur.x;
const dy = tgt.y - c.cur.y;
const dist = Math.hypot(dx, dy);
if (dist > 28 && !tgt.hasOwnProperty('arc')) {
tgt.arc = Math.min(58, Math.max(18, dist * 0.38));
tgt.arcDir = (id % 2 === 0) ? 1 : -1;
}
return {id, tgt};
}).filter(Boolean);
if(p.onEnter) p.onEnter();
const st = p.stagger||0; let max=0;
items.forEach((it,seq)=>{
const t = seq*st;
max = Math.max(max, t+p.dur);
setTimeout(()=>{
const c = cards.find(x=>x.id===it.id);
if(c) animTo(c, it.tgt, p.dur, p.ease);
}, t);
});
setTimeout(step, max + (p.gap??90));
})();
}
function finalSpreadPhase(order){
return makePhase(cards.map(c=>c.id), id => {
const idx = order.indexOf(id);
if (idx < 5) {
const slot = idx;
return {x: (slot - 2) * 62, y: -58, rot: 0, rotY: 180, sc: 1, z: slot + 1};
} else {
const slot = idx - 5;
return {x: (slot - 1.5) * 62, y: 58, rot: 0, rotY: 180, sc: 1, z: slot + 6};
}
}, {dur:.5, ease:'outC', stagger:24, gap:0, trail:false});
}
function scenCascade(order){
const all = cards.map(c=>c.id);
let L = order.slice(), R = [];
const ph = [];
const snap = (Larr, Rarr, lift) => {
const m = {};
Larr.forEach((id,seq)=> m[id]=stackPosObj(LEFT,seq,Larr.length));
Rarr.forEach((id,seq)=> m[id]=stackPosObj(RIGHT,seq,Rarr.length));
if(lift){ const n=lift.length, topY = Larr.length ? (CY+(-(Larr.length-1)/2)*2.4) : CY;
lift.forEach((id,k)=>{ const off=k-(n-1)/2;
m[id]={x:LEFT+off*5, y:topY-30-k*1.5, rot:off*6, rotY:180+off*9, sc:1.06, z:80+k}; }); }
return m;
};
const sizes = randParts(order.length, 3);
for(const sz of sizes){
if(!L.length) break;
const pkt = L.splice(0, sz);
ph.push(makePhase(all, id=>snap(L,R,pkt)[id], {dur:.34, ease:'outC', stagger:18, gap:55}));
R = pkt.concat(R);
ph.push(makePhase(all, id=>snap(L,R,null)[id], {dur:.34, ease:'inOutC', stagger:16, gap:65, trail:false}));
}
const deck = R.concat(L);
const cut = 1 + rint(deck.length-2);
const cA = deck.slice(0, cut), cB = deck.slice(cut);
ph.push(makePhase(all, id=>{ const i=deck.indexOf(id); return stackPosObj(CENTER,i,deck.length); }, {dur:.34, ease:'inOutC', stagger:14, gap:60, trail:false}));
ph.push(makePhase(all, id=>{ const ia=cA.indexOf(id); if(ia>=0) return {x:CENTER+34+ia*1.5, y:CY-22+(ia-(cA.length-1)/2)*2.4, rot:5, rotY:180+14, sc:1, z:30-ia};
const ib=cB.indexOf(id); return {x:CENTER-34+ib*1.5, y:CY+22+(ib-(cB.length-1)/2)*2.4, rot:-5, rotY:180-14, sc:1, z:20-ib}; },
{dur:.34, ease:'outC', stagger:16, gap:70, trail:false}));
const order2 = (Math.random()<.5 ? cB.concat(cA) : cA.concat(cB));
ph.push(makePhase(all, id=>stackPosObj(CENTER, order2.indexOf(id), order2.length), {dur:.34, ease:'inOutC', stagger:14, gap:70, trail:false}));
ph.push(finalSpreadPhase(order2));
return {phases:ph, order:order2};
}
function scenDomino(order){
const all = cards.map(c=>c.id);
const ph = [];
const fallQ = shuffleIdx(N).map(i=>order[i]);
ph.push(makePhase(fallQ, id=>{
const s=order.indexOf(id), sp=spreadPos(s);
return {x:sp.x, y:sp.y, rot:sp.rot+62, rotY:180, sc:1, z:s+1};
}, {dur:.3, ease:'inOutC', stagger:48, gap:50, trail:false}));
const midOrder = shuffleIdx(N).map(i=>order[i]);
const riseQ = shuffleIdx(N).map(i=>order[i]);
ph.push(makePhase(riseQ, id=>{
const s=midOrder.indexOf(id), sp=spreadPos(s);
return {x:sp.x, y:sp.y-52, rot:sp.rot + (Math.random()<.5?-18:18), rotY:180, sc:1.12, z:s+60};
}, {dur:.38, ease:'outC', stagger:36, gap:40, trail:false}));
const midOrder2 = shuffleIdx(N).map(i=>order[i]);
ph.push(makePhase(riseQ, id=>{
const s=midOrder2.indexOf(id), sp=spreadPos(s);
return {x:sp.x + (Math.random()-.5)*14, y:sp.y-34, rot:sp.rot + (Math.random()-.5)*24, rotY:180, sc:1.08, z:s+50};
}, {dur:.32, ease:'inOutC', stagger:30, gap:30, trail:false}));
const order2 = shuffleIdx(N).map(i=>order[i]);
ph.push(makePhase(riseQ, id=>{
const s=order2.indexOf(id), sp=spreadPos(s);
return {x:sp.x, y:sp.y, rot:sp.rot, rotY:180, sc:1, z:s+1};
}, {dur:.34, ease:'inOutC', stagger:42, gap:40, trail:false}));
ph.push(makePhase(riseQ, id=>{
const s=order2.indexOf(id), sp=spreadPos(s);
return {x:sp.x, y:sp.y-10, rot:sp.rot, rotY:180, sc:1.04, z:s+30};
}, {dur:.2, ease:'outC', stagger:38, gap:20, trail:false}));
ph.push(makePhase(riseQ, id=>{
const s=order2.indexOf(id), sp=spreadPos(s);
return {x:sp.x, y:sp.y, rot:sp.rot, rotY:180, sc:1, z:s+1};
}, {dur:.24, ease:'inOutC', stagger:38, gap:60, trail:false}));
ph.push(finalSpreadPhase(order2));
return {phases:ph, order:order2};
}
function scenAccordion(order){
const all = cards.map(c=>c.id);
const ph = [];
const [stackA, stackB, stackC] = randSplit3(order);
const piles = [stackA, stackB, stackC];
const positions = [-82, 0, 82];
ph.push(makePhase(all, id => {
for (let i = 0; i < 3; i++) {
const pile = piles[i];
const idx = pile.indexOf(id);
if (idx >= 0) {
const n = pile.length;
return {x:positions[i]+(idx-(n-1)/2)*2,y:CY+(idx-(n-1)/2)*3,rot:0,rotY:180,sc:1,z:i*10+idx};
}
}
return {x:0,y:0,rot:0,rotY:180,sc:1,z:1};
}, {dur:.45, ease:'inOutC', stagger:20, gap:70, trail:false}));
ph.push(makePhase(all, id => {
for (let i = 0; i < 3; i++) {
const pile = piles[i];
const idx = pile.indexOf(id);
if (idx >= 0) {
const n = pile.length;
const angle = (idx - (n-1)/2) * 0.25;
const radius = 38;
const cxx = positions[i];
const cyy = CY - 15;
return {x:cxx+Math.sin(angle)*radius,y:cyy-Math.cos(angle)*radius+15,rot:angle*40,rotY:180,sc:1,z:i*20+idx+30};
}
}
return {x:0,y:0,rot:0,rotY:180,sc:1,z:1};
}, {dur:.4, ease:'outC', stagger:22, gap:60, trail:false}));
const mixedOrder = shuffleIdx(N).map(i => order[i]);
ph.push(makePhase(all, id => {
const angle = Math.random() * Math.PI * 2;
const radius = 50 + Math.random() * 40;
return {x:Math.cos(angle)*radius,y:Math.sin(angle)*radius*0.7-30,rot:(Math.random()-.5)*50,rotY:180,sc:1.08,z:80+Math.random()*20};
}, {dur:.45, ease:'outC', stagger:18, gap:50, trail:false}));
const newPiles = [[], [], []];
mixedOrder.forEach((id, i) => { newPiles[i % 3].push(id); });
const finalPiles = newPiles.map(pile => pile.sort(() => Math.random() - 0.5));
ph.push(makePhase(all, id => {
for (let i = 0; i < 3; i++) {
const pile = finalPiles[i];
const idx = pile.indexOf(id);
if (idx >= 0) {
const n = pile.length;
return {x:positions[i]+(idx-(n-1)/2)*2,y:CY+(idx-(n-1)/2)*3,rot:0,rotY:180,sc:1,z:i*10+idx+15};
}
}
return {x:0,y:0,rot:0,rotY:180,sc:1,z:1};
}, {dur:.4, ease:'inOutC', stagger:20, gap:70, trail:false}));
const collected = finalPiles.flat();
ph.push(makePhase(all, id => {
const idx = collected.indexOf(id);
return stackPosObj(CENTER, idx, collected.length);
}, {dur:.4, ease:'inOutC', stagger:18, gap:60, trail:false}));
ph.push(finalSpreadPhase(collected));
return {phases:ph, order:collected};
}
function scenPendulum(order){
const all = cards.map(c=>c.id);
const ph = [];
const scatterPos = {};
all.forEach(id=>{
scatterPos[id] = {x:(Math.random()-.5)*180,y:(Math.random()-.5)*140,rot:(Math.random()-.5)*60,rotY:180+(Math.random()-.5)*40,sc:.9+Math.random()*.2,z:50+rint(40)};
});
ph.push(makePhase(all, id=>scatterPos[id], {dur:.4, ease:'outC', stagger:20, gap:60, trail:false}));
const spiralQ = shuffleIdx(N).map(i=>order[i]);
ph.push(makePhase(spiralQ, id=>{
const idx = spiralQ.indexOf(id);
const angle = idx * (2*Math.PI/N) * 1.5;
const radius = 60 - idx*4;
return {x:Math.cos(angle)*radius,y:Math.sin(angle)*radius*0.6,rot:angle*180/Math.PI*0.3,rotY:180,sc:1,z:60+idx};
}, {dur:.5, ease:'inOutC', stagger:34, gap:50, trail:false}));
const [gA, gB, gC] = randSplit3(order);
const beats = 3 + rint(2);
for(let b=0; b<beats; b++){
const amp = 95 * Math.pow(0.6, b);
const ay = 28 * Math.pow(0.6, b);
const rotAmp = 16 * Math.pow(0.7, b);
const groups = [gA, gB, gC];
const shift = b % 3;
const placed = [groups[shift], groups[(shift+1)%3], groups[(shift+2)%3]];
const sides = [-1, 0, 1];
ph.push(makePhase(all, id=>{
for(let gi=0; gi<3; gi++){
const g = placed[gi];
const k = g.indexOf(id);
if(k>=0){
const n = g.length;
const off = k-(n-1)/2;
const sx = sides[gi]*amp;
const sy = (gi===1) ? -ay : ay*0.5;
return {x:sx+off*3.5,y:sy+off*4,rot:sides[gi]*rotAmp+off*2,rotY:180+sides[gi]*8,sc:1,z:gi*20+k+10};
}
}
return {x:0,y:0,rot:0,rotY:180,sc:1,z:1};
}, {dur:.36, ease:'inOutC', stagger:14, gap:30, trail:false}));
}
const eightQ = shuffleIdx(N).map(i=>order[i]);
ph.push(makePhase(eightQ, id=>{
const idx = eightQ.indexOf(id);
const tt = idx / N;
const angle = tt * 2 * Math.PI;
const scale = 70;
const x = scale * Math.sin(angle);
const y = scale * 0.4 * Math.sin(angle) * Math.cos(angle);
return {x, y, rot: Math.cos(angle)*20, rotY:180, sc:1.05, z:60+idx};
}, {dur:.5, ease:'inOutC', stagger:30, gap:50, trail:false}));
ph.push(makePhase(eightQ, id=>{
const idx = eightQ.indexOf(id);
return {x:idx*1.2,y:CY+(idx-(N-1)/2)*2,rot:idx*4,rotY:180+idx*6,sc:.95,z:N-idx+20};
}, {dur:.36, ease:'inOutC', stagger:16, gap:50, trail:false}));
const order2 = interleave3(gA, gB, gC);
ph.push(finalSpreadPhase(order2));
return {phases:ph, order:order2};
}
function runShuffle(build,myToken,done){
spinToken = myToken;
animTo.currentToken = myToken;
const {phases, order} = build(cards.map(c=>c.id));
playPhases(phases, ()=>{
if(spinToken !== myToken) return;
order.forEach((id,idx)=>{
const c = cards.find(x=>x.id===id);
if(c){ c.pile=idx; c.slot=idx; }
});
done();
});
}
function shuffleCascade(myToken,peekId,done){runShuffle(scenCascade,myToken,done);}
function shuffleDomino(myToken,done){runShuffle(scenDomino,myToken,done);}
function shuffleAccordion(myToken,done){runShuffle(scenAccordion,myToken,done);}
function shufflePendulum(myToken,peekId,done){runShuffle(scenPendulum,myToken,done);}
