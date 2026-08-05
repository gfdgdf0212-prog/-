'use strict';
function renderShop(){renderSkins();}
function burst(x,y,r,c){let n=Math.min(26,8+r);const q=S.gfx.particles;if(q==='low')n=Math.max(2,Math.round(n*0.3));else if(q==='high')n=Math.round(n*1.5);
for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(20,90+r*3);
parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-20,l:rand(.35,.7),ml:.7,sz:rand(1.5,3.2),c});}
parts.push({ring:true,x,y,l:.3,ml:.3,r0:r*.4,r1:r*2.2,c});}
function puff(x,y){for(let i=0;i<4;i++)parts.push({x,y,vx:rand(-20,20),vy:rand(-20,20),l:.25,ml:.25,sz:1.6,c:'255,217,138'});}
function leafBurst(){const g=treeGeom(),ts=TREE_SKINS[S.treeSkin]||TREE_SKINS.oak;
const ln=S.gfx.glow?14:4;
for(let i=0;i<ln;i++)parts.push({leaf:true,lk:ts.leafKind,ph:rand(0,TAU),
x:rand(-g.R,g.R)*.9,y:-g.h+rand(-g.R*.4,g.R*.3),vy:rand(16,28),l:rand(1,1.8),ml:1.8,c:ts.leafC});
parts.push({ring:true,x:0,y:-g.h,l:.45,ml:.45,r0:g.R*.5,r1:g.R*2.4,c:ts.glow});}
function gainDew(n,x,y,quiet){const dn=Math.round(n*mutDewMul());S.dew+=dn;bump('#dewPill');
if(!quiet)floats.push({x,y,txt:'+'+fmt(dn)+(S.lang==='ru'?' росы':' dew'),l:1.3,ml:1.3,c:'#a5e8f0',sz:13});
updateHUD();}
function aoeAt(x,y,R,pct,color){
for(const e of enemies){if(e.dead||!inReach(e))continue;
const dx=e.x-x,dy=e.y-y;if(dx*dx+dy*dy<R*R)hit(e,coreDmg()*pct,false);}
burst(x,y*ISO,R*.6,color);}
function kill(e){
if(e.tut){if(S.tutPhase==='new')enterBoost();return;}
const rw=Math.round(e.rw*mutIncomeMul());
S.seeds+=rw;runSeeds+=rw;S.killed++;S.totalKills++;runKills++;
if(S.dailyProg){S.dailyProg.kills=(S.dailyProg.kills||0)+1;}
S.huntKills=(S.huntKills||0)+1;
burst(e.x,e.y*ISO-e.r*.5,e.r,e.type==='boss'||e.type==='evoboss'?'214,110,170':'224,124,94');
if(M('m_acid'))aoeAt(e.x,e.y,55,0.35,'190,240,110');
if(e.type==='evoboss'){onEvoBossKilled();return;}
if(e.type==='boss'){
const bossesLeft=enemies.filter(x=>x.type==='boss'&&!x.dead).length;
const summonsLeft=enemies.filter(x=>x.isSummon&&!x.dead).length;
if(bossesLeft===0&&summonsLeft===0)nextWave();
sfx.kill();}
else if(e.isSummon){
sfx.kill();
if(bossActive){
const bossesLeft=enemies.filter(x=>x.type==='boss'&&!x.dead).length;
const summonsLeft=enemies.filter(x=>x.isSummon&&!x.dead).length;
if(bossesLeft===0&&summonsLeft===0)nextWave();}}
else{if(e.type==='golem'&&Math.random()<.12&&S.tutorialDone)gainDew(1,e.x,e.y*ISO-e.r-30,true);sfx.kill();}}
function hit(e,dmg,crit){if(S.over||e.dead)return;
e.hp-=dmg;e.flash=1;
parts.push({x:e.x+rand(-4,4),y:e.y*ISO-e.r*.5,vx:rand(-14,14),vy:rand(-24,-6),l:.3,ml:.3,sz:2,c:'255,236,190'});
const bP=abilPct('bleed');
if(bP>0&&!e.dead){e.bleed=Math.min(10,(e.bleed||0)+1);e.bleedT=3;}

if(crit){if(S.dailyProg)S.dailyProg.crits=(S.dailyProg.crits||0)+1;
floats.push({x:e.x+rand(-6,6),y:e.y*ISO-e.r-12,txt:'CRIT '+fmt(dmg),l:.85,ml:.85,c:'#ffd76a',sz:13});sfx.crit();
if(sk('ss_12')&&!M('m_blood'))S.treeHp=Math.min(treeMaxHp(),S.treeHp+dmg*0.02);
}
else{floats.push({x:e.x+rand(-6,6),y:e.y*ISO-e.r-8,txt:fmt(dmg),l:.65,ml:.65,c:'#ffe9b8',sz:10.5});sfx.hit();}

/* заморозка по танкам */
if(M('m_frost')&&(e.type==='golem'||e.type==='boss'||e.type==='evoboss')){
 if(Math.random()<0.10){e.freeze=Math.max(e.freeze,1.0);
  floats.push({x:e.x,y:e.y*ISO-e.r-18,txt:'❄',l:.7,ml:.7,c:'#7cc9e8',sz:14});}}
if(e.hp<=0&&!e.tut)e.dead=true;}

