import test from 'node:test';
import assert from 'node:assert/strict';
import {downloadAudio,isPublicIPv4} from '../netlify/functions/lib/audio-download.mjs';
test('audio downloader rejects local and unsafe destinations',async()=>{
  for(const ip of ['127.0.0.1','10.0.0.1','172.16.0.1','192.168.1.2','169.254.169.254','100.64.1.1','0.0.0.0','224.0.0.1','::1'])assert.equal(isPublicIPv4(ip),false,ip);
  assert.equal(isPublicIPv4('8.8.8.8'),true);
  for(const url of ['http://example.com/a.mp3','https://user:password@example.com/a.mp3','https://127.0.0.1/a.mp3','https://example.com:8080/a.mp3'])await assert.rejects(downloadAudio(url));
});
