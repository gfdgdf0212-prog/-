'use strict';
/* ── МУЗЫКА: генеративная мелодия вместо дрона (lookahead-секвенсор) ── */
let AC=null;const lastSnd={};
const Music=(()=>{
let master=null,timer=null,cur16=0,nextT=0,bpm=100,chordDeg=0,patIdx=0;
const ROOT=57;
const PENT=[0,3,5,7,10,12,15,17,19,22,24,27];
const PROG=[0,3,4,2];
const PATTERNS=[
[0,2,4,2,5,4,2,0],
[0,4,5,7,5,4,2,4],
[2,4,5,4,2,0,-1,0],
[7,5,4,5,4,2,0,2],
[0,-1,2,-1,4,-1,5,4]];
const midi=m=>440*Math.pow(2,(m-69)/12);
const hum=v=>v*(0.85+Math.random()*0.3);
const jit=()=>(Math.random()*2-1)*0.014;
function ensure(){if(!AC)return false;
if(!master){master=AC.createGain();master.gain.value=(S.musicVol||0)*0.5;master.connect(AC.destination);}
return true;}
function note(m,t0,dur,type,vel){if(!AC||!master)return;
const o=AC.createOscillator(),g=AC.createGain();
o.type=type;o.frequency.setValueAtTime(midi(m),t0);
g.gain.setValueAtTime(0.0001,t0);
g.gain.exponentialRampToValueAtTime(Math.max(0.0002,vel),t0+0.02);
g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
o.connect(g);g.connect(master);o.start(t0);o.stop(t0+dur+0.06);}
function tickS(t0,vel){if(!AC||!master)return;
const o=AC.createOscillator(),g=AC.createGain(),f=AC.createBiquadFilter();
o.type='square';o.frequency.value=1800+Math.random()*700;
f.type='highpass';f.frequency.value=1200;
g.gain.setValueAtTime(vel,t0);g.gain.exponentialRampToValueAtTime(0.0001,t0+0.05);
o.connect(f);f.connect(g);g.connect(master);o.start(t0);o.stop(t0+0.08);}
function schedule16(s,t0){
const bar=Math.floor(s/16),beat=s%16;
if(s%32===0){chordDeg=PROG[Math.floor(bar/2)%PROG.length];
if(bar%8===0){bpm=96+Math.floor(Math.random()*15);patIdx=Math.floor(Math.random()*PATTERNS.length);}}
const cN=[PENT[chordDeg],PENT[chordDeg+2],PENT[chordDeg+4]];
const barDur=4*60/bpm;
if(beat===0){for(const n of cN)note(ROOT+n,t0+jit(),barDur*1.9,'sine',hum(0.026));
note(ROOT-12+cN[0],t0,0.32,'triangle',hum(0.05));}
if(beat===8){note(ROOT-12+cN[0],t0,0.3,'triangle',hum(0.045));}
if(beat%2===0){
const pi=(beat/2)%8;
let deg=PATTERNS[patIdx][pi];
if(deg>=0){
if(Math.random()<0.12)deg+=1;
if(!(Math.random()<0.1)){
let m=ROOT+12+PENT[deg];
if(Math.random()<0.15)m+=12;
const dur=(pi===6?0.5:0.24);
note(m,t0+jit(),dur,'triangle',hum(0.05));
if(Math.random()<0.25)note(m+12,t0+jit(),dur*0.6,'sine',hum(0.018));}}}
if(beat%4===2&&Math.random()<0.45)tickS(t0+jit(),0.011);
if(Math.random()<0.05)note(ROOT+24+PENT[Math.floor(Math.random()*5)],t0+jit(),0.7,'sine',hum(0.02));}
function start(){if(timer)return;if(!AC)return;if(!ensure())return;
if(AC.state==='suspended')AC.resume();
cur16=0;nextT=AC.currentTime+0.1;
timer=setInterval(()=>{if(!AC)return;
while(nextT<AC.currentTime+0.28){schedule16(cur16,nextT);nextT+=60/bpm/4;cur16++;}},120);}
function stop(){if(timer){clearInterval(timer);timer=null;}}
function setVol(v){if(AC&&master)try{master.gain.setTargetAtTime(v*0.5,AC.currentTime,0.25);}catch(e){}
if(v>0){if(AC)start();}
else stop();}
return{start,stop,setVol};
})();
function applyMusicVol(){Music.setVol(S.musicVol||0);}
function ac(){try{if(!AC)AC=new(window.AudioContext||window.webkitAudioContext)();
if(AC.state==='suspended')AC.resume();
if((S.musicVol||0)>0)Music.start();
}catch(e){}return AC;}
function tone(f,d,type,v,slide,delay){if(S.muted)return;const a=ac();if(!a)return;
v=(v||.1)*(S.vol==null?1:S.vol);if(v<=0)return;
const t0=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
o.type=type||'sine';o.frequency.setValueAtTime(f,t0);
if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,f+slide),t0+d);
g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.0001,t0+d);
o.connect(g);g.connect(a.destination);o.start(t0);o.stop(t0+d+.02);}
const th=(k,ms)=>{const n=performance.now();if(lastSnd[k]&&n-lastSnd[k]<ms)return false;lastSnd[k]=n;return true;};
const sfx={
shoot(){if(th('sh',70))tone(680,.07,'triangle',.035,-240);},
hit(){if(th('ht',60))tone(200,.06,'square',.03,-60);},
crit(){tone(660,.07,'square',.05,200);tone(990,.09,'square',.04,120,.04);},
kill(){tone(520,.08,'triangle',.06,140);tone(880,.1,'triangle',.05,80,.05);},
boss(){tone(120,.5,'sawtooth',.08,-50);tone(66,.6,'sine',.09,-10,.05);},
wave(){tone(196,.25,'sine',.07);tone(262,.3,'sine',.06,0,.12);},
hurt(){if(th('hr',150))tone(98,.14,'sawtooth',.05,-30);},
upgrade(){tone(392,.1,'sine',.08);tone(523,.12,'sine',.07,0,.08);tone(659,.16,'sine',.07,0,.16);},
dig(){if(th('dg',90))tone(80+Math.random()*30,.18,'sine',.05,40);},
strike(){tone(70,.22,'sine',.11,-25);tone(180,.09,'triangle',.05,-60,.04);},
branch(){if(th('br',200))tone(320,.12,'sawtooth',.04,-200);},
leaf(){for(let i=0;i<3;i++)tone(880+i*140,.06,'triangle',.03,-260,i*.05);},
tick(){tone(1150,.03,'square',.025);},
flip(){tone(520,.05,'triangle',.04,120);},
claim(){tone(523,.1,'triangle',.08);tone(784,.18,'triangle',.07,0,.09);},
squirrel(){tone(880,.06,'sine',.07,200);tone(1320,.1,'sine',.06,120,.05);},
cast(){tone(440,.08,'triangle',.05,160);tone(660,.1,'sine',.04,0,.05);},
boom(){tone(90,.3,'sawtooth',.09,-40);tone(150,.12,'square',.05,-80,.02);},
summon(){tone(100,.6,'sawtooth',.1,-30);tone(150,.4,'sine',.08,20,.1);tone(200,.3,'triangle',.06,40,.2);},
mut(){tone(220,.3,'sawtooth',.07,60);tone(330,.3,'sine',.06,-40,.1);tone(440,.4,'triangle',.06,30,.2);},
reveal(tier){const seq={common:[440],rare:[440,587],epic:[440,587,740],legendary:[392,523,659,880],mythic:[392,523,659,880,1175]}[tier]||[440];
seq.forEach((f,i)=>tone(f,.18,'triangle',.08,0,i*.09));
if(tier==='legendary'||tier==='mythic')tone(80,.5,'sine',.12,-20);},
over(){tone(220,.4,'sine',.09,-120);tone(110,.7,'sine',.08,-40,.25);}};
document.addEventListener('pointerdown',()=>ac());
