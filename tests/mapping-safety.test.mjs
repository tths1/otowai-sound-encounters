import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../static-site/app.js',import.meta.url),'utf8');
const fn=name=>source.slice(source.indexOf(`function ${name}(`),source.indexOf('\n}',source.indexOf(`function ${name}(`))+2);
function harness(){
 const rows=[{id:'manual',chars:'名',romaji:'ming',kana:'みん',manual:true}];
 const c=vm.createContext({window:{OTOWAI_PINYIN_BY_CHAR:{明:'ming'}},kanaMap:{名:{kana:'みん',romaji:'ming'}},phoneticRows:rows,EXACT_ROMAJI_KANA:{},isKana:x=>/^[ぁ-ヿ]+$/.test(x),isHan:x=>/\p{Script=Han}/u.test(x),pickPolyphonicKana:()=>null,normalizeMappings(){},saveMappings(){},renderMappingEditors(){},pickFallbackMoraCluster:()=>[{kana:'に',romaji:'ni'}]});
 vm.runInContext(fn('buildMakerSentence')+'\n'+fn('recordGeneratedMappings'),c);return {c,rows};
}
test('unknown Han stays pending, never receives random kana or enters dictionary',()=>{
 const {c,rows}=harness();const r=c.buildMakerSentence('名龘',0,'syllable');
 assert.match(r.kana,/待校对/);assert.equal(r.generatedChars[0].confirmed,false);
 c.recordGeneratedMappings(r);assert.equal(rows.length,1);assert.equal(rows[0].chars,'名');
});
test('known pinyin reuses handwritten kana and records homophone',()=>{
 const {c,rows}=harness();const r=c.buildMakerSentence('明',0,'syllable');
 assert.equal(r.kana,'みん');c.recordGeneratedMappings(r);assert.equal(rows[0].chars,'名,明');
});
test('trace records occurrence order, handwritten reuse and unresolved characters honestly',()=>{
 const {c}=harness();const r=c.buildMakerSentence('名明龘。');
 assert.deepEqual(JSON.parse(JSON.stringify(r.trace)),[
  {char:'名',pinyin:'ming',kana:'みん',source:'manual'},
  {char:'明',pinyin:'ming',kana:'みん',source:'homophone-manual'},
  {char:'龘',pinyin:'',kana:'',source:'pending'},
  {char:'。',pinyin:'',kana:'。',source:'retained'}
 ]);
});
test('manual provenance uses the same pinyin normalization as conversion',()=>{
 const {c,rows}=harness();rows[0].romaji=' MING ';rows[0].kana=' みん ';
 const r=c.buildMakerSentence('明');
 assert.equal(r.kana,'みん');assert.equal(r.trace[0].source,'homophone-manual');
});
test('context-selected reading preserves distinct per-occurrence trace',()=>{
 const {c,rows}=harness();rows.push({chars:'行',romaji:'hang',kana:'はん',manual:true});
 c.pickPolyphonicKana=(_text,index,char)=>char==='行'?{romaji:index===0?'hang':'xing',kana:index===0?'はん':'しん'}:null;
 const r=c.buildMakerSentence('行行');
 assert.deepEqual(Array.from(r.trace,t=>t.pinyin),['hang','xing']);
 assert.deepEqual(Array.from(r.trace,t=>t.source),['manual','context']);
});
function expandedHarness(){
 const h=harness();
 h.rows.push({id:'zhong',chars:'中',romaji:'zhong',kana:'じょん'}, {id:'chong',chars:'冲',romaji:'chong',kana:'ちょん'});
 for(const file of ['pinyin-data.js','reading-dictionary.js'])vm.runInContext(readFileSync(new URL(`../static-site/${file}`,import.meta.url),'utf8'),h.c);
 h.c.phoneticRows=h.c.window.OtowaiReadings.expand(h.rows,h.rows);
 return h;
}
test('dictionary polyphones remain pending until each occurrence is selected',()=>{
 const {c}=expandedHarness();
 assert.match(c.buildMakerSentence('重重').kana,/待校对/);
 const result=c.buildMakerSentence('重重',0,'syllable',{'0':'zhong','1':'chong'});
 assert.equal(result.kana,'じょん ちょん');
 c.recordGeneratedMappings(result);
 assert.match(c.buildMakerSentence('重重').kana,/待校对/,'learned groups must not leak a choice into other sentences');
});
test('expanded new characters carry purple review metadata and existing corrections stay intact',()=>{
 const {c}=expandedHarness();
 const result=c.buildMakerSentence('名铭');
 assert.equal(result.kana,'みん みん');
 assert.equal(result.trace[0].isNew,false);
 assert.equal(result.trace[1].isNew,true);
 assert.ok(result.trace[1].options.includes('ming'));
});
