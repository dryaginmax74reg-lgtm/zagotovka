/* ---------- living kitchen concept ---------- */
const livingBaseSheet=sheetHtml;

function livingHeader(person){return '<header class="living-top"><div><div class="living-mark">Заготовка</div><span class="living-status"><i></i>план собран</span></div><button class="living-person" data-act="household" aria-label="Наш кабинет">'+esc((person?.name||'Я').slice(0,1).toUpperCase())+'</button></header>';}
function livingDayIndex(d){return d===5?4:Math.max(0,Math.min(4,d));}
function livingMinutes(ids){return ids.reduce((sum,i)=>sum+(REC[i]?.ev||0),0);}
function livingDayRail(active){return '<div class="day-rail" aria-label="Дни недели">'+[0,1,2,3,4,5].map(d=>'<button class="'+(d===active?'on':'')+'" data-act="openday" data-v="'+d+'"><span>'+DN[d].slice(0,2)+'</span><i></i></button>').join('')+'</div>';}

dockHtml=function(){
  const labels={day:'Сегодня',week:'Неделя',shop:'Покупки',book:'Рецепты'},order=['day','week','shop','book'];
  const left=shopList().filter(r=>r.buy>0&&!purchased(r)).length;
  return '<nav class="liquid-dock" aria-label="Разделы">'+order.map(k=>'<button data-act="tab" data-v="'+k+'" class="'+(S.tab===k?'on':'')+'"'+(S.tab===k?' aria-current="page"':'')+'>'+IC[k]+'<span>'+labels[k]+'</span>'+(k==='shop'&&left&&S.tab!=='shop'?'<i class="bd">'+left+'</i>':'')+'</button>').join('')+'</nav>';
};

viewDay=function(){
  const d=S.day==null?todayIdx():S.day,slot=d===5?'Обед':'Ужин',ids=mealOf(d,slot),cd=livingDayIndex(d);
  const person=profiles().find(p=>p.key===S.me)||profiles()[0];
  if(!ids.length)return livingHeader(person)+'<main class="motion-scene"><div class="scene-copy"><div class="scene-kicker">Свободный вечер</div><button class="dish-title" data-act="tab" data-v="week">Сегодня можно ничего не готовить</button><p class="dish-meta">План уже учёл этот вечер. Проведите его как хочется.</p></div></main>';
  const mins=livingMinutes(ids),main=ids[0],c=S.cook[cd],totals=dayTotals(d,person),target=person.target||1800,pct=Math.min(100,Math.round(totals.k/target*100));
  return livingHeader(person)+'<main class="motion-scene" data-living-scene><div class="motion-photo">'+previewPhoto(main,REC[main].n,true)+'</div><div class="scene-veil"></div><div class="scene-grain"></div><div class="steam"></div><div class="tomato-guide" aria-hidden="true"><span></span></div>'+livingDayRail(d)+'<div class="scene-copy">'
    +'<div class="scene-kicker"><span>'+(d===todayIdx()?'Сегодня':DN[d]+' · '+dtxt(d))+'</span><b>'+mins+' '+plu(mins,['минута','минуты','минут'])+'</b></div>'
    +'<button class="dish-title" data-act="detail" data-v="'+main+'">'+esc(REC[main].n)+'</button>'
    +'<p class="dish-meta">'+esc(REC[c.s].n)+'<span>·</span>'+esc(REC[c.l].n)+(d<5?'<em>Ужин станет обедом завтра</em>':'')+'</p>'
    +'<div class="scene-hud"><div><span>День</span><b>'+fmt(totals.k)+' <small>ккал</small></b><i><u style="width:'+pct+'%"></u></i></div><div><span>Белок</span><b>'+Math.round(totals.P)+' <small>г</small></b></div><div><span>Активно</span><b>'+mins+' <small>мин</small></b></div></div>'
    +'<div class="gesture-line"><button class="gesture-pill" data-act="detail" data-v="'+main+'"><i></i><span>Начать готовить</span><b>пошагово</b></button><button class="gesture-orb" data-act="swap" data-v="m'+cd+'" aria-label="Заменить блюдо"><span>↻</span><small>замена</small></button></div>'
    +'<div class="food-orbit">'+ids.map((i,n)=>'<button class="food-node" data-act="detail" data-v="'+i+'">'+previewPhoto(i,REC[i].n)+'<span><small>'+['Основное','Гарнир','Овощи'][n]+'</small><b>'+esc(REC[i].n)+'</b></span></button>').join('')+'</div>'
    +'</div></main>';
};

