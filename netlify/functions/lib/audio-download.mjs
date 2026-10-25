import {lookup} from 'node:dns/promises';
import {get} from 'node:https';

// Pin public IPv4 DNS during download to prevent SSRF/DNS-rebinding. IPv6-only
// audio hosts deliberately fail closed until an explicit provider host is known.
export function isPublicIPv4(address) {
  const parts=address.split('.').map(Number);
  if(parts.length!==4 || parts.some(n=>!Number.isInteger(n)||n<0||n>255))return false;
  const [a,b]=parts;
  return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&b===168||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19)||a===192&&b===0||a===198&&b===51||a===203&&b===0);
}
export async function downloadAudio(value,signal) {
  const url=new URL(value);
  if(url.protocol!=='https:' || url.username || url.password || url.port && url.port!=='443')throw Error('Invalid audio URL');
  const records=await lookup(url.hostname,{all:true,family:4});
  if(!records.length || records.some(r=>!isPublicIPv4(r.address)))throw Error('Private audio URL');
  return new Promise((resolve,reject)=>{
    const req=get(url,{signal,agent:false,lookup:(_host,options,callback)=>{
      if(options.all)callback(null,[records[0]]);else callback(null,records[0].address,4);
    }},res=>{
      if(res.statusCode!==200){res.resume();reject(Error('Audio HTTP error'));return;}
      const chunks=[];let size=0;
      res.on('data',chunk=>{size+=chunk.length;if(size>4*1024*1024){res.destroy(Error('Audio too large'));return;}chunks.push(chunk);});
      res.on('error',reject);
      res.on('end',()=>resolve(new Response(Buffer.concat(chunks),{headers:{'Content-Type':res.headers['content-type']||''}})));
    });
    req.on('error',reject);
  });
}
