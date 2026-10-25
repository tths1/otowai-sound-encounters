/* Classic script: also importable in Node tests without DOM side effects. */
(() => {
  const failure = (code, userMessage = 'AI 音频暂不可用') => Object.assign(new Error(userMessage), {code, userMessage});
  function validateAudioRequest(request) {
    if (!request || typeof request.text !== 'string' || !request.text.trim() || [...request.text].length > 200) throw failure('AUDIO_INVALID_INPUT','AI 朗读每次最多 200 个假名字符（含空格），请缩短句子。');
    const {text, language = 'ja-JP', voice = 'default', speed = 1} = request;
    if (language !== 'ja-JP' || typeof voice !== 'string' || voice.length > 80 || !Number.isFinite(speed) || speed < .25 || speed > 4) throw failure('AUDIO_INVALID_INPUT');
    return {text, language, voice, speed};
  }
  async function normalizeAudioResponse(response) {
    if (!response.ok) {
      const state = await response.json().catch(() => ({}));
      if (state.error === 'LOCAL_PREVIEW_ONLY') throw failure('LOCAL_PREVIEW_ONLY', '本地预览未连接 AI 语音接口；可在词集中试听已生成音频。');
      if (state.code === 'AUDIO_TASK_FAILED') throw failure('AUDIO_TASK_FAILED', '本次 AI 合成任务已失败。');
      if (state.code === 'AUDIO_SUBMISSION_UNCERTAIN') throw failure('AUDIO_SUBMISSION_UNCERTAIN', '接口尚未确认提交结果；请勿刷新或重新转换后重复提交，稍后重试查询当前任务。');
      throw failure(response.status === 503 ? 'AUDIO_PROVIDER_NOT_CONFIGURED' : 'AUDIO_REQUEST_FAILED', response.status === 503
        ? 'AI 语音服务暂未就绪，请稍后重试。' : 'AI 音频请求未完成，请稍后重试。');
    }
    const mimeType = (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
    if (!/^audio\/(mpeg|mp3|wav|x-wav|ogg|webm|mp4|aac)$/.test(mimeType)) throw failure('AUDIO_INVALID_RESPONSE');
    const blob = await response.blob();
    if (!blob.size || blob.size > 20 * 1024 * 1024) throw failure('AUDIO_INVALID_RESPONSE');
    return {blob, mimeType, duration:null, provider:'ai'};
  }
  function createAudioProvider(options = {}) {
    let lastJob = null;
    let visitor;
    try {visitor=globalThis.localStorage?.getItem('otowai-audio-visitor');} catch {}
    if(!/^[a-f0-9-]{36}$/i.test(visitor || '')) {
      visitor=crypto.randomUUID();
      try {globalThis.localStorage?.setItem('otowai-audio-visitor',visitor);} catch {}
    }
    const sleep = options.sleep || ((ms, signal) => new Promise((resolve,reject) => {
      const abort=()=>{clearTimeout(timer);reject(failure('AUDIO_CANCELLED'));};
      const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},ms);
      signal.addEventListener('abort',abort,{once:true});if(signal.aborted)abort();
    }));
    return {async generateAudio(request, signal) {
      const body = validateAudioRequest(request);
      const fingerprint=JSON.stringify(body);
      if(lastJob?.fingerprint!==fingerprint)lastJob={fingerprint,requestId:crypto.randomUUID(),action:'create'};
      const job=lastJob;
      const controller = new AbortController();
      let timedOut = false;
      const abort = () => controller.abort();
      signal?.addEventListener('abort', abort, {once:true});
      if (signal?.aborted) abort();
      const timer = setTimeout(() => {timedOut=true;abort();}, options.timeoutMs || 300000);
      try {
        options.onProgress?.(job.action === 'create' ? '正在提交 AI 语音任务…' : '正在重新查询已有任务…', 'submitting');
        while(!controller.signal.aborted) {
          const payload=job.action==='create'?{...body,action:'create',requestId:job.requestId}:{action:'query',requestId:job.requestId};
          const response=await (options.fetch || globalThis.fetch)('/api/audio', {
            method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Audio-Visitor':visitor},body:JSON.stringify(payload),signal:controller.signal,
          });
          if(response.status===202) {
            const state=await response.json();
            if(!['pending','processing'].includes(state.status))throw failure('AUDIO_INVALID_RESPONSE');
            job.action='query';
            options.onProgress?.('AI 正在合成日语音频，每 5 秒查询进度，最长等待 5 分钟…', 'synthesizing');
          } else if(response.status===429) {
            const state=await response.clone().json().catch(()=>({}));
            if(state.code==='AUDIO_DAILY_LIMIT')throw failure(state.code,'今日全站 1,000 次 AI 语音额度已用完，请明天再试。');
            if(state.code==='AUDIO_VISITOR_LIMIT')throw failure(state.code,'每分钟最多 3 次 AI 语音请求（同一网络共享限额），请稍后再试。');
            options.onProgress?.('音频服务繁忙，5 秒后重试，不重复创建已提交任务…', 'waiting');
          } else {
            if(response.status===403)throw failure('AUDIO_FORBIDDEN','无法验证本次访问，请刷新网页再试。');
            if(response.ok)options.onProgress?.('合成完成，正在加载音频…', 'downloading');
            return await normalizeAudioResponse(response);
          }
          await sleep(5000,controller.signal);
        }
        throw failure('AUDIO_TIMEOUT','音频等待超时，已保留任务，不会自动重新提交');
      } catch (error) {
        if(timedOut)throw failure('AUDIO_TIMEOUT','音频等待超时，已保留任务，不会自动重新提交');
        if(signal?.aborted)throw failure('AUDIO_CANCELLED','已停止等待音频');
        throw error.code && error.userMessage ? error : failure('AUDIO_NETWORK_ERROR', '网络连接中断，可重试查询同一任务。');
      } finally {clearTimeout(timer); signal?.removeEventListener('abort', abort);}
    }};
  }
  const playbackRate = (duration, target, adjustment = 1) => {
    if (!(Number.isFinite(duration) && duration > 0 && Number.isFinite(target) && target > 0)) return 1;
    return Math.min(4, Math.max(.25, duration / target * (Number.isFinite(adjustment) && adjustment > 0 ? adjustment : 1)));
  };
  function createAudioSession(request, options = {}) {
    const provider = options.provider || createAudioProvider();
    const urls = options.url || URL;
    const controller = new AbortController();
    let disposed = false, pending, result, audio, url;
    const check = () => {if (disposed) throw failure('AUDIO_DISPOSED');};
    const status = value => {if (!disposed) options.onStatus?.(value);};
    const release = () => {
      if (audio) {audio.pause(); audio.removeAttribute('src'); audio.load(); audio=null;}
      if (url) {urls.revokeObjectURL(url); url=null;}
    };
    async function generate() {
      check();
      if (result) return result;
      if (pending) return pending;
      status('generating');
      pending = (async () => {
        try {
          const generated = await provider.generateAudio(request, controller.signal);
          check();
          url = urls.createObjectURL(generated.blob);
          audio = (options.makeAudio || (src => new Audio(src)))(url);
          if (!(Number.isFinite(audio.duration) && audio.duration > 0)) {
            await new Promise((resolve, reject) => {
              const done = error => {clearTimeout(timer); audio?.removeEventListener('loadedmetadata', ready); audio?.removeEventListener('error', failed); controller.signal.removeEventListener('abort', cancelled); error ? reject(error) : resolve();};
              const ready = () => done();
              const failed = () => done(failure('AUDIO_DECODE_ERROR'));
              const cancelled = () => done(failure('AUDIO_DISPOSED'));
              const timer = setTimeout(failed, 10000);
              audio.addEventListener('loadedmetadata', ready); audio.addEventListener('error', failed);
              controller.signal.addEventListener('abort', cancelled, {once:true});
            });
          }
          check();
          if (!(Number.isFinite(audio.duration) && audio.duration > 0)) throw failure('AUDIO_INVALID_DURATION');
          result = {...generated, duration:audio.duration};
          status('ready'); return result;
        } catch (error) {release(); status('unavailable'); throw error;}
        finally {pending=null;}
      })();
      return pending;
    }
    return {
      generate,
      getAudioElement() {return audio || null;},
      async play(targetSeconds, adjustment) {await generate(); check(); audio.playbackRate=playbackRate(result.duration,targetSeconds,adjustment); audio.currentTime=0; await audio.play(); status('playing');},
      setRate(targetSeconds, adjustment) {if (audio && result) audio.playbackRate=playbackRate(result.duration,targetSeconds,adjustment);},
      stop() {audio?.pause();},
      async download() {return (await generate()).blob;},
      dispose() {disposed=true; controller.abort(); release();},
    };
  }
  globalThis.OtowaiAudio = {validateAudioRequest, normalizeAudioResponse, createAudioProvider, createAudioSession, playbackRate};
})();
