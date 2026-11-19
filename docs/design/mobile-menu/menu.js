
const toggle=document.querySelector('.study-toggle');
const panel=document.querySelector('.study-panel');
const backdrop=document.querySelector('.study-backdrop');
let previousOverflow='';
function setOpen(open) {
 toggle.setAttribute('aria-expanded',String(open));
 toggle.setAttribute('aria-label',open?'Κλείσιμο μενού':'Άνοιγμα μενού');
 panel.hidden=!open;backdrop.hidden=!open;
 if(open){previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';panel.querySelector('a,button').focus();}
 else{document.body.style.overflow=previousOverflow;toggle.focus();}
}
toggle.addEventListener('click',()=>setOpen(toggle.getAttribute('aria-expanded')!=='true'));
backdrop.addEventListener('click',()=>setOpen(false));
panel.querySelector('[data-dismiss]')?.addEventListener('click',()=>setOpen(false));
panel.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setOpen(false)));
document.addEventListener('keydown',e=>{
 if(toggle.getAttribute('aria-expanded')!=='true')return;
 if(e.key==='Escape')setOpen(false);
 if(e.key==='Tab'){
  const items=[toggle,...panel.querySelectorAll('a,button')];
  const index=items.indexOf(document.activeElement);
  const next=(index+(e.shiftKey?-1:1)+items.length)%items.length;
  e.preventDefault();items[next].focus();
 }
});
window.matchMedia('(min-width:768px)').addEventListener('change',e=>{if(e.matches&&toggle.getAttribute('aria-expanded')==='true')setOpen(false)});
if(new URLSearchParams(location.search).get('open')==='1')setOpen(true);
