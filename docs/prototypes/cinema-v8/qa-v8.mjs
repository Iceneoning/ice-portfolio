/* V8 Edge CDP regression: anime fantasy SVG emblem, no WebGL, 390 CSS px, native navigation. */
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
const profile=await mkdtemp(join(tmpdir(),'ice-v8-qa-'));
const sleep=n=>new Promise(r=>setTimeout(r,n));
const processEdge=spawn('C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',['--headless=new','--disable-gpu','--no-first-run','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
const checks=[];const assert=(name,passed,data='')=>{checks.push({name,pass:passed,detail:data});if(!passed)throw Error(name+' '+data)};
let ws;
try{
 let port=0;for(let i=0;i<100;i++){try{port=Number((await readFile(join(profile,'DevToolsActivePort'),'utf8')).split(/\r?\n/)[0]);if(port)break}catch{}await sleep(90)}
 if(!port)throw Error('Edge port unavailable');
 let tab;for(let i=0;i<50;i++){try{tab=(await(await fetch('http://127.0.0.1:'+port+'/json/list')).json()).find(q=>q.type==='page');if(tab)break}catch{}await sleep(100)}
 ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 let counter=0;const pending=new Map();
 ws.addEventListener('message',e=>{const x=JSON.parse(e.data),r=pending.get(x.id);if(!r)return;pending.delete(x.id);x.error?r.reject(Error(x.error.message)):r.resolve(x.result)});
 const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++counter;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
 await cmd('Page.enable');await cmd('Runtime.enable');
 await cmd('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
 const ev=async code=>{const v=await cmd('Runtime.evaluate',{expression:code,returnByValue:true});if(v.exceptionDetails)throw Error('Browser JS exception');return v.result.value};
 async function open(name){await cmd('Page.navigate',{url:pathToFileURL(join(root,name)).href});for(let i=0;i<80;i++){try{const s=await ev('({file:location.pathname,done:document.readyState})');if(s.file.endsWith('/'+name)&&s.done==='complete')break}catch{}await sleep(100)}await sleep(900)}
 async function screenshot(name){const s=await cmd('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});await writeFile(join(root,name),Buffer.from(s.data,'base64'))}
 const info=()=>ev('({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,title:document.title,works:[...document.querySelectorAll(".project")].map(x=>x.getAttribute("href")),next:document.querySelector(".case-next")?.getAttribute("href"),last:document.querySelector(".case-end-actions>a:first-child")?.getAttribute("href"),emblemLoaded:document.querySelector(".emblem-art")?.naturalWidth||0,canvasCount:document.querySelectorAll("canvas").length})');
 await open('index.html');let q=await info();
 assert('390 CSS px mobile',q.width===390,JSON.stringify(q));
 assert('homepage no overflow',q.scrollWidth<=390,'scrollWidth='+q.scrollWidth);
 assert('two independent work links',q.works.includes('./rts.html')&&q.works.includes('./blitz-archive.html'),q.works.join(','));
 assert('emblem SVG successfully loaded',q.emblemLoaded===800,'naturalWidth='+q.emblemLoaded);
 assert('no WebGL canvas in V8',q.canvasCount===0,'canvas count='+q.canvasCount);
 await screenshot('v8-index-mobile390.png');
 await ev('document.querySelector(".project--rts").click()');await sleep(900);q=await info();
 assert('RTS independent page',q.title.includes('RTS'),q.title);
 assert('RTS first next',q.next==='./blitz-archive.html',q.next);
 assert('RTS bottom next',q.last==='./blitz-archive.html',q.last);
 assert('RTS mobile no overflow',q.scrollWidth<=390,String(q.scrollWidth));
 await screenshot('v8-rts-mobile390.png');
 await ev('document.querySelector(".case-next").click()');await sleep(900);q=await info();
 assert('next navigates to BA',q.title.includes('Blitz Archive'),q.title);
 assert('BA first next',q.next==='./rts.html',q.next);
 assert('BA bottom next',q.last==='./rts.html',q.last);
 assert('BA mobile no overflow',q.scrollWidth<=390,String(q.scrollWidth));
 await screenshot('v8-blitz-mobile390.png');
 await ev('document.querySelector(".case-back").click()');await sleep(900);q=await info();
 assert('back to work list',q.title.includes('让规则'),q.title);
 await cmd('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
 assert('reduced-motion media respected',await ev('matchMedia("(prefers-reduced-motion: reduce)").matches'));
 assert('emblem animation disabled in reduced motion',await ev('getComputedStyle(document.querySelector(".emblem-art")).animationName === "none"'));
 assert('homepage emblem has alt empty',await ev('document.querySelector(".emblem-art").getAttribute("alt") === ""'));
 console.log(JSON.stringify({tests:checks,emblemFirstPage:checks[3]},null,2));
}catch(e){console.error(JSON.stringify({error:String(e),tests:checks},null,2));process.exitCode=1}
finally{ws?.close();processEdge.kill();await sleep(350);try{await rm(profile,{recursive:true,force:true,maxRetries:4,retryDelay:200})}catch{}}
