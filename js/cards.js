'use strict';
/* ── КАРТЫ ── */
let cards=[],cardPhase='idle',pickedCount=0,cardTimer=null,spinToken=0,cardMul=1;
function cardEl(id){return $('#cardsStage').querySelector(`[data-id="${id}"]`);}
function pickAbility(){
const stage=tierStage();const weights=CONFIG.TIER_WEIGHTS[stage-1];
let tot=0;for(const tk in weights)tot+=weights[tk];
let r=Math.random()*tot,tier='common';
for(const tk in weights){if(r<weights[tk]){tier=tk;break;}r-=weights[tk];}
const list=ABIL.filter(a=>a.tier===tier&&!a.base);
return list[Math.floor(Math.random()*list.length)];}
function stageW(){return($('#cardsStage').clientWidth||340);}
function finalPos(slot){const row=slot<5?0:1;const col=row?slot-5:slot;const cnt=row?4:5;
const off=col-(cnt-1)/2;const sp=clamp((stageW()-74)/(cnt-1||1),24,52);
return{x:off*sp,y:row?64:-64,rot:off*3,scale:1};}
function pilePos(i){return{x:(i-4)*11,y:0,rot:(i-4)*1.2,scale:1};}
function posTF(pos,lifted,flipped){
const y=pos.y+(lifted?-44:0);const sc=lifted?1.15:pos.scale;
return `translate(-50%,-50%) translate(${pos.x}px,${y}px) rotate(${pos.rot}deg) scale(${sc})`+(flipped?' rotateY(180deg)':'');}
function setCard(c,pos,lifted,z,flipped){
c.cur={x:pos.x,y:pos.y,rot:pos.rot||0,rotY:flipped?180:0,sc:pos.sc!=null?pos.sc:(pos.scale!=null?pos.scale:1),z:z!=null?z:1};
const elc=cardEl(c.id);
if(!elc)return;
elc.style.transform=posTF(pos,lifted,flipped);
if(z!=null)elc.style.zIndex=z;}
function refreshCardFaces(){const st=$('#cardsStage');st.querySelectorAll('.rcard').forEach(elc=>{const c=cards.find(x=>x.id==+elc.dataset.id);if(c){const pl=elc.querySelector('.plus');if(pl)pl.textContent='+'+(c.plus*cardMul);}});}
function renderCards(){
const st=$('#cardsStage');
if(st.children.length!==cards.length){
st.innerHTML=cards.map(c=>{const tr=TIERS[c.a.tier];
return `<div class="rcard t-${c.a.tier}" data-id="${c.id}">
<div class="face"><span class="nm">${LN(c.a.n)}</span><span class="plus">+${c.plus*cardMul}</span><span class="ti">${LN(tr.name)}</span></div>
<div class="back"></div></div>`;}).join('');
st.querySelectorAll('.rcard').forEach(elc=>{elc.addEventListener('click',()=>onCardClick(+elc.dataset.id));});}
const drive=cardPhase==='gather'||cardPhase==='shuffle';
cards.forEach(c=>{const elc=cardEl(c.id);if(!elc)return;
elc.classList.toggle('pickable',cardPhase==='pick'&&!c.picked);
elc.classList.toggle('picked',!!c.revealed);
elc.classList.toggle('dim',cardPhase==='done'&&!c.revealed);
if(!drive){
if(cardPhase==='memorize')setCard(c,finalPos(c.slot),false,c.id,false)
else if(cardPhase==='pick')setCard(c,finalPos(c.slot),false,null,!c.revealed)
else if(cardPhase==='done')setCard(c,finalPos(c.slot),false,null,c.revealed?true:false);}});}
function onCardClick(id){
if(cardPhase!=='pick')return;
const c=cards.find(x=>x.id===id);if(!c||c.picked)return;
c.picked=true;c.revealed=true;pickedCount++;
sfx.flip();renderCards();
if(pickedCount>=3){
cardPhase='done';
cards.forEach(c=>{if(!c.picked){const elc=cardEl(c.id);if(elc)elc.classList.add('fly-up');}});
setTimeout(()=>{$('#spinBtn').style.display='none';$('#claimBtn').style.display='flex';updateSpinBtn();updateCardMulLock();},350);}}
function claimCards(){
const r=cards.filter(x=>x.revealed);
r.forEach(c=>{const elc=cardEl(c.id);if(elc)elc.classList.add('fly-down');});
$('#claimBtn').style.display='none';
setTimeout(()=>{
let bestTier='common';
r.forEach(c=>{const a=c.a,k=a.k,gain=c.plus*cardMul,tier=a.tier;
const isNew=!S.abilities[k];
S.abilities[k]=(S.abilities[k]||0)+gain;
if(!a.base&&isNew&&S.equip.length<slotCap()){S.equip.push(k);setTimeout(()=>toast(LN(a.n)+t('newAbil')),700);}
if(TIERS[tier].idx>TIERS[bestTier].idx)bestTier=tier;});
if(bestTier==='legendary'||bestTier==='mythic'){
const pn=$('#rouletteOverlay').querySelector('.panel');pn.classList.add('shake-lg');setTimeout(()=>pn.classList.remove('shake-lg'),600);}
sfx.reveal(bestTier);bump('#dewPill');
const wasTut=S.tutPhase==='cards';
save();updateHUD();renderAbilities();
cardPhase='idle';
updateCardMulLock();
if(wasTut)enterPowers();
genCards();},420);}
function autoClaimCards(){
if(cardPhase==='idle')return;
if(cardPhase==='pick'||cardPhase==='done'){
if(cards.some(c=>c.revealed))claimCards();
else{cardPhase='idle';genCards();}
}else{cardPhase='idle';genCards();}}
function genCards(){
const tut=S.tutPhase==='cards';
const plus=tut?[1,1,1,1,1,1,1,1,1]:[1,1,1,1,1,1,3,3,5];
const ms=ABIL_BY_K['seedshot'];
cards=plus.map((p,i)=>{const fp=finalPos(i);return{id:i,a:tut?ms:pickAbility(),plus:p,slot:i,pile:i,picked:false,revealed:false,
cur:{x:fp.x,y:fp.y,rot:fp.rot||0,rotY:0,sc:fp.scale!=null?fp.scale:1,z:i+1}};});
cardPhase='memorize';pickedCount=0;
$('#cardsStage').innerHTML='';$('#claimBtn').style.display='none';$('#spinBtn').style.display='flex';
$('#cardsStage').classList.remove('shuffling');
renderCards();updateSpinBtn();updateCardMulLock();}
function updateCardClasses() {
const st = $('#cardsStage');
st.querySelectorAll('.rcard').forEach(el => {
const id = +el.dataset.id;
const c = cards.find(x => x.id === id);
if (!c) return;
el.classList.toggle('pickable', cardPhase === 'pick' && !c.picked);
el.classList.toggle('picked', !!c.revealed);
el.classList.toggle('dim', cardPhase === 'done' && !c.revealed);
});
}
function startSpin(){
const free=S.tutPhase==='cards';if(cardPhase!=='memorize')return;
if(!free&&S.dew<CONFIG.SPIN_COST*cardMul)return;
if(!free)S.dew-=CONFIG.SPIN_COST*cardMul;
if(S.dailyProg)S.dailyProg.spins=(S.dailyProg.spins||0)+1;
save();updateHUD();
const myToken=++spinToken;cardPhase='gather';
updateCardMulLock();
$('#cardsStage').classList.add('no-trans');
sfx.flip();
const r=Math.random();
const run=cb=>{if(r<0.35)shuffleDomino(myToken,cb);
else if(r<0.65)shuffleAccordion(myToken,cb);
else if(r<0.85)shuffleCascade(myToken,null,cb);
else shufflePendulum(myToken,null,cb);};
run(()=>{if(spinToken!==myToken)return;
cards.forEach(c=>{c.slot=c.pile;});
$('#cardsStage').classList.remove('no-trans');
cardPhase='pick';
updateCardMulLock();updateCardClasses();updateSpinBtn();});
}
function updateSpinBtn(){
const sb=$('#spinBtn');const free=S.tutPhase==='cards';
const cost=free?0:CONFIG.SPIN_COST*cardMul;
const can=cardPhase==='memorize'&&(free||S.dew>=cost);
sb.disabled=!can;sb.classList.toggle('can',can);
sb.innerHTML=free?(S.lang==='ru'?'Перемешать · бесплатно':'Shuffle · free'):(S.lang==='ru'?'Перемешать · ':'Shuffle · ')+'<svg viewBox="0 0 16 16"><path d="M8 1.5C8 1.5 3.5 6.5 3.5 9.8a4.5 4.5 0 0 0 9 0C12.5 6.5 8 1.5 8 1.5Z" fill="#0a5a6e"/></svg> '+fmt(cost);}
let abilTip=null,lpTimer=null,lpFired=false;
/* множители карт: заблокированы с начала тасовки ДО забора карт */
function updateCardMulLock(){
const locked=['gather','shuffle','pick','done'].includes(cardPhase);
$('#cardMulRow').classList.toggle('locked',locked);}
/* ── ТУЛТИПЫ-ОБЛАЧКИ: якорь кешируется ДО таймера, стрелка к карточке ── */
function placeTip(tip,rect){
document.body.appendChild(tip);
const thh=tip.offsetHeight,tw=tip.offsetWidth;
const above=(rect.top-thh-12)>6;
tip.classList.remove('above','below');
tip.classList.add(above?'above':'below');
const top=above?rect.top-thh-10:rect.bottom+10;
const left=clamp(rect.left+rect.width/2-tw/2,8,Math.max(8,innerWidth-tw-8));
const ax=clamp(rect.left+rect.width/2-left,14,tw-14);
tip.style.setProperty('--ax',ax+'px');
tip.style.left=left+'px';tip.style.top=Math.max(6,top)+'px';}
function showAbilTip(rect,a,l){hideAbilTip();
const isBase=a.base&&!(a.k==='seedshot'&&!isExSeed());
const pct=isBase?100:(l?Math.round(CONFIG.ABIL_BASE[a.tier]*(1+0.10*(l-1))):0);
const cdv=isBase?null:abilCd(a.k,l);
abilTip=document.createElement('div');abilTip.className='abil-tip';
abilTip.innerHTML=`<b>${LN(a.n)}</b><br>${LN(a.desc)}<br><em>${isBase?'EX · 100%':(l?pct+'%'+(cdv?' · '+cdv.toFixed(1)+(S.lang==='ru'?'с':'s'):''):'—')}</em>`;
placeTip(abilTip,rect);}
function hideAbilTip(){if(abilTip){abilTip.remove();abilTip=null;}}
function renderAbilities(){
try{
const cap=slotCap();
$('#abCount').textContent=S.equip.length+'/'+cap;
const baseAbils=ABIL.filter(a=>a.base);
const normAbils=ABIL.filter(a=>!a.base);

const abilRow=(a)=>{
const l=S.abilities[a.k]||0;
const isBase=a.base;
const seedOwn=isExSeed();
const seedPre=isBase&&a.k==='seedshot'&&!seedOwn;
const ex=isBase&&!seedPre&&(a.ex||seedOwn||a.k==='rootstrike');
const eq=isBase ? !seedPre : S.equip.includes(a.k);
const tr=TIERS[a.tier];
const pct=isBase?100:(l?Math.round(CONFIG.ABIL_BASE[a.tier]*(1+0.10*(l-1))):0);
const cdv=isBase?null:abilCd(a.k,l);
const cdTxt=cdv?(' · '+cdv.toFixed(1)+(S.lang==='ru'?'с':'s')):'';

let cls, badge, lvlTxt;
if(ex){
cls='ex';
badge='EX';
lvlTxt='EX · 100%';
}else if(seedPre){
cls='locked';
badge='＋';
lvlTxt=t('notSel');
}else if(l){
cls=eq?'eq':'';
badge=eq?'✓':'＋';
const langPref=S.lang==='ru'?"ур. ":"lv ";
lvlTxt=langPref+l+' · '+pct+'%'+cdTxt;
}else{
cls='locked';
badge='';
lvlTxt=S.lang==='ru'?'не найдена':'not found';
}

return `<div class="abil t-${a.tier} ${cls}" data-abil="${a.k}">
<span class="abil-ico">${a.svg}</span>
<span class="abil-body"><b>${LN(a.n)}</b><i style="color:${ex?'var(--gold2)':tr.c}">${ex?'EX':LN(tr.name)}</i>
<span class="abil-lvl">${lvlTxt}</span></span>
<span class="abil-eq ${ex?'exb':''}">${badge}</span></div>`;
};

$('#abilContent').innerHTML=
`<div class="ab-group">Базовые</div><div class="abil-grid">${baseAbils.map(abilRow).join('')}</div>
<div class="ab-group">Способности</div><div class="abil-grid">${normAbils.map(abilRow).join('')}</div>`;
}catch(e){console.error('renderAbilities',e);}
}
$('#abilContent').addEventListener('pointerdown',e=>{
const c=e.target.closest('[data-abil]');if(!c)return;
const rect=c.getBoundingClientRect();
lpFired=false;clearTimeout(lpTimer);
lpTimer=setTimeout(()=>{lpFired=true;const a=ABIL_BY_K[c.dataset.abil];showAbilTip(rect,a,S.abilities[a.k]||0);},380);});
['pointerup','pointerleave','pointercancel'].forEach(ev=>$('#abilContent').addEventListener(ev,()=>{clearTimeout(lpTimer);hideAbilTip();}));
$('#abilContent').addEventListener('click',e=>{
if(lpFired){lpFired=false;return;}
const c=e.target.closest('[data-abil]');if(!c)return;const k=c.dataset.abil;
const a=ABIL_BY_K[k];
if(a.base){
if(k==='rootstrike')return;
if(isExSeed())return;
if(S.tutPhase==='powers'){finishTutorial();renderAbilities();}
else toast(t('selInTut'));
return;}
if(!S.abilities[k]){toast(t('fromRoulette'));return;}
if(S.equip.includes(k))S.equip=S.equip.filter(x=>x!==k);
else if(S.equip.length<slotCap())S.equip.push(k);
else{toast(t('maxEquip'));return;}
sfx.tick();save();renderAbilities();updateHUD();applyTreeSkin();});
