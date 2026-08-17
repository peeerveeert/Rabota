(()=>{
function closeModal(bg){if(!bg)return;bg.classList.remove('show');document.body.style.overflow='';setTimeout(()=>{try{const inputs=bg.querySelectorAll('input,textarea');inputs.forEach(x=>x.blur())}catch(e){}},0)}
function isNewBlockModal(bg){if(!bg?.classList?.contains('modal-bg'))return false;const text=(bg.textContent||'').toLowerCase();return /нов(ый|ое)\s+(блок|изделие)|добавить\s+(блок|изделие)|создать\s+(блок|изделие)/i.test(text)}
function wire(){document.querySelectorAll('.modal-bg').forEach(bg=>{if(!isNewBlockModal(bg))return;bg.querySelectorAll('button').forEach(btn=>{if(!/^\s*отмена\s*$/i.test(btn.textContent||''))return;if(btn.dataset.cancelFixed)return;btn.dataset.cancelFixed='1';btn.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();closeModal(bg)},true)})})}
document.addEventListener('click',e=>{const btn=e.target.closest?.('button');if(!btn||!/^\s*отмена\s*$/i.test(btn.textContent||''))return;const bg=btn.closest('.modal-bg');if(!isNewBlockModal(bg))return;e.preventDefault();e.stopImmediatePropagation();closeModal(bg)},true);
new MutationObserver(()=>wire()).observe(document.body,{childList:true,subtree:true});wire();
})();