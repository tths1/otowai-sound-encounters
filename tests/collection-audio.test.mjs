import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';

test('collection playback uses saved audio at natural speed and never calls speech API',async()=>{
 const source=await fs.readFile('static-site/collection-audio.js','utf8');
 const requests=[],sounds=[];
 class Audio {constructor(src){this.src=src;this.playbackRate=1;sounds.push(this);}async play(){this.played=true;}pause(){this.paused=true;}}
 const ctx={Audio,fetch:async url=>{requests.push(url);return {ok:true,json:async()=>({entries:{'し':'/collection-audio/sample.mp3'}})};}};
 vm.runInNewContext(source,ctx);
 const button={textContent:'听听声音',disabled:false};
 await ctx.CollectionAudio.play('し',button);
 assert.equal(sounds[0].src,'/collection-audio/sample.mp3');
 assert.equal(sounds[0].playbackRate,1);assert.equal(sounds[0].played,true);
 await ctx.CollectionAudio.play('し',button);
 assert.equal(sounds[0].paused,true);
 assert.deepEqual(requests,['/collection-audio/manifest.json']);
 await ctx.CollectionAudio.play('missing',button);
 assert.match(button.textContent,/不可用/);assert.equal(button.disabled,false);
 assert.equal(sounds.length,2);
});
