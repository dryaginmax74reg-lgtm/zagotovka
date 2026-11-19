const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const root=require("path").join(__dirname,".."),html=fs.readFileSync(root+'/index.html','utf8');
const dummy={dataset:{},style:{},classList:{toggle(){},add(){},remove(){}},addEventListener(){},appendChild(){},querySelector(){return dummy},querySelectorAll(){return []},scrollTop:0,innerHTML:''};
const document={...dummy,documentElement:dummy,body:dummy,head:dummy,getElementById(){return dummy},createElement(){return {...dummy}},querySelectorAll(){return []}};
const sandbox={console,document,navigator:{},location:{hash:'',pathname:'/',search:'',protocol:'file:'},history:{replaceState(){}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},matchMedia(){return {matches:true,addEventListener(){}}},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},performance,Date,URL,TextEncoder,Uint8Array,structuredClone,requestAnimationFrame(){},addEventListener(){},scrollTo(){},scrollY:0};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
for(const match of html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)){
 const code=match[1].replace('render();tick();initSync();if(S.sy)gsync();paintLayer();', 'window.__test={viewWeek,viewDay,sheetHtml,setSheet:x=>sheet=x,macroSummary,qualitySummary,SH,MAPK,save};');
 vm.runInContext(code,sandbox,{timeout:20000});
}
const z=sandbox.__z,s=z.gs();let checks=0;
const check=(x,message)=>{assert(x,message);checks++};
check(z.REC.length===436,'catalog retained');
for(const r of z.REC)for(const key of ['k','P','F','C','fiber','produce'])check(Number.isFinite(r[key])&&r[key]>=0,'finite recipe '+r.n+key);
s.nutritionProfile={m:{weight:86,height:175,age:31,sex:'m',activity:1.375,goal:'maintain',mode:'auto'},d:{weight:53,height:170,age:29,sex:'f',activity:1.55,goal:'maintain',mode:'auto'}};
let people=z.profiles();
check(people[0].target===2480,'Mifflin male target');check(people[1].target===1990,'Mifflin female target');
check(people[0].protein>people[1].protein,'individual protein');
check(people[0].factors.main!==people[1].factors.main,'individual main portions');
for(const p of people)for(const f of Object.values(p.factors))check(Number.isFinite(f)&&f>=.4&&f<=2.5,'bounded factors');
// Freeze portions: isolate exact nutrient addition and check no double counting.
s.scale=false;people=z.profiles();let before=z.dayTotals(1,people[0]);
s.microAdd={m:{week:s.wk,foods:{egg:55,alm:25}}};people=z.profiles();let after=z.dayTotals(1,people[0]);
for(const n of ['k','P','F','C'])check(Math.abs(after[n]-before[n]-(z.ING.egg[n]*.55+z.ING.alm[n]*.25))<1e-8,'additions '+n);
check(z.dayTotals(0,people[0]).k===z.mealOf(0,'Ужин').reduce((n,i)=>n+z.REC[i].k,0),'partial day no additions');
check(z.dayTotals(1,people[1]).k===before.k,'participant isolation');
const need=z.needsOf(s.cook.flatMap(c=>[c.m,c.s,c.l]).concat(s.bf));check(need.egg>=220,'shopping four additional eggs');
for(const p of people){const q=z.dietQuality(p);check(Number.isFinite(q.sat)&&Number.isFinite(q.omega),'quality finite');check(q.known.epa<=q.total,'quality coverage');}
check(sandbox.__test.SH.includes('nutritionProfile')&&sandbox.__test.MAPK.includes('nutritionProfile'),'sync settings');
const t=z.personalGoal('m');s.nutritionProfile.m.scope='special';check(!z.personalGoal('m').automatic,'special no automatic');s.nutritionProfile.m.scope='general';s.nutritionProfile.m.age=100;check(!z.personalGoal('m').automatic,'unsupported age no auto');
s.nutritionProfile.m={weight:45,height:175,age:31,sex:'m',activity:1.2,goal:'lose',mode:'auto'};check(!z.personalGoal('m').automatic,'underweight no deficit');
s.nutritionProfile.m={weight:86,height:175,age:31,sex:'m',activity:1.375,goal:'lose',mode:'auto'};s.scale=true;
const p=z.profiles()[0];check(p.target===2110,'15 percent deficit');
for(const kind of ['household','nutrition']){sandbox.__test.setSheet({kind});const result=sandbox.__test.sheetHtml();check(!/NaN|undefined|Infinity/.test(result),'valid drawer '+kind);check(result.includes('nutrition-setting'),'settings accessible '+kind);}
for(const tab of ['week','day']){s.tab=tab;check(!/NaN|undefined|Infinity/.test(tab==='week'?sandbox.__test.viewWeek():sandbox.__test.viewDay()),'valid view '+tab);}
s.microAdd={};s.nutritionProfile={};s.people=8;
for(const profile of z.profiles())check(Number.isFinite(z.dayTotals(1,profile).k),'eight person profile');
s.people=2;s.nutritionProfile={m:{weight:86},d:{weight:53}};
const start=performance.now(),plan=z.generate(),ms=performance.now()-start;check(!!plan,'generator returns plan');s.cook=plan.cook;s.bf=plan.bf;
const report=z.profiles().map(p=>({person:p.key,target:p.target,proteinTarget:p.protein,days:[1,2,3,4].map(d=>{const t=z.dayTotals(d,p);return {k:Math.round(t.k),P:Math.round(t.P),F:Math.round(t.F),C:Math.round(t.C),status:z.macroStatus(t,p)}})}));
check(Number.isFinite(z.menuNutritionPenalty()),'finite score');
console.log(JSON.stringify({checks,generatorMs:Math.round(ms),report},null,2));
// Additional functional regressions: explicit targets, locked plans, exclusions, 8 participants.
s.nutritionProfile.m={weight:86,P:120,F:55,C:210};let custom=z.personalGoal('m');check(custom.protein===120&&custom.fat===55&&custom.carbs===210,'manual macros take priority');
s.norms.m=1800;check(custom.target===1800,'existing manual calorie target preserved');
s.lock=Object.fromEntries(['c0','c1','c2','c3','c4','b0','b1','b2','b3','b4'].map(k=>[k,1]));
const locked=JSON.stringify({cook:s.cook,bf:s.bf});check(JSON.stringify(z.generate())===locked,'all locked recipes retained');s.lock={};
const exclusionNames=Object.keys(s.excluded||{});s.excluded={bird:1,beef:1,pork:1};
// Use production filter keys, not assumptions about their spelling.
const code=html.match(/const FOOD_FILTERS=\{([\s\S]*?)\n\};/)[0];
const filters=[...code.matchAll(/^\s*(\w+):\[/gm)].map(m=>m[1]);
s.excluded=Object.fromEntries(filters.filter(k=>/bird|beef|pork/.test(k)).map(k=>[k,1]));
const restricted=z.generate();check(!!restricted,'restricted menu exists');for(const c of restricted.cook)check(!z.REC[c.m].i.some(([k])=>['chb','cht','tkg','tkt','tkb','beef','pork'].includes(k)),'excluded meats absent');
s.excluded={};s.people=8;s.nutritionProfile={};for(let i=0;i<8;i++)s.norms[i===0?'m':i===1?'d':'p'+i]=1500+i*150;
let eight=z.generate();check(!!eight,'eight-person generation');s.cook=eight.cook;s.bf=eight.bf;
check(z.profiles().length===8,'eight-person targets retained');
for(const p of z.profiles())for(const d of [1,2,3,4])for(const n of ['k','P','F','C'])check(Number.isFinite(z.dayTotals(d,p)[n]),'finite eight-person menu');
console.log('Regression checks passed:',checks);
