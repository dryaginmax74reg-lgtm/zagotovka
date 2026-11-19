const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const root=require("path").join(__dirname,".."),html=fs.readFileSync(root+'/index.html','utf8');
const dummy={dataset:{},style:{},classList:{toggle(){},add(){},remove(){}},addEventListener(){},appendChild(){},querySelector(){return dummy},querySelectorAll(){return []},scrollTop:0,innerHTML:''};
const document={...dummy,documentElement:dummy,body:dummy,head:dummy,getElementById(){return dummy},createElement(){return {...dummy}},querySelectorAll(){return []}};
const sandbox={console,document,navigator:{},location:{hash:'',pathname:'/',search:'',protocol:'file:'},history:{replaceState(){}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},matchMedia(){return {matches:true,addEventListener(){}}},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},performance,Date,URL,TextEncoder,Uint8Array,structuredClone,requestAnimationFrame(){},addEventListener(){},scrollTo(){},scrollY:0};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
for(const match of html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)){
 const code=match[1].replace('render();tick();initSync();if(S.sy)gsync();paintLayer();', 'window.__test={recipeSteps,shopList,usageOf,vegKeys,vegMethod,portionShare,planRecipes,purchaseOf,foodWeights,rawMaster:()=>{const original=fq;try{fq=t=>t;return masterPlan();}finally{fq=original;}},viewWeek,viewDay,sheetHtml,setSheet:x=>sheet=x,macroSummary,qualitySummary,SH,MAPK,save};');
 vm.runInContext(code,sandbox,{timeout:20000});
}

const STEMS={"chb": "кур|мяс|филе|фарш", "cht": "кур|мяс|бедр|фарш", "tkg": "индей|фарш|мяс", "tkt": "индей|мяс|бедр|фарш", "tkb": "индей|мяс|филе|фарш", "cod": "треск|рыб|филе", "pol": "минта|рыб|филе", "til": "тилап|рыб|филе", "sal": "лосос|рыб|филе", "trt": "форел|рыб|филе", "bass": "сибас|рыб", "mac": "скумбр|рыб", "per": "окун|рыб|филе", "hal": "палтус|рыб|филе", "pink": "горбуш|рыб|филе", "scl": "гребеш", "shr": "кревет", "sqd": "кальмар", "msl": "миди", "kal": "кале", "koh": "кольраб", "fen": "фенхел", "egg": "яйц|яич", "cot": "творог", "yog": "йогурт", "mlk": "молок", "fet": "фет", "moz": "моцарел|сыр", "par": "пармез|сыр", "buck": "греч", "rice": "рис", "brr": "рис", "cus": "кус.?кус", "bul": "булгур", "oat": "овся|хлоп", "qui": "киноа", "len": "чечевиц", "chk": "нут", "kid": "фасол", "cor": "кукуруз", "olv": "маслин|оливк", "tmc": "томат|помидор", "tpa": "томат|паст", "onion": "лук", "gar": "чеснок", "carrot": "морков", "cab": "капуст", "nap": "капуст", "beet": "свекл", "zuc": "кабач|цукин", "spi": "шпинат", "aru": "руккол", "rom": "ромэн|листь|листья|салат", "bro": "броккол", "mush": "шампинь|гриб", "rad": "редис", "swp": "батат", "pum": "тыкв", "cel": "сельдер", "avo": "авокад", "cuc": "огур", "tom": "помидор|томат", "pep": "перец|перц", "egp": "баклаж", "gb": "фасол", "pea": "горош", "asp": "спарж", "lek": "порей|лук", "apple": "яблок", "ora": "апельсин", "ban": "банан", "lime": "лайм", "lem": "лимон", "kiw": "киви", "grf": "грейпфрут", "pear": "груш", "pom": "гранат", "man": "манго", "blu": "черник|ягод", "prs": "петруш|зелен", "dil": "укроп|зелен", "cil": "кинз|зелен", "gin": "имбир", "oo": "масл", "wal": "орех", "alm": "миндал|орех", "ses": "кунжут", "psd": "семеч", "tah": "тахин", "soy": "соев", "hon": "мед", "mst": "горчиц", "beef": "говядин|мяс|стейк", "pork": "свин|мяс|медальон|вырезк"};

