'use strict';
const headersFor = key => ({apikey:key,...(/^eyJ/.test(key)?{Authorization:'Bearer '+key}:{})});
const supabaseBase = url => String(url||'').replace(/\/rest\/v1\/?$/,'').replace(/\/$/,'');
const failure = () => Object.assign(new Error('育成の保存先に接続できません。'), {status:503});
function supabaseImages(url, key) {
  const base = supabaseBase(url) + '/storage/v1/object';
  const headers = headersFor(key);
  return {
    async put(name, bytes) {
      const response = await fetch(base + '/pet-images/' + name, {method:'POST',headers:{...headers,'Content-Type':'image/png','x-upsert':'true'},body:bytes,signal:AbortSignal.timeout(60000)});
      if (!response.ok) throw failure();
    },
    async get(name) {
      const response = await fetch(base + '/authenticated/pet-images/' + name, {headers,signal:AbortSignal.timeout(60000)});
      if (response.status === 404 || response.status === 400) throw Object.assign(new Error('Image not found'), {code:'ENOENT'});
      if (!response.ok || Number(response.headers.get('Content-Length')) > 20*1024*1024) throw failure();
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length > 20*1024*1024) throw failure();
      return bytes;
    },
    async remove(name) {
      const response = await fetch(base + '/pet-images', {method:'DELETE',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({prefixes:[name]}),signal:AbortSignal.timeout(30000)});
      if (!response.ok) throw failure();
    }
  };
}
class QueuedDesigner {
  constructor() {this.external = true;this.status = 'worker';}
  async connect() {return this.status;}
}
module.exports = {supabaseImages, QueuedDesigner,headersFor,supabaseBase};
