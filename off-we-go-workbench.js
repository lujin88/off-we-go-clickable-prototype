// Source block 1
const t=(key,vars)=>window.OffWeGoI18n?.t(key,vars)??key;
const home=document.querySelector('#home'),pages=[...document.querySelectorAll('.page')],settings=document.querySelector('#settings'),toast=document.querySelector('#toast'),queryInput=document.querySelector('#queryInput'),shortcuts=document.querySelector('#shortcuts'),chosenConditions=document.querySelector('#chosenConditions');let conditions=[];
    function show(id){if(typeof window.show==='function'&&window.show!==show)return window.show(id);home.style.display='none';pages.forEach(p=>p.classList.toggle('show',p.id===id));window.scrollTo(0,0)}function goHome(){if(typeof window.goHome==='function'&&window.goHome!==goHome)return window.goHome();home.style.display='block';pages.forEach(p=>p.classList.remove('show'))}function note(text){toast.textContent=t(text);toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}window.note=note;
    function holidayDateField(kind){const attr=kind==='end'?'data-end':'data-start';const byId=document.querySelector(kind==='end'?'#holidayEnd':'#holidayStart');if(byId)return byId;const active=document.querySelector('#dates .school-break-card.active, #holidayChoice.active');return active?.querySelector('['+attr+']')||document.querySelector('#dates ['+attr+']')}
    function readHolidayDate(kind,fallback){return holidayDateField(kind)?.value||fallback||''}
    function writeHolidayDates(startValue,endValue,dateText){const startField=holidayDateField('start'),endField=holidayDateField('end');if(startField&&startValue){startField.value=startValue;startField.dispatchEvent(new Event('change',{bubbles:true}))}if(endField&&endValue){endField.value=endValue;endField.dispatchEvent(new Event('change',{bubbles:true}))}const hidden=document.querySelector('#manualDates');if(hidden&&dateText!=null)hidden.value=dateText}
    function goToResults(){(typeof window.show==='function'?window.show:show)('results')}
    const initialSuggestions=['下一个假期','带孩子','海边放松','滑雪旅行'];const nextSuggestions={"下一个假期":['带孩子','暖和一点','轻松一点','滑雪旅行'],"带孩子":['下一个假期','轻松一点','海边放松','主题乐园'],"海边放松":['下一个假期','带孩子','轻松一点','全包式酒店'],"滑雪旅行":['下一个假期','带孩子','人少一点','初学者友好']};function renderConditions(){const last=conditions.at(-1),suggestions=(last?nextSuggestions[last]:initialSuggestions).filter(x=>!conditions.includes(x));chosenConditions.classList.toggle('show',conditions.length>0);chosenConditions.innerHTML=conditions.length?'<span class="chosen-label">'+t('home.added')+'</span>'+conditions.map(x=>'<button class="selected-condition" type="button" data-remove="'+x+'">'+(t(x))+' ×</button>').join(''):'';shortcuts.innerHTML=suggestions.map(x=>'<button class="shortcut" type="button" data-add="'+x+'">'+t(x)+'</button>').join('');const joinWith=window.OffWeGoI18n?.getLanguage?.()==='en'?', ':'，';queryInput.value=conditions.map(item=>window.OffWeGoI18n?.t?.(item)||item).join(joinWith)+(conditions.length?joinWith:'');document.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{conditions=conditions.filter(x=>x!==b.dataset.remove);renderConditions();note(t('toast.removed',{item:t(b.dataset.remove)}))});document.querySelectorAll('[data-add]').forEach(b=>b.onclick=()=>{conditions.push(b.dataset.add);renderConditions();queryInput.focus()})}function updateResults(){if(window.OffWeGoPlanNavigation?.renderWorkbenchSummary){window.OffWeGoPlanNavigation.renderWorkbenchSummary();return;}const detail=conditions.length?conditions.map(item=>t(item)).join(' · '):t('copy.from_this_search');document.querySelector('#resultsQuery').innerHTML=t('results.query_line',{detail})+' <button type="button">'+t('copy.edit_trip')+'</button>'}renderConditions();window.addEventListener('offwego:language',renderConditions);document.querySelector('#search').onclick=()=>{updateResults();show('question')};const skip=document.querySelector('#skip');if(skip)skip.onclick=()=>{updateResults();show('results')};document.querySelectorAll('.choice').forEach(b=>b.onclick=()=>{document.querySelectorAll('.choice').forEach(x=>x.classList.remove('active'));b.classList.add('active');updateResults();setTimeout(()=>show('results'),260)});document.querySelectorAll('[data-home]').forEach(b=>b.onclick=goHome);
    function isSettingsOpen(){return Boolean(settings?.classList.contains('show'))}
    function syncSettingsTrigger(){document.querySelectorAll('#globalSettingsAction,#settingsHome,#settingsResults,#settingsAdjust').forEach(button=>{if(!button)return;button.setAttribute('aria-expanded',isSettingsOpen()?'true':'false');button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','settings');});}
    function openSettings(){document.querySelector('#profileMenu')?.classList.remove('show');settings?.classList.add('show');syncSettingsTrigger();}
    function closeSettings(){settings?.classList.remove('show');syncSettingsTrigger();}
    function toggleSettings(event){event?.preventDefault();event?.stopPropagation();if(isSettingsOpen())closeSettings();else openSettings();}
    window.openSettings=openSettings;window.closeSettings=closeSettings;window.toggleSettings=toggleSettings;
    document.querySelector('#profile')?.remove();document.querySelector('#profileMenu')?.remove();
    document.querySelector('#closeSettings')?.addEventListener('click',closeSettings);
    settings?.addEventListener('click',e=>{if(e.target===settings)closeSettings()});
    if(settings)new MutationObserver(syncSettingsTrigger).observe(settings,{attributes:true,attributeFilter:['class']});
    syncSettingsTrigger();
    let activeProvider='DeepSeek';document.querySelector('#testApi').onclick=()=>note('请先连接 DeepSeek 或 Gemini，再测试服务。');document.querySelectorAll('.add-api').forEach(b=>b.onclick=()=>{activeProvider=b.dataset.provider;document.querySelector('#apiTitle').textContent=t('connect.title',{name:activeProvider});document.querySelector('#apiHelp').textContent=t('connect.help',{name:activeProvider});document.querySelector('#apiKey').value='';document.querySelector('#apiConfig').classList.add('show')});const closeApi=()=>document.querySelector('#apiConfig').classList.remove('show');document.querySelector('#closeApi').onclick=closeApi;document.querySelector('#cancelApi').onclick=closeApi;document.querySelector('#saveApi').onclick=()=>{if(!document.querySelector('#apiKey').value){note('请先在本地输入 API 密钥。');return}const status=document.querySelector('.api-status[data-provider="'+activeProvider+'"]');if(status){status.textContent=t('common.connected');status.dataset.connected='true'}closeApi();note(t('connect.demo_saved',{name:activeProvider}))};document.querySelector('#share')?.addEventListener('click',()=>note('已准备微信分享链接（演示）'));document.querySelector('#export')?.addEventListener('click',()=>note('HTML 行程已准备导出（演示）'));
    document.querySelector('#language')?.addEventListener('change', event => {
      window.OffWeGoI18n?.setLanguage(event.target.value);
    });
    // Local application bridge: preferences live in a local data file; secrets live in macOS Keychain.
    (async()=>{document.querySelector('#settings .setting-group:last-child')?.remove();async function refresh(){try{const data=await fetch('/api/bootstrap').then(r=>r.json());document.querySelectorAll('.api-status').forEach(el=>{const connected=Boolean(data.keys[el.dataset.provider]);el.dataset.connected=connected?'true':'false';el.textContent=t(connected?'common.connected':'common.not_connected')})}catch{}}await refresh();window.addEventListener('offwego:language',refresh);document.querySelector('#saveApi').onclick=async()=>{const key=document.querySelector('#apiKey').value;if(!key)return note('请先输入 API 密钥。');try{const r=await fetch('/api/keys/'+activeProvider,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})}),data=await r.json();if(!r.ok)throw new Error(data.error);closeApi();await refresh();note(t('connect.stored_keychain',{name:activeProvider}))}catch(e){note('保存失败：请通过本地应用打开。')}};document.querySelector('#testApi').onclick=async()=>{const provider=['DeepSeek','Gemini'].find(p=>document.querySelector('.api-status[data-provider="'+p+'"]')?.dataset.connected==='true');if(!provider)return note('请先连接 DeepSeek 或 Gemini。');note(t('connect.testing',{name:provider}));try{const r=await fetch('/api/keys/'+provider+'/test',{method:'POST'}),data=await r.json();if(!r.ok)throw new Error(data.error);note(t('connect.ok',{name:provider}))}catch(e){note(t('toast.test_failed',{message:e.message}))}}})();

// Source block 2
// Persist real local preferences whenever this app is served by server.js.
    (()=>{let hydrated=false;const language=document.querySelector('#language'),currency=document.querySelector('#currency');const selectedCurrency=()=>currency.value.match(/CHF|EUR|USD|CNY/)?.[0]||'CHF';const applyCurrency=code=>{const choice=[...currency.options].find(option=>option.value===code||option.textContent.includes(code));if(choice)currency.value=choice.value;document.documentElement.dataset.currency=code;window.dispatchEvent(new CustomEvent('currencychange',{detail:{currency:code}}));};const save=async()=>{if(!hydrated)return;try{await OffWeGoState.patch(current=>({preferences:{...(current.preferences||{}),language:language.value,currency:selectedCurrency()}}));note('设置已保存到本机。')}catch{note('请使用本地应用地址打开，设置才会保存。')}};OffWeGoState.ready.then(()=>{const localState=OffWeGoState.get().state;hydrated=true;let stored=null;try{stored=localStorage.getItem('offwego:language')}catch{}const savedLanguage=(stored==='en'||stored==='zh')?stored:(localState.preferences.language||'zh');if(window.OffWeGoI18n)window.OffWeGoI18n.setLanguage(savedLanguage,{persist:false});else language.value=savedLanguage;applyCurrency(localState.preferences.currency||'CHF');const hint=document.querySelector('#memoryHint');if(hint)hint.textContent=t('copy.loaded_your_saved_departure_family_and_preferenc')}).catch(()=>applyCurrency(selectedCurrency()));language.addEventListener('change',save);currency.addEventListener('change',()=>{applyCurrency(selectedCurrency());save();})})();

// Source block 3
window.addEventListener('load',()=>setTimeout(async()=>{
      document.querySelector('#profile')?.remove();document.querySelector('#profileMenu')?.remove();
      const originRow=document.querySelector('#originRow')||[...document.querySelectorAll('.setting-row')].find(row=>row.querySelector('b')?.textContent.includes(t('settings.origin'))||row.querySelector('b')?.textContent.includes('默认出发地'));
      if(originRow){if(!originRow.querySelector('#originValue'))originRow.querySelector('span').id='originValue';if(!originRow.querySelector('#changeOrigin'))originRow.querySelector('button').id='changeOrigin';}
      let origin='Kilchberg, Zürich';try{await OffWeGoState.ready;origin=OffWeGoState.get().state.preferences?.origin||origin;}catch{return;}
      document.querySelector('#originValue').textContent=origin;
      document.querySelector('#originValue')?.setAttribute('aria-live','polite');
    },300));

// Source block 4
window.addEventListener('load',()=>{const question=document.querySelector('#question');if(!question.querySelector('#travellerNext'))question.innerHTML='<div class="topline"><span class="mark"></span><span class="grow"></span><button class="back" data-home>返回首页</button></div><div class="traveller-step"><h1>这次谁一起出发？</h1><p>人数会影响交通、房型和活动建议。</p><div class="traveller-list"><div class="traveller-row"><span><b>成年人</b><small>18 岁及以上</small></span><span class="stepper"><button data-key="adults" data-direction="-" aria-label="减少成年人">−</button><output id="adultsCount">2</output><button data-key="adults" data-direction="+" aria-label="增加成年人">+</button></span></div><div class="traveller-row"><span><b>孩子</b><small>之后可补充出生年月，自动计算年龄</small></span><span class="stepper"><button data-key="children" data-direction="-" aria-label="减少孩子">−</button><output id="childrenCount">0</output><button data-key="children" data-direction="+" aria-label="增加孩子">+</button></span></div><div class="traveller-row"><span><b>宠物</b><small>会纳入交通与住宿筛选</small></span><span class="stepper"><button data-key="pets" data-direction="-" aria-label="减少宠物">−</button><output id="petsCount">0</output><button data-key="pets" data-direction="+" aria-label="增加宠物">+</button></span></div></div><div class="traveller-continue"><button class="primary" id="travellerNext">继续</button></div></div>';let travellers={adults:2,children:0,pets:0};OffWeGoState.ready.then(()=>{const state=OffWeGoState.get().state;travellers={...travellers,...(state.travellers||{})};render()}).catch(render);function render(){for(const key of Object.keys(travellers)){document.querySelector('#'+key+'Count').textContent=travellers[key];document.querySelector('[data-key="'+key+'"][data-direction="-"]').disabled=travellers[key]===0}}document.querySelectorAll('.stepper button').forEach(button=>button.onclick=()=>{const key=button.dataset.key;travellers[key]=Math.max(0,travellers[key]+(button.dataset.direction==='+'?1:-1));render()});document.querySelector('#travellerNext').onclick=async()=>{try{await OffWeGoState.patch({travellers})}catch{}show('dates')};document.querySelector('[data-home]').onclick=goHome});

// Source block 5
window.addEventListener('load',()=>{const tabs=[...document.querySelectorAll('.tabs button')],grid=document.querySelector('.plan-grid');if(!grid)return;grid.classList.add('tab-panel','active');const wrap=document.createElement('div');wrap.innerHTML='<div class="tab-panel" id="costPanel"><div class="cost-list"><div class="cost-row"><span><b>交通</b><small>航班与公共交通</small></span><b>待查询</b></div><div class="cost-row"><span><b>住宿</b><small>酒店与公寓</small></span><b>待查询</b></div><div class="cost-row"><span><b>活动与餐饮</b><small>按家庭人数估算</small></span><b>待查询</b></div><div class="tab-empty">连接旅行数据源后，这里会显示带查询时间与来源的实时费用；不会再显示假价格。</div></div></div><div class="tab-panel" id="bookingPanel"><div class="booking-list"><div class="booking-row"><span><b>谷歌地图</b><small>查询机场和目的地路线</small></span><a class="outline" target="_blank" href="https://www.google.com/maps/search/?api=1&query=Tenerife">谷歌地图</a></div><div class="booking-row"><span><b>AI 住宿研究</b><small>Gemini 联网检索；中国酒店由 DeepSeek 中文整理</small></span><button class="outline" id="hotelResearchInfo">查看说明</button></div><div class="booking-row"><span><b>预订比较</b><small>航班与住宿数据源接入后显示</small></span><button class="outline" id="bookingSources">管理数据源</button></div></div></div>';grid.after(wrap);const panels=[grid,...wrap.querySelectorAll('.tab-panel')];tabs.forEach((tab,index)=>tab.onclick=()=>{tabs.forEach((item,i)=>{item.style.color=i===index?'var(--blue)':'var(--muted)';item.style.borderBottom=i===index?'3px solid var(--blue)':'0'});panels.forEach((panel,i)=>panel.classList.toggle('active',i===index))});document.querySelector('#bookingSources').onclick=()=>{openSettings();note('在设置中管理地图、公共交通和航班数据源。')};document.querySelector('#hotelResearchInfo').onclick=()=>note('住宿研究提供公开资料线索，不代表实时房价或库存。');});

