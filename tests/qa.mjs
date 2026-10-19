import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';import {JSDOM} from 'jsdom';
const release='.',base='.',results=[];const fail=[];let scripts=0,refs=0;
for(const name of fs.readdirSync(release)){
 const file=path.join(release,name);if(name.endsWith('.js')){try{new vm.Script(fs.readFileSync(file,'utf8'),{filename:name});scripts++}catch(e){fail.push(e.message)}}
 if(!name.endsWith('.html'))continue;
 const doc=new JSDOM(fs.readFileSync(file,'utf8')).window.document;
 const ids=[...doc.querySelectorAll('[id]')].map(e=>e.id);const dup=ids.filter((x,i)=>ids.indexOf(x)!==i);
 if(dup.length)fail.push(name+' duplicate ids: '+dup);
 for(const [i,s] of [...doc.scripts].entries())if(!s.src&&(!s.type||s.type==='text/javascript')){try{new vm.Script(s.textContent,{filename:name+':inline'+i});scripts++}catch(e){fail.push(e.message)}}
 for(const el of doc.querySelectorAll('[src],[href]')){const raw=el.getAttribute('src')||el.getAttribute('href');if(!raw||/^(https?:|#|data:|mailto:|javascript:)/.test(raw)||raw.includes('${'))continue;const ref=raw.split(/[?#]/)[0].replace(/^\//,'');if(!ref)continue;refs++;if(!fs.existsSync(path.join(release,ref))&&!fs.existsSync(path.join(base,ref)))fail.push(name+' missing local reference '+ref)}
 doc.defaultView?.close?.();
}
for(const ref of ['assets/nexa-ui/hub-bg.png','assets/nexa-ui/transfer-bg.png',...['boo','evl','cwk','ops','str','ber'].map(x=>'nexa_alliance_selection/'+x+'.webp')]){refs++;if(!fs.existsSync(path.join(base,ref)))fail.push('Missing art '+ref)}
if(fail.length){console.log(fail);process.exit(1)}
console.log('PASS syntax:',scripts,'inline/external scripts; unique HTML ids; local refs:',refs);results.push(`${scripts} JavaScript syntax checks (including inline legacy scripts)`,`${refs} internal paths and existing image references`, 'HTML parse and unique id checks');
const core=fs.readFileSync('nexa-quick-core.js','utf8');const c={Blob,TextEncoder};vm.createContext(c);vm.runInContext(core,c);const q=c.NexaQuick;
const rows=[{game_name:'A',game_id:'12345',current_state:'1518',current_alliance:'BOO',status:'waiting',priority:4},{game_name:'B',game_id:'23456',status:'approved'}];q.setStatus(rows,rows[1],'waiting');if(rows[1].priority!==5)throw Error('wait ordering');if(!q.summary(rows).includes('A | 12345 | 1518 | BOO'))throw Error('copy format');fs.writeFileSync('tests/test-export.xlsx',new Uint8Array(await q.xlsx([['Game Name','Game ID','Text'],['Kari','123456','=HYPERLINK("bad")']]).arrayBuffer()));console.log('PASS pure priority/copy helpers and XLSX generation');results.push('Pure waiting priority/copy helper checks','XLSX export generation (strings cannot execute spreadsheet formulas)');fs.writeFileSync('tests/static-results.json',JSON.stringify(results,null,2));
