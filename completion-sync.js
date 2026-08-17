(()=>{
function allBlocks(){try{return typeof blocks!=='undefined'&&Array.isArray(blocks)?blocks:[]}catch(e){return[]}}
function normalizeCompleted(){let changed=false;allBlocks().forEach(b=>{if(b.status!=='done')return;const needs=b.currentState!=='Завершено'||b.waitingFor||b.nextAction||b.controlDate||!b.smart?.completed;if(needs){b.currentState='Завершено';b.waitingFor='';b.nextAction='';b.controlDate='';b.smart={...(b.smart||{}),place:'',waiting:'',action:'',completed:true,completedAt:b.smart?.completedAt||Date.now()};changed=true}});if(changed&&typeof saveBlocks==='function')saveBlocks();return changed}
function activeCount(){return allBlocks().filter(b=>b.status!=='done').length}
function patchCounters(){const n=activeCount();document.querySelectorAll('.tab,.rchip').forEach(el=>{const txt=el.textContent||'';if(/^\s*Все\s*[·•]/i.test(txt)){const label=txt.replace(/[·•]\s*\d+.*/,'').trim();el.innerHTML=`${label} · ${n}`}})}
function patchDoneCards(){allBlocks().filter(b=>b.status==='done').forEach(b=>{try{b.currentState='Завершено';b.waitingFor='';b.nextAction='';b.smart={...(b.smart||{}),place:'',waiting:'',action:'',completed:true}}catch(e){}})}
function sync(){const changed=normalizeCompleted();patchDoneCards();patchCounters();if(changed&&typeof renderList==='function')renderList()}
const oldBuild=window.buildCardHtml;if(typeof oldBuild==='function')window.buildCardHtml=function(b){if(b?.status==='done'){b.currentState='Завершено';b.waitingFor='';b.nextAction='';b.smart={...(b.smart||{}),place:'',waiting:'',action:'',completed:true}}return oldBuild.apply(this,arguments)};
const oldSave=window.saveBlocks;if(typeof oldSave==='function')window.saveBlocks=function(){normalizeCompleted();const out=oldSave.apply(this,arguments);setTimeout(patchCounters,0);return out};
document.addEventListener('change',()=>setTimeout(sync,40),true);document.addEventListener('click',()=>setTimeout(sync,80),true);
const main=document.getElementById('main');if(main)new MutationObserver(()=>{clearTimeout(window.__completionSync);window.__completionSync=setTimeout(()=>{patchDoneCards();patchCounters()},25)}).observe(document.body,{childList:true,subtree:true});
setInterval(()=>{normalizeCompleted();patchCounters()},1000);sync();
})();