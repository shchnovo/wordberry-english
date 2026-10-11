import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHandler} from '../server/handler.mjs';
import {MemoryStore} from './memory-store.mjs';
const base='https://words.example/.netlify/functions/wordbook';
function setup(options={}){
 const store=new MemoryStore();let at=Date.UTC(2026,9,10,17);const handler=createHandler(()=>store,{now:()=>at,...options});
 const request=async(action,body,cookie='',extra={})=>{
  const res=await handler(new Request(base+'?action='+action,{method:body?'POST':'GET',headers:{...(body?{'Content-Type':'application/json','Origin':'https://words.example'}:{}),...(cookie?{'Cookie':cookie}:{}),...extra},body:body?JSON.stringify(body):undefined}));
  return {status:res.status,body:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0],headers:res.headers};
 };
 return {store,request,setTime:n=>at=n};
}
const user=(username='ulyana')=>({username,name:'Ульяна',password:'securepass2026',avatar:'cat'});
test('registration, re-login from another device and private progress persistence',async()=>{
 const {request,store}=setup();const registered=await request('register',user());assert.equal(registered.status,201);assert.equal(registered.body.profile.name,'Ульяна');assert.ok(registered.body.recoveryCode);
 assert.ok(registered.headers.get('set-cookie').includes('HttpOnly'));assert.ok(registered.headers.get('set-cookie').includes('Secure'));
 const account=await store.get('accounts/ulyana');assert.ok(account.password.key);assert.equal(JSON.stringify(account).includes('securepass2026'),false);
 const event={id:'answer-test-123456',type:'attempt',at:Date.UTC(2026,9,10,17),wordId:'w-hello',skill:'spelling',answer:'hello',correct:false};
 const saved=await request('events',{events:[event]},registered.cookie);assert.equal(saved.status,200);assert.equal(saved.body.progress.words['w-hello'].correct,1);
 const again=await request('events',{events:[event]},registered.cookie);assert.equal(again.body.progress.words['w-hello'].attempts,1);
 const device=await request('login',{username:'ULYANA',password:'securepass2026'});assert.equal(device.status,200);assert.equal(device.body.progress.words['w-hello'].correct,1);
 const foreign=await request('register',user('otherchild'));assert.equal((await request('state',null,foreign.cookie)).body.progress.words['w-hello'],undefined);
 assert.equal((await request('state')).status,401);
});
test('server recomputes correct answers and does not award hint credit',async()=>{
 const {request}=setup();const a=await request('register',user());const send=(id,answer,usedHint=false)=>request('events',{events:[{id,type:'attempt',at:Date.UTC(2026,9,10,17),wordId:'w-hello',skill:'spelling',answer,correct:true,usedHint}]},a.cookie);
 await send('fake-score-123456','helo');await send('hint-score-123456','hello',true);const result=await send('real-score-123456','hello');assert.equal(result.body.progress.words['w-hello'].correct,1);assert.equal(result.body.progress.words['w-hello'].attempts,3);
});
test('simultaneous updates preserve both answers with compare-and-swap retries',async()=>{
 const {request,store}=setup();const a=await request('register',user());store.failOnce=true;
 const make=(id,skill)=>request('events',{events:[{id,type:'attempt',at:Date.UTC(2026,9,10,17),wordId:'w-hello',skill,answer:'hello'}]},a.cookie);
 const results=await Promise.all([make('parallel-answer-123','spelling'),make('parallel-answer-456','listening')]);assert.deepEqual(results.map(r=>r.status),[200,200]);
 const state=await request('state',null,a.cookie);assert.equal(state.body.progress.words['w-hello'].attempts,2);
});
test('recovery changes the password and invalidates old sessions',async()=>{
 const {request}=setup();const a=await request('register',user());assert.equal((await request('recover',{username:'ulyana',recoveryCode:'wrong',password:'replacement123'})).status,401);
 const b=await request('recover',{username:'ulyana',recoveryCode:a.body.recoveryCode,password:'replacement123'});assert.equal(b.status,200);
 assert.equal((await request('state',null,a.cookie)).status,401);
 assert.equal((await request('login',{username:'ulyana',password:'securepass2026'})).status,401);
 assert.equal((await request('login',{username:'ulyana',password:'replacement123'})).status,200);
});
test('unique logins are atomic, sessions expire, and cross-origin writes are denied',async()=>{
 const {request,setTime}=setup();const results=await Promise.all([request('register',user()),request('register',user())]);assert.deepEqual(results.map(r=>r.status).sort(),[201,409]);const a=results.find(r=>r.status===201);
 assert.equal((await request('events',{events:[]},a.cookie,{'Origin':'https://evil.example'})).status,403);
 setTime(Date.UTC(2027,0,1));assert.equal((await request('state',null,a.cookie)).status,401);
});
test('save custom words and the exact resume location in a single batch',async()=>{
 const {request}=setup();const a=await request('register',user());const id='custom-12345678',wid=id+'-w1';
 const lesson={id,title:'На завтра',words:[{id:wid,en:'apple',ru:'яблоко',example:'I eat an apple.',exampleRu:'Я ем яблоко.'}]};
 const s={id:'session-resume-123',lessonId:id,mode:'mix',items:[{wordId:wid,skill:'meaning'},{wordId:wid,skill:'spelling'}],index:1,correct:1,wrong:0,startedAt:Date.UTC(2026,9,10,17)};
 const events=[{id:'custom-lesson-123',type:'lesson',lesson,at:Date.UTC(2026,9,10,17)},{id:'custom-answer-123',type:'attempt',wordId:wid,skill:'meaning',answer:'яблоко',at:Date.UTC(2026,9,10,17)+1},{id:'custom-session-123',type:'session',lessonId:id,session:s,at:Date.UTC(2026,9,10,17)+2}];
 const b=await request('events',{events},a.cookie);assert.equal(b.status,200);const second=await request('login',{username:'ulyana',password:'securepass2026'});assert.equal(second.body.progress.resume.index,1);assert.equal(second.body.progress.customLessons.length,1);
});
test('account deletion requires password and prevents every existing session from reading it',async()=>{
 const {request}=setup();const a=await request('register',user());const b=await request('login',{username:'ulyana',password:'securepass2026'});
 assert.equal((await request('delete',{password:'bad'},a.cookie)).status,401);
 assert.equal((await request('delete',{password:'securepass2026'},a.cookie)).status,200);assert.equal((await request('state',null,b.cookie)).status,401);
});
