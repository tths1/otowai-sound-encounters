// One atomic ledger: shared across serverless instances, no raw IPs or text.
// Counts reservations conservatively, including ambiguous/failed paid calls.
export async function reserveAudioQuota(store, requestId, client, now) {
  const key='public-audio-quota-v1';
  const day=new Date(now+8*3600000).toISOString().slice(0,10);
  for(let attempt=0;attempt<16;attempt++) {
    const entry=await store.getWithMetadata(key,{type:'json'});
    const previous=entry?.data || {};
    const requests=previous.day===day ? previous.requests || [] : [];
    if(requests.includes(requestId))return null;
    const recent=(previous.recent || []).filter(x=>x.time>now-60000);
    if(requests.length>=1000)return 'AUDIO_DAILY_LIMIT';
    if(recent.filter(x=>x.client===client).length>=3)return 'AUDIO_VISITOR_LIMIT';
    const result=await store.setJSON(key,{day,requests:[...requests,requestId],recent:[...recent,{client,time:now}]},entry?{onlyIfMatch:entry.etag}:{onlyIfNew:true});
    if(result.modified)return null;
  }
  return 'AUDIO_BUSY';
}