// Source block 6
window.addEventListener('load',()=>setTimeout(()=>{const groups=[...document.querySelectorAll('#settings .setting-group')];const target=document.querySelector('#servicesGroup')||groups.find(g=>/智能服务连接|Connected services/.test(g.querySelector('h2')?.textContent||''));if(document.querySelector('#googleMaps')){document.querySelector('#googleMaps').onclick=()=>{activeProvider='GoogleMaps';document.querySelector('#apiTitle').textContent=t('connect.title',{name:'Google Maps'});document.querySelector('#apiHelp').textContent=t('copy.enter_a_google_maps_key_with_places_api_and_rout');document.querySelector('#apiKey').value='';document.querySelector('#apiConfig').classList.add('show')};return}if(!target)return;const google=document.createElement('div');google.className='setting-group';google.innerHTML='<h2>'+t('copy.google_places_routes')+'</h2><p>'+t('copy.place_autocomplete_photos_walking_and_driving_ro')+'</p><div class="setting-row"><b>Google Maps<small>'+t('copy.places_api_and_routes_api_the_key_is_stored_in_t')+'</small></b><span class="api-status" data-provider="GoogleMaps">'+t('common.not_connected')+'</span><button class="text-action" type="button" id="googleMaps">'+t('common.connect')+'</button></div>';target.after(google);document.querySelector('#googleMaps').onclick=()=>{activeProvider='GoogleMaps';document.querySelector('#apiTitle').textContent=t('connect.title',{name:'Google Maps'});document.querySelector('#apiHelp').textContent=t('copy.enter_a_google_maps_key_with_places_api_and_rout');document.querySelector('#apiKey').value='';document.querySelector('#apiConfig').classList.add('show')};},450));

// Source block 7
/* Traveller next stays on the dates step; see the step-two binding. */

// Source block 8
// Source block 10
(()=>{const updateGreeting=()=>{const el=document.querySelector('#greeting');if(!el)return;const hour=new Date().getHours();const key=hour<12?'home.greeting_morning':hour<18?'home.greeting_afternoon':'home.greeting_evening';el.textContent=t(key);};const start=()=>{updateGreeting();setInterval(updateGreeting,60000);};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();window.addEventListener('offwego:language',updateGreeting);})();

