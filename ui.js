'use strict';
const vigEl=$('#vignette');let vigT=0;
function vig(){vigEl.style.opacity=.65;clearTimeout(vigT);vigT=setTimeout(()=>vigEl.style.opacity=0,900);}
function banner(title,sub,cls){const b=$('#waveBanner');
$('#bannerTitle').textContent=title;$('#bannerSub').textContent=sub;
b.className='';if(cls&&cls!==true)b.classList.add(cls);b.classList.remove('show');void b.offsetWidth;b.classList.add('show');}
let toastT=0;function toast(msg){const tt=$('#toast');tt.textContent=msg;tt.classList.add('show');
clearTimeout(toastT);toastT=setTimeout(()=>tt.classList.remove('show'),4500);}
const open=s=>{const e=$(s);if(e)e.classList.add('open');};
const close=s=>{const e=$(s);if(e)e.classList.remove('open');};
const SHEETS=['#upgOverlay','#rouletteOverlay','#skillTreeOverlay','#abilitiesOverlay','#questsOverlay','#passOverlay','#shopOverlay','#setOverlay'];
function closeSheet(sel){
if(sel==='#rouletteOverlay'){
spinToken++;
if(S.tutPhase==='cards'){updateCardMulLock();close(sel);return;}
autoClaimCards();
updateCardMulLock();
}
close(sel);
}
function closeAllSheets(){SHEETS.forEach(s=>closeSheet(s));}
function anySheetOpen(){return SHEETS.some(s=>$(s).classList.contains('open'));}
function allowedSheets(){
const p=S.tutPhase;
if(p==='new')return['#setOverlay'];
if(p==='boost'||p==='play')return['#upgOverlay','#setOverlay'];
if(p==='cards')return['#rouletteOverlay','#setOverlay'];
if(p==='powers')return['#abilitiesOverlay','#setOverlay'];
return SHEETS.slice();}
const SUBS={ru:['тьма сгущается…','лес шепчет…','они всё ближе…','стойте до конца…','корни помнят…'],
en:['darkness thickens…','the forest whispers…','they draw near…','hold to the end…','roots remember…']};
function bump(id){const p=$(id);if(!p)return;p.classList.remove('bump');void p.offsetWidth;p.classList.add('bump');}
function anyOverlayOpen(){return document.querySelector('.overlay.open')!=null;}
function nearestEnemy(x,y,maxd){let best=null,bd=maxd?maxd*maxd:1e18;const xx=x||0,yy=y||0;
for(const e of enemies){if(e.dead)continue;const dx=e.x-xx,dy=e.y-yy;const d=dx*dx+dy*dy;if(d<bd){bd=d;best=e;}}
return best;}
function nearestInReach(){let best=null,bd=1e18;
for(const e of enemies){if(e.dead||!inReach(e))continue;const d=e.x*e.x+e.y*e.y;if(d<bd){bd=d;best=e;}}
return best;}
/* ── МУТАЦИИ: UI ── */
function ensureMutUI(){
if(!$('#mutPill')){
const hg=document.querySelectorAll('.hud-group')[1];
if(hg){const p=document.createElement('div');p.className='pill';p.id='mutPill';p.title='Мутации';
p.innerHTML='<svg viewBox="0 0 16 16"><path d="M8 1C5 3 3 5 3 8c0 3 2 5 5 7 3-2 5-4 5-7 0-3-2-5-5-7Z" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="8" cy="8" r="1.6" fill="currentColor"/></svg><b id="mutNum">0</b>';
hg.insertBefore(p,hg.firstChild);}}
if(!$('#mutOverlay')){
const ov=document.createElement('div');ov.className='overlay';ov.id='mutOverlay';
ov.innerHTML='<div class="modal mut"><div class="m-ico">🦠</div><h2 id="mutTitle">Заражение недели</h2><p class="afk-sub" id="mutSub">Древо мутирует. Выбери одну инфекцию: бонус + побочный эффект.</p><div class="mut-list" id="mutList"></div></div>';
document.body.appendChild(ov);}
const mp=$('#mutPill');
if(mp&&!mp._bind){mp._bind=1;
mp.addEventListener('click',()=>{
 const owned=(S.muts||[]).map(id=>MUTS.find(m=>m.id===id)).filter(Boolean);
 let txt=owned.map(m=>'🦠 '+LN(m.n)).join(' · ');
 if(S.mutDeal){
  const b=DEAL_BUFFS.find(x=>x.id===S.mutDeal.buff);
  const d=DEAL_DEBUFFS.find(x=>x.id===S.mutDeal.debuff);
  if(b)txt+=' · ▲'+LN(b.txt);
  if(d)txt+=' · ▼'+LN(d.txt);}
toast(txt||'—');});}
}
function openMutChoice(){
 ensureMutUI();
 const r=rng(weekKey()*7919+13);
 const pool=MUTS.filter(m=>!(S.muts||[]).includes(m.id));
 const picks=[];for(let i=0;i<3&&pool.length;i++)
  picks.push(pool.splice(Math.floor(r()*pool.length),1)[0]);
 if(!picks.length)return;
 const list=$('#mutList');
 list.innerHTML=picks.map(m=>{
  const rareTag=m.rare?'<span style="color:#f0a848;font-size:9px;margin-left:4px">РЕДКАЯ</span>':'';
  return `<div class="mut-card" data-mut="${m.id}">
  <div class="mut-nm">🦠 ${LN(m.n)}${rareTag}</div>
  <div class="mut-cat">${m.cat}</div>
  <div class="mut-line up"><span class="arr">▲</span>${LN(m.up)}</div>
  <div class="mut-line down"><span class="arr">▼</span>${LN(m.down)}</div></div>`;}).join('');
 list.onclick=e=>{
  const c=e.target.closest('[data-mut]');if(!c)return;
  const mid=c.dataset.mut;
  if(mid==='m_deal'){openDealChoice('m_deal');return;}
  if(mid==='m_rdeal'){openDealChoice('m_rdeal');return;}
  applyMutation(mid);};
 open('#mutOverlay');}

