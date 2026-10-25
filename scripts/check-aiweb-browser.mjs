// Local UI verification only: all AI responses are fixtures, never paid requests.
import assert from 'node:assert/strict';
import {readFile, mkdtemp} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.LOCAL_PREVIEW_URL || 'http://127.0.0.1:4174';
const manifest=JSON.parse(await readFile('static-site/collection-audio/manifest.json','utf8'));
const mp3=await readFile('static-site'+Object.values(manifest.entries)[0]);
const browser=await chromium.launch({headless:true,executablePath:process.env.BROWSER_EXECUTABLE});
const artifacts=await mkdtemp(join(tmpdir(),'otowai-aiweb-'));
try {
 const context=await browser.newContext({acceptDownloads:true,viewport:{width:1280,height:900}});
 const page=await context.newPage();const errors=[],requests=[];
 let behavior='retry';
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',async route=>{
  const url=new URL(route.request().url());
  if(url.origin!==new URL(base).origin){await route.abort();return;}
  if(url.pathname==='/api/audio'){
   requests.push(route.request().postDataJSON());
   if(behavior==='local'){await route.fulfill({status:503,json:{error:'LOCAL_PREVIEW_ONLY'}});return;}
   if(behavior==='quota'){await route.fulfill({status:429,json:{code:'AUDIO_DAILY_LIMIT'}});return;}
   if(behavior==='failed'){await route.fulfill({status:502,json:{code:'AUDIO_TASK_FAILED'}});return;}
   if(requests.length===1){await route.fulfill({status:202,json:{status:'processing'}});return;}
   if(requests.length===2){await route.fulfill({status:502,json:{error:'upstream secret must not be displayed'}});return;}
   await route.fulfill({status:200,contentType:'audio/mpeg',body:mp3});return;
  }
  if(url.pathname.startsWith('/api/')){await route.fulfill({status:404,json:{}});return;}
  await route.continue();
 });
 await page.goto(base+'/admin/editor/#top');
 assert.equal(await page.locator('.hero .primary-button').getAttribute('href'),'#maker');
 assert.doesNotMatch(await page.locator('#project').innerText(),/自动匹配|静音测量/);
 await page.screenshot({path:join(artifacts,'desktop-home.png')});
 await page.locator('.hero .primary-button').click();
 await page.locator('#maker-input').fill('家名');await page.locator('#maker-generate').click();
 assert.equal(await page.locator('.trace-item').count(),2);
 assert.equal(requests.length,0);
 const before=await page.evaluate(()=>localStorage.getItem('otowai-maker-phonetic-rows'));
 await page.locator('#maker-speak').click();
 await page.waitForFunction(()=>document.querySelector('#maker-audio-status').textContent.includes('每 5 秒'));
 assert.equal(await page.locator('.maker-audio-panel').getAttribute('data-audio-state'),'synthesizing');
 assert.equal(await page.locator('.audio-stages [aria-current="step"]').innerText(),'合成中');
 assert.equal(await page.locator('#maker-speak').isDisabled(),true);
 assert.equal(await page.locator('#maker-ai-voice').isDisabled(),true);
 await page.waitForFunction(()=>document.querySelector('#maker-speak').textContent.includes('重试'));
 assert.equal(await page.locator('.maker-audio-panel').getAttribute('data-audio-state'),'error');
 assert.equal(await page.locator('#maker-input').inputValue(),'家名');
 assert.doesNotMatch(await page.locator('#maker-audio-status').innerText(),/secret/);
 assert.equal(requests.length,2);
 await page.locator('#maker-speak').click();
 await page.waitForFunction(()=>document.querySelector('#maker-audio-player audio')?.duration>0);
 assert.equal(await page.locator('#maker-audio-player audio').getAttribute('controls'),'');
 assert.equal(await page.locator('.maker-audio-panel').getAttribute('data-audio-state'),'ready');
 assert.equal(await page.locator('.audio-stages li[data-complete="true"]').count(),3);
 assert.deepEqual(requests.map(r=>r.action),['create','query','query']);
 assert.equal(new Set(requests.map(r=>r.requestId)).size,1);
 await page.locator('#maker-audio-player audio').evaluate(a=>{a.pause();a.currentTime=a.duration/2;});
 const scrubbed=await page.locator('#maker-audio-player audio').evaluate(a=>a.currentTime);
 assert.ok(scrubbed>0);
 await page.locator('#maker-playback-rate').fill('1.5');
 assert.equal(await page.locator('#maker-audio-player audio').evaluate(a=>a.playbackRate),1.5);
 await page.locator('#maker-rate-reset').click();
 assert.equal(await page.locator('#maker-audio-player audio').evaluate(a=>a.playbackRate),1);
 await page.locator('#maker-speak').click();
 await page.locator('#maker-audio-player audio').evaluate(a=>a.pause());
 const downloadPromise=page.waitForEvent('download');await page.locator('#maker-save-audio').click();
 const download=await downloadPromise;
 assert.deepEqual(await readFile(await download.path()),mp3);
 assert.equal(requests.length,3,'replay/seek/rate/download must use cached audio');
 assert.equal(await page.evaluate(()=>localStorage.getItem('otowai-maker-phonetic-rows')),before);
 await page.locator('#maker-output').screenshot({path:join(artifacts,'desktop-output.png')});
 await page.evaluate(()=>document.documentElement.dataset.theme='dark');
 await page.locator('#maker-output').screenshot({path:join(artifacts,'dark-output.png')});
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'mobile must not scroll sideways');
 await page.locator('#maker-output').screenshot({path:join(artifacts,'mobile-output.png')});
 // Device playback refusal leaves the generated file available, never regenerating.
 await page.locator('#maker-audio-player audio').evaluate(a=>{a.play=()=>Promise.reject(new DOMException('blocked','NotAllowedError'));});
 await page.locator('#maker-speak').click();
 assert.match(await page.locator('#maker-audio-status').innerText(),/播放被阻止/);
 assert.equal(requests.length,3);
 behavior='quota';await page.locator('#maker-input').fill('我');await page.locator('#maker-generate').click();
 await page.locator('#maker-speak').click();
 await page.waitForFunction(()=>document.querySelector('#maker-audio-status').textContent.includes('明天'));
 assert.doesNotMatch(await page.locator('#maker-audio-status').innerText(),/可点击重试/);
 assert.equal(requests.length,4);
 behavior='local';await page.locator('#maker-input').fill('家');await page.locator('#maker-generate').click();
 await page.locator('#maker-speak').click();
 await page.waitForFunction(()=>document.querySelector('#maker-audio-status').textContent.includes('本地预览'));
 assert.doesNotMatch(await page.locator('#maker-audio-status').innerText(),/可点击重试/);
 assert.equal(requests.length,5);
 behavior='failed';await page.locator('#maker-input').fill('名');await page.locator('#maker-generate').click();
 await page.locator('#maker-speak').click();
 await page.waitForFunction(()=>document.querySelector('#maker-audio-status').textContent.includes('新任务可能'));
 assert.equal(await page.locator('#maker-speak').isDisabled(),true);
 assert.equal(await page.locator('#maker-save-audio').isDisabled(),true);
 assert.equal(requests.length,6);
 await page.locator('#maker-input').fill('家\u3402');await page.locator('#maker-generate').click();
 assert.match(await page.locator('.trace-pending').innerText(),/待校对/);
 assert.equal(await page.locator('#maker-speak').isDisabled(),true);
 assert.equal(requests.length,6);
 await page.locator('#maker-input').fill('<img src=x onerror=alert(1)>');await page.locator('#maker-generate').click();
 assert.equal(await page.locator('#maker-output img').count(),0);
 behavior='success';
 await page.locator('#maker-input').fill('家名');await page.locator('#maker-generate').click();
 assert.deepEqual(await page.locator('#maker-ai-voice option').evaluateAll(nodes=>nodes.map(n=>n.value)),['Japanese_CalmLady','Japanese_GentleButler','Japanese_CalmLady_ExtremeHigh','Japanese_GentleButler_MildLow']);
 assert.equal(await page.locator('#maker-ai-voice').inputValue(),'Japanese_CalmLady');
 await page.locator('#maker-speak').click();
 await page.waitForFunction(()=>document.querySelector('#maker-audio-player audio')?.duration>0);
 assert.equal(requests.at(-1).voice,'Japanese_CalmLady');
 const previousId=requests.at(-1).requestId;
 const beforeSwitch=requests.length;
 await page.locator('#maker-ai-voice').selectOption('Japanese_GentleButler');
 assert.equal(requests.length,beforeSwitch,'selection must not submit a paid task');
 assert.equal(await page.locator('#maker-audio-player audio').count(),0,'old voice player must be removed');
 assert.equal(await page.locator('#maker-input').inputValue(),'家名');
 assert.equal(await page.locator('#maker-ai-voice').inputValue(),'Japanese_GentleButler');
 assert.match(await page.locator('#maker-ai-voice-hint').innerText(),/费用/);
 await page.locator('#maker-speak').click();
 await page.waitForFunction(()=>document.querySelector('#maker-audio-player audio')?.duration>0);
 assert.equal(requests.at(-1).voice,'Japanese_GentleButler');
 assert.notEqual(requests.at(-1).requestId,previousId);
 await page.locator('#maker-speak').click();
 assert.equal(requests.length,beforeSwitch+1,'replay must not synthesize again');
 await page.locator('#maker-ai-voice').selectOption('Japanese_CalmLady_ExtremeHigh');
 assert.equal(requests.length,beforeSwitch+1,'high preset selection must not synthesize');
 assert.equal(await page.locator('#maker-audio-player audio').count(),0);
 await page.locator('#maker-speak').click();
 await page.waitForFunction(()=>document.querySelector('#maker-audio-player audio')?.duration>0);
 assert.equal(requests.at(-1).voice,'Japanese_CalmLady_ExtremeHigh');
 assert.equal(requests.at(-1).speed,1);
 const beforeLow=requests.length;
 await page.locator('#maker-ai-voice').selectOption('Japanese_GentleButler_MildLow');
 assert.equal(requests.length,beforeLow,'low preset selection must not synthesize');
 assert.equal(await page.locator('#maker-audio-player audio').count(),0);
 await page.locator('#maker-speak').click();
 await page.waitForFunction(()=>document.querySelector('#maker-audio-player audio')?.duration>0);
 assert.equal(requests.at(-1).voice,'Japanese_GentleButler_MildLow');
 assert.equal(requests.at(-1).speed,1);
 await page.locator('#maker-speak').click();
 assert.equal(requests.length,beforeLow+1,'low preset replay must reuse audio');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.locator('#maker-output').screenshot({path:join(artifacts,'voice-picker-mobile.png')});
 await page.locator('.maker-audio-panel').screenshot({path:join(artifacts,'voice-controls-mobile.png')});
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({passed:true,fixtureRequests:requests.length,paidRequests:0,artifacts}));
} finally {await browser.close();}