// Source block 12
window.addEventListener('load',async()=>{const resume=document.querySelector('#resumePlan'),prefs=document.querySelector('#openFamilyPrefs');if(!resume||!prefs)return;let state;try{await OffWeGoState.ready;state=OffWeGoState.get().state;}catch{}const paint=()=>{try{state=OffWeGoState.get().state}catch{}const trip=state?.trips?.at(-1);const title=resume.querySelector('b'),detail=resume.querySelector('small');const locale=window.OffWeGoI18n?.locale?.()||'zh-CN';if(trip){const when=trip.updatedAt&&!Number.isNaN(new Date(trip.updatedAt).getTime())?new Date(trip.updatedAt).toLocaleString(locale,{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'}):t('home.just_saved');title.textContent=t('home.continue_last');detail.textContent=t(trip.title)+' · '+when;resume.onclick=()=>{show('question');note(t('toast.restored',{title:t(trip.title)}))};}else{title.textContent=t('home.start_new');detail.textContent=t('home.no_trip');resume.onclick=()=>show('question');}const familyCount=state?.family?.length||0;prefs.querySelector('b').textContent=t('home.family_prefs');prefs.querySelector('small').textContent=familyCount?t('format.members_saved',{n:familyCount}):t('home.family_prefs_hint');};paint();prefs.onclick=()=>(typeof openSettings==='function'?openSettings():document.querySelector('#settings')?.classList.add('show'));window.addEventListener('offwego:language',paint);});

// Source block 13
window.addEventListener('load',()=>setTimeout(async()=>{
    const currency=document.querySelector('#currency');
    if(currency&&!currency.querySelector('option[value="CNY"]')){
      const option=document.createElement('option');
      option.value='CNY';
      option.textContent=t('copy.chinese_yuan_cny');
      currency.append(option);
    }
    document.querySelector('#testApi')?.remove();
    const escapeHtml=window.OffWeGoUi?.escapeHtml||(value=>String(value??'').replace(/[&<>'"]/g,character=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character])));
    const familyType=type=>window.OffWeGoI18n?.format?.familyType?.(type)||t(type==='孩子'?'family.type_child':'family.type_adult');
    const modal=document.querySelector('#familyModal');
    const list=document.querySelector('#familyList');
    const addHost=document.querySelector('.family-add');
    if(!modal||!list||!addHost) return;
    let members=[];
    try{await OffWeGoState.ready;members=OffWeGoState.get().state.family||[];}catch{}
    const closeEditor=()=>document.querySelector('#familyEditor')?.remove();
    const render=()=>{
      closeEditor();
      if(!members.length){
        list.innerHTML='<p class="fine-print">'+escapeHtml(t('copy.no_members_yet_add_travelling_companions_first'))+'</p>';
        return;
      }
      list.innerHTML=members.map((member,index)=>{
        const name=escapeHtml(member.name||t('copy.unnamed_member'));
        const extra=member.birthMonth?' · '+escapeHtml(member.birthMonth):'';
        return '<div class="family-member"><span><b>'+escapeHtml(familyType(member.type))+'</b><small>'+name+extra+'</small></span><button type="button" data-remove="'+index+'">'+escapeHtml(t('common.remove'))+'</button></div>';
      }).join('');
      list.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{members.splice(Number(button.dataset.remove),1);render();});
    };
    const updateSummary=()=>{
      const adults=members.filter(member=>member.type==='成年人').length;
      const children=members.filter(member=>member.type==='孩子').length;
      let pets=0;
      try{pets=Number(OffWeGoState.get().state.pets||0);}catch{}
      const target=document.querySelector('#familySummary');
      if(!target) return;
      const hint=target.querySelector('small');
      const hintHtml=hint?hint.outerHTML:'<small>'+escapeHtml(t('settings.child_age_hint'))+'</small>';
      target.innerHTML=escapeHtml(t(pets?'family.count_with_pets':'family.count',{adults,children,pets}))+hintHtml;
    };
    const showEditor=kind=>{
      closeEditor();
      const isChild=kind==='孩子';
      const editor=document.createElement('div');
      editor.id='familyEditor';
      editor.className='service-inline family-editor';
      editor.innerHTML='<label for="familyMemberName">'+escapeHtml(t(isChild?'copy.child_name_optional':'copy.adult_name_optional'))+'</label><input id="familyMemberName" class="field" type="text" autocomplete="name">'+(isChild?'<label for="familyMemberBirth">'+escapeHtml(t('copy.birth_month_e_g_2019_06_can_add_later'))+'</label><input id="familyMemberBirth" class="field" type="month">':'')+'<div class="actions"><button type="button" class="outline family-editor-cancel">'+escapeHtml(t('common.cancel'))+'</button><button type="button" class="primary family-editor-save">'+escapeHtml(t(isChild?'copy.add_child':'copy.add_adult'))+'</button></div>';
      addHost.after(editor);
      const nameInput=editor.querySelector('#familyMemberName');
      const monthInput=editor.querySelector('#familyMemberBirth');
      const commit=()=>{
        const member={type:kind,name:nameInput.value.trim()};
        if(isChild) member.birthMonth=monthInput?.value||'';
        members.push(member);
        render();
      };
      editor.querySelector('.family-editor-cancel').onclick=closeEditor;
      editor.querySelector('.family-editor-save').onclick=commit;
      editor.addEventListener('keydown',event=>{
        if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeEditor();}
        if(event.key==='Enter'){event.preventDefault();commit();}
      });
      nameInput.focus();
    };
    document.querySelector('#manageFamily')?.addEventListener('click',()=>{render();modal.classList.add('show');});
    document.querySelector('#closeFamily')?.addEventListener('click',()=>{closeEditor();modal.classList.remove('show');});
    document.querySelector('#addAdult')?.addEventListener('click',()=>showEditor('成年人'));
    document.querySelector('#addChild')?.addEventListener('click',()=>showEditor('孩子'));
    const addAdult=document.querySelector('#addAdult');
    if(addAdult) addAdult.dataset.familyReady='true';
    document.querySelector('#saveFamily')?.addEventListener('click',async()=>{
      try{
        await OffWeGoState.patch({family:members});
        updateSummary();
        closeEditor();
        modal.classList.remove('show');
        note(t('copy.family_members_saved_on_this_device'));
      }catch{note(t('copy.open_the_local_app_address_then_save'));}
    });
    window.addEventListener('offwego:language',()=>{if(modal.classList.contains('show')) render();});
  },1600));

// Source block 15
// Apply visible preferences at the moment of selection; closing the panel is never required.
  (() => {
    const setTitle = () => {
      const title = document.querySelector('#settings .modal-head h1');
      if (title) title.textContent = t('settings.title');
    };
    setTitle();
    window.addEventListener('load', () => {
      setTitle();
      const currency = document.querySelector('#currency');
      if (!currency) return;
      currency.addEventListener('change', async () => {
        document.documentElement.dataset.currency = currency.value.match(/CHF|EUR|USD|CNY/)?.[0] || 'CHF';
        window.dispatchEvent(new CustomEvent('currencychange', {detail:{currency:document.documentElement.dataset.currency}}));
        try {
          await OffWeGoState.patch(current => ({
            preferences: { ...(current.preferences || {}), currency: document.documentElement.dataset.currency }
          }));
        } catch {}
      });
    });
  })();

// Source block 16
/* A detail page can return directly to the three destination recommendations. */
  window.addEventListener('load',()=>setTimeout(()=>{
    if(new URLSearchParams(location.search).get('view')!=='results')return;
    (typeof window.show==='function'?window.show:show)('results');
    window.loadLiveRecommendations?.();
  },1600));

// Source block 18
window.addEventListener('load', () => setTimeout(async () => {
    const modal = document.querySelector('#familyModal');
    if (!modal) return;
    if (document.querySelector('#familyList')) return;
    const panel = modal.querySelector('.settings');
    panel.innerHTML = '<div class="modal-head"><h1 id="familyTitle">'+t('settings.family')+'</h1><button class="close" id="closeFamily" type="button" aria-label="'+t('common.close')+'"><i class="ri-close-line" aria-hidden="true"></i></button></div><p style="color:var(--muted)">'+t('family.intro')+'</p><div class="family-counter"><div class="family-counter-row"><span><b>'+t('copy.adults')+'</b><small>'+t('family.adults_hint')+'</small></span><div class="counter-controls"><button id="adultMinus" aria-label="'+t('family.decrease_adults')+'">−</button><span id="adultCount">2</span><button id="adultPlus" aria-label="'+t('family.increase_adults')+'">＋</button></div></div><div class="family-counter-row"><span><b>'+t('common.children')+'</b><small>'+t('family.children_hint')+'</small></span><div class="counter-controls"><button id="childMinus" aria-label="'+t('family.decrease_children')+'">−</button><span id="childCount">0</span><button id="childPlus" aria-label="'+t('family.increase_children')+'">＋</button></div></div><div class="family-counter-row"><span><b>'+t('common.pets')+'</b><small>'+t('family.pets_hint')+'</small></span><div class="counter-controls"><button id="petMinus" aria-label="'+t('family.decrease_pets')+'">−</button><span id="petCount">0</span><button id="petPlus" aria-label="'+t('family.increase_pets')+'">＋</button></div></div></div><div class="actions"><button class="primary" id="saveFamily">'+t('common.save')+'</button></div>';
    let state = {preferences:{language:'zh',currency:'CHF'},family:[],pets:0,trips:[]};
    try { await OffWeGoState.ready; state = OffWeGoState.get().state; } catch {}
    let adults = Math.max(1, (state.family || []).filter(m => m.type === '成年人').length || 2);
    let children = (state.family || []).filter(m => m.type === '孩子').length;
    let pets = Number(state.pets || 0);
    const render = () => {
      document.querySelector('#adultCount').textContent = adults;
      document.querySelector('#childCount').textContent = children;
      document.querySelector('#petCount').textContent = pets;
      document.querySelector('#adultMinus').disabled = adults <= 1;
      document.querySelector('#childMinus').disabled = children <= 0;
      document.querySelector('#petMinus').disabled = pets <= 0;
    };
    const change = (field, delta) => { if(field === 'adults') adults = Math.max(1, adults + delta); if(field === 'children') children = Math.max(0, children + delta); if(field === 'pets') pets = Math.max(0, pets + delta); render(); };
    document.querySelector('#adultMinus').onclick = () => change('adults', -1);
    document.querySelector('#adultPlus').onclick = () => change('adults', 1);
    document.querySelector('#childMinus').onclick = () => change('children', -1);
    document.querySelector('#childPlus').onclick = () => change('children', 1);
    document.querySelector('#petMinus').onclick = () => change('pets', -1);
    document.querySelector('#petPlus').onclick = () => change('pets', 1);
    document.querySelector('#closeFamily').onclick = () => modal.classList.remove('show');
    document.querySelector('#saveFamily').onclick = async () => {
      try {
        const previous = OffWeGoState.get().state.family || [];
        const keep = (type, count) => previous.filter(m => m.type === type).slice(0, count);
        const fill = (type, list, count) => [...list, ...Array.from({length: Math.max(0, count - list.length)}, () => ({type}))];
        await OffWeGoState.patch({
          family: [...fill('成年人', keep('成年人', adults), adults), ...fill('孩子', keep('孩子', children), children)],
          pets
        });
      } catch {}
      const row = document.querySelector('#familySummary') || [...document.querySelectorAll('#settings .setting-row')].find(x => x.querySelector('b')?.textContent.includes('位成人') || x.querySelector('b')?.textContent.includes('adults'));
      if(row) {
        const target = row.id === 'familySummary' ? row : row.querySelector('b');
        if (target) target.innerHTML = t(pets ? 'family.count_with_pets' : 'family.count', {adults, children, pets}) + '<small>' + t('settings.child_age_hint') + '</small>';
      }
      modal.classList.remove('show'); note(t('copy.family_size_saved'));
    };
    render();
  }, 1850));

// Source block 19
// Every provider dialog uses the × in its header to close; there is no redundant Cancel action.
  window.addEventListener('load', () => {
    document.querySelector('#cancelApi')?.remove();
    const actions = document.querySelector('#apiConfig .actions');
    if (actions) actions.style.justifyContent = 'flex-end';
  });

// Source block 20
window.addEventListener('load', () => {
    const save = document.querySelector('#saveApi');
    if (!save) return;
    save.onclick = async () => {
      const provider = document.querySelector('#apiTitle').textContent.replace('连接 ', '').trim();
      const key = document.querySelector('#apiKey').value.trim();
      let errorLine = document.querySelector('#apiConnectionError');
      if (!errorLine) {
        errorLine = document.createElement('p');
        errorLine.id = 'apiConnectionError';
        errorLine.style.cssText = 'display:none;margin:10px 0 0;color:#ba2d2d;font-size:14px';
        document.querySelector('#apiKey').after(errorLine);
      }
      errorLine.style.display = 'none';
      if (!key) return note('请粘贴 API 密钥。');
      save.disabled = true;
      save.textContent = t('common.checking');
      try {
        const response = await fetch('/api/keys/' + provider, {
          method:'PUT',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({key})
        });
        const raw = await response.text();
        let data = {};
        try { data = raw ? JSON.parse(raw) : {}; }
        catch { throw new Error('本机服务返回了无法读取的响应，请稍后重试。'); }
        if (!response.ok) throw new Error(data.error || '服务没有返回可用结果。');
        const status = document.querySelector('.api-status[data-provider="' + provider.replace(' ', '') + '"]');
        if (status) { status.textContent = t('common.connected'); status.dataset.connected = 'true'; }
        document.querySelector('#apiConfig').classList.remove('show');
        note(t('connect.verified_keychain', { name: provider }));
      } catch (error) {
        errorLine.textContent = t('connect.failed', { message: error.message });
        errorLine.style.display = 'block';
        note(t('connect.failed', { message: error.message }));
      } finally {
        save.disabled = false;
        save.textContent = t('common.test_and_save');
      }
    };
  });

// Source block 21
// Bind after every earlier asynchronous initializer has completed.
  window.addEventListener('load', () => {
    const bindRealApiSave = () => {
      const save = document.querySelector('#saveApi');
      if (!save || save.dataset.realSaveBound) return false;
      save.dataset.realSaveBound = 'true';
      save.addEventListener('click', async event => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const provider = document.querySelector('#apiTitle').textContent.replace('连接 ', '').trim();
        const key = document.querySelector('#apiKey').value.trim();
        let errorLine = document.querySelector('#apiConnectionError');
        if (!errorLine) {
          errorLine = document.createElement('p');
          errorLine.id = 'apiConnectionError';
          errorLine.style.cssText = 'display:none;margin:10px 0 0;color:#ba2d2d;font-size:14px';
          document.querySelector('#apiKey').after(errorLine);
        }
        errorLine.style.display = 'none';
        if (!key) { errorLine.textContent = t('toast.paste_key'); errorLine.style.display = 'block'; return; }
        save.disabled = true; save.textContent = t('common.checking');
        try {
          const response = await fetch('/api/keys/' + provider, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});
          const raw = await response.text();
          let data = {};
          try { data = raw ? JSON.parse(raw) : {}; }
          catch { throw new Error('本机服务返回了无法读取的响应，请稍后重试。'); }
          if (!response.ok) throw new Error(data.error || '服务没有返回可用结果。');
          const status = document.querySelector('.api-status[data-provider="' + provider.replace(' ', '') + '"]');
          if (status) { status.textContent = t('common.connected'); status.dataset.connected = 'true'; }
          document.querySelector('#apiConfig').classList.remove('show');
          note(t('connect.verified_keychain', { name: provider }));
        } catch (error) {
          errorLine.textContent = t('connect.failed', { message: error.message });
          errorLine.style.display = 'block';
        } finally {
          save.disabled = false; save.textContent = t('common.test_and_save');
        }
      }, true);
      return true;
    };
    setTimeout(bindRealApiSave, 2500);

    const bindChildAges = () => {
      const counter = document.querySelector('#familyModal .family-counter');
      if (!counter || counter.dataset.childAgesBound) return false;
      counter.dataset.childAgesBound = 'true';
      const details = document.createElement('div');
      details.className = 'child-age-details';
      details.innerHTML = '<button type="button" class="child-age-toggle" id="toggleChildAges">填写孩子年龄（可选）⌄</button><div class="child-age-panel" id="childAgePanel"></div>';
      counter.append(details);
      const panel = details.querySelector('#childAgePanel');
      const toggle = details.querySelector('#toggleChildAges');
      const render = () => {
        const count = Number(document.querySelector('#childCount')?.textContent || 0);
        details.hidden = count === 0;
        if (!count) return;
        const oldValues = [...panel.querySelectorAll('input')].map(input => input.value);
        panel.innerHTML = Array.from({length:count}, (_, index) => '<label class="child-age-field"><span><b>孩子 '+(index+1)+'</b><small>出生年月会自动换算为年龄</small></span><input type="month" data-child-birth="'+index+'" value="'+(oldValues[index]||'')+'"></label>').join('');
      };
      toggle.onclick = () => {
        const open = !panel.classList.contains('show');
        panel.classList.toggle('show', open);
        toggle.textContent = open ? '收起孩子年龄 ⌃' : '填写孩子年龄（可选）⌄';
        if (open) render();
      };
      document.querySelector('#childMinus')?.addEventListener('click', () => setTimeout(render));
      document.querySelector('#childPlus')?.addEventListener('click', () => setTimeout(render));
      render();
      return true;
    };
    let attempts = 0;
    const waitForFamily = setInterval(() => { if (bindChildAges() || ++attempts > 30) clearInterval(waitForFamily); }, 250);
  });

// Source block 22
window.addEventListener('load', () => {
    let attempts = 0;
    const positionChildAges = () => {
      const counter = document.querySelector('#familyModal .family-counter');
      const details = counter?.querySelector('.child-age-details');
      const childRow = document.querySelector('#childCount')?.closest('.family-counter-row');
      if (!counter || !details || !childRow) return false;
      if (details.previousElementSibling !== childRow) childRow.after(details);
      const toggle = details.querySelector('.child-age-toggle');
      const panel = details.querySelector('.child-age-panel');
      const label = open => {
        toggle.innerHTML = '<span>' + (open ? '收起孩子年龄' : '填写孩子年龄（可选）') + '</span><span aria-hidden="true">' + (open ? '⌃' : '⌄') + '</span>';
        toggle.setAttribute('aria-expanded', String(open));
      };
      const updateDates = () => {
        panel.querySelectorAll('input[data-child-birth]').forEach(input => {
          input.type = 'date';
          input.lang = 'en-GB';
          input.title = '选择出生日期（日／月／年）';
          input.setAttribute('aria-label', '选择孩子出生日期，日月年顺序');
          if (input.dataset.calendarBound) return;
          input.dataset.calendarBound = 'true';
          const openCalendar = () => { try { input.showPicker?.(); } catch {} };
          input.addEventListener('pointerdown', openCalendar);
          input.addEventListener('click', openCalendar);
        });
      };
      const existing = toggle.onclick;
      toggle.onclick = () => {
        const open = !panel.classList.contains('show');
        panel.classList.toggle('show', open);
        label(open);
        if (open) updateDates();
      };
      label(panel.classList.contains('show'));
      updateDates();
      return true;
    };
    const timer = setInterval(() => {
      if (positionChildAges() || ++attempts > 35) {
        clearInterval(timer);
        document.querySelector('#childMinus')?.addEventListener('click', () => setTimeout(positionChildAges));
        document.querySelector('#childPlus')?.addEventListener('click', () => setTimeout(positionChildAges));
      }
    }, 250);
  });

// Source block 23
window.addEventListener('load', () => {
    const removeDuplicateChildAgePanels = () => {
      const childRow = document.querySelector('#childCount')?.closest('.family-counter-row');
      if (!childRow) return;
      const panels = [...document.querySelectorAll('#familyModal .child-age-details')];
      const keep = panels.find(panel => panel.previousElementSibling === childRow) || panels[0];
      panels.forEach(panel => { if (panel !== keep) panel.remove(); });
    };
    setTimeout(removeDuplicateChildAgePanels, 2800);
    setTimeout(removeDuplicateChildAgePanels, 4200);
  });

// Source block 24
window.addEventListener('load', () => {
    const enableBirthDatePicker = () => {
      document.querySelectorAll('#familyModal input[data-child-birth]').forEach(input => {
        if (input.dataset.datePickerBound) return;
        input.dataset.datePickerBound = 'true';
        input.type = 'date';
        input.lang = 'en-GB';
        input.title = '选择出生日期（日／月／年）';
        input.setAttribute('aria-label', '选择孩子出生日期，日月年顺序');
        input.addEventListener('click', () => input.showPicker?.());
        const label = input.closest('.child-age-field')?.querySelector('small');
        if (label) label.textContent = '选择出生日期（日／月／年），自动换算年龄';
      });
    };
    setTimeout(enableBirthDatePicker, 3200);
    setTimeout(enableBirthDatePicker, 4600);
  });

// Source block 25
window.addEventListener('load', () => setTimeout(() => {
    const editButton = document.querySelector('#changeOrigin');
    const originValue = document.querySelector('#originValue');
    if (!editButton || !originValue || editButton.dataset.placesBound) return;
    editButton.dataset.placesBound = 'true';
    editButton.addEventListener('click', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      if (editButton.dataset.editing) {
        const input = document.querySelector('#originSearch');
        const value = input?.value.trim();
        if (!value) return;
        try {
          await OffWeGoState.patch(current=>({preferences:{...(current.preferences||{}),origin:value}}));
          originValue.textContent = value; originValue.style.display = '';
          input.closest('.origin-editor').remove(); editButton.textContent = '修改'; delete editButton.dataset.editing;
          note('默认出发地已更新。');
        } catch { note('请先连接 Google Maps 后再保存地点。'); }
        return;
      }
      originValue.style.display = 'none';
      const editor = document.createElement('div');
      editor.className = 'origin-editor';
      const escapeHtml=value=>String(value || '').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
      editor.innerHTML = '<input id="originSearch" autocomplete="off" value="'+escapeHtml(originValue.textContent)+'" aria-label="搜索默认出发地"><ul class="origin-suggestions" id="originSuggestions"></ul><div class="origin-help" id="originHelp">输入地点名称以搜索 Google Maps</div>';
      originValue.after(editor);
      editButton.textContent = '完成'; editButton.dataset.editing = 'true';
      const input = editor.querySelector('#originSearch'), list = editor.querySelector('#originSuggestions'), help = editor.querySelector('#originHelp');
      let requestId = 0;
      const search = async () => {
        const id = ++requestId, query = input.value.trim();
        if (query.length < 2) { list.innerHTML = ''; return; }
        try {
          const response = await fetch('/api/places/autocomplete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({input:query})});
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Google Maps 暂不可用');
          if (id !== requestId) return;
          list.innerHTML = (data.suggestions || []).map(item => '<li><button type="button" data-place="'+escapeHtml(item.text)+'">'+escapeHtml(item.text)+'</button></li>').join('');
          list.querySelectorAll('[data-place]').forEach(button => button.onclick = () => { input.value = button.dataset.place; list.innerHTML = ''; help.textContent = '已选地点；点击“完成”保存。'; });
        } catch (error) { help.textContent = 'Google Maps 尚未连接：' + error.message; list.innerHTML = ''; }
      };
      input.addEventListener('input', () => { clearTimeout(input._searchTimer); input._searchTimer = setTimeout(search, 250); });
      input.focus(); input.select(); search();
    }, true);
  }, 0));

// Source block 27
window.addEventListener('load', () => {
    let attempts = 0;
    const bindTravellerBirthDates = () => {
      const list = document.querySelector('#question .traveller-list');
      const childRow = document.querySelector('#question #childrenCount')?.closest('.traveller-row');
      const next = document.querySelector('#question #travellerNext');
      if (!list || !childRow || !next) return false;
      if (list.dataset.birthDatesBound) return true;
      list.dataset.birthDatesBound = 'true';
      const details = document.createElement('div');
      details.className = 'traveller-age-details';
      details.innerHTML = '<button type="button" class="traveller-age-toggle" aria-expanded="false">填写孩子出生日期（可选）</button><div class="traveller-age-panel"></div>';
      childRow.after(details);
      const toggle = details.querySelector('.traveller-age-toggle'), panel = details.querySelector('.traveller-age-panel');
      const values = () => [...panel.querySelectorAll('input')].map(input => input.value);
      const render = () => {
        const count = Number(document.querySelector('#question #childrenCount')?.textContent || 0);
        details.hidden = count === 0;
        if (!count) { panel.classList.remove('show'); toggle.setAttribute('aria-expanded','false'); return; }
        const previous = values();
        panel.innerHTML = Array.from({length:count}, (_, index) => '<label class="traveller-age-field"><span><b>孩子 '+(index+1)+'</b><small>用于推荐交通、房型和活动</small></span><input type="date" lang="en-GB" data-step-birth="'+index+'" aria-label="孩子 '+(index+1)+' 的出生日期"></label>').join('');
        panel.querySelectorAll('input').forEach((input,index) => { input.value = previous[index] || ''; input.addEventListener('click', () => input.showPicker?.()); });
      };
      toggle.onclick = () => { const open = !panel.classList.contains('show'); panel.classList.toggle('show',open); toggle.setAttribute('aria-expanded',String(open)); if(open) render(); };
      document.querySelector('#question [data-key="children"][data-direction="-"]')?.addEventListener('click', () => setTimeout(render));
      document.querySelector('#question [data-key="children"][data-direction="+"]')?.addEventListener('click', () => setTimeout(render));
      next.addEventListener('click', async () => {
        const dates = [...panel.querySelectorAll('[data-step-birth]')].map(input => input.value).filter(Boolean);
        if (!dates.length) return;
        try {
          await OffWeGoState.patch(current=>({currentTrip:{...(current.currentTrip || {}), childBirthDates:dates}}));
        } catch {}
      }, true);
      render();
      return true;
    };
    const timer = setInterval(() => { if (bindTravellerBirthDates() || ++attempts > 30) clearInterval(timer); }, 250);
  });

// Source block 28
/* This must be registered during parsing so it wins over all legacy handlers. */
  (() => {
    const save = document.querySelector('#saveApi');
    if (!save) return;
    save.addEventListener('click', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      const providerLabel = document.querySelector('#apiTitle').textContent.replace('连接 ', '').trim();
      const provider = providerLabel.replace(' ', '');
      const key = document.querySelector('#apiKey').value.trim();
      let error = document.querySelector('#apiConnectionError');
      if (!error) { error = document.createElement('p'); error.id='apiConnectionError'; error.style.cssText='margin:10px 0 0;color:#ba2d2d;font-size:14px'; document.querySelector('#apiKey').after(error); }
      error.hidden = true;
      if (!key) { error.textContent='请粘贴 API 密钥。'; error.hidden=false; return; }
      save.disabled=true; save.textContent='正在验证…';
      try {
        const response = await fetch('/api/keys/' + encodeURIComponent(providerLabel), {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});
        const raw = await response.text(); let data={}; try { data=raw?JSON.parse(raw):{}; } catch { throw new Error('本机服务返回了无法读取的响应。'); }
        if (!response.ok) throw new Error(data.error || '服务没有返回可用结果。');
        const status=document.querySelector('.api-status[data-provider="'+provider+'"]'); if(status) status.textContent='已连接';
        document.querySelector('#apiConfig').classList.remove('show'); note(providerLabel+' 已验证并保存在本机钥匙串。');
      } catch (exception) { error.textContent='连接失败：'+exception.message; error.hidden=false; }
      finally { save.disabled=false; save.textContent='测试并保存'; }
    }, true);
  })();

// Source block 29
/* Step 1 always proceeds to Step 2; legacy result-page handlers cannot intercept it. */
  window.addEventListener('load', () => setTimeout(() => {
    const next = document.querySelector('#question #travellerNext');
    if (!next || next.dataset.stepTwoBound) return;
    next.dataset.stepTwoBound='true';
    next.addEventListener('click', async event => {
      event.preventDefault(); event.stopImmediatePropagation();
      const travellers={adults:Number(document.querySelector('#adultsCount')?.textContent||0),children:Number(document.querySelector('#childrenCount')?.textContent||0),pets:Number(document.querySelector('#petsCount')?.textContent||0)};
      try { await OffWeGoState.patch({travellers}); } catch {}
      show('dates');
    }, true);
  }, 1800));

// Source block 30
document.title = 'Off We Go';
  document.querySelectorAll('#settings .modal-head h1').forEach(title => { title.textContent = 'Off We Go 工作台'; });

// Source block 31
window.addEventListener('load', () => setTimeout(async () => {
    const settings = document.querySelector('#settings .settings');
    if (!settings || document.querySelector('#duffelTravelData')) return;
    const group = document.createElement('div');
    group.className = 'setting-group'; group.id = 'duffelTravelData';
    group.innerHTML = '<h2>'+t('copy.travel_data')+'</h2><div class="setting-row"><b>'+t('copy.duffel_flight_quotes')+'<small>'+t('copy.use_a_duffel_access_token_for_flight_quotes_it_s')+'</small></b><span id="duffelStatus">'+t('common.not_connected')+'</span><button class="text-action" id="connectDuffel">'+t('common.connect')+'</button></div><div class="duffel-editor" id="duffelEditor" hidden><label>Access Token<input id="duffelToken" type="password" autocomplete="new-password" placeholder="duffel_test_… or duffel_live_…"></label><p id="duffelError" hidden></p></div>';
    settings.append(group);
    try { const data = await fetch('/api/bootstrap').then(r => r.json()); if (data.keys.Duffel) { document.querySelector('#duffelStatus').textContent='已连接'; document.querySelector('#connectDuffel').textContent='更新'; } } catch {}
    const button = document.querySelector('#connectDuffel'), editor = document.querySelector('#duffelEditor'), input = document.querySelector('#duffelToken'), error = document.querySelector('#duffelError');
    button.addEventListener('click', async () => {
      if (editor.hidden) { editor.hidden=false; button.textContent='测试并保存'; input.focus(); return; }
      const token=input.value.trim(); error.hidden=true;
      if (!token.startsWith('duffel_')) { error.textContent='请粘贴以 duffel_ 开头的 Access Token。'; error.hidden=false; return; }
      button.disabled=true; button.textContent='正在验证…';
      try { const response=await fetch('/api/duffel',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})}); const raw=await response.text(); let data={}; try { data=raw?JSON.parse(raw):{}; } catch { throw new Error('本机服务返回了无法读取的响应。'); } if(!response.ok) throw new Error(data.error || '无法验证 Duffel Token。'); document.querySelector('#duffelStatus').textContent='已连接'; editor.hidden=true; input.value=''; button.textContent='更新'; note('Duffel 已连接，可以查询航班报价。'); } catch (exception) { error.textContent='连接失败：'+exception.message; error.hidden=false; button.textContent='测试并保存'; } finally { button.disabled=false; }
    });
  }, 4800));

// Source block 32
window.addEventListener('load', () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    const updateTimeLandscape = () => {
      const hour = new Date().getHours();
      const phase = hour >= 5 && hour < 10 ? 'morning' : hour < 17 ? 'day' : hour < 21 ? 'evening' : 'night';
      hero.classList.remove('time-morning','time-day','time-evening','time-night');
      hero.classList.add('time-' + phase);
    };
    updateTimeLandscape();
    setInterval(updateTimeLandscape, 60000);
  });

