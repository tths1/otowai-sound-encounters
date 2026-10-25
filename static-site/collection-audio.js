// Pre-generated collection audio: playback never submits a paid synthesis job.
(() => {
 let manifestPromise, active, activeButton, request = 0;
 const reset = button => { if(button){button.textContent='▶ 听听声音';button.disabled=false;} };
 async function play(kana,button){
  const version=++request;
  if(active){active.pause();active=null;}reset(activeButton);activeButton=button;
  button.textContent='正在加载 AI 音频…';button.disabled=true;
  try {
   if(!manifestPromise)manifestPromise=fetch('/collection-audio/manifest.json').then(r=>{
    if(!r.ok)throw Error('manifest');return r.json();
   }).catch(error=>{manifestPromise=null;throw error;});
   const manifest=await manifestPromise;if(version!==request)return;
   const src=manifest.entries[kana];
   if(typeof src!=='string'||!/^\/collection-audio\/[a-zA-Z0-9-]+\.mp3$/.test(src))throw Error('missing');
   const audio=new Audio(src);active=audio;audio.playbackRate=1;
   audio.onended=()=>{if(version===request)reset(button);};
   audio.onerror=()=>{if(version===request){button.disabled=false;button.textContent='AI 音频不可用，点击重试';}};
   await audio.play();
   if(version!==request){audio.pause();return;}
   button.disabled=false;button.textContent='◼ 正在播放 AI 音频';
  }catch{
   if(version===request){button.disabled=false;button.textContent='AI 音频不可用，点击重试';}
  }
 }
 globalThis.CollectionAudio={play};
})();
