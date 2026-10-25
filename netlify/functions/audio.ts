import {getStore} from '@netlify/blobs';
import {getUser} from '@netlify/identity';
import {createHash} from 'node:crypto';
import {createApizAudioHandler} from './lib/apiz-audio.mjs';

// Public speech; editing endpoints retain their separate admin authorization.
export default async (request: Request, context) => {
  if(process.env.AI_AUDIO_ENABLED !== 'true')return Response.json({code:'AUDIO_PROVIDER_NOT_CONFIGURED'},{status:503});
  // Only trust Netlify's context, not caller-supplied forwarding headers.
  if(!context?.ip)return Response.json({code:'AUDIO_CLIENT_UNAVAILABLE'},{status:503});
  const digest = value => createHash('sha256').update(`${process.env.APIZ_API_KEY}:${value}`).digest('hex');
  const response = await createApizAudioHandler({env:process.env,
    store:getStore({name:'otowai-audio-jobs',consistency:'strong'}),
    quotaClient:digest(context.ip),
    authorize:async()=>{
      const user=await getUser();
      if(user?.appMetadata?.roles?.includes('admin'))return user.id;
      const visitor=request.headers.get('X-Audio-Visitor');
      return /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(visitor || '') ? `visitor:${digest(visitor)}` : null;
    },
  })(request);
  // Only a machine-readable outcome is logged, never text, identity or secrets.
  console.info('audio-result', response.status, response.headers.get('content-type')?.includes('application/json') ? (await response.clone().json()).code : 'audio');
  return response;
};
export const config = {path:'/api/audio'};
