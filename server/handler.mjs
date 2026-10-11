import {randomBytes, createHash, timingSafeEqual, scrypt as scryptCallback} from 'node:crypto';
import {promisify} from 'node:util';
import course from '../data/course.json' with {type:'json'};
import {emptyProgress,applyEvent,allWords,allLessons,SKILLS,checkAnswer,blankExample,validateCustomLesson,DAY} from '../shared/core.mjs';
const scrypt=promisify(scryptCallback);
const COOKIE='wordberry_session';
const MAX_AGE=30*24*3600;
const hash=s=>createHash('sha256').update(s).digest('hex');
class Problem extends Error {constructor(status,message){super(message);this.status=status;}}
function fail(status,message){throw new Problem(status,message);}
function json(data,status=200,cookie) {
 const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Vary':'Cookie'};
 if(cookie)headers['Set-Cookie']=cookie;
 return new Response(JSON.stringify(data),{status,headers});
}
function cookieHeader(token,maxAge=MAX_AGE) {return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${maxAge}`;}
function tokenFrom(req) {return (req.headers.get('cookie')??'').split(';').map(s=>s.trim()).find(s=>s.startsWith(COOKIE+'='))?.slice(COOKIE.length+1)??'';}
function normalizeUsername(s) {return String(s??'').trim().toLowerCase();}
function validateUsername(s) {if(!/^[a-z][a-z0-9_-]{2,23}$/.test(s))fail(400,'Логин: 3–24 латинские буквы, цифры, дефис или подчёркивание. Начни с буквы.');return s;}
function validatePassword(s) {if(typeof s!=='string'||s.length<8||s.length>128)fail(400,'Пароль должен содержать от 8 до 128 символов.');return s;}
function validateName(s) {if(typeof s!=='string'||s.trim().length<1||s.trim().length>40||/[<>\u0000-\u001f]/.test(s))fail(400,'Имя: от 1 до 40 символов.');return s.trim();}
async function passwordRecord(password){const salt=randomBytes(16).toString('hex');const key=await scrypt(password,salt,32);return {salt,key:key.toString('hex')};}
async function verifyPassword(password,record){const candidate=await scrypt(String(password),record.salt,32);const original=Buffer.from(record.key,'hex');return candidate.length===original.length&&timingSafeEqual(candidate,original);}
function publicProfile(a){return {id:a.id,username:a.username,name:a.name,avatar:a.avatar,createdAt:a.createdAt};}
async function readBody(req) {
 const size=Number(req.headers.get('content-length')||0);if(size>180000)fail(413,'Слишком большой запрос.');
 const raw=await req.text();if(raw.length>180000)fail(413,'Слишком большой запрос.');
 try {const body=JSON.parse(raw);if(!body||Array.isArray(body)||typeof body!=='object')throw Error();return body;}catch{fail(400,'Не удалось прочитать запрос.');}
}
function checkOrigin(req) {
 const origin=req.headers.get('origin');
 if(origin && origin!==new URL(req.url).origin)fail(403,'Запрос с другого сайта отклонён.');
 const site=req.headers.get('sec-fetch-site');if(site && !['same-origin','none'].includes(site))fail(403,'Запрос с другого сайта отклонён.');
 if(req.method==='POST' && !req.headers.get('content-type')?.startsWith('application/json'))fail(415,'Нужен формат JSON.');
}
function checkedEvent(raw,p,now) {
 if(!raw || typeof raw.id!=='string'||!/^[a-zA-Z0-9_-]{10,80}$/.test(raw.id)||!Number.isFinite(raw.at))fail(400,'Неверное событие тренировки.');
 const e={id:raw.id,at:Math.min(now,Math.max(now-365*DAY,Math.round(raw.at))),type:raw.type};
 if(raw.type==='lesson') {
   if(p.customLessons.length>=100 && !p.customLessons.some(x=>x.id===raw.lesson?.id))fail(400,'В профиле уже 100 своих уроков.');
   try{e.lesson=validateCustomLesson(raw.lesson);}catch(err){fail(400,err.message);}
 } else if(raw.type==='attempt') {
   const words=new Map(allWords(course,p).map(w=>[w.id,w])),word=words.get(raw.wordId);
   if(!word || !SKILLS.includes(raw.skill)||typeof raw.answer!=='string'||raw.answer.length>250)fail(400,'Неверное слово или ответ.');
   const expected=raw.skill==='meaning'?word.ru:raw.skill==='context'?blankExample(word)?.answer:word.en;
   const aliases=['spelling','listening'].includes(raw.skill)?word.aliases??[]:[];
   e.wordId=raw.wordId;e.skill=raw.skill;e.correct=checkAnswer(raw.answer,expected,aliases) && !raw.usedHint;
 } else if(raw.type==='session') {
   const lessons=new Set(allLessons(course,p).map(l=>l.id)); lessons.add('review');
   if(!lessons.has(raw.lessonId))fail(400,'Урок не найден.');
   e.lessonId=raw.lessonId;
   if(raw.session===null)e.session=null;
   else {
     const s=raw.session,words=new Set(allWords(course,p).map(w=>w.id));
     if(!s || typeof s.id!=='string'||!/^[a-zA-Z0-9_-]{10,80}$/.test(s.id)||s.lessonId!==raw.lessonId||!['mix','review',...SKILLS].includes(s.mode)||!Array.isArray(s.items)||s.items.length<1||s.items.length>200||!Number.isInteger(s.index)||s.index<0||s.index>s.items.length||!Number.isInteger(s.correct)||s.correct<0||!Number.isInteger(s.wrong)||s.wrong<0||s.correct+s.wrong>s.index||!Number.isFinite(s.startedAt))fail(400,'Не удалось сохранить место в занятии.');
     e.session={id:s.id,lessonId:s.lessonId,mode:s.mode,index:s.index,correct:s.correct,wrong:s.wrong,startedAt:s.startedAt,items:s.items.map(item=>{
       if(!words.has(item.wordId)||!SKILLS.includes(item.skill))fail(400,'Неверная карточка занятия.');
       return {wordId:item.wordId,skill:item.skill};
     })};
   }
 } else if(raw.type==='location') {
   if(!allLessons(course,p).some(l=>l.id===raw.lessonId))fail(400,'Урок не найден.');
   e.lessonId=raw.lessonId;
 } else if(raw.type==='settings') {
   const s=raw.settings??{},clean={};
   if(s.dailyGoal!==undefined){if(![10,20,40].includes(s.dailyGoal))fail(400,'Неверная дневная цель.');clean.dailyGoal=s.dailyGoal;}
   if(s.speechRate!==undefined){if(!Number.isFinite(s.speechRate)||s.speechRate<0.6||s.speechRate>1.1)fail(400,'Неверная скорость.');clean.speechRate=s.speechRate;}
   if(s.accent!==undefined){if(!['en-GB','en-US'].includes(s.accent))fail(400,'Неверное произношение.');clean.accent=s.accent;}
   e.settings=clean;
 }else fail(400,'Неизвестное событие.');
 return e;
}
export function createHandler(getStore,{now=()=>Date.now(),registrationCode='',log=()=>{}}={}) {
 return async function handler(req) {
  try {
   if(!['GET','POST'].includes(req.method))return json({error:'Метод не поддерживается.'},405);
   checkOrigin(req);
   const action=new URL(req.url).searchParams.get('action')||'state';
   const store=getStore();
   if(action==='status'&&req.method==='GET'){await store.get('health');return json({ready:true,registrationCodeRequired:!!registrationCode,version:1});}
   let body={};if(req.method==='POST')body=await readBody(req);
   async function newSession(account) {
    const token=randomBytes(32).toString('base64url');
    await store.setJSON('sessions/'+hash(token),{username:account.username,userId:account.id,authVersion:account.authVersion,expiresAt:now()+MAX_AGE*1000});
    return cookieHeader(token);
   }
   async function stateFor(a){return {profile:publicProfile(a),progress:(await store.get('progress/'+a.id,{type:'json'}))??emptyProgress()};}
   if(['register','login','recover'].includes(action)) {
    if(req.method!=='POST')fail(405,'Используй POST.');
    const username=validateUsername(normalizeUsername(body.username));
    if(action==='register') {
     if(registrationCode && body.invite!==registrationCode)fail(403,'Попроси у взрослого код регистрации.');
     const name=validateName(body.name),password=validatePassword(body.password);
     const recoveryCode=randomBytes(18).toString('base64url');
     const a={id:randomBytes(16).toString('hex'),username,name,avatar:['berry','sun','cat','leaf'].includes(body.avatar)?body.avatar:'berry',createdAt:now(),authVersion:1,password:await passwordRecord(password),recoveryHash:hash(recoveryCode)};
     const result=await store.setJSON('accounts/'+username,a,{onlyIfNew:true});
     if(!result.modified)fail(409,'Этот логин уже занят. Выбери другой.');
     const cookie=await newSession(a);return json({...await stateFor(a),recoveryCode},201,cookie);
    }
    let record=await store.getWithMetadata('accounts/'+username,{type:'json'}),a=record?.data;
    if(action==='login') {
     if(typeof body.password!=='string'||body.password.length>128)fail(400,'Введи пароль.');
     // Run the KDF also for unknown usernames to reduce useful timing differences.
     const correct=await verifyPassword(body.password,a?.password??{salt:'0'.repeat(32),key:'0'.repeat(64)});
     if(!a||!correct)fail(401,'Логин или пароль не подошёл. Проверь раскладку клавиатуры.');
    } else {
     const code=String(body.recoveryCode??'').trim(),replacement=validatePassword(body.password);
     if(!a||code.length>100||!timingSafeEqual(Buffer.from(hash(code)),Buffer.from(a.recoveryHash)))fail(401,'Логин или код восстановления не подошёл.');
     a={...a,password:await passwordRecord(replacement),authVersion:a.authVersion+1};
     const result=await store.setJSON('accounts/'+username,a,{onlyIfMatch:record.etag});if(!result.modified)fail(409,'Профиль изменился. Попробуй ещё раз.');
    }
    const cookie=await newSession(a);return json(await stateFor(a),200,cookie);
   }
   const token=tokenFrom(req);
   if(!/^[a-zA-Z0-9_-]{40,60}$/.test(token))fail(401,'Войди в профиль, чтобы продолжить.');
   const session=await store.get('sessions/'+hash(token),{type:'json'});
   if(!session||session.expiresAt<=now()) {if(session)await store.delete('sessions/'+hash(token));fail(401,'Пора войти в профиль снова.');}
   const a=await store.get('accounts/'+session.username,{type:'json'});
   if(!a||a.id!==session.userId||a.authVersion!==session.authVersion)fail(401,'Войди в профиль снова.');
   if(action==='state'&&req.method==='GET')return json(await stateFor(a));
   if(action==='logout'&&req.method==='POST') {await store.delete('sessions/'+hash(token));return json({ok:true},200,cookieHeader('',0));}
   if(action==='events'&&req.method==='POST') {
    if(!Array.isArray(body.events)||!body.events.length||body.events.length>100)fail(400,'За раз можно сохранить от 1 до 100 событий.');
    const key='progress/'+a.id;
    for(let retry=0;retry<5;retry++) {
     const record=await store.getWithMetadata(key,{type:'json'});let p=record?.data??emptyProgress();
     for(const raw of [...body.events].sort((x,y)=>(x.at??0)-(y.at??0)||String(x.id).localeCompare(String(y.id))))p=applyEvent(p,checkedEvent(raw,p,now()));
     const result=await store.setJSON(key,p,record?{onlyIfMatch:record.etag}:{onlyIfNew:true});
     if(result.modified)return json({progress:p,acked:body.events.map(e=>e.id)});
    }
    fail(409,'Профиль открыт на другом устройстве. Ответы сохранены здесь; попробуем отправить снова.');
   }
   if(action==='delete'&&req.method==='POST') {
    if(typeof body.password!=='string'||body.password.length>128||!await verifyPassword(body.password,a.password))fail(401,'Для удаления нужен правильный пароль.');
    // Removing the account invalidates every outstanding session immediately.
    await store.delete('accounts/'+a.username);await store.delete('progress/'+a.id);await store.delete('sessions/'+hash(token));
    return json({ok:true},200,cookieHeader('',0));
   }
   fail(404,'Действие не найдено.');
  }catch(error){
   if(error instanceof Problem)return json({error:error.message},error.status);
   // Do not log passwords, user payloads, cookies or platform credentials.
   log('wordberry-service-error',error?.name??'Error');
   return json({error:'Сохранение сейчас недоступно. Проверь интернет и попробуй ещё раз.'},503);
  }
 };
}
