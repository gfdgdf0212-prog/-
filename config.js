'use strict';
const $=s=>document.querySelector(s);
const TAU=Math.PI*2, ISO=0.48, KEY='drevo.save.v9';
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const rand=(a,b)=>a+Math.random()*(b-a);
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const CONFIG={
ENEMY:{ HP_EXP:7, RW_EXP:7, G_COEF:0.10, BOSS_HP:90, BOSS_RW:45,
BOSS_HP_PER_WAVE:1.0004, BOSS_DMG_PER_WAVE:1.0002 },
UPG:{ EXP:12, KC:0.015, LVL_CAP:9999,
base:{dmg:20,spd:30,rad:120,cc:60,cd:70,hp:25} },
STAT:{
dmg:L=>10*Math.pow(1+0.02*L,10),
spd:L=>1+0.045*Math.sqrt(L),
hp :L=>100*Math.pow(1+0.02*L,9),
cc :L=>Math.min(0.6,0.0008*L),
cd :L=>1.5+0.0015*L,
rad:L=>85+0.4*L,
spdCap:8, ccCap:0.7, cdCap:4 },
QUOTA:w=>Math.min(40, 8+chapterOf(w)),
AFK_RATE_K:0.30, AFK_CAP_H:8,
SPIN_COST:15, START_DEW:0, START_SEEDS:500,
TIER_WEIGHTS:[
{common:90,rare:9,epic:1,legendary:0,mythic:0},
{common:70,rare:22,epic:7,legendary:1,mythic:0},
{common:50,rare:30,epic:16,legendary:3.9,mythic:0},
{common:30,rare:31,epic:27,legendary:10.5,mythic:2},
{common:15,rare:30,epic:35,legendary:18,mythic:2}],
ABIL_BASE:{common:100,rare:400,epic:1200,legendary:2500,mythic:7000},
ROULETTE:{ GATHER_MS:70, DEAL_MS:130, LIFT_MS:100, SETTLE_MS:35 },
EVO:{ T:[0,0.25,0.5,0.75,1.0], BOSS_HP_MULT:4.0, BOSS_DMG_MULT:2.5, BOSS_RW_MULT:5 }
};
const SUFFIX=['','K','M','B','T','Qa','Qi','Sx','Sp','Oc','No','Dc','UDc','DDc','TDc','QaDc','QiDc','SxDc','SpDc','OcDc','NoDc','Vg','UVg','DVg','TVg','QaVg','QiVg','SxVg','SpVg','OcVg','NoVg','Tg','UTg','DTg','TTg','QaTg','QiTg','SxTg','SpTg','OcTg','NoTg','Sg','USg','DSg','TSg','QaSg','QiSg','SxSg','SpSg','OcSg','NoSg','Og','UOg','DOg','TOg','QaOg','QiOg','SxOg','SpOg','OcOg','NoOg','Ng','UNg','DNg','TNg','QaNg','QiNg','SxNg','SpNg','OcNg','NoNg','Ct'];
function fmt(n){
if(typeof n==='string'){if(/^[\d.]+[KMBTQa-zA-Z]*$/.test(n))return n;}
n=+n;if(!isFinite(n)||isNaN(n))n=0;n=Math.floor(n);
if(n<1000)return''+n;
let i=0,x=n;
while(x>=1000&&i<SUFFIX.length-1){x/=1000;i++;}
let s=(x<10?x.toFixed(2):x<100?x.toFixed(1):''+Math.round(x)).replace(/\.0+$|(\.\d*[1-9])0+$/,'$1');
return s+SUFFIX[i];}
const fmtS=v=>{v=+v;if(!isFinite(v)||isNaN(v))v=0;return v<10?v.toFixed(1):v<100?''+Math.round(v):fmt(v);};
function fmtTime(s){s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=s%60;
if(h)return h+' ч '+m+' мин';if(m)return m+' мин '+sec+' сек';return sec+' сек';}
function dayKey(){const d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate();}
function weekKey(){return Math.floor(Date.now()/604800000);}
function rng(seed){let s=seed>>>0;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};}
function safeInt(v,def){const n=parseInt(v,10);return(isFinite(n)&&!isNaN(n))?n:def;}
const I18N={
ru:{stage:'Этап',boss:'Босс',revive:'🌱 Возродить древо',
newAbil:' — новая способность!',maxEquip:'Достигнут лимит слотов способностей',
fromRoulette:'Способность находится в картах',chap:'Глава',chapDone:'пройдена',
resetConfirm:'Сбросить ВЕСЬ прогресс?',protect:'защитите древо',revived:'улучшите его, чтобы выстоять',
qDaily:'Ежедневные',qOnce:'Разовые',qHunt:'Охота',qClaim:'Взять',qDone:'✓',qAll:'Забрать всё',
dmgFirst:'Сначала прокачайте урон',
notSel:'не выбрана',selInTut:'Выберите способность в обучении',
passHead:'Награды за главы',passNext:'след. веха',
evoLocked:'Эволюция откроется после главы ',evoReady:'Эволюция доступна!',
evoBoss:'Древо эволюционирует…',evoWin:'Древо преобразилось!',evoStart:'Сразите стража эволюции!',
evoMax:'Максимальная эволюция',
tipSeeds:'Семена — для прокачки статов древа',
tipDew:'Роса — для древа прокачки и перемешивания карт'},
en:{stage:'Stage',boss:'Boss',revive:'🌱 Revive the tree',
newAbil:' — new ability!',maxEquip:'Ability slot cap reached',fromRoulette:'Ability is found in cards',
chap:'Chapter',chapDone:'cleared',resetConfirm:'Reset ALL progress?',protect:'protect the tree',revived:'upgrade it to stand firm',
qDaily:'Daily',qOnce:'One-time',qHunt:'Hunt',qClaim:'Claim',qDone:'✓',qAll:'Claim all',
dmgFirst:'Upgrade damage first',
notSel:'not selected',selInTut:'Pick it during the tutorial',
passHead:'Chapter rewards',passNext:'next milestone',
evoLocked:'Evolution unlocks after chapter ',evoReady:'Evolution available!',
evoBoss:'The tree evolves…',evoWin:'The tree transformed!',evoStart:'Defeat the evolution guardian!',
evoMax:'Max evolution',
tipSeeds:'Seeds — for upgrading tree stats',
tipDew:'Dew — for skill tree and card shuffles'}
};
const t=(k,o)=>{let s=(I18N[S.lang]||I18N.ru)[k]||k;if(o)for(const p in o)s=s.replace('{'+p+'}',o[p]);return s;};
function stageOf(wave){return `${Math.floor((wave-1)/7)+1}-${((wave-1)%7)+1}`;}
function chapterOf(wave){return Math.floor((wave-1)/7)+1;}
function slotCap(){const ch=chapterOf(S.bestWave);
if(ch>=250)return 6;if(ch>=200)return 5;if(ch>=130)return 4;if(ch>=50)return 3;return 2;}
function evoStageFor(ch){if(ch>=250)return 4;if(ch>=200)return 3;if(ch>=130)return 2;if(ch>=50)return 1;return 0;}
function evoAvailable(){
if(S.evoBossActive)return false;
const maxStage=CONFIG.EVO.T.length-1;
if((S.evoStage||0)>=maxStage)return false;
return evoStageFor(chapterOf(S.bestWave))>(S.evoStage||0);}
function evoNextChapter(){const cur=S.evoStage||0;
const thresholds=[50,130,200,250];return thresholds[cur]||999;}
function bossCount(){
 let bc=clamp(1+Math.floor((chapterOf(S.wave)-100)/50),1,5);
 if(M('m_siege'))bc+=1;
 return bc;}
