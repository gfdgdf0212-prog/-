'use strict';
/* ── ДРЕВО ПРОКАЧКИ: массивный ствол, скелетные ветви к узлам, корни к узлам ── */
const TREE_GY=810;
function svgPath(svg,d,stroke,w,extra){
const p=document.createElementNS('http://www.w3.org/2000/svg','path');
p.setAttribute('d',d);p.setAttribute('stroke',stroke);p.setAttribute('stroke-width',w);
p.setAttribute('fill','none');p.setAttribute('stroke-linecap','round');
if(extra)for(const k in extra)p.setAttribute(k,extra[k]);
svg.appendChild(p);return p;}
function svgLeaf(svg,x,y,fill,rot,s){
const ml=document.createElementNS('http://www.w3.org/2000/svg','path');
ml.setAttribute('d',`M0,${-s} C${s},${-s*0.3} ${s*0.8},${s*0.6} 0,${s} C${-s*0.8},${s*0.6} ${-s},${-s*0.3} 0,${-s} Z`);
ml.setAttribute('fill',fill);ml.setAttribute('opacity','0.85');
ml.setAttribute('transform',`translate(${x},${y}) rotate(${rot})`);
svg.appendChild(ml);}
function renderSkillTree(){
try{const tree=$('#skillTree');tree.innerHTML='';
const TW=540,TH=1520,GY=TREE_GY;
const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
svg.setAttribute('width',TW);svg.setAttribute('height',TH);
svg.style.cssText='position:absolute;left:0;top:0;pointer-events:none';
/* почва: пятна, камни, червоточинки, трава */
let base=`<rect x="0" y="${GY+3}" width="${TW}" height="${TH-GY-3}" fill="rgba(46,32,18,.45)"/>`;
const sr=rng(4242);
for(let i=0;i<46;i++){const px=sr()*TW,py=GY+10+sr()*(TH-GY-20),r2=2+sr()*7;
base+=`<ellipse cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" rx="${(r2*1.6).toFixed(1)}" ry="${r2.toFixed(1)}" fill="rgba(${sr()<.5?'30,20,10':'70,50,28'},${(0.12+sr()*0.15).toFixed(2)})"/>`;}
for(let i=0;i<14;i++){const px=sr()*TW,py=GY+14+sr()*(TH-GY-30),r2=1.5+sr()*2.5;
base+=`<ellipse cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" rx="${r2.toFixed(1)}" ry="${(r2*.8).toFixed(1)}" fill="rgba(120,100,80,${(0.2+sr()*.2).toFixed(2)})"/>`;}
for(let i=0;i<10;i++){const px=sr()*TW,py=GY+20+sr()*(TH-GY-40);
base+=`<path d="M${px.toFixed(0)},${py.toFixed(0)} q4,3 8,0 q4,-3 8,1" stroke="rgba(20,12,6,.5)" stroke-width="1.2" fill="none"/>`;}
base+=`<rect x="0" y="${GY-3}" width="${TW}" height="5" fill="rgba(126,196,112,.26)"/>`;
for(let gx=4;gx<TW;gx+=7){const hg=5+((gx*7919)%8);const bx=((gx%21)-10)/6;
base+=`<path d="M${gx},${GY-2} q${bx},-${hg} ${bx*1.6},-${hg+4}" stroke="rgba(140,210,120,.4)" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;}
svg.innerHTML=base;
/* корни к узлам rs_* */
SKDEF.forEach((def,i)=>{if(def.k.startsWith('rs_'))addRootNew(svg,def,i);});
/* ствол */
addTrunkNew(svg);
/* скелетные ветви от ствола к узлам ss_* */
SKDEF.forEach((def,i)=>{if(def.k.startsWith('ss_'))addCrownBranch(svg,def,i);});
tree.appendChild(svg);
SKDEF.forEach((def,i)=>{
const l=sk(def.k),mx=1,c=def.base,maxed=l>=mx;
const un=nodeUnlocked(def);const afford=un&&!maxed&&S.dew>=c;
const isRoot=def.k.startsWith('rs_');
const node=document.createElement('div');
node.className='skill-node'+(maxed?' maxed':'')+(afford?' afford':'')+(!un?' locked':'');
node.style.left=(def.x-28)+'px';node.style.top=(def.y-34)+'px';
const rot=isRoot?(((i*29)%13)-6):(((i*47)%25)-12);
node.style.setProperty('--rot',rot+'deg');
const shape=isRoot?
`<svg class="root-bg" viewBox="0 0 56 68" style="transform:rotate(${rot}deg)">
<path class="root-body" d="M28,3 C34,9 33,19 31,30 C30,42 30,52 28,65 C26,52 26,42 25,30 C23,19 22,9 28,3 Z"/>
<path class="root-vein" d="M28,6 L28,60 M27,16 C20,20 15,22 9,24 M29,28 C36,32 41,36 47,40 M27,42 C21,46 17,50 12,54"/>
</svg>`:
`<svg class="leaf-bg" viewBox="0 0 56 68" style="transform:rotate(${rot}deg)">
<path class="leaf-body" d="M28,2 C46,14 52,36 42,52 C36,61 31,65 28,66 C25,65 20,61 14,52 C4,36 10,14 28,2 Z"/>
<path class="leaf-vein" d="M28,8 L28,58 M28,20 L19,28 M28,20 L37,28 M28,34 L20,42 M28,34 L36,42"/></svg>`;
node.innerHTML=shape+`<div class="leaf-content">${def.svg}<span class="lvl">${l}/${mx}</span><span class="cost">${maxed?'✓':fmt(c)}</span></div>`;
node.addEventListener('click',e=>{if(e.detail>1)return;buySkillNode(def);});
node.addEventListener('mouseenter',e=>showTooltip(e,def,l,mx));
node.addEventListener('mouseleave',hideTooltip);
tree.appendChild(node);});
}catch(e){console.error('renderSkillTree',e);}}
/* массивный многослойный ствол с расширением у основания и уходом в корни */
function addTrunkNew(svg){
const x=270,gy=TREE_GY;
const dLow=`M${x},${gy+18} C${x-7},${gy-50} ${x+6},${gy-140} ${x-2},${gy-260}`;
const dUp=`M${x-2},${gy-258} C${x-7},${gy-380} ${x+5},${gy-520} ${x},${gy-690}`;
[['#1c1208',26],['#3a2a16',18],['#5a4226',11],['#7a5c38',6],['#9a7a4c',2.4]].forEach(([c,w])=>svgPath(svg,dLow,c,w));
[['#1c1208',16],['#3a2a16',11],['#5a4226',6.5],['#7a5c38',3.4],['#9a7a4c',1.4]].forEach(([c,w])=>svgPath(svg,dUp,c,w));
[[-64,26],[-36,32],[0,36],[36,32],[64,26]].forEach(([ox,oy])=>{
const dd=`M${x+ox*0.12},${gy+6} Q${x+ox*0.5},${gy+oy*0.55} ${x+ox},${gy+oy}`;
[['#241809',7],['#5a4222',4.5],['#a8834a',2.4],['#e6cd96',1.1]].forEach(([c,w])=>svgPath(svg,dd,c,w));});
svgLeaf(svg,x-14,gy-300,'#3f7a52',-40,7);
svgLeaf(svg,x+15,gy-430,'#4b9463',35,7);
svgLeaf(svg,x-12,gy-560,'#3f7a52',-30,6);}
/* ветвь от ствола к узлу кроны: толстая у основания, тоньше к узлу, листик в стыке */
function addCrownBranch(svg,def,i){
const x=270;
const depth=nodeDepth(def);
const sy=clamp(def.y+46,150,TREE_GY-80);
const ex=def.x,ey=def.y+34;
const linked=nodeUnlocked(def);
const wob=(((def.x*13+i*7)%23)-11);
const d=`M${x},${sy} C${x+wob},${sy-28} ${ex-wob*0.6},${ey+42} ${ex},${ey}`;
const w=clamp(9-depth*2,3,9);
if(linked)svgPath(svg,d,'rgba(143,214,138,.14)',w+7);
[['#241809',w+2.6],['#4a3421',w],['#6b4f34',w*0.55],['#8a6a44',Math.max(1,w*0.25)]].forEach(([c,ww],li)=>{
svgPath(svg,d,c,ww,linked?null:{opacity:li<2?'0.5':'0.35'});});
svgLeaf(svg,ex,ey+8,linked?'#4b9463':'#33443b',(ex>x?20:-20)+((i*17)%20)-10,7);}
/* толстые корни с боковыми ответвлениями к узлам rs_*; открытые — подсвечены */
function addRootNew(svg,def,i){
const x=270,gy=TREE_GY+6,ex=def.x,ey=def.y-28;
const un=nodeUnlocked(def);
const depth=nodeDepth(def);
const wob=(((i*37)%21)-10);
const d=`M${x},${gy} C${x+wob},${gy+60} ${ex-wob},${Math.max(gy+70,ey-70)} ${ex},${ey}`;
const w=clamp(10-depth*2,4,10);
if(un)svgPath(svg,d,'rgba(240,220,160,.16)',w+6);
[['#241809',w+2.4],['#3a2a14',w],['#5a4222',w*0.66],['#a8834a',w*0.4],['#e6cd96',Math.max(1,w*0.18)]].forEach(([c,ww],li)=>{
svgPath(svg,d,c,ww,un?null:{opacity:li<2?'0.5':'0.35'});});
for(let k=1;k<=2;k++){const tt=k/3;
const pxp=lerp(x,ex,tt)+wob*(1-tt)*0.6,pyp=lerp(gy,ey,tt);
const dir=((k+i)%2?1:-1);
const bd=`M${pxp},${pyp} q${dir*14},6 ${dir*24},16`;
[['#3a2a14',4],['#5a4222',2.6],['#a8834a',1.4]].forEach(([c,ww])=>svgPath(svg,bd,c,ww,un?null:{opacity:'0.5'}));}}
let tooltip=null;
function showTooltip(e,def,l,mx){hideTooltip();
const anchor=e.target.closest('.skill-node')||e.target;
const rect=anchor.getBoundingClientRect();
tooltip=document.createElement('div');tooltip.className='skill-tooltip';
tooltip.innerHTML=`<b>${LN(def.n)}</b><br><em>${LN(def.d)}</em><br>${S.lang==='ru'?'Уровень':'Level'}: ${l}/${mx}`;
placeTip(tooltip,rect);}
function hideTooltip(){if(tooltip){tooltip.remove();tooltip=null;}}
let lastNodeClick={k:'',t:0};
function buySkillNode(n){
const now=performance.now();
if(lastNodeClick.k===n.k&&now-lastNodeClick.t<300)return;
lastNodeClick={k:n.k,t:now};
if(!nodeUnlocked(n)||S.over)return;
const mx=nodeMax(n),c=skCost(n);
if(sk(n.k)>=mx||S.dew<c)return;
S.dew-=c;const before=treeMaxHp();
S.skill[n.k]=(S.skill[n.k]||0)+1;
if(n.stat==='sHp')S.treeHp=Math.min(treeMaxHp(),S.treeHp+(treeMaxHp()-before));
pulse=1;leafBurst();sfx.upgrade();
save();updateHUD();renderSkillTree();}
/* ── ЗАДАНИЯ: охота везде, без наград за этапы/главы, исчезновение собранных ── */
const HUNT_GOAL=120;
const DAILY_POOL=[
{id:'dk',g:50,r:8,txt:{ru:'Убей 50 существ',en:'Slay 50 creatures'}},
{id:'dw',g:3,r:6,txt:{ru:'Пройди 3 этапа',en:'Clear 3 stages'}},
{id:'dr',g:2,r:10,txt:{ru:'Переверни карты 2 раза',en:'Flip the cards twice'}},
{id:'dc',g:5,r:7,txt:{ru:'Нанеси 5 крит. ударов',en:'Land 5 critical hits'}},
{id:'du',g:3,r:9,txt:{ru:'Купи 3 улучшения',en:'Buy 3 upgrades'}}];
const ACH=[
{id:'a_eq5',g:5,field:'equipCount',r:{dew:12},txt:{ru:'Экипируй 5 способностей',en:'Equip 5 abilities'}},
{id:'a_skin',g:1,field:'skinCount',r:{amber:3},txt:{ru:'Купи облик древа',en:'Buy a tree look'}}];
function ensureDaily(){const dk=dayKey();
if(S.dailyDate!==dk){S.dailyDate=dk;S.dailyDone={};S.dailyProg={kills:0,waves:0,spins:0,crits:0,upg:0};save();}
if(!S.dailyProg||typeof S.dailyProg!=='object')S.dailyProg={kills:0,waves:0,spins:0,crits:0,upg:0};}
function dailyList(){ensureDaily();const r=rng(S.dailyDate);const pool=[...DAILY_POOL];
const pick=[];for(let i=0;i<3&&pool.length;i++){pick.push(pool.splice(Math.floor(r()*pool.length),1)[0]);}
return pick.map(p=>{const prog=S.dailyProg[p.id==='dk'?'kills':p.id==='dw'?'waves':p.id==='dr'?'spins':p.id==='dc'?'crits':'upg']||0;
const done=prog>=p.g,claimed=!!S.dailyDone[p.id];
return{id:p.id,txt:p.txt,goal:p.g,prog:Math.min(prog,p.g),done,claimed,reward:{dew:p.r}};});}
function onceList(){const list=[];
ACH.forEach(a=>{let val=0;
if(a.field==='totalKills')val=S.totalKills;else if(a.field==='bestWave')val=S.bestWave;
else if(a.field==='equipCount')val=Math.min(S.equip.length,slotCap());else if(a.field==='skinCount')val=S.treeSkins.length-1;
const done=val>=a.g;
list.push({id:a.id,txt:a.txt,goal:a.g,prog:Math.min(val,a.g),done,claimed:!!S.onceDone[a.id],reward:a.r});});
return list;}
function huntQuest(){const prog=Math.min(S.huntKills||0,HUNT_GOAL);
return{id:'hunt',txt:{ru:'Охота: убейте 120 существ',en:'Hunt: slay 120 creatures'},
goal:HUNT_GOAL,prog,done:prog>=HUNT_GOAL,claimed:false,reward:{dew:40+10*(S.huntDone||0)}};}
function claimQuest(q,sec){if(!q||!q.done||q.claimed)return false;
if(sec==='daily')S.dailyDone[q.id]=1;else S.onceDone[q.id]=1;
if(q.reward.dew){S.dew+=q.reward.dew;bump('#dewPill');}
if(q.reward.amber){S.amber+=q.reward.amber;}
sfx.claim();save();updateHUD();return true;}
function claimHunt(){const q=huntQuest();if(!q.done)return false;
S.dew+=q.reward.dew;bump('#dewPill');
S.huntKills=0;S.huntDone=(S.huntDone||0)+1;
sfx.claim();save();updateHUD();return true;}
function vanishRows(rows,stag){
if(!rows.length)return;
questsAnimating=true;
rows.forEach((r,i)=>{r.style.setProperty('--vd',(i*stag)+'ms');r.classList.add('vanish');});
const total=(rows.length-1)*stag+1100;
setTimeout(()=>{questsAnimating=false;renderQuests();updateNav();},total);}
function claimAllQuests(){
const rows=[...$('#questsContent').querySelectorAll('.q-claim')].map(b=>b.closest('.qrow')).filter(Boolean);
questsAnimating=true;
let any=false;
dailyList().forEach(q=>{if(q.done&&!q.claimed){if(claimQuest(q,'daily'))any=true;}});
onceList().forEach(q=>{if(q.done&&!q.claimed){if(claimQuest(q,'once'))any=true;}});
if(huntQuest().done){if(claimHunt())any=true;}
if(any)vanishRows(rows,120);
else{questsAnimating=false;renderQuests();}}
function rewSpan(q){return q.reward.amber
?`<span class="q-rew amber ${q.done?'':'inactive'}"><svg viewBox="0 0 16 16"><path d="M8 1.5 13 6l-5 8.5L3 6l5-4.5Z" fill="#f0a848"/></svg>${q.reward.amber}</span>`
:`<span class="q-rew ${q.done?'':'inactive'}"><svg viewBox="0 0 16 16"><path d="M8 1.5C8 1.5 3.5 6.5 3.5 9.8a4.5 4.5 0 0 0 9 0C12.5 6.5 8 1.5 8 1.5Z" fill="#7cc9e8"/></svg>${q.reward.dew}</span>`;}
function renderQuests(){
try{const sec=(title,arr,secKey)=>`<div class="q-sec"><h3>${title}</h3>`+
arr.filter(q=>!q.claimed).map(q=>{const rew=rewSpan(q);
const right=q.done?`<button class="q-claim" data-q="${q.id}" data-sec="${secKey}">${rew}</button>`:rew;
return `<div class="qrow ${q.done?'done':''}">
<span class="q-ico"><svg viewBox="0 0 16 16"><path d="M3 8.5 6.5 12 13 4.5" stroke="currentColor" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
<span class="q-body"><span class="q-txt">${LN(q.txt)}</span>
<span class="q-bar"><i style="width:${clamp(100*q.prog/q.goal,0,100)}%"></i></span>
<span class="q-prog">${q.prog}/${q.goal}</span></span>${right}</div>`;}).join('')+'</div>';
const hq=huntQuest();
$('#questsContent').innerHTML=
sec(t('qDaily'),dailyList(),'daily')+
sec(t('qHunt')+' · ×'+(S.huntDone||0),[hq],'hunt')+
sec(t('qOnce'),onceList(),'once');
const avail=[...dailyList(),...onceList()].filter(q=>q.done&&!q.claimed).length+(hq.done?1:0);
const cab=$('#claimAllBtn');cab.textContent=t('qAll');cab.disabled=avail===0;
}catch(e){console.error('renderQuests',e);}}
$('#questsContent').addEventListener('click',e=>{const b=e.target.closest('[data-q]');
if(!b)return;
const row=b.closest('.qrow');
questsAnimating=true;
if(b.dataset.sec==='hunt'){claimHunt();vanishRows([row],0);return;}
const q=findQuest(b.dataset.q,b.dataset.sec);
claimQuest(q,b.dataset.sec);
vanishRows([row],0);});
$('#claimAllBtn').addEventListener('click',claimAllQuests);
function findQuest(id,sec){if(sec==='daily')return dailyList().find(q=>q.id===id);
return onceList().find(q=>q.id===id);}
function renderSkins(){
try{$('#skinGrid').innerHTML=Object.entries(TREE_SKINS).sort((a,b)=>a[1].cost-b[1].cost).map(([k,ts])=>{
const owned=S.treeSkins.includes(k),active=S.treeSkin===k;
const state=active?`<span style="color:var(--gold2)">${S.lang==='ru'?'Используется':'Active'}</span>`
:owned?`<span style="color:var(--teal)">${S.lang==='ru'?'Выбрать':'Select'}</span>`
:`<span style="color:#ffd9a0"><svg viewBox="0 0 16 16"><path d="M8 1.5 13 6l-5 8.5L3 6l5-4.5Z" fill="#f0a848"/></svg> ${ts.cost}</span>`;
return `<div class="skin-card ${active?'active':''}" data-tree="${k}">
<div class="skin-prev">${ts.svg}</div>
<div class="skin-name">${LN(ts.name)}</div>
<div class="skin-state">${state}</div></div>`;}).join('');
$('#shopAmber').textContent=fmt(S.amber);
}catch(e){console.error('renderSkins',e);}}
function pickTree(k){const ts=TREE_SKINS[k];
if(!S.treeSkins.includes(k)){if(S.amber<ts.cost)return;S.amber-=ts.cost;S.treeSkins.push(k);}
S.treeSkin=k;sfx.claim();pulse=1;leafBurst();
save();renderSkins();updateHUD();applyTreeSkin();}
$('#skinGrid').addEventListener('click',e=>{const c=e.target.closest('[data-tree]');if(c)pickTree(c.dataset.tree);});