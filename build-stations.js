// Usage: node build-stations.js ./js/stations ./data/stations.json
const fs=require('fs'),vm=require('vm'),path=require('path');
const dir=process.argv[2]||'./js/stations',out=process.argv[3]||'./data/stations.json';
const all=[];
for(const f of fs.readdirSync(dir).filter(f=>f.endsWith('.js'))){
  const ctx={window:{}};vm.createContext(ctx);
  try{vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8')+';\nthis.__S=window.STATIONS||(typeof STATIONS!=='undefined'?STATIONS:null);',ctx)}
  catch(e){console.warn('skip',f,e.message);continue}
  const src=f.replace('.js','').replace(/-/g,' ');
  (ctx.__S||[]).forEach(s=>all.push({...s,_source:src}));
}
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(all));
console.log(all.length,'stations ->',out);
