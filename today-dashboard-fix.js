(()=>{
const KEY='blocks-reminders-v1';
function bs(){try{return Array.isArray(blocks)?blocks:[]}catch(e){return[]}}
function rs(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return[]}}
function vals(){const a=bs().filter(b=>b.status!=='done'),r=rs().filter(x=>!x.done);return[a.filter(b=>b.nextAction||b.smart?.action||b.waitingFor||b.smart?.waiting).length,a.filter(b=>b.waitingFor||b.smart?.waiting).length,r.length,r.filter(x=>x.when<=Date.now()).length]}
function make(){const d=document.createElement('section');d.id='persistentTodayDash';d.className='ops-dash persistent-today';d.innerHTML='<div class="ops-dash-title">СЕГОДНЯ</div><div class="ops-dash-cards"><button type="button" data-ops-kind="attention"><b>0</b><span>требуют внимания</span></button><button type="button" data-ops-kind="waiting"><b>0</b><span>ожидают</span></button><button type="button" data-ops-kind="reminders"><b>0</b><span>напоминаний</span></button><button type="button" data-ops-kind="due"><b>0</b><span>просрочено</span></button></div>';return d}
function ensure(){let d=document.getElementById('persistentTodayDash');const main=document.querySelector('main');if(!main)return null;if(!d){d=make();main.insertBefore(d,main.firstChild)}else if(d.parentNode!==main){main.insertBefore(d,main.firstChild)}const v=vals();d.querySelectorAll('[data-ops-kind]').forEach((b,i)=>{const n=b.querySelector('b');if(n)n.textContent=String(v[i]??0)});return d}
function schedule(){clearTimeout(window.__todayEnsure);window.__todayEnsure=setTimeout(ensure,10)}
document.addEventListener('click',e=>{const b=e.target.closest?.('#persistentTodayDash [data-ops-kind]');if(b){e.preventDefault();e.stopPropagation();if(typeof openOpsList==='function')openOpsList(b.dataset.opsKind)}schedule()},true);
new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)ensure()});
window.addEventListener('pageshow',ensure);setInterval(ensure,1000);ensure();setTimeout(ensure,100);setTimeout(ensure,500);
})();