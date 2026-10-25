import {mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {loadLocalAudioSettings} from './local-audio-backend.mjs';

if(process.env.ALLOW_AUDIO_SLOT_RECOVERY!=='true')throw Error('Audio slot recovery requires explicit approval');
const settings=await loadLocalAudioSettings();
const {getStore}=await import('../netlify/functions/node_modules/@netlify/blobs/dist/main.js');
const store=getStore({name:'otowai-audio-jobs',consistency:'strong',siteID:settings.siteID,token:settings.token});
const namespace=createHash('sha256').update(settings.env.APIZ_API_KEY).digest('hex').slice(0,24);
const slotKey=n=>`${namespace}/slots/${n}`;
const taskKey=id=>`${namespace}/tasks/${id}`;
const slots=[];
for(let n=0;n<6;n++){
 const slot=await store.getWithMetadata(slotKey(n),{type:'json'});
 if(!slot?.data?.requestId)continue;
 const task=await store.getWithMetadata(taskKey(slot.data.requestId),{type:'json'});
 if(!task || task.data.status!=='submitting' || task.data.taskId)throw Error(`Refusing recovery for slot ${n}: task is no longer an unassigned submission`);
 slots.push({slot:n,requestId:slot.data.requestId,slotEtag:slot.etag,taskEtag:task.etag,task:{...task.data}});
}
if(!slots.length){console.log(JSON.stringify({status:'nothing-to-recover'}));process.exit(0);}
const archiveDir='outputs/audio-slot-recovery';
await mkdir(archiveDir,{recursive:true});
const archive=`${archiveDir}/recovery-${new Date().toISOString().replaceAll(':','-')}.json`;
await writeFile(archive,JSON.stringify({createdAt:new Date().toISOString(),reason:'user-authorized stale slot recovery',slots},null,2));
for(const item of slots){
 const abandoned=await store.setJSON(taskKey(item.requestId),{...item.task,status:'abandoned',abandonedAt:Date.now(),abandonedReason:'stale submission without provider task id; archived before release'},{onlyIfMatch:item.taskEtag});
 if(!abandoned.modified)throw Error(`Task changed during recovery: ${item.requestId}`);
 const released=await store.setJSON(slotKey(item.slot),{requestId:null,clearedAt:Date.now()},{onlyIfMatch:item.slotEtag});
 if(!released.modified)throw Error(`Slot changed during recovery: ${item.slot}`);
}
console.log(JSON.stringify({status:'recovered',count:slots.length,archive}));