viewWeek=function(){
  const person=profiles().find(p=>p.key===S.me)||profiles()[0],prep=sundayPrep(),cost=planCost();
  let h=livingHeader(person)+'<main class="space-week"><div class="week-aurora"></div><div class="space-heading"><small>'+dtxt(1)+' — '+dtxt(5)+'</small><h1>Неделя уже<br><em>сложилась</em></h1><p>Каждая тарелка связана с покупками и воскресной заготовкой. Листайте как историю.</p><div class="week-proof"><span><i></i>5 разных основных</span><span><i></i>без повторной готовки днём</span></div></div><div class="space-track">';
  for(let d=0;d<=5;d++){
    const slot=d===5?'Обед':'Ужин',ids=mealOf(d,slot),main=ids[0],t=dayTotals(d,person);
    const mins=main===undefined?0:livingMinutes(ids);
    h+='<button class="day-planet" data-act="openday" data-v="'+d+'">'+(main!==undefined?previewPhoto(main,REC[main].n,true):'')+'<span class="planet-index">0'+(d+1)+'</span><span class="planet-copy"><small>'+DN[d]+' · '+dtxt(d)+'</small><b>'+(main!==undefined?esc(REC[main].n):'Свободный вечер')+'</b><span><i>'+fmt(t.k)+' ккал</i><i>'+mins+' мин</i>'+(d<5?'<i>×2 приёма</i>':'')+'</span></span><span class="planet-touch">коснуться</span></button>';
  }
  h+='</div><div class="week-pulse"><button data-act="master"><span class="pulse-icon">◌</span><b>'+prep+' '+plu(prep,['минута','минуты','минут'])+'</b><span>единый сценарий заготовки</span></button><button data-act="tab" data-v="shop"><span class="pulse-icon">⌁</span><b>'+fmt(cost)+' ₽</b><span>список уже собран</span></button><button data-act="nutrition"><span class="pulse-icon">✦</span><b>В норме</b><span>ключевой баланс</span></button></div></main>';
  return h;
};

sheetHtml=function(){
  if(sheet?.kind==='master'){
    const mp=masterPlan(),doneMap=mpDone(),tasks=mp.stages.flatMap(x=>x.items),done=t=>!!(doneMap[t.key]||(t.doneWith&&doneMap[t.doneWith]));
    const completed=tasks.filter(done).length,pct=tasks.length?Math.round(completed/tasks.length*100):0;
    var prepMinutes=sundayPrep();
    const nextTask=tasks.find(t=>!done(t));
    return '<div class="shade" data-act="close"></div><div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Живая заготовка"><div class="grab"></div><div class="prep-world"><div class="prep-hero"><button class="rb" data-act="close" aria-label="Закрыть">'+IC.close+'</button><small>Живой сценарий</small><h2>Готовим не блюда.<br><em>Готовим неделю.</em></h2><div class="prep-now"><span>'+pct+'%</span><div><b>'+(nextTask?'Следом: '+esc(nextTask.t||nextTask.tx||nextTask.dish||'следующий этап'):'Всё готово')+'</b><small>'+completed+' из '+tasks.length+' действий · '+prepMinutes+' '+plu(prepMinutes,['минута','минуты','минут'])+'</small></div></div><div class="prep-progress"><i style="width:'+pct+'%"></i></div></div><div class="prep-flow">'
      +mp.stages.map(stage=>'<section class="prep-stage"><div class="prep-stage-head"><b>'+esc(stage.t)+'</b><span>'+(stage.min?'≈ '+stage.min+' мин':'в потоке')+'</span></div>'+stage.items.map(task=>'<button class="prep-task '+(done(task)?'on':'')+'" data-act="mpchk" data-v="'+task.key+'" role="checkbox" aria-checked="'+done(task)+'"><i>'+(done(task)?'✓':'')+'</i><span>'+(task.t?'<b>'+esc(task.t)+'</b>':'')+'<span>'+esc(task.tx||task.dish||'Подготовьте этап')+'</span></span></button>').join('')+'</section>').join('')
      +'</div></div></div>';
  }
  if(sheet?.kind==='who'){
    return '<div class="shade" data-act="close"></div><div class="sheet living-onboard" id="sheet" role="dialog" aria-modal="true" aria-label="Начать"><div class="onboard-canvas"><button class="onboard-close" data-act="close" aria-label="Посмотреть демо">×</button><div class="onboard-orbit"><i></i><i></i><i></i><span></span></div><div class="onboard-copy"><div class="scene-kicker">Заготовка · живая кухня</div><h2>Вся неделя.<br><em>В одном движении.</em></h2><p>Меню, покупки и готовка соединятся вокруг вашего ритма — без ежедневных решений.</p></div><div class="onboard-choices"><button data-act="startmode" data-v="pair"><span>01</span><b>Готовим вдвоём</b><small>разные порции · один общий план</small></button><button data-act="startmode" data-v="solo"><span>02</span><b>Готовлю для себя</b><small>личная норма и бюджет</small></button><button data-act="joinlink"><span>03</span><b>Подключиться</b><small>по коду общего плана</small></button></div><p class="onboard-hint">Коснитесь своего сценария</p></div></div>';
  }
  return livingBaseSheet();
};

document.addEventListener('pointermove',event=>{
  const scene=event.target.closest?.('[data-living-scene]');if(!scene||event.pointerType==='touch')return;
  scene.style.setProperty('--px',Math.round(event.clientX/innerWidth*100)+'%');scene.style.setProperty('--py',Math.round(event.clientY/innerHeight*100)+'%');
},{passive:true});

document.addEventListener('click',event=>{
  if(!event.target.closest?.('.onboard-close'))return;
  event.preventDefault();event.stopImmediatePropagation();sheet=null;paintLayer();setTab('day');
},true);
