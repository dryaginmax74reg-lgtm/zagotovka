/* ---------- living kitchen concept ---------- */
const livingBaseSheet=sheetHtml;

function livingHeader(person){return '<header class="living-top"><div class="living-mark">Заготовка</div><button class="living-person" data-act="household" aria-label="Наш кабинет">'+esc((person?.name||'Я').slice(0,1).toUpperCase())+'</button></header>';}
function livingDayIndex(d){return d===5?4:Math.max(0,Math.min(4,d));}

dockHtml=function(){
  const labels={day:'Сегодня',week:'Неделя',shop:'Покупки',book:'Рецепты'},order=['day','week','shop','book'];
  const left=shopList().filter(r=>r.buy>0&&!purchased(r)).length;
  return '<nav class="liquid-dock" aria-label="Разделы">'+order.map(k=>'<button data-act="tab" data-v="'+k+'" class="'+(S.tab===k?'on':'')+'"'+(S.tab===k?' aria-current="page"':'')+'>'+IC[k]+'<span>'+labels[k]+'</span>'+(k==='shop'&&left&&S.tab!=='shop'?'<i class="bd">'+left+'</i>':'')+'</button>').join('')+'</nav>';
};

viewDay=function(){
  const d=S.day==null?todayIdx():S.day,slot=d===5?'Обед':'Ужин',ids=mealOf(d,slot),cd=livingDayIndex(d);
  const person=profiles().find(p=>p.key===S.me)||profiles()[0];
  if(!ids.length)return livingHeader(person)+'<main class="motion-scene"><div class="scene-copy"><div class="scene-kicker">Свободный вечер</div><button class="dish-title" data-act="tab" data-v="week">Сегодня можно ничего не готовить</button><p class="dish-meta">План уже учёл этот вечер. Проведите его как хочется.</p></div></main>';
  const mins=ids.reduce((sum,i)=>sum+(REC[i]?.ev||0),0),main=ids[0],c=S.cook[cd];
  return livingHeader(person)+'<main class="motion-scene" data-living-scene><div class="motion-photo">'+previewPhoto(main,REC[main].n,true)+'</div><div class="steam"></div><div class="tomato-guide" aria-hidden="true">🍅</div><div class="scene-copy">'
    +'<div class="scene-kicker">'+(d===todayIdx()?'Сегодня · '+mins+' '+plu(mins,['минута','минуты','минут']):DN[d]+' · '+dtxt(d))+'</div>'
    +'<button class="dish-title" data-act="detail" data-v="'+main+'">'+esc(REC[main].n)+'</button>'
    +'<p class="dish-meta">'+esc(REC[c.s].n)+' · '+esc(REC[c.l].n)+(d<5?'<br>Ужин мягко перейдёт в завтрашний обед.':'')+'</p>'
    +'<div class="gesture-line"><button class="gesture-pill" data-act="detail" data-v="'+main+'">Коснуться блюда</button><button class="gesture-orb" data-act="swap" data-v="m'+cd+'" aria-label="Заменить блюдо">↻</button></div>'
    +'<div class="food-orbit">'+ids.map((i,n)=>'<button class="food-node" data-act="detail" data-v="'+i+'">'+previewPhoto(i,REC[i].n)+'<span>'+['Основное','Гарнир','Овощи'][n]+'</span></button>').join('')+'</div>'
    +'</div></main>';
};

