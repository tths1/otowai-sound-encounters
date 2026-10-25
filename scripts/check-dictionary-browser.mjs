import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
let remoteMappings=null;
const server=createServer(async(req,res)=>{
 try {
  if(req.url==='/api/mappings' && remoteMappings){res.setHeader('Content-Type','application/json');res.end(JSON.stringify(remoteMappings));return;}
  if(req.url.startsWith('/api/')){res.writeHead(req.url==='/api/admin-session'?200:404,{'Content-Type':'application/json'});res.end(JSON.stringify({admin:true}));return;}
  const path=req.url.split('?')[0];const name=path==='/'||path.startsWith('/admin/editor/')?'index.html':path.slice(1);
  if(!/^[\w.-]+$/.test(name))throw Error('not a static asset');
  const data=await readFile(new URL('../static-site/'+name,import.meta.url));
  res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html');res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
try {
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/admin/editor/#maker`);
 await page.locator('#maker-admin-toggle').click();
 await page.locator('#maker-mapping-search').fill('欸');
 assert.equal(await page.locator('#phonetic-mapping-rows tr').count(),2,'only normative readings must be offered for everyday selection');
 await page.locator('#maker-input').fill('有一天大家一起圣诞节');await page.locator('#maker-generate').click();
 assert.equal(await page.locator('[data-reading-index="0"]').count(),0,'有 is not selectable as wei');
 assert.equal(await page.locator('[data-reading-index="4"]').count(),0,'家 is not selectable as gu');
 assert.equal(await page.locator('[data-reading-index="7"]').count(),0,'圣 is not selectable as ku');
 assert.deepEqual(await page.locator('[data-reading-index="3"] option[value]:not([value=""])').evaluateAll(nodes=>nodes.map(n=>n.value).sort()),['da','dai']);
 await page.locator('#maker-mapping-search').fill('biang');
 assert.equal(await page.locator('#phonetic-mapping-rows tr.mapping-row-new-sound').count(),1);
 const row=page.locator('#phonetic-mapping-rows tr').first();
 await row.locator('[data-field="kana"]').fill('びゃん');
 await page.locator('#maker-input').fill('家名瀚𰻞俩俩');await page.locator('#maker-generate').click();
 assert.match(await page.locator('.maker-kana-result').innerText(),/じあ みん .*びゃん/);
 assert.equal(await page.locator('#maker-speak').isDisabled(),true);
 await page.locator('[data-reading-index="4"]').selectOption('lia');
 await page.locator('[data-reading-index="5"]').selectOption('liang');
 assert.equal(await page.locator('#maker-speak').isDisabled(),false);
 const pinyin=await page.locator('.trace-item > span').allTextContents();
 assert.deepEqual(pinyin,['jia','ming','han','biang','lia','liang']);
 assert.equal(await page.locator('.trace-item.trace-pending').count(),4,'only new characters are purple');
 await page.locator('#maker-restart').click();
 assert.deepEqual((await page.locator('.trace-item > span').allTextContents()).slice(-2),['lia','liang']);
 const saved=await page.evaluate(()=>OtowaiBackup.parse(OtowaiBackup.serialize(phoneticRows,phraseRows)));
 assert.equal(saved.phoneticRows.find(r=>r.romaji==='biang').kana,'びゃん');
 await page.reload();
 await page.locator('.history-item').filter({hasText:'家名瀚𰻞俩俩'}).first().click();
 assert.deepEqual((await page.locator('.trace-item > span').allTextContents()).slice(-2),['lia','liang']);
 await page.locator('#maker-input').fill('𰻞俩');await page.locator('#maker-generate').click();
 assert.match(await page.locator('.maker-kana-result').innerText(),/びゃん/);
 assert.equal(await page.locator('#maker-speak').isDisabled(),true,'polyphonic selections do not leak into new input');
 await page.setViewportSize({width:390,height:844});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
 await page.locator('.conversion-trace').screenshot({path:'/tmp/otowai-dictionary-mobile.png'});
 remoteMappings={phoneticRows:[{id:'owner-lia',chars:'俩',romaji:'lia',kana:'りゃ',manual:true}]};
 const fresh=await browser.newPage();
 await fresh.goto(`http://127.0.0.1:${server.address().port}/admin/editor/#maker`);
 await fresh.waitForFunction(()=>phoneticRows.some(r=>r.id==='owner-lia'));
 await fresh.locator('#maker-input').fill('俩');await fresh.locator('#maker-generate').click();
 assert.match(await fresh.locator('.maker-kana-result').innerText(),/りゃ/,'existing remote correction must not become an unresolved new polyphone');
 assert.deepEqual(errors,[]);
 console.log('Dictionary browser passed: search, purple markers, corrections after reload, per-occurrence readings, backup and mobile layout. No paid calls.');
} finally {await browser.close();server.close();}
