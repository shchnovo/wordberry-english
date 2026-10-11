import {test} from 'node:test';
import assert from 'node:assert/strict';
import course from '../data/course.json' with {type:'json'};
import * as C from '../shared/core.mjs';
const now=Date.UTC(2026,9,10,17,0);
let counter=0;
const attempt=(wordId,skill,correct,at=now)=>({id:'event-'+(++counter)+'-unique',type:'attempt',wordId,skill,correct,at});
test('every authored card has a valid whole-word context and a unique ID',()=>{
 const ids=new Set();assert.equal(course.lessons.length,36);
 for(const l of course.lessons){assert.ok(l.source);for(const w of l.words){assert.ok(w.en&&w.ru&&w.example&&w.exampleRu);assert.ok(C.blankExample(w),'Missing context: '+w.en);assert.ok(!ids.has(w.id),'Duplicate ID: '+w.id);ids.add(w.id);}}
 assert.equal(ids.size,356);
 assert.equal(C.blankExample({en:'in',example:'Swimming in the pool.'}).before,'Swimming ');
 assert.equal(C.blankExample({en:'apple',example:'I like pineapple.'}),null);
 assert.equal(C.blankExample({en:'a+b',example:'This says a+b.'}).answer,'a+b');
});
test('answer normalization accepts case, apostrophes and allowed variants, but refuses typos',()=>{
 assert.ok(C.checkAnswer('  HELLO! ','hello'));
 assert.ok(C.checkAnswer('florist’s',"florist's"));assert.ok(C.checkAnswer('eraser','rubber',['eraser']));
 assert.equal(C.checkAnswer('Wednsday','Wednesday'),false);
 assert.equal(C.checkAnswer('pencilcase','pencil case'),false);
 assert.equal(C.checkAnswer('',''),false);
});
test('a word needs all four skills and a delayed successful review to be learned',()=>{
 const id=course.lessons[0].words[0].id;let p=C.emptyProgress();
 for(const skill of C.SKILLS)p=C.applyEvent(p,attempt(id,skill,true));
 assert.equal(C.wordStatus(p.words[id]),'familiar');assert.equal(C.wordPercent(p.words[id]),50);
 for(const skill of C.SKILLS)p=C.applyEvent(p,attempt(id,skill,true,now+600000));
 assert.equal(C.wordPercent(p.words[id]),100);assert.equal(C.wordStatus(p.words[id]),'familiar');
 p=C.applyEvent(p,attempt(id,'meaning',true,now+C.DAY));assert.equal(C.wordStatus(p.words[id]),'learned');
 p=C.applyEvent(p,attempt(id,'spelling',false,now+C.DAY+1000));assert.equal(C.wordStatus(p.words[id]),'learning');assert.equal(p.words[id].skills.meaning.level,3);assert.equal(p.words[id].skills.spelling.level,0);
});
test('retrying the same answer does not create another answer or move the interval',()=>{
 const e=attempt('w-hello','spelling',true);const p=C.applyEvent(C.emptyProgress(),e);assert.deepEqual(C.applyEvent(p,e),p);assert.equal(p.words['w-hello'].attempts,1);assert.equal(p.words['w-hello'].skills.spelling.due,now+600000);
});
test('resume includes the exact next card and cannot be overwritten by older offline position',()=>{
 const s=C.makeSession(course.lessons[0],C.emptyProgress(),'mix',3,now,()=>.5);assert.equal(s.items.length,12);
 s.index=4;s.correct=3;s.wrong=1;
 let p=C.applyEvent(C.emptyProgress(),{id:'session-123456',type:'session',session:s,lessonId:s.lessonId,at:now+1000});
 p=C.applyEvent(p,{id:'session-654321',type:'session',session:{...s,index:1},lessonId:s.lessonId,at:now});
 assert.equal(p.resume.index,4);assert.deepEqual(p.resume.items,s.items);
 p=C.applyEvent(p,{id:'lesson-location-123',type:'location',lessonId:'7a-months',at:now+2000});
 p=C.applyEvent(p,{id:'old-session-123456',type:'session',session:s,lessonId:s.lessonId,at:now+1500});
 assert.equal(p.currentLesson,'7a-months');assert.equal(p.resume.lessonId,s.lessonId);
});
test('newer scheduling survives an older offline attempt',()=>{
 let p=C.applyEvent(C.emptyProgress(),attempt('w-hello','meaning',true,now+1000));
 const due=p.words['w-hello'].skills.meaning.due;p=C.applyEvent(p,attempt('w-hello','meaning',false,now));
 assert.equal(p.words['w-hello'].skills.meaning.due,due);assert.equal(p.words['w-hello'].attempts,2);
});
test('custom lessons require a useful sentence with the literal target',()=>{
 const id='custom-12345678';const w={id:id+'-w1',en:'apple',ru:'яблоко',example:'I eat an apple.',exampleRu:'Я ем яблоко.'};
 assert.equal(C.validateCustomLesson({id,title:'Мой урок',words:[w]}).words.length,1);
 assert.throws(()=>C.validateCustomLesson({id,title:'Мой урок',words:[{...w,example:'I eat pineapple.'}]}),/целиком/);
});
