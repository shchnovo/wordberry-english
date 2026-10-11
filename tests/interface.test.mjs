import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import {parseHTML} from 'linkedom';
import {createHandler} from '../server/handler.mjs';
import {MemoryStore} from './memory-store.mjs';
const root=new URL('../',import.meta.url);
const source=Object.fromEntries(await Promise.all(['dist/index.html','dist/course.js','dist/core.js','src/app.js'].map(async p=>[p,await fs.readFile(new URL(p,root),'utf8')])));
const course=JSON.parse(await fs.readFile(new URL('data/course.json',root),'utf8'));
const words=new Map(course.lessons.flatMap(l=>l.words).map(w=>[w.id,w]));
const tick=()=>new Promise(resolve=>setImmediate(resolve));
async function until(fn){for(let i=0;i<150;i++){if(fn())return;await new Promise(r=>setTimeout(r,15));}throw Error('Condition not reached');}
function harness(memory=new Map(),fetchFn=null,inlineHTML=null){
 const {window:dom,document}=parseHTML(inlineHTML||source['dist/index.html']);const listeners=new Map();
 const window={document,Event:dom.Event,HTMLElement:dom.HTMLElement,addEventListener:(name,fn)=>{const list=listeners.get(name)||[];list.push(fn);listeners.set(name,list);},dispatchEvent:event=>{for(const fn of listeners.get(event.type)||[])fn(event);}};
 const timers=new Set();const errors=[];
 const set=(fn,ms)=>{const t=setTimeout(()=>{timers.delete(t);fn();},ms);t.unref();timers.add(t);return t;};
 const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,String(v)),removeItem:k=>memory.delete(k)};
 window.localStorage=storage;window.WORDLAB_STANDALONE=!fetchFn;window.scrollTo=()=>{};
 window.speechSynthesis={getVoices:()=>[{lang:'en-GB'}],cancel:()=>{},speak:u=>u.onstart?.()};
 class FormDataForDOM{constructor(form){this.values=[];for(const el of form.querySelectorAll('input,textarea,select'))if(el.name&&!el.disabled&&!(el.type==='checkbox'&&!el.checked))this.values.push([el.name,el.value]);}*[Symbol.iterator](){yield* this.values;}}
 class Utterance{constructor(text){this.text=text;}}
 window.SpeechSynthesisUtterance=Utterance;window.navigator={};window.crypto=webcrypto;
 window.HTMLElement.prototype.focus=function(){this.ownerDocument._active=this;};window.HTMLElement.prototype.setSelectionRange=function(){};
 Object.defineProperty(document,'activeElement',{get(){return document._active??document.body;}});
 const context=vm.createContext({window,document,navigator:window.navigator,localStorage:storage,crypto:webcrypto,structuredClone,FormData:FormDataForDOM,SpeechSynthesisUtterance:Utterance,Blob,URL,fetch:fetchFn||(()=>Promise.reject(Error('no fetch'))),AbortController,Intl,Date,setTimeout:set,clearTimeout,console:{...console,error:(...args)=>errors.push(args)}});
 if(inlineHTML){for(const script of document.querySelectorAll('script'))vm.runInContext(script.textContent,context,{filename:'standalone'});}
 else for(const f of ['dist/course.js','dist/core.js','src/app.js'])vm.runInContext(source[f],context,{filename:f});
 const click=(selector)=>{const el=typeof selector==='string'?document.querySelector(selector):selector;assert.ok(el,'Missing element: '+selector);el.dispatchEvent(new window.Event('click',{bubbles:true,cancelable:true}));return el;};
 const submit=selector=>document.querySelector(selector).dispatchEvent(new window.Event('submit',{bubbles:true,cancelable:true}));
 const change=selector=>document.querySelector(selector).dispatchEvent(new window.Event('change',{bubbles:true,cancelable:true}));
 const state=()=>{const active=JSON.parse(memory.get('wordberry:v1:active'));return JSON.parse(memory.get('wordberry:v1:cache:'+active.id));};
 const correct=()=>{
  const s=state().progress.resume,item=s.items[s.index],w=words.get(item.wordId)||state().progress.customLessons.flatMap(l=>l.words).find(x=>x.id===item.wordId);
  if(item.skill==='meaning')click([...document.querySelectorAll('[data-action="answer-choice"]')].find(el=>el.dataset.answer===w.ru));
  else{
   if(item.skill==='listening')click('[data-action="play-current"]');
   document.querySelector('#answer-input').value=item.skill==='context'?w.target||w.en:w.en;submit('#answer-form');
  }
 };
 return {window,document,memory,click,submit,change,state,correct,errors,close:()=>{for(const t of timers)clearTimeout(t);}};
}
function localProfile(h){h.document.querySelector('#child-name').value='Ульяна';h.submit('#local-form');}
test('the child can register locally, finish all four training modes and resume after reload',async()=>{
 const memory=new Map(),h=harness(memory);try{
  localProfile(h);assert.match(h.document.body.textContent,/Привет, Ульяна/);h.click('[data-action="start-current"]');
  h.correct();assert.equal(h.state().progress.resume.index,1);assert.equal(h.state().progress.resume.correct,1);
 }finally{h.close();}
 const reopened=harness(memory);try{
  assert.match(reopened.document.body.textContent,/карточка 2 из 20/);reopened.click('[data-action="resume"]');
  while(reopened.state().progress.resume.index<reopened.state().progress.resume.items.length){reopened.correct();reopened.click('[data-action="next-question"]');}
  assert.match(reopened.document.body.textContent,/20 \/ 20/);
  assert.equal(Object.values(reopened.state().progress.words).filter(w=>w.attempts===4).length,5);
  reopened.click('[data-action="finish-session"]');assert.equal(reopened.state().progress.resume,null);
  reopened.click('[data-action="nav"][data-route="progress"]');assert.match(reopened.document.body.textContent,/20/);assert.equal(reopened.errors.length,0);
  reopened.click('[data-action="nav"][data-route="course"]');reopened.click('[data-action="lesson"][data-id="7a-months"]');assert.equal(reopened.state().progress.currentLesson,'7a-months');
 }finally{reopened.close();}
});
test('custom lesson form refuses incomplete context and persists a valid lesson',()=>{
 const h=harness();try{
  localProfile(h);h.click('[data-action="nav"][data-route="course"]');h.click('[data-action="add-lesson"]');
  h.document.querySelector('#new-lesson-title').value='Слова на завтра';h.document.querySelector('#new-lesson-rows').value='apple | яблоко | I like pineapple. | Мне нравится ананас.';h.submit('#add-lesson-form');
  assert.match(h.document.querySelector('#lesson-error').textContent,/целиком/);
  h.document.querySelector('#new-lesson-rows').value='apple | яблоко | I eat an apple. | Я ем яблоко.';h.submit('#add-lesson-form');
  assert.equal(h.state().progress.customLessons.length,1);assert.match(h.document.body.textContent,/Слова на завтра/);assert.match(h.document.body.textContent,/apple/);assert.equal(h.errors.length,0);
 }finally{h.close();}
});
function cloudFetch(handler){
 let cookie='',online=true;
 const fetch=async(url,options={})=>{
  if(!online)throw Error('offline');
  const req=new Request(new URL(url,'https://words.example/'),{method:options.method||'GET',headers:{...options.headers, ...(cookie?{'Cookie':cookie}:{}),...(options.method==='POST'?{Origin:'https://words.example'}:{})},body:options.body});
  const response=await handler(req);const set=response.headers.get('set-cookie');if(set)cookie=set.split(';')[0];return response;
 };
 return {fetch,offline:()=>online=false,online:()=>online=true};
}
test('cloud UI syncs offline answers later and another device sees the same lesson position',async()=>{
 const store=new MemoryStore(),handler=createHandler(()=>store),network=cloudFetch(handler),h=harness(new Map(),network.fetch);let second;
 try{
  await until(()=>h.document.querySelector('#auth-form'));
  h.click('[data-action="auth-tab"][data-tab="register"]');h.document.querySelector('#profile-name').value='Ульяна';h.document.querySelector('#username').value='ulyana';h.document.querySelector('#password').value='securepass2026';h.submit('#auth-form');
  await until(()=>h.document.querySelector('#recovery-saved'));
  h.document.querySelector('#recovery-saved').checked=true;h.change('#recovery-saved');h.click('[data-action="recovery-done"]');h.click('[data-action="start-current"]');h.correct();
  await until(()=>h.state().pending.length===0);assert.equal((await store.get('progress/'+h.state().profile.id)).resume.index,1);
  network.offline();h.click('[data-action="next-question"]');h.correct();await new Promise(r=>setTimeout(r,1000));assert.ok(h.state().pending.length>0);assert.match(h.document.querySelector('#sync-state').textContent,/Нет связи/);
  network.online();h.window.dispatchEvent(new h.window.Event('online'));await until(()=>h.state().pending.length===0);assert.equal((await store.get('progress/'+h.state().profile.id)).resume.index,2);
  const otherNetwork=cloudFetch(handler);second=harness(new Map(),otherNetwork.fetch);await until(()=>second.document.querySelector('#auth-form'));
  second.document.querySelector('#username').value='ulyana';second.document.querySelector('#password').value='securepass2026';second.submit('#auth-form');await until(()=>second.document.body.textContent.includes('карточка 3 из 20'));
  assert.equal(second.state().progress.resume.index,2);assert.equal(second.state().profile.name,'Ульяна');assert.equal(h.errors.length,0);assert.equal(second.errors.length,0);
 }finally{h.close();second?.close();}
});

test('the delivered standalone HTML starts a real local lesson without external code',async()=>{
 const html=await fs.readFile(new URL('wordberry-preview.html',root),'utf8');const h=harness(new Map(),null,html);
 try{
  assert.equal(h.document.querySelector('script[src],link[rel=stylesheet]'),null);
  localProfile(h);h.click('[data-action="start-current"]');h.correct();assert.equal(h.state().progress.resume.index,1);assert.match(h.document.body.textContent,/Да, получилось/);assert.equal(h.errors.length,0);
 }finally{h.close();}
});
