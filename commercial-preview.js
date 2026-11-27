/* ---------- commercial UX concept ---------- */
const commercialBaseSheetHtml=sheetHtml;
sheetHtml=function(){
  if(sheet?.kind==='who'){
    return '<div class="shade" data-act="close"></div><div class="sheet" id="sheet" role="dialog" aria-modal="true" aria-label="Начать"><div class="grab"></div><div class="bd">'
      +'<div class="commercial-start"><div class="commercial-logo" aria-hidden="true">🍅</div><h2>Ужин уже продуман</h2><p>Соберём меню, покупки и заготовку под ваш ритм. Настройка займёт около минуты.</p></div>'
      +'<div class="start-choices">'
      +'<button class="choice-card" data-act="startmode" data-v="solo"><i>👤</i><span><b>Готовлю для себя</b><small>Личные порции и цели питания</small></span>'+IC.right+'</button>'
      +'<button class="choice-card" data-act="startmode" data-v="pair"><i>👥</i><span><b>Готовим вдвоём</b><small>Общий ужин, разные порции</small></span>'+IC.right+'</button>'
      +'<button class="join" data-act="joinlink">У меня уже есть общий план</button>'
      +'</div></div></div>';
  }
  return commercialBaseSheetHtml();
};

dockHtml=function(){
  const labels={week:'Неделя',day:'Сегодня',shop:'Покупки',book:'Рецепты'};
  const left=shopList().filter(r=>r.buy>0&&!purchased(r)).length;
  const order=['day','week','shop','book'];
  return '<nav class="dock" aria-label="Разделы">'+order.map(k=>'<button data-act="tab" data-v="'+k+'" class="'+(S.tab===k?'on':'')+'"'+(S.tab===k?' aria-current="page"':'')+'>'+IC[k]+'<span>'+labels[k]+'</span>'+(k==='shop'&&left&&S.tab!=='shop'?'<i class="bd">'+left+'</i>':'')+'</button>').join('')+'</nav>';
};

function commercialMealName(ids){return ids.map(i=>REC[i].n).join(', ');}
function commercialMainDay(d){return d===5?4:Math.max(0,Math.min(4,d));}

viewDay=function(){
  const d=S.day==null?todayIdx():S.day;
  const slot=d===5?'Обед':'Ужин';
  const ids=mealOf(d,slot);
  const cd=commercialMainDay(d),c=S.cook[cd];
  const primary=ids[0];
  const minutes=ids.reduce((sum,i)=>sum+(REC[i]?.ev||0),0);
  const selected=profiles().find(p=>p.key===S.me)||profiles()[0];
  const total=dayTotals(d,selected);
  const today=d===todayIdx();
  let h=bar('Заготовка','<button class="commercial-avatar" data-act="household" aria-label="Наш кабинет">'+esc((selected?.name||'Я').slice(0,1).toUpperCase())+'</button>');
  h+='<div class="commercial-top"><div><div class="commercial-eyebrow">'+(today?'Ваш план на сегодня':DN[d]+', '+dtxt(d))+'</div><h1>'+(today?(d===0?'Спокойное воскресенье':'Сегодня всё просто'):'План на '+DN[d].toLowerCase())+'</h1></div></div>';
  if(!ids.length){
    h+='<div class="calm-card"><h3>Сегодня свободный ужин</h3><p>Доставка, ресторан или импровизация — план уже учёл этот вечер.</p><div class="quick-links"><button class="quick-link" data-act="tab" data-v="week"><b>Посмотреть неделю</b><span>Следующие блюда</span></button><button class="quick-link" data-act="tab" data-v="shop"><b>Проверить покупки</b><span>Что осталось купить</span></button></div></div>';
    return h;
  }
  h+='<div class="today-shell"><div><section class="today-hero">'+previewPhoto(primary,REC[primary].n,true)+'<div class="today-hero-content"><span class="chip">'+minutes+' мин сегодня</span><h2>'+esc(REC[primary].n)+'</h2><p>'+esc(REC[c.s].n)+' · '+esc(REC[c.l].n)+(d<5?'<br>Ужин сегодня станет обедом завтра.':'')+'</p><div class="today-actions"><button class="btn primary" data-act="detail" data-v="'+primary+'">Открыть рецепт</button>'+(slot==='Ужин'?'<button class="btn secondary" data-act="swap" data-v="m'+cd+'">Заменить</button>':'<button class="btn secondary" data-act="tab" data-v="week">Вся неделя</button>')+'</div></div></section></div>';
  h+='<div class="today-side"><div class="section-head"><h2>На тарелке</h2><button data-act="nutrition">Баланс дня</button></div><div class="meal-parts">'+ids.map((i,n)=>'<button class="meal-part" data-act="detail" data-v="'+i+'">'+previewPhoto(i,REC[i].n)+'<small>'+['Основное','Гарнир','Овощи'][n]+'</small><b>'+esc(REC[i].n)+'</b></button>').join('')+'</div>';
  h+='<div class="section-head"><h2>Без лишних решений</h2></div><div class="calm-card"><h3>'+fmt(total.k)+' ккал за день</h3><p>Порции уже рассчитаны для '+esc(selected.name)+'. Подробные показатели доступны, но не мешают готовить.</p><div class="progress-line"><i style="width:'+Math.min(100,Math.round(total.k/(selected.target||1800)*100))+'%"></i></div><div class="quick-links">'+(d===0?'<button class="quick-link" data-act="master"><b>Начать заготовку</b><span>≈ '+sundayPrep()+' мин по шагам</span></button>':'<button class="quick-link" data-act="openday" data-v="'+Math.max(0,d-1)+'"><b>Что уже готово</b><span>Вчерашний ужин</span></button>')+'<button class="quick-link" data-act="tab" data-v="shop"><b>Покупки</b><span>'+shopList().filter(r=>r.buy>0&&!purchased(r)).length+' позиций осталось</span></button></div></div></div></div>';
  return h;
};