function enemyScaleHP(G){return Math.pow(1+CONFIG.ENEMY.G_COEF*G, CONFIG.ENEMY.HP_EXP);}
function enemyScaleRW(G){return Math.pow(1+CONFIG.ENEMY.G_COEF*G, CONFIG.ENEMY.RW_EXP);}
function enemyScaleDMG(G){return Math.pow(1+CONFIG.ENEMY.G_COEF*G,5)*1.2;}
function passReward(s){
if(s<=5)return 7+s;if(s===10)return 20;if(s===15)return 25;
if(s%100===0)return 300+(s/100)*100;if(s%50===0)return 180+(s/50)*30;
if(s%25===0)return 100+(s/25)*12;if(s%5===0)return 40+(s/5)*4;return 0;}
function passMilestones(){const l=[1,2,3,4,5,10,15];for(let s=20;s<=1000;s+=5)l.push(s);return l;}
const TIERS={
common:{name:{ru:'Обычная',en:'Common'},c:'#a8c4ae',g:'168,196,174',idx:0},
rare:{name:{ru:'Редкая',en:'Rare'},c:'#5aa9e6',g:'90,169,230',idx:1},
epic:{name:{ru:'Эпическая',en:'Epic'},c:'#b07fd8',g:'176,127,216',idx:2},
legendary:{name:{ru:'Легендарная',en:'Legendary'},c:'#f0a848',g:'240,168,72',idx:3},
mythic:{name:{ru:'Мифическая',en:'Mythic'},c:'#ff6b8a',g:'255,107,138',idx:4}};
function tierStage(){const ch=chapterOf(S.bestWave);
if(ch>=250)return 5;if(ch>=200)return 4;if(ch>=130)return 3;if(ch>=50)return 2;return 1;}
const ABIL=[
{k:'seedshot',n:{ru:'Выстрел семенем',en:'Seed Shot'},short:{ru:'Семя',en:'Seed'},tier:'common',kind:'seed-shot',base:true,
desc:{ru:'Базовая атака: 1 семя, 100% урона. EX',en:'Base attack: 1 seed, 100% dmg. EX'},
svg:'<svg viewBox="0 0 16 16"><path d="M8 14V8M8 8 3.5 3M8 8l4.5-5M8 8V2.5" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'},
{k:'rootstrike',n:{ru:'Удар корнем',en:'Root Strike'},short:{ru:'Корень',en:'Root'},tier:'common',kind:'root-strike',base:true,ex:true,
desc:{ru:'Корни бьют из земли, 100% урона. EX — не занимает слот',en:'Roots strike from below, 100% dmg. EX — free slot'},
svg:'<svg viewBox="0 0 16 16"><path d="M8 2v5M8 7c0 3-3.2 3.2-4.2 6.5M8 7c0 3 3.2 3.2 4.2 6.5M8 7v7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'},
{k:'thorns',n:{ru:'Острые шипы',en:'Sharp Thorns'},short:{ru:'Шипы',en:'Thorns'},tier:'common',kind:'pass-seed',
desc:{ru:'% к урону семян от базового',en:'% to seed dmg from base'},
svg:'<svg viewBox="0 0 16 16"><path d="M3 14c1-4 1-7 0-10M8 14c1.5-4.5 1.5-8.5 0-12.5M13 14c-1-4-1-7 0-10" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'},
{k:'thornsalvo',n:{ru:'Шипастый залп',en:'Thorn Salvo'},short:{ru:'Залп',en:'Salvo'},tier:'rare',kind:'thornsalvo',
desc:{ru:'Крона мечет веер шипов',en:'Crown throws a fan of thorns'},
svg:'<svg viewBox="0 0 16 16"><path d="M8 13V5M8 5 4 2M8 5l4-3M8 5 2 6M8 5l6-1" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>'},
{k:'vinewhip',n:{ru:'Удар лозой',en:'Vine Whip'},short:{ru:'Лоза',en:'Vine'},tier:'rare',kind:'vinewhip',
desc:{ru:'Лиана хлещет дугой и отбрасывает',en:'Vine lashes in an arc, knocks back'},
svg:'<svg viewBox="0 0 16 16"><path d="M3 13C3 8 7 4 13 4" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><path d="M13 4l-2 1M13 4l-1 2" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>'},
{k:'deeproots',n:{ru:'Глубокие корни',en:'Deep Roots'},short:{ru:'Корни',en:'Roots'},tier:'rare',kind:'pass-root',
desc:{ru:'% к урону корней от базового',en:'% to root dmg from base'},
svg:'<svg viewBox="0 0 16 16"><path d="M8 2v5M8 7c0 3-3.2 3.2-4.2 6.5M8 7c0 3 3.2 3.2 4.2 6.5M8 7v7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'},
{k:'frost',n:{ru:'Ледяной укол',en:'Frost Spike'},short:{ru:'Лёд',en:'Frost'},tier:'rare',kind:'active-single',
desc:{ru:'Попадание семени наносит доп. урон льдом',en:'Seed hit deals bonus frost dmg'},
svg:'<svg viewBox="0 0 16 16"><path d="M8 2v12M2.8 5l10.4 6M13.2 5 2.8 11" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>'},
{k:'spores',n:{ru:'Ядовитые споры',en:'Toxic Spores'},short:{ru:'Споры',en:'Spores'},tier:'epic',kind:'spores',
desc:{ru:'Облако спор ползёт и травит',en:'Spore cloud drifts and poisons'},
svg:'<svg viewBox="0 0 16 16"><circle cx="6" cy="7" r="2.4" fill="currentColor" opacity=".7"/><circle cx="10" cy="9" r="1.8" fill="currentColor" opacity=".5"/><circle cx="9" cy="5" r="1.3" fill="currentColor" opacity=".6"/></svg>'},
{k:'crownwrath',n:{ru:'Гнев кроны',en:'Crown Wrath'},short:{ru:'Гнев',en:'Wrath'},tier:'epic',kind:'crownwrath',
desc:{ru:'Сучья падают на цели сверху',en:'Branches fall on targets from above'},
svg:'<svg viewBox="0 0 16 16"><path d="M4 2 6 12M9 2 8 12M13 3 11 12" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>'},
{k:'branch',n:{ru:'Живые ветви',en:'Living Branches'},short:{ru:'Ветви',en:'Branch'},tier:'epic',kind:'active-aoe',
desc:{ru:'Ветви сметают врагов вблизи',en:'Branches sweep nearby foes'},
svg:'<svg viewBox="0 0 16 16"><path d="M3 14C6 9 6.5 5.5 13 2M7.6 7.4c1.6.6 3.1.3 4.2-1M5.9 10.2c1.8.4 3.3 0 4.5-1.3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>'},
{k:'leafstorm',n:{ru:'Листопад',en:'Leafstorm'},short:{ru:'Листья',en:'Leaves'},tier:'epic',kind:'active-aoe',
desc:{ru:'Кольцо листьев разлетается от ствола',en:'Ring of leaves bursts'},
svg:'<svg viewBox="0 0 16 16"><path d="M4 13C4 7 8 3 13 3c0 5-4 9-9 10Z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/><path d="M4 13C7 9.5 9 7.5 12 4.5" stroke="currentColor" stroke-width="1.2" fill="none" stroke-linecap="round"/></svg>'},
{k:'bleed',n:{ru:'Едкий сок',en:'Acerbic Sap'},short:{ru:'Сок',en:'Sap'},tier:'epic',kind:'dot',
desc:{ru:'Удары копят стаки кровотечения',en:'Hits stack bleed'},
svg:'<svg viewBox="0 0 16 16"><path d="M8 1.5C8 1.5 4 6 4 9a4 4 0 0 0 8 0C12 6 8 1.5 8 1.5Z" fill="currentColor"/><path d="M12.8 12.2v2.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'},
{k:'roottrap',n:{ru:'Корневой капкан',en:'Root Trap'},short:{ru:'Капкан',en:'Trap'},tier:'legendary',kind:'roottrap',
desc:{ru:'Корни смыкаются клеткой вокруг врага',en:'Roots close into a cage'},
svg:'<svg viewBox="0 0 16 16"><path d="M3 13V5M6 13V4M10 13V4M13 13V5" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M3 5q5 -3 10 0" stroke="currentColor" stroke-width="1.3" fill="none"/></svg>'},
{k:'fruitbomb',n:{ru:'Плоды-бомбы',en:'Fruit Bombs'},short:{ru:'Плоды',en:'Fruit'},tier:'legendary',kind:'fruitbomb',
desc:{ru:'Плоды катятся и взрываются',en:'Fruits roll and explode'},
svg:'<svg viewBox="0 0 16 16"><circle cx="8" cy="9" r="4" fill="currentColor"/><path d="M8 5V2M8 2l2-1" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>'},
{k:'rootnet',n:{ru:'Сеть корней',en:'Root Net'},short:{ru:'Сеть',en:'Net'},tier:'legendary',kind:'multi-root',
desc:{ru:'+1 корень одновременно за уровень',en:'+1 simultaneous root per level'},
svg:'<svg viewBox="0 0 16 16"><circle cx="4" cy="12" r="1.7" fill="currentColor"/><circle cx="12" cy="12" r="1.7" fill="currentColor"/><circle cx="8" cy="4" r="1.7" fill="currentColor"/><path d="M5 11l2.3-5.3M11 11 8.7 5.7M5.7 12h4.6" stroke="currentColor" stroke-width="1.3"/></svg>'},
{k:'acidsap',n:{ru:'Кислотная живица',en:'Acidic Resin'},short:{ru:'Кислота',en:'Acid'},tier:'mythic',kind:'acidsap',
desc:{ru:'Струя смолы оставляет ядовитую лужу',en:'Resin stream leaves a toxic puddle'},
svg:'<svg viewBox="0 0 16 16"><path d="M8 2v6" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/><ellipse cx="8" cy="11" rx="5" ry="2.4" fill="currentColor"/></svg>'},
{k:'avatar',n:{ru:'Аватар рощи',en:'Grove Avatar'},short:{ru:'Аватар',en:'Avatar'},tier:'mythic',kind:'pass-all',
desc:{ru:'Огромный % ко всему урону древа',en:'Huge % to all tree dmg'},
svg:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.6" stroke="currentColor" stroke-width="1.2" fill="none" opacity=".55"/><path d="M7.3 13V9.5h1.4V13" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="7" r="3" fill="currentColor"/></svg>'},
{k:'rootBounce',n:{ru:'Рикошет семян',en:'Seed Ricochet'},short:{ru:'Рикошет',en:'Ricochet'},tier:'mythic',kind:'multi-seedbounce',
desc:{ru:'Семя отскакивает без потери урона (+1 цель за уровень)',en:'Seed bounces without dmg loss (+1 target per level)'},
svg:'<svg viewBox="0 0 16 16"><path d="M2 12 6 4l4 8 4-8" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>'}];
const ABIL_BY_K=Object.fromEntries(ABIL.map(a=>[a.k,a]));
const LN=o=>o[S.lang]||o.ru;
const isExSeed=()=>!!S.tutorialDone&&(S.abilities.seedshot||0)>0;
function ab(k){
if(k==='seedshot')return isExSeed()?(S.abilities.seedshot||0):0;
if(k==='rootstrike')return Math.max(1,(S.abilities.rootstrike||0));
return S.equip.includes(k)?(S.abilities[k]||0):0;}
function abilPct(k){const a=ABIL_BY_K[k];const l=ab(k);if(!a||!l)return 0;
if(k==='seedshot'||k==='rootstrike')return 100;
return CONFIG.ABIL_BASE[a.tier]*(1+0.10*(l-1));}
function abilCd(k,lvl){if(!lvl)return null;switch(k){
case 'thornsalvo':return Math.max(1.4,2.4-0.12*lvl);
case 'vinewhip':return Math.max(2,3.2-0.15*lvl);
case 'spores':return Math.max(3,5-0.2*lvl);
case 'crownwrath':return Math.max(2.4,4-0.2*lvl);
case 'roottrap':return Math.max(3.5,6-0.3*lvl);
case 'fruitbomb':return Math.max(3,5-0.25*lvl);
case 'acidsap':return Math.max(2.5,4-0.2*lvl);
default:return null;}}
const IC={
grow:'<svg viewBox="0 0 16 16"><path d="M8 14V8M8 8C8 5 5.5 3.5 3 3.5 3 6.5 5.5 8 8 8Zm0 0c0-3 2.5-4.5 5-4.5 0 3-2.5 4.5-5 4.5Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/></svg>',
spd:'<svg viewBox="0 0 16 16"><path d="M2.5 5.5h7a2.3 2.3 0 1 0-2.3-2.3M2.5 9.5h10a2.3 2.3 0 1 1-2.3 2.3" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"/></svg>',
hp:'<svg viewBox="0 0 16 16"><path d="M8 1.5l5.5 2.2v3.8c0 3.6-2.4 6.2-5.5 7-3.1-.8-5.5-3.4-5.5-7V3.7L8 1.5Z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/></svg>',
crit:'<svg viewBox="0 0 16 16"><path d="M9 1.5 4 9h3.5L7 14.5 12 7H8.5L9 1.5Z" fill="currentColor"/></svg>',
rad:'<svg viewBox="0 0 16 16"><path d="M8 2v4M8 6 3 13M8 6l5 7M8 6v8" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
critd:'<svg viewBox="0 0 16 16"><path d="M8 1.5 9.6 5.4 13.8 5.7 10.6 8.4 11.6 12.5 8 10.3 4.4 12.5 5.4 8.4 2.2 5.7 6.4 5.4 8 1.5Z" fill="currentColor"/></svg>',
alls:'<svg viewBox="0 0 16 16"><path d="M2 5h8a2 2 0 1 0-2-2M2 8h11a2 2 0 1 1-2 2M2 11h6a1.6 1.6 0 1 1-1.6 1.6" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/></svg>',
thorn:'<svg viewBox="0 0 16 16"><path d="M3 14c1-4 1-7 0-10M8 14c1.5-4.5 1.5-8.5 0-12.5M13 14c-1-4-1-7 0-10" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
afkt:'<svg viewBox="0 0 16 16"><path d="M13.6 9.7A6 6 0 0 1 6.3 2.4a6.3 6.3 0 1 0 7.3 7.3Z" fill="currentColor"/></svg>',
alld:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="6.6" stroke="currentColor" stroke-width="1.2" fill="none" opacity=".55"/><path d="M7.3 13V9.5h1.4V13" stroke="currentColor" stroke-width="1.3"/><circle cx="8" cy="7" r="3" fill="currentColor"/></svg>',
deep:'<svg viewBox="0 0 16 16"><path d="M8 2v5M8 7c0 3-3.2 3.2-4.2 6.5M8 7c0 3 3.2 3.2 4.2 6.5M8 7v7" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
seed:'<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.5" fill="currentColor"/><path d="M8 2v3M8 11v3M2 8h3M11 8h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
root:'<svg viewBox="0 0 16 16"><path d="M8 2v4M8 6c0 2-3 2-4 6M8 6c0 2 3 2 4 6M8 6v8" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>'};
const SKDEF=[
{k:'n_root',stat:'sAllDmg',parent:null,x:270,y:760,base:30,n:{ru:'Сердце древа',en:'Tree Heart'},d:{ru:'+10% ко всему урону',en:'+10% all dmg'},svg:IC.grow},
{k:'ss_1',stat:'sSpd',parent:'n_root',x:270,y:640,base:80,n:{ru:'Гибкость ветвей',en:'Lithe Branches'},d:{ru:'+8% скорости атаки',en:'+8% atk speed'},svg:IC.spd},
{k:'ss_2',stat:'ssPierce',parent:'ss_1',x:180,y:550,base:200,n:{ru:'Пробивные семена',en:'Piercing Seeds'},d:{ru:'Семя пронзает +1 цель',en:'Seed pierces +1 target'},svg:IC.seed},
{k:'ss_3',stat:'sCrit',parent:'ss_1',x:360,y:550,base:200,n:{ru:'Меткость побегов',en:'Shoot Aim'},d:{ru:'+5% крит. шанса',en:'+5% crit chance'},svg:IC.crit},
{k:'ss_4',stat:'ssSplit',parent:'ss_2',x:110,y:450,base:400,n:{ru:'Осколочные семена',en:'Split Seeds'},d:{ru:'Семя делится на 2 осколка',en:'Seed splits into 2'},svg:IC.seed},
{k:'ss_5',stat:'sSeedDmg',parent:'ss_3',x:430,y:450,base:400,n:{ru:'Сила семян',en:'Seed Power'},d:{ru:'+25% урона семян',en:'+25% seed dmg'},svg:IC.seed},
{k:'ss_6',stat:'ssBurn',parent:'ss_2',x:240,y:440,base:400,n:{ru:'Жгучие семена',en:'Burning Seeds'},d:{ru:'Семена поджигают цель',en:'Seeds ignite target'},svg:IC.thorn},
{k:'ss_7',stat:'sCritDmg',parent:'ss_3',x:340,y:340,base:600,n:{ru:'Вес ветвей',en:'Branch Weight'},d:{ru:'+10% крит. урона',en:'+10% crit dmg'},svg:IC.critd},
{k:'ss_8',stat:'ssAoe',parent:'ss_6',x:140,y:330,base:600,n:{ru:'Взрывные семена',en:'Burst Seeds'},d:{ru:'Семя взрывается по площади',en:'Seed explodes in AoE'},svg:IC.rad},
{k:'ss_9',stat:'sRad',parent:'ss_6',x:250,y:240,base:600,n:{ru:'Размах кроны',en:'Crown Spread'},d:{ru:'+10% радиуса атаки',en:'+10% range'},svg:IC.rad},
{k:'ss_10',stat:'ssDouble',parent:'ss_7',x:400,y:240,base:800,n:{ru:'Двойной выстрел',en:'Double Shot'},d:{ru:'Шанс 2-го семени',en:'Chance of 2nd seed'},svg:IC.seed},
{k:'ss_11',stat:'sAllSpd',parent:'ss_8',x:80,y:200,base:800,n:{ru:'Штормовой ветер',en:'Storm Wind'},d:{ru:'+20% ко всей скорости',en:'+20% ALL speed'},svg:IC.alls},
{k:'ss_12',stat:'ssVamp',parent:'ss_9',x:220,y:140,base:800,n:{ru:'Семена-вампиры',en:'Vampire Seeds'},d:{ru:'Криты лечат древо',en:'Crits heal tree'},svg:IC.hp},
{k:'ss_13',stat:'sAllDmg',parent:'ss_9',x:340,y:140,base:800,n:{ru:'Дух рощи',en:'Grove Spirit'},d:{ru:'+25% ко всему урону',en:'+25% ALL dmg'},svg:IC.alld},
{k:'ss_14',stat:'ssStorm',parent:'ss_10',x:460,y:140,base:1000,n:{ru:'Семенной шторм',en:'Seed Storm'},d:{ru:'Каждый 5-й залп — залп по всем',en:'Every 5th shot hits all'},svg:IC.seed},
{k:'ss_15',stat:'sHp',parent:'ss_13',x:280,y:60,base:1000,n:{ru:'Крона жизни',en:'Crown of Life'},d:{ru:'+15% коры (HP)',en:'+15% bark (HP)'},svg:IC.hp},
{k:'rs_1',stat:'sRootDmg',parent:'n_root',x:270,y:880,base:80,n:{ru:'Сила корней',en:'Root Power'},d:{ru:'+25% урона корней',en:'+25% root dmg'},svg:IC.root},
{k:'rs_2',stat:'rsSlow',parent:'rs_1',x:170,y:970,base:200,n:{ru:'Цепкие корни',en:'Grasping Roots'},d:{ru:'Корни замедляют цель',en:'Roots slow target'},svg:IC.root},
{k:'rs_3',stat:'sHp',parent:'rs_1',x:370,y:970,base:200,n:{ru:'Толстая кора',en:'Thick Bark'},d:{ru:'+15% коры (HP)',en:'+15% bark (HP)'},svg:IC.hp},
{k:'rs_4',stat:'rsDouble',parent:'rs_2',x:90,y:1060,base:400,n:{ru:'Двойной корень',en:'Twin Root'},d:{ru:'+1 удар корня',en:'+1 root strike'},svg:IC.root},
{k:'rs_5',stat:'sCrit',parent:'rs_3',x:450,y:1060,base:400,n:{ru:'Меткость корней',en:'Root Aim'},d:{ru:'+5% крит. шанса',en:'+5% crit chance'},svg:IC.crit},
{k:'rs_6',stat:'rsPoison',parent:'rs_2',x:220,y:1070,base:400,n:{ru:'Ядовитые корни',en:'Toxic Roots'},d:{ru:'Корни травят цель',en:'Roots poison target'},svg:IC.thorn},
{k:'rs_7',stat:'sRad',parent:'rs_3',x:330,y:1160,base:600,n:{ru:'Размах корней',en:'Root Spread'},d:{ru:'+10% радиуса атаки',en:'+10% range'},svg:IC.rad},
{k:'rs_8',stat:'rsQuake',parent:'rs_6',x:120,y:1170,base:600,n:{ru:'Землетрясение',en:'Earthquake'},d:{ru:'Удар корня сотрясает землю',en:'Root strike shakes ground'},svg:IC.rad},
{k:'rs_9',stat:'sCritDmg',parent:'rs_6',x:230,y:1260,base:600,n:{ru:'Тяжесть корней',en:'Root Weight'},d:{ru:'+10% крит. урона',en:'+10% crit dmg'},svg:IC.critd},
{k:'rs_10',stat:'rsTrap',parent:'rs_7',x:420,y:1260,base:800,n:{ru:'Корни-ловушки',en:'Root Snare'},d:{ru:'Шанс обездвижить цель',en:'Chance to snare'},svg:IC.root},
{k:'rs_11',stat:'sDeep',parent:'rs_8',x:60,y:1290,base:800,n:{ru:'Глубинные жилы',en:'Deep Veins'},d:{ru:'+25% урона корней',en:'+25% root dmg'},svg:IC.deep},
{k:'rs_12',stat:'rsSeismic',parent:'rs_9',x:200,y:1360,base:800,n:{ru:'Сейсмический удар',en:'Seismic Strike'},d:{ru:'Мощный AoE-удар корня',en:'Powerful root AoE'},svg:IC.rad},
{k:'rs_13',stat:'sAllDmg',parent:'rs_9',x:320,y:1360,base:800,n:{ru:'Дух земли',en:'Earth Spirit'},d:{ru:'+25% ко всему урону',en:'+25% ALL dmg'},svg:IC.alld},
{k:'rs_14',stat:'rsCount',parent:'rs_10',x:460,y:1360,base:1000,n:{ru:'Сеть корней',en:'Root Web'},d:{ru:'+1 корень одновременно',en:'+1 simultaneous root'},svg:IC.root},
{k:'rs_15',stat:'sAfkT',parent:'rs_13',x:260,y:1440,base:1000,n:{ru:'Глубокий покой',en:'Deep Slumber'},d:{ru:'+1 час лимита AFK',en:'+1h AFK cap'},svg:IC.afkt}];
const sk=k=>(S.skill&&S.skill[k])||0;
function statCount(st){let s=0;for(const n of SKDEF)if(n.stat===st)s+=sk(n.k);return s;}
const nodeMax=()=>1;
const skCost=n=>n.base;
function nodeUnlocked(n){if(!n.parent)return true;return sk(n.parent)>=1;}
function nodeDepth(n){let d=0,cur=n;while(cur&&cur.parent){d++;cur=SKDEF.find(x=>x.k===cur.parent);}return d;}
/* ═══ МУТАЦИИ v2: дебаф ×1.5–2 сильнее бафа ═══ */
const MUTS=[
 {id:'m_frost',   cat:'Урон',        n:{ru:'Ледяной сок',en:'Frost Sap'},
  up:{ru:'10% шанс заморозки на 1 с (по танкам)',en:'10% freeze 1s (tanks only)'},
  down:{ru:'−15% скорости атаки (всегда)',en:'−15% atk speed (always)'}},
 {id:'m_acid',    cat:'Урон',        n:{ru:'Кислотный взрыв',en:'Acid Burst'},
  up:{ru:'кислотное облако при смерти врага',en:'acid cloud on enemy death'},
  down:{ru:'−20% макс. коры',en:'−20% max bark'}},
 {id:'m_greed',   cat:'Экономика',   n:{ru:'Жадная крона',en:'Greedy Crown'},
  up:{ru:'+15% семян',en:'+15% seeds'},
  down:{ru:'враги +15% быстрее',en:'enemies +15% faster'}},
 {id:'m_bark',    cat:'Выживаемость',n:{ru:'Толстая кора',en:'Thick Bark'},
  up:{ru:'+15% коры',en:'+15% bark'},
  down:{ru:'−20% урона (заметно на боссах)',en:'−20% dmg (bosses notice)'}},
 {id:'m_critres', cat:'Урон',        n:{ru:'Критический резонанс',en:'Crit Resonance'},
  up:{ru:'+15% крит. урона',en:'+15% crit dmg'},
  down:{ru:'−10% крит. шанса',en:'−10% crit chance'}},
 {id:'m_vamp',    cat:'Выживаемость',n:{ru:'Корневой вампиризм',en:'Root Vampirism'},
  up:{ru:'корни лечат 3% от урона',en:'roots heal 3% of dmg'},
  down:{ru:'−20% семян',en:'−20% seeds'}},
 {id:'m_dew',     cat:'Экономика',   n:{ru:'Магнит росы',en:'Dew Magnet'},
  up:{ru:'+15% росы',en:'+15% dew'},
  down:{ru:'−20% семян',en:'−20% seeds'}},
 {id:'m_blade',   cat:'Урон',        n:{ru:'Хрупкое лезвие',en:'Fragile Blade'},
  up:{ru:'+12% урона и +5% крита',en:'+12% dmg and +5% crit'},
  down:{ru:'−25% коры',en:'−25% bark'}},
 {id:'m_berserk', cat:'Урон',        n:{ru:'Ярость берсерка',en:'Berserker Rage'},
  up:{ru:'+12% урона, +8% скорости',en:'+12% dmg, +8% speed'},
  down:{ru:'враги наносят +20% урона',en:'enemies deal +20% dmg'}},
 {id:'m_siege',   cat:'Хаос',        n:{ru:'Осадный пакт',en:'Siege Pact'},
  up:{ru:'+15% врагов и +1 босс (75% HP)',en:'+15% enemies and +1 boss (75% HP)'},
  down:{ru:'обычные враги +20% HP',en:'regular enemies +20% HP'}},
 {id:'m_overheat',cat:'Урон',        n:{ru:'Перегрев',en:'Overheat'},
  up:{ru:'+15% скорости атаки',en:'+15% atk speed'},
  down:{ru:'−15% коры И враги +10% быстрее',en:'−15% bark AND enemies +10% faster'}},
 {id:'m_melee',   cat:'Урон',        n:{ru:'Ближняя крона',en:'Melee Crown'},
  up:{ru:'+15% урона',en:'+15% dmg'},
  down:{ru:'−25% радиуса',en:'−25% radius'}},
 {id:'m_fog',     cat:'Хаос',        n:{ru:'Туман войны',en:'Fog of War'},
  up:{ru:'первые 10 с волны враги −20% скорости',en:'first 10s: enemies −20% speed'},
  down:{ru:'−15% урона всю волну',en:'−15% dmg the whole wave'}},
 {id:'m_deal',    cat:'Сделки',      n:{ru:'Сделка с лесом',en:'Deal with the Forest'},
  up:{ru:'выбираешь баф из 3 (8–12%)',en:'pick a buff from 3 (8–12%)'},
  down:{ru:'случайный тяжёлый дебаф (18–25%)',en:'random heavy debuff (18–25%)'},rare:true},
 {id:'m_rdeal',   cat:'Сделки',      n:{ru:'Обратная сделка',en:'Reverse Deal'},
  up:{ru:'случайный баф 8–12%',en:'random buff 8–12%'},
  down:{ru:'выбираешь дебаф из 3',en:'pick a debuff from 3'},rare:true}
];

/* Пулы для сделок 14/15 */
const DEAL_BUFFS=[
 {id:'db_dmg', val:0.12, txt:{ru:'+12% урона',en:'+12% dmg'}},
 {id:'db_spd', val:0.08, txt:{ru:'+8% скорости атаки',en:'+8% atk speed'}},
 {id:'db_crit',val:0.15, txt:{ru:'+15% крит. урона',en:'+15% crit dmg'}},
 {id:'db_cc',  val:0.05, txt:{ru:'+5% крит. шанса',en:'+5% crit chance'}},
 {id:'db_hp',  val:0.12, txt:{ru:'+12% коры',en:'+12% bark'}},
 {id:'db_seed',val:0.12, txt:{ru:'+12% семян',en:'+12% seeds'}},
 {id:'db_rad', val:0.08, txt:{ru:'+8% радиуса',en:'+8% radius'}}
];
const DEAL_DEBUFFS=[
 {id:'dd_dmg', val:0.22, txt:{ru:'−22% урона',en:'−22% dmg'}},
 {id:'dd_spd', val:0.20, txt:{ru:'−20% скорости атаки',en:'−20% atk speed'}},
 {id:'dd_hp',  val:0.22, txt:{ru:'−22% коры',en:'−22% bark'}},
 {id:'dd_cc',  val:0.12, txt:{ru:'−12% крит. шанса',en:'−12% crit chance'}},
 {id:'dd_rad', val:0.20, txt:{ru:'−20% радиуса',en:'−20% radius'}},
 {id:'dd_seed',val:0.25, txt:{ru:'−25% семян',en:'−25% seeds'}}
];
const M=k=>(S.muts||[]).includes(k);

/* Хранилище сделок: {buff:'db_…'|null, debuff:'dd_…'|null} */
function dealBuff(){return S.mutDeal&&S.mutDeal.buff;}
function dealDebuff(){return S.mutDeal&&S.mutDeal.debuff;}
function dealBuffVal(){const b=DEAL_BUFFS.find(x=>x.id===dealBuff());return b?b.val:0;}
function dealDebuffVal(){const d=DEAL_DEBUFFS.find(x=>x.id===dealDebuff());return d?d.val:0;}

function mutDmgMul(){let m=1;
 if(M('m_bark'))    m*=0.80;
 if(M('m_blade'))   m*=1.12;
 if(M('m_berserk')) m*=1.12;
 if(M('m_melee'))   m*=1.15;
 if(M('m_fog'))     m*=0.85;
 /* сделка: баф/дебаф на урон */
 if(dealBuff()==='db_dmg')   m*=1+dealBuffVal();
 if(dealDebuff()==='dd_dmg') m*=1-dealDebuffVal();
 return m;}

function mutIncomeMul(){let m=1;
 if(M('m_greed')) m*=1.15;
 if(M('m_vamp'))  m*=0.80;
 if(M('m_dew'))   m*=0.80;
 if(dealBuff()==='db_seed')   m*=1+dealBuffVal();
 if(dealDebuff()==='dd_seed') m*=1-dealDebuffVal();
 return m;}

function mutDewMul(){
 let m=1;
 if(M('m_dew')) m*=1.15;
 return m;}

function mutHpMul(){let m=1;
 if(M('m_acid'))    m*=0.80;
 if(M('m_bark'))    m*=1.15;
 if(M('m_blade'))   m*=0.75;
 if(M('m_overheat'))m*=0.85;
 if(dealBuff()==='db_hp')   m*=1+dealBuffVal();
 if(dealDebuff()==='dd_hp') m*=1-dealDebuffVal();
 return m;}

function mutTakenMul(){let m=1;
 if(M('m_berserk')) m*=1.20;
 return m;}

function mutAspdMul(){let m=1;
 if(M('m_frost'))    m*=0.85;
 if(M('m_berserk'))  m*=1.08;
 if(M('m_overheat')) m*=1.15;
 if(dealBuff()==='db_spd')   m*=1+dealBuffVal();
 if(dealDebuff()==='dd_spd') m*=1-dealDebuffVal();
 return m;}

function mutRangeMul(){let m=1;
 if(M('m_melee')) m*=0.75;
 if(dealBuff()==='db_rad')   m*=1+dealBuffVal();
 if(dealDebuff()==='dd_rad') m*=1-dealDebuffVal();
 return m;}

function mutCritAdd(){
 let c=0;
 if(M('m_critres')) c-=0.10;
 if(M('m_blade'))   c+=0.05;
 if(dealBuff()==='db_cc')   c+=dealBuffVal();
 if(dealDebuff()==='dd_cc') c-=dealDebuffVal();
 return c;}

function mutCritDmgAdd(){
 let c=0;
 if(M('m_critres')) c+=0.15;
 if(dealBuff()==='db_crit') c+=dealBuffVal();
 return c;}

/* Скорость врагов */
function mutEnemySpdMul(){let m=1;
 if(M('m_greed'))    m*=1.15;
 if(M('m_overheat')) m*=1.10;
 if(M('m_fog')&&waveT<10) m*=0.80;
 return m;}

/* HP обычных врагов */
function mutEnemyHpMul(){let m=1;
if(M('m_siege')) m*=1.20;
return m;}
const mutProjMul=()=>1;
function waveQuota(w){return Math.round(CONFIG.QUOTA(w)*(M('m_siege')?1.15:1));}
const TREE_SKINS={
oak:{name:{ru:'Древо-хранитель',en:'Guardian Tree'},style:'oak',cost:0,
trunk:['#6b5138','#4a3826'],canopy:['#2c5f41','#3a7a52','#4b9463','#5fae74'],
glow:'128,224,168',leafC:'142,196,140',leafKind:'leaf',orb:'#a9e8c4',fruit:'#f2cf7e',
svg:'<svg viewBox="0 0 40 44"><path d="M18 42v-14h4v14z" fill="#5d452e"/><circle cx="20" cy="18" r="11" fill="#3a7a52"/><circle cx="12" cy="22" r="7" fill="#2c5f41"/><circle cx="28" cy="22" r="7" fill="#2c5f41"/><circle cx="20" cy="12" r="7" fill="#5fae74"/></svg>'},
willow:{name:{ru:'Плакучая ива',en:'Weeping Willow'},style:'willow',cost:12,
trunk:['#5d6b4a','#3f4a33'],canopy:['#2f6b5e','#3f8a74','#57a88b','#79c4a4'],
glow:'120,220,200',leafC:'126,204,178',leafKind:'leaf',orb:'#b8f0dc',fruit:'#e6f7c9',
svg:'<svg viewBox="0 0 40 44"><path d="M18.5 42V24h3v18z" fill="#4a5638"/><ellipse cx="20" cy="16" rx="11" ry="8" fill="#3f8a74"/><path d="M10 18q-1 10-3 16M15 21q-1 9-2 15M25 21q1 9 2 15M30 18q1 10 3 16M20 22v14" stroke="#57a88b" stroke-width="2" fill="none" stroke-linecap="round"/></svg>'},
sakura:{name:{ru:'Цветущая сакура',en:'Blooming Sakura'},style:'sakura',cost:18,
trunk:['#7a5a4a','#54402f'],canopy:['#a85a74','#c97a92','#e59ab0','#f6bcd0'],
glow:'240,160,196',leafC:'240,150,180',leafKind:'petal',orb:'#ffd7e4',fruit:'#ff9ec0',
svg:'<svg viewBox="0 0 40 44"><path d="M18 42v-14h4v14z" fill="#54402f"/><circle cx="20" cy="17" r="11" fill="#c97a92"/><circle cx="11" cy="21" r="7.5" fill="#a85a74"/><circle cx="29" cy="21" r="7.5" fill="#a85a74"/><circle cx="20" cy="11" r="7.5" fill="#f6bcd0"/></svg>'},
rune:{name:{ru:'Руническое древо',en:'Rune Tree'},style:'rune',cost:20,
trunk:['#5a4a32','#3a2e1e'],canopy:['#2c5f41','#3a7a52','#4b9463','#5fae74'],
glow:'120,230,220',leafC:'150,210,150',leafKind:'leaf',orb:'#ffe39a',fruit:'#7fe8d8',
svg:'<svg viewBox="0 0 40 44"><path d="M16 42c0-8 1-12 4-16 3 4 4 8 4 16z" fill="#5a4a32"/><circle cx="20" cy="14" r="12" fill="#3a7a52"/><circle cx="20" cy="24" r="2" fill="#ffe39a"/><circle cx="14" cy="20" r="1.6" fill="#ffe39a"/><circle cx="26" cy="20" r="1.6" fill="#ffe39a"/><path d="M18 30l2-2 2 2M19 34l1-1 1 1" stroke="#7fe8d8" stroke-width="1" fill="none"/></svg>'},
mycelium:{name:{ru:'Гриб-кристалл',en:'Crystal Cap'},style:'mycelium',cost:24,
trunk:['#6b5a44','#473a2a'],canopy:['#1f6b62','#2f9a8c','#5fd6c4','#aef0e4'],
glow:'150,240,220',leafC:'170,240,225',leafKind:'spark',orb:'#d8c8ff',fruit:'#bfe9ff',
svg:'<svg viewBox="0 0 40 44"><path d="M17 42c0-7 1-10 3-13 2 3 3 6 3 13z" fill="#6b5a44"/><ellipse cx="20" cy="18" rx="14" ry="9" fill="#2f9a8c"/><circle cx="14" cy="16" r="2.4" fill="#aef0e4"/><circle cx="22" cy="14" r="3" fill="#aef0e4"/><circle cx="26" cy="19" r="2" fill="#aef0e4"/><path d="M9 9l2 2M30 8l-1 2" stroke="#d8c8ff" stroke-width="1.4" fill="none"/></svg>'},
ashvine:{name:{ru:'Пепельная лоза',en:'Ashvine'},style:'ashvine',cost:30,
trunk:['#2c2c2a','#161615'],canopy:['#1a2422','#243029','#2e3c34','#3a4a40'],
glow:'120,230,210',leafC:'150,230,210',leafKind:'spark',orb:'#9af0e0',fruit:'#cfeee8',
svg:'<svg viewBox="0 0 40 44"><path d="M20 42c-4-6-6-10-3-16 4-2 6-6 4-12 5 4 6 9 3 14 4 2 5 8-1 14z" fill="#2c2c2a"/><path d="M16 30q4-4 8 0M18 22q3-3 5 1" stroke="#7fe8d8" stroke-width="1.2" fill="none"/></svg>'}};
const maxHpOf=o=>{let hp=0;for(const n of SKDEF)if(n.stat==='sHp')hp+=((o.skill&&o.skill[n.k])||0);
return Math.round(CONFIG.STAT.hp(o.hpLvl||0)*(1+0.15*hp));};