// Source block 33
window.addEventListener('load', () => {
    const keepTravellerChildDetailsVisible = () => {
      const list = document.querySelector('#question .traveller-list');
      const childRow = document.querySelector('#question #childrenCount')?.closest('.traveller-row');
      if (!list || !childRow) return;
      let details = list.querySelector('.traveller-age-details');
      if (!details) {
        details = document.createElement('div'); details.className='traveller-age-details';
        details.innerHTML='<button type="button" class="traveller-age-toggle" aria-expanded="false">填写孩子出生日期（可选）</button><div class="traveller-age-panel"></div>';
        childRow.after(details);
        const toggle=details.querySelector('.traveller-age-toggle'),panel=details.querySelector('.traveller-age-panel');
        toggle.onclick=()=>{const open=!panel.classList.contains('show');panel.classList.toggle('show',open);toggle.setAttribute('aria-expanded',String(open));};
      }
      if (details.previousElementSibling !== childRow) childRow.after(details);
      const count=Number(document.querySelector('#question #childrenCount')?.textContent || 0);
      details.hidden=count===0;
      if (!count) return;
      const panel=details.querySelector('.traveller-age-panel');
      const old=[...panel.querySelectorAll('input')].map(input=>input.value);
      if (panel.querySelectorAll('input').length !== count) {
        panel.innerHTML=Array.from({length:count},(_,index)=>'<label class="traveller-age-field"><span><b>孩子 '+(index+1)+'</b><small>可选；用于推荐儿童票、房型与活动</small></span><input type="date" lang="en-GB" data-step-birth="'+index+'" aria-label="孩子 '+(index+1)+' 的出生日期"></label>').join('');
        panel.querySelectorAll('input').forEach((input,index)=>{input.value=old[index]||'';const picker=()=>{try{input.showPicker?.()}catch{}};input.addEventListener('pointerdown',picker);input.addEventListener('click',picker);});
      }
    };
    keepTravellerChildDetailsVisible();
    const childCount=document.querySelector('#question #childrenCount');
    if(childCount)new MutationObserver(keepTravellerChildDetailsVisible).observe(childCount,{childList:true,characterData:true,subtree:true});
  });

// Source block 34
window.addEventListener('load', () => setTimeout(async () => {
    const services={
      DeepSeek:{title:'DeepSeek',help:'用于理解你的自然语言旅行想法、整理偏好，并生成可编辑的行程初稿。不会把密钥写进旅行方案。'},
      Gemini:{title:'Gemini',help:'用于研究目的地、补充行程灵感与信息核对；连接后可作为工作台的研究服务。不会将密钥导出。'},
      GoogleMaps:{title:'Google Maps',help:'用于搜索默认出发地、地点与机场，并在后续提供路线和交通时间参考。需要已启用 Places API 与 Routes API 的密钥。'}
    };
    const bootstrap=await fetch('/api/bootstrap').then(r=>r.json()).catch(()=>({keys:{}}));
    Object.entries(services).forEach(([provider,meta])=>{
      const button=provider==='GoogleMaps'?document.querySelector('#googleMaps'):document.querySelector('.add-api[data-provider="'+provider+'"]');
      if(!button || button.dataset.inlineServiceBound) return;
      button.dataset.inlineServiceBound='true';
      const row=button.closest('.setting-row'),status=row.querySelector('.api-status');
      if(status) status.textContent=bootstrap.keys?.[provider]?'已连接':'未连接';
      if(bootstrap.keys?.[provider]) button.textContent='更新';
      const editor=document.createElement('div'); editor.className='service-inline'; editor.hidden=true;
      editor.innerHTML='<label>'+meta.title+' API 密钥<input type="password" autocomplete="new-password" placeholder="粘贴 API 密钥"></label><div class="service-support"><b>连接后可做什么</b><br>'+meta.help+'<br><br><b>安全性</b>：密钥只存储在这台 Mac 的钥匙串中。</div><p class="service-error" hidden></p>';
      row.after(editor); const input=editor.querySelector('input'),error=editor.querySelector('.service-error');
      button.addEventListener('click',async event=>{
        event.preventDefault();event.stopImmediatePropagation();
        if(editor.hidden){editor.hidden=false;button.textContent='测试并保存';input.focus();return;}
        const key=input.value.trim();error.hidden=true;if(!key){error.textContent='请粘贴 API 密钥。';error.hidden=false;return;}
        button.disabled=true;button.textContent='正在验证…';
        try{const response=await fetch('/api/keys/'+provider,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});const raw=await response.text();let data={};try{data=raw?JSON.parse(raw):{}}catch{throw new Error('本机服务返回了无法读取的响应。')}if(!response.ok)throw new Error(data.error||'无法验证此密钥。');if(status)status.textContent='已连接';editor.hidden=true;input.value='';button.textContent='更新';note(meta.title+' 已连接。');}catch(exception){error.textContent='连接失败：'+exception.message;error.hidden=false;button.textContent='测试并保存';}finally{button.disabled=false;}
      },true);
    });
  },5600));

// Source block 35
window.addEventListener('load', () => {
    const addDismissControls = () => {
      document.querySelectorAll('.service-inline,.duffel-editor,.amadeus-inline').forEach(editor => {
        if (editor.dataset.dismissBound) return;
        editor.dataset.dismissBound='true';
        const dismiss=document.createElement('button'); dismiss.type='button'; dismiss.className='inline-dismiss'; dismiss.textContent='收起，不保存';
        editor.append(dismiss);
        dismiss.addEventListener('click', event => {
          event.preventDefault(); event.stopImmediatePropagation();
          editor.querySelectorAll('input').forEach(input=>input.value='');
          editor.hidden=true;
          const row=editor.previousElementSibling?.classList.contains('setting-row') ? editor.previousElementSibling : editor.parentElement?.querySelector('.setting-row');
          const action=row?.querySelector('.text-action');
          if(action){const status=row.querySelector('[id$="Status"],.api-status')?.textContent;action.textContent=status==='已连接'?'更新':'连接';}
        }, true);
      });
    };
    addDismissControls();
    const settingsRoot=document.querySelector('#settings .settings');
    if(settingsRoot)new MutationObserver(addDismissControls).observe(settingsRoot,{childList:true,subtree:true});
  });

// Source block 36
/* The original page list was captured before later wizard steps existed.
     Always resolve pages at the moment of navigation so Step 2 and Step 3 render. */
  window.show = function (id) {
    const homeEl = document.querySelector('#home');
    homeEl.style.display = 'none';
    homeEl.inert = true;
    document.querySelectorAll('.page').forEach(page => {
      const on = page.id === id;
      page.classList.toggle('show', on);
      page.inert = !on;
    });
    document.body.classList.remove('settings-on-photo');
    window.scrollTo(0, 0);
    window.dispatchEvent(new CustomEvent('offwego:navigate',{detail:{id}}));
  };
  window.goHome = function () {
    const homeEl = document.querySelector('#home');
    homeEl.style.display = 'block';
    homeEl.inert = false;
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('show');
      page.inert = true;
    });
    document.body.classList.add('settings-on-photo');
    window.scrollTo(0, 0);
  };
  document.querySelectorAll('.page').forEach(page => { page.inert = !page.classList.contains('show'); });
  document.body.classList.add('settings-on-photo');

// Source block 37
window.addEventListener('load', () => setTimeout(() => {
    document.title='Off We Go';
    document.querySelectorAll('#settings .modal-head h1').forEach(element=>element.textContent='Off We Go 工作台');
  }, 900));

// Source block 38
window.addEventListener('load', () => setTimeout(() => {
    document.querySelectorAll('.page .topline .mark').forEach(mark => {
      mark.setAttribute('role','button'); mark.setAttribute('tabindex','0'); mark.setAttribute('aria-label',t('common.back_home'));
      mark.onclick=goHome;
      mark.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();goHome();}};
    });
    [['#backTravellers','#dateNext'],['#backDates','#paceNext']].forEach(([backSelector,nextSelector]) => {
      const back=document.querySelector(backSelector), next=document.querySelector(nextSelector);
      if(!back || !next || back.dataset.footerNav) return;
      back.dataset.footerNav='true'; back.textContent='上一步'; back.className='outline flow-back';
      next.parentElement.prepend(back);
    });
    document.querySelector('#backTravellers')?.addEventListener('click',()=>{
      if(typeof window.showTravellerStep==='function') window.showTravellerStep();
      else show('question');
    });
    document.querySelector('#backDates')?.addEventListener('click',()=>show('dates'));
  }, 2400));

// Source block 39
/* The results summary is rebuilt after every search, so use delegation for its edit action. */
  window.addEventListener('load', () => {
    document.addEventListener('click', event => {
      if (event.target.closest('#resultsQuery button')) show('adjust');
    });
  });

// Source block 40
window.addEventListener('load', () => setTimeout(() => {
    const page=document.querySelector('#adjust'), idea=document.querySelector('#adjustIdea'), adults=document.querySelector('#adjustAdults'), children=document.querySelector('#adjustChildren'), pets=document.querySelector('#adjustPets'), mode=document.querySelector('#adjustDateMode'), inputs=document.querySelector('#adjustDateInputs'), start=document.querySelector('#adjustStart'), end=document.querySelector('#adjustEnd'), days=document.querySelector('#adjustDays'), note=document.querySelector('#adjustDurationNote');
    const dayOptions=[...document.querySelectorAll('[data-adjust-days]')], paceOptions=[...document.querySelectorAll('[data-adjust-pace]')];
    if(!page) return;
    const date=value=>new Date(value+'T12:00:00'), iso=value=>date(value).toISOString().slice(0,10);
    const countDays=()=>Math.round((date(end.value)-date(start.value))/86400000)+1;
    const updateDayState=()=>{const value=countDays();days.value=value;dayOptions.forEach(button=>button.classList.toggle('active',Number(button.dataset.adjustDays)===value));note.textContent=mode.value==='unknown'?t('dates.undecided_plan',{n:value}):t('format.plan_days_period',{n:value});};
    const fitDays=value=>{if(!Number.isInteger(value)||value<1||value>13)return;let finish=new Date(date(start.value).getTime()+(value-1)*86400000);if(finish>date(end.max)){start.value=iso(new Date(date(end.max).getTime()-(value-1)*86400000));finish=new Date(date(start.value).getTime()+(value-1)*86400000)}end.value=iso(finish);updateDayState();};
    const load=()=>{idea.value=document.querySelector('#queryInput')?.value||'';adults.value=document.querySelector('#adultsCount')?.textContent||2;children.value=document.querySelector('#childrenCount')?.textContent||0;pets.value=document.querySelector('#petsCount')?.textContent||0;start.value=readHolidayDate('start','2026-10-05');end.value=readHolidayDate('end','2026-10-09');mode.value=document.querySelector('#manualDates')?.value==='日期未定'?'unknown':'school';inputs.hidden=mode.value==='unknown';const selected=document.querySelector('[data-pace].active')?.dataset.pace||'轻松';paceOptions.forEach(button=>{const on=button.dataset.adjustPace===selected;button.classList.toggle('active',on);button.setAttribute('aria-checked',on?'true':'false');});updateDayState();};
    window.addEventListener('offwego:navigate',event=>{if(event.detail.id==='adjust')load();});
    mode.onchange=()=>{inputs.hidden=mode.value==='unknown';updateDayState();};
    start.onchange=()=>{if(end.value<start.value)end.value=start.value;updateDayState();};end.onchange=()=>{if(end.value<start.value)end.value=start.value;updateDayState();};
    dayOptions.forEach(button=>button.onclick=()=>fitDays(Number(button.dataset.adjustDays)));days.oninput=()=>fitDays(Number(days.value));    paceOptions.forEach(button=>button.onclick=()=>paceOptions.forEach(item=>{const on=item===button;item.classList.toggle('active',on);item.setAttribute('aria-checked',on?'true':'false');}));
    document.querySelector('#adjustBack').onclick=()=>show('results');
    document.querySelector('#adjustApply').onclick=async()=>{const people={adults:Math.max(1,Number(adults.value)||1),children:Math.max(0,Number(children.value)||0),pets:Math.max(0,Number(pets.value)||0)};const selectedPace=paceOptions.find(button=>button.classList.contains('active'))?.dataset.adjustPace||'轻松';document.querySelector('#queryInput').value=idea.value.trim();['adults','children','pets'].forEach(key=>{const output=document.querySelector('#'+key+'Count');if(output)output.textContent=people[key];});const dateText=mode.value==='unknown'?'日期未定':start.value+' 至 '+end.value;writeHolidayDates(start.value,end.value,dateText);document.querySelector('#customDuration').value=String(countDays());document.querySelectorAll('[data-pace]').forEach(button=>button.classList.toggle('active',button.dataset.pace===selectedPace));try{await OffWeGoState.patch({travellers:people});}catch{}goToResults();window.OffWeGoPlanNavigation?.renderWorkbenchSummary?.();window.loadLiveRecommendations?.();};
  }, 3100));

// Source block 41
/* Family profiles seed a new trip, including each child's saved birth month. */
  window.addEventListener('load', () => setTimeout(async () => {
    try {
      await OffWeGoState.ready;
      const family=(OffWeGoState.get().state?.family || []).filter(member=>member.type==='孩子');
      if(!family.length) return;
      const savedDates=family.map(member=>{
        const value=String(member.birthDate || member.birthMonth || '').trim();
        return /^\d{4}-\d{2}$/.test(value) ? value+'-01' : /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
      });
      const count=document.querySelector('#question #childrenCount');
      if(count) count.textContent=String(family.length);
      // The traveller-age panel is maintained by the existing UI. Fill its
      // current fields once it has rendered, without changing the family profile.
      setTimeout(()=>{
        const fields=[...document.querySelectorAll('#question [data-step-birth]')];
        if(fields.length!==family.length) return;
        fields.forEach((field,index)=>{
          const value=savedDates[index];
          if(value) field.value=value;
          field.dispatchEvent(new Event('input',{bubbles:true}));
          const caption=field.closest('.traveller-age-field')?.querySelector('small');
          if(caption && value) caption.textContent='已同步家庭资料 · '+value.slice(0,7).replace('-', ' 年 ')+' 月出生';
        });
      }, 350);
    } catch {}
  }, 3400));

