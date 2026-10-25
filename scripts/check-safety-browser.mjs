import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server=createServer(async(req,res)=>{
 try {
  if(req.url.startsWith('/api/')){res.writeHead(req.url==='/api/admin-session'?200:404,{'Content-Type':'application/json'});res.end(JSON.stringify({admin:true}));return;}
  const path=req.url.split('?')[0];
  const asset=path==='/' || path.startsWith('/admin/editor/') ? 'index.html' : path.slice(1);
  if(!/^[\w.-]+$/.test(asset)){res.writeHead(404);res.end();return;}
  const body=await readFile(new URL('../static-site/'+asset,import.meta.url));
  res.setHeader('Content-Type',asset.endsWith('.js')?'text/javascript':asset.endsWith('.css')?'text/css':'text/html');res.end(body);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
try {
 const context=await browser.newContext({acceptDownloads:true});const page=await context.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}/admin/editor/#maker`);
 for(let i=0;i<7;i++) {
   assert.doesNotMatch(await page.locator('.featured-card').innerText(),/声音相似度|\d+\s*%|偶\s*然/);
   await page.locator('#random').click();
 }
 assert.equal(await page.locator('#entries h3').filter({hasText:/^(少年|上海|青山)$/}).count(),0);
 // Pagination must constrain rendering, not the searchable dataset.
 assert.equal(await page.locator('#entries .entry-card').count(),4);
 assert.equal(await page.locator('#collection-prev').isDisabled(),true);
 const firstPage=await page.locator('#entries h3').allTextContents();
 await page.locator('#collection-next').click();
 assert.equal(await page.locator('#entries .entry-card').count(),4);
 assert.notDeepEqual(await page.locator('#entries h3').allTextContents(),firstPage);
 await page.locator('#search').fill('玲珑望秋月');
 assert.equal(await page.locator('#entries .entry-card').count(),1);
 assert.match(await page.locator('#collection-page-status').innerText(),/第 1 \/ 1 页/);
 assert.equal(await page.locator('#collection-next').isDisabled(),true);
 await page.locator('#search').fill('没有这个诗词XYZ');
 assert.equal(await page.locator('#entries .entry-card').count(),0);
 assert.equal(await page.locator('#collection-prev').isDisabled(),true);
 assert.equal(await page.locator('#collection-next').isDisabled(),true);
 await page.locator('#search').fill('');
 await page.locator('#collection-next').click();
 assert.equal(await page.locator('#collection [data-category]').count(),0);
 await page.locator('#search').fill('陶渊明');
 assert.equal(await page.locator('#entries .entry-card').count(),1);
 assert.equal(await page.locator('#collection-prev').isDisabled(),true);
 await page.locator('#search').fill('');
 for(let i=0;i<13;i++) await page.locator('#collection-next').click();
 assert.equal(await page.locator('#entries .entry-card').count(),1);
 assert.equal(await page.locator('#collection-next').isDisabled(),true);
 assert.match(await page.locator('#collection-page-status').innerText(),/第 14 \/ 14 页/);
 await page.locator('#collection-prev').click();
 assert.equal(await page.locator('#entries .entry-card').count(),4);
 await page.setViewportSize({width:1200,height:900});
 assert.equal(await page.locator('#entries').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),2);
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.locator('#entries').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length),1);
 const pagerBox=await page.locator('.collection-pagination').boundingBox();
 assert.ok(pagerBox.x>=0 && pagerBox.x+pagerBox.width<=390);
 await page.setViewportSize({width:1280,height:900});
 await page.locator('#maker-admin-toggle').click();
 await page.locator('#maker-input').fill('名\u3402');await page.locator('#maker-generate').click();
 assert.match(await page.locator('#maker-output').innerText(),/待校对/);
 assert.equal(await page.locator('#maker-speak').isDisabled(),true);
 const before=await page.evaluate(()=>localStorage.getItem('otowai-maker-phonetic-rows'));
 assert.ok(!before?.includes('\u3402'));
 const downloadEvent=page.waitForEvent('download');await page.locator('#rules-export').click();
 const download=await downloadEvent;const backup=await readFile(await download.path(),'utf8');
 const parsed=JSON.parse(backup);assert.ok(parsed.phoneticRows.length>100);
 // Restore our own just-exported data in an isolated browser, never production rules.
 page.on('dialog',dialog=>dialog.accept());
 await page.locator('#rules-file').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(backup)});
 await page.waitForFunction(()=>document.querySelector('#rules-backup-status').textContent.includes('已恢复'));
 const restored=await page.evaluate(()=>JSON.parse(localStorage.getItem('otowai-maker-phonetic-rows')));
 assert.equal(restored.length,parsed.phoneticRows.length);
 await page.locator('#rules-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad')});
 await page.waitForFunction(()=>document.querySelector('#rules-backup-status').textContent.includes('恢复取消'));
 assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('otowai-maker-phonetic-rows')).length),restored.length);
 await page.locator('#maker-input').fill('家名');await page.locator('#maker-generate').click();
 assert.equal(await page.locator('#maker-speak').isDisabled(),false);
 assert.deepEqual(errors,[]);
 console.log('Browser passed: four-entry pagination, search-only filtering, full-library search, empty/last-page controls, desktop/mobile layouts; unknown blocked, valid mappings playable, backup restore protection; no page errors.');
} finally {await browser.close();server.close();}