function damageTree(d,byBoss){if(S.over)return;
d*=mutTakenMul();
if(S.shieldHp>0){const a=Math.min(S.shieldHp,d);S.shieldHp-=a;d-=a;
floats.push({x:0,y:-treeGeom().h,txt:'🛡 '+fmt(a),l:.7,ml:.7,c:'#a5e8f0',sz:11});}
if(d<=0){updateHUD();return;}
S.treeHp-=d;flinch=1;diedThisWave=true;
if(byBoss&&S.shake)shakeM=Math.max(shakeM,6);vig();sfx.hurt();
if(S.treeHp<=0){S.treeHp=0;gameOver();}
updateHUD();}
function nextWave(){
const finishedWave=S.wave;
S.wave++;S.bestWave=Math.max(S.bestWave,S.wave);
S.killed=0;spawned=0;bossActive=false;betweenT=2.6;waveT=0;diedThisWave=false;
S.waveQ={prog:0,done:false,claimed:false};
S.shieldHp=0;
if(S.dailyProg)S.dailyProg.waves=(S.dailyProg.waves||0)+1;
if(chapterOf(S.bestWave)>=20&&!S.speedTutShown){S.speedTutShown=true;
toast(S.lang==='ru'?'⚡ Скорость ×2 разблокирована в настройках!':'⚡ ×2 speed unlocked in settings!');}
if(finishedWave===1&&!diedThisWave&&S.tutPhase==='play'&&!S.tutorialDone){
setTimeout(()=>enterCards(),800);}
if(finishedWave%7===0){const ch=chapterOf(finishedWave);
if(S.chaptersCleared<ch){S.chaptersCleared=ch;
banner(t('chap')+' '+chapterOf(finishedWave)+'!',(S.lang==='ru'?'награда в пропуске':'pass reward'),'chap');}}
const subs=SUBS[S.lang]||SUBS.ru;
banner(t('stage')+' '+stageOf(S.wave),subs[Math.floor(Math.random()*subs.length)],false);
sfx.wave();save();updateHUD();}
function gameOver(){

S.over=true;sfx.over();
const g=treeGeom();burst(0,-g.h*.6,g.R,'124,168,120');
$('#stWave').textContent=stageOf(S.wave);$('#stKills').textContent=fmt(runKills);$('#stSeeds').textContent=fmt(runSeeds);
setTimeout(()=>open('#overOverlay'),900);}
function launchRoot(tg,b=0,dmgMul=1){
roots.push({phase:'telegraph',strikeT:0,spikeT:0,tg,tx:tg.x,ty:tg.y,b,dmgMul,seed:rand(0,100)});}
function rootStrike(p){
const tg=p.tg;
if(tg&&!tg.dead){const dx=tg.x-p.tx,dy=tg.y-p.ty;if(dx*dx+dy*dy<(tg.r+24)*(tg.r+24)){
const isCrit=Math.random()<critChance();
const dmg=coreDmg()*rootMul()*0.5*(p.dmgMul||1)*(isCrit?critMult():1);
tg.lift=isCrit?14:9;hit(tg,dmg,isCrit);
if(M('m_vamp'))S.treeHp=Math.min(treeMaxHp(),S.treeHp+dmg*0.03);
if(sk('rs_2'))tg.slow=Math.max(tg.slow,2);
if(sk('rs_6')){tg.bleed=Math.min(10,(tg.bleed||0)+2);tg.bleedT=3;}
if(sk('rs_10')&&Math.random()<.25)tg.held=Math.max(tg.held,1.2);
if(sk('rs_8'))aoeAt(p.tx,p.ty,50,0.3,'201,160,106');
if(sk('rs_12'))aoeAt(p.tx,p.ty,80,0.6,'255,210,120');
const sx=p.tx,sy=p.ty*ISO;
for(let k=0;k<(isCrit?16:10);k++)parts.push({x:sx+rand(-16,16),y:sy,vx:rand(-30,30),vy:rand(-70,-26),l:rand(.4,.7),ml:.7,sz:rand(1.5,3),c:isCrit?'255,224,150':'120,90,58'});
for(let k=0;k<8;k++)parts.push({x:sx+rand(-12,12),y:sy+rand(-2,4),vx:rand(-22,22),vy:rand(-30,-4),l:.5,ml:.5,sz:rand(1.5,3),c:'92,66,40'});
parts.push({ring:true,x:sx,y:sy,l:.4,ml:.4,r0:8,r1:isCrit?70:48,c:isCrit?'255,210,120':'201,160,106'});
sfx.strike();
}else{
const sx=p.tx,sy=p.ty*ISO;
for(let k=0;k<6;k++)parts.push({x:sx+rand(-12,12),y:sy,vx:rand(-20,20),vy:rand(-50,-20),l:.4,ml:.4,sz:rand(1.5,2.5),c:'120,90,58'});
parts.push({ring:true,x:sx,y:sy,l:.3,ml:.3,r0:8,r1:36,c:'201,160,106'});
sfx.strike();}}}
function castAbilities(dt){
const P=abilPct, L=ab, RR=FRR;
cd.thornsalvo=Math.max(0,cd.thornsalvo-dt);
cd.vinewhip=Math.max(0,cd.vinewhip-dt);
cd.spores=Math.max(0,cd.spores-dt);
cd.crownwrath=Math.max(0,cd.crownwrath-dt);
cd.roottrap=Math.max(0,cd.roottrap-dt);
cd.fruitbomb=Math.max(0,cd.fruitbomb-dt);
cd.acidsap=Math.max(0,cd.acidsap-dt);
if(L('thornsalvo')>0&&cd.thornsalvo<=0){
const tg=nearestInReach();
if(tg){
cd.thornsalvo=Math.max(1.4,2.4-0.12*L('thornsalvo'));treeShakeT=0.25;
const base=Math.atan2(tg.y,tg.x);
const n=3+L('thornsalvo');const spread=0.9;const dmg=coreDmg()*(P('thornsalvo')/100)*0.5;
const maxLife=RR/420;
for(let i=0;i<n;i++){const a=base+(i-(n-1)/2)*(spread/(n-1||1));
shots.push({kind:'thorn',x:0,y:-treeGeom().h,vx:Math.cos(a)*420,vy:Math.sin(a)*420*ISO,dmg,
life:Math.min(maxLife,1.6),pierce:1});}
sfx.cast();}}
if(L('vinewhip')>0&&cd.vinewhip<=0){
const tg=nearestInReach();
if(tg){
cd.vinewhip=Math.max(2,3.2-0.15*L('vinewhip'));
const dir=Math.atan2(tg.y,tg.x);
const dmg=coreDmg()*(P('vinewhip')/100)*0.6;
zones.push({kind:'vine',t:0,dur:0.5,dir,R:RR,dmg,hit:new Set(),side:Math.random()<.5?1:-1});sfx.cast();}}
if(L('spores')>0&&cd.spores<=0){
const tg=nearestInReach();
if(tg){
cd.spores=Math.max(3,5-0.2*L('spores'));
const dir=Math.atan2(tg.y,tg.x);
zones.push({kind:'spore',t:0,dur:3.2,x:0,y:-treeGeom().h*0.5,vx:Math.cos(dir)*55,vy:Math.sin(dir)*55,
r:Math.min(RR*(0.28+0.02*L('spores')),RR*0.6),dmg:coreDmg()*(P('spores')/100)*0.12,tick:0});sfx.cast();}}
if(L('crownwrath')>0&&cd.crownwrath<=0){
const tgts=enemies.filter(e=>!e.dead&&inReach(e)).sort((a,b)=>(a.x*a.x+a.y*a.y)-(b.x*b.x+b.y*b.y)).slice(0,2+Math.floor(L('crownwrath')/2));
if(tgts.length>0){
cd.crownwrath=Math.max(2.4,4-0.2*L('crownwrath'));treeShakeT=0.3;
const dmg=coreDmg()*(P('crownwrath')/100)*0.7;
tgts.forEach((e,i)=>{shots.push({kind:'branchfall',tx:e.x,ty:e.y,x:e.x+rand(-30,30),y:-260-rand(0,80),
t:0,dur:0.6+i*0.08,dmg,done:false});});sfx.cast();}}
if(L('roottrap')>0&&cd.roottrap<=0){
const tg=nearestInReach();
if(tg){
cd.roottrap=Math.max(3.5,6-0.3*L('roottrap'));
const Rz=Math.min(RR*(0.4+0.03*L('roottrap')),RR*0.7);
zones.push({kind:'trap',t:0,dur:2.4,x:tg.x,y:tg.y,R:Rz,dmg:coreDmg()*(P('roottrap')/100)*0.5,hit:false});sfx.cast();}}
if(L('fruitbomb')>0&&cd.fruitbomb<=0){
const tg=nearestInReach();
if(tg){
cd.fruitbomb=Math.max(3,5-0.25*L('fruitbomb'));
const n=2+Math.floor(L('fruitbomb')/2);const dmg=coreDmg()*(P('fruitbomb')/100)*0.7;
const maxDist=RR*0.8;
for(let i=0;i<n;i++){const curTg=nearestInReach();if(!curTg)break;
const a=Math.atan2(curTg.y,curTg.x)+rand(-0.4,0.4);const dist=rand(60,maxDist);
shots.push({kind:'fruit',x:rand(-12,12),y:-treeGeom().h*0.6,tx:Math.cos(a)*dist,ty:Math.sin(a)*dist,
t:0,dur:0.7,dmg,R:Math.min(RR*(0.35+0.02*L('fruitbomb')),RR*0.5),done:false});}
sfx.cast();}}
if(L('acidsap')>0&&cd.acidsap<=0){
const tg=nearestInReach();
if(tg){
cd.acidsap=Math.max(2.5,4-0.2*L('acidsap'));
const a=Math.atan2(tg.y,tg.x);
const dist=Math.min(Math.hypot(tg.x,tg.y),RR);
shots.push({kind:'acidstream',x:0,y:-treeGeom().h*0.5,vx:Math.cos(a)*460*mutProjMul(),vy:Math.sin(a)*460*ISO*mutProjMul(),
life:dist/460,dmg:coreDmg()*(P('acidsap')/100)*0.4,R:Math.min(RR*(0.3+0.02*L('acidsap')),RR*0.5),puddle:false});sfx.cast();}}
}
function updateZones(dt){
const RR=FRR;
for(let i=zones.length-1;i>=0;i--){const z=zones[i];z.t+=dt;
if(z.kind==='vine'){
const prog=smooth(clamp(z.t/z.dur,0,1));
if(prog>0.3){for(const e of enemies){if(e.dead||z.hit.has(e)||!inReach(e))continue;
const d2=e.x*e.x+e.y*e.y;const ea=Math.atan2(e.y,e.x);
let da=Math.abs(((ea-z.dir+Math.PI)%(TAU))-Math.PI);
if(d2<z.R*z.R&&da<1.1){z.hit.add(e);hit(e,z.dmg,false);
if(!e.dead){e.x+=Math.cos(ea)*22;e.y+=Math.sin(ea)*22;}}}}
if(z.t>=z.dur){zones.splice(i,1);continue;}
}else if(z.kind==='spore'){
z.x+=z.vx*dt;z.y+=z.vy*dt;z.tick-=dt;
if(z.tick<=0){z.tick=0.4;const r2=z.r*z.r;for(const e of enemies){if(e.dead||!inReach(e))continue;
const dx=e.x-z.x,dy=e.y-z.y;if(dx*dx+dy*dy<r2)hit(e,z.dmg,false);}}
if(z.t>z.dur-0.5)z.r+=40*dt;
if(z.t>=z.dur){zones.splice(i,1);continue;}
}else if(z.kind==='trap'){
const ph=z.t/z.dur;
if(ph>0.25&&ph<0.8&&!z.hit){z.hit=true;const r2=z.R*z.R;
for(const e of enemies){if(e.dead||!inReach(e))continue;
const dx=e.x-z.x,dy=e.y-z.y;if(dx*dx+dy*dy<r2){hit(e,z.dmg,false);e.held=1.2;}}}
if(ph>=0.25&&ph<0.8){const r2=(z.R*0.7)*(z.R*0.7);for(const e of enemies){if(e.dead)continue;
const dx=e.x-z.x,dy=e.y-z.y;if(dx*dx+dy*dy<r2)e.held=Math.max(e.held,0.2);}}
if(z.t>=z.dur){zones.splice(i,1);continue;}
}else if(z.kind==='puddle'){
z.tick-=dt;
if(z.tick<=0){z.tick=0.4;const r2=z.r*z.r;for(const e of enemies){if(e.dead||!inReach(e))continue;
const dx=e.x-z.x,dy=e.y-z.y;if(dx*dx+dy*dy<r2)hit(e,z.dmg,false);}}
if(z.t>=z.dur){zones.splice(i,1);continue;}
}
}
}
function simulate(dt){
waveT+=dt;
if(S.treeHp>0&&S.treeHp<treeMaxHp()){
let reg=treeMaxHp()*.004;

S.treeHp=Math.min(treeMaxHp(),S.treeHp+reg*dt);}

treeShakeT=Math.max(0,treeShakeT-dt);
const frozen=['boost','cards','powers'].includes(S.tutPhase);

if(!frozen){
if(S.tutPhase==='new'){
if(enemies.length===0){spawn('beetle');const e0=enemies[enemies.length-1];e0.tut=true;e0.sp=50;
e0.hp=e0.maxHp=Math.max(e0.maxHp,150);
const a0=Math.atan2(e0.y,e0.x);e0.x=Math.cos(a0)*220;e0.y=Math.sin(a0)*220;}
}else if(betweenT>0){betweenT-=dt;}
else if(!bossActive&&!evoBossAlive){
spawnT-=dt;
if(spawnT<=0&&spawned<waveQuota(S.wave)){
if(enemies.length<70){spawn(pickType(S.wave));spawned++;}
spawnT=spawnInt(S.wave)*rand(.75,1.25);}
if(S.killed>=waveQuota(S.wave)){
bossActive=true;const bc=bossCount();
for(let i=0;i<bc;i++){
 const isSiegeExtra=M('m_siege')&&i===bc-1;
 spawn('boss',Math.pow(0.7,i)*(isSiegeExtra?0.75:1));}
sfx.boss();
banner((S.lang==='ru'?'Медведь-крушитель пробуждается…':'The Bear-Crusher awakens…'),
(bc>1?bc+'× ':'')+(S.lang==='ru'?'лесные исполины вышли из чащи':'the forest titans emerge'),'boss');
updateHUD();}}
}
if(!frozen){castAbilities(dt);updateZones(dt);}
if(!frozen){
rootT-=dt;
if(rootT<=0&&enemies.length){
rootT=1/rootAspd();
const inR=enemies.filter(e=>{if(e.dead)return false;const rr2=FRR+e.r;return e.x*e.x+e.y*e.y<=rr2*rr2;});
if(inR.length){
inR.sort((a,b)=>(a.x*a.x+a.y*a.y)-(b.x*b.x+b.y*b.y));
const count=Math.min(1+ab('rootnet')+sk('rs_14')+(sk('rs_4')?1:0),inR.length);
for(let i=0;i<count;i++){launchRoot(inR[i]);sfx.dig();}}}
}
if(!frozen){
for(let i=roots.length-1;i>=0;i--){const p=roots[i];
if(p.phase==='telegraph'){
if(p.tg&&!p.tg.dead){p.tx=p.tg.x;p.ty=p.tg.y;}
p.strikeT+=dt;
if(p.strikeT>=0.16){p.phase='spike';p.spikeT=0;rootStrike(p);}}
else if(p.phase==='spike'){p.spikeT+=dt;if(p.spikeT>=0.24){p.phase='retract';p.t=1;}}
else{p.t-=dt/0.3;
if(p.t<=0){for(let k=0;k<5;k++)parts.push({x:p.tx+rand(-12,12),y:p.ty*ISO+rand(-6,6),vx:rand(-10,10),vy:rand(-20,-6),l:.3,ml:.3,sz:1.6,c:'120,90,58'});
roots.splice(i,1);continue;}}}
}
if(!frozen){
const seedL=ab('seedshot');
if(seedL>0){
atkT-=dt;
if(atkT<=0&&enemies.length){
const reach=FRR;
const tg=enemies.filter(e=>!e.dead&&e.x*e.x+e.y*e.y<=(reach+e.r)*(reach+e.r))
.sort((a,b)=>(a.x*a.x+a.y*a.y)-(b.x*b.x+b.y*b.y));
if(tg.length>0){
atkT=1/treeAspd();
const g=treeGeom(),sw=Math.sin(T*1.05)*2.6;let sdmg=coreDmg()*seedMul();
shotN++;
const pSp=480*mutProjMul();
if(sk('ss_14')&&shotN%5===0){
tg.slice(0,6).forEach(e2=>shots.push({kind:'orb',x:sw*1.2,y:-g.h+8,t:e2,dmg:sdmg,sp:pSp,b:0,pierce:sk('ss_2')}));
}else{
shots.push({kind:'orb',x:sw*1.2,y:-g.h+8,t:tg[0],dmg:sdmg,sp:pSp,b:0,pierce:sk('ss_2')});
if(sk('ss_10')&&Math.random()<.25&&tg.length>1)
shots.push({kind:'orb',x:sw*1.2,y:-g.h+8,t:tg[1],dmg:sdmg,sp:pSp,b:0,pierce:0});
}
sfx.shoot();}}}
}
if(!frozen){
for(let i=shots.length-1;i>=0;i--){const s=shots[i];
if(s.kind==='ring'){
s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;s.rot+=.25;
if(s.life<=0){shots.splice(i,1);continue;}
let gone=false;
for(const e of enemies){if(e.dead||!inReach(e))continue;
const dx=e.x-s.x,dy=(e.y-s.y)*ISO;if(dx*dx+dy*dy<(e.r+7)*(e.r+7)){hit(e,s.dmg,false);s.pierce--;
parts.push({leaf:true,lk:'leaf',ph:rand(0,TAU),x:s.x,y:s.y*ISO,vy:14,l:.6,ml:.6,c:'150,210,140'});
if(s.pierce<=0){shots.splice(i,1);gone=true;break;}}}
if(gone)continue;continue;}
if(s.kind==='thorn'){
s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
if(s.life<=0){shots.splice(i,1);continue;}
let gone=false;
for(const e of enemies){if(e.dead||!inReach(e))continue;
const dx=e.x-s.x,dy=(e.y*ISO-s.y);if(dx*dx+dy*dy<(e.r+6)*(e.r+6)){hit(e,s.dmg,false);s.pierce--;
if(s.pierce<=0){shots.splice(i,1);gone=true;break;}}}
if(gone)continue;continue;}
if(s.kind==='branchfall'){
s.t+=dt;const pr=clamp(s.t/s.dur,0,1);
s.x=lerp(s.x,s.tx,pr*0.4);s.y=lerp(s.y,s.ty*ISO,pr);
if(pr>=1&&!s.done){s.done=true;
for(const e of enemies){if(e.dead||!inReach(e))continue;const dx=e.x-s.tx,dy=e.y-s.ty;if(dx*dx+dy*dy<(e.r+22)*(e.r+22))hit(e,s.dmg,false);}
burst(s.tx,s.ty*ISO,22,'150,110,70');sfx.strike();shots.splice(i,1);continue;}
continue;}
if(s.kind==='fruit'){
s.t+=dt;const pr=clamp(s.t/s.dur,0,1);
s.cx=lerp(s.x,s.tx,pr);s.cy=lerp(s.y,s.ty*ISO,pr)-Math.sin(pr*Math.PI)*40;
if(pr>=1&&!s.done){s.done=true;const r2=s.R*s.R;
for(const e of enemies){if(e.dead||!inReach(e))continue;const dx=e.x-s.tx,dy=e.y-s.ty;if(dx*dx+dy*dy<r2)hit(e,s.dmg,false);}
burst(s.tx,s.ty*ISO,s.R*0.7,'240,150,70');parts.push({ring:true,x:s.tx,y:s.ty*ISO,l:.4,ml:.4,r0:8,r1:s.R,c:'240,168,72'});
sfx.boom();shots.splice(i,1);continue;}
continue;}
if(s.kind==='acidstream'){
s.life-=dt;s.x+=s.vx*dt;s.y+=s.vy*dt;
for(const e of enemies){if(e.dead||!inReach(e))continue;const dx=e.x-s.x,dy=(e.y*ISO-s.y);if(dx*dx+dy*dy<(e.r+8)*(e.r+8))hit(e,s.dmg*0.3,false);}
if(s.life<=0){if(!s.puddle){s.puddle=true;
zones.push({kind:'puddle',t:0,dur:3.5,x:s.x,y:s.y/ISO,r:s.R,dmg:s.dmg*0.5,tick:0});}
shots.splice(i,1);continue;}
continue;}
const tg=s.t;
if(tg.dead){
if(s.pierce>0){let best=null,bd=1e9;
for(const e of enemies){if(e===tg||e.dead)continue;const ex=e.x-tg.x,ey=(e.y-tg.y)*ISO;const dd=Math.hypot(ex,ey);if(dd<bd&&dd<300){bd=dd;best=e;}}
if(best){s.t=best;s.pierce--;continue;}}
puff(s.x,s.y);shots.splice(i,1);continue;}
const tx=tg.x,ty=tg.y*ISO-tg.r*.5,dx=tx-s.x,dy=ty-s.y,d=Math.hypot(dx,dy);
if(d<tg.r*.7+6){
const cr=Math.random()<critChance();
hit(tg,cr?s.dmg*critMult():s.dmg,cr);
if(sk('ss_6')&&!tg.dead)tg.burn=3;
if(sk('ss_8')&&!tg.dead)aoeAt(tg.x,tg.y,45,0.5,'255,190,90');
if(M('m_lichen'))aoeAt(tg.x,tg.y,30,0.2,'255,140,60');
if(sk('ss_4')){let n2=0;
for(const e of enemies){if(n2>=2)break;if(e.dead||e===tg||!inReach(e))continue;
hit(e,s.dmg*0.4,false);n2++;}}
if(s.pierce>0){let best=null,bd=1e9;
for(const e of enemies){if(e===tg||e.dead)continue;const ex=e.x-tg.x,ey=(e.y-tg.y)*ISO;const dd=Math.hypot(ex,ey);if(dd<bd&&dd<300){bd=dd;best=e;}}
if(best){s.t=best;s.pierce--;continue;}}
shots.splice(i,1);continue;}
const v=s.sp*dt/d;s.x+=dx*v;s.y+=dy*v;
if(Math.random()<.5)parts.push({x:s.x,y:s.y,vx:rand(-8,8),vy:rand(-8,8),l:.22,ml:.22,sz:1.5,c:'255,217,138'});}
}
const brP=abilPct('branch');
if(!frozen&&brP>0){branchCd-=dt;const reach=rootReach()*0.85;const r2=reach*reach;
const near=enemies.filter(e=>{if(e.dead)return false;return e.x*e.x+e.y*e.y<r2;});
if(branchCd<=0&&near.length){
branchCd=Math.max(1.2,2.4-.2*ab('branch'));branchFx=1;branchAng=rand(0,TAU);branchDir*=-1;
const bdmg=coreDmg()*(brP/100)*0.4;
for(const e of near){hit(e,bdmg,false);if(!e.dead){const d=Math.max(1,Math.hypot(e.x,e.y));e.x+=e.x/d*16;e.y+=e.y/d*16;}}
sfx.branch();}}
branchFx=Math.max(0,branchFx-dt*2.4);

const lfP=abilPct('leafstorm');
if(!frozen&&lfP>0){leafCd-=dt;
if(leafCd<=0&&enemies.some(e=>!e.dead&&inReach(e))){
leafCd=Math.max(3.5,7-ab('leafstorm'));
const n=8+3*ab('leafstorm'),dmg=coreDmg()*(lfP/100)*0.4;
const maxLife=FRR/190;
for(let i=0;i<n;i++){const a=i/n*TAU+rand(-.12,.12);
shots.push({kind:'ring',rot:rand(0,TAU),x:Math.cos(a)*46,y:Math.sin(a)*46,vx:Math.cos(a)*190,vy:Math.sin(a)*190,dmg,life:Math.min(maxLife,1.7),pierce:2});}
sfx.leaf();}}
const blP=abilPct('bleed');
for(const e of enemies){
e.born=Math.min(1,e.born+dt*2.2);e.lift=Math.max(0,e.lift-dt*40);e.flash=Math.max(0,e.flash-dt*6);
if(e.freeze>0)e.freeze-=dt;
if(e.held>0)e.held-=dt;
if(e.slow>0)e.slow-=dt;
if(e.burn>0&&!e.dead){e.burn-=dt;e.hp-=coreDmg()*0.2*dt;
if(Math.random()<dt*5)parts.push({x:e.x+rand(-5,5),y:e.y*ISO-e.r*.5,vx:rand(-8,8),vy:rand(-20,-8),l:.4,ml:.4,sz:1.6,c:'255,140,60'});
if(e.hp<=0&&!e.tut)e.dead=true;}
if((e.type==='boss'||e.type==='evoboss')&&!e.summoned&&!e.dead&&e.hp<=e.maxHp*0.5){
e.summoned=true;e.summonAnim=1.5;
e.summonQueue=Math.ceil(waveQuota(S.wave)/1.5);
e.summonTimer=0.5;
sfx.summon();
floats.push({x:e.x,y:e.y*ISO-e.r-20,txt:S.lang==='ru'?'ПРИЗЫВ!':'SUMMON!',l:1.2,ml:1.2,c:'#ff6b8a',sz:16});}
if(e.summonQueue>0&&!e.dead){
e.summonTimer-=dt;
if(e.summonTimer<=0){e.summonTimer=0.8;e.summonQueue--;spawnSummon();}}
if(e.summonAnim>0)e.summonAnim-=dt;
if(!frozen&&blP>0&&e.bleed>0&&e.bleedT>0&&!e.dead){
e.bleedT-=dt;e.hp-=coreDmg()*(blP/100)*0.01*e.bleed*dt;
if(Math.random()<dt*4)parts.push({x:e.x+rand(-5,5),y:e.y*ISO-e.r*.5,vx:rand(-8,8),vy:rand(-18,-6),l:.4,ml:.4,sz:1.6,c:'168,220,120'});
if(e.bleedT<=0)e.bleed=0;if(e.hp<=0&&!e.tut)e.dead=true;}
if(frozen){e.vx=0;e.vy=0;continue;}
const d=Math.hypot(e.x,e.y),lim=26+e.r*.3;
const held=e.held>0||e.freeze>0;
const sf=e.slow>0?0.6:1;
let mvx=0,mvy=0;
if(d<=lim&&!held){
e.attacking=true;
e.atkAnim=Math.min(1,(e.atkAnim||0)+dt*3);
e.vx=0;e.vy=0;
e.atk-=dt;
if(e.atk<=0){e.atk=1.0;e.atkAnim=0;damageTree(e.dmg,e.type==='boss'||e.type==='evoboss');
if(e.tut&&S.tutPhase==='new')enterBoost();}
}else{
e.attacking=false;
e.atkAnim=Math.max(0,(e.atkAnim||0)-dt*4);
if(e.type==='spirit'){const v=e.sp*dt*sf*(held?0.15:1);const ang=Math.atan2(-e.y*ISO,-e.x);
mvx=Math.cos(ang)*e.sp;mvy=Math.sin(ang)*e.sp;
if(d>lim){e.x+=Math.cos(ang)*v;e.y+=Math.sin(ang)*v/ISO;}}
else if(d>lim){const v=e.sp*dt*sf/d*(held?0.15:1);mvx=-e.x/d*e.sp;mvy=-e.y/d*e.sp;e.x-=e.x*v;e.y-=e.y*v;}
}
e.vx=mvx;e.vy=mvy;
if((e.type==='boss'||e.type==='evoboss')&&!e.dead&&Math.random()<dt*5)
parts.push({x:e.x+rand(-e.r,e.r)*.6,y:e.y*ISO-e.r*.6,vx:rand(-6,6),vy:rand(-20,-8),l:rand(.8,1.4),ml:1.4,sz:rand(1.2,2.4),c:e.type==='evoboss'?'240,168,72':'214,140,190'});}
for(let i=enemies.length-1;i>=0;i--){if(enemies[i].dead){kill(enemies[i]);enemies.splice(i,1);}}
windT+=dt;gustTimer-=dt;
if(gustTimer<=0){gustTarget=Math.random()<.5?rand(.4,1):rand(0,.2);gustTimer=rand(5,11);}
gust+=(gustTarget-gust)*Math.min(1,dt*1.2);
squirrelTimer-=dt;
if(!squirrel&&squirrelTimer<=0&&!anyOverlayOpen()&&!anySheetOpen()&&!frozen){
const target=scenery.filter(s=>s.type==='tree');
if(target.length){const tg=target[Math.floor(Math.random()*target.length)];
squirrel={t:0,dur:rand(4.5,6.5),fx:cx,fy:cy-treeGeom().h*.3,tx:tg.x,ty:tg.y,clicked:false,seed:rand(0,100)};}}
if(squirrel){squirrel.t+=dt;if(squirrel.clicked||squirrel.t>=squirrel.dur){squirrel=null;squirrelTimer=rand(120,300);}}
}
function spawnInt(w){return Math.max(.38,1.7*Math.pow(.94,w-1));}
function updateFx(dt){
flinch=Math.max(0,flinch-dt*3);pulse=Math.max(0,pulse-dt*1.6);
const g=treeGeom(),ts=TREE_SKINS[S.treeSkin]||TREE_SKINS.oak;
leafT-=dt;
if(leafT<=0){
leafT=(ts.leafKind==='petal'||ts.leafKind==='leaf')?rand(.7,1.6):rand(1.1,2.2);
const up=ts.leafKind==='spark';
if(S.gfx.glow)parts.push({leaf:true,lk:ts.leafKind,ph:rand(0,TAU),x:rand(-g.R,g.R)*.8,y:-g.h+rand(-g.R*.4,g.R*.3),
vy:up?rand(-18,-10):rand(14,26),l:rand(1.2,2.2),ml:2.2,c:ts.leafC});}
for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l-=dt;
if(p.l<=0){parts.splice(i,1);continue;}
if(!p.ring){
if(p.leaf){p.x+=Math.sin(p.l*5+p.ph)*(p.lk==='petal'?20:14)*dt+gust*8*dt;p.y+=p.vy*dt;}
else{p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=60*dt;p.vx*=Math.max(0,1-2.2*dt);}}}
if(parts.length>220)parts.splice(0,parts.length-220);
for(let i=floats.length-1;i>=0;i--){floats[i].l-=dt;if(floats[i].l<=0)floats.splice(i,1);}
}
