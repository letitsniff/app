/* Render standalone mobile menu studies from the current live landing page.
   Usage: node generate.cjs /path/to/playwright-core */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require(process.argv[2] || 'playwright-core');
const out = __dirname;
const origin = 'https://letitsniff.gr';
const svg = (body, size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const icons = {
  book: svg('<path d="M12 7v14M3 3h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5v16h-5a4 4 0 0 0-4 2 4 4 0 0 0-4-2H3z"/>'),
  paw: svg('<ellipse cx="12" cy="16" rx="5" ry="4"/><ellipse cx="5" cy="9" rx="2" ry="3"/><ellipse cx="10" cy="5" rx="2" ry="3"/><ellipse cx="16" cy="5" rx="2" ry="3"/><ellipse cx="20" cy="10" rx="2" ry="3"/>'),
  user: svg('<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>'),
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>'),
  arrow: svg('<path d="m9 5 7 7-7 7"/>', 16),
  menu: svg('<path d="M4 6h16M4 12h16M4 18h16"/>', 22),
  close: svg('<path d="m6 6 12 12M18 6 6 18"/>', 22),
};
const links = [
  ['/blog/', 'Άρθρα & Οδηγοί', 'book', 'Πρακτικοί οδηγοί'],
  ['/ypiresies/', 'Υπηρεσίες', 'paw', 'Εκπαίδευση στην πόλη'],
  ['/o-alexandros/', 'Ο Αλέξανδρος', 'user', 'Η προσέγγισή μου'],
];
const variants = [
  { id:'1-dropdown', name:'Compact dropdown', kind:'dropdown' },
  { id:'2-side-panel', name:'Narrow side panel', kind:'side' },
  { id:'3-bottom-sheet', name:'Bottom sheet', kind:'bottom' },
];
const css = `
.study-header {position:sticky;top:0;z-index:50;background:#FDFAF5f5;border-bottom:1px solid #DDD0B366;backdrop-filter:blur(10px)}
.study-nav {height:56px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;max-width:1024px;margin:auto}
.study-brand {display:flex;align-items:center;gap:9px;font-family:var(--font-heading);font-size:18px;color:#2C1810;text-decoration:none}
.study-brand img {width:28px;height:28px}
.study-toggle {display:flex;align-items:center;justify-content:center;gap:8px;min-height:44px;min-width:44px;padding:0 8px;color:#2C1810;cursor:pointer;background:none;border:0;font-size:12px;font-weight:600}
.study-toggle [data-close] {display:none}
.study-toggle[aria-expanded=true] [data-close] {display:block}
.study-toggle[aria-expanded=true] [data-menu] {display:none}
.study-backdrop {position:fixed;inset:56px 0 0;background:#2C181012;z-index:60;border:0;padding:0;cursor:pointer}
.study-panel {position:fixed;z-index:70;background:#FDFAF5;border:1px solid #DDD0B3;border-radius:12px;box-shadow:0 12px 36px #2C18101c;color:#2C1810;padding:12px;max-height:calc(100dvh - 76px);overflow:auto}
.study-panel[hidden],.study-backdrop[hidden] {display:none}
.study-row {display:flex;align-items:center;gap:12px;padding:0 12px;min-height:48px;text-decoration:none;color:#2C1810;font-size:14px;line-height:1.35;border-radius:6px}
.study-row:hover {background:#F0E8D5}
.study-icon {color:#925C18;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.study-chevron {margin-left:auto;color:#7A654C;display:flex}
.study-contact {background:#2C1810;color:white;margin-top:10px;justify-content:center;gap:10px;font-weight:600;min-height:44px}
.study-contact:hover {background:#4A2E20}
.study-contact .study-icon {color:#E8A84A}
.study-dropdown {top:64px;left:12px;right:12px}
.study-dropdown .study-links .study-row + .study-row {border-top:1px solid #DDD0B355;border-radius:0}
.study-side {top:64px;right:12px;width:min(268px,calc(100% - 24px));padding:16px}
.study-eyebrow {margin:0 0 8px;padding:0 10px;font-size:10px;line-height:20px;letter-spacing:1.6px;font-weight:700;color:#925C18;text-transform:uppercase}
.study-side .study-row {padding:10px;min-height:62px}
.study-text {display:flex;flex-direction:column;gap:4px;font-weight:600}
.study-text small {font-size:11px;color:#6E5941;font-weight:400}
.study-side .study-contact {min-height:44px;margin-top:12px;padding:0 10px;font-size:13px}
.study-bottom {bottom:0;left:0;right:0;padding:8px 16px calc(20px + env(safe-area-inset-bottom));border-radius:18px 18px 0 0;border-bottom:0;max-height:calc(100dvh - 72px)}
.study-handle {width:32px;height:4px;border-radius:10px;background:#DDD0B3;margin:2px auto 8px}
.study-sheet-title {display:flex;justify-content:space-between;align-items:center;padding:0 4px;margin-bottom:8px}
.study-sheet-title p {font-family:var(--font-heading);font-size:18px;margin:0}
.study-sheet-title button {display:flex;align-items:center;justify-content:center;width:44px;height:44px;cursor:pointer;border:0;background:none;color:#6E5941}
.study-bottom .study-links {display:grid;grid-template-columns:1fr 1fr;gap:8px}
.study-bottom .study-row {display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:9px;padding:12px 14px;min-height:80px;background:#F9F5EC;border:1px solid #DDD0B388;font-size:13px;font-weight:600}
.study-bottom .study-row:hover {background:#F0E8D5}
.study-bottom .study-contact {margin:0;background:#2C1810;border-color:#2C1810;color:white}
.study-bottom .study-contact:hover {background:#4A2E20}
.study-bottom .study-chevron {display:none}
.study-desktop {display:none}
@media(min-width:768px) {.study-toggle {display:none}.study-desktop {display:flex;align-items:center;gap:24px;font-size:14px}.study-desktop a {color:#6E5941;text-decoration:none}.study-desktop a:last-child {padding:6px 16px;background:#2C1810;color:white;font-size:12px}.study-nav {height:64px}.study-panel,.study-backdrop {display:none!important}}
`;
const behavior = `
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
`;
function header(v, logo) {
 const rows=links.map(([href,label,icon,desc])=>`<a class="study-row" href="${origin}${href}"><span class="study-icon">${icons[icon]}</span>${v.kind==='side'?`<span class="study-text">${label}<small>${desc}</small></span>`:`<span>${label}</span>`}<span class="study-chevron">${icons.arrow}</span></a>`).join('');
 const contact=`<a class="study-row study-contact" href="${origin}/o-alexandros/#epikoinonia"><span class="study-icon">${icons.mail}</span><span>Επικοινωνία</span></a>`;
 const intro=v.kind==='side'?'<p class="study-eyebrow">Εξερευνήστε</p>':v.kind==='bottom'?`<div class="study-handle" aria-hidden="true"></div><div class="study-sheet-title"><p id="study-title">Πού θέλετε να πάμε;</p><button type="button" data-dismiss aria-label="Κλείσιμο μενού">${icons.close}</button></div>`:'';
 return `<header class="study-header"><nav class="study-nav" aria-label="Κύρια πλοήγηση"><a href="${origin}/" class="study-brand"><img src="${logo}" alt=""/><span>Let It Sniff</span></a><div class="study-desktop">${links.map(([href,label])=>`<a href="${origin}${href}">${label}</a>`).join('')}<a href="${origin}/o-alexandros/#epikoinonia">Επικοινωνία</a></div><button class="study-toggle" aria-label="Άνοιγμα μενού" aria-expanded="false" aria-controls="study-panel"><span>Μενού</span><span data-menu>${icons.menu}</span><span data-close>${icons.close}</span></button></nav></header><button class="study-backdrop" hidden tabindex="-1" aria-label="Κλείσιμο μενού"></button><div id="study-panel" class="study-panel study-${v.kind}" role="dialog" aria-modal="true" aria-label="Μενού πλοήγησης" hidden>${intro}<nav class="study-links" aria-label="Μενού κινητού">${rows}${v.kind==='bottom'?contact:''}</nav>${v.kind!=='bottom'?contact:''}</div>`;
}
(async()=>{
 await fs.mkdir(path.join(out,'assets'),{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||'/opt/google/chrome/chrome',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
 await page.goto(origin,{waitUntil:'networkidle'});
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:path.join(out,'0-current-closed.png')});
 await page.getByRole('button',{name:'Άνοιγμα μενού',exact:true}).click();
 await page.screenshot({path:path.join(out,'0-current-open.png')});
 const baseline = await page.locator('header').boundingBox();
 await page.getByRole('button',{name:'Κλείσιμο μενού',exact:true}).click();
 const snapshot=await page.evaluate(()=>{
  const styles=Array.from(document.styleSheets).map(sheet=>({url:sheet.href||location.href,css:Array.from(sheet.cssRules).map(rule=>rule.cssText).join('\n')}));
  const clone=document.documentElement.cloneNode(true);
  clone.querySelectorAll('script,link,style').forEach(el=>el.remove());
  clone.querySelectorAll('[src],[href],[srcset]').forEach(el=>{
   for(const attr of ['src','href'])if(el.hasAttribute(attr)){const value=el.getAttribute(attr);if(value&&!value.startsWith('#'))el.setAttribute(attr,new URL(value,location.href).href)}
   if(el.hasAttribute('srcset'))el.setAttribute('srcset',el.getAttribute('srcset').split(',').map(part=>{const [url,...rest]=part.trim().split(/\s+/);return new URL(url,location.href).href+' '+rest.join(' ')}).join(', '));
  });
  clone.querySelector('header').outerHTML='<!--STUDY_HEADER-->';
  return {html:'<!DOCTYPE html>\n'+clone.outerHTML,styles};
 });
 const cache=new Map();
 async function localize(url){
  if(cache.has(url))return cache.get(url);
  const promise=(async()=>{
   const response=await fetch(url);if(!response.ok)throw Error(`${response.status}: ${url}`);
   const ext=path.extname(new URL(url).pathname)||'.bin';
   const name=crypto.createHash('sha1').update(url).digest('hex').slice(0,12)+ext;
   await fs.writeFile(path.join(out,'assets',name),Buffer.from(await response.arrayBuffer()));
   return 'assets/'+name;
  })();cache.set(url,promise);return promise;
 }
 let originalCss='';
 for(const sheet of snapshot.styles){
  let text=sheet.css;
  const matches=[...text.matchAll(/url\(["']?([^\)"']+)["']?\)/g)];
  for(const match of matches){if(match[1].startsWith('data:'))continue;const url=new URL(match[1],sheet.url).href;text=text.replace(match[0],`url("${await localize(url)}")`)}
  originalCss+=text+'\n';
 }
 await fs.writeFile(path.join(out,'landing.css'),originalCss.replace(/[ \t]+$/gm,''));
 await fs.writeFile(path.join(out,'menu.css'),css);
 await fs.writeFile(path.join(out,'menu.js'),behavior);
 let html=snapshot.html;
 const imageUrls=[...new Set([...html.matchAll(/https:\/\/letitsniff\.gr\/(?:images|brand)\/[^"\s,<>]+/g)].map(match=>match[0]))];
 await Promise.all(imageUrls.map(async url=>{const local=await localize(url);html=html.split(url).join(local)}));
 const logo=await localize(origin+'/brand/logo_paw_64.png');
 const measurements={viewport:{width:390,height:844},current:{headerHeight:64,panelHeight:Math.round(baseline.height-64)},variants:[]};
 for(const v of variants){
  const document=html.replace('<!--STUDY_HEADER-->',header(v,logo)).replace('</head>',`<link rel="stylesheet" href="landing.css"/><link rel="stylesheet" href="menu.css"/></head>`).replace('</body>','<script src="menu.js"></script></body>');
  const file=path.join(out,v.id+'.html');await fs.writeFile(file,document);
  await page.goto('file://'+file,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:path.join(out,v.id+'-closed.png')});
  await page.getByRole('button',{name:'Άνοιγμα μενού',exact:true}).click();
  await page.locator('.study-panel').evaluate(el=>{el.querySelectorAll('a,button').forEach(a=>a.blur())});
  await page.screenshot({path:path.join(out,v.id+'-open.png')});
  const rect=await page.locator('.study-panel').boundingBox();
  measurements.variants.push({...v,width:Math.round(rect.width),height:Math.round(rect.height),visibleMenuAreaPercent:Math.round(rect.width*rect.height/(390*844)*100)});
  await page.keyboard.press('Escape');
  if(await page.locator('.study-panel').isVisible())throw Error('Escape failed: '+v.id);
  await page.getByRole('button',{name:'Άνοιγμα μενού',exact:true}).click();
  await page.locator('.study-backdrop').click({position:{x:4,y:400}});
  if(await page.locator('.study-panel').isVisible())throw Error('Backdrop failed: '+v.id);
  for(const width of [320,430]){
   await page.setViewportSize({width,height:844});
   await page.getByRole('button',{name:'Άνοιγμα μενού',exact:true}).click();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth);
   if(overflow)throw Error('Horizontal overflow '+v.id+' '+width);
   const tooSmall=await page.locator('.study-panel a').evaluateAll(els=>els.some(el=>el.getBoundingClientRect().height<44));
   if(tooSmall)throw Error('Small touch target '+v.id);
   await page.keyboard.press('Escape');
  }
  await page.setViewportSize({width:390,height:844});
 }
 await fs.writeFile(path.join(out,'measurements.json'),JSON.stringify(measurements,null,2)+'\n');
 await browser.close();
 console.log(JSON.stringify(measurements,null,2));
})().catch(error=>{console.error(error);process.exit(1)});
