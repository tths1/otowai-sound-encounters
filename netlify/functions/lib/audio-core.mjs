// Provider payload/authentication must be implemented from the owner's API docs.
// No speculative external request is made by this preparation module.
export function createAudioHandler({env = {}, adapter, timeoutMs} = {}) {
  const json = (code, status) => Response.json({code,message:'Audio service unavailable'}, {status, headers:{'Cache-Control':'no-store'}});
  return async request => {
    if (request.method !== 'POST') return new Response('Method not allowed',{status:405,headers:{Allow:'POST'}});
    let input;
    try {
      const raw = await request.text();
      if (raw.length > 16000) return json('AUDIO_INVALID_INPUT',400);
      input = JSON.parse(raw);
      if (!input || typeof input.text !== 'string' || !input.text.trim() || input.text.length > 2000 ||
        (input.language !== undefined && input.language !== 'ja-JP') ||
        (input.voice !== undefined && (typeof input.voice !== 'string' || input.voice.length > 80)) ||
        (input.speed !== undefined && (!Number.isFinite(input.speed) || input.speed < .25 || input.speed > 4))) return json('AUDIO_INVALID_INPUT',400);
    } catch {return json('AUDIO_INVALID_INPUT',400);}
    if (env.AI_AUDIO_ENABLED !== 'true' || !env.AI_AUDIO_KEY || !env.AI_AUDIO_URL || !adapter) return json('AUDIO_PROVIDER_NOT_CONFIGURED',503);
    try {if (new URL(env.AI_AUDIO_URL).protocol !== 'https:') return json('AUDIO_PROVIDER_NOT_CONFIGURED',503);} catch {return json('AUDIO_PROVIDER_NOT_CONFIGURED',503);}
    const controller = new AbortController();
    let timer;
    const limit = timeoutMs ?? Math.min(30000,Math.max(1000,Number(env.AI_AUDIO_TIMEOUT_MS) || 20000));
    try {
      const work = async () => {
        const upstream = await adapter({input, env, signal:controller.signal});
        const type = (upstream.headers.get('content-type') || '').split(';')[0].toLowerCase();
        if (!upstream.ok || !/^audio\/(mpeg|mp3|wav|x-wav|ogg|webm|mp4|aac)$/.test(type)) throw new Error('Invalid audio');
        const bytes = await upstream.arrayBuffer();
        if (!bytes.byteLength || bytes.byteLength > 20 * 1024 * 1024) throw new Error('Invalid audio');
        return new Response(bytes,{headers:{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
      };
      return await Promise.race([work(),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort(); reject(new Error('Timeout'));},limit);})]);
    } catch {return json(controller.signal.aborted ? 'AUDIO_TIMEOUT':'AUDIO_UPSTREAM_ERROR',controller.signal.aborted ? 504:502);}
    finally {clearTimeout(timer);}
  };
}
