import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
const root = new URL('../static-site/', import.meta.url);
function load() {
  const c = vm.createContext({window:{}});
  vm.runInContext(fs.readFileSync(new URL('pinyin-data.js',root),'utf8'),c);
  const module = new URL('reading-dictionary.js',root);
  if(fs.existsSync(module)) vm.runInContext(fs.readFileSync(module,'utf8'),c);
  return c;
}
test('dictionary covers standardized characters and preserves alternative readings',()=>{
  const c=load();
  assert.ok(Object.keys(c.window.OTOWAI_PINYIN_BY_CHAR).length>=8105);
  assert.deepEqual(Array.from(c.window.OTOWAI_READINGS_BY_CHAR['重']).sort(),['chong','tong','zhong']);
  assert.ok(c.window.OTOWAI_READINGS_BY_CHAR['绿'].includes('lü'));
  assert.equal(c.window.OTOWAI_DICTIONARY_META.commonCount,8105);
});
test('expansion reuses existing kana, highlights only new readings, and is idempotent',()=>{
  const c=load();assert.ok(c.window.OtowaiReadings,'reading expansion must be available');
  const api=c.window.OtowaiReadings;
  const rows=[{id:'mine',chars:'名',romaji:'ming',kana:'みん',manual:true,soundStatus:'new'}];
  const expanded=api.expand(rows,rows);
  assert.equal(expanded.find(r=>r.romaji==='ming').kana,'みん');
  assert.equal(expanded.find(r=>r.romaji==='ming').soundStatus,'same');
  assert.ok(expanded.find(r=>r.romaji==='ming').chars.includes('铭'));
  assert.equal(expanded.find(r=>r.romaji==='biang').soundStatus,'new');
  assert.equal(api.expand(expanded,rows).length,expanded.length);
  assert.equal(rows[0].chars,'名','expansion must not mutate backups');
});
test('new polyphones require per-occurrence choice and never pick the first reading',()=>{
  const c=load();assert.ok(c.window.OtowaiReadings);
  const api=c.window.OtowaiReadings;
  const rows=[{chars:'中',romaji:'zhong',kana:'じょん'},{chars:'冲',romaji:'chong',kana:'ちょん'}];
  assert.equal(api.resolve('重',rows,{}).pending,true);
  assert.equal(api.resolve('重',rows,{},'zhong').kana,'じょん');
  assert.equal(api.resolve('重',rows,{},'chong').kana,'ちょん');
  assert.equal(api.resolve('重',rows,{},'ming').pending,true);
  assert.equal(api.resolve('\u{31350}',rows,{}).pending,true);
});
test('existing character corrections take precedence over dictionary and exact romanization',()=>{
  const c=load();assert.ok(c.window.OtowaiReadings);
  const api=c.window.OtowaiReadings;
  const rows=[{chars:'家',romaji:'jia',kana:'じあ',manual:true}];
  api.expand(rows,rows);
  assert.equal(api.resolve('家',rows,{家:{romaji:'jia',kana:'じあ'}}).kana,'じあ');
});
test('a new alternate reading on an existing character is purple',()=>{
  const c=load(), api=c.window.OtowaiReadings;
  const rows=[{chars:'重',romaji:'zhong',kana:'じょん'},{chars:'冲',romaji:'chong',kana:'ちょん'}];
  api.expand(rows,rows);
  assert.equal(api.resolve('重',rows,{重:{romaji:'zhong',kana:'じょん'}},'chong').isNew,true);
  assert.ok(api.additions(rows[1]).includes('重'));
});
test('live duplicate pinyin respects manual correction before reload',()=>{
  const c=load(),api=c.window.OtowaiReadings;
  const rows=[{chars:'名',romaji:'ming',kana:'めい'}, {chars:'鸣',romaji:'ming',kana:'みん',manual:true}];
  api.expand(rows,rows);
  assert.equal(api.resolve('铭',rows,{}).kana,'みん');
});
test('everyday reading options exclude historical and unrelated merged readings',()=>{
 const c=load(),api=c.window.OtowaiReadings;
 for(const [char,expected] of Object.entries({有:['you'],家:['jia'],圣:['sheng'],大:['da','dai'],重:['chong','zhong']})) {
   assert.deepEqual(Array.from(api.resolve(char,[],{}).options).sort(),expected.sort(),char);
 }
 assert.ok(!api.additions({romaji:'ku'}).includes('圣'));
});
test('stale saved choices cannot reintroduce excluded readings',()=>{
 const c=load(),api=c.window.OtowaiReadings;
 const rows=[{chars:'家',romaji:'jia',kana:'じあ',manual:true},{chars:'家',romaji:'gu',kana:'ぐ'}];
 api.expand(rows,[rows[0]]);
 assert.equal(api.resolve('家',rows,{家:{romaji:'gu',kana:'ぐ'}},'gu').pending,true);
 assert.equal(api.resolve('家',rows,{家:{romaji:'gu',kana:'ぐ'}}).kana,'じあ');
});
