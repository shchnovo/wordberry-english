(function(){
'use strict';
const C=window.WordCore,course=window.WORD_COURSE,$=s=>document.querySelector(s);
const avatars={berry:'🫐',sun:'🌞',cat:'🐈',leaf:'🌿'};
const skillIcons={meaning:'translate',spelling:'pencil',listening:'volume',context:'message'};
const icons={home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',book:'<path d="M12 5v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z"/>',repeat:'<path d="M20 7H7a4 4 0 0 0-4 4m17-4-4-4m4 4-4 4M4 17h13a4 4 0 0 0 4-4M4 17l4 4m-4-4 4-4"/>',chart:'<path d="M4 3v18h17M8 17v-5m5 5V8m5 9V4"/>',settings:'<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3" fill="white"/><circle cx="16" cy="17" r="3" fill="white"/>',volume:'<path d="M3 9h4l5-4v14l-5-4H3ZM16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',pencil:'<path d="m4 16 12-12 4 4L8 20H4Zm9-9 4 4"/>',message:'<path d="M4 4h16v12H9l-5 4ZM8 8h8m-8 4h5"/>',translate:'<path d="M3 5h10M8 3v2m-3 4c2 4 5 6 8 7M11 5C10 10 7 14 3 16m12 4 4-10 4 10m-7-3h6"/>',arrow:'<path d="M4 12h16m-6-6 6 6-6 6"/>',back:'<path d="M20 12H4m6-6-6 6 6 6"/>',close:'<path d="m6 6 12 12M6 18 18 6"/>',check:'<path d="m5 12 4 4L19 6"/>',download:'<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',logout:'<path d="M9 4H4v16h5m3-8h9m-4-4 4 4-4 4"/>',plus:'<path d="M12 5v14M5 12h14"/>',mic:'<rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8"/>',eye:'<path d="M2 12c5-9 15-9 20 0-5 9-15 9-20 0Z"/><circle cx="12" cy="12" r="3"/>',help:'<circle cx="12" cy="12" r="9"/><path d="M9 9c0-4 6-4 6 0 0 2-3 2-3 4m0 4h.01"/>',clock:'<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',star:'<path d="m12 3 3 6 6 1-4 5 1 6-6-3-6 3 1-6-4-5 6-1Z"/>'};
const icon=(name)=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.star}</svg>`;
const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
const mascot=()=>`<svg class="mascot" viewBox="0 0 270 270" aria-hidden="true"><ellipse cx="139" cy="249" rx="88" ry="13" fill="#d9caee"/><path d="M97 72C85 24 116 10 143 36L141 77" fill="#a4bd8b" stroke="#6d895d" stroke-width="3"/><path d="M145 78C152 20 208 32 199 59L159 87" fill="#799c75" stroke="#5a7b57" stroke-width="3"/><path d="M64 130C9 127 20 194 67 182m138-56c48 1 47 55 4 51" fill="#9072c9" stroke="#655194" stroke-width="3"/><path d="M54 119C45 55 104 56 139 79c38-29 88-6 85 46-3 67-42 118-84 124-47-6-85-60-86-130Z" fill="#9473ce" stroke="#63508c" stroke-width="3"/><path d="M86 220q-7 26-23 30m123-31q8 26 24 27" fill="none" stroke="#63508c" stroke-width="12" stroke-linecap="round"/><ellipse cx="102" cy="132" rx="16" ry="20" fill="#fff"/><ellipse cx="174" cy="132" rx="16" ry="20" fill="#fff"/><ellipse class="eye" cx="105" cy="134" rx="7" ry="10" fill="#342843"/><ellipse class="eye" cx="170" cy="134" rx="7" ry="10" fill="#342843"/><ellipse cx="80" cy="159" rx="12" ry="7" fill="#c7a0d5"/><ellipse cx="195" cy="159" rx="12" ry="7" fill="#c7a0d5"/><path d="M119 169q20 21 39 0" fill="none" stroke="#45324f" stroke-width="4" stroke-linecap="round"/><path d="m42 48 4 11 11 3-11 4-4 11-3-11-11-4 11-3Zm196 146 4 11 10 3-10 3-4 11-3-11-11-3 11-3Z" fill="#fff" stroke="#c0addb" stroke-width="2"/></svg>`;
let profile=null,progress=C.emptyProgress(),mode='local',route='home',lessonId='starter-hello',authTab='login',cloudReady=false,inviteRequired=false,avatar='berry',pending=[],syncing=false,syncError='',syncTimer,toastTimer,modalReturnFocus,session=null,feedback=null,hinted=false,heard=false,studyMode='mix',wordLimit=5,wordSearch='',wordFilter='all',courseFilter='all',pageLimit=35,recording=null,recordedUrl=null,refreshing=false;
const STORAGE='wordberry:v1:';
function readJSON(key,fallback){try{return JSON.parse(localStorage.getItem(STORAGE+key))??fallback;}catch{return fallback;}}
function writeJSON(key,data){try{localStorage.setItem(STORAGE+key,JSON.stringify(data));return true;}catch{toast('Браузер не позволяет сохранить данные. Проверь свободное место и настройки хранения.');return false;}}
function cache(){if(!profile)return;writeJSON('cache:'+profile.id,{profile,progress,pending,mode});writeJSON('active',{id:profile.id,mode});}
function toast(message){const el=$('#toast');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),5500);}
function getLessons(){return C.allLessons(course,progress);}function getWords(){return C.allWords(course,progress);}function findLesson(id){return getLessons().find(l=>l.id===id);}function findWord(id){return getWords().find(w=>w.id===id);}function profiles(){return readJSON('local-profiles',[]);}
function plural(n,a,b,c){return n%10===1&&n%100!==11?a:n%10>=2&&n%10<=4&&(n%100<12||n%100>14)?b:c;}
function syncText(){return mode==='local'?'Только в этом браузере':syncError|| (pending.length?'Сохраняем ответы…':'Прогресс сохранён');}
function updateSync(){const el=$('#sync-state');if(el){el.className='sync-pill '+(syncError?'error':pending.length?'pending':'');el.innerHTML='<span class="sync-dot"></span>'+esc(syncText());}}
class ApiError extends Error{constructor(message,status){super(message);this.status=status;}}
async function api(action,data,keepalive=false){
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
 try{
  const res=await fetch('.netlify/functions/wordbook?action='+encodeURIComponent(action),{method:data?'POST':'GET',credentials:'same-origin',headers:data?{'Content-Type':'application/json'}:{},body:data?JSON.stringify(data):undefined,signal:controller.signal,cache:'no-store',keepalive});
  let answer;try{answer=await res.json();}catch{throw new ApiError('Сервис регистрации ещё не подключён.',res.status||503);}
  if(!res.ok)throw new ApiError(answer.error||'Не удалось сохранить. Попробуй ещё раз.',res.status);
  return answer;
 }catch(err){if(err instanceof ApiError)throw err;throw new ApiError('Нет связи. Ответы остаются в этом браузере до синхронизации.',0);}finally{clearTimeout(timer);}
}
function queueEvent(type,data){
 const event={id:crypto.randomUUID(),at:Date.now(),type,...data};progress=C.applyEvent(progress,event);
 if(mode==='cloud')pending.push(event);cache();updateSync();
 if(mode==='cloud'){clearTimeout(syncTimer);syncTimer=setTimeout(flush,800);}
 return event;
}
function eventBatch(limit=100,maxBytes=120000){
 const batch=[];let bytes=30;
 for(const event of pending){const size=JSON.stringify(event).length*2+2;if(batch.length>=limit||bytes+size>maxBytes)break;batch.push(event);bytes+=size;}
 return batch;
}
async function flush(){
 if(mode!=='cloud'||!profile||syncing||!pending.length)return !pending.length;
 syncing=true;const owner=profile.id;
 try{
  while(pending.length && profile?.id===owner){
   const batch=eventBatch(100,120000),data=await api('events',{events:batch});
   if(profile?.id!==owner)break;
   const ack=new Set(data.acked);pending=pending.filter(e=>!ack.has(e.id));progress=C.applyEvents(data.progress,pending);syncError='';cache();updateSync();
  }
 }catch(err){syncError=err.status===401?'Нужен повторный вход':'Нет связи · ответы сохранены здесь';cache();updateSync();}
 finally{syncing=false;}
 return pending.length===0;
}
function adoptRemote(data){
 cloudReady=true;profile=data.profile;mode='cloud';const cached=readJSON('cache:'+profile.id,null);pending=cached?.mode==='cloud'&&Array.isArray(cached.pending)?cached.pending:[];
 progress=C.applyEvents(data.progress,pending);syncError='';lessonId=progress.currentLesson;session=null;route='home';cache();render();if(pending.length)flush();
}
function modal(content,wide=false){
 closeModal(false);modalReturnFocus=document.activeElement;
 $('#modal-root').innerHTML=`<div class="modal-overlay"><section class="modal ${wide?'wide':''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><button class="icon-btn close" data-action="close-modal" aria-label="Закрыть">${icon('close')}</button>${content}</section></div>`;
 document.body.style.overflow='hidden';setTimeout(()=>$('#modal-root button, #modal-root input')?.focus(),0);
}
function stopRecording(){if(recording){try{recording.stop();recording.stream?.getTracks().forEach(t=>t.stop());}catch{}recording=null;}}
function closeModal(restore=true){stopRecording();if(recordedUrl){URL.revokeObjectURL(recordedUrl);recordedUrl=null;}$('#modal-root').innerHTML='';document.body.style.overflow='';if(restore)modalReturnFocus?.focus();}
function nav(to){closeModal();route=to;feedback=null;wordSearch='';pageLimit=35;render();window.scrollTo({top:0,behavior:'instant'});}
function btn(label,action,cls='primary',extra=''){return `<button class="btn ${cls}" data-action="${action}" ${extra}>${label}</button>`;}
function render(){if(!profile){renderAuth();return;}$('#app').innerHTML=shell();updateSync();}
function renderAuth(){
 const local=authTab==='local'||!cloudReady,register=authTab==='register',recover=authTab==='recover';
 const tabs=cloudReady?`<div class="auth-tabs">${['login','register'].map(t=>`<button class="auth-tab ${authTab===t?'active':''}" data-action="auth-tab" data-tab="${t}">${t==='login'?'Войти':'Создать профиль'}</button>`).join('')}</div>`:'';
 let form;
 if(local){
  form=`<h2>Как тебя зовут?</h2><p>Сделаем здесь твой уголок английского.</p><div class="notice">Этот профиль и его прогресс сохраняются только в текущем браузере. Для входа с другого устройства нужна регистрация на опубликованном сайте.</div><form id="local-form" class="auth-form mt"><div><label class="label" for="child-name">Имя</label><input id="child-name" class="field" name="name" maxlength="40" required placeholder="Например, Ульяна" autocomplete="given-name"></div><div><span class="label">Твой значок</span>${avatarPicker()}</div><div class="form-error" id="auth-error" role="alert"></div><button class="btn primary full big" type="submit">Начать учить слова ${icon('arrow')}</button></form>${profiles().length?'<p class="auth-foot">Или продолжить свой профиль:</p>'+profiles().map(p=>`<button class="saved-profile" data-action="local-login" data-id="${esc(p.id)}"><span class="avatar">${avatars[p.avatar]||'🫐'}</span><b>${esc(p.name)}</b><span class="spacer"></span>${icon('arrow')}</button>`).join(''):''}${cloudReady?btn('Вернуться ко входу','auth-tab','ghost full','data-tab="login"'):''}`;
 }else{
  form=`<h2>${register?'Твой личный профиль':recover?'Вернём доступ':'Продолжим английский?'}</h2><p>${register?'Твои слова и уроки будут ждать тебя на любом устройстве.':recover?'Понадобится код, который сохранили при регистрации.':'Войди, и начнём с того места, где ты остановилась.'}</p>${recover?'':tabs}<form id="auth-form" class="auth-form" data-kind="${register?'register':recover?'recover':'login'}">${register?'<div><label class="label" for="profile-name">Имя ребёнка</label><input id="profile-name" class="field" name="name" maxlength="40" required autocomplete="given-name" placeholder="Например, Ульяна"></div>':''}<div><label class="label" for="username">Логин</label><input id="username" class="field" name="username" required minlength="3" maxlength="24" pattern="[a-zA-Z][a-zA-Z0-9_-]{2,23}" autocapitalize="none" autocomplete="username" spellcheck="false" placeholder="Например, ulyana5" value="${esc(readJSON('last-username',''))}"></div>${recover?'<div><label class="label" for="recovery-input">Код восстановления</label><input id="recovery-input" class="field" name="recoveryCode" required autocomplete="off" spellcheck="false"></div>':''}<div><label class="label" for="password">${recover?'Новый пароль':'Пароль'}</label><div class="password-wrap"><input id="password" class="field" name="password" type="password" required ${register||recover?'minlength="8"':''} maxlength="128" autocomplete="${register||recover?'new-password':'current-password'}" placeholder="${register||recover?'Не меньше 8 символов':'Твой пароль'}"><button class="password-eye" type="button" data-action="password-eye" aria-label="Показать пароль">${icon('eye')}</button></div></div>${register?`<div><span class="label">Твой значок</span>${avatarPicker()}</div>${inviteRequired?'<div><label class="label" for="invite">Код регистрации от взрослого</label><input id="invite" class="field" name="invite" required autocomplete="off"></div>':''}`:''}<div class="form-error" id="auth-error" role="alert"></div><button type="submit" class="btn primary full big">${register?'Создать профиль':recover?'Обновить пароль':'Войти'} ${icon('arrow')}</button></form>${!register?`<button class="text-btn" data-action="auth-tab" data-tab="${recover?'login':'recover'}">${recover?'Вернуться ко входу':'Забыла пароль?'}</button>`:''}<p class="auth-foot">Достаточно имени или псевдонима. Почта, фамилия и школа не нужны.</p><div class="auth-local-option">${btn('Познакомиться без регистрации','auth-tab','ghost','data-tab="local"')}</div>`;
 }
 $('#app').innerHTML=`<div class="auth-layout"><section class="auth-story"><div class="brand"><span class="brand-mark">✦</span>wordberry</div><h1>Английский.<br>По твоим урокам.<br>В твоём темпе.</h1><p class="subtitle">Не просто узнать слово. Услышать, написать и сказать целую фразу.</p><div class="auth-skills">${['Перевод','Написание','На слух','В предложении'].map((s,i)=>`<span class="chip">${icon(Object.values(skillIcons)[i])} ${s}</span>`).join('')}</div><div class="auth-mascot">${mascot()}</div><p class="auth-caption">Spotlight 5 · 36 тематических уроков<br>Маленькие занятия. Заметный прогресс.</p></section><section class="auth-form-wrap" id="main"><div class="auth-box">${form}</div></section></div>`;
}
function avatarPicker(){return `<div class="avatar-choices">${Object.entries(avatars).map(([a,e])=>`<button class="avatar-choice ${avatar===a?'active':''}" data-action="avatar" data-avatar="${a}" type="button" aria-label="${a==='berry'?'Ягодка':a==='sun'?'Солнце':a==='cat'?'Кот':'Лист'}" aria-pressed="${avatar===a}">${e}</button>`).join('')}</div>`;}
function shell(){
 const navs=[['home','home','Сегодня'],['course','book','Мои уроки'],['review','repeat','Повторение'],['progress','chart','Прогресс'],['settings','settings','Настройки']];
 return `<div class="layout"><aside class="sidebar"><div class="brand"><span class="brand-mark">✦</span>wordberry</div><p class="brand-sub">ТВОЙ ENGLISH CLUB</p><nav class="nav" aria-label="Главное меню">${navs.map(([r,i,label])=>`<button class="nav-item ${route===r||r==='course'&&['lesson','train'].includes(route)?'active':''}" data-action="nav" data-route="${r}" ${route===r?'aria-current="page"':''}>${icon(i)}<span>${label}</span></button>`).join('')}</nav><div class="sidebar-bottom"><div class="tip-box"><span>🌱</span><div class="tip-title">Понемногу — каждый день</div>Слова любят встречи. Даже короткие.</div><div class="mini-profile"><span class="avatar">${avatars[profile.avatar]||'🫐'}</span><div><div class="name">${esc(profile.name)}</div><div class="kind">${mode==='cloud'?'Личный профиль':'Этот браузер'}</div></div><button class="btn ghost" data-action="switch-profile" aria-label="Сменить профиль">${icon('logout')}</button></div></div></aside><div class="main-wrap"><header class="topbar"><div class="desktop-date">Spotlight 5 <span style="padding:0 9px">/</span> ${esc(new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',timeZone:'Europe/Moscow'}).format(new Date()))}</div><div class="mobile-brand brand"><span class="brand-mark">✦</span>wordberry</div><div class="row"><button id="sync-state" class="sync-pill" data-action="retry-sync" aria-live="polite" title="Состояние сохранения. Нажми для повторной синхронизации."></button><span class="chip profile-chip">${avatars[profile.avatar]||'🫐'} ${esc(profile.name)}</span></div></header><main id="main">${route==='home'?homePage():route==='course'?coursePage():route==='lesson'?lessonPage():route==='train'?trainPage():route==='review'?reviewPage():route==='progress'?progressPage():settingsPage()}</main></div></div>`;
}
function homePage(){
 const stats=C.courseStats(course,progress),today=progress.history[C.localDay()]?.attempts??0,goal=progress.settings.dailyGoal;
 const resume=progress.resume&&progress.resume.index<progress.resume.items.length,lesson=findLesson(progress.currentLesson)||course.lessons[0];
 const picks=[lesson,...getLessons().filter(l=>l.id!==lesson.id)].slice(0,3);
 return `<div class="page-head"><div class="eyebrow muted">ТВОЙ МАЛЕНЬКИЙ ШАГ НА СЕГОДНЯ</div><h1 style="margin-top:8px">Привет, ${esc(profile.name)} ${avatars[profile.avatar]||'🫐'}</h1><p>Здесь слова из твоих уроков становятся твоими.</p></div>${mode==='local'?'<div class="notice" style="margin-bottom:19px">Профиль сохраняется в этом браузере. Вход с разных устройств появится после регистрации на сайте.</div>':''}<div class="hero-grid"><section class="hero"><span class="eyebrow">${resume?'Твоё занятие ждёт':'Один урок. Четыре навыка.'}</span><span class="sticker">little by little ✦</span><h1>${resume?'Продолжим<br>с твоего места?':'Пять слов.<br>Чуть больше<br>уверенности.'}</h1><p>${resume?`Сохранилась карточка ${progress.resume.index+1} из ${progress.resume.items.length}. Можно продолжать.`:`Сегодня: «${esc(lesson.title)}». Короткая тренировка с переводом, написанием, звуком и фразами.`}</p><div class="hero-action">${btn((resume?'Продолжить занятие':'Начать тренировку')+' '+icon('arrow'),resume?'resume':'start-current','primary big')}</div><div class="hero-mascot">${mascot()}</div></section><section class="card goal-card"><div><h3>Твой ритм</h3><p>Цель на сегодня</p></div><div class="goal-ring" style="--percent:${Math.min(100,today/goal*100)}%"><div class="goal-ring-content"><b>${today}</b><span>из ${goal} ответов</span></div></div><div>${btn(today>=goal?'Цель выполнена ✦':'Изменить цель','nav','soft','data-route="settings"')}</div></section></div><div class="stats-grid"><div class="card stat"><span class="stat-icon" style="background:var(--sage)">🌱</span><div><b>${stats.familiar}</b><p>Освоено во всех навыках</p></div></div><div class="card stat"><span class="stat-icon" style="background:var(--lavender)">✦</span><div><b>${stats.learned}</b><p>Закреплено после повторения</p></div></div><div class="card stat"><span class="stat-icon" style="background:var(--peach)">↻</span><div><b>${stats.due}</b><p>Пора повторить</p></div></div></div><section class="section-gap"><div class="section-head"><h2>Твои уроки</h2>${btn('Все уроки '+icon('arrow'),'nav','ghost','data-route="course"')}</div><div class="lesson-peek-grid">${picks.map(peekLesson).join('')}</div></section><section class="section-gap home-bottom"><div class="card pad"><h3>Твои встречи с английским</h3><p class="small muted" style="margin-top:6px">Каждый ответ — маленькая тренировка.</p>${activityBars()}</div><div class="card pad"><h3>Как слово становится своим?</h3>${[['Понимаешь перевод','translate'],['Вспоминаешь написание','pencil'],['Узнаёшь на слух','volume'],['Используешь в предложении','message']].map(([s,i],n)=>`<div class="step-line"><span class="step-num">${n+1}</span>${s}<span class="spacer"></span>${icon(i)}</div>`).join('')}<p class="feature-footnote">После успешных ответов во всех навыках слово освоено. Через день вернёмся к нему и проверим, что оно осталось в памяти.</p></div></section>`;
}
function activityBars(){
 const now=Date.now(),days=[];for(let i=6;i>=0;i--){const d=now-i*C.DAY,key=C.localDay(d);days.push({key,at:d,count:progress.history[key]?.attempts??0});}
 const max=Math.max(20,...days.map(d=>d.count));
 return `<div class="activity-bars" aria-label="Ответы за последние семь дней">${days.map((d,i)=>`<div class="bar-item ${i===6?'today':''}" title="${esc(d.key)}: ${d.count} ответов"><div class="bar-value">${d.count||'·'}</div><div class="bar"><div class="bar-fill" style="height:${Math.max(4,d.count/max*100)}%"></div></div><span>${new Intl.DateTimeFormat('ru-RU',{weekday:'short',timeZone:'Europe/Moscow'}).format(new Date(d.at))}</span></div>`).join('')}</div>`;
}
function peekLesson(l){const stats=C.lessonStats(l,progress);return `<button class="peek-card" data-action="lesson" data-id="${esc(l.id)}"><span class="chip purple">${esc(l.code)}</span><h3>${esc(l.title)}</h3><p>${esc(l.subtitle)}</p><div class="peek-bottom"><span>${l.words.length} ${plural(l.words.length,'слово','слова','слов')}</span>${icon('arrow')}</div><div class="mini-bar"><span style="width:${stats.percent}%"></span></div></button>`;}
function coursePage(){
 const modules=[...course.modules,...(progress.customLessons.length?[{id:'custom',title:'Мои школьные уроки',en:'My lessons',emoji:'✦'}]:[])];
 return `<div class="page-head"><h1>Уроки, которые тебе нужны</h1><p>Выбирай модуль, который сейчас проходите в школе. Здесь можно начинать с любого урока.</p></div><div class="row between wrap">${btn(icon('plus')+' Добавить свой урок','add-lesson','soft')}<span class="small muted">${getLessons().length} уроков · ${getWords().length} слов и фраз</span></div><div class="filters"><button class="pill-btn ${courseFilter==='all'?'active':''}" data-action="course-filter" data-filter="all">Все</button>${modules.map(m=>`<button class="pill-btn ${courseFilter===m.id?'active':''}" data-action="course-filter" data-filter="${m.id}">${m.id==='starter'?'Starter':m.id==='custom'?'Мои уроки':'Модуль '+m.id}</button>`).join('')}</div><div class="module-grid">${modules.filter(m=>courseFilter==='all'||m.id===courseFilter).map(m=>`<section class="card module-card"><div class="module-title"><span class="module-emoji">${m.emoji}</span><div><small>${esc(m.en)}</small><h3>${esc(m.title)}</h3></div></div>${getLessons().filter(l=>l.module===m.id).map(l=>{const s=C.lessonStats(l,progress);return `<button class="lesson-row" data-action="lesson" data-id="${esc(l.id)}"><span class="lesson-code">${esc(l.code)}</span><div><span class="lesson-row-title">${esc(l.title)}</span><p>${l.words.length} слов и фраз · ${esc(l.subtitle)}</p></div><span class="lesson-row-status">${s.seen?s.percent+'%':'Начать'}</span>${icon('arrow')}</button>`;}).join('')}</section>`).join('')}</div><div class="source-note"><details><summary>Откуда взяты уроки и слова</summary>${esc(course.sourceNote)} Номера страниц в уроках — печатные номера, а не номера страниц PDF.</details></div>`;
}
function lessonPage(){
 const l=findLesson(lessonId)||course.lessons[0],stats=C.lessonStats(l,progress);
 return `<div class="breadcrumbs">${btn(icon('back')+' Все уроки','nav','ghost','data-route="course"')}<span>/</span><span>${esc(l.code)}</span></div><div class="lesson-intro"><div class="card pad"><span class="chip purple">${esc(l.code)}</span><h1 style="margin-top:17px">${esc(l.title)}</h1><p class="muted" style="margin-top:10px">${esc(l.subtitle)}</p><div class="row wrap mt"><span class="chip">${l.words.length} слов и фраз</span><span class="chip green">${stats.percent}% освоения</span></div><p class="source-note">${esc(l.source)}</p><p class="small muted" style="margin-top:18px">Нажми на слово: услышишь произношение, увидишь пример и сможешь записать свой голос.</p></div><section class="card training-chooser"><h3>Как потренируемся?</h3><p>Сначала можно познакомиться со словами ниже.</p><div class="mode-grid">${[['mix','Все 4 навыка','star'],['meaning','Перевод','translate'],['spelling','Написание','pencil'],['listening','На слух','volume'],['context','Предложения','message']].map(([m,label,i])=>`<button class="mode-btn ${studyMode===m?'active':''}" data-action="study-mode" data-mode="${m}">${icon(i)} ${label}</button>`).join('')}</div><label class="label" for="word-limit">Сколько слов за раз?</label><select class="field" id="word-limit">${[3,5,8].map(n=>`<option value="${n}" ${n===wordLimit?'selected':''}>${n} ${plural(n,'слово','слова','слов')}</option>`).join('')}</select>${btn('Начать '+icon('arrow'),'start-lesson','primary full mt')}</section></div><div class="section-head section-gap"><h2>Слова этого урока</h2><span class="small muted">Слушай. Замечай. Пробуй.</span></div><div class="word-grid">${l.words.map(wordTile).join('')}</div>`;
}
function wordTile(w){const p=progress.words[w.id],label=statusLabel(p);return `<button class="word-tile" data-action="word" data-id="${esc(w.id)}"><span class="sound">${icon('volume')}</span><span class="word-emoji">${w.emoji||'✦'}</span><h3 lang="en">${esc(w.en)}</h3><p>${esc(w.ru)}</p><div class="word-tile-status">${label}</div><div class="mini-bar"><span style="width:${C.wordPercent(p)}%"></span></div></button>`;}
function statusLabel(entry){const s=C.wordStatus(entry);return s==='learned'?'✦ Закреплено':s==='familiar'?'🌱 Освоено · закрепляем':s==='learning'?'В тренировке':'Новое слово';}
function activeQuestion(){const s=session??progress.resume;if(!s||s.index>=s.items.length)return null;return s.items[s.index];}
function trainPage(){
 session=session??structuredClone(progress.resume);
 if(!session)return '<div class="empty"><h2>Выбери урок</h2>'+btn('К урокам','nav','primary mt','data-route="course"')+'</div>';
 if(session.index>=session.items.length&&!feedback)return endPage();
 const item=feedback?.item??activeQuestion(),word=findWord(item?.wordId);
 if(!word)return '<div class="empty"><h2>Слово не найдено</h2>'+btn('К урокам','nav','primary mt','data-route="course"')+'</div>';
 const skill=item.skill,finished=!!feedback,qnum=finished?session.index:session.index+1;
 let question='';
 if(skill==='meaning'){
  const options=feedback?.choices??C.makeChoices(word,getWords(),'ru');if(!finished)window._wordberryChoices=options;
  question=`<h2>Что означает это слово?</h2><div class="question-word" lang="en">${esc(word.en)}</div><button class="slow-btn" data-action="play-current">${icon('volume')} Послушать</button><div class="choice-grid">${options.map((opt,i)=>`<button class="choice" data-action="answer-choice" data-answer="${esc(opt)}" ${finished?'disabled':''}><span class="choice-key">${i+1}</span>${esc(opt)}</button>`).join('')}</div>`;
 }else if(skill==='spelling'){
  question=`<h2>Напиши по-английски</h2><p class="train-sub">Вспомни слово и проверь каждую букву.</p><div class="question-ru">${esc(word.ru)}</div>${answerForm(finished,'Английское слово')}<button class="slow-btn" data-action="play-current">${icon('volume')} Услышать слово</button>`;
 }else if(skill==='listening'){
  question=`<h2>Слушай. Затем напиши.</h2><p class="train-sub">Нажми на звук и запиши услышанное по-английски.</p><button class="audio-question" data-action="play-current" aria-label="Прослушать слово">${icon('volume')}</button><button class="slow-btn" data-action="play-slow">${icon('clock')} Медленнее</button>${answerForm(finished,'Что ты услышала?',!heard&&!finished)}<p class="small muted" id="audio-status" style="margin-top:12px">${heard?'Можно написать ответ.':'Сначала включи звук.'}</p>`;
 }else{
  const blank=C.blankExample(word);
  question=`<h2>Слово в предложении</h2><p class="train-sub">Перевод подскажет смысл. Вставь пропущенное слово или фразу.</p><div class="context-sentence" lang="en">${esc(blank?.before)}<span class="gap-word">${finished?esc(feedback.expected):'···'}</span>${esc(blank?.after)}</div><p class="train-sub">${esc(word.exampleRu)}</p>${answerForm(finished,'Вставь слово или фразу')}`;
 }
 return `<div class="train-wrap"><div class="train-top"><button class="icon-btn" data-action="pause-session" aria-label="Остановиться и сохранить">${icon('close')}</button><div class="train-progress" aria-label="Прогресс занятия"><span style="width:${session.index/session.items.length*100}%"></span></div><span class="train-count">${qnum} / ${session.items.length}</span></div><section class="card training-card"><span class="train-kind">${icon(skillIcons[skill])} ${C.SKILL_NAMES[skill]}</span>${question}</section>${finished?feedbackPanel(word):`<div class="question-footer">${btn('Пока не знаю','skip-answer','ghost')}${btn('Подсказка','hint','ghost')}</div><p class="small muted" style="text-align:center;margin-top:14px">Ошибки здесь — часть тренировки. Вернёмся к трудному слову ещё раз.</p>`}</div>`;
}
function answerForm(finished,placeholder,locked=false){return `<form id="answer-form" class="answer-form"><input class="field answer-input" id="answer-input" name="answer" aria-label="Ответ по-английски" placeholder="${esc(placeholder)}" autocomplete="off" autocapitalize="none" spellcheck="false" ${finished||locked?'disabled':''} value="${finished?esc(feedback.answer):''}" maxlength="200"><button type="submit" class="btn primary" ${finished||locked?'disabled':''}>Проверить ${icon('check')}</button></form>`;}
function feedbackPanel(word){
 const f=feedback,good=f.correct&&!f.usedHint;
 const title=good?'Да, получилось!':f.correct?'С подсказкой получилось. Закрепим ещё раз.':'Теперь знаешь, как правильно.';
 const letters=f.item.skill==='spelling'||f.item.skill==='listening'?`<div class="feedback-answer letter-diff" lang="en">${[...f.expected].map((letter,i)=>`<span class="${C.normalizeAnswer(f.answer)[i]!==C.normalizeAnswer(f.expected)[i]?'diff':''}">${esc(letter===' '?'·':letter)}</span>`).join('')}</div>`:`<div class="feedback-answer">${esc(f.expected)}</div>`;
 return `<section class="feedback ${good?'':'wrong'}" aria-live="polite"><div class="feedback-head">${icon(good?'check':'book')} ${title}</div>${letters}<p><strong lang="en">${esc(word.example)}</strong><br>${esc(word.exampleRu)}</p>${f.usedHint?'<p style="margin-top:8px">Ответ с подсказкой не повышает освоение. Следующий попробуем вспомнить сами.</p>':''}<div class="row">${btn(icon('volume')+' Послушать фразу','play-example','light','data-id="'+esc(word.id)+'"')}<span class="spacer"></span>${btn((session.index>=session.items.length?'Результат':'Дальше')+' '+icon('arrow'),'next-question','primary')}</div></section>`;
}
function endPage(){
 const total=session.correct+session.wrong,score=total?Math.round(session.correct/total*100):0;
 const ids=[...new Set(session.items.map(i=>i.wordId))],familiar=ids.filter(id=>['familiar','learned'].includes(C.wordStatus(progress.words[id]))).length;
 return `<div class="train-wrap"><section class="card end-card"><div class="end-emoji">${score>=80?'🌟':'🌱'}</div><h1>${score>=80?'Слова уже ближе!':'Хорошая встреча с английским.'}</h1><div class="end-score">${session.correct} / ${total}</div><p>Ответов без подсказки. ${session.wrong?'Трудные слова остаются в тренировке: это и есть путь к уверенности.':'Можно отдохнуть. Следующая встреча поможет словам остаться в памяти.'}</p><div class="end-skills">${[...new Set(session.items.map(i=>i.skill))].map(s=>`<span class="chip purple">${icon(skillIcons[s])} ${C.SKILL_NAMES[s]}</span>`).join('')}</div><div class="notice">В этой группе ${familiar} из ${ids.length} слов освоены во всех четырёх навыках. Закреплённые слова подтверждаем повторением через день.</div><div class="row wrap" style="justify-content:center;margin-top:25px">${btn('На сегодня всё','finish-session','primary big')}${btn('Ещё немного','another-session','light big')}</div></section></div>`;
}
function reviewPage(){
 const words=getWords().filter(w=>C.isDue(progress.words[w.id])),seen=getWords().filter(w=>progress.words[w.id]?.attempts);
 return `<div class="page-head"><h1>У слов есть память о тебе</h1><p>Короткое повторение — и они снова под рукой. Здесь появляются слова, к которым пора вернуться.</p></div>${words.length?`<section class="card pad" style="background:var(--sage)"><div class="row between wrap"><div><h2>${words.length} ${plural(words.length,'слово ждёт','слова ждут','слов ждут')} повторения</h2><p class="small muted" style="margin-top:8px">Начнём с пяти. Сначала — те, которые пока сложнее.</p></div>${btn('Повторить 5 слов '+icon('arrow'),'start-review','primary big')}</div></section><div class="word-grid section-gap">${words.map(wordTile).join('')}</div>`:`<div class="empty"><div style="font-size:40px">🌿</div><h2 style="margin-top:10px">Пока всё спокойно</h2><p>${seen.length?'Слова вернутся сюда, когда придёт время повторения. Если хочется, можно потренироваться раньше.':'После первого занятия здесь появятся слова для повторения.'}</p>${seen.length?btn('Повторить знакомые слова','early-review','primary'):btn('Выбрать урок','nav','primary','data-route="course"')}</div>`}<div class="card pad section-gap"><h3>Когда мы снова встречаемся?</h3><p class="reading-note" style="margin-top:10px">После первого верного ответа навык вернётся через 10 минут, затем — через день, 3 дня, неделю и дальше. Ошибка возвращает его в ближайшее повторение через 5 минут. Это правила тренажёра: можно заниматься раньше, не ждать таймер.</p></div>`;
}
function progressPage(){
 const stats=C.courseStats(course,progress),seen=getWords().filter(w=>progress.words[w.id]?.attempts);
 const list=getWords().filter(w=>(wordFilter==='all'||wordFilter==='learned'&&C.wordStatus(progress.words[w.id])==='learned'||wordFilter==='learning'&&progress.words[w.id]?.attempts&&C.wordStatus(progress.words[w.id])!=='learned'||wordFilter==='due'&&C.isDue(progress.words[w.id]))&&(!wordSearch||[w.en,w.ru].some(t=>t.toLowerCase().includes(wordSearch.toLowerCase()))));
 const skills=C.SKILLS.map(s=>({skill:s,percent:seen.length?Math.round(seen.reduce((a,w)=>a+Math.min(2,progress.words[w.id].skills[s]?.level??0),0)/(seen.length*2)*100):0}));
 return `<div class="page-head"><h1>Видно, чему ты научилась</h1><p>Четыре навыка считаются отдельно. Если слово узнаётся, но пока не пишется — потренируем именно это.</p></div><div class="progress-grid"><section class="card pad"><h3>Навыки по словам в работе</h3><p class="small muted" style="margin-top:7px">Сейчас в работе ${stats.seen} из ${stats.total} слов.</p>${skills.map(({skill,percent})=>`<div class="skill-row">${icon(skillIcons[skill])}<span class="skill-label">${C.SKILL_NAMES[skill]}</span><div class="skill-bar"><span style="width:${percent}%"></span></div><span class="skill-value">${percent}%</span></div>`).join('')}</section><section class="card pad"><h3>Твой путь в цифрах</h3><div class="row wrap" style="margin-top:23px;gap:30px"><div><b style="font-size:29px;color:var(--purple)">${stats.attempts}</b><p class="small muted">всего ответов</p></div><div><b style="font-size:29px;color:var(--green)">${stats.accuracy}%</b><p class="small muted">без ошибки и подсказки</p></div></div><div class="row wrap" style="margin-top:23px">${btn(icon('download')+' Отчёт CSV','export-csv','light')}${btn(icon('download')+' Копия прогресса','export-json','light')}</div></section></div><div class="section-head section-gap"><h2>Каждое слово — отдельно</h2><span class="small muted small-count">${list.length} слов</span></div><div class="row between wrap report-tools"><input class="field search-input" id="word-search" aria-label="Найти слово или перевод" placeholder="Найти слово или перевод" value="${esc(wordSearch)}"><div class="filters" style="margin:0">${[['all','Все'],['learning','В работе'],['learned','Закреплено'],['due','Повторить']].map(([f,label])=>`<button class="pill-btn ${wordFilter===f?'active':''}" data-action="word-filter" data-filter="${f}">${label}</button>`).join('')}</div></div><div class="card table-scroll"><table><thead><tr><th>Слово</th><th>Перевод</th>${C.SKILLS.map(s=>`<th>${C.SKILL_NAMES[s]}</th>`).join('')}<th>Статус</th></tr></thead><tbody>${list.slice(0,pageLimit).map(w=>`<tr><td class="word-cell"><button class="text-btn" data-action="word" data-id="${esc(w.id)}" style="font-size:13px;text-align:left" lang="en">${esc(w.en)}</button></td><td>${esc(w.ru)}</td>${C.SKILLS.map(s=>`<td aria-label="${esc(C.SKILL_NAMES[s])}: ${Math.min(2,progress.words[w.id]?.skills[s]?.level??0)} из 2">${[1,2].map(n=>`<span class="skill-dot ${(progress.words[w.id]?.skills[s]?.level??0)>=n?'on':''}"></span>`).join('')}</td>`).join('')}<td style="white-space:nowrap">${statusLabel(progress.words[w.id])}</td></tr>`).join('')||'<tr><td colspan="7">Подходящих слов пока нет.</td></tr>'}</tbody></table></div>${list.length>pageLimit?btn('Показать ещё 35','show-more','light mt'):''}<p class="report-legend">Две точки = два последних успешных ответа подряд в навыке. «Освоено» — есть ответы во всех четырёх навыках. «Закреплено» — по два успешных ответа в каждом навыке и верный ответ при повторении спустя минимум 20 часов после первой встречи.</p>`;
}
function settingsPage(){
 return `<div class="page-head"><h1>Пусть тебе будет удобно</h1><p>Темп, голос, свои школьные слова — всё подстраивается под тебя.</p></div><div class="settings-grid"><section class="card settings-card"><h2>Твой профиль</h2><div class="row"><span class="avatar">${avatars[profile.avatar]||'🫐'}</span><div><h3>${esc(profile.name)}</h3><p style="margin:3px 0 0">${mode==='cloud'?'Логин: '+esc(profile.username):'Профиль в текущем браузере'}</p></div></div><p>${mode==='cloud'?'Прогресс сохраняется в аккаунте. Вход на другом устройстве — с тем же логином и паролем.':'Имя и прогресс запоминаются здесь. Если удалить данные браузера, этот профиль исчезнет. Сохранить копию можно ниже.'}</p>${btn('Сменить профиль','switch-profile','light')}${btn('Копия прогресса','export-json','ghost')}</section><section class="card settings-card"><h2>Дневная цель</h2><p>Это ориентир, а не ограничение. Можно сделать меньше, можно больше.</p><div class="row wrap">${[10,20,40].map(n=>`<button class="pill-btn ${progress.settings.dailyGoal===n?'active':''}" data-action="set-goal" data-value="${n}">${n} ответов</button>`).join('')}</div><p>Считаем ответы, а не выученные слова. Ошибка тоже означает, что ты потренировалась.</p></section><section class="card settings-card"><h2>Как звучит английский</h2><label class="label" for="accent">Вариант произношения</label><select id="accent" class="field"><option value="en-GB" ${progress.settings.accent==='en-GB'?'selected':''}>Британский английский</option><option value="en-US" ${progress.settings.accent==='en-US'?'selected':''}>Американский английский</option></select><label class="range-label" for="speech-rate" style="margin-top:20px"><span>Скорость образца</span><b id="rate-label">${progress.settings.speechRate.toFixed(2)}</b></label><input id="speech-rate" type="range" min="0.6" max="1.1" step="0.05" value="${progress.settings.speechRate}">${btn(icon('volume')+' Проверить звук','test-sound','soft mt')}<p>Озвучка использует английские голоса устройства. Если голос не звучит, проверь громкость и наличие английского голоса в настройках телефона или компьютера.</p></section><section class="card settings-card"><h2>Слова из нового урока</h2><p>Учитель задал свои слова? Добавь отдельный урок: слово, перевод, пример и перевод примера. Все четыре тренировки будут доступны и для него.</p>${btn(icon('plus')+' Добавить свой урок','add-lesson','primary')}<p>После регистрации твои добавленные уроки тоже доступны с других устройств.</p></section><section class="card settings-card"><h2>Как работает прогресс</h2><p>Ответ с подсказкой не повышает освоение. Неверные ответы возвращаются в занятие, а затем — в повторение. Можно учить любой модуль без «замков» и ограничений.</p>${btn('Объяснить подробнее','help','light')}</section><section class="card settings-card"><h2>Удалить профиль</h2><p>Удаление убирает имя, добавленные уроки и учебный прогресс этого профиля.</p>${btn('Удалить мой профиль','delete-profile','danger')}</section></div><div class="source-note"><details><summary>О словаре и исходных материалах</summary>${esc(course.sourceNote)}</details></div>`;
}
function openWord(id){
 const w=findWord(id);if(!w)return;
 modal(`<div class="modal-word"><span class="word-emoji">${w.emoji||'✦'}</span><h2 id="dialog-title" lang="en">${esc(w.en)}</h2><p class="translation">${esc(w.ru)}</p><div class="row wrap" style="justify-content:center">${btn(icon('volume')+' Послушать','speak-word','primary','data-id="'+esc(id)+'"')}${btn(icon('clock')+' Медленно','speak-word','light','data-id="'+esc(id)+'" data-slow="1"')}</div><div class="example-box"><p lang="en">${esc(w.example)}</p><small>${esc(w.exampleRu)}</small><div style="margin-top:12px">${btn(icon('volume')+' Послушать фразу','play-example','ghost','data-id="'+esc(id)+'"')}</div></div><div class="record-box"><b>Попробуй своим голосом</b><p class="muted" style="margin-top:5px">Послушай образец, запиши себя и сравни. Это практика без автоматической оценки и без баллов.</p><div class="row">${btn(icon('mic')+' Записать себя','record','soft','data-id="'+esc(id)+'"')}${btn('Остановить','stop-record','light hidden','id="stop-record"')}</div><div id="record-result" aria-live="polite"></div></div><p class="small muted" style="margin:17px 0 0">${statusLabel(progress.words[id])}. Прослушивание карточки само по себе не повышает освоение.</p></div>`);
}
let lastUtterance=null;
function speak(text,slow=false,onStart){
 if(!('speechSynthesis' in window)){toast('В этом браузере нет озвучки. Попробуй открыть сайт в Chrome, Edge или Safari.');return false;}
 const synth=window.speechSynthesis,voices=synth.getVoices(),lang=progress.settings.accent;
 const english=voices.filter(v=>v.lang.toLowerCase().startsWith('en'));
 if(voices.length&&!english.length){toast('На устройстве нет английского голоса. Добавь его в настройках речи и попробуй ещё раз.');return false;}
 synth.cancel();const u=new SpeechSynthesisUtterance(text);u.lang=lang;u.rate=slow?0.62:progress.settings.speechRate;u.pitch=1;
 u.voice=english.find(v=>v.lang===lang)||english.find(v=>v.lang.toLowerCase().startsWith(lang.toLowerCase()))||english[0]||null;
 u.onstart=()=>{onStart?.();$('.audio-question')?.classList.add('playing');};u.onend=()=>{$('.audio-question')?.classList.remove('playing');};
 u.onerror=()=>{$('.audio-question')?.classList.remove('playing');toast('Не удалось воспроизвести звук. Попробуй ещё раз или проверь английский голос устройства.');};
 lastUtterance=u;synth.speak(u);return true;
}
function audioWord(w){return w.audio||w.en;}
function playCurrent(slow=false){const item=feedback?.item??activeQuestion(),w=findWord(item?.wordId);if(!w)return;speak(audioWord(w),slow,()=>{if(item.skill==='listening'&&!feedback){heard=true;const inp=$('#answer-input');if(inp)inp.disabled=false;const b=$('#answer-form button');if(b)b.disabled=false;const label=$('#audio-status');if(label)label.textContent='Можно написать ответ.';}});}
function submitAnswer(answer){
 if(feedback||!session)return;const item=activeQuestion(),word=findWord(item.wordId);if(!word)return;
 if(item.skill==='listening'&&!heard){toast('Сначала послушай слово.');return;}
 const expected=item.skill==='meaning'?word.ru:item.skill==='context'?C.blankExample(word).answer:word.en;
 const aliases=['spelling','listening'].includes(item.skill)?word.aliases??[]:[];
 const correct=C.checkAnswer(answer,expected,aliases),credit=correct&&!hinted;
 const choices=window._wordberryChoices;
 feedback={item:{...item},answer,expected,correct,usedHint:hinted,choices};
 queueEvent('attempt',{wordId:word.id,skill:item.skill,answer,correct:credit,usedHint:hinted});
 if(credit)session.correct++;else{
  session.wrong++;
  const repeats=session.items.filter(i=>i.wordId===item.wordId&&i.skill===item.skill).length;
  if(repeats<2&&session.items.length<80)session.items.push({...item});
 }
 session.index++;queueEvent('session',{session:structuredClone(session),lessonId:session.lessonId});render();setTimeout(()=> $('[data-action="next-question"]')?.focus(),0);
}
function begin(lesson,selectedMode='mix',limit=5,replace=false){
 if(progress.resume&&progress.resume.index<progress.resume.items.length&&!replace){modal(`<h2 id="dialog-title">Есть незавершённое занятие</h2><p>Можно продолжить его или начать новую тренировку. Уже полученные результаты останутся в прогрессе.</p><div class="row wrap">${btn('Продолжить','resume','primary')}${btn('Начать новое','replace-session','light','data-id="'+esc(lesson.id)+'" data-mode="'+esc(selectedMode)+'" data-limit="'+limit+'"')}</div>`);return;}
 const made=C.makeSession(lesson,progress,selectedMode,limit);
 if(!made.items.length){toast('Сейчас нет слов для этого повторения.');return;}
 session=made;feedback=null;hinted=false;heard=false;queueEvent('session',{session:structuredClone(session),lessonId:lesson.id});route='train';closeModal();render();window.scrollTo({top:0,behavior:'instant'});
}
function reviewLesson(early=false){return {id:'review',words:getWords().filter(w=>early?progress.words[w.id]?.attempts:C.isDue(progress.words[w.id]))};}
function addLessonModal(){
 modal(`<h2 id="dialog-title">Слова именно из твоего урока</h2><p>Каждая строка — отдельное слово. Раздели четыре поля знаком |. В английском примере используй слово в той же форме.</p><form id="add-lesson-form"><label class="label" for="new-lesson-title">Название</label><input id="new-lesson-title" class="field" name="title" required minlength="2" maxlength="80" placeholder="Например, слова на 15 октября"><label class="label mt" for="new-lesson-rows">Слово | перевод | пример | перевод примера</label><div class="code-example" style="margin-bottom:10px">apple | яблоко | I eat an apple. | Я ем яблоко.\nwindow | окно | Open the window. | Открой окно.</div><textarea id="new-lesson-rows" class="field" name="rows" required placeholder="Вставь свои строки. Можно добавить до 60 слов." spellcheck="false"></textarea><div class="form-error" id="lesson-error" role="alert"></div><button type="submit" class="btn primary full mt">Сохранить урок ${icon('check')}</button></form>`,true);
}
function download(name,contents,type){const url=URL.createObjectURL(new Blob([contents],{type})),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}
function exportCSV(){const quote=v=>'"'+String(v??'').replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"';const rows=[['Слово','Перевод','Перевод: уровень','Написание: уровень','На слух: уровень','Предложения: уровень','Всего ответов','Без ошибок и подсказок','Статус'],...getWords().map(w=>{const p=progress.words[w.id];return [w.en,w.ru,...C.SKILLS.map(s=>Math.min(2,p?.skills[s]?.level??0)),p?.attempts??0,p?.correct??0,statusLabel(p)];})];download('wordberry-progress-'+C.localDay()+'.csv','\uFEFF'+rows.map(r=>r.map(quote).join(';')).join('\r\n'),'text/csv;charset=utf-8');}
async function recordVoice(){
 if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){toast('Запись голоса здесь недоступна. Открой опубликованный сайт по HTTPS в современном браузере.');return;}
 if(recording)return;
 let stream;
 try{
  stream=await navigator.mediaDevices.getUserMedia({audio:true});
  if(!$('#record-result')){stream.getTracks().forEach(t=>t.stop());return;}
  const recorder=new MediaRecorder(stream),chunks=[],target=$('#record-result');recording=recorder;if(recordedUrl){URL.revokeObjectURL(recordedUrl);recordedUrl=null;}
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  recorder.onstop=()=>{stream.getTracks().forEach(t=>t.stop());if(recording===recorder)recording=null;if(!target.isConnected)return;recordedUrl=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType||'audio/webm'}));$('#record-result').innerHTML='<audio controls aria-label="Твоя запись"></audio><p class="small muted">Запись остаётся только в этой карточке и не отправляется на сервер.</p>';$('#record-result audio').src=recordedUrl;$('#stop-record')?.classList.add('hidden');};
  recorder.start();$('#stop-record')?.classList.remove('hidden');$('#record-result').innerHTML='<p class="record-active" style="margin-top:10px">Записываю… Скажи слово или фразу и нажми «Остановить».</p>';
  setTimeout(()=>{if(recording===recorder)stopRecording();},15000);
 }catch{stream?.getTracks().forEach(t=>t.stop());toast('Микрофон не включился. Разреши доступ к нему в настройках сайта.');}
}
let recoveryNotice=null;
function showRecovery(username,code){
 recoveryNotice={username,code};
 modal(`<h2 id="dialog-title">Одна важная вещь для взрослого</h2><p>Это код восстановления профиля «${esc(username)}». С ним можно задать новый пароль, если старый забудется. Сейчас код показывается один раз.</p><div class="recovery-code">${esc(code)}</div>${btn(icon('download')+' Сохранить код файлом','download-recovery','soft full')}<label class="recovery-checkbox"><input id="recovery-saved" type="checkbox"><span>Я сохранила код или передала его взрослому.</span></label><button id="recovery-done" class="btn primary full" data-action="recovery-done" disabled>Перейти к урокам ${icon('arrow')}</button>`);
 $('#modal-root .close').classList.add('hidden');
}
function confirmSwitch(){
 modal(`<h2 id="dialog-title">Сменить профиль?</h2><p>${mode==='cloud'?'Сохраним ответы и выйдем. Для возвращения понадобится логин и пароль.':'Прогресс останется в этом браузере. Можно будет выбрать своё имя снова.'}</p><div class="row">${btn('Остаться','close-modal','light')}${btn('Сменить профиль','do-logout','primary')}</div>`);
}
function deleteModal(){
 modal(`<h2 id="dialog-title">Удалить профиль ${esc(profile.name)}?</h2><p>Имя, свои уроки и прогресс этого профиля будут удалены. Можно заранее скачать копию.</p>${btn(icon('download')+' Скачать копию','export-json','light')}<form id="delete-form" class="mt">${mode==='cloud'?'<label class="label" for="delete-password">Пароль профиля</label><input class="field" id="delete-password" name="password" type="password" required autocomplete="current-password">':''}<label class="recovery-checkbox"><input type="checkbox" required><span>Я понимаю, что удаляю этот профиль и его прогресс.</span></label><div id="delete-error" class="form-error" role="alert"></div><button class="btn danger full" type="submit">Удалить профиль</button></form>`);
}
function showHelp(){modal(`<h2 id="dialog-title">Прогресс, который можно понять</h2><div class="help-list"><p><b>Новое.</b> Ты ещё не отвечала на вопросы по этому слову.</p><p><b>В тренировке.</b> Начали учить, но не все четыре навыка освоены.</p><p><b>Освоено.</b> Есть хотя бы один верный ответ без подсказки в каждом из четырёх навыков.</p><p><b>Закреплено.</b> По два верных ответа подряд в каждом навыке и успешное повторение спустя минимум 20 часов после первой встречи со словом.</p><p><b>Повторить.</b> Настало время хотя бы одного навыка. Ошибка не стирает историю ответов, но этот навык потренируем заново.</p><p>Это учебные показатели тренажёра. Они помогают выбирать упражнения, но не заменяют школьную оценку или проверку учителя.</p></div>`,true);}
async function act(action,el){
 if(action==='nav'){nav(el.dataset.route);return;}
 if(action==='close-modal'){if(recoveryNotice){toast('Сначала сохрани код восстановления.');return;}closeModal();return;}
 if(action==='auth-tab'){authTab=el.dataset.tab;renderAuth();return;}
 if(action==='avatar'){avatar=el.dataset.avatar;document.querySelectorAll('.avatar-choice').forEach(b=>{b.classList.toggle('active',b.dataset.avatar===avatar);b.setAttribute('aria-pressed',String(b.dataset.avatar===avatar));});return;}
 if(action==='password-eye'){const i=$('#password'),hidden=i.type==='password';i.type=hidden?'text':'password';el.setAttribute('aria-label',hidden?'Скрыть пароль':'Показать пароль');return;}
 if(action==='local-login'){const cached=readJSON('cache:'+el.dataset.id,null);if(!cached?.profile){toast('Этот профиль не найден. Можно создать новый.');return;}profile=cached.profile;progress=cached.progress;mode='local';pending=[];syncError='';route='home';lessonId=progress.currentLesson;cache();render();return;}
 if(action==='lesson'){lessonId=el.dataset.id;studyMode='mix';queueEvent('location',{lessonId});nav('lesson');return;}
 if(action==='course-filter'){courseFilter=el.dataset.filter;render();return;}
 if(action==='word-filter'){wordFilter=el.dataset.filter;pageLimit=35;render();return;}
 if(action==='study-mode'){studyMode=el.dataset.mode;render();return;}
 if(action==='word'){openWord(el.dataset.id);return;}
 if(action==='speak-word'){const w=findWord(el.dataset.id);if(w)speak(audioWord(w),!!el.dataset.slow);return;}
 if(action==='play-example'){const w=findWord(el.dataset.id);if(w)speak(w.example);return;}
 if(action==='play-current'||action==='play-slow'){playCurrent(action==='play-slow');return;}
 if(action==='retry-sync'){
  if(mode==='local'){toast('Этот профиль хранится только в текущем браузере. Для разных устройств нужна регистрация.');return;}
  if(syncError==='Нужен повторный вход'){
   modal(`<h2 id="dialog-title">Войдём в твой профиль снова</h2><p>Несохранённые ответы ждут в этом браузере. После входа они отправятся в профиль.</p><form id="auth-form" class="auth-form" data-kind="login"><div><label class="label" for="username">Логин</label><input id="username" class="field" name="username" value="${esc(profile.username)}" required autocomplete="username"></div><div><label class="label" for="password">Пароль</label><input id="password" class="field" name="password" type="password" required autocomplete="current-password"></div><div id="auth-error" class="form-error" role="alert"></div><button class="btn primary full" type="submit">Войти и сохранить ответы</button></form>`);return;
  }
  await flush();if(syncError==='Нужен повторный вход'){await act('retry-sync',el);return;}if(syncError){toast('Связи пока нет. Ответы остаются в этом браузере.');return;}
  try{const data=await api('state');progress=C.applyEvents(data.progress,pending);cache();updateSync();if(route!=='train')render();toast('Прогресс синхронизирован.');}catch(error){syncError=error.status===401?'Нужен повторный вход':'Нет связи · ответы сохранены здесь';updateSync();toast('Не удалось синхронизировать. Попробуй ещё раз.');}return;
 }
 if(action==='test-sound'){speak('Hello! Let us learn English together.');return;}
 if(action==='start-current'){begin(findLesson(progress.currentLesson)||course.lessons[0],'mix',5);return;}
 if(action==='start-lesson'){begin(findLesson(lessonId),'mix'===studyMode?'mix':studyMode,wordLimit);return;}
 if(action==='start-review'){begin(reviewLesson(),'review',5);return;}
 if(action==='early-review'){begin(reviewLesson(true),'mix',5);return;}
 if(action==='replace-session'){const l=el.dataset.id==='review'?reviewLesson(true):findLesson(el.dataset.id);if(l)begin(l,el.dataset.mode,Number(el.dataset.limit),true);return;}
 if(action==='resume'){if(!progress.resume)return;session=structuredClone(progress.resume);feedback=null;hinted=false;heard=false;closeModal();route='train';render();return;}
 if(action==='pause-session'){window.speechSynthesis?.cancel();session=null;feedback=null;nav('home');return;}
 if(action==='answer-choice'){submitAnswer(el.dataset.answer);return;}
 if(action==='skip-answer'){if(activeQuestion()?.skill==='listening'&&!heard){toast('Сначала включи звук, а потом решай.');return;}submitAnswer('');return;}
 if(action==='hint'){
  const item=activeQuestion(),w=findWord(item?.wordId);if(!w)return;hinted=true;
  const expected=item.skill==='context'?C.blankExample(w).answer:w.en;
  toast(item.skill==='meaning'?'Подсказка: '+w.exampleRu:'Первая буква: '+expected[0]+'. Всего '+expected.replaceAll(' ','').length+' букв.');return;
 }
 if(action==='next-question'){
  if(!feedback)return;feedback=null;hinted=false;heard=false;window.speechSynthesis?.cancel();render();window.scrollTo({top:0,behavior:'instant'});if(activeQuestion()?.skill!=='listening')setTimeout(() => $('#answer-input')?.focus(),0);return;
 }
 if(action==='finish-session'){queueEvent('session',{session:null,lessonId:session?.lessonId||progress.currentLesson});session=null;feedback=null;nav('home');return;}
 if(action==='another-session'){
  const old=session,lesson=old.lessonId==='review'?{id:'review',words:[...new Set(old.items.map(i=>i.wordId))].map(findWord)}:findLesson(old.lessonId);
  feedback=null;begin(lesson,old.mode==='review'?'mix':old.mode,5,true);return;
 }
 if(action==='set-goal'){queueEvent('settings',{settings:{dailyGoal:Number(el.dataset.value)}});render();return;}
 if(action==='add-lesson'){addLessonModal();return;}
 if(action==='show-more'){pageLimit+=35;render();return;}
 if(action==='export-csv'){exportCSV();return;}
 if(action==='export-json'){download('wordberry-backup-'+C.localDay()+'.json',JSON.stringify({format:'wordberry-backup-v1',exportedAt:new Date().toISOString(),profile,mode,progress,pending},null,2),'application/json');return;}
 if(action==='record'){await recordVoice();return;}
 if(action==='stop-record'){stopRecording();return;}
 if(action==='help'){showHelp();return;}
 if(action==='switch-profile'){confirmSwitch();return;}
 if(action==='do-logout'){
  el.disabled=true;
  try{
   if(mode==='cloud'){await flush();try{await api('logout',{});}catch(error){if(error.status!==401)throw error;}}
   try{localStorage.removeItem(STORAGE+'active');}catch{}
   profile=null;progress=C.emptyProgress();pending=[];syncError='';session=null;feedback=null;authTab=cloudReady?'login':'local';closeModal();render();
  }catch(err){el.disabled=false;toast('Для выхода из аккаунта нужна связь. Твои ответы остаются в этом браузере.');}
  return;
 }
 if(action==='delete-profile'){deleteModal();return;}
 if(action==='download-recovery'){if(recoveryNotice)download('wordberry-recovery-'+recoveryNotice.username+'.txt','Wordberry\nЛогин: '+recoveryNotice.username+'\nКод восстановления: '+recoveryNotice.code+'\nСохрани этот файл у взрослого. С кодом можно изменить пароль профиля.\n','text/plain;charset=utf-8');return;}
 if(action==='recovery-done'){if(!$('#recovery-saved')?.checked)return;recoveryNotice=null;closeModal();return;}
}
document.addEventListener('click',e=>{
 if(e.target.classList?.contains('modal-overlay')){if(!recoveryNotice)closeModal();return;}
 const el=e.target.closest?.('[data-action]');if(!el||el.disabled)return;
 Promise.resolve(act(el.dataset.action,el)).catch(()=>toast('Не получилось выполнить действие. Попробуй ещё раз.'));
});
document.addEventListener('submit',async e=>{
 const form=e.target;if(!['local-form','auth-form','answer-form','add-lesson-form','delete-form'].includes(form.id))return;e.preventDefault();
 const data=Object.fromEntries(new FormData(form));
 if(form.id==='answer-form'){if(String(data.answer??'').trim())submitAnswer(String(data.answer));else toast('Напиши ответ или нажми «Пока не знаю».');return;}
 if(form.id==='local-form'){
  const name=String(data.name??'').trim();if(!name||name.length>40){$('#auth-error').textContent='Введи имя от 1 до 40 символов.';return;}
  const nextProfile={id:'local-'+crypto.randomUUID(),name,avatar,createdAt:Date.now()};
  if(!writeJSON('cache:'+nextProfile.id,{profile:nextProfile,progress:C.emptyProgress(),pending:[],mode:'local'})){return;}
  if(!writeJSON('local-profiles',[...profiles(),nextProfile]))return;
  profile=nextProfile;progress=C.emptyProgress();mode='local';pending=[];syncError='';route='home';cache();render();return;
 }
 if(form.id==='auth-form'){
  const button=form.querySelector('button[type=submit]'),err=$('#auth-error');button.disabled=true;err.textContent='';
  try{
   const reply=await api(form.dataset.kind,{...data,avatar});writeJSON('last-username',String(data.username).trim().toLowerCase());closeModal();adoptRemote(reply);
   if(reply.recoveryCode)showRecovery(reply.profile.username,reply.recoveryCode);
  }catch(error){err.textContent=error.message;button.disabled=false;}
  return;
 }
 if(form.id==='add-lesson-form'){
  try{
   const id='custom-'+crypto.randomUUID(),lines=String(data.rows).split('\n').map(r=>r.trim()).filter(Boolean);
   const words=lines.map((line,i)=>{const parts=line.split('|').map(s=>s.trim());if(parts.length!==4)throw Error('Строка '+(i+1)+': раздели четыре поля знаком |.');return {id:id+'-w'+(i+1),en:parts[0],ru:parts[1],example:parts[2],exampleRu:parts[3]};});
   const lesson=C.validateCustomLesson({id,title:data.title,words});queueEvent('lesson',{lesson});closeModal();lessonId=lesson.id;nav('lesson');toast('Урок добавлен. Можно слушать слова и тренироваться.');
  }catch(error){$('#lesson-error').textContent=error.message;}
  return;
 }
 if(form.id==='delete-form'){
  const button=form.querySelector('button[type=submit]');button.disabled=true;
  try{
   const old=profile;
   if(mode==='cloud')await api('delete',{password:data.password});
   else writeJSON('local-profiles',profiles().filter(p=>p.id!==old.id));
   try{localStorage.removeItem(STORAGE+'cache:'+old.id);localStorage.removeItem(STORAGE+'active');}catch{}
   profile=null;progress=C.emptyProgress();pending=[];session=null;feedback=null;syncError='';authTab=cloudReady?'login':'local';closeModal();render();toast('Профиль удалён.');
  }catch(error){$('#delete-error').textContent=error.message;button.disabled=false;}
 }
});
document.addEventListener('change',e=>{
 const el=e.target;
 if(el.id==='word-limit')wordLimit=Number(el.value);
 if(el.id==='accent')queueEvent('settings',{settings:{accent:el.value}});
 if(el.id==='speech-rate')queueEvent('settings',{settings:{speechRate:Number(el.value)}});
 if(el.id==='recovery-saved')$('#recovery-done').disabled=!el.checked;
});
let searchTimer;
document.addEventListener('input',e=>{
 if(e.target.id==='speech-rate')$('#rate-label').textContent=Number(e.target.value).toFixed(2);
 if(e.target.id==='word-search'){
  const value=e.target.value,start=e.target.selectionStart;wordSearch=value;pageLimit=35;clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>{if(route==='progress'){render();const input=$('#word-search');input?.focus();input?.setSelectionRange?.(start,start);}},250);
 }
});
document.addEventListener('keydown',e=>{
 const overlay=$('.modal-overlay');
 if(overlay){
  if(e.key==='Escape'){if(!recoveryNotice)closeModal();return;}
  if(e.key==='Tab'){
   const items=[...overlay.querySelectorAll('button:not([disabled]):not(.hidden),input:not([disabled]),textarea,select,a[href],audio[controls]')];
   if(!items.length)return;const first=items[0],last=items[items.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
  return;
 }
 if(route==='train'&&feedback&&e.key==='Enter'){e.preventDefault();act('next-question',{});return;}
 if(route==='train'&&!feedback&&activeQuestion()?.skill==='meaning'&&/^[1-4]$/.test(e.key)&&!['INPUT','TEXTAREA'].includes(e.target.tagName)){
  const choices=[...document.querySelectorAll('[data-action="answer-choice"]')];choices[Number(e.key)-1]?.click();
 }
});
window.addEventListener('online',()=>{syncError='';updateSync();if(profile&&mode==='cloud')flush();});
window.addEventListener('pagehide',()=>{
 cache();const batch=eventBatch(50,48000);if(profile&&mode==='cloud'&&batch.length)api('events',{events:batch},true).catch(()=>{});window.speechSynthesis?.cancel();stopRecording();
});
document.addEventListener('visibilitychange',async()=>{
 if(document.hidden||!profile||mode!=='cloud'||refreshing)return;
 refreshing=true;const owner=profile.id;
 try{await flush();const data=await api('state');if(profile?.id===owner){progress=C.applyEvents(data.progress,pending);cache();if(route!=='train'&&!$('.modal-overlay'))render();}}
 catch(err){syncError=err.status===401?'Нужен повторный вход':'Нет связи · ответы сохранены здесь';updateSync();}finally{refreshing=false;}
});
async function init(){
 const active=readJSON('active',null),cached=active?readJSON('cache:'+active.id,null):null;
 if(cached?.mode==='local'&&cached.profile&&cached.progress){profile=cached.profile;progress=cached.progress;mode='local';route='home';render();}
 if(window.WORDLAB_STANDALONE){cloudReady=false;authTab='local';if(!profile)render();return;}
 try{
  const status=await api('status');cloudReady=!!status.ready;inviteRequired=!!status.registrationCodeRequired;
  if(profile)return;
  try{adoptRemote(await api('state'));}catch(err){
   if(err.status!==401&&cached?.mode==='cloud'){profile=cached.profile;progress=cached.progress;pending=cached.pending??[];mode='cloud';syncError='Нет связи · ответы сохранены здесь';render();return;}
   authTab='login';render();
  }
 }catch(err){
  if(!profile&&cached?.mode==='cloud'){profile=cached.profile;progress=cached.progress;pending=cached.pending??[];mode='cloud';syncError='Нет связи · ответы сохранены здесь';render();return;}
  cloudReady=false;authTab='local';if(!profile)render();
 }
}
init();
})();
