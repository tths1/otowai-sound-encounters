import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
await import('../static-site/rules-backup.js');
const api=globalThis.OtowaiBackup;
test('backup carries pre-expansion baseline without losing new review status',()=>{
 const rows=[{id:'mine',chars:'名,铭',romaji:'ming',kana:'みん'}];
 const baseline=[{chars:'名',romaji:'ming'}];
 assert.deepEqual(api.parse(api.serialize(rows,[],baseline)).dictionaryBaseline,baseline);
 assert.throws(()=>api.parse(JSON.stringify({format:'otowai-rules',version:1,phoneticRows:rows,phraseRows:[],dictionaryBaseline:[{chars:12,romaji:'ming'}]})));
});
test('backup roundtrip preserves handwritten rules and metadata',()=>{
 const rows=[{id:'mine',chars:'家',romaji:'jia',kana:'じあ',manual:true,source:'custom',note:'手写'}];
 const restored=api.parse(api.serialize(rows,[]));
 assert.deepEqual(restored.phoneticRows,rows);assert.deepEqual(restored.phraseRows,[]);
});
test('invalid backups and conflicting pinyin cannot replace rules',()=>{
 assert.throws(()=>api.parse('{bad'));
 assert.throws(()=>api.parse(JSON.stringify({version:99,phoneticRows:[]})));
 assert.throws(()=>api.serialize([{id:'a',chars:'家',romaji:'jia',kana:'<script>'}],[]));
 assert.throws(()=>api.parse(api.serialize([{id:'a',chars:'家',romaji:'jia',kana:'じあ'},{id:'b',chars:'加',romaji:'jia',kana:'か'}],[])));
});
test('current merged default dictionary exports and restores without losing rows',()=>{
 const source=readFileSync(new URL('../static-site/app.js',import.meta.url),'utf8');
 const start=source.indexOf('function mergeEditablePhoneticRows(');
 const c=vm.createContext({});
 vm.runInContext(source.slice(0,source.indexOf('const MAKER_PHONETIC_ROWS_KEY'))+'\n'+source.slice(start,source.indexOf('\n}',start)+2)+'\nglobalThis.rows=mergeEditablePhoneticRows(DEFAULT_PHONETIC_ROWS);globalThis.phrases=DEFAULT_PHRASE_ROWS;',c);
 const restored=api.parse(api.serialize(c.rows,c.phrases));
 assert.equal(restored.phoneticRows.length,c.rows.length);
 assert.equal(restored.phraseRows.length,c.phrases.length);
});
