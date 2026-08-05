'use strict';
function load(){
let d=null;
for(const k of [KEY]){
try{const p=JSON.parse(localStorage.getItem(k));if(p){d=p;break;}}catch(e){}}
const base={v:1,seeds:0,dew:0,amber:0,wave:1,killed:0,totalKills:0,
dmgLvl:0,spdLvl:0,hpLvl:0,radLvl:0,ccLvl:0,cdLvl:0,
treeHp:100,muted:false,shake:true,vol:1,lang:'ru',lastSeen:0,bestWave:1,seen:true,tipShop:false,amberTier:0,
abilities:{},equip:[],treeSkins:['oak'],treeSkin:'oak',skill:{},muts:[],mutWeek:0,
dailyDate:0,dailyDone:{},dailyProg:{kills:0,waves:0,spins:0,crits:0,upg:0},
waveQ:{prog:0,done:false,claimed:false},onceDone:{},chaptersCleared:0,huntKills:0,huntDone:0,
passDone:{},tutorialDone:false,tutPhase:'new',
speed:1,speed4Bought:false,musicVol:0,speedTutShown:false,showFps:false,
evoStage:0,evoBossActive:false,
gfx:{particles:'med',use3d:true,shadows:true,glow:true}};
if(d&&d.v===1){
const s=Object.assign(base,d);
['dmgLvl','spdLvl','hpLvl','radLvl','ccLvl','cdLvl','wave','killed','totalKills','bestWave','amberTier','chaptersCleared','huntKills','huntDone','evoStage']
.forEach(k=>{s[k]=safeInt(s[k], base[k]);});
if(s.wave<1)s.wave=1;if(s.bestWave<1)s.bestWave=1;
s.seeds=(typeof s.seeds==='number'&&isFinite(s.seeds))?s.seeds:0;
s.dew=(typeof s.dew==='number'&&isFinite(s.dew))?s.dew:0;
s.amber=(typeof s.amber==='number'&&isFinite(s.amber))?s.amber:0;
s.abilities=Object.assign({},d.abilities||{});
if(s.abilities.multishot!=null){s.abilities.seedshot=(s.abilities.seedshot||0)+s.abilities.multishot;delete s.abilities.multishot;}
delete s.abilities.bounce;
['leech','eternalbark','harvest','slow'].forEach(k=>{delete s.abilities[k];});
s.equip=(Array.isArray(d.equip)?d.equip:[]).filter(k=>ABIL_BY_K[k]&&k!=='seedshot'&&k!=='rootstrike'&&k!=='bounce').slice(0,6);
s.skill=Object.assign({},d.skill||{});
s.muts=Array.isArray(d.muts)?d.muts:[];
/* миграция: удалить несуществующие ID */
const validIds=MUTS.map(m=>m.id);
s.muts=s.muts.filter(id=>validIds.includes(id));
s.mutWeek=safeInt(d.mutWeek,0);
if(d.tutPhase){s.tutPhase=d.tutPhase;}
else if(d.tutorialActive){s.tutPhase='cards';}
else if(d.tutorialDone){s.tutPhase='done';}
else if((s.totalKills||0)>0||(s.dmgLvl||0)>0||s.wave>1){s.tutPhase='done';}
else{s.tutPhase='new';}
s.passDone=Object.assign({},d.passDone||{});
s.dailyProg=Object.assign({kills:0,waves:0,spins:0,crits:0,upg:0},d.dailyProg||{});
s.treeSkins=(Array.isArray(d.treeSkins)&&d.treeSkins.length)?d.treeSkins:['oak'];
s.treeSkin=(d.treeSkin&&TREE_SKINS[d.treeSkin])?d.treeSkin:'oak';
if(s.vol==null||isNaN(s.vol))s.vol=1;
if(s.shake==null)s.shake=true;
if(!s.lang)s.lang='ru';
if(s.speed==null)s.speed=1;
if(s.speed4Bought==null)s.speed4Bought=false;
if(s.musicVol==null)s.musicVol=0;
if(s.speedTutShown==null)s.speedTutShown=false;
 if(s.showFps==null)s.showFps=false;
if(s.evoStage==null)s.evoStage=0;
if(s.evoBossActive==null)s.evoBossActive=false;
if(!s.gfx||typeof s.gfx!=='object')s.gfx={particles:'med',use3d:true,shadows:true,glow:true};
const L=s.dmgLvl+s.spdLvl+s.hpLvl+s.radLvl+s.ccLvl+s.cdLvl;
if(d.amber===undefined){s.amberTier=Math.floor(L/50);s.amber=5*s.amberTier;}
if(s.treeHp<=0||isNaN(s.treeHp))s.treeHp=maxHpOf(s);
s.treeHp=Math.min(s.treeHp,maxHpOf(s));
return s;}
base.seen=false;return base;
}
let S=load();
S.over=false;S.shieldHp=0;S.twinUsed=false;S.twinPenalty=!!S.twinPenalty;
function save(){try{localStorage.setItem(KEY,JSON.stringify({v:1,seeds:S.seeds,dew:S.dew,amber:S.amber,
wave:S.wave,killed:S.killed,totalKills:S.totalKills,dmgLvl:S.dmgLvl,spdLvl:S.spdLvl,hpLvl:S.hpLvl,
radLvl:S.radLvl,ccLvl:S.ccLvl,cdLvl:S.cdLvl,
treeHp:S.treeHp,muted:S.muted,shake:S.shake,vol:S.vol,lang:S.lang,lastSeen:Date.now(),bestWave:S.bestWave,seen:true,tipShop:S.tipShop,
amberTier:S.amberTier,abilities:S.abilities,equip:S.equip,treeSkins:S.treeSkins,treeSkin:S.treeSkin,skill:S.skill,
muts:S.muts,mutWeek:S.mutWeek,twinPenalty:S.twinPenalty,
dailyDate:S.dailyDate,dailyDone:S.dailyDone,dailyProg:S.dailyProg,
waveQ:S.waveQ,onceDone:S.onceDone,chaptersCleared:S.chaptersCleared,
huntKills:S.huntKills,huntDone:S.huntDone,passDone:S.passDone,
tutorialDone:S.tutorialDone,tutPhase:S.tutPhase,
speed:S.speed,speed4Bought:S.speed4Bought,musicVol:S.musicVol,speedTutShown:S.speedTutShown,showFps:S.showFps,
evoStage:S.evoStage,evoBossActive:S.evoBossActive,gfx:S.gfx}));}catch(e){}}
const treeDmgPct=()=>0.10*statCount('sRoot')+0.25*statCount('sAllDmg')+0.10*statCount('sSeedDmg');
const treeSpdPct=()=>0.08*statCount('sSpd')+0.20*statCount('sAllSpd');
const treeHpPct=()=>0.15*statCount('sHp');
const treeRadPct=()=>0.10*statCount('sRad');
const treeCritPct=()=>0.05*statCount('sCrit');
const treeCritDmgPct=()=>0.10*statCount('sCritDmg');
const baseDmg=()=>CONFIG.STAT.dmg(S.dmgLvl);
const coreDmg=()=>baseDmg()*(1+treeDmgPct())*mutDmgMul();
const seedMul=()=>1+(abilPct('thorns')+abilPct('avatar')+statCount('sSeedDmg'))/100;
const rootMul=()=>1+(abilPct('deeproots')+abilPct('avatar')+statCount('sDeep')+statCount('sRootDmg'))/100;
const treeAspd=()=>Math.min(CONFIG.STAT.spdCap, CONFIG.STAT.spd(S.spdLvl)*(1+treeSpdPct()))*mutAspdMul();
const rootAspd=()=>Math.min(CONFIG.STAT.spdCap, CONFIG.STAT.spd(S.spdLvl)*(1+treeSpdPct())*0.9)*mutAspdMul();
const treeMaxHp=()=>Math.round(maxHpOf(S)*mutHpMul());
const rootReachCap=()=>Math.min(W,H/ISO)*0.375;
const rootReach=()=>clamp(CONFIG.STAT.rad(S.radLvl)*(1+treeRadPct()),85,rootReachCap())*mutRangeMul();
const critChance=()=>Math.max(0,Math.min(CONFIG.STAT.ccCap, CONFIG.STAT.cc(S.ccLvl)+treeCritPct()+mutCritAdd()));
const critMult=()=>Math.min(CONFIG.STAT.cdCap, CONFIG.STAT.cd(S.cdLvl)+treeCritDmgPct()+mutCritDmgAdd());
let FRR=85;
const inReach=(e,extra)=>{const rr=FRR+e.r+(extra||0);return e.x*e.x+e.y*e.y<=rr*rr;};
function costOne(k,L){return Math.ceil(CONFIG.UPG.base[k]*Math.pow(1+CONFIG.UPG.KC*L, CONFIG.UPG.EXP));}
function costRange(k,from,n){let s=0;for(let i=0;i<n;i++)s+=costOne(k,from+i);return s;}
function maxAfford(k){const cur=S[k+'Lvl']||0;let n=0,spent=0;
while(n<50000 && cur+n<CONFIG.UPG.LVL_CAP){const c=costOne(k,cur+n);if(spent+c>S.seeds)break;spent+=c;n++;}
return {n,spent};}
let buyMul=1;
function treeGeom(){
const stage=S.evoStage||0;
const tv=CONFIG.EVO.T[clamp(stage,0,CONFIG.EVO.T.length-1)];
return { h:24+20*tv, R:12+12*tv, stage, tv, L:250*tv };}
function afkRate(){const dps=baseDmg()*Math.min(CONFIG.STAT.spdCap,CONFIG.STAT.spd(S.spdLvl));
const G=chapterOf(S.wave);const avgHp=12*enemyScaleHP(G)*1.8,avgRw=6.5*enemyScaleRW(G)*1.6;
return dps/avgHp*avgRw*CONFIG.AFK_RATE_K;}
function chapterReward(ch){if(ch%10===0)return 50;if(ch%5===0)return 40;if(ch%3===0)return 30;return 20;}
let afkReward=0,afkDew=0,afkSec=0;
if(S.seen&&S.lastSeen){const el=(Date.now()-S.lastSeen)/1000;
if(el>90){afkSec=Math.min(el,(3+statCount('sAfkT'))*3600);
afkReward=Math.floor(afkRate()*afkSec);
afkDew=Math.min(12,Math.floor(afkSec/1800));}}