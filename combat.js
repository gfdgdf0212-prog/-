'use strict';
/* ── СОСТОЯНИЕ БОЯ ── */
const enemies=[],shots=[],parts=[],floats=[],roots=[],zones=[];
const flies=[];for(let i=0;i<14;i++)flies.push({x:Math.random(),y:Math.random(),p:rand(0,TAU),s:rand(.4,1),
c:['232,214,138','138,222,196','158,224,152'][i%3]});
let T=0,atkT=0,rootT=0,spawnT=1.4,betweenT=2.4,waveT=0;
let spawned=0,bossActive=false,evoBossAlive=false;
let branchCd=2,leafCd=6,branchFx=0,branchAng=0,branchDir=1;
let shakeM=0,flinch=0,pulse=0,leafT=1,treeShakeT=0;
let windT=0,gust=0,gustTarget=0,gustTimer=4;
let runKills=0,runSeeds=0,dispSeeds=S.seeds,lastStr='';
let squirrel=null,squirrelTimer=rand(120,300);
let tutStep='tab';
let showRadiusCheat=false;
let shotN=0,antT=0,diedThisWave=false;
let questsAnimating=false;
const cd={thornsalvo:0,vinewhip:0,spores:0,crownwrath:0,roottrap:0,fruitbomb:0,acidsap:0};
const ET={beetle:{hp:25,sp:30,rw:5,dmg:3,r:9},wolf:{hp:50,sp:56,rw:9,dmg:5,r:11},
golem:{hp:50,sp:18,rw:22,dmg:9,r:14},spirit:{hp:12,sp:46,rw:12,dmg:4,r:9},
boss:{hp:150,sp:30,rw:45,dmg:16,r:21},
evoboss:{hp:500,sp:20,rw:200,dmg:40,r:28}};
function pickType(w){const r=Math.random();
if(w>=6)return r<.12?'golem':r<.30?'spirit':r<.55?'wolf':'beetle';
if(w>=4)return r<.22?'spirit':r<.5?'wolf':'beetle';
if(w>=3)return r<.32?'wolf':'beetle';
return 'beetle';}
function spawn(type,bossMul=1){const t=ET[type],w=S.wave,ch=chapterOf(w),a=rand(0,TAU),R=spawnR();
const boss=type==='boss'||type==='evoboss';
let hp,dmg;
if(type==='evoboss'){
hp=t.hp*enemyScaleHP(ch)*CONFIG.EVO.BOSS_HP_MULT*bossMul;
dmg=t.dmg*enemyScaleDMG(ch)*CONFIG.EVO.BOSS_DMG_MULT;}
else if(boss){hp=t.hp*enemyScaleHP(ch)*Math.pow(CONFIG.ENEMY.BOSS_HP_PER_WAVE,w-1)*bossMul*1.8;
dmg=t.dmg*enemyScaleDMG(ch)*Math.pow(CONFIG.ENEMY.BOSS_DMG_PER_WAVE,w-1);
}
else{hp=t.hp*enemyScaleHP(ch)*rand(.9,1.1)*1.8*mutEnemyHpMul();dmg=t.dmg*enemyScaleDMG(ch);}
enemies.push({type,x:Math.cos(a)*R,y:Math.sin(a)*R,hp,maxHp:hp,
sp:t.sp*rand(.92,1.08)*mutEnemySpdMul(),dmg,rw:Math.round(t.rw*enemyScaleRW(ch)*(type==='evoboss'?CONFIG.EVO.BOSS_RW_MULT:1)),
r:t.r,phase:rand(0,TAU),flash:0,atk:rand(.3,.8),dead:false,born:0,lift:0,bleed:0,bleedT:0,burn:0,slow:0,held:0,tut:false,
vx:0,vy:0,attacking:false,atkAnim:0,summoned:false,summonAnim:0,summonQueue:0,summonTimer:0,isSummon:false,freeze:0});}
function spawnSummon(){
const type=pickType(S.wave);const t=ET[type];
const ch=chapterOf(S.wave),a=rand(0,TAU),R=spawnR();
enemies.push({type,x:Math.cos(a)*R,y:Math.sin(a)*R,hp:maxHp0(t,ch),maxHp:maxHp0(t,ch),
sp:t.sp*2,dmg:t.dmg*enemyScaleDMG(ch),rw:Math.round(t.rw*enemyScaleRW(ch)*0.5),
r:t.r,phase:rand(0,TAU),flash:0,atk:rand(.3,.8),dead:false,born:0,lift:0,bleed:0,bleedT:0,burn:0,slow:0,held:0,tut:false,
vx:0,vy:0,attacking:false,atkAnim:0,summoned:true,summonAnim:0,summonQueue:0,summonTimer:0,isSummon:true,freeze:0});}
function maxHp0(t,ch){return t.hp*enemyScaleHP(ch)*0.5;}
function startEvolution(){
if(!evoAvailable()||evoBossAlive||S.over)return;
enemies.length=0;shots.length=0;roots.length=0;zones.length=0;
spawned=0;bossActive=false;S.killed=0;
S.evoBossActive=true;evoBossAlive=true;
spawn('evoboss');
banner(t('evoBoss'),t('evoStart'),'evo');
$('#wavePill').classList.add('evo-phase');
$('#waveLab').textContent=S.lang==='ru'?'Эволюция':'Evolution';
sfx.boss();
save();updateHUD();updateEvoBtn();}
function onEvoBossKilled(){
evoBossAlive=false;S.evoBossActive=false;
S.evoStage=(S.evoStage||0)+1;
S.killed=0;spawned=0;bossActive=false;betweenT=3;spawnT=1.4;
$('#wavePill').classList.remove('evo-phase');
banner(t('evoWin'),t('evoReady'),'evo');
sfx.reveal('mythic');pulse=1;leafBurst();
applyTreeSkin();
save();updateHUD();updateEvoBtn();}
function updateEvoBtn(){
const btn=$('#evoBtn');if(!btn)return;
const maxStage=CONFIG.EVO.T.length-1;
const avail=evoAvailable()&&!evoBossAlive&&!S.over;
const maxed=(S.evoStage||0)>=maxStage;
btn.classList.toggle('ready',avail);
btn.classList.toggle('off',!avail);
const lab=$('#evoLab');
if(lab){
if(maxed)lab.textContent=t('evoMax');
else if(avail)lab.textContent=t('evoReady');
else lab.textContent=t('evoLocked')+evoNextChapter();}}
$('#evoBtn').addEventListener('click',()=>{
if(evoBossAlive)return;
if(!evoAvailable()){toast(t('evoLocked')+evoNextChapter());return;}
startEvolution();});