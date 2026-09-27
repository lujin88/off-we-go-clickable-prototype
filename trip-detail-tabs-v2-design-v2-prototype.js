// Source block 1
const t=(key,vars)=>window.OffWeGoI18n?.t(key,vars)??key;
const emergencyLabels=['emergency.eu','copy.police','copy.fire','emergency.medical','emergency.poison'];
    const emergencyCard=document.querySelector('#emergencyCard')||[...document.querySelectorAll('.placeholder article')].find(card=>/紧急电话|Emergency numbers/.test(card.querySelector('b')?.textContent||''));
    const paintEmergency=()=>{
      if(!emergencyCard)return;
      emergencyCard.querySelectorAll('.number-list span').forEach((label,index)=>label.textContent=t(emergencyLabels[index]));
      const explainer=emergencyCard.querySelector('p');
      explainer.className='emergency-explainer';
      explainer.textContent=t('emergency.explainer');
    };
    paintEmergency();
    window.addEventListener('offwego:language',paintEmergency);
    const tabs=[...document.querySelectorAll('[data-page]')];
    tabs.forEach(tab=>tab.addEventListener('click',()=>{tabs.forEach(item=>{const on=item===tab;item.classList.toggle('active',on);item.setAttribute('aria-selected',on?'true':'false');item.tabIndex=on?0:-1});document.querySelectorAll('.page').forEach(page=>page.classList.toggle('active',page.id===tab.dataset.page))}));
    tabs.forEach(tab=>{if(!tab.classList.contains('active'))tab.tabIndex=-1;});
    const rentalTab=document.querySelector('#rentalTab'),rentalPage=document.querySelector('#rental'),budgetRentalRow=document.querySelector('.budget-rental-row');
    const rentalPreference=localStorage.getItem('offwegoCarRental')||'no';
    const renderRental=(daysValue=localStorage.getItem('offwegoRentalDays')||5)=>{const days=Math.max(1,Math.min(30,Number(String(daysValue).match(/\d+/)?.[0])||5)),daily=95,total=days*daily;const from=t('stay.from_price',{price:'CHF '+total.toLocaleString('de-CH')});rentalTab.hidden=rentalPreference!=='yes';rentalPage.hidden=rentalPreference!=='yes';budgetRentalRow.hidden=rentalPreference!=='yes';if(rentalPreference!=='yes')return;document.querySelector('#rentalEstimate').textContent=from;document.querySelector('#rentalDays').textContent=t('format.days',{n:days});document.querySelector('#rentalEstimateDetail').textContent=t('按 '+days+' 天 × CHF '+daily+' / 天估算，含基础租金参考，不含保险升级、儿童座椅、燃油、停车与异地还车费。');document.querySelector('#budgetRentalTotal').textContent=from;document.querySelector('#budgetRentalDescription').textContent=t('按 '+days+' 天估算；保险、燃油、停车和附加设备另计。');const query=['Lugano car rental',days+' days','family car'].join(' ');document.querySelector('#rentalGoogleLink').href='https://www.google.com/search?q='+encodeURIComponent(query)};
    renderRental();
    window.addEventListener('offwego:language',()=>renderRental());
    document.querySelector('.budget-rental-link')?.addEventListener('click',event=>{event.preventDefault();rentalTab.click();history.replaceState(null,'','#rental');requestAnimationFrame(()=>rentalPage.scrollIntoView({behavior:'smooth',block:'start'}))});
    document.querySelector('.budget-stay-link').addEventListener('click',event=>{event.preventDefault();const stayTab=tabs.find(tab=>tab.dataset.page==='stay');stayTab.click();history.replaceState(null,'','#stay');requestAnimationFrame(()=>document.querySelector('#stay').scrollIntoView({behavior:'smooth',block:'start'}))});
    document.querySelectorAll('.day-summary').forEach(button=>button.addEventListener('click',()=>{const day=button.closest('.day'),open=!day.classList.contains('active');document.querySelectorAll('.day').forEach(item=>{item.classList.remove('active');item.querySelector('.day-summary')?.setAttribute('aria-expanded','false');item.querySelector('.chevron').textContent='⌄'});if(open){day.classList.add('active');button.setAttribute('aria-expanded','true');day.querySelector('.chevron').textContent='⌃'}}));
    const settingsPanel=document.querySelector('#settingsPanel');
    const deleteConfirm=document.querySelector('#deleteConfirm');let confirmDeleteAction=null,confirmReturnFocus=null;
    const closeDeleteConfirm=()=>{deleteConfirm.classList.remove('show');deleteConfirm.setAttribute('aria-hidden','true');confirmDeleteAction=null;confirmReturnFocus?.focus();confirmReturnFocus=null};
    const requestDelete=(action,trigger)=>{confirmDeleteAction=action;confirmReturnFocus=trigger;deleteConfirm.classList.add('show');deleteConfirm.setAttribute('aria-hidden','false');deleteConfirm.querySelector('.confirm-cancel').focus()};
    deleteConfirm.querySelector('.confirm-cancel').addEventListener('click',closeDeleteConfirm);deleteConfirm.querySelector('.confirm-delete').addEventListener('click',async()=>{const action=confirmDeleteAction;deleteConfirm.querySelector('.confirm-delete').textContent=t('正在删除…');deleteConfirm.querySelector('.confirm-delete').disabled=true;try{await action?.();closeDeleteConfirm()}finally{deleteConfirm.querySelector('.confirm-delete').textContent=t('删除计划');deleteConfirm.querySelector('.confirm-delete').disabled=false}});deleteConfirm.addEventListener('click',event=>{if(event.target===deleteConfirm)closeDeleteConfirm()});
    document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(deleteConfirm.classList.contains('show')){closeDeleteConfirm();return}if(document.querySelector('#sharePanel')?.classList.contains('show'))document.querySelector('.share-cancel')?.click();});
    const snackbar=document.querySelector('#planSnackbar');let snackbarTimer;
    const showSnackbar=(message,duration=3200)=>{clearTimeout(snackbarTimer);snackbar.textContent=message;snackbar.classList.remove('show');requestAnimationFrame(()=>requestAnimationFrame(()=>snackbar.classList.add('show')));snackbarTimer=setTimeout(()=>snackbar.classList.remove('show'),duration)};
    window.OffWeGoDetailSettings.init({notify:showSnackbar});
    const draftButton=document.querySelector('.save');let draftSaved=false;
    const renderDraftState=saved=>{draftSaved=saved;draftButton.querySelector('.action-label').textContent=t(saved?'移除计划':'添加计划');const heart=draftButton.querySelector('i');heart.className=saved?'ri-heart-fill':'ri-heart-line';heart.setAttribute('aria-hidden','true');draftButton.classList.toggle('is-saved',saved);draftButton.setAttribute('aria-pressed',saved?'true':'false')};
    const updateDraftState=async saved=>{renderDraftState(saved);try{const draft={id:'lugano-2026-10-05',title:'卢加诺，瑞士',dates:'2026 年 10 月 5–9 日',duration:'5 天',status:'计划',updatedAt:new Date().toISOString(),href:'./trip-detail-tabs-v2-design-v2-prototype.html'};await OffWeGoState.patch(current=>{const trips=Array.isArray(current.trips)?current.trips:[];return {trips:saved?[...trips.filter(trip=>trip.id!==draft.id),draft]:trips.filter(trip=>trip.id!==draft.id)};})}catch{}};
    draftButton.addEventListener('click',async()=>{const label=draftButton.querySelector('.action-label');if(!draftSaved){await updateDraftState(true);label.textContent=t('已添加计划');draftButton.classList.remove('heart-pop');void draftButton.offsetWidth;draftButton.classList.add('heart-pop');showSnackbar(t('已添加到计划，可稍后从主页继续查看。'),3800);setTimeout(()=>{renderDraftState(true);draftButton.classList.remove('heart-pop')},1400);return}requestDelete(async()=>{await updateDraftState(false);label.textContent=t('已删除');showSnackbar(t('计划已删除。'),2400);setTimeout(()=>renderDraftState(false),1400)},draftButton)});
    OffWeGoState.ready.then(()=>renderDraftState((OffWeGoState.get().state?.trips||[]).some(trip=>trip.id==='lugano-2026-10-05'))).catch(()=>renderDraftState(false));
    window.addEventListener('offwego:language',()=>renderDraftState(draftSaved));
    const sharePanel=document.querySelector('#sharePanel'),shareButton=document.querySelector('.share'),shareDayField=sharePanel.querySelector('.share-day-field'),shareDaySelect=sharePanel.querySelector('#shareDaySelect'),shareStatus=sharePanel.querySelector('.share-status');
    const shareDays=()=>[...document.querySelectorAll('#journey .day')].filter(day=>!day.hidden);
    const syncShareChoices=()=>{const days=shareDays();shareDaySelect.innerHTML=days.map((day,index)=>'<option value="'+index+'">'+t('第 '+(index+1)+' 天')+' · '+(day.querySelector('h3')?.textContent||t('行程'))+'</option>').join('');const oneDay=sharePanel.querySelector('[name="shareScope"]:checked')?.value==='day';shareDayField.hidden=!oneDay};
    const openShare=()=>{syncShareChoices();const destination=document.querySelector('.hero h1')?.textContent||t('旅行计划'),summary=document.querySelector('.trip-summary')?.textContent||'',travellers=document.querySelector('.traveller-summary-text')?.textContent||'';sharePanel.querySelector('.share-preview b').textContent=destination+'｜'+t('行程分享');sharePanel.querySelector('.share-preview p').textContent=[summary,travellers].filter(Boolean).join(' · ');shareStatus.textContent=t('将生成 PNG 图片并复制到剪贴板。');sharePanel.classList.add('show');sharePanel.setAttribute('aria-hidden','false');sharePanel.querySelector('.share-close').focus()};
    const closeShare=()=>{sharePanel.classList.remove('show');sharePanel.setAttribute('aria-hidden','true');shareButton.focus()};
    shareButton.addEventListener('click',openShare);sharePanel.querySelectorAll('[name="shareScope"]').forEach(input=>input.addEventListener('change',syncShareChoices));sharePanel.querySelector('.share-close').addEventListener('click',closeShare);sharePanel.querySelector('.share-cancel').addEventListener('click',closeShare);sharePanel.addEventListener('click',event=>{if(event.target===sharePanel)closeShare()});
    const wrapCanvasText=(ctx,text,x,y,maxWidth,lineHeight)=>{const chars=[...String(text||'')];let line='';chars.forEach(char=>{if(ctx.measureText(line+char).width>maxWidth&&line){ctx.fillText(line,x,y);line=char;y+=lineHeight}else line+=char});if(line)ctx.fillText(line,x,y);return y+lineHeight};
    const buildSharePng=()=>{const canvas=document.createElement('canvas');canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext('2d');ctx.fillStyle='#f5f8fd';ctx.fillRect(0,0,1080,1350);ctx.fillStyle='#145ce6';ctx.fillRect(0,0,1080,190);ctx.fillStyle='#fff';ctx.font='700 34px sans-serif';ctx.fillText('OFF WE GO',64,75);ctx.font='800 56px sans-serif';ctx.fillText(document.querySelector('.hero h1')?.textContent||'旅行计划',64,150);ctx.fillStyle='#10244b';ctx.font='700 27px sans-serif';ctx.fillText((document.querySelector('.trip-summary')?.textContent||'')+' · '+(document.querySelector('.traveller-summary-text')?.textContent||''),64,245);ctx.strokeStyle='#dce6f2';ctx.beginPath();ctx.moveTo(64,280);ctx.lineTo(1016,280);ctx.stroke();const all=sharePanel.querySelector('[name="shareScope"]:checked')?.value==='all';const days=shareDays(),selected=all?days:[days[Number(shareDaySelect.value)||0]].filter(Boolean);let y=340;selected.forEach((day,index)=>{ctx.fillStyle='#145ce6';ctx.beginPath();ctx.roundRect(64,y-40,82,82,20);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 30px sans-serif';ctx.fillText('第'+(all?index+1:Number(shareDaySelect.value)+1)+'天',75,y+10);ctx.fillStyle='#10244b';ctx.font='800 31px sans-serif';y=wrapCanvasText(ctx,day.querySelector('h3')?.textContent||'',170,y-10,820,42);ctx.fillStyle='#667894';ctx.font='400 23px sans-serif';y=wrapCanvasText(ctx,day.querySelector('.day-summary p')?.textContent||'',170,y+2,820,34)+34;ctx.strokeStyle='#dce6f2';ctx.beginPath();ctx.moveTo(64,y);ctx.lineTo(1016,y);ctx.stroke();y+=64});ctx.fillStyle='#667894';ctx.font='400 21px sans-serif';ctx.fillText('具体安排以出发前最新信息为准',64,1290);return new Promise(resolve=>canvas.toBlob(resolve,'image/png'))};
    sharePanel.querySelector('.share-copy').addEventListener('click',async event=>{const button=event.currentTarget,original=button.innerHTML;button.disabled=true;button.innerHTML='<i class="ri-loader-4-line" aria-hidden="true"></i> '+t('正在生成…');shareStatus.textContent=t('正在生成 PNG 图片…');try{const blob=await buildSharePng();if(!blob)throw new Error(t('图片生成失败'));if(navigator.clipboard?.write&&window.ClipboardItem){await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);shareStatus.textContent=t('图片已复制，可以直接粘贴到微信或其他程序。');button.innerHTML='<i class="ri-check-line" aria-hidden="true"></i> '+t('已复制');showSnackbar(t('PNG 行程图片已复制到剪贴板。'),3200)}else{const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=t('行程分享.png');link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);shareStatus.textContent=t('浏览器不支持图片剪贴板，已为你下载 PNG。');button.innerHTML='<i class="ri-download-line" aria-hidden="true"></i> '+t('已下载')}}catch{shareStatus.textContent=t('浏览器没有允许复制图片，已改为下载。');const blob=await buildSharePng(),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=t('行程分享.png');link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);button.innerHTML='<i class="ri-download-line" aria-hidden="true"></i> '+t('已下载')}finally{button.disabled=false;setTimeout(()=>button.innerHTML=original,2200)}});
    document.querySelector('.meta-edit').addEventListener('click',()=>{location.href=location.protocol==='file:'?'http://127.0.0.1:4173/?editTrip=lugano':'./?editTrip=lugano'});
    (async()=>{try{const trip=(await OffWeGoState.ready).state?.activeTrip;if(!trip||trip.id!=='lugano')return;const formatDate=value=>{const date=new Date(value+'T12:00:00');return t((date.getMonth()+1)+' 月 '+date.getDate()+' 日')};const range=trip.start&&trip.end?formatDate(trip.start)+'–'+formatDate(trip.end):t('日期待定');document.querySelector('.hero .eyebrow').textContent=t('苏黎世秋季假期 · '+range);const people=[trip.adults?t(trip.adults+' 位成人'):'',trip.children?t(trip.children+' 位孩子'):'',trip.pets?t(trip.pets+' 只宠物'):''].filter(Boolean),rawDays=String(trip.days||5).replace(/\s*天$/,'').replace(/[–—]/g,'-').trim(),dayRange=rawDays.match(/^(\d+)\s*-\s*(\d+)$/),dayLabel=dayRange?t(dayRange[1]+'–'+dayRange[2]+' 天'):t((rawDays.match(/\d+/)?.[0]||5)+' 天'),pace=t(String(trip.pace||'轻松').replace(/节奏/g,'').trim()||'轻松'),budget=String(trip.budget||'').replace(/（/g,'(').replace(/）/g,')');renderRental(rawDays);document.querySelector('.trip-summary').textContent=[t('秋假'),dayLabel,pace,t(budget)].filter(Boolean).join(' · ');document.querySelector('.traveller-summary-text').textContent=people.join(' · ');const peopleText=people.join(t('与 '));const preview=sharePanel.querySelector('.share-preview');preview.querySelector('b').textContent=t('卢加诺，瑞士')+'｜'+dayLabel+t('亲子')+pace+t('行程');preview.querySelector('p').textContent=range+' · '+peopleText+' · '+pace+t('节奏')}catch{}})();
    document.querySelectorAll('.icon-add').forEach(button=>button.addEventListener('click',event=>{const select=event.currentTarget.nextElementSibling,date=select.options[select.selectedIndex].text;event.currentTarget.textContent='✓';event.currentTarget.setAttribute('aria-label',t('已加入 '+date));select.setAttribute('aria-label',t('已加入 '+date));setTimeout(()=>{event.currentTarget.textContent='+';event.currentTarget.setAttribute('aria-label',t('加入行程'))},1400)}));
    const stayGalleryItems=[
      {src:'./hotel-de-la-paix-lugano.png',alt:t('Hotel De La Paix 酒店外观与卢加诺湖景')},
      {src:'./hotel-de-la-paix-room.png',alt:t('适合家庭入住的湖景客房')},
      {src:'./hotel-de-la-paix-terrace.png',alt:t('面向卢加诺湖的早餐露台')},
      {src:'./hotel-de-la-paix-lobby.png',alt:t('Hotel De La Paix 酒店大堂')}
    ];
    const stayGallery=document.querySelector('.stay-gallery'),stayGalleryImage=document.querySelector('#stayGalleryImage'),stayGalleryCount=document.querySelector('.stay-gallery-count'),stayThumbs=[...document.querySelectorAll('.stay-thumb')];let stayGalleryIndex=0,stayTouchStartX=0;
    const showStayGalleryImage=index=>{stayGalleryIndex=(index+stayGalleryItems.length)%stayGalleryItems.length;const item=stayGalleryItems[stayGalleryIndex];stayGalleryImage.classList.add('is-fading');window.setTimeout(()=>{stayGalleryImage.src=item.src;stayGalleryImage.alt=item.alt;stayGalleryCount.textContent=(stayGalleryIndex+1)+' / '+stayGalleryItems.length;stayThumbs.forEach((thumb,thumbIndex)=>{thumb.classList.toggle('active',thumbIndex===stayGalleryIndex);thumb.setAttribute('aria-current',thumbIndex===stayGalleryIndex?'true':'false')});stayGalleryImage.classList.remove('is-fading')},180)};
    stayGallery.tabIndex=0;stayGallery.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'){event.preventDefault();showStayGalleryImage(stayGalleryIndex-1)}if(event.key==='ArrowRight'){event.preventDefault();showStayGalleryImage(stayGalleryIndex+1)}});stayGallery.addEventListener('touchstart',event=>{stayTouchStartX=event.changedTouches[0].clientX},{passive:true});stayGallery.addEventListener('touchend',event=>{const distance=event.changedTouches[0].clientX-stayTouchStartX;if(Math.abs(distance)>42)showStayGalleryImage(stayGalleryIndex+(distance<0?1:-1))},{passive:true});document.querySelector('.stay-gallery-prev').addEventListener('click',()=>showStayGalleryImage(stayGalleryIndex-1));document.querySelector('.stay-gallery-next').addEventListener('click',()=>showStayGalleryImage(stayGalleryIndex+1));stayThumbs.forEach((thumb,index)=>thumb.addEventListener('click',()=>showStayGalleryImage(index)));showStayGalleryImage(0);
    const bookingLink=document.querySelector('#bookingLink');bookingLink.innerHTML=t('copy.booking_reviews')+' <i class="ri-external-link-line" aria-hidden="true"></i>';
    const reviewLinks=document.createElement('div');reviewLinks.className='review-links';
    const hotelMapLink=document.createElement('div');
    hotelMapLink.innerHTML=(window.OffWeGoUi?.googleMapsLinkHtml?.({href:'#',extraClass:'booking-link'}))||('<a class="booking-link google-map-link" href="#" target="_blank" rel="noreferrer">'+t('copy.google_maps')+' <i class="ri-external-link-line" aria-hidden="true"></i></a>');
    const hotelMapAnchor=hotelMapLink.firstElementChild;
    hotelMapAnchor.id='hotelMapLink';
    document.querySelector('#stay .stay-main-content .stay-footer')?.after(reviewLinks);reviewLinks.append(hotelMapAnchor,bookingLink);
    const railReviewLinks=[...document.querySelectorAll('.stay-card .stay-links a')];railReviewLinks.forEach(link=>{link.target='_blank';link.rel='noreferrer'});
    const updateReviewLinks=hotel=>{const maps='https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(hotel);const booking='https://www.booking.com/searchresults.zh-cn.html?ss='+encodeURIComponent(hotel);hotelMapAnchor.href=maps;bookingLink.href=booking;if(railReviewLinks[0])railReviewLinks[0].href=maps;if(railReviewLinks[1])railReviewLinks[1].href=booking};
    updateReviewLinks('Hotel De La Paix, Lugano');
    const stayCandidates=[
      {name:'Hotel De La Paix',nightly:t("2 间房 · CHF 380 / 晚起"),total:"CHF 1'900",description:t('抵达日可由火车站接巴士，先安顿行李，再步行去湖边与晚餐。'),rail:t('车站可接巴士，适合抵达日减少拖行李。'),booking:'Hotel De La Paix, Lugano'},
      {name:'Hotel Delfino',nightly:t('2 间房 · CHF 350 / 晚起'),total:"CHF 1'750",description:t('同在 Paradiso 一带，适合作为家庭房与早餐选项的第二个静态候选。'),rail:t('同一区域的替代候选，便于比较房型与早餐。'),booking:'Hotel Delfino, Lugano'}
    ];
    let stayIndex=0;
    document.querySelector('.swap').addEventListener('click',event=>{
      stayIndex=(stayIndex+1)%stayCandidates.length;
      const stay=stayCandidates[stayIndex];
      document.querySelector('#stayHotelName').textContent=stay.name;
      document.querySelector('#stayHotelDescription').textContent=stay.description;
      document.querySelector('#stayNightly').textContent=stay.nightly;
      document.querySelector('#stayFiveNights').textContent=t('5 晚约 '+stay.total);
      updateReviewLinks(stay.booking);
      document.querySelector('#pricedTotal').textContent=t(stay.total+' 起');
      document.querySelector('#budgetStayTotal').textContent=stay.total;
      document.querySelector('#budgetStayDescription').textContent=t(stay.name+' · 两间房合计，5 晚约 '+stay.total+'。');
      document.querySelector('#railHotelName').textContent=stay.name;
      document.querySelector('#railHotelReason').textContent=stay.rail;
      document.querySelector('#dayOneHotelRoute').textContent=t('Lugano 站 → '+stay.name+'：巴士约 10–15 分钟；湖边步行约 5–8 分钟。');
      event.currentTarget.classList.add('rolling');
      event.currentTarget.setAttribute('aria-label',t('已切换至 '+stay.name+'；再按可换一家'));
      setTimeout(()=>event.currentTarget.classList.remove('rolling'),460);
    });

// Source block 2
(()=>{
      document.querySelector('#shopping .section-head>p').textContent=t('先选择日期，再加入');
      const homeUrl=location.protocol==='file:'?'http://127.0.0.1:4173/':new URL('./',location.href).href;
      const mark=document.querySelector('.mark');
      const back=document.querySelector('.back-recommendations');
      if(mark)mark.href=homeUrl;
      if(back)back.href=homeUrl+'?view=results';
    })();