function applyMutation(mid){
 S.muts=S.muts||[];S.muts.push(mid);S.mutWeek=weekKey();
 S.treeHp=Math.min(S.treeHp,treeMaxHp());
 close('#mutOverlay');close('#dealOverlay');sfx.mut();
 toast('🦠 '+LN(MUTS.find(m=>m.id===mid).n));
 save();updateHUD();}

/* ═══ Сделки 14/15: вторичный выбор ═══ */
function openDealChoice(dealType){
 ensureDealOverlay();
 const r=rng(weekKey()*3571+7);
 const box=$('#dealList');
 $('#dealTitle').textContent=dealType==='m_deal'
  ?(S.lang==='ru'?'Выбери баф':'Pick a buff')
  :(S.lang==='ru'?'Выбери дебаф':'Pick a debuff');
 $('#dealSub').textContent=dealType==='m_deal'
  ?(S.lang==='ru'?'Дебаф будет случайным (тяжёлым)':'Debuff will be random (heavy)')
  :(S.lang==='ru'?'Баф будет случайным':'Buff will be random');

 const pool=dealType==='m_deal'?DEAL_BUFFS:DEAL_DEBUFFS;
 const picks=[];const tmp=[...pool];
 for(let i=0;i<3&&tmp.length;i++)
  picks.push(tmp.splice(Math.floor(r()*tmp.length),1)[0]);

 box.innerHTML=picks.map(d=>`<div class="mut-card" data-deal="${d.id}">
  <div class="mut-nm">${dealType==='m_deal'?'▲':'▼'} ${LN(d.txt)}</div></div>`).join('');
 box.onclick=e=>{
  const c=e.target.closest('[data-deal]');if(!c)return;
  const chosen=c.dataset.deal;
  if(dealType==='m_deal'){
   const debuff=DEAL_DEBUFFS[Math.floor(Math.random()*DEAL_DEBUFFS.length)];
   S.mutDeal={buff:chosen,debuff:debuff.id};
  }else{
   const buff=DEAL_BUFFS[Math.floor(Math.random()*DEAL_BUFFS.length)];
   S.mutDeal={buff:buff.id,debuff:chosen};
  }
  applyMutation(dealType);};
 close('#mutOverlay');open('#dealOverlay');}

