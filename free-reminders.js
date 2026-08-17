(()=>{
const KEY='blocks-reminders-v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}};
const save=a=>localStorage.setItem(KEY,JSON.stringify(a));
function parse(text,now=new Date()){
 text=(text||'').trim();let when=null,m,matched='';
 const tests=[
  [/(?:через\s+)?полтора\s+часа/i,()=>90],
  [/(?:через\s+)?пол(?:\s*)часа|через\s+30\s*(?:мин|минут)/i,()=>30],
  [/через\s+(\d+(?:[.,]\d+)?)\s*(?:час|часа|часов|ч)/i,x=>Math.round(parseFloat(x[1].replace(',','.'))*60)],
  [/через\s+(\d+)\s*(?:мин|минут|минуты)/i,x=>parseInt(x[1],10)]
 ];
 for(const [re,mins] of tests){m=text.match(re);if(m){matched=m[0];when=new Date(now.getTime()+mins(m)*60000);break}}
 if(!when&&(m=text.match(/завтра(?:\s+в)?\s+(\d{1,2})(?::(\d{2}))?/i))){matched=m[0];when=new Date(now);when.setDate(when.getDate()+1);when.setHours(+m[1],+(m[2]||0),0,0)}
 if(!when&&(m=text.match(/(?:сегодня\s+)?(?:в\s*)?(?:к\s*)?(\d{1,2})[:.](\d{2})/i))){matched=m[0];when=new Date(now);when.setHours(+m[1],+m[2],0,0);if(when<=now)when.setDate(when.getDate()+1)}
 if(!when)return null;
 const label=text.replace(matched,'').replace(/^[\s,.:;—-]+|[\s,.:;—-]+$/g,'').trim()||text;
 return{when:when.getTime(),label};
}
function fmt(ts){const d=new Date(ts),n=new Date(),t=new Date();t.setDate(t.getDate()+1);const day=d.toDateString()===n.toDateString()?'Сегодня':d.toDateString()===t.toDateString()?'Завтра':d.toLocaleDateString('ru-RU',{day:'2-digit',month:'2-digit'});return `${day}, ${d.toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'})}`}
function allFree(){try{return typeof freeNotes!=='undefined'&&Array.isArray(freeNotes)?freeNotes:[]}catch(e){return[]}}
function allBlocks(){try{return typeof blocks!=='undefined'&&Array.isArray(blocks)?blocks:[]}catch(e){return[]}}
function findBlock(text){const low=(text||'').toLowerCase();return allBlocks().filter(b=>b.title&&low.includes(String(b.title).toLowerCase())).sort((a,b)=>String(b.title).length-String(a.title).length)[0]||null}
function syncFreeNotes(showMessage=false){
 const notes=allFree(),arr=load();let changed=false,created=null;
 notes.forEach(n=>{const p=parse(n.text);let r=arr.find(x=>x.freeNote&&x.noteId===n.id&&!x.done);if(!p)return;if(r&&r.source===n.text)return;const b=findBlock(n.text);if(!r){r={id:'r'+Date.now()+Math.random().toString(36).slice(2,6),noteId:n.id,freeNote:true,done:false,fired:false,createdAt:Date.now()};arr.push(r)}Object.assign(r,{blockId:b?.id||'FREE',blockTitle:b?.title||'',text:p.label,source:n.text,when:p.when,fired:false,updatedAt:Date.now()});changed=true;created=r});
 if(changed){save(arr);if(showMessage&&created&&typeof showToast==='function')showToast(`🔔 Напоминание создано: ${fmt(created.when)}`)}
 return changed;
}
function counts(){const arr=load(),now=Date.now(),active=arr.filter(r=>!r.done),due=active.filter(r=>r.when<=now);const bs=allBlocks(),attention=bs.filter(b=>b.status!=='done'&&(b.nextAction||b.waitingFor||b.currentState)).length,waiting=bs.filter(b=>b.status!=='done'&&b.waitingFor).length;return{active:active.length,due:due.length,attention,waiting}}
function ensureDashboard(){
 const main=document.getElementById('main');if(!main)return;let dash=document.getElementById('persistentTodayDash');
 if(!dash){dash=document.createElement('section');dash.id='persistentTodayDash';dash.className='ops-dash';main.prepend(dash)}
 const c=counts();dash.innerHTML=`<div class="ops-dash-title">Сегодня</div><div class="ops-dash-cards"><button type="button"><b>${c.attention}</b><span>требуют внимания</span></button><button type="button"><b>${c.waiting}</b><span>ожидают</span></button><button type="button"><b>${c.active}</b><span>напоминаний</span></button><button type="button"><b>${c.due}</b><span>просрочено</span></button></div>`;
 const old=[...main.querySelectorAll('.ops-dash')].filter(x=>x.id!=='persistentTodayDash');old.forEach(x=>x.remove());
}
function tick(show=false){const changed=syncFreeNotes(show);ensureDashboard();if(changed&&'Notification'in window&&Notification.permission==='default')try{Notification.requestPermission()}catch(e){}}
// Не зависим от submitNote: после сохранения сканируем сами данные свободных заметок.
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('button');if(b&&b.closest('#modalBgNote')&&/сохранить/i.test(b.textContent||''))setTimeout(()=>tick(true),120)},true);
const main=document.getElementById('main');if(main)new MutationObserver(()=>{clearTimeout(window.__freeReminderDashTimer);window.__freeReminderDashTimer=setTimeout(()=>{syncFreeNotes(false);ensureDashboard()},30)}).observe(main,{childList:true});
setInterval(()=>tick(false),1000);tick(false);
})();