cv.addEventListener('pointerdown',ev=>{
if(anySheetOpen()){closeAllSheets();return;}
if(['boost','cards','powers'].includes(S.tutPhase))return;
const sx=ev.clientX,sy=ev.clientY;
if(squirrel&&!squirrel.clicked&&!anyOverlayOpen()){
const p=squirrel.t/squirrel.dur;
const bx=lerp(squirrel.fx,squirrel.tx,p),by=lerp(squirrel.fy,squirrel.ty,p)-Math.abs(Math.sin(p*Math.PI*4))*14;
if(Math.hypot(sx-bx,sy-by)<26){
squirrel.clicked=true;const n=Math.floor(rand(3,9));if(S.tutorialDone){S.dew+=n;bump('#dewPill');}
floats.push({x:(bx-cx),y:(by-cy)-14,txt:'+'+fmt(n)+(S.lang==='ru'?' росы':' dew'),l:1.2,ml:1.2,c:'#a5e8f0',sz:13});
for(let i=0;i<8;i++)parts.push({x:bx-cx,y:by-cy,vx:rand(-30,30),vy:rand(-40,-10),l:.5,ml:.5,sz:2,c:'124,201,232'});
sfx.squirrel();save();updateHUD();return;}}
const x=sx-cx,y=sy-cy;
parts.push({ring:true,x,y,l:.35,ml:.35,r0:4,r1:34,c:'159,222,187'});
let best=null,bd=1e9;
for(const e of enemies){const d=Math.hypot(e.x-x,e.y*ISO-y)-e.r;if(d<bd){bd=d;best=e;}}
if(best&&bd<48)hit(best,Math.max(1,coreDmg()*.55),false);});
function buy(k,btn){if(S.over)return;
if(S.tutPhase==='boost'&&k!=='dmg'&&S.dmgLvl<10){toast(t('dmgFirst'));return;}
const cur=S[k+'Lvl']||0;
let n=buyMul==='max'?maxAfford(k).n:buyMul;
if(S.tutPhase==='boost')n=Math.max(n,1);
if(cur+n>CONFIG.UPG.LVL_CAP)n=CONFIG.UPG.LVL_CAP-cur;
if(n<=0)return;
const c=costRange(k,cur,n);if(S.seeds<c)return;
S.seeds-=c;
const before=treeMaxHp();
S[k+'Lvl']=cur+n;
if(k==='hp'){S.treeHp=Math.min(treeMaxHp(),S.treeHp+(treeMaxHp()-before));}
if(S.dailyProg)S.dailyProg.upg=(S.dailyProg.upg||0)+n;
pulse=1;leafBurst();sfx.upgrade();checkAmber();
btn.classList.remove('bought');void btn.offsetWidth;btn.classList.add('bought');
if(k==='dmg'&&S.tutPhase==='boost'&&S.dmgLvl>=10){enterPlay();}
save();updateHUD();}
el.ud.addEventListener('click',()=>buy('dmg',el.ud));
el.us.addEventListener('click',()=>buy('spd',el.us));
el.ur.addEventListener('click',()=>buy('rad',el.ur));
el.uc.addEventListener('click',()=>buy('cc',el.uc));
el.ux.addEventListener('click',()=>buy('cd',el.ux));
el.uh.addEventListener('click',()=>buy('hp',el.uh));
function syncMulRowUI(){
const boost=S.tutPhase==='boost';
$('#mulRow').querySelectorAll('.mul-btn').forEach(b=>{
const m=b.dataset.mul;
b.disabled=boost&&m!=='10';
b.classList.toggle('on',(buyMul==='max'?'max':String(buyMul))===m);});}
$('#mulRow').addEventListener('click',e=>{const b=e.target.closest('[data-mul]');if(!b||b.disabled)return;
const v=b.dataset.mul;buyMul=v==='max'?'max':parseInt(v,10);
$('#mulRow').querySelectorAll('.mul-btn').forEach(x=>x.classList.toggle('on',x===b));
if(S.tutPhase==='boost'&&tutStep==='mul'){tutStep='dmg';}
updateTutHighlights();updateHUD();});
function bindTab(btn,sel,fn){$(btn).addEventListener('click',()=>{
if(!allowedSheets().includes(sel))return;
const was=$(sel).classList.contains('open');
closeAllSheets();
if(!was){open(sel);
if(sel==='#upgOverlay'&&S.tutPhase==='boost'){tutStep='mul';setTimeout(updateTutHighlights,350);}
if(sel==='#abilitiesOverlay'&&S.tutPhase==='powers'){setTimeout(updateTutHighlights,350);}
fn&&fn();}});}
bindTab('#navUpg','#upgOverlay',()=>updateHUD());
bindTab('#navRoulette','#rouletteOverlay',()=>{if(cardPhase==='idle')genCards();else{renderCards();updateSpinBtn();}});
bindTab('#navTree','#skillTreeOverlay',()=>{renderSkillTree();initTreeDrag();});
bindTab('#navAbilities','#abilitiesOverlay',renderAbilities);
bindTab('#navQuests','#questsOverlay',renderQuests);
bindTab('#shopBtn','#shopOverlay',renderShop);
$('#spinBtn').addEventListener('click',startSpin);
$('#claimBtn').addEventListener('click',claimCards);
$('#cardMulRow').addEventListener('click',e=>{
const b=e.target.closest('[data-cmul]');
if(!b)return;
if($('#cardMulRow').classList.contains('locked'))return;
cardMul=+b.dataset.cmul;
$('#cardMulRow').querySelectorAll('.mul-btn').forEach(x=>x.classList.toggle('on',x===b));
refreshCardFaces();updateSpinBtn();
});
function syncSpeedUI(){const ch=chapterOf(S.bestWave);const s2=$('#speed2Btn'),s4=$('#speed4Btn');
if(s2)s2.classList.toggle('locked',ch<20);
if(s4)s4.classList.remove('locked');
document.querySelectorAll('.speed-btn').forEach(b=>b.classList.toggle('on',+b.dataset.speed===(S.speed||1)));}
document.querySelector('.speed-row').addEventListener('click',e=>{const b=e.target.closest('.speed-btn');if(!b)return;
const spd=+b.dataset.speed;
if(spd===4&&!S.speed4Bought){open('#speed4Overlay');return;}
if(spd===2&&chapterOf(S.bestWave)<20)return;
if(b.classList.contains('locked'))return;
S.speed=spd;syncSpeedUI();save();});
$('#speed4BuyBtn').addEventListener('click',()=>{
if(S.amber>=100){S.amber-=100;S.speed4Bought=true;S.speed=4;
close('#speed4Overlay');syncSpeedUI();save();updateHUD();
toast(S.lang==='ru'?'Скорость ×4 активирована!':'×4 speed activated!');sfx.claim();}
else{toast(S.lang==='ru'?'Недостаточно янтаря':'Not enough amber');}});
$('#speed4CancelBtn').addEventListener('click',()=>close('#speed4Overlay'));
let treeDrag=null;
function initTreeDrag(){
const container=$('#skillTreeContainer');const tree=$('#skillTree');
if(!treeDrag){
treeDrag={x:0,y:0,dragging:false,startX:0,startY:0,scrollX:0,scrollY:0};
container.addEventListener('pointerdown',startDrag);
window.addEventListener('pointermove',onDrag);window.addEventListener('pointerup',endDrag);}
const TW=540,TH=1520;
const cw=container.clientWidth,ch2=container.clientHeight;
treeDrag.x=clamp((cw-TW)/2,cw-TW,0);
treeDrag.y=clamp(ch2/2-780,ch2-TH,0);
tree.style.transform=`translate(${treeDrag.x}px,${treeDrag.y}px)`;}
function startDrag(e){if(e.target.closest('.skill-node'))return;treeDrag.dragging=true;
treeDrag.startX=e.clientX;treeDrag.startY=e.clientY;treeDrag.scrollX=treeDrag.x;treeDrag.scrollY=treeDrag.y;}
function onDrag(e){if(!treeDrag||!treeDrag.dragging)return;
treeDrag.x=treeDrag.scrollX+(e.clientX-treeDrag.startX);treeDrag.y=treeDrag.scrollY+(e.clientY-treeDrag.startY);
$('#skillTree').style.transform=`translate(${treeDrag.x}px,${treeDrag.y}px)`;}
function endDrag(){if(treeDrag)treeDrag.dragging=false;}
document.querySelectorAll('.panel-grip').forEach(g=>{
let sy=0,dy=0,drag=false,moved=false;
g.addEventListener('pointerdown',e=>{drag=true;moved=false;sy=e.clientY;dy=0;try{g.setPointerCapture(e.pointerId);}catch(_){}});
g.addEventListener('pointermove',e=>{if(!drag)return;dy=e.clientY-sy;
if(dy>8)moved=true;
const p=g.closest('.panel');if(p)p.style.transform=dy>0?`translateY(${dy}px)`:'none';});
const end=()=>{if(!drag)return;drag=false;
const p=g.closest('.panel');if(p)p.style.transform='';
const sh=g.closest('.sheet');if(!sh)return;
if(moved&&dy>90)closeSheet('#'+sh.id);};
g.addEventListener('pointerup',end);
g.addEventListener('pointercancel',end);});
$('#setBtn').addEventListener('click',()=>{
if(!allowedSheets().includes('#setOverlay'))return;
const was=$('#setOverlay').classList.contains('open');
closeAllSheets();
if(!was){open('#setOverlay');
$('#volRange').value=Math.round((S.vol==null?1:S.vol)*100);$('#volVal').textContent=$('#volRange').value+'%';
$('#musicRange').value=Math.round((S.musicVol||0)*100);$('#musicVal').textContent=$('#musicRange').value+'%';
const st=$('#shakeTog');st.textContent=S.shake?(S.lang==='ru'?'Вкл':'On'):(S.lang==='ru'?'Выкл':'Off');st.classList.toggle('on',S.shake);
syncGfxUI();syncSpeedUI();syncFpsUI();}});
$('#volRange').addEventListener('input',e=>{S.vol=+e.target.value/100;$('#volVal').textContent=e.target.value+'%';save();});
$('#musicRange').addEventListener('input',e=>{S.musicVol=+e.target.value/100;$('#musicVal').textContent=e.target.value+'%';applyMusicVol();save();});
$('#shakeTog').addEventListener('click',()=>{S.shake=!S.shake;const st=$('#shakeTog');st.textContent=S.shake?(S.lang==='ru'?'Вкл':'On'):(S.lang==='ru'?'Выкл':'Off');st.classList.toggle('on',S.shake);save();});
 function syncFpsUI(){const st=$('#fpsTog');if(!st)return;
st.textContent=S.showFps?(S.lang==='ru'?'Вкл':'On'):(S.lang==='ru'?'Выкл':'Off');
st.classList.toggle('on',S.showFps);
const m=$('#fpsMeter');if(m)m.style.display=S.showFps?'block':'none';}
$('#fpsTog').addEventListener('click',()=>{S.showFps=!S.showFps;syncFpsUI();save();});
function syncGfxUI(){
const set=(id,val)=>{const el2=$(id);if(!el2)return;el2.querySelectorAll('.gfx-opt').forEach(x=>x.classList.toggle('on',x.dataset.v===val));};
set('#gfxParticles',S.gfx.particles);
set('#gfx3d',S.gfx.use3d?'on':'off');
set('#gfxShadows',S.gfx.shadows?'on':'off');
set('#gfxGlow',S.gfx.glow?'on':'off');}
$('#gfxToggle').addEventListener('click',()=>{
$('#gfxSub').classList.toggle('open');
$('#gfxToggle').classList.toggle('open');});
$('#gfxParticles').addEventListener('click',e=>{const b=e.target.closest('.gfx-opt');if(!b)return;
S.gfx.particles=b.dataset.v;syncGfxUI();save();Tree3D.isReady()&&Tree3D.setColors((TREE_SKINS[S.treeSkin]||TREE_SKINS.oak).trunk[0],(TREE_SKINS[S.treeSkin]||TREE_SKINS.oak).canopy[2],(TREE_SKINS[S.treeSkin]||TREE_SKINS.oak).trunk[1]);});
$('#gfx3d').addEventListener('click',e=>{const b=e.target.closest('.gfx-opt');if(!b)return;
S.gfx.use3d=b.dataset.v==='on';syncGfxUI();save();});
$('#gfxShadows').addEventListener('click',e=>{const b=e.target.closest('.gfx-opt');if(!b)return;
S.gfx.shadows=b.dataset.v==='on';syncGfxUI();save();});
$('#gfxGlow').addEventListener('click',e=>{const b=e.target.closest('.gfx-opt');if(!b)return;
S.gfx.glow=b.dataset.v==='on';syncGfxUI();save();});
$('#langRu').addEventListener('click',()=>{S.lang='ru';save();applyLang();});
$('#langEn').addEventListener('click',()=>{S.lang='en';save();applyLang();});
function applyLang(){document.documentElement.lang=S.lang;
$('#langRu').classList.toggle('on',S.lang==='ru');$('#langEn').classList.toggle('on',S.lang==='en');
const pl=$('#passLab');if(pl)pl.textContent=S.lang==='ru'?'Пропуск':'Pass';
try{renderShop();renderQuests();renderPass();updateHUD();updateSpinBtn();}catch(e){}}
function setupCurrencyTips(){
const defs=[['seedPill','tipSeeds'],['dewPill','tipDew']];
defs.forEach(([id,key])=>{
const el2=$('#'+id);if(!el2)return;
let timer=null;
el2.addEventListener('pointerdown',()=>{
timer=setTimeout(()=>{
const ct=$('#currencyTip');if(!ct)return;
ct.textContent=t(key);
const r=el2.getBoundingClientRect();
ct.style.left=clamp(r.left+r.width/2-90,8,innerWidth-188)+'px';
ct.style.top=(r.bottom+6)+'px';
ct.classList.add('show');
setTimeout(()=>ct.classList.remove('show'),2500);
},1000);});
['pointerup','pointerleave','pointercancel'].forEach(ev=>el2.addEventListener(ev,()=>clearTimeout(timer)));});}
setupCurrencyTips();
function refreshTutUI(){$('#tutDim').classList.toggle('on',['boost','cards','powers'].includes(S.tutPhase));}
function clearTutGlow(){document.querySelectorAll('.tut-glow').forEach(e=>e.classList.remove('tut-glow'));}
function updateTutHighlights(){
clearTutGlow();const p=S.tutPhase;
if(p==='boost'){
if(tutStep==='tab')$('#navUpg').classList.add('tut-glow');
else if(tutStep==='mul'){const b=$('#mulRow').querySelector('[data-mul="10"]');if(b)b.classList.add('tut-glow');}
else if(tutStep==='dmg')$('#upgDmg').classList.add('tut-glow');
}else if(p==='cards')$('#navRoulette').classList.add('tut-glow');
else if(p==='powers'){
$('#navAbilities').classList.add('tut-glow');
if($('#abilitiesOverlay').classList.contains('open')){
const c=$('#abilContent').querySelector('[data-abil="seedshot"]');if(c)c.classList.add('tut-glow');}}}
function enterBoost(){S.tutPhase='boost';tutStep='tab';
buyMul=10;syncMulRowUI();
save();refreshTutUI();updateTutHighlights();updateNav();}
function enterPlay(){
S.tutPhase='play';enemies.forEach(e=>{if(e.tut)e.tut=false;});tutStep=null;
syncMulRowUI();
save();refreshTutUI();updateTutHighlights();updateNav();updateHUD();}
function enterCards(){S.tutPhase='cards';save();refreshTutUI();updateTutHighlights();updateNav();}
function enterPowers(){S.tutPhase='powers';save();refreshTutUI();updateTutHighlights();updateNav();}
function finishTutorial(){S.tutPhase='done';S.tutorialDone=true;
S.abilities.seedshot=Math.max(1,S.abilities.seedshot||0);
syncMulRowUI();
save();refreshTutUI();updateTutHighlights();updateNav();renderAbilities();updateHUD();
if(S.mutWeek!==weekKey())setTimeout(openMutChoice,1200);}
function checkAmber(){const L=S.dmgLvl+S.spdLvl+S.hpLvl+S.radLvl+S.ccLvl+S.cdLvl,tt=Math.floor(L/50);
if(tt>S.amberTier){const n=(tt-S.amberTier)*5;S.amberTier=tt;S.amber+=n;
toast('+'+n+(S.lang==='ru'?' янтаря':' amber'));sfx.claim();save();updateHUD();}}
$('#afkClaim').addEventListener('click',()=>{
S.seeds+=afkReward;runSeeds+=afkReward;
if(afkDew>0){S.dew+=afkDew;bump('#dewPill');}
afkReward=0;afkDew=0;close('#afkOverlay');sfx.claim();save();updateHUD();});
$('#reviveBtn').addEventListener('click',()=>{
S.over=false;S.treeHp=treeMaxHp();diedThisWave=false;
enemies.length=0;shots.length=0;roots.length=0;zones.length=0;
S.killed=0;spawned=0;bossActive=false;betweenT=3;spawnT=1.2;
rootT=0;branchCd=2;leafCd=6;branchFx=0;
close('#overOverlay');banner(t('stage')+' '+stageOf(S.wave),t('revived'),false);
sfx.upgrade();leafBurst();
if(S.tutPhase==='play')setTimeout(()=>enterCards(),600);
save();updateHUD();});
const ALL_SAVE_KEYS=['drevo.save.v1','drevo.save.v2','drevo.save.v3','drevo.save.v4','drevo.save.v5','drevo.save.v6','drevo.save.v7','drevo.save.v8','drevo.save.v9'];
function fullReset(){
ALL_SAVE_KEYS.forEach(k=>{try{localStorage.removeItem(k);}catch(e){}});
S.seeds=500;S.dew=0;S.amber=0;S.wave=1;S.killed=0;S.totalKills=0;
S.dmgLvl=0;S.spdLvl=0;S.hpLvl=0;S.radLvl=0;S.ccLvl=0;S.cdLvl=0;
S.muted=false;S.shake=true;S.vol=1;S.lang='ru';
S.lastSeen=Date.now();S.bestWave=1;S.seen=true;S.tipShop=false;S.amberTier=0;
S.abilities={};S.equip=[];S.treeSkins=['oak'];S.treeSkin='oak';S.skill={};
S.muts=[];S.mutWeek=0;S.twinPenalty=false;S.twinUsed=false;S.shieldHp=0;
S.dailyDate=0;S.dailyDone={};S.dailyProg={kills:0,waves:0,spins:0,crits:0,upg:0};
S.waveQ={prog:0,done:false,claimed:false};S.onceDone={};S.chaptersCleared=0;
S.huntKills=0;S.huntDone=0;S.passDone={};S.tutorialDone=false;S.tutPhase='new';S.over=false;
S.speed=1;S.speed4Bought=false;S.musicVol=0;S.speedTutShown=false;S.showFps=false;
S.evoStage=0;S.evoBossActive=false;
S.gfx={particles:'med',use3d:true,shadows:true,glow:true};
S.treeHp=maxHpOf(S);
enemies.length=0;shots.length=0;roots.length=0;zones.length=0;parts.length=0;floats.length=0;
spawned=0;bossActive=false;evoBossAlive=false;betweenT=2.4;spawnT=1.4;waveT=0;diedThisWave=false;
runKills=0;runSeeds=0;dispSeeds=S.seeds;lastStr='';buyMul=1;cardMul=1;tutStep='tab';questsAnimating=false;
syncMulRowUI();
const cmr=$('#cardMulRow');if(cmr)cmr.querySelectorAll('.mul-btn').forEach(x=>x.classList.toggle('on',x.dataset.cmul==='1'));
refreshTutUI();updateTutHighlights();applyTreeSkin();updateEvoBtn();save();updateHUD();toast('Прогресс сброшен');}
$('#resetBtn').addEventListener('click',()=>{if(confirm(t('resetConfirm'))){fullReset();}});
$('#muteBtn').addEventListener('click',()=>{S.muted=!S.muted;$('#muteBtn').classList.toggle('off',S.muted);save();});
$('#muteBtn').classList.toggle('off',S.muted);
const CHEAT={god:false};
window.DEBUG={
allCurrencies(){S.seeds=1e15;S.dew=1e15;S.amber=1e15;updateHUD();save();},
skipTutorial(){S.tutPhase='done';S.tutorialDone=true;S.abilities.seedshot=Math.max(1,S.abilities.seedshot||0);refreshTutUI();updateTutHighlights();updateNav();save();
if(S.mutWeek!==weekKey())openMutChoice();},
radius(){showRadiusCheat=!showRadiusCheat;toast('Радиус: '+(showRadiusCheat?'ON':'OFF'));const b=document.querySelector('#dbgRad');if(b)b.classList.toggle('on',showRadiusCheat);},
mut(){openMutChoice();},
rich(){S.seeds+=1e6;S.dew+=200;S.amber+=100;updateHUD();save();},
seeds(n){S.seeds+=n;updateHUD();save();},
dew(n){S.dew+=n;bump('#dewPill');updateHUD();save();},
amber(n){S.amber+=n;updateHUD();save();},
upg(n){['dmgLvl','spdLvl','hpLvl','radLvl','ccLvl','cdLvl'].forEach(k=>S[k]+=n);S.treeHp=treeMaxHp();checkAmber();updateHUD();save();},
give(k,l){S.abilities[k]=(S.abilities[k]||0)+(l||1);if(!ABIL_BY_K[k].base&&!S.equip.includes(k)&&S.equip.length<slotCap())S.equip.push(k);updateHUD();save();},
all(){ABIL.forEach(a=>window.DEBUG.give(a.k,3));},
skills(){SKDEF.forEach(n=>S.skill[n.k]=1);S.treeHp=treeMaxHp();updateHUD();save();},
skins(){S.treeSkins=Object.keys(TREE_SKINS);updateHUD();save();},
wave(n){S.wave=Math.max(1,S.wave+n);S.bestWave=Math.max(S.bestWave,S.wave);S.killed=0;spawned=0;bossActive=false;betweenT=1.5;banner(t('stage')+' '+stageOf(S.wave),'debug',false);updateHUD();save();},
chap(n){const add=n*7;S.wave=Math.max(1,S.wave+add);S.bestWave=Math.max(S.bestWave,S.wave);S.killed=0;spawned=0;bossActive=false;betweenT=1.5;S.chaptersCleared=Math.max(S.chaptersCleared,chapterOf(S.wave));banner(t('stage')+' '+stageOf(S.wave),'debug',false);updateHUD();save();},
waveSkip(){const n=parseInt(document.getElementById('dbgSkipW').value)||0;window.DEBUG.wave(n);},
chapSkip(){const n=parseInt(document.getElementById('dbgSkipC').value)||0;window.DEBUG.chap(n);},
tut(){if(S.tutPhase==='done'||S.tutPhase==='cards')S.tutPhase='new';else S.tutPhase='done';refreshTutUI();updateTutHighlights();updateNav();save();},
spawn(tt){spawn(tt||'boss');},
evoBoss(){startEvolution();},
clear(){enemies.length=0;shots.length=0;roots.length=0;zones.length=0;},
god(){CHEAT.god=!CHEAT.god;toast('GOD: '+(CHEAT.god?'ON':'OFF'));const b=document.querySelector('#dbgGod');if(b)b.classList.toggle('on',CHEAT.god);return CHEAT.god;},
wipe(){fullReset();}};
setInterval(()=>{if(CHEAT.god&&!S.over)S.treeHp=treeMaxHp();},250);
const dbg=document.createElement('div');dbg.id='dbg';
dbg.innerHTML=
'<b>ЧИТЫ <span id="dbgX">✕</span></b>'+
'<button data-c="DEBUG.allCurrencies()">+1Qa всех валют</button>'+
'<button data-c="DEBUG.skipTutorial()">Пропустить обучение</button>'+
'<button id="dbgRad" data-c="DEBUG.radius()">Подсветка радиуса</button>'+
'<button data-c="DEBUG.mut()">Открыть мутации</button>'+
'<button data-c="DEBUG.rich()">+1M / dew / amber</button>'+
'<button data-c="DEBUG.upg(100)">all upgrades +100</button>'+
'<button data-c="DEBUG.skills()">all skill leaves</button>'+
'<button data-c="DEBUG.give(\'seedshot\',3)">+ seed shot</button>'+
'<button data-c="DEBUG.all()">all abilities +3</button>'+
'<button data-c="DEBUG.skins()">all looks</button>'+
'<button data-c="DEBUG.tut()">toggle tutorial</button>'+
'<div class="skip-row"><input id="dbgSkipW" type="number" value="10" min="1"><button data-c="DEBUG.waveSkip()">+волн</button></div>'+
'<div class="skip-row"><input id="dbgSkipC" type="number" value="5" min="1"><button data-c="DEBUG.chapSkip()">+глав</button></div>'+
'<button data-c="DEBUG.spawn(\'boss\')">spawn boss</button>'+
'<button data-c="DEBUG.evoBoss()">evolution boss</button>'+
'<button data-c="DEBUG.clear()">clear field</button>'+
'<button id="dbgGod" data-c="DEBUG.god()">god mode</button>'+
'<button data-c="DEBUG.wipe()" style="border-color:rgba(224,86,79,.5);color:#e8a49b">⚠ HARD WIPE</button>';
document.body.appendChild(dbg);
dbg.addEventListener('click',e=>{if(e.target.id==='dbgX'){dbg.classList.remove('open');return;}
const b=e.target.closest('[data-c]');if(b){try{eval(b.dataset.c);}catch(err){console.error(err);}}});
/* ── СЕКРЕТНЫЙ ВХОД В ЧИТЫ: код из пилюль (НЕ сохраняется, сбрасывается при перезаходе) ── */
let cheatUnlocked=false;
const CHEAT_SEQ=['seedPill','dewPill','seedPill','dewPill','mutPill'];
let cheatSeqI=0,cheatSeqT=0;
function unlockCheats(){
if(cheatUnlocked)return;
cheatUnlocked=true;
const f=$('#cheatFab');if(f)f.classList.add('show');
sfx.claim();
setTimeout(()=>toast('🐞 '+(S.lang==='ru'?'читы разблокированы (до перезахода)':'cheats unlocked (until reload)')),600);}
function cheatTap(id){
const now=performance.now();
if(now-cheatSeqT>1200)cheatSeqI=0;   /* пауза между тапами > 1.2 c — сброс */
cheatSeqT=now;
if(id===CHEAT_SEQ[cheatSeqI])cheatSeqI++;
else cheatSeqI=(id===CHEAT_SEQ[0])?1:0;
if(cheatSeqI>=CHEAT_SEQ.length){cheatSeqI=0;unlockCheats();}}
['seedPill','dewPill','mutPill'].forEach(id=>{
const p=document.getElementById(id);
if(p)p.addEventListener('pointerdown',()=>cheatTap(id),{passive:true});});
$('#cheatFab').addEventListener('click',()=>{if(cheatUnlocked)dbg.classList.toggle('open');});
document.addEventListener('keydown',e=>{
if(e.ctrlKey&&e.shiftKey&&(e.code==='KeyD'||e.key==='D'||e.key==='d')){e.preventDefault();unlockCheats();}});
