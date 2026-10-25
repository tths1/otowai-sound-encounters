// Explicit opt-in: one short real paid generation, in a fresh logged-out browser.
import assert from 'node:assert/strict';
if(process.env.ALLOW_PAID_AUDIO_TEST!=='true')throw Error('Set ALLOW_PAID_AUDIO_TEST=true to authorize one short live generation.');
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser=await chromium.launch({headless:true,...(process.env.BROWSER_EXECUTABLE?{executablePath:process.env.BROWSER_EXECUTABLE}:{})});
try {
 const context=await browser.newContext();const page=await context.newPage();
 await page.addInitScript(()=>{
   window.testAudioPlayed=false;
   const play=HTMLMediaElement.prototype.play;
   HTMLMediaElement.prototype.play=async function(){await play.call(this);window.testAudioPlayed=true;};
 });
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const outcomes=[];
 page.on('response',response=>{if(new URL(response.url()).pathname==='/api/audio')outcomes.push({status:response.status(),type:response.headers()['content-type']});});
 await page.goto('https://otowai-sound-encounters.netlify.app/#maker');
 assert.equal(await page.locator('#maker-config').isVisible(),false);
 await page.locator('#maker-input').fill('𰻞');await page.locator('#maker-generate').click();
 assert.equal(await page.locator('#maker-speak').isDisabled(),true);
 await page.locator('#maker-input').fill('こんにちは。');await page.locator('#maker-generate').click();
 await page.locator('#maker-speak').click();
 await page.waitForFunction(()=>window.testAudioPlayed===true,{},{timeout:300000});
 assert.ok(outcomes.some(x=>x.status===200 && x.type.includes('audio/mpeg')));
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({loggedOut:true,editorHidden:true,unknownBlocked:true,realAudioPlayed:true,outcomes}));
} finally {await browser.close();}
