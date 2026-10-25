import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import vm from 'node:vm';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const source=await readFile('static-site/app.js','utf8'),context={};
vm.runInNewContext(source.slice(0,source.indexOf('const DEFAULT_PHONETIC_ROWS'))+'this.items=entries;',context);
const manifest=JSON.parse(await readFile('static-site/collection-audio/manifest.json','utf8'));
assert.equal(Object.keys(manifest.entries).length,context.items.length);
for(const e of context.items)assert.ok(manifest.entries[e.kana]);
const server=createServer(async(req,res)=>{
 try{
  const p=req.url.split('?')[0];
  if(p.startsWith('/api/')){res.writeHead(404);res.end();return;}
  const asset=p==='/'?'index.html':p.slice(1);
  if(!/^(?:collection-audio\/)?[\w.-]+$/.test(asset)){res.writeHead(404);res.end();return;}
  const body=await readFile('static-site/'+asset);
  res.setHeader('Content-Type',asset.endsWith('.mp3')?'audio/mpeg':asset.endsWith('.js')?'text/javascript':asset.endsWith('.json')?'application/json':asset.endsWith('.css')?'text/css':'text/html');res.end(body);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
try{
 const page=await browser.newPage();let paid=0;
 page.on('request',r=>{if(r.url().includes('/api/audio'))paid++;});
 await page.goto(process.env.COLLECTION_TEST_URL || `http://127.0.0.1:${server.address().port}/`);
 // Decode every MP3 with the browser, rather than trusting filenames or HTTP 200.
 const durations=await page.evaluate(async paths=>{
  const context=new AudioContext();const out=[];
  for(const path of paths){const response=await fetch(path);if(!response.ok)throw Error(path);const b=await context.decodeAudioData(await response.arrayBuffer());out.push(b.duration);}
  await context.close();return out;
 },Object.values(manifest.entries));
 assert.ok(durations.every(d=>Number.isFinite(d)&&d>0.1&&d<120));
 await page.locator('.featured-card .speak').click();
 await page.waitForFunction(()=>document.querySelector('.featured-card .speak').textContent.includes('正在播放 AI'));
 await page.locator('#entries .speak').first().click();
 await page.waitForFunction(()=>document.querySelector('#entries .speak').textContent.includes('正在播放 AI'));
 await page.locator('#collection-next').click();
 await page.locator('#entries .speak').first().click();
 await page.waitForFunction(()=>document.querySelector('#entries .speak').textContent.includes('正在播放 AI'));
 assert.equal(paid,0);
 console.log(JSON.stringify({decoded:durations.length,minSeconds:Math.min(...durations),maxSeconds:Math.max(...durations),homepageAndCollectionPlayback:true,paidRequests:paid}));
}finally{await browser.close();server.close();}