Object.assign(STEMS,{straw:'клубник',sour:'вишн',curr:'смородин',rasp:'малин',haz:'фундук',cash:'кешью',mill:'пшен',barl:'перлов',cau:'капуст',bru:'капуст',scallion:'лук',pot:'картофел'});
const z=sandbox.__z,s=z.gs(),t=sandbox.__test;
let checks=0;const check=(ok,msg)=>{assert(ok,msg);checks++};
const mentioned=(text,key)=>text.includes('{'+key+'}')||new RegExp(STEMS[key],'i').test(text.replaceAll('ё','е'));
for(const [id,r] of z.REC.entries()){
  const keys=r.i.map(x=>x[0]);
  check(new Set(keys).size===keys.length,'duplicate ingredients '+id);
  check(Number.isInteger(r.p)&&r.p>0,'valid portions '+id);
  for(const [k,g] of r.i)check(z.ING[k]&&Number.isFinite(g)&&g>0,'ingredient '+id+'/'+k);
  const all=[...r.st,...(r.bs||[]).map(x=>x[1])].join(' ');
  for(const k of keys)check(mentioned(all,k),'ingredient has action '+id+'/'+k);
  for(const steps of [r.st,(r.bs||[]).map(x=>x[1]),t.recipeSteps(r,'fresh'),t.recipeSteps(r,'frozen')]){
    for(const text of steps)for(const m of text.matchAll(/\{(\w+)\}/g))check(keys.includes(m[1]),'phantom ingredient '+id+'/'+m[1]);
    for(const text of steps)check(!/[{}]|NaN|undefined|Infinity/.test(z.fq(text,r)),'formatted step '+id);
  }
  if(r.bt){
    const fresh=t.recipeSteps(r,'fresh').join(' ');
    for(const k of keys)check(mentioned(fresh,k),'standalone fresh flow includes '+id+'/'+k);
    check(!/zip-пакет|заморозьте|морозилк/.test(fresh),'fresh flow has no freezer operations '+id);
    // Every recipe's grouped vegetable operations must survive master-plan aggregation.
    const old=s.cook;s.cook=Array.from({length:5},()=>({m:id,s:old[0].s,l:old[0].l}));
    const master=t.rawMaster();
    for(const k of new Set([...t.vegKeys(r),...r.bs.filter(([stage])=>stage==='v').flatMap(([,tx])=>[...tx.matchAll(/\{(\w+)\}/g)].map(m=>m[1]))]))check(master.stages.some(stage=>stage.items.some(item=>item.key==='v_'+k)),'master prep '+id+'/'+k);
    s.cook=old;
  }
}
const find=name=>z.REC.find(r=>r.n===name);
check(!find('Банановые оладьи').st.join(' ').includes('молок'),'no milk without ingredient');
check(!find('Яйца с творогом, огурцом и укропом').st.join(' ').includes('лимон'),'no lemon without ingredient');
check(!find('Овсяные оладьи с яблоком').st.join(' ').includes('банан'),'no banana in apple pancakes');
check(!find('Шакшука со шпинатом').st.join(' ').includes('петруш'),'no parsley without ingredient');
check(!find('Лосось с брокколи и соевым соусом').st.join(' ').includes('масл'),'no hidden oil in salmon');
check(find('Креветки с брокколи и имбирём').st.findIndex(x=>x.includes('на пару'))<find('Креветки с брокколи и имбирём').st.findIndex(x=>x.startsWith('Добавьте креветки')),'vegetables cook first');
// Independent mass balance from all actual meals Sun dinner through Friday lunch.
for(const count of [1,2,3,8])for(const scaling of [false,true]){
  s.people=count;s.scale=scaling;s.home={};s.microAdd={};s.nutritionProfile={};
  for(let i=0;i<count;i++)s.norms[i===0?'m':i===1?'d':'p'+i]=1400+i*150;
  let people=z.profiles();
  s.microAdd={m:{week:s.wk,foods:{egg:55,alm:25}}};people=z.profiles();
  const expected={};
  for(let d=0;d<=5;d++)for(const slot of ['Завтрак','Обед','Ужин'])for(const id of z.mealOf(d,slot))for(const person of people){
    const r=z.REC[id];for(const [k,g] of r.i)expected[k]=(expected[k]||0)+g/r.p*z.portionFactor(person,r);
  }
  expected.egg=(expected.egg||0)+4*55;expected.alm=(expected.alm||0)+4*25;
  const actual=z.needsOf(t.planRecipes());
  for(const k of new Set([...Object.keys(expected),...Object.keys(actual)]))check(Math.abs((expected[k]||0)-(actual[k]||0))<1,'weekly shopping mass balance '+count+'/'+scaling+'/'+k);
  const garlic=t.shopList().find(row=>row.k==='gar');
  if(garlic){const usage=t.usageOf('gar').reduce((sum,row)=>sum+row.g,0);check(Math.abs(usage-garlic.total)<1,'garlic shopping equals recipe usage');}
  for(const id of t.planRecipes()){
    const sum=people.reduce((n,p)=>n+t.portionShare(p,z.REC[id]),0);check(Math.abs(sum-(z.REC[id].t==='Завтрак'?100:50))<1e-8,'portion shares sum to correct meal fraction');
  }
  s.home={egg:55,gar:10};
  for(const row of t.shopList()){
    check(row.buy>=0&&row.buy+ (s.home[row.k]||0)>=row.total-1e-6,'purchases cover need '+row.k);
    if(row.k==='egg')check(Math.abs(row.buy/55-Math.round(row.buy/55))<1e-8,'buy whole eggs');
    if(row.k==='gar')check(row.buy%35===0,'buy whole garlic heads');
  }
}
console.log(JSON.stringify({recipes:z.REC.length,checks,status:'passed'},null,2));
