const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const root=require("path").join(__dirname,".."),html=fs.readFileSync(root+'/index.html','utf8');
const dummy={dataset:{},style:{},classList:{toggle(){},add(){},remove(){}},addEventListener(){},appendChild(){},querySelector(){return dummy},querySelectorAll(){return []},scrollTop:0,innerHTML:''};
const document={...dummy,documentElement:dummy,body:dummy,head:dummy,getElementById(){return dummy},createElement(){return {...dummy}},querySelectorAll(){return []}};
const sandbox={console,document,navigator:{},location:{hash:'',pathname:'/',search:'',protocol:'file:'},history:{replaceState(){}},localStorage:{getItem(){return null},setItem(){},removeItem(){}},matchMedia(){return {matches:true,addEventListener(){}}},setTimeout(){},clearTimeout(){},setInterval(){},clearInterval(){},performance,Date,URL,TextEncoder,Uint8Array,structuredClone,requestAnimationFrame(){},addEventListener(){},scrollTo(){},scrollY:0};
sandbox.window=sandbox;sandbox.globalThis=sandbox;
vm.createContext(sandbox);
for(const match of html.matchAll(/<script(?: [^>]*)?>([\s\S]*?)<\/script>/g)){
 const code=match[1].replace('render();tick();initSync();if(S.sy)gsync();paintLayer();', 'window.__test={shopList,purchaseOf,priceOf,viewShop,shopItems,shopOpenSet:k=>shopOpen=k,viewWeek,viewDay,sheetHtml,setSheet:x=>sheet=x,macroSummary,qualitySummary,SH,MAPK,save};');
 vm.runInContext(code,sandbox,{timeout:20000});
}

const z=sandbox.__z,s=z.gs(),t=sandbox.__test,guide=z.PRICE_GUIDE;
const snapshot=JSON.parse(fs.readFileSync(root+'/data/lenta-prices-2026-11-19.json','utf8'));
let checks=0;const check=(x,msg)=>{assert(x,msg);checks++};
check(guide.autoUpdate===false,'no automatic updates');check(guide.card==='Карта №1','loyalty card prices');check(guide.store===null,'store not falsely assigned');
check(Object.keys(guide.items).length===64,'64 confirmed ingredient prices');
check(snapshot.unmatched.length===30,'unconfirmed ingredients explicit');
s.home={};s.price={};
for(const [key,item] of Object.entries(guide.items)){
 check(z.ING[key],'known ingredient '+key);check(Number.isFinite(item.price)&&item.price>0,'finite price '+key);
 check(item.url.startsWith('https://lenta.com/'),'retailer evidence '+key);
 check(snapshot.entries[key].price===item.price,'snapshot matches application '+key);
 check(!snapshot.entries[key].reference.multiBuy,'no multi-buy discount silently applied '+key);
 if(item.pack){
  check(t.purchaseOf(key,1)===item.pack,'small quantity needs whole pack '+key);
  check(Math.abs(z.pricedCost(key,item.pack)-item.cardPrice)<1e-8,'pack price exact '+key);
  check(t.purchaseOf(key,item.pack+1)===item.pack*2,'second pack rounded '+key);
  s.home[key]=item.pack;check(t.purchaseOf(key,item.pack)===0,'stock avoids purchase '+key);delete s.home[key];
 }
 if(item.limitKg){check(item.regularPrice>0,'ordinary price exists above offer limit '+key);const grams=item.limitKg*1000+1000;check(Math.abs(z.pricedCost(key,grams)-(item.limitKg*item.price+item.regularPrice))<1e-8,'limit respected '+key);}
}
check(Math.abs(z.pricedCost('egg',550)-106.99)<1e-8,'eggs ten-pack price');
check(z.packOf('egg')===550,'ten eggs equal 550 edible grams');
check(Math.abs(z.packOf('oo')-455)<1e-8,'oil 500ml converted using documented density');
check(z.packOf('fet')===180,'cheese uses 180g net mass, not 225g brine mass');
s.price.yog=700;check(t.priceOf('yog')===700,'personal price has priority');check(z.packOf('yog')===0,'personal price does not imply store packaging');check(z.pricedCost('yog',100)===70,'personal cost');s.price={};
const cov=z.priceCoverage();check(cov.checked+cov.missing.length===cov.total,'complete provenance coverage');
check(z.priceSourceHtml('kal').includes('не сверена'),'unverified price visible');
check(z.priceSourceHtml('yog').includes('2,5%'),'pricing analogy disclosed');
for(const key of ['egg','oo','fet','kal','yog']){t.shopOpenSet(key);const html=t.shopItems();check(!/NaN|undefined|Infinity/.test(html),'valid grocery HTML '+key);}
check(t.viewShop().includes('без автообновления'),'snapshot label in shopping');
console.log(JSON.stringify({checks,confirmed:Object.keys(guide.items).length,unconfirmed:snapshot.unmatched.length,coverage:cov,status:'passed'},null,2));
