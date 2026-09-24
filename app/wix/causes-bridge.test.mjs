import test from 'node:test';import assert from 'node:assert/strict';
import {projectCauses,createCausesResponder} from './causes-bridge.js';
import {normalize,selectCauses} from '../src/model.js';
test('public projection omits contributor identities and other backend data',()=>{const r=projectCauses({data:[{id:'a',name:'A',supporterCount:2,contributors:[{userId:'private'}],secret:'hidden'}]});assert.equal(r.causes[0].supporterCount,2);assert.equal('contributors' in r.causes[0],false);assert.equal('secret' in r.causes[0],false);});
test('old API response remains unknown instead of claiming zero supporters',()=>assert.equal(projectCauses({data:[{id:'a',name:'A'}]}).causes[0].supporterCount,null));
test('request uses host language, caches repeats, ignores unexpected types',async()=>{let calls=0;const sent=[];const respond=createCausesResponder({load:async lang=>{calls++;assert.equal(lang,'fr');return {data:[]};},send:m=>sent.push(m),getLanguage:()=> 'fr'});await respond({type:'wrong'});await respond({type:'JPDB_CAUSES_REQUEST',requestId:'a',language:'en',url:'https://evil.test'});await respond({type:'JPDB_CAUSES_REQUEST',requestId:'b'});assert.equal(calls,1);assert.deepEqual(sent.map(m=>m.requestId),['a','b']);});
test('backend failures send no private diagnostic detail',async()=>{const sent=[];const respond=createCausesResponder({load:async()=>{throw Error('secret');},send:m=>sent.push(m),getLanguage:()=> 'en'});await respond({type:'JPDB_CAUSES_REQUEST',requestId:'x'});assert.deepEqual(sent,[{type:'JPDB_CAUSES_ERROR',requestId:'x'}]);});
test('integrated API contract preserves support and independent explicit editorial choice',()=>{
 const response={data:[
  {id:'65a1b359-c5d8-4c26-ab1d-69b7df2b4ee0',name:'Community Wellness Fund',supporterCount:2,featured:false,goalAmount:1000,currency:'CAD',raisedAmount:30,contributors:[{alias:'Example'}]},
  {id:'featured-only',name:'Youth Recreation Access',supporterCount:0,featured:true}
 ]};
 const projected=normalize(projectCauses(response));
 assert.deepEqual(selectCauses(projected.causes).map(c=>c.id),['65a1b359-c5d8-4c26-ab1d-69b7df2b4ee0']);
 assert.deepEqual(selectCauses(projected.causes,{kind:'featured'}).map(c=>c.id),['featured-only']);
 assert.equal(projected.causes[0].supporterCount,2);
 assert.equal('contributors' in projected.causes[0],false);
});
test('omitted backend featured setting retains editorial picks without turning them into supporters',()=>{
 const projected=normalize(projectCauses({data:[{id:'65a1b359-c5d8-4c26-ab1d-69b7df2b4ee0',name:'Fund',supporterCount:0}]}));
 assert.equal(selectCauses(projected.causes,{kind:'featured'}).length,1);
 assert.equal(selectCauses(projected.causes).length,0);
});
