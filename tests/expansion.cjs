const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const root=require("path").join(__dirname,".."),html=fs.readFileSync(root+'/index.html','utf8');
const dummy={dataset:{},style:{},classList:{toggle(){},add(){},remove(){}},addEventListener(){},appendChild(){},querySelector(){return dummy},querySelectorAll(){return []},scrollTop:0,innerHTML:''};
const document={...dummy,documentElement:dummy,body:dummy,head:dummy,getElementById(){return dummy},createElement(){return {...dummy}},querySelectorAll(){return []}};
const sandbox={console,document,navigator:{},location:{hash:'',pathname:'/',search:'',protocol:'file:'},history:{replaceState(){}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},matchMedia(){return {matches:true,addEventListener(){}}},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},performance,Date,URL,TextEncoder,Uint8Array,structuredClone,requestAnimationFrame(){},addEventListener(){},scrollTo(){},scrollY:0};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
for(const match of html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)){
 const code=match[1].replace('render();tick();initSync();if(S.sy)gsync();paintLayer();', 'window.__test={MICRO_FOOD,MICRO_DATA,FIBER,PRODUCE,WHOLE_GRAIN,allowed,recipeSteps,shopList,usageOf,vegKeys,vegMethod,portionShare,planRecipes,purchaseOf,foodWeights,rawMaster:()=>{const original=fq;try{fq=t=>t;return masterPlan();}finally{fq=original;}},viewWeek,viewDay,sheetHtml,setSheet:x=>sheet=x,macroSummary,qualitySummary,SH,MAPK,save};');
 vm.runInContext(code,sandbox,{timeout:20000});
}


const z=sandbox.__z,s=z.gs(),t=sandbox.__test;
const data=JSON.parse(fs.readFileSync(root+'/data/menu-expansion-2026-11-19.json','utf8'));
const supplements=JSON.parse(fs.readFileSync(root+'/data/micronutrient-supplement.json'));
for(const [key,extra] of Object.entries(supplements)){
 const baseline=data.foods[key];
 for(const [name,value] of Object.entries(extra.values)){
  const index=t.MICRO_DATA.find(m=>m.key===name).index;
  assert.equal(t.MICRO_FOOD[key][index],value);
  if(baseline){assert.equal(baseline.micros[index],null);baseline.micros[index]=value;}
 }
 if(baseline&&extra.fiber)baseline.fiber=extra.fiber;
}
let checks=0;const check=(v,msg)=>{assert(v,msg);checks++};
check(Object.keys(z.ING).length===112,'112 ingredients');check(z.REC.length===444,'444 recipes');
check(Object.keys(data.foods).length===12&&data.recipes.length===24,'expansion dimensions');
for(const [key,food] of Object.entries(data.foods)){
 check(z.REC.slice(412).some(r=>r.i.some(([k])=>k===key)),'new ingredient used '+key);
 for(const n of ['k','P','F','C'])check(z.ING[key][n]===food.macros[n],'source macro '+key+n);
 check(t.MICRO_FOOD[key].length===29,'complete vector '+key);
 check(JSON.stringify(t.MICRO_FOOD[key])===JSON.stringify(food.micros),'source micros '+key);
 check(t.FIBER[key]===food.fiber,'source fiber '+key);
 check(z.PRICE_GUIDE.items[key]?.price>0,'sourced new price '+key);
 check(z.PRICE_GUIDE.items[key].url.startsWith('https://lenta.com/'),'price source '+key);
 check(t.MICRO_FOOD[key][24]===(supplements[key]?.values.i??null),'iodine unknown not invented '+key);
}
check(!t.PRODUCE.has('pot'),'starchy potato not non-starchy produce');
check(!t.WHOLE_GRAIN.has('barl'),'pearled barley not whole grain');
const names=new Set(z.REC.slice(0,412).map(r=>r.n));
s.people=2;s.scale=false;s.home={};s.price={};s.microAdd={};
for(const [offset,raw] of [...data.recipes,...JSON.parse(fs.readFileSync(root+"/data/menu-additions.json")).recipes].entries()){
 const id=412+offset,r=z.REC[id];check(r.n===raw.name,'stable appended id '+id);
 check(!names.has(r.n),'unique new recipe '+r.n);names.add(r.n);
 check(t.allowed(id),'new recipe eligible '+r.n);
 for(const [k] of r.i)check(r.st.join(' ').includes('{'+k+'}'),'explicit ingredient action '+r.n+'/'+k);
 const saved=structuredClone({cook:s.cook,bf:s.bf});
 if(r.t==='Завтрак')s.bf[0]=id;else s.cook[0][r.t==='Основное'?'m':r.t==='Гарнир'?'s':'l']=id;
 const need=z.needsOf(t.planRecipes());for(const [k,g] of r.i)check(need[k]>=g*.99,'new recipe included in shopping '+r.n+'/'+k);
 if(r.t==='Основное')check(z.masterPlan().fresh.some(x=>x.id===id),'master fresh entry '+r.n);
 s.day=r.t==='Завтрак'?1:0;s.slot=r.t==='Завтрак'?'Завтрак':'Ужин';
 const day=t.viewDay();check(!/NaN|undefined|Infinity/.test(day),'render day '+r.n);
 check(day.includes(r.n),'recipe visible on day '+r.n);
 s.cook=saved.cook;s.bf=saved.bf;
}
t.setSheet({kind:'nutrition'});const rendered=t.sheetHtml();
check(!rendered.includes('2623 из 2726'),'coverage not stale');check(rendered.includes('из 112'),'coverage includes new foods');
console.log(JSON.stringify({checks,ingredients:Object.keys(z.ING).length,recipes:z.REC.length,status:'passed'},null,2));
