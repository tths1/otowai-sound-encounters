import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync,statSync} from 'node:fs';
const source=readFileSync(new URL('../static-site/app.js',import.meta.url),'utf8');
function harness(provider) {
  const nodes=new Map();
  const get=id=>{if(!nodes.has(id))nodes.set(id,{value:'1',textContent:'',disabled:false,dataset:{},querySelector:get,querySelectorAll:()=>[]});return nodes.get(id);};
  let spoken=0,disposed=0,downloads=0,alerts=0,request;
  const context=vm.createContext({document:{querySelector:get,createElement:()=>({click(){downloads++;}})},window:{alert(){alerts++;}},navigator:{},localStorage:{getItem(){},setItem(){}},
    OtowaiAudio:{createAudioProvider:()=>provider,createAudioSession:input=>{request=input;return {...provider,dispose(){disposed++;}};}},
    getJapaneseVoices:()=>[],getJapaneseVoice:()=>null,escapeHtml:s=>s,MAKER_VOICE_KEY:'voice',
    calibrateSpeechTiming:async()=>({matchedRate:1,referenceSeconds:2,targetSeconds:2,measured:false}),
    measureSpeechDuration:async()=>2,estimateSpeechSeconds:()=>2,clampNumber:(n,a,b)=>Math.max(a,Math.min(b,n)),playSpeech:()=>spoken++,
    setTimeout:fn=>fn(),clearTimeout,URL,Blob,console,
  });
  const start=source.indexOf('function renderMaker(result)');
  const end=source.indexOf('\n}',start)+2;
  vm.runInContext('let disposeMakerAudio = null;\n'+source.slice(start,end),context);
  const render=(extra={})=>context.renderMaker({input:'我',kana:'お',romaji:'o',note:'',confidence:100,...extra});
  return {render,get,request:()=>request,spoken:()=>spoken,disposed:()=>disposed,downloads:()=>downloads,alerts:()=>alerts};
}
test('browser voice picker is removed while playback speed remains available',()=>{
  const h=harness({});h.render();
  assert.doesNotMatch(h.get('#maker-output').innerHTML,/maker-voice|女声优先|备用浏览器朗读声音/);
  assert.match(h.get('#maker-output').innerHTML,/maker-playback-rate/);
});
test('AI voice changes preserve result and do not synthesize until explicitly requested',async()=>{
 let calls=0;
 const h=harness({generate:async()=>{calls++;return {duration:2};},play:async()=>{}});
 h.render({input:'家名',kana:'じあ みん'});
 assert.equal(h.request().voice,'Japanese_CalmLady');
 assert.equal(h.get('#maker-ai-voice').value,'Japanese_CalmLady');
 const select=h.get('#maker-ai-voice');
 select.value='Japanese_GentleButler';select.onchange();
 assert.equal(h.request().voice,'Japanese_GentleButler');
 assert.equal(h.request().text,'じあ みん');
 assert.match(h.get('#maker-output').innerHTML,/家名/);
 assert.equal(h.disposed(),1);assert.equal(calls,0);
 await h.get('#maker-speak').onclick();
 await h.get('#maker-speak').onclick();
 assert.equal(calls,1);
});
test('voice switch cannot interrupt a pending paid generation',async()=>{
 let resolve;
 const h=harness({generate:()=>new Promise(r=>resolve=r),play:async()=>{}});
 h.render();
 const pending=h.get('#maker-speak').onclick();
 assert.equal(h.get('#maker-ai-voice').disabled,true);
 h.get('#maker-ai-voice').value='Japanese_GentleButler';h.get('#maker-ai-voice').onchange();
 assert.equal(h.disposed(),0);
 resolve({duration:2});await pending;
 assert.equal(h.get('#maker-ai-voice').disabled,false);
});
for(const [voice,label] of [['Japanese_CalmLady_ExtremeHigh','高尖搞怪声'],['Japanese_GentleButler_MildLow','轻度低沉']])
test(`${voice} is selectable without synthesis and preserves kana at original speed`,()=>{
 const h=harness({generate:()=>{throw Error('must not submit');}});
 h.render({kana:'じあ みん'});
 assert.ok(h.get('#maker-output').innerHTML.includes(label));
 h.get('#maker-ai-voice').value=voice;
 h.get('#maker-ai-voice').onchange();
 assert.equal(h.request().voice,voice);
 assert.equal(h.request().text,'じあ みん');
 assert.equal(h.request().speed,1);
 assert.equal(h.disposed(),1);
});
test('pending characters block generation, playback and saving',async()=>{
 let calls=0;const h=harness({generate:async()=>{calls++;return {duration:2};},play:async()=>{calls++;}});
 h.render({input:'龘',kana:'【龘·待校对】',generatedChars:[{char:'龘',confirmed:false}],matchedChars:[]});
 await h.get('#maker-speak').onclick();await h.get('#maker-save-audio').onclick();
 assert.equal(calls,0);assert.equal(h.spoken(),0);assert.equal(h.get('#maker-speak').disabled,true);
});
test('AI failure offers retry without silently using browser speech',async()=>{
  const h=harness({generate:async()=>{throw Error('disabled');}}); h.render();
  await h.get('#maker-speak').onclick();
  assert.equal(h.spoken(),0); assert.match(h.get('#maker-audio-status').textContent,/重试/);
  assert.match(h.get('#maker-speak').textContent,/重试/);
  assert.equal(h.get('#maker-save-audio').disabled,false);
});
test('terminal failed task stops retrying and discloses a new generation may cost',async()=>{
 const h=harness({generate:async()=>{throw Object.assign(Error('failed'),{code:'AUDIO_TASK_FAILED'});}});h.render();
 await h.get('#maker-speak').onclick();
 assert.equal(h.get('#maker-speak').disabled,true);
 assert.equal(h.get('#maker-save-audio').disabled,true);
 assert.match(h.get('#maker-audio-status').textContent,/重新转换/);
 assert.match(h.get('#maker-audio-status').textContent,/费用/);
 assert.equal(h.spoken(),0);
});
test('output exposes trace and original-speed controls without silent calibration claims',()=>{
  const h=harness({});h.render({trace:[{char:'我',pinyin:'wo',kana:'お',source:'manual'}]});
  const html=h.get('#maker-output').innerHTML;
  assert.match(html,/逐字转换依据/);assert.match(html,/映射规则/);
  assert.doesNotMatch(html,/手写/);
  assert.match(html,/maker-audio-player/);assert.match(html,/maker-rate-reset/);
  assert.doesNotMatch(html,/静音测量|匹配后微调/);
});
test('maker shows a small AI audio-use tip with a built-in audition clip',()=>{
  const h=harness({});h.render();
  const html=h.get('#maker-output').innerHTML;
  assert.match(html,/可以生成像这样的声音，用途由使用者自行决定/);
  assert.match(html,/maker-disclaimer\.mp3/);
  assert.match(html,/controls/);
});
test('built-in AI tip audition clip is a non-empty MP3 asset',()=>{
  const stat=statSync(new URL('../static-site/maker-disclaimer.mp3',import.meta.url));
  assert.ok(stat.size > 1024);
});
test('AI plays natural duration without automatic Chinese time stretching',async()=>{
  let played;
  const h=harness({generate:async()=>({duration:6}),play:async(...args)=>played=args,setRate(){}});h.render();
  await h.get('#maker-speak').onclick();
  assert.deepEqual(played,[6,1]); assert.equal(h.spoken(),0);
  h.render(); assert.equal(h.disposed(),1);
});
test('pure Japanese kana reaches speech API without inserted spaces',()=>{
  const h=harness({});h.render({input:'こんにちは。',kana:'こ ん に ち は 。'});
  assert.equal(h.request().text,'こんにちは。');
});
test('mapping display distinguishes rule coverage from pronunciation accuracy',()=>{
  const h=harness({});
  h.render({input:'忽逢桃花林',matchedChars:[{char:'逢'},{char:'桃'},{char:'花'},{char:'林'}],generatedChars:[{char:'忽',confirmed:false}]});
  assert.match(h.get('#maker-output').innerHTML,/已有规则覆盖：4\/5 个汉字/);
  assert.match(h.get('#maker-output').innerHTML,/不代表读音准确率/);
  assert.doesNotMatch(h.get('#maker-output').innerHTML,/学习匹配率/);
  h.render();
  assert.match(h.get('#maker-output').innerHTML,/未记录规则覆盖统计/);
});
test('failed Save then successful Speak allows direct Blob download on mobile',async()=>{
  let calls=0;
  const h=harness({generate:async()=>{if(!calls++)throw Error('temporary'); return {duration:2,mimeType:'audio/mpeg',blob:new Blob(['audio'],{type:'audio/mpeg'})};},play:async()=>{}});
  h.render();
  await h.get('#maker-save-audio').onclick();
  await h.get('#maker-speak').onclick();
  await h.get('#maker-save-audio').onclick();
  assert.equal(h.downloads(),1); assert.equal(h.alerts(),0);
});