// Source block 42
/* Keep child birth dates in one durable family record, then seed every new trip from it. */
  window.addEventListener('load', () => setTimeout(async () => {
    const modal=document.querySelector('#familyModal'), counter=modal?.querySelector('.family-counter'), save=document.querySelector('#saveFamily');
    if(!modal || !counter || !save) return;
    document.querySelector('#manageFamily').onclick=()=>modal.classList.add('show');
    if(counter.dataset.directBirthsBound) return;
    const intro=modal.querySelector('.modal-head + p');
    if(intro) intro.textContent='设置人数与孩子出生日期；生日会用于儿童票、房型与活动建议。';
    const childHint=document.querySelector('#childCount')?.closest('.family-counter-row')?.querySelector('small');
    if(childHint) childHint.textContent='填写出生日期后会自动计算年龄，并同步到新的行程';
    counter.dataset.directBirthsBound='true';
    let state;
    try{await OffWeGoState.ready;state=OffWeGoState.get().state;}catch{return;}
    const direct=document.createElement('div');direct.className='family-direct-births';direct.id='familyDirectBirths';
    const childRow=document.querySelector('#childCount')?.closest('.family-counter-row');
    if(childRow) childRow.after(direct);
    modal.querySelectorAll('.child-age-details').forEach(element=>element.remove());
    const normalise=value=>{const text=String(value||'').trim();return /^\d{4}-\d{2}$/.test(text)?text+'-01':/^\d{4}-\d{2}-\d{2}$/.test(text)?text:'';};
    const render=()=>{
      const prior=[...direct.querySelectorAll('input')].map(input=>input.value);
      const children=(state.family||[]).filter(member=>member.type==='孩子');
      const count=Number(document.querySelector('#childCount')?.textContent||0);
      direct.hidden=count===0;
      if(!count) return;
      direct.innerHTML='<p>孩子出生日期会同步到每次新的行程，用于儿童票、房型和活动建议。</p><div class="family-direct-birth-grid">'+Array.from({length:count},(_,index)=>'<label class="family-direct-birth"><span><b>孩子 '+(index+1)+'</b><small>可选；可稍后修改</small></span><input type="date" data-family-birth="'+index+'" aria-label="孩子 '+(index+1)+' 的出生日期" value="'+(prior[index]||normalise(children[index]?.birthDate||children[index]?.birthMonth))+'"></label>').join('')+'</div>';
    };
    render();
    document.querySelector('#childMinus')?.addEventListener('click',()=>setTimeout(render));
    document.querySelector('#childPlus')?.addEventListener('click',()=>setTimeout(render));
    save.addEventListener('click', async event=>{
      event.preventDefault();event.stopImmediatePropagation();
      const adults=Math.max(1,Number(document.querySelector('#adultCount')?.textContent)||1), children=Math.max(0,Number(document.querySelector('#childCount')?.textContent)||0), pets=Math.max(0,Number(document.querySelector('#petCount')?.textContent)||0);
      const birthDates=[...direct.querySelectorAll('[data-family-birth]')].map(input=>input.value||'');
      try{
        const previous=OffWeGoState.get().state.family||[];
        const keep=(type,count)=>previous.filter(member=>member.type===type).slice(0,count);
        const adultRecords=[...keep('成年人',adults),...Array.from({length:Math.max(0,adults-keep('成年人',adults).length)},()=>({type:'成年人'}))];
        const childRecords=Array.from({length:children},(_,index)=>{const prior=keep('孩子',children)[index]||{type:'孩子'};const birthDate=birthDates[index]||'';return {...prior,type:'孩子',birthDate,birthMonth:birthDate?birthDate.slice(0,7):''};});
        await OffWeGoState.patch({family:[...adultRecords,...childRecords],pets,travellers:{adults,children,pets}});modal.classList.remove('show');note('家庭资料已保存，并会同步到新的行程。');
      }catch{note('家庭资料暂时无法保存。');}
    },true);
  },3900));

// Source block 43
(() => {
    const bind=button=>{
      if(!button||button.dataset.settingsBound)return;
      button.dataset.settingsBound='true';
      button.type='button';
      button.setAttribute('aria-label',button.getAttribute('aria-label')||'设置');
      button.setAttribute('title','设置');
      button.setAttribute('aria-haspopup','dialog');
      button.setAttribute('aria-controls','settings');
      button.style.cursor='pointer';
      button.style.pointerEvents='auto';
      if(!button.querySelector('i,svg'))button.innerHTML='<i class="ri-settings-3-line" aria-hidden="true"></i>';
      button.addEventListener('click',toggleSettings);
    };
    let button=document.querySelector('#globalSettingsAction');
    if(!button){
      button=document.createElement('button');
      button.id='globalSettingsAction';
      button.className='icon';
      button.innerHTML='<i class="ri-settings-3-line" aria-hidden="true"></i>';
      document.body.append(button);
    }
    bind(button);
    ['#settingsHome','#settingsResults','#settingsAdjust'].forEach(selector=>bind(document.querySelector(selector)));
  })();

// Source block 44
/* A holiday is a reference for dates, not a second competing question. */
  window.addEventListener('load', () => setTimeout(() => {
    const mode=document.querySelector('#adjustDateMode'), start=document.querySelector('#adjustStart'), end=document.querySelector('#adjustEnd'), fields=document.querySelector('#adjustDateInputs');
    if(!mode || !start || !end || !fields || mode.dataset.compactTimingReady) return;
    mode.dataset.compactTimingReady='true';
    mode.innerHTML='<option value="school">下一个学校假期 · 10 月 5–17 日</option><option value="winter">下下个学校假期 · 12 月 21 日–1 月 2 日</option><option value="custom">自选其他日期</option><option value="unknown">日期还没定</option>';
    mode.closest('.adjust-section')?.querySelector('h2')?.replaceChildren('什么时候出发？');
    const setWindow=(begin,finish,reset)=>{start.min=begin;start.max=finish;end.min=begin;end.max=finish;if(reset){start.value=begin;end.value=new Date(new Date(begin+'T12:00:00').getTime()+4*86400000).toISOString().slice(0,10);}};
    const applyMode=(value,reset)=>{fields.hidden=value==='unknown';if(value==='school')setWindow('2026-10-05','2026-10-17',reset);if(value==='winter')setWindow('2026-12-21','2027-01-02',reset);if(value==='custom'){start.min='';start.max='';end.min='';end.max='';}};
    mode.onchange=()=>applyMode(mode.value,true);
    window.addEventListener('offwego:navigate',event=>{if(event.detail.id!=='adjust')return;const sourceStart=readHolidayDate('start'),sourceEnd=readHolidayDate('end'),unknown=document.querySelector('#manualDates')?.value==='日期未定';const value=unknown?'unknown':(sourceStart>='2026-12-21'&&sourceStart<='2027-01-02'?'winter':(sourceStart>='2026-10-05'&&sourceStart<='2026-10-17'?'school':'custom'));mode.value=value;if(!unknown&&sourceStart&&sourceEnd){start.value=sourceStart;end.value=sourceEnd;}applyMode(value,false);});
    applyMode(mode.value,false);
  }, 6200));

// Source block 45
/* In the editable overview, dates and duration are independent, optional inputs. */
  setTimeout(() => {
    const page=document.querySelector('#adjust'), section=document.querySelector('#adjustDateMode')?.closest('.adjust-section'), mode=document.querySelector('#adjustDateMode'), fields=document.querySelector('#adjustDateInputs'), start=document.querySelector('#adjustStart'), end=document.querySelector('#adjustEnd'), days=document.querySelector('#adjustDays'), note=document.querySelector('#adjustDurationNote'), apply=document.querySelector('#adjustApply');
    if(!page || !section || !mode || !fields || !start || !end || !days || !note || !apply || page.dataset.directTimingReady) return;
    page.dataset.directTimingReady='true';
    section.querySelector('h2').textContent='什么时候出发？';
    start.min='';start.max='';end.min='';end.max='';mode.value='custom';
    const direct=document.createElement('div');direct.className='adjust-date-direct';
    fields.before(direct);direct.append(fields);
    const toggle=document.createElement('button');toggle.type='button';toggle.className='adjust-date-toggle';toggle.textContent='日期还没定';direct.append(toggle);
    const options=[...document.querySelectorAll('[data-adjust-days]')];
    const clearDuration=()=>{options.forEach(option=>option.classList.remove('active'));days.value='0';note.textContent='尚未选择行程天数；需要时再选择范围或输入天数。';note.classList.add('is-empty');};
    const chooseDays=value=>{if(!Number.isInteger(value)||value<1||value>90)return;options.forEach(option=>option.classList.toggle('active',Number(option.dataset.adjustDays)===value));days.value=String(value);note.textContent='已选 '+value+' 天。';note.classList.remove('is-empty');};
    clearDuration();
    options.forEach(option=>option.onclick=()=>chooseDays(Number(option.dataset.adjustDays)));
    days.min='0';days.value='0';days.oninput=()=>chooseDays(Number(days.value));
    const validDates=()=>start.value && end.value && end.value>=start.value;
    const setUndecided=undecided=>{mode.value=undecided?'unknown':'custom';direct.classList.toggle('is-undecided',undecided);toggle.textContent=undecided?'填写日期':'日期还没定';if(undecided)clearDuration();};
    toggle.onclick=()=>setUndecided(mode.value!=='unknown');
    [start,end].forEach(input=>input.onchange=()=>{if(end.value&&start.value&&end.value<start.value)end.value=start.value;setUndecided(false);clearDuration();});
    window.addEventListener('offwego:navigate',event=>{if(event.detail.id==='adjust'){mode.value='custom';setUndecided(false);clearDuration();}});
    apply.onclick=async()=>{
      const people={adults:Math.max(1,Number(document.querySelector('#adjustAdults').value)||1),children:Math.max(0,Number(document.querySelector('#adjustChildren').value)||0),pets:Math.max(0,Number(document.querySelector('#adjustPets').value)||0)};
      const selectedPace=[...document.querySelectorAll('[data-adjust-pace]')].find(button=>button.classList.contains('active'))?.dataset.adjustPace||'轻松';
      const dateText=mode.value==='unknown'||!validDates()?'日期未定':start.value+' 至 '+end.value;
      const duration=Number(days.value)>0?Number(days.value)+' 天':'天数未定';
      document.querySelector('#queryInput').value=document.querySelector('#adjustIdea').value.trim();
      ['adults','children','pets'].forEach(key=>{const output=document.querySelector('#'+key+'Count');if(output)output.textContent=people[key];});
      writeHolidayDates(start.value||'2026-10-05',end.value||'2026-10-09',dateText);document.querySelector('#customDuration').value=Number(days.value)>0?String(days.value):'';
      document.querySelectorAll('[data-pace]').forEach(button=>button.classList.toggle('active',button.dataset.pace===selectedPace));
      try{await OffWeGoState.patch({travellers:people});}catch{}
      goToResults();window.OffWeGoPlanNavigation?.renderWorkbenchSummary?.();window.loadLiveRecommendations?.();
    };
  }, 0);

// Source block 46
/* Budget is a deliberate planning input before any recommendation request. */
  setTimeout(() => {
    const page=document.querySelector('#budget'), paceNext=document.querySelector('#paceNext'), back=document.querySelector('#budgetBack'), next=document.querySelector('#budgetNext'), amount=document.querySelector('#budgetAmount'), buffer=document.querySelector('#budgetBuffer'), percent=document.querySelector('#budgetBufferPercent'), context=document.querySelector('#budgetContext'), currencyLabel=document.querySelector('#budgetCurrencyLabel'), currencyHelper=document.querySelector('#budgetCurrencyHelper');
    if(!page || !paceNext || page.dataset.ready) return;
    page.dataset.ready='true';
    const currencyCode=()=>document.documentElement.dataset.currency||document.querySelector('#currency')?.value.match(/CHF|EUR|USD|CNY/)?.[0]||'CHF';
    const currencyLocale=code=>({CHF:'de-CH',EUR:'de-DE',USD:'en-US',CNY:'zh-CN'}[code]||'en-US');
    const updateCurrency=({reset=false}={})=>{const code=currencyCode();currencyLabel.firstChild.textContent=t('budget.label_code',{code});currencyHelper.textContent=t('budget.helper_code',{code});amount.placeholder=code==='CNY'?t('例如 30000'):t('例如 4000');if(reset&&amount.value)amount.value='';page.dataset.budgetCurrency=code;};
    const describe=()=>{percent.disabled=!buffer.checked;const value=Number(amount.value), bufferPercent=Number(percent.value), code=currencyCode();if(!value)return '预算未定';const budget=code+' '+value.toLocaleString(currencyLocale(code));return budget+(buffer.checked?' (最多上浮 '+bufferPercent+'%)':'');};
    const renderContext=()=>{const nav=window.OffWeGoPlanNavigation,summary=nav?.contextHtml(nav.contextParts('budget'))||'';context.innerHTML='<div class="pace-context-pill">'+summary+'<button type="button"><i class="ri-edit-line" aria-hidden="true"></i><span>编辑</span></button></div>';context.querySelector('button').onclick=()=>typeof window.showTravellerStep==='function'?window.showTravellerStep():show('question');};
    [amount,buffer,percent].forEach(input=>input.addEventListener('input',describe));
    updateCurrency();window.addEventListener('currencychange',()=>{updateCurrency({reset:page.dataset.budgetCurrency!==currencyCode()});describe();});window.addEventListener('offwego:language',()=>{updateCurrency();describe();renderContext();});
    const rentalCheckbox=document.querySelector('#carRentalNeeded');
    if(!localStorage.getItem('offwegoCarRentalCheckboxV1')){localStorage.setItem('offwegoCarRental','no');localStorage.setItem('offwegoCarRentalCheckboxV1','1')}
    rentalCheckbox.checked=localStorage.getItem('offwegoCarRental')==='yes';
    rentalCheckbox.addEventListener('change',()=>localStorage.setItem('offwegoCarRental',rentalCheckbox.checked?'yes':'no'));
    paceNext.onclick=()=>{localStorage.setItem('offwegoCarRental',rentalCheckbox.checked?'yes':'no');localStorage.setItem('offwegoRentalDays',document.querySelector('#customDuration')?.value||'5');show('budget');renderContext()};back.onclick=()=>show('pace');
    next.onclick=()=>{window.currentTripBudget=describe();goToResults();window.OffWeGoPlanNavigation?.renderWorkbenchSummary?.();window.loadLiveRecommendations?.();};
  }, 0);

// Source block 47
/* Language switching is owned by OffWeGoI18n so a saved preference actually translates the UI. */

