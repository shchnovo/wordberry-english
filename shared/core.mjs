/* Shared deterministic learning rules used in the browser and in Functions. */
export const SKILLS = ['meaning', 'spelling', 'listening', 'context'];
export const SKILL_NAMES = {meaning:'Перевод', spelling:'Написание', listening:'На слух', context:'В предложении'};
export const DAY = 86400000;
export const INTERVALS = [0, 10*60000, DAY, 3*DAY, 7*DAY, 14*DAY, 30*DAY];
export function emptyProgress() {
  return {version:1, words:{}, applied:[], resume:null, currentLesson:'starter-hello', customLessons:[], settings:{dailyGoal:20, speechRate:0.85, accent:'en-GB'}, history:{}, updatedAt:0};
}
export function normalizeAnswer(value) {
  return String(value ?? '').normalize('NFKC').toLowerCase().trim().replace(/[‘’`]/g,"'").replace(/[‐‑–—]/g,'-').replace(/[.!?,;:]+$/g,'').replace(/\s+/g,' ');
}
export function checkAnswer(input, expected, aliases=[]) {
  const given=normalizeAnswer(input);
  return !!given && [expected,...aliases].some(x=>normalizeAnswer(x)===given);
}
export function freshWord() {
  return {firstSeenAt:0, lastSeenAt:0, confirmedAt:0, attempts:0, correct:0, skills:Object.fromEntries(SKILLS.map(s=>[s,{level:0, attempts:0, correct:0, due:0, lastAt:0}]))};
}
export function wordStatus(entry) {
  if(!entry || !entry.attempts)return 'new';
  if(SKILLS.every(s=>(entry.skills[s]?.level??0)>=2) && entry.confirmedAt)return 'learned';
  if(SKILLS.every(s=>(entry.skills[s]?.level??0)>=1))return 'familiar';
  return 'learning';
}
export function wordPercent(entry) {
  if(!entry)return 0;
  return Math.round(SKILLS.reduce((a,s)=>a+Math.min(2,entry.skills[s]?.level??0),0)/8*100);
}
export function isDue(entry, now=Date.now()) {
  return !!entry && SKILLS.some(s=>entry.skills[s]?.attempts && entry.skills[s].due<=now);
}
export function blankExample(word) {
  // Authors choose a literal target (also valid for irregular/inflected forms).
  const target=word.target||word.en;
  if(!target || !word.example)return null;
  const hay=word.example.toLowerCase(),needle=target.toLowerCase();
  let i=hay.indexOf(needle);
  while(i>=0) {
    if(!/[a-z]/.test(hay[i-1]||'') && !/[a-z]/.test(hay[i+needle.length]||''))break;
    i=hay.indexOf(needle,i+1);
  }
  if(i<0)return null;
  return {before:word.example.slice(0,i),after:word.example.slice(i+target.length),answer:word.example.slice(i,i+target.length)};
}
export function localDay(timestamp=Date.now()) {
  return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(timestamp));
}
export function applyEvent(progress,event) {
  if(progress.applied.includes(event.id))return progress;
  const p=structuredClone(progress);
  const at=event.at;
  if(event.type==='attempt') {
    const w=p.words[event.wordId]??freshWord();
    if(!w.firstSeenAt)w.firstSeenAt=at;
    w.lastSeenAt=Math.max(w.lastSeenAt,at); w.attempts++; if(event.correct)w.correct++;
    const s=w.skills[event.skill]; s.attempts++; if(event.correct)s.correct++;
    // An older offline answer counts in the totals but doesn't roll scheduling back.
    if(at>=s.lastAt) {
      s.level=event.correct?Math.min(6,s.level+1):0;
      s.due=at+(event.correct?INTERVALS[s.level]:5*60000); s.lastAt=at;
    }
    if(event.correct && at-w.firstSeenAt>=20*3600000)w.confirmedAt=at;
    p.words[event.wordId]=w;
    const day=localDay(at),h=p.history[day]??{attempts:0,correct:0};
    h.attempts++;if(event.correct)h.correct++;p.history[day]=h;
  } else if(event.type==='session') {
    if(at >= (p.resumeUpdatedAt??0)){p.resume=event.session;p.resumeUpdatedAt=at;}
    if(at >= (p.currentLessonAt??0)){p.currentLesson=event.lessonId||p.currentLesson;p.currentLessonAt=at;}
  } else if(event.type==='location') {
    if(at >= (p.currentLessonAt??0)){p.currentLesson=event.lessonId;p.currentLessonAt=at;}
  } else if(event.type==='settings') {
    if(at >= (p.settingsUpdatedAt??0)){p.settings={...p.settings,...event.settings};p.settingsUpdatedAt=at;}
  } else if(event.type==='lesson') {
    if(!p.customLessons.some(l=>l.id===event.lesson.id))p.customLessons.push(event.lesson);
  }
  // Keep IDs for deduplication. Max is chosen to cover > a year of daily family practice.
  p.applied.push(event.id);if(p.applied.length>50000)p.applied=p.applied.slice(-50000);
  p.updatedAt=Math.max(p.updatedAt??0,at);
  return p;
}
export function applyEvents(progress,events) {
  return [...events].sort((a,b)=>a.at-b.at||a.id.localeCompare(b.id)).reduce(applyEvent,progress);
}
export function allLessons(course,progress) {return [...course.lessons,...(progress?.customLessons??[])];}
export function allWords(course,progress) {return allLessons(course,progress).flatMap(l=>l.words.map(w=>({...w,lessonId:l.id})));}
export function courseStats(course,progress,now=Date.now()) {
  const words=allWords(course,progress);
  const seen=words.filter(w=>progress.words[w.id]?.attempts);
  const correct=seen.reduce((n,w)=>n+(progress.words[w.id]?.correct??0),0);
  const attempts=seen.reduce((n,w)=>n+(progress.words[w.id]?.attempts??0),0);
  return {total:words.length, seen:seen.length, learned:seen.filter(w=>wordStatus(progress.words[w.id])==='learned').length, familiar:seen.filter(w=>['familiar','learned'].includes(wordStatus(progress.words[w.id]))).length, due:seen.filter(w=>isDue(progress.words[w.id],now)).length, attempts, accuracy:attempts?Math.round(100*correct/attempts):0};
}
export function lessonStats(lesson,progress) {
  const entries=lesson.words.map(w=>progress.words[w.id]);
  return {learned:entries.filter(w=>wordStatus(w)==='learned').length,seen:entries.filter(w=>w?.attempts).length,percent:Math.round(entries.reduce((a,w)=>a+wordPercent(w),0)/lesson.words.length)};
}
export function shuffle(items,random=Math.random) {
  const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a;
}
export function makeSession(lesson,progress,mode='mix',limit=5,now=Date.now(),random=Math.random) {
  let pool=lesson.words;
  if(mode==='review')pool=pool.filter(w=>isDue(progress.words[w.id],now));
  pool=[...pool].sort((a,b)=>{
    const x=progress.words[a.id],y=progress.words[b.id];
    const rank=w=>!w?.attempts?1:isDue(w,now)?0:2;
    return rank(x)-rank(y)||wordPercent(x)-wordPercent(y);
  }).slice(0,limit);
  const skillSet=SKILLS.includes(mode)?[mode]:SKILLS;
  const items=[];
  // Space successive modes apart: all meanings, then writing, hearing and context.
  for(const skill of skillSet)for(const w of shuffle(pool,random))items.push({wordId:w.id,skill});
  return {id:globalThis.crypto.randomUUID(),lessonId:lesson.id,mode,items,index:0,correct:0,wrong:0,startedAt:now};
}
export function makeChoices(word,words,field,random=Math.random) {
  const answer=word[field];
  const other=shuffle([...new Set(words.filter(w=>w.id!==word.id).map(w=>w[field]).filter(v=>v && v!==answer))],random).slice(0,3);
  return shuffle([answer,...other],random);
}
export function validateCustomLesson(input) {
  if(!input || typeof input.id!=='string' || !/^custom-[a-z0-9-]{8,70}$/.test(input.id))throw Error('Неверный идентификатор урока.');
  const title=String(input.title??'').trim();
  if(title.length<2 || title.length>80)throw Error('Название урока: от 2 до 80 символов.');
  if(!Array.isArray(input.words) || !input.words.length || input.words.length>60)throw Error('Добавь от 1 до 60 слов.');
  const ids=new Set();
  const words=input.words.map((w,i)=>{
    const en=String(w.en??'').trim(),ru=String(w.ru??'').trim(),example=String(w.example??'').trim(),exampleRu=String(w.exampleRu??'').trim();
    if(!en || en.length>70 || !ru || ru.length>100 || !example || example.length>200 || !exampleRu || exampleRu.length>240)throw Error(`Строка ${i+1}: нужны слово, перевод, пример и перевод примера.`);
    if(!/^[a-zA-Z][a-zA-Z '\-]*$/.test(en))throw Error(`Строка ${i+1}: слово должно быть на английском.`);
    const id=String(w.id??'');if(id!==`${input.id}-w${i+1}` || ids.has(id))throw Error('Неверный номер слова.');ids.add(id);
    const entry={id,en,ru,example,exampleRu,emoji:'✦'};
    if(!blankExample(entry))throw Error(`Строка ${i+1}: пример должен содержать слово «${en}» целиком.`);
    return entry;
  });
  return {id:input.id,module:'custom',code:'Мой урок',title,subtitle:'Слова, которые задали в школе',source:'Добавлено в профиле',words};
}