viewWeek=function(){
  const cost=planCost(),prep=sundayPrep(),w=warnings();
  const selected=profiles().find(p=>p.key===S.me)||profiles()[0];
  let h=bar('План','<button class="commercial-avatar" data-act="household" aria-label="Наш кабинет">'+esc((selected?.name||'Я').slice(0,1).toUpperCase())+'</button>');
  h+='<section class="week-intro"><div class="commercial-eyebrow">'+dtxt(1)+' — '+dtxt(5)+'</div><h1>Неделя собрана</h1><p>Пять ужинов, обеды из остатков и один свободный вечер. Менять можно точечно — остальное сохранится.</p><div class="week-outcomes"><div class="week-outcome"><b>5</b><span>домашних ужинов</span></div><div class="week-outcome"><b>'+prep+' мин</b><span>заготовка в воскресенье</span></div><div class="week-outcome"><b>'+fmt(cost)+' ₽</b><span>'+(cost<=BUDGET?'в пределах бюджета':'выше ориентира')+'</span></div></div><button class="btn red" style="width:100%" data-act="master">Открыть мастер-план</button></section>';
  h+='<div class="health-signal"><i>✓</i><div><b>'+(w.some(x=>x[0]==='bad')?'План стоит проверить':'Баланс недели хороший')+'</b><span>'+(w.length?'Есть '+w.length+' '+plu(w.length,['подсказка','подсказки','подсказок'])+' — без обязательных запретов':'Белок, овощи и разнообразие распределены ровно')+'</span></div><button class="rb" data-act="nutrition" aria-label="Открыть баланс">'+IC.right+'</button></div>';
  h+='<div class="section-head"><h2>По дням</h2><button data-act="nutrition">Баланс меню</button></div><div class="commercial-days">';
  for(let d=0;d<=5;d++){
    const slot=d===5?'Обед':'Ужин',ids=mealOf(d,slot),t=dayTotals(d,selected),main=ids[0];
    h+='<button class="commercial-day" data-act="openday" data-v="'+d+'">'+(main!==undefined?previewPhoto(main,REC[main].n):'<span></span>')+'<span class="day-copy"><small>'+DN[d]+' · '+dtxt(d)+(d===0?' · заготовка':'')+'</small><b>'+(main!==undefined?esc(REC[main].n):'Свободный вечер')+'</b><span>'+(ids.length>1?esc(REC[ids[1]].n)+' · '+esc(REC[ids[2]].n):'Можно заказать доставку или пойти в ресторан')+'</span></span><span class="day-meta"><b>'+fmt(t.k)+'</b><span>ккал</span></span></button>';
  }
  h+='</div><div class="section-head"><h2>Полезное</h2></div><div class="calm-card"><h3>План работает как единое целое</h3><p>Покупки считаются автоматически, а ужин переходит в обед — меньше готовки и пищевых отходов.</p><div class="quick-links"><button class="quick-link" data-act="tab" data-v="shop"><b>Список покупок</b><span>'+shopList().filter(r=>r.buy>0&&!purchased(r)).length+' позиций осталось</span></button><button class="quick-link" data-act="share"><b>Поделиться</b><span>Отправить план близкому</span></button></div></div>';
  h+='<details class="commercial-manage"><summary>Настроить неделю <span>'+IC.right+'</span></summary><div class="inside"><button class="btn alt" data-act="regen">Собрать другой вариант</button><button class="btn alt" data-act="household">Люди, цели и исключения</button><button class="btn alt" data-act="nutrition">Питание и ключевые нутриенты</button><button class="btn alt" data-act="closeweek">Закрыть неделю</button></div></details>';
  return h;
};