function ensureDealOverlay(){
 if($('#dealOverlay'))return;
 const ov=document.createElement('div');ov.className='overlay';ov.id='dealOverlay';
 ov.innerHTML=`<div class="modal mut">
  <div class="m-ico"><svg viewBox="0 0 16 16"><path d="M8 1C5 3 3 5 3 8c0 3 2 5 5 7 3-2 5-4 5-7 0-3-2-5-5-7Z" stroke="currentColor" stroke-width="1.4" fill="none"/><circle cx="8" cy="8" r="1.6" fill="currentColor"/></svg></div>
  <h2 id="dealTitle"></h2>
  <p class="afk-sub" id="dealSub"></p>
  <div class="mut-list" id="dealList"></div></div>`;
 document.body.appendChild(ov);}
const el={wave:$('#waveNum'),seeds:$('#seedNum'),dew:$('#dewNum'),
prog:$('#wprog i'),ud:$('#upgDmg'),us:$('#upgSpd'),ur:$('#upgRad'),uc:$('#upgCc'),ux:$('#upgCd'),uh:$('#upgHp')};
const UPG_STAT={dmg:()=>fmtS(coreDmg()),spd:()=>rootAspd().toFixed(1)+'/с',rad:()=>Math.round(rootReach()),
cc:()=>Math.round(critChance()*100)+'%',cd:()=>'×'+critMult().toFixed(1),hp:()=>fmt(treeMaxHp())};
function setUpg(btn,k){
const cur=S[k+'Lvl']||0;
let n=buyMul==='max'?maxAfford(k).n:buyMul;
if(cur+n>CONFIG.UPG.LVL_CAP)n=CONFIG.UPG.LVL_CAP-cur;
const c=n>0?costRange(k,cur,n):costOne(k,cur);
btn.querySelector('.upg-stat').textContent=UPG_STAT[k]();
btn.querySelector('.upg-lvlbig').textContent='Ур. '+cur+(n>1?' (+'+n+')':'');
const cb=btn.querySelector('.upg-cost b');cb.textContent=n>0?fmt(c):'—';
const locked=S.tutPhase==='boost'&&k!=='dmg'&&S.dmgLvl<10;
const ok=n>0&&S.seeds>=c&&!S.over&&!locked;btn.disabled=!ok;btn.classList.toggle('afford',ok);}
function upgAffordCount(){let n=0;for(const k in CONFIG.UPG.base){if(costOne(k,S[k+'Lvl']||0)<=S.seeds)n++;}return n;}
function passHasClaim(){const ch=S.chaptersCleared;
return passMilestones().some(m=>m<=ch&&!S.passDone[m]);}
function updateNav(){
const allowed=allowedSheets();
const lock=(sel,sheet)=>$(sel).classList.toggle('locked',!allowed.includes(sheet));
lock('#navUpg','#upgOverlay');lock('#navRoulette','#rouletteOverlay');lock('#navTree','#skillTreeOverlay');
lock('#navAbilities','#abilitiesOverlay');lock('#navQuests','#questsOverlay');lock('#shopBtn','#shopOverlay');
toggleDot('#navUpg',allowed.includes('#upgOverlay')&&upgAffordCount()>0);
toggleDot('#navRoulette',allowed.includes('#rouletteOverlay')&&S.dew>=CONFIG.SPIN_COST);
let treeGlow=false;
if(allowed.includes('#skillTreeOverlay'))for(const n of SKDEF){if(sk(n.k)<1&&nodeUnlocked(n)&&S.dew>=skCost(n)){treeGlow=true;break;}}
toggleDot('#navTree',treeGlow);
const cap=slotCap();
const abGlow=allowed.includes('#abilitiesOverlay')&&S.equip.length<cap&&ABIL.some(a=>!a.base&&(S.abilities[a.k]||0)>0&&!S.equip.includes(a.k));
toggleDot('#navAbilities',abGlow);
let abb=$('#navAbilities').querySelector('.tp-badge');
if(S.equip.length>0){if(!abb){abb=document.createElement('span');abb.className='tp-badge';abb.style.background='var(--violet)';$('#navAbilities').appendChild(abb);}abb.textContent=S.equip.length;}
else if(abb)abb.remove();
let qGlow=dailyList().some(q=>q.done&&!q.claimed);
if(!qGlow)qGlow=onceList().some(q=>q.done&&!q.claimed);
if(!qGlow&&(S.huntKills||0)>=HUNT_GOAL)qGlow=true;
toggleDot('#navQuests',allowed.includes('#questsOverlay')&&qGlow);
$('#passBtn').classList.toggle('has',passHasClaim());
updateEvoBtn();}
function toggleDot(sel,on){const elc=$(sel);let d=elc.querySelector('.tp-dot');
if(on){if(!d){d=document.createElement('span');d.className='tp-dot';elc.appendChild(d);}}
else if(d)d.remove();}
function updateHUD(){
el.wave.textContent=stageOf(S.wave);
el.dew.textContent=fmt(S.dew);
el.prog.style.width=clamp(100*S.killed/waveQuota(S.wave),0,100)+'%';
if(!evoBossAlive){$('#waveLab').textContent=bossActive?t('boss'):t('stage');
$('#wavePill').classList.toggle('boss-phase',bossActive);}
setUpg(el.ud,'dmg');setUpg(el.us,'spd');setUpg(el.ur,'rad');
setUpg(el.uc,'cc');setUpg(el.ux,'cd');setUpg(el.uh,'hp');
const mn=$('#mutNum');if(mn)mn.textContent=(S.muts||[]).length;
updateNav();
refreshOpenSheets();}
function refreshOpenSheets(){
if($('#questsOverlay').classList.contains('open')&&!questsAnimating)renderQuests();
if($('#passOverlay').classList.contains('open'))renderPass();
if($('#shopOverlay').classList.contains('open'))renderSkins();
if($('#skillTreeOverlay').classList.contains('open'))renderSkillTree();
if($('#abilitiesOverlay').classList.contains('open'))renderAbilities();
if($('#rouletteOverlay').classList.contains('open'))updateSpinBtn();}
/* ── БОЕВОЙ ПРОПУСК: вехи за главы, всегда рендерится, try/catch + fallback ── */
function renderPass(){
const box=$('#passContent');if(!box)return;
const ch=S.chaptersCleared||0;
const all=passMilestones();
const done=all.filter(x=>x<=ch);
const next=all.filter(x=>x>ch).slice(0,12);
const dewSvg='<svg viewBox="0 0 16 16"><path d="M8 1.5C8 1.5 3.5 6.5 3.5 9.8a4.5 4.5 0 0 0 9 0C12.5 6.5 8 1.5 8 1.5Z" fill="#7cc9e8"/></svg>';
const row=m=>{
const claimed=!!S.passDone[m];
const can=m<=ch&&!claimed;
const rew=passReward(m);
const right=claimed?'<span class="q-claimed">'+t('qDone')+'</span>'
:can?'<button class="q-claim" data-pass="'+m+'"><span class="q-rew">'+dewSvg+rew+'</span></button>'
:'<span class="q-rew inactive">'+dewSvg+rew+'</span>';
return '<div class="qrow '+(can?'done':'')+'">'
+'<span class="q-ico"><svg viewBox="0 0 16 16"><path d="M3 14V2h8l-2 2.5L11 7H3" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/></svg></span>'
+'<span class="q-body"><span class="q-txt">'+t('chap')+' '+m+'</span>'
+'<span class="q-bar"><i style="width:'+clamp(100*ch/m,0,100)+'%"></i></span>'
+'<span class="q-prog">'+Math.min(ch,m)+'/'+m+'</span></span>'+right+'</div>';
};
let html='<div class="q-sec"><h3>'+t('passHead')+' · '+t('chap')+' '+ch+'</h3>';
html+=done.map(row).join('')+next.map(row).join('')+'</div>';
box.innerHTML=html;
}
function claimPass(m){const ch=S.chaptersCleared;
if(m>ch||S.passDone[m])return;
S.passDone[m]=1;S.dew+=passReward(m);
bump('#dewPill');sfx.claim();save();updateHUD();renderPass();}
$('#passContent').addEventListener('click',e=>{const b=e.target.closest('[data-pass]');
if(b)claimPass(+b.dataset.pass);});
$('#passBtn').addEventListener('click',()=>{
const was=$('#passOverlay').classList.contains('open');
closeAllSheets();
if(!was){open('#passOverlay');renderPass();}});