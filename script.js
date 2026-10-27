(() => {
 const buttons=document.querySelectorAll('[data-language]');
 function setLanguage(lang){
  lang=lang==='zh'?'zh':'en';
  document.documentElement.lang=lang==='zh'?'zh-CN':'en';
  document.querySelectorAll('[data-en][data-zh]').forEach(el=>{el.textContent=el.dataset[lang]});
  document.querySelectorAll('[data-en-label]').forEach(el=>{const label=el.dataset[lang+'Label'];el.setAttribute('aria-label',label);el.title=label});
  buttons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.language===lang)));
  document.title=lang==='en'?'Guopeng Zhong':'钟国鹏 · Guopeng Zhong';
  try{localStorage.setItem('lang',lang)}catch(e){}
 }
 buttons.forEach(button=>button.addEventListener('click',()=>setLanguage(button.dataset.language)));
 // System / light / dark. "System" removes data-theme so the CSS follows prefers-color-scheme.
 const themeButtons=document.querySelectorAll('[data-theme-choice]');
 function setTheme(choice){
  choice=choice==='light'||choice==='dark'?choice:'system';
  if(choice==='system')delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme=choice;
  themeButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.themeChoice===choice)));
  try{choice==='system'?localStorage.removeItem('theme'):localStorage.setItem('theme',choice)}catch(e){}
 }
 themeButtons.forEach(button=>button.addEventListener('click',()=>setTheme(button.dataset.themeChoice)));
 setTheme(document.documentElement.dataset.theme);
 const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 document.querySelectorAll('[data-scroll-top]').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();
  window.scrollTo({top:0,behavior:reduced()?'instant':'smooth'});
  history.replaceState(null,'','#main');
 }));
 // Underline the nav item for the section currently in view.
 const links=new Map([...document.querySelectorAll('.topbar nav a')].map(a=>[a.hash.slice(1),a]));
 const sections=[...links.keys()].map(id=>document.getElementById(id)).filter(Boolean);
 function markCurrent(){
  const line=window.innerHeight*0.35;
  let current=null;
  sections.forEach(section=>{if(section.getBoundingClientRect().top<=line)current=section.id});
  if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-2)current=sections[sections.length-1]?.id;
  links.forEach((a,id)=>a.setAttribute('aria-current',String(id===current)));
 }
 window.addEventListener('scroll',markCurrent,{passive:true});
 window.addEventListener('resize',markCurrent);
 let saved=null;
 try{saved=localStorage.getItem('lang')}catch(e){}
 setLanguage(saved||'en');
 markCurrent();
})();
