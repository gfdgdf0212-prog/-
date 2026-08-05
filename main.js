'use strict';
let THREE=null;
function startGame(){
Tree3D.init();
applyTreeSkin();
ensureMutUI();
resize();ensureDaily();applyLang();refreshTutUI();syncMulRowUI();updateTutHighlights();updateHUD();updateEvoBtn();
if(afkReward>0){
const at=$('#afkTime');if(at)at.textContent=fmtTime(afkSec);
const aa=$('#afkAmount');if(aa)aa.textContent='+'+fmt(afkReward);
if(afkDew>0){const dr=$('#afkDewRow');if(dr)dr.style.display='flex';
const ad=$('#afkDew');if(ad)ad.textContent='+'+afkDew;}
open('#afkOverlay');}
else if(!S.seen){S.seeds=500;S.dew=0;S.seen=true;save();updateHUD();}
if(S.tutorialDone&&S.mutWeek!==weekKey()&&!$('#mutOverlay').classList.contains('open')){
setTimeout(openMutChoice,1500);}
banner(t('stage')+' '+stageOf(S.wave),t('protect'),false);
requestAnimationFrame(tt=>{last=tt;loop(tt);});
setInterval(save,5000);
addEventListener('beforeunload',save);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});
}
(async()=>{
try{THREE=await import('three');}catch(e){console.warn('Three.js не загрузился — используется 2D-дерево',e);}
startGame();
})();