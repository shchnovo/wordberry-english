export class MemoryStore {
 constructor(){this.data=new Map();this.serial=0;this.failOnce=false;}
 async get(key){return this.data.has(key)?structuredClone(this.data.get(key).data):null;}
 async getWithMetadata(key){const v=this.data.get(key);return v?structuredClone(v):null;}
 async setJSON(key,value,options={}){
  if(this.failOnce&&key.startsWith('progress/')){this.failOnce=false;return {modified:false};}
  const old=this.data.get(key);
  if(options.onlyIfNew&&old||options.onlyIfMatch&&old?.etag!==options.onlyIfMatch)return {modified:false};
  const etag='"'+(++this.serial)+'"';this.data.set(key,{data:structuredClone(value),etag,metadata:{}});return {modified:true,etag};
 }
 async delete(key){this.data.delete(key);}
 async list({prefix=''}){return {blobs:[...this.data.keys()].filter(key=>key.startsWith(prefix)).map(key=>({key})),directories:[]};}
}
