import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {request as httpRequest} from 'node:http';
const moduleUrl=new URL('../scripts/local-preview.mjs',import.meta.url);
const {createLocalPreviewServer}=existsSync(moduleUrl)?await import(moduleUrl):{};
test('local handler receives selected voice, with origin checks and no credential forwarding',async()=>{
 const calls=[];
 const server=createLocalPreviewServer({fetch:async()=>new Response('{}',{status:502,headers:{'Content-Type':'application/json'}}),audioHandler:async request=>{
  calls.push({body:await request.json(),origin:request.headers.get('origin'),visitor:request.headers.get('x-audio-visitor'),cookie:request.headers.get('cookie'),auth:request.headers.get('authorization')});
  return Response.json({status:'processing'},{status:202});
 }});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 const body=JSON.stringify({action:'create',voice:'Japanese_GentleButler'});
 const headers={Origin:base,'Content-Type':'application/json','X-Audio-Visitor':'visitor',Cookie:'secret',Authorization:'secret'};
 try{
  assert.equal((await fetch(base+'/api/audio',{method:'POST',headers,body})).status,202);
  assert.deepEqual(calls,[{body:JSON.parse(body),origin:base,visitor:'visitor',cookie:null,auth:null}]);
  assert.equal((await fetch(base+'/api/audio',{method:'POST',headers:{...headers,Origin:'https://evil.test'},body})).status,403);
  // fetch normalizes Host; use the HTTP client to actually send the forged value.
  const invalidHostStatus=await new Promise((resolve,reject)=>{
   const request=httpRequest(base+'/api/audio',{method:'POST',headers:{...headers,Host:'evil.test'}},response=>{response.resume();response.on('end',()=>resolve(response.statusCode));});
   request.on('error',reject);request.end(body);
  });
  assert.equal(invalidHostStatus,403);
  assert.equal((await fetch(base+'/api/audio',{method:'POST',headers,body:'x'.repeat(16001)})).status,413);
  assert.equal(calls.length,1);
  assert.equal((await fetch(base+'/.env.local')).status,404);
 }finally{await new Promise(r=>server.close(r));}
});
test('local audio forwards existing task identities without cookies or API keys',async()=>{
 assert.equal(typeof createLocalPreviewServer,'function','local preview must support the audio route');
 let call;
 const server=createLocalPreviewServer({fetch:async(url,options)=>{
  call={url,options};return new Response(new Uint8Array([1,2,3]),{headers:{'Content-Type':'audio/mpeg'}});
 }});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}`;
 try {
  const body=JSON.stringify({action:'query',requestId:'existing-task'});
  const response=await fetch(base+'/api/audio',{method:'POST',headers:{Origin:base,'Content-Type':'application/json','X-Audio-Visitor':'visitor-test',Cookie:'private=secret',Authorization:'secret'},body});
  assert.equal(response.status,200);
  assert.deepEqual([...new Uint8Array(await response.arrayBuffer())],[1,2,3]);
  assert.equal(call.url,'https://otowai-sound-encounters.netlify.app/api/audio');
  assert.equal(call.options.body,body);
  assert.equal(call.options.headers['X-Audio-Visitor'],'visitor-test');
  assert.equal(call.options.headers.Cookie,undefined);
  assert.equal(call.options.headers.Authorization,undefined);
  call=null;
  assert.equal((await fetch(base+'/api/audio',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body})).status,403);
  assert.equal(call,null);
  assert.equal((await fetch(base+'/api/audio',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:'x'.repeat(16001)})).status,413);
  assert.equal(call,null);
  assert.equal((await fetch(base+'/.env')).status,404);
  assert.equal((await fetch(base+'/api/mappings',{method:'POST',body:'{}'})).status,503);
  assert.equal((await fetch(base+'/admin/editor/')).status,200);
 }finally{await new Promise(r=>server.close(r));}
});