// Source block 48
/* A school break is selected inside its own card; no duplicated timing summary. */
  window.addEventListener('load', () => setTimeout(() => {
    const page=document.querySelector('#dates'), container=page?.querySelector('.date-options');
    if(!page || !container || page.dataset.schoolBreakCardsReady) return;
    page.dataset.schoolBreakCardsReady='true';
    const build=()=>{
      const raw={when:'什么时候出发？',lead:'点击学校假期即可选择并精确日期；也可以自选日期，或暂时不决定。',timing:'出发时间',autumn:'最近的学校假期',winter:'冬季假期',custom:'自选日期或暂未决定',autumnDate:'2026 年 10 月 5 日至 17 日 · 共 13 天',winterDate:'2026 年 12 月 21 日至 2027 年 1 月 2 日 · 共 13 天',autumnNote:'苏黎世秋假',winterNote:'苏黎世圣诞与新年假期',customNote:'可直接填写日期，也可以先看目的地',undecided:'日期暂未决定',undecidedNote:'未填日期时，会优先考虑淡季和预算匹配度；选定方向后再核对实时交通价格。',days:'这次玩几天？',short:'3–4 天',week:'5–7 天',long:'8–10 天',exact:'精准天数',notChosen:'尚未选择行程天数',chooseLength:'选择范围或输入精确天数。',depart:'出发日',return:'返回日',within:'可在这段学校假期内选择任意日期。'};
      const text=Object.fromEntries(Object.entries(raw).map(([key,value])=>[key,t(value)]));
      page.querySelector('.flow-step h1').textContent=text.when;page.querySelector('.flow-step > p').textContent=text.lead;
      container.innerHTML='<div class="flow-section-label">'+text.timing+'</div><div class="school-break-grid" id="schoolBreakGrid">'+card('autumn',text.autumn,text.autumnDate,text.autumnNote,'2026-10-05','2026-10-17',false)+card('winter',text.winter,text.winterDate,text.winterNote,'2026-12-21','2027-01-02',false)+card('custom',text.custom,'',text.customNote,'','',true)+'</div><div class="flow-section-label duration-label">'+text.days+'</div><div class="holiday-duration-picker" role="radiogroup" aria-label="'+text.days+'"><button type="button" role="radio" aria-checked="false" class="holiday-duration-option" data-days="3"><b>'+text.short+'</b></button><button type="button" role="radio" aria-checked="false" class="holiday-duration-option" data-days="5"><b>'+text.week+'</b></button><button type="button" role="radio" aria-checked="false" class="holiday-duration-option" data-days="8"><b>'+text.long+'</b></button><label class="holiday-duration-custom"><span>'+text.exact+'</span><input id="customDurationInput" type="number" min="0" max="90" value="0" inputmode="numeric"> <em>'+t('common.days')+'</em></label></div><input id="manualDates" type="hidden" value="日期未定"><input id="customDuration" type="hidden" value=""><div class="school-duration-status" id="schoolDurationStatus"><b>'+text.notChosen+'</b><span>'+text.chooseLength+'</span></div>';
      function card(kind,title,date,note,start,end,custom){return '<article class="school-break-card" data-kind="'+kind+'"><b>'+title+'</b>'+(date?'<small>'+date+'</small>':'')+'<em>'+note+'</em><div class="school-break-editor" hidden><label>'+text.depart+'<input type="date" data-start '+(start?'value="'+start+'"':'')+' '+(custom?'':'min="'+start+'" max="'+end+'"')+'></label><label>'+text.return+'<input type="date" data-end '+(end?'value="'+end+'"':'')+' '+(custom?'':'min="'+start+'" max="'+end+'"')+'></label>' +(custom?'<p>'+text.undecidedNote+'</p>':'<p>'+text.within+'</p>')+'</div></article>'}
      const cards=[...container.querySelectorAll('.school-break-card')], manual=container.querySelector('#manualDates'), hiddenDuration=container.querySelector('#customDuration'), exact=container.querySelector('#customDurationInput'), status=container.querySelector('#schoolDurationStatus');
      const selectCard=card=>{cards.forEach(item=>{const selected=item===card;item.classList.toggle('active',selected);item.setAttribute('aria-pressed',selected?'true':'false');item.querySelector('.school-break-editor').hidden=!selected;});const start=card.querySelector('[data-start]'),end=card.querySelector('[data-end]');manual.value=start?.value&&end?.value?start.value+' 至 '+end.value:'日期未定';};
      cards.forEach(card=>{card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-pressed','false');card.onclick=event=>{if(!event.target.matches('input'))selectCard(card);};card.addEventListener('keydown',event=>{if(event.target!==card)return;if(event.key==='Enter'||event.key===' '){event.preventDefault();selectCard(card);}});card.querySelectorAll('input[type=date]').forEach(input=>input.onchange=()=>selectCard(card));card.querySelector('[data-undecided]')?.addEventListener('change',event=>{if(event.target.checked){manual.value='日期未定';card.querySelectorAll('input[type=date]').forEach(input=>input.value='');}});});
      const setDuration=value=>{container.querySelectorAll('[data-days]').forEach(button=>{const on=Number(button.dataset.days)===value;button.classList.toggle('active',on);button.setAttribute('aria-checked',on?'true':'false');});exact.value=String(value||0);hiddenDuration.value=value?String(value):'';status.innerHTML=value?'<b>'+t('format.selected_days',{n:value})+'</b><span>'+text.chooseLength+'</span>':'<b>'+text.notChosen+'</b><span>'+text.chooseLength+'</span>';};
      container.querySelectorAll('[data-days]').forEach(button=>button.onclick=()=>setDuration(Number(button.dataset.days)));exact.oninput=()=>setDuration(Number(exact.value));setDuration(0);
      if(sessionStorage.getItem('offWeGoNextHolidaySelected')==='true') selectCard(cards.find(card=>card.dataset.kind==='autumn'));
    };
    build();
    window.addEventListener('offwego:language', build);
    document.querySelector('#dateNext').onclick=()=>show('pace');
  }, 0));

// Source block 49
/* Show the chosen school break and keep date editing deliberately secondary. */
  setTimeout(() => {
    const mode=document.querySelector('#adjustDateMode'), inputs=document.querySelector('#adjustDateInputs'), start=document.querySelector('#adjustStart'), end=document.querySelector('#adjustEnd');
    if(!mode || !inputs || !start || !end || mode.dataset.summaryTimingReady) return;
    mode.dataset.summaryTimingReady='true';
    const section=mode.closest('.adjust-section');if(!section) return;
    const heading=section.querySelector('h2');heading.textContent=t('什么时候出发？');
    const summary=document.createElement('div');summary.className='adjust-timing-summary';summary.innerHTML='<span><b></b><small></small></span><button type="button">'+t('编辑日期')+'</button>';
    const title=summary.querySelector('b'),detail=summary.querySelector('small'),edit=summary.querySelector('button');
    mode.after(summary);inputs.classList.add('is-collapsed');
    const format=value=>value?new Intl.DateTimeFormat(window.OffWeGoI18n?.locale?.()||'zh-CN',{month:'long',day:'numeric'}).format(new Date(value+'T12:00:00')):t('common.tbd');
    const update=()=>{const withinAutumn=start.value>='2026-10-05'&&start.value<='2026-10-17',withinWinter=start.value>='2026-12-21'&&start.value<='2027-01-02';const breakName=withinAutumn?t('最近学校假期 · 苏黎世秋假'):withinWinter?t('冬季假期 · 苏黎世圣诞与新年假期'):t('自选日期');const count=start.value&&end.value?Math.max(1,Math.round((new Date(end.value+'T12:00:00')-new Date(start.value+'T12:00:00'))/86400000)+1):0;title.textContent=breakName;detail.textContent=count?t('dates.range_days',{start:format(start.value),end:format(end.value),n:count}):t('尚未选择具体日期');};
    edit.onclick=()=>{const opening=inputs.classList.toggle('is-collapsed');edit.textContent=opening?t('编辑日期'):t('收起日期');edit.setAttribute('aria-expanded', opening?'false':'true');if(!opening)start.focus();};
    [start,end].forEach(input=>input.addEventListener('change',update));
    window.addEventListener('offwego:language',update);
    update();
    document.querySelectorAll('#pace [data-pace]').forEach((button,index)=>{const labels=['轻松','平衡','充实'];const subtitles=['每天一个重点，留出自由时间','活动与休息安排更均衡','优先安排更多体验'];button.dataset.pace=labels[index];button.querySelector('b').textContent=t(labels[index]);button.querySelector('small').textContent=t(subtitles[index]);button.setAttribute('aria-checked', button.classList.contains('active')?'true':'false');});
  }, 0);

// Source block 50
/* The editable overview always reflects the choices already made in the flow. */
  setTimeout(() => {
    const page=document.querySelector('#adjust'), duration=document.querySelector('#adjustDays'), note=document.querySelector('#adjustDurationNote'), timingHeading=document.querySelector('#adjustDateMode')?.closest('.adjust-section')?.querySelector('h2');
    if(!page || !duration || !note || page.dataset.choiceSyncReady) return;
    page.dataset.choiceSyncReady='true';
    page.querySelectorAll('.topline .step-settings').forEach(button=>button.remove());
    page.querySelector('.adjust-shell>p').textContent='核对并调整已选条件；更新后会按新的组合重新生成推荐。';
    if(timingHeading) timingHeading.textContent='出发时间';
    const normalisePace=value=>({ '轻松慢游':'轻松','平衡探索':'平衡','紧凑打卡':'充实' }[value] || value || '轻松');
    const sync=()=>{
      const chosenDays=Number(document.querySelector('#customDuration')?.value)||0;
      const dayButtons=[...document.querySelectorAll('[data-adjust-days]')];
      dayButtons.forEach(button=>button.classList.toggle('active',chosenDays>0 && Number(button.dataset.adjustDays)===chosenDays));
      duration.value=String(chosenDays);
      note.textContent=chosenDays ? '已选 '+chosenDays+' 天。可在这里改为其他范围或输入精确天数。' : '尚未选择行程天数；需要时再选择范围或输入天数。';
      note.classList.toggle('is-empty',!chosenDays);
      const flowPace=normalisePace(document.querySelector('#pace [data-pace].active')?.dataset.pace);
      document.querySelectorAll('[data-adjust-pace]').forEach(button=>{const on=button.dataset.adjustPace===flowPace;button.classList.toggle('active',on);button.setAttribute('aria-checked',on?'true':'false');});
    };
    window.addEventListener('offwego:navigate',event=>{if(event.detail.id==='adjust')sync();});
    document.querySelectorAll('[data-adjust-days]').forEach(button=>button.addEventListener('click',()=>{const value=Number(button.dataset.adjustDays);document.querySelector('#customDuration').value=String(value);sync();}));
    duration.addEventListener('input',()=>{const value=Math.max(0,Number(duration.value)||0);document.querySelector('#customDuration').value=value?String(value):'';sync();});
    document.querySelectorAll('[data-adjust-pace]').forEach(button=>button.addEventListener('click',()=>{const choice=button.dataset.adjustPace;document.querySelectorAll('[data-adjust-pace]').forEach(item=>{const on=item===button;item.classList.toggle('active',on);item.setAttribute('aria-checked',on?'true':'false');});document.querySelectorAll('#pace [data-pace]').forEach(item=>{const on=normalisePace(item.dataset.pace)===choice;item.classList.toggle('active',on);item.setAttribute('aria-checked',on?'true':'false');});}));
  }, 0);

// Source block 51
/* Skip the traveller questionnaire when a party was deliberately saved; keep a one-click edit path on dates. */
  (() => {
    const nativeShow = window.show;
    const configuredKey = 'offWeGoTravellersConfigured';
    const dateStep = document.querySelector('#dates .flow-step');
    if (!nativeShow || !dateStep) return;

    const summary = document.createElement('aside');
    summary.className = 'traveller-summary';
    summary.id = 'travellerSummary';
    summary.innerHTML = '<b id="travellerSummaryText"></b><button type="button" id="travellerQuickEdit"><i class="ri-edit-line" aria-hidden="true"></i><span>编辑</span></button>';
    dateStep.querySelector('h1')?.after(summary);

    const describe = state => {
      const savedFamily = Array.isArray(state?.family) ? state.family : [];
      const savedTravellers = state?.travellers || {};
      const adults = savedFamily.filter(member => member.type === '成年人').length || Number(savedTravellers.adults || 0);
      const children = savedFamily.filter(member => member.type === '孩子').length || Number(savedTravellers.children || 0);
      const pets = Number(state?.pets ?? savedTravellers.pets ?? 0);
      return {
        adults: Math.max(1, adults || 1), children: Math.max(0, children), pets: Math.max(0, pets),
        text: [adults ? adults + ' 位成人' : '', children ? children + ' 位孩子' : '', pets ? pets + ' 只宠物' : ''].filter(Boolean).join(' · ')
      };
    };
    const hasSavedParty = state => {
      const savedTravellers = state?.travellers || {};
      return (Array.isArray(state?.family) && state.family.length > 0)
        || savedTravellers.configured === true
        || localStorage.getItem(configuredKey) === 'true'
        || Number(savedTravellers.adults || 0) !== 2 && Number(savedTravellers.adults || 0) > 0
        || Number(savedTravellers.children || 0) > 0
        || Number(savedTravellers.pets || 0) > 0;
    };
    const updateQuestionCounts = party => {
      ['adults','children','pets'].forEach(key => {
        const output = document.querySelector('#' + key + 'Count');
        if (output) output.textContent = party[key];
      });
    };
    const showSummary = state => {
      if (!hasSavedParty(state)) { summary.classList.remove('show'); return; }
      const party = describe(state);
      summary.querySelector('#travellerSummaryText').textContent = party.text || '已保存同行人偏好';
      summary.classList.add('show');
      updateQuestionCounts(party);
    };
    const loadState = async () => {
      try { await OffWeGoState.ready; return OffWeGoState.get().state; }
      catch { return null; }
    };

    document.querySelector('#travellerQuickEdit').onclick = () => nativeShow('question');
    document.addEventListener('click', event => {
      if (!event.target.closest('#travellerNext')) return;
      localStorage.setItem(configuredKey, 'true');
    }, true);
    window.addEventListener('offwego:navigate', async event => {
      if (event.detail?.id === 'dates') showSummary(await loadState());
    });

    window.show = function (id) {
      if (id !== 'question') return nativeShow(id);
      loadState().then(state => {
        if (hasSavedParty(state)) {
          showSummary(state);
          nativeShow('dates');
        } else {
          nativeShow('question');
        }
      });
    };
    window.showTravellerStep = () => nativeShow('question');
  })();

// Source block 52
(()=>{
    const paceStep=document.querySelector('#pace .flow-step');
    if(!paceStep || document.querySelector('#paceContext')) return;
    const context=document.createElement('div');context.className='pace-context';context.id='paceContext';
    paceStep.querySelector('h1')?.after(context);
    document.querySelectorAll('#pace [data-pace]').forEach(button=>button.addEventListener('click',()=>{
      document.querySelectorAll('#pace [data-pace]').forEach(item=>{
        const on=item===button;
        item.classList.toggle('active',on);
        item.setAttribute('aria-checked', on?'true':'false');
      });
    }));
    const escapeHtml=value=>String(value||'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
    const render=()=>{
      const nav=window.OffWeGoPlanNavigation, summary=nav?.contextHtml(nav.contextParts('pace'))||'';
      context.innerHTML='<div class="pace-context-pill">'+summary+'<button type="button" id="paceEditTravellers"><i class="ri-edit-line" aria-hidden="true"></i><span>'+t('编辑')+'</span></button></div>';
      context.querySelector('#paceEditTravellers').onclick=()=>typeof window.showTravellerStep==='function'?window.showTravellerStep():show('question');
    };
    window.addEventListener('offwego:navigate',event=>{if(event.detail?.id==='pace')render()});
    window.addEventListener('offwego:language',render);
  })();

// Source block 53
/* Home shortcuts reflect saved family context, and “next holiday” carries into the date picker. */
  (() => {
    const nextHolidayKey='offWeGoNextHolidaySelected';
    const updateDateIntent=()=>{
      const query=document.querySelector('#queryInput')?.value || '';
      if(query.includes('下一个假期')) sessionStorage.setItem(nextHolidayKey,'true');
      else sessionStorage.removeItem(nextHolidayKey);
    };
    document.addEventListener('click', event => {
      const add=event.target.closest('[data-add]');
      const remove=event.target.closest('[data-remove]');
      if(add?.dataset.add==='下一个假期') sessionStorage.setItem(nextHolidayKey,'true');
      if(remove?.dataset.remove==='下一个假期') sessionStorage.removeItem(nextHolidayKey);
      if(event.target.closest('#search')) updateDateIntent();
    }, true);

    /* Saved family context is already present in the page shell; do not wait for a
       second network request before removing the redundant child shortcut. */
    if(document.querySelector('#home.signed .saved')) {
      const removeFamilyShortcut=()=>{
        document.querySelectorAll('#shortcuts [data-add="带孩子"]').forEach(button=>button.remove());
      };
      removeFamilyShortcut();
      new MutationObserver(removeFamilyShortcut).observe(document.querySelector('#shortcuts'),{childList:true});
    }

    window.addEventListener('offwego:navigate', event => {
      if(event.detail?.id!=='dates' || sessionStorage.getItem(nextHolidayKey)!=='true') return;
      setTimeout(()=>document.querySelector('#dates [data-kind="autumn"]')?.click());
    });
  })();

// Source block 54
/* A recommendation card opens one complete plan. Price research and booking links never leak into the comparison view. */
  (() => {
    const escapeHtml=value=>String(value || '').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
    const budgetReference=()=>window.currentTripBudget || document.querySelector('#budgetSummary b')?.textContent || t('copy.budget_undecided_2');
    const displayPrice=(summary,label,value,note)=>{summary.innerHTML='<span>'+escapeHtml(label)+'</span><b>'+escapeHtml(value)+'</b><small>'+escapeHtml(note)+'</small>';};
    const moneyValue=(amount,currency)=>window.OffWeGoI18n?.format?.money(amount,currency,{digits:2})||((currency||'')+' '+Number(amount)).trim();
    const renderPublicFare=(summary,reference,label)=>{
      if(!reference){displayPrice(summary,label+t('fare.pending_mark'),'—',t('fare.unverified'));return false;}
      summary.innerHTML='<span>'+escapeHtml(label+t('fare.ref_suffix'))+'</span><b>'+escapeHtml(moneyValue(reference.amount,reference.currency))+'</b><small>'+escapeHtml(t(reference.label)||t('fare.public_ref'))+'</small><small>'+t('transport.price_disclaimer')+(reference.sourceUrl?' <a href="'+escapeHtml(reference.sourceUrl)+'" target="_blank" rel="noreferrer">'+t('transport.view_source')+' <i class="ri-external-link-line" aria-hidden="true"></i></a>':'')+'</small>';
      return true;
    };
    const searchPublicFare=async({origin,destination,departureTime,mode})=>{
      const response=await fetch('/api/fare-reference',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin,destination,departureTime,mode})});
      const data=await response.json();if(!response.ok)throw new Error(data.error || t('fare.public_unavailable'));return data.fareReference;
    };
    const requestCardPrice=async(card,summary)=>{
      const transport=card.querySelector('.live-card-price')?.textContent || '';
      const destination=card.querySelector('h2')?.textContent.trim() || '';
      if(/火车|train/i.test(transport)){
        displayPrice(summary,t('fare.train_price'),t('copy.checking_fares'),t('fare.ojp_google'));
        try{
          await OffWeGoState.ready;
          const origin=/zürich|zurich|苏黎世|kilchberg/i.test(OffWeGoState.get().state?.preferences?.origin || '')?'Zürich HB':(OffWeGoState.get().state?.preferences?.origin || 'Zürich HB');
          const resolved=typeof window.offWeGoDateRange==='function'?window.offWeGoDateRange():null;
          const matched=(document.querySelector('#manualDates')?.value || '').match(/(\d{4}-\d{2}-\d{2})/);
          const departureDate=resolved?.[0] || matched?.[1] || new Date(Date.now()+86400000).toISOString().slice(0,10);
          const response=await fetch('/api/journey-quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin,destination,departureTime:departureDate+'T07:00:00Z'})});
          const quote=await response.json();if(!response.ok)throw new Error(quote.error || t('fare.transport_unavailable'));
          const priced=quote.fare || quote.fareReference;
          if(quote.fare) displayPrice(summary,t('fare.one_way_train'),moneyValue(quote.fare.amount,quote.fare.currency),t(quote.fareNote)||t('fare.ojp_ref'));
          else renderPublicFare(summary,quote.fareReference,t('fare.one_way_train'));
        }catch(error){displayPrice(summary,t('fare.train_pending'),'—',t(error.message)||t('fare.transport_unavailable'));}
        return;
      }
      const airport=card.querySelector('.flight-window-button')?.dataset.airport;
      const resolved=typeof window.offWeGoDateRange==='function'?window.offWeGoDateRange():null;
      const matched=(document.querySelector('#manualDates')?.value || '').match(/(\d{4}-\d{2}-\d{2}).*?(\d{4}-\d{2}-\d{2})/);
      const dates=resolved?['',resolved[0],resolved[1]]:matched;
      if(!airport || !dates){displayPrice(summary,t('fare.lowest_return'),t('fare.need_range'),t('fare.need_range_hint'));return;}
      displayPrice(summary,t('fare.lowest_return'),t('copy.checking_fares'),t('fare.duffel_comparing'));
      try{
        await OffWeGoState.ready;const state=OffWeGoState.get().state || {};
        const stayDays=Math.max(1,Number(document.querySelector('#customDuration')?.value)||5);
        const response=await fetch('/api/flights/window',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({originLocationCode:/zürich|zurich|苏黎世|kilchberg/i.test(state.preferences?.origin || '')?'ZRH':'',destinationLocationCode:airport,startDate:dates[1],endDate:dates[2],stayDays,adults:state.travellers?.adults||1,children:state.travellers?.children||0})});
        const quote=await response.json();if(!response.ok)throw new Error(quote.error || t('research.flight_unavailable'));
        const lowest=quote.recommended || quote.lowest;
        const dateLabel=value=>window.OffWeGoI18n?.format?.date(value,{month:'long',day:'numeric'})||value;
        card.dataset.recommendedDates=lowest.departureDate+' 至 '+lowest.returnDate;
        card.dataset.recommendedFlight=moneyValue(lowest.amount,lowest.currency);
        const quoteKind=quote.liveMode?t('fare.duffel_live'):t('fare.duffel_test');
        displayPrice(summary,t('research.recommend_window',{days:stayDays,start:dateLabel(lowest.departureDate),end:dateLabel(lowest.returnDate)}),moneyValue(lowest.amount,lowest.currency),t('research.compared_dates',{n:quote.checkedDates})+' · '+quoteKind+(lowest.airline?' · '+lowest.airline:''));
      }catch(error){
        try{
          await OffWeGoState.ready;
          const origin=OffWeGoState.get().state?.preferences?.origin || 'Zürich';
          const reference=await searchPublicFare({origin,destination,departureTime:dates?.[1] ? dates[1]+'T07:00:00Z' : '',mode:'flight'});
          if(!renderPublicFare(summary,reference,t('fare.lowest_return'))) summary.querySelector('small:last-child').textContent=t('fare.duffel_no_search');
        }catch(searchError){displayPrice(summary,t('fare.lowest_pending'),'—',t('fare.both_unavailable'));}
      }
    };
    const enhanceCards=()=>{
      const list=document.querySelector('.destinations'); if(!list) return;
      list.querySelectorAll('.destination').forEach(card=>{
        if(card.dataset.planDetailReady==='true') return;
        const transport=card.querySelector('.live-card-price')?.textContent.trim();
        card.dataset.planDetailReady='true';card.dataset.transport=transport || t('fare.check_in_plan');
        // TODO: If the whole destination card becomes a single clickable/selectable control,
        // redesign nested links and buttons (photo credit, Maps, Flights/Hotels) so they
        // are not interactive descendants of another interactive element.
        card.tabIndex=0;card.setAttribute('role','button');card.setAttribute('aria-label',t('copy.view_full_plan')+' · '+(card.querySelector('h2')?.textContent.trim()||''));
        const button=document.createElement('button');button.type='button';button.className='plan-detail-button';button.textContent=t('copy.view_full_plan');
        if(transport){const summary=document.createElement('div');summary.className='plan-total-reference';displayPrice(summary,t('copy.price_guide'),budgetReference(),t('fare.checking_mode'));card.append(summary,button);requestCardPrice(card,summary)}else card.append(button);
      });
    };
    const list=document.querySelector('.destinations');if(list)new MutationObserver(enhanceCards).observe(list,{childList:true,subtree:true});
    document.addEventListener('click',event=>{const card=event.target.closest('.destination');if(card?.dataset.planDetailReady==='true'&&!event.target.closest('a,button'))card.querySelector('.plan-detail-button')?.click();});
    document.addEventListener('keydown',event=>{const card=event.target.closest('.destination');if(card?.dataset.planDetailReady==='true'&&(event.key==='Enter'||event.key===' ')){event.preventDefault();card.querySelector('.plan-detail-button')?.click();}});
    enhanceCards();
  })();

