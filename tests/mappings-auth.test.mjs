import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
test('public speech does not grant ordinary accounts rule-write permission',async()=>{
 const source=readFileSync(new URL('../netlify/functions/mappings.ts',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export default','globalThis.handler =').replace(': Request','').replace(': Context','').split('export const config')[0];
 let user=null,writes=0;
 const c=vm.createContext({Response,getUser:async()=>user,getStore:()=>({get:async()=>null,setJSON:async()=>writes++})});
 vm.runInContext(source,c);
 const put=()=>new Request('https://site.test/api/mappings',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({phoneticRows:[]})});
 assert.equal((await c.handler(put())).status,401);
 user={id:'normal',appMetadata:{roles:[]}};
 assert.equal((await c.handler(put())).status,403);assert.equal(writes,0);
 user={id:'owner',appMetadata:{roles:['admin']}};
 assert.equal((await c.handler(put())).status,200);assert.equal(writes,1);
});
test('mapping sync preserves review baseline and rejects malformed metadata',async()=>{
 const source=readFileSync(new URL('../netlify/functions/mappings.ts',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace('export default','globalThis.handler =').replace(': Request','').replace(': Context','').split('export const config')[0];
 let saved;
 const c=vm.createContext({Response,getUser:async()=>({appMetadata:{roles:['admin']}}),getStore:()=>({get:async()=>saved,setJSON:async(_key,data)=>{saved=data;}})});
 vm.runInContext(source,c);
 const put=baseline=>new Request('https://site.test/api/mappings',{method:'PUT',body:JSON.stringify({phoneticRows:[],dictionaryBaseline:baseline})});
 const baseline=[{chars:'俩',romaji:'lia'}];
 assert.equal((await c.handler(put(baseline))).status,200);
 assert.deepEqual(saved.dictionaryBaseline,baseline);
 assert.equal((await c.handler(put([{chars:7,romaji:'lia'}]))).status,400);
});