viewWeek=function(){
  const person=profiles().find(p=>p.key===S.me)||profiles()[0],prep=sundayPrep(),cost=planCost();
  let h=livingHeader(person)+'<main class="space-week"><div class="space-heading"><small>'+dtxt(1)+' — '+dtxt(5)+'</small><h1>Ваша неделя<br>на одном столе</h1><p>Листайте тарелки. Нажмите на любую — она раскроется в сегодняшний сценарий.</p></div><div class="space-track">';
  for(let d=0;d<=5;d++){
    const slot=d===5?'Обед':'Ужин',ids=mealOf(d,slot),main=ids[0],t=dayTotals(d,person);
    h+='<button class="day-planet" data-act="openday" data-v="'+d+'">'+(main!==undefined?previewPhoto(main,REC[main].n,true):'')+'<span class="planet-copy"><small>'+DN[d]+' · '+dtxt(d)+'</small><b>'+(main!==undefined?esc(REC[main].n):'Свободный вечер')+'</b><span>'+fmt(t.k)+' ккал'+(d<5?' · ужин станет обедом':'')+'</span></span></button>';
  }
  h+='</div><div class="week-pulse"><button data-act="master"><b>'+prep+' '+plu(prep,['минута','минуты','минут'])+'</b><span>живая заготовка</span></button><button data-act="tab" data-v="shop"><b>'+fmt(cost)+' ₽</b><span>покупки недели</span></button><button data-act="nutrition"><b>Баланс</b><span>без перегруза</span></button></div></main>';
  return h;
};

sheetHtml=function(){
  if(sheet?.kind==='master'){
    const mp=masterPlan(),doneMap=mpDone(),tasks=mp.stages.flatMap(x=>x.items),done=t=>!!(doneMap[t.key]||(t.doneWith&&doneMap[t.doneWith]));
    const completed=tasks.filter(done).length,pct=tasks.length?Math.round(completed/tasks.length*100):0;
    var prepMinutes=sundayPrep();
    return '<div class="shade" data-act="close"></div><div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Живая заготовка"><div class="grab"></div><div class="prep-world"><div class="prep-hero"><button class="rb" data-act="close" aria-label="Закрыть">'+IC.close+'</button><small>Воскресная хореография</small><h2>Кухня движется<br>вместе с вами</h2><p>'+completed+' из '+tasks.length+' действий · примерно '+prepMinutes+' '+plu(prepMinutes,['минута','минуты','минут'])+'</p><div class="prep-progress"><i style="width:'+pct+'%"></i></div></div><div class="prep-flow">'
      +mp.stages.map(stage=>'<section class="prep-stage"><div class="prep-stage-head"><b>'+esc(stage.t)+'</b><span>'+(stage.min?'≈ '+stage.min+' мин':'в потоке')+'</span></div>'+stage.items.map(task=>'<button class="prep-task '+(done(task)?'on':'')+'" data-act="mpchk" data-v="'+task.key+'" role="checkbox" aria-checked="'+done(task)+'"><i>'+(done(task)?'✓':'')+'</i><span>'+(task.t?'<b>'+esc(task.t)+'</b>':'')+'<span>'+esc(task.tx||task.dish||'Подготовьте этап')+'</span></span></button>').join('')+'</section>').join('')
      +'</div></div></div>';
  }
  if(sheet?.kind==='who'){
    return '<div class="shade" data-act="close"></div><div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Начать"><div class="grab"></div><div class="bd" style="padding:34px 22px 30px;text-align:center"><div class="tomato-guide" style="position:relative;inset:auto;margin:0 auto 24px">🍅</div><div class="scene-kicker">Живая кухня</div><h2 style="font-size:34px;margin:10px 0">Меню, которое<br>движется с вами</h2><p class="mut">Выберите сценарий — остальное соберётся вокруг вашего ритма.</p><div style="display:grid;gap:10px;margin-top:22px"><button class="gesture-pill" data-act="startmode" data-v="solo">Готовлю для себя</button><button class="gesture-pill" data-act="startmode" data-v="pair">Готовим вдвоём</button><button class="gesture-pill" data-act="joinlink">Уже есть общий план</button></div></div></div>';
  }
  return livingBaseSheet();
};

document.addEventListener('pointermove',event=>{
  const scene=event.target.closest?.('[data-living-scene]');if(!scene||event.pointerType==='touch')return;
  scene.style.setProperty('--px',Math.round(event.clientX/innerWidth*100)+'%');scene.style.setProperty('--py',Math.round(event.clientY/innerHeight*100)+'%');
},{passive:true});
