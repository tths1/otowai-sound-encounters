// Local-only preview. Default audio uses the public backend; --local-audio
// enables the local handler with the same quotas and private job store.
// Start with: node --env-file=.env.local scripts/local-preview.mjs --local-audio
// No API key, login cookies, or mapping writes are forwarded to the browser.
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {resolve, sep, extname} from 'node:path';
const upstream='https://otowai-sound-encounters.netlify.app';
const root=fileURLToPath(new URL('../static-site/',import.meta.url));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.mp3':'audio/mpeg','.svg':'image/svg+xml','.png':'image/png','.txt':'text/plain; charset=utf-8'};
export function createLocalPreviewServer({fetch:fetcher=globalThis.fetch,audioHandler}={}) {
 return createServer(async(req,res)=>{
  const json=(status,body)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(body));};
  const port=req.socket.localPort;
  if(![`127.0.0.1:${port}`,`localhost:${port}`].includes(req.headers.host))return json(403,{code:'AUDIO_FORBIDDEN'});
  const localOrigin=`http://${req.headers.host}`;
  const url=new URL(req.url,localOrigin);
  try {
   if(url.pathname==='/api/audio'){
    if(req.method!=='POST')return json(405,{code:'METHOD_NOT_ALLOWED'});
    if(req.headers.origin!==localOrigin || req.headers['sec-fetch-site']==='cross-site')return json(403,{code:'AUDIO_FORBIDDEN'});
    if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||''))return json(415,{code:'AUDIO_JSON_REQUIRED'});
    let size=0;const chunks=[];
    for await(const chunk of req){size+=chunk.length;if(size>16000)return json(413,{code:'AUDIO_INVALID_INPUT'});chunks.push(chunk);}
    const body=Buffer.concat(chunks).toString('utf8');
    const response=audioHandler ? await audioHandler(new Request(localOrigin+'/api/audio',{
     method:'POST',headers:{'Content-Type':'application/json',Origin:localOrigin,'X-Audio-Visitor':req.headers['x-audio-visitor']||''},body,
    })) : await fetcher(upstream+'/api/audio',{
     method:'POST',redirect:'error',signal:AbortSignal.timeout(35000),
     headers:{'Content-Type':'application/json',Origin:upstream,'X-Audio-Visitor':req.headers['x-audio-visitor']||''},
     body,
    });
    const type=response.headers.get('content-type')||'';
    if(!/^(application\/json|audio\/mpeg)(?:;|$)/i.test(type))return json(502,{code:'AUDIO_UPSTREAM_ERROR'});
    const bytes=await response.arrayBuffer();
    res.writeHead(response.status,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    res.end(Buffer.from(bytes));return;
   }
   if(url.pathname.startsWith('/api/'))return json(503,{error:'LOCAL_PREVIEW_ONLY'});
   if(!['GET','HEAD'].includes(req.method))return json(405,{code:'METHOD_NOT_ALLOWED'});
   const pathname=decodeURIComponent(url.pathname);
   const name=['/','/admin/editor/','/admin/editor'].includes(pathname)?'index.html':pathname.slice(1);
   const file=resolve(root,name);
   if(!file.startsWith(root.endsWith(sep)?root:root+sep)||name.split('/').some(p=>p.startsWith('.')))return json(404,{error:'NOT_FOUND'});
   const data=await readFile(file);
   res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
   res.end(req.method==='HEAD'?undefined:data);
  }catch{return json(url.pathname==='/api/audio'?502:404,{code:url.pathname==='/api/audio'?'AUDIO_UPSTREAM_ERROR':'NOT_FOUND'});}
 });
}
if(process.argv[1] && import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const port=Number(process.env.LOCAL_PREVIEW_PORT||4174);
 let audioHandler;
 if(process.argv.includes('--local-audio')){
  const {loadLocalAudioSettings,createLocalAudioBackend}=await import('./local-audio-backend.mjs');
  audioHandler=await createLocalAudioBackend(await loadLocalAudioSettings());
 }
 createLocalPreviewServer({audioHandler}).listen(port,'127.0.0.1',()=>console.log(`Local preview: http://127.0.0.1:${port} (audio via ${audioHandler?'local AI backend':'existing Netlify backend'})`));
}