// Source block 55
/* Swiss public transport uses the national OJP 2.0 token from Open Transport Data. */
  window.addEventListener('load', () => setTimeout(async () => {
    const group=document.querySelector('#duffelTravelData');
    if (!group || document.querySelector('#connectOjp')) return;
    const row=document.createElement('div');row.className='setting-row';
    row.innerHTML='<b>OJP 2.0 路线与时刻<small>查询瑞士火车、巴士、步行衔接与实时公共交通信息。</small></b><span id="ojpStatus">等待 Token</span><button class="text-action" id="connectOjp">连接</button>';
    const fareRow=document.createElement('div');fareRow.className='setting-row';
    fareRow.innerHTML='<b>OJP Fare 火车票价<small>连接单独申请的 Token，用于瑞士公共交通票价查询。</small></b><span id="ojpFareStatus">未连接</span><button class="text-action" id="connectOjpFare">连接</button>';
    const editor=document.createElement('div');editor.className='duffel-editor';editor.id='ojpEditor';editor.hidden=true;
    editor.innerHTML='<label>OJP 2.0 Token<input id="ojpToken" type="password" autocomplete="new-password" placeholder="粘贴 API Manager 提供的 Token"></label><p class="provider-help">Token 只保存在本机钥匙串，不会显示在页面中。</p><p id="ojpError" hidden></p>';
    const fareEditor=document.createElement('div');fareEditor.className='duffel-editor';fareEditor.id='ojpFareEditor';fareEditor.hidden=true;
    fareEditor.innerHTML='<label>OJP Fare Token<input id="ojpFareToken" type="password" autocomplete="new-password" placeholder="粘贴 OJP Fare 产品的 Token"></label><p class="provider-help">票价 Token 与 OJP 2.0 路线 Token 分开保存，不会显示在页面中。</p><p id="ojpFareError" hidden></p>';
    group.append(row,editor,fareRow,fareEditor);
    let keys={};try{keys=(await fetch('/api/bootstrap').then(r=>r.json())).keys||{}}catch{}
    const connectToken=({key,statusId,buttonId,editorId,inputId,errorId,endpoint,label})=>{
      const status=document.querySelector('#'+statusId),button=document.querySelector('#'+buttonId),panel=document.querySelector('#'+editorId),input=document.querySelector('#'+inputId),error=document.querySelector('#'+errorId);
      if(keys[key]){status.textContent='已连接';button.textContent='更新'}
      button.addEventListener('click',async()=>{
        if(panel.hidden){panel.hidden=false;button.textContent='保存 Token';input.focus();return}
        const token=input.value.trim();error.hidden=true;if(token.length<16){error.textContent='请粘贴完整的 '+label+' Token。';error.hidden=false;return}
        button.disabled=true;button.textContent='正在保存…';
        try{const response=await fetch(endpoint,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({token})});const data=await response.json();if(!response.ok)throw new Error(data.error||'无法保存 Token。');status.textContent='已连接';panel.hidden=true;input.value='';button.textContent='更新';note(label+' Token 已安全保存到本机。')}catch(exception){error.textContent='保存失败：'+exception.message;error.hidden=false;button.textContent='保存 Token'}finally{button.disabled=false}
      });
    };
    connectToken({key:'OJP',statusId:'ojpStatus',buttonId:'connectOjp',editorId:'ojpEditor',inputId:'ojpToken',errorId:'ojpError',endpoint:'/api/ojp',label:'OJP 2.0'});
    connectToken({key:'OJPFare',statusId:'ojpFareStatus',buttonId:'connectOjpFare',editorId:'ojpFareEditor',inputId:'ojpFareToken',errorId:'ojpFareError',endpoint:'/api/ojp-fare',label:'OJP Fare'});
  }, 5800));

// Source block 56
/* Drafts live with the local workbench state and remain readable from Settings. */
  window.addEventListener('load',()=>setTimeout(()=>{
    const settings=document.querySelector('#settings .settings');if(!settings||document.querySelector('#draftSettingsGroup'))return;
    const group=document.createElement('div');group.className='setting-group';group.id='draftSettingsGroup';group.innerHTML='<h2>我的计划</h2><p>从这里阅读或继续已保存的旅行方案。</p><div class="draft-settings-list" id="draftSettingsList"><p class="draft-settings-empty">正在读取本机计划…</p></div>';
    const firstGroup=settings.querySelector('.setting-group');if(firstGroup)settings.insertBefore(group,firstGroup);else settings.append(group);
    const list=group.querySelector('#draftSettingsList');
    let confirm=document.querySelector('#planDeleteConfirm');if(!confirm){confirm=document.createElement('section');confirm.id='planDeleteConfirm';confirm.className='plan-confirm';confirm.setAttribute('aria-hidden','true');confirm.innerHTML='<div class="plan-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="planDeleteTitle" aria-describedby="planDeleteDescription"><div class="plan-confirm-icon" aria-hidden="true">×</div><h2 id="planDeleteTitle">确定删除这个计划吗？</h2><p id="planDeleteDescription">删除后，这个计划会从“我的计划”中移除。</p><div class="plan-confirm-actions"><button class="plan-confirm-cancel" type="button">取消</button><button class="plan-confirm-delete" type="button">删除计划</button></div></div>';document.body.append(confirm)}
    let pendingDelete=null,returnFocus=null;const closeConfirm=()=>{confirm.classList.remove('show');confirm.setAttribute('aria-hidden','true');pendingDelete=null;returnFocus?.focus();returnFocus=null};const requestDelete=(action,trigger)=>{pendingDelete=action;returnFocus=trigger;confirm.classList.add('show');confirm.setAttribute('aria-hidden','false');confirm.querySelector('.plan-confirm-cancel').focus()};confirm.querySelector('.plan-confirm-cancel').onclick=closeConfirm;confirm.onclick=event=>{if(event.target===confirm)closeConfirm()};confirm.querySelector('.plan-confirm-delete').onclick=async event=>{event.currentTarget.disabled=true;event.currentTarget.textContent='正在删除…';try{await pendingDelete?.();closeConfirm()}finally{event.currentTarget.disabled=false;event.currentTarget.textContent='删除计划'}};document.addEventListener('keydown',event=>{if(event.key==='Escape'&&confirm.classList.contains('show')){event.stopImmediatePropagation();closeConfirm()}},true);
    const render=async()=>{try{await OffWeGoState.ready;const trips=Array.isArray(OffWeGoState.get().state?.trips)?OffWeGoState.get().state.trips:[];list.innerHTML='';if(!trips.length){list.innerHTML='<p class="draft-settings-empty">'+t('drafts.empty')+'</p>';return}trips.slice().reverse().forEach(trip=>{const item=document.createElement('article');item.className='draft-settings-item';const date=document.createElement('span');date.className='draft-settings-date';const sourceDate=trip.dates||'计划';date.textContent=window.OffWeGoI18n?.getLanguage?.()==='en'?t(sourceDate).replace(/ (\d{4})$/,'\n$1'):sourceDate.replace('2026 年 ','').replace('–','\n至 ');const copy=document.createElement('span');copy.className='draft-settings-copy';const title=document.createElement('b');title.textContent=t(trip.title||'未命名旅行');const meta=document.createElement('small');meta.textContent=t([trip.dates,trip.duration,trip.status||'计划'].filter(Boolean).join(' · '));copy.append(title,meta);const actions=document.createElement('span');actions.className='draft-settings-actions';const open=document.createElement('button');open.type='button';open.className='draft-settings-open';open.textContent=t('copy.open_trip');open.addEventListener('click',()=>{const href=trip.href||'./trip-detail-tabs-v2-design-v2-prototype.html';if(window.OffWeGoPlanNavigation?.openDetailHref)window.OffWeGoPlanNavigation.openDetailHref(href);else location.href=href});const remove=document.createElement('button');remove.type='button';remove.className='draft-settings-delete';remove.textContent=t('common.delete');remove.addEventListener('click',()=>requestDelete(async()=>{await OffWeGoState.patch(current=>({trips:(Array.isArray(current.trips)?current.trips:[]).filter(item=>item.id!==trip.id)}));note(t('copy.trip_deleted'));await render()},remove));actions.append(open,remove);item.append(date,copy,actions);list.append(item)})}catch{list.innerHTML='<p class="draft-settings-empty">'+t('drafts.unavailable')+'</p>'}};
    render();window.addEventListener('offwego:language',render);document.addEventListener('click',event=>{if(event.target.closest('[aria-label="设置"],#profileSettings,#globalSettingsAction'))setTimeout(render,0)});
  },6200));

// Source block 57
/* A detail-page edit reuses the existing Adjust Conditions screen, then returns to the same trip. */
  (async()=>{
    if(new URLSearchParams(location.search).get('editTrip')!=='lugano')return;
    let state;try{await OffWeGoState.ready;state=OffWeGoState.get().state}catch{state={preferences:{},travellers:{},trips:[]}}
    const trip=state.activeTrip?.id==='lugano'?state.activeTrip:{id:'lugano'};
    show('adjust');
    const setValue=(selector,value)=>{const input=document.querySelector(selector);if(input)input.value=value};
    const hasValue=value=>value!==undefined&&value!==null&&value!=='';
    const savedTravellers=state.travellers||{};
    setValue('#adjustIdea',trip.idea||'');
    setValue('#adjustAdults',hasValue(trip.adults)?trip.adults:(hasValue(savedTravellers.adults)?savedTravellers.adults:''));
    setValue('#adjustChildren',hasValue(trip.children)?trip.children:(hasValue(savedTravellers.children)?savedTravellers.children:''));
    setValue('#adjustPets',hasValue(trip.pets)?trip.pets:(hasValue(savedTravellers.pets)?savedTravellers.pets:''));
    setValue('#adjustStart',trip.start||'');setValue('#adjustEnd',trip.end||'');setValue('#adjustDays',hasValue(trip.days)?trip.days:'');
    const selectedDays=Number(trip.days)||0;
    document.querySelectorAll('[data-adjust-days]').forEach(button=>button.classList.toggle('active',selectedDays>0&&Number(button.dataset.adjustDays)===selectedDays));
    document.querySelectorAll('[data-adjust-pace]').forEach(button=>button.classList.toggle('active',Boolean(trip.pace)&&button.dataset.adjustPace===trip.pace));
    const durationNote=document.querySelector('#adjustDurationNote');if(durationNote){durationNote.textContent=selectedDays?t('format.selected_days',{n:selectedDays}):t('copy.no_length_chosen_yet_pick_a_range_or_enter_exact');durationNote.classList.toggle('is-empty',!selectedDays)}
    const applyButton=document.querySelector('#adjustApply');
    const detailButton=document.querySelector('#adjustSaveDetail');
    if(applyButton&&detailButton){
      applyButton.classList.remove('primary');applyButton.classList.add('outline');
      detailButton.classList.remove('outline');detailButton.classList.add('primary');
    }
    const back=document.querySelector('#adjustBack');if(back){back.setAttribute('data-i18n','adjust.back_trip');back.textContent=t('adjust.back_trip');back.onclick=()=>{const href='./trip-detail-tabs-v2-design-v2-prototype.html?source=edit-cancel';if(window.OffWeGoPlanNavigation?.openDetailHref)window.OffWeGoPlanNavigation.openDetailHref(href);else location.href=href}}
  })();

  (() => {
    const detailButton=document.querySelector('#adjustSaveDetail');
    if(!detailButton||detailButton.dataset.bound==='true') return;
    detailButton.dataset.bound='true';
    detailButton.addEventListener('click',async()=>{
      const start=document.querySelector('#adjustStart')?.value||'',end=document.querySelector('#adjustEnd')?.value||'',daysValue=Number(document.querySelector('#adjustDays')?.value)||0;
      const activeTrip={id:'lugano',idea:document.querySelector('#adjustIdea')?.value.trim()||'',start,end,days:daysValue||null,pace:[...document.querySelectorAll('[data-adjust-pace]')].find(button=>button.classList.contains('active'))?.dataset.adjustPace||'',adults:Math.max(1,Number(document.querySelector('#adjustAdults')?.value)||1),children:Math.max(0,Number(document.querySelector('#adjustChildren')?.value)||0),pets:Math.max(0,Number(document.querySelector('#adjustPets')?.value)||0),updatedAt:new Date().toISOString()};
      await OffWeGoState.patch({activeTrip,travellers:{adults:activeTrip.adults,children:activeTrip.children,pets:activeTrip.pets}});
      const href='./trip-detail-tabs-v2-design-v2-prototype.html?source=edit';
      if(window.OffWeGoPlanNavigation?.openDetailHref)window.OffWeGoPlanNavigation.openDetailHref(href);else location.href=href;
    });
  })();

// Source block 59
/* Replace sample cards with fresh, sourced research. Never label an estimate as a live fare.
     Assign the loader immediately so view=results and 更新推荐 can call it before delayed UI inits. */
  (() => {
    const escapeHtml=value=>String(value || '').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
    const selected=selector=>document.querySelector(selector)?.dataset?.[selector.includes('date')?'date':selector.includes('duration')?'duration':'pace'];
    const loadLiveRecommendations=async()=>{
      const list=document.querySelector('.destinations'), heading=document.querySelector('.results h1'), foot=document.querySelector('.results-foot');
      if(!list || !heading || !foot) return;
      const researchPhases=[t('research.phase_prefs'),t('research.phase_compare'),t('research.phase_check')];
      let phase=0, researchTimer;
      heading.textContent=t('research.heading');
      list.innerHTML='<div class="results-loading"><div class="research-loader"><div class="research-loader-top"><div class="research-orbit" aria-hidden="true"></div><div><h2>'+t('research.combining')+'</h2><p id="researchStatus" aria-live="polite">'+researchPhases[0]+'…</p></div></div><div class="research-route" aria-hidden="true"><span class="research-step active">'+t('research.step_prefs')+'</span><span class="research-step">'+t('research.step_compare')+'</span><span class="research-step">'+t('research.step_plan')+'</span></div></div></div>';
      researchTimer=window.setInterval(()=>{phase=(phase+1)%researchPhases.length;const status=document.querySelector('#researchStatus');if(status)status.textContent=researchPhases[phase]+'…';document.querySelectorAll('.research-step').forEach((item,index)=>{item.classList.toggle('active',index===phase);item.classList.toggle('done',index<phase);});},1500);
      foot.innerHTML=t('transport.price_disclaimer');
      try {
        await OffWeGoState.ready;
        const state=OffWeGoState.get().state || {}, preferences=state.preferences || {};
        const locale=window.OffWeGoI18n?.locale?.()||'zh-CN';
        const lang=window.OffWeGoI18n?.getLanguage?.()||'zh';
        const manual=document.querySelector('#manualDates')?.value.trim();
        const resolveDateRange=()=>{
          const hidden=(document.querySelector('#manualDates')?.value||'').match(/(\d{4}-\d{2}-\d{2}).*?(\d{4}-\d{2}-\d{2})/);
          if(hidden) return [hidden[1],hidden[2]];
          const active=document.querySelector('#dates .school-break-card.active');
          const start=active?.querySelector('[data-start]')?.value,end=active?.querySelector('[data-end]')?.value;
          if(start&&end) return [start,end];
          if(Array.isArray(conditions)&&conditions.includes('下一个假期')) return ['2026-10-05','2026-10-17'];
          return null;
        };
        const chosenDateRange=resolveDateRange();window.offWeGoDateRange=resolveDateRange;
        const customDays=document.querySelector('#customDuration')?.value;
        const profile={
          language:lang,
          query:document.querySelector('#queryInput')?.value.trim(),
          origin:preferences.origin,
          date:chosenDateRange?chosenDateRange.join(lang==='en'?' to ':' 至 '):(manual || t(selected('[data-date].active')||'')),
          duration:customDays ? t('format.days',{n:customDays}) : t(selected('[data-duration].active')||''),
          pace:t(selected('[data-pace].active')||''),
          budget:window.currentTripBudget || t('copy.budget_undecided_2'),
          transport:t('research.system_suggests_transport'),
          booking:window.tripBookingPreference || t('research.compare_either'),
          accommodation:window.tripAccommodationPreference || t('research.stay_either'),
          travellers:window.OffWeGoI18n?.format?.family({adults:state.travellers?.adults||0,children:state.travellers?.children||0,pets:state.travellers?.pets||0}) || ''
        };
        const originAirport=/zürich|zurich|苏黎世|kilchberg/i.test(profile.origin || '') ? 'ZRH' : '';
        const dateRange=chosenDateRange?['',...chosenDateRange]:(profile.date || '').match(/(\d{4}-\d{2}-\d{2}).*?(\d{4}-\d{2}-\d{2})/);
        const stayDays=Math.max(1,Number(customDays) || 5);
        const response=await fetch('/api/recommendations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(profile)});
        const data=await response.json();
        if(!response.ok) throw new Error(data.error || t('research.unavailable'));
        window.clearInterval(researchTimer);
        heading.textContent=t('research.found_three');
        list.innerHTML=data.recommendations.map((item,index)=>{
        // TODO: Photo credit, Maps, Flights/Hotels stay nested in the card for now (Lighthouse is clean).
        // If the card itself becomes clickable/selectable, split those controls out of the card's interactive root.
        const attributionText=item.photo?.attribution||'Google Maps';const attributionUrl=item.photo?.attributionUri||item.photo?.sourceUri||'';const attribution=attributionUrl?'<a target="_blank" rel="noreferrer" href="'+escapeHtml(attributionUrl)+'">'+t('research.photo_credit',{name:escapeHtml(attributionText)})+'</a>':t('research.photo_credit',{name:escapeHtml(attributionText)});const photo=item.photo?.url?'<div class="live-photo"><img src="'+escapeHtml(item.photo.url)+'" alt="'+escapeHtml(item.destination)+'"><span class="live-photo-attribution">'+attribution+'</span></div>':'';const nearby=/卢加诺|lugano|米兰|milano|colmar|科尔马/i.test(item.destination);const byTrain=item.transportMode==='train'||(!item.transportMode&&nearby);const canCompare=Boolean(originAirport&&dateRange&&item.airportCode&&!byTrain);const label=canCompare?t('research.lowest_fare'):t('research.need_window');const routeNote=escapeHtml(item.transportNote || (byTrain?t('research.train_from_zurich'):t('research.compare_round_trip')));const mapsHref='https://www.google.com/maps/dir/?api=1&origin=Z%C3%BCrich&destination='+encodeURIComponent(item.destination)+'&travelmode=transit';const mapsLink=window.OffWeGoUi.googleMapsLinkHtml({href:mapsHref,extraClass:'maps-transit-link'});const transport=byTrain?'<p class="live-card-price">'+t('research.train_travel',{note:routeNote})+'</p>'+mapsLink:'<p class="live-card-price">'+t('research.flight_price',{note:routeNote})+'</p><button class="outline flight-window-button" type="button" data-airport="'+escapeHtml(item.airportCode)+'" '+(canCompare?'':'disabled')+'>'+label+'</button>';const comparison='<details class="live-card-details"><summary>'+t('research.view_transport_stay')+'</summary><p class="comparison-copy">'+t('research.ai_stays_disclaimer')+'</p><div class="comparison-links"><button type="button" class="hotel-research-button" data-destination="'+escapeHtml(item.destination)+'">'+t('research.ai_stays_action')+'</button><a target="_blank" rel="noreferrer" href="https://www.google.com/travel/flights?q='+encodeURIComponent((profile.origin||'Zürich')+' to '+item.destination)+'">Google Flights</a><a target="_blank" rel="noreferrer" href="https://www.google.com/travel/hotels?q='+encodeURIComponent(item.destination)+'">Google Hotels</a></div><p class="hotel-research-output" aria-live="polite"></p></details>';return '<article class="destination '+(index===0?'selected':'')+'">'+photo+'<span class="live-card-label">'+t('research.live_label')+'</span><div class="dest-copy"><h2>'+escapeHtml(t(item.destination))+'</h2><p>'+escapeHtml(t(item.reason))+'</p></div><p class="live-card-note">'+escapeHtml(t(item.note))+'</p>'+transport+comparison+'<p class="flight-window-result" aria-live="polite"></p></article>';}).join('');
        list.querySelectorAll('button.flight-window-button:not([disabled])').forEach(button=>button.addEventListener('click',async()=>{const output=button.closest('.destination')?.querySelector('.flight-window-result');if(!output)return;const totalDays=Math.round((new Date(dateRange[2])-new Date(dateRange[1]))/86400000)+1;const combinations=Math.max(0,totalDays-stayDays+1);button.disabled=true;button.textContent=t('research.comparing_combos',{count:combinations,days:stayDays});try{const response=await fetch('/api/flights/window',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({originLocationCode:originAirport,destinationLocationCode:button.dataset.airport,startDate:dateRange[1],endDate:dateRange[2],stayDays,adults:state.travellers?.adults||1,children:state.travellers?.children||0})}),flight=await response.json();if(!response.ok)throw new Error(flight.error || t('research.flight_unavailable'));const lowest=flight.recommended||flight.lowest;if(!lowest)throw new Error(t('research.flight_unavailable'));const dateFmt=value=>window.OffWeGoI18n?.format?.date(value,{month:'short',day:'numeric'})||value;output.innerHTML='<b>'+t('research.recommend_window',{days:stayDays,start:escapeHtml(dateFmt(lowest.departureDate)),end:escapeHtml(dateFmt(lowest.returnDate))})+'</b> · '+t('research.lowest_return',{currency:escapeHtml(lowest.currency),amount:escapeHtml(window.OffWeGoI18n?.format?.number(lowest.amount)||String(lowest.amount))})+(lowest.airline?' · '+escapeHtml(lowest.airline):'')+' · '+t('research.compared_dates',{n:flight.checkedDates});button.textContent=t('research.see_flights');button.disabled=false;}catch(error){output.textContent=t(error.message)||t('research.flight_unavailable');button.textContent=t('research.retry_lowest');button.disabled=false;}}));
        list.querySelectorAll('.hotel-research-button').forEach(button=>button.addEventListener('click',async()=>{const output=button.closest('.live-card-details').querySelector('.hotel-research-output');button.disabled=true;button.textContent=t('research.researching_stays');try{const response=await fetch('/api/hotel-research',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({destination:button.dataset.destination,dates:profile.date,travellers:profile.travellers,accommodation:profile.accommodation})}),reference=await response.json();if(!response.ok)throw new Error(reference.error || t('research.stay_unavailable'));const links=(reference.sources||[]).map((url,index)=>'<a target="_blank" rel="noreferrer" href="'+escapeHtml(url)+'">'+t('research.source_n',{n:index+1})+'</a>').join(' · ');output.innerHTML='<b>'+escapeHtml(t(reference.provider || 'research.ai_stays'))+'</b><br>'+escapeHtml(reference.text)+(links?'<br>'+links:'');button.textContent=t('research.retry_stays');}catch(error){output.textContent=t(error.message)||t('research.stay_unavailable');button.textContent=t('research.retry_stays');}finally{button.disabled=false;}}));
        const when=new Date(data.generatedAt).toLocaleTimeString(locale,{hour:'2-digit',minute:'2-digit'});
        foot.innerHTML='<span class="results-source">'+t('research.updated_at',{source:escapeHtml(t(data.source || 'research.live_research')),time:when})+'</span>';
      } catch (error) {
        window.clearInterval(researchTimer);
        const offline=location.protocol==='file:'||/离线 HTML|offline HTML|file:|local protocol/i.test(String(error.message||''));
        heading.textContent=t(offline?'research.offline_heading':'research.cannot_load_live');
        list.innerHTML=offline
          ?'<div class="results-error"><b>'+t('research.offline_title')+'</b>'+t('research.offline_body')+'<details class="provider-error"><summary>'+t('research.view_error')+'</summary><code>'+escapeHtml(t(error.message) || t('research.no_detail'))+'</code></details></div>'
          :'<div class="results-error"><b>'+t('research.gemini_failed')+'</b>'+t('research.no_quota_guess')+'<details class="provider-error"><summary>'+t('research.view_error')+'</summary><code>'+escapeHtml(t(error.message) || t('research.no_detail'))+'</code></details></div>';
        foot.innerHTML='<button class="outline" id="retryLiveResults" type="button">'+t('research.retry_live')+'</button>';
        document.querySelector('#retryLiveResults').onclick=loadLiveRecommendations;
      }
    };
    window.addEventListener('offwego:language',()=>{
      if(document.querySelector('.destinations .destination,.results-error,.results-loading')) window.loadLiveRecommendations?.();
    });
    window.loadLiveRecommendations=loadLiveRecommendations;
  })();
