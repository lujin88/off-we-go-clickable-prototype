(() => {
  const t = (key, vars) => window.OffWeGoI18n?.t(key, vars) ?? key;
  const STORAGE_KEY = 'offwego:selectedPlan';
  const escapeHtml = value => window.OffWeGoUi?.escapeHtml?.(value) || String(value ?? '').replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
  const googleMapsLink = (href, extraClass = '') => window.OffWeGoUi?.googleMapsLinkHtml?.({ href, extraClass })
    || `<a class="google-map-link${extraClass ? ` ${extraClass}` : ''}" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${t('copy.google_maps')} <i class="ri-external-link-line" aria-hidden="true"></i></a>`;
  const externalLink = (href, label, extraClass = 'external-link') => window.OffWeGoUi?.externalLinkHtml?.({ href, label, className: extraClass })
    || `<a class="${extraClass}" href="${escapeHtml(href)}" target="_blank" rel="noreferrer">${escapeHtml(label)} <i class="ri-external-link-line" aria-hidden="true"></i></a>`;
  const readSelectedPlan = () => { try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null'); } catch { return null; } };
  const normalizeTravellers = value => t(String(value || t('nav.travellers_pending')).replace(/^同行人\s*/u, '').replace(/成年人/g, '成人').replace(/\s+/g, ' ').trim());
  const setText = (selector, value) => { const node = document.querySelector(selector); if (node && value) node.textContent = value; };
  const parseDayCount = value => window.OffWeGoDuration?.parseDayCount(value, 5) || 5;
  const money = (amount, currency, digits = 2) => window.OffWeGoI18n?.format?.money(amount, currency, { digits }) || `${currency || ''} ${Number(amount)}`.trim();
  const apiText = (value, fallback) => t(value || fallback);
  const localTime = value => value ? new Intl.DateTimeFormat(window.OffWeGoI18n?.locale?.() || 'zh-CN',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Europe/Zurich'}).format(new Date(value)) : t('time.pending');
  const durationText = value => {
    const match=String(value || '').match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
    if (!match) return value || t('time.duration_pending');
    const hours=Number(match[1] || 0), minutes=Number(match[2] || 0) + Math.round(Number(match[3] || 0) / 60);
    return [hours ? t('format.hours', { n: hours }) : '', minutes ? t('format.minutes', { n: minutes }) : ''].filter(Boolean).join(' ') || t('time.under_minute');
  };
  const departureIso = plan => {
    const date=String(plan.dates || plan.dateContext || '').match(/20\d{2}-\d{2}-\d{2}/)?.[0];
    return `${date || new Date(Date.now()+86400000).toISOString().slice(0,10)}T07:00:00Z`;
  };

  async function renderTransportQuote(card, plan) {
    if (!card) return;
    const destination=plan.destination;
    card.innerHTML = `<div class="transport-label">${t('transport.matched')}</div><h2>${t('transport.querying_trains', { destination: escapeHtml(destination) })}</h2><p class="api-note">${t('transport.ojp_note')}</p>`;
    try {
      const response=await fetch('/api/journey-quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin:plan.origin || 'Zürich HB',destination,departureTime:departureIso(plan)})});
      const quote=await response.json(); if (!response.ok) throw new Error(quote.error || t('transport.unavailable'));
      const transfer=quote.transfers == null ? t('transport.transfers_detail') : quote.transfers === 0 ? t('copy.direct') : t('format.transfers', { n: quote.transfers });
      const priced=quote.fare || quote.fareReference;
      const fare=priced ? money(priced.amount, priced.currency) : t('transport.no_public_fare');
      const checked=quote.fareReference?.checkedAt ? ` · ${t('transport.checked_at', { time: escapeHtml(quote.fareReference.checkedAt) })}` : '';
      const reference=quote.fareReference ? `<div class="api-note fare-disclaimer">${t('transport.google_checked', { checked })}${quote.fareReference.sourceUrl ? ` <a href="${escapeHtml(quote.fareReference.sourceUrl)}" target="_blank" rel="noreferrer">${t('transport.view_fare_source')} <i class="ri-external-link-line" aria-hidden="true"></i></a>` : ''}</div>` : '';
      card.innerHTML = `<div class="transport-label">${t('transport.matched_source', { source: escapeHtml(quote.source) })}</div><h2>${escapeHtml(quote.origin)} → ${escapeHtml(quote.destination)}</h2><div class="time-row"><div><strong>${localTime(quote.departureTime)}</strong><span> ${t('common.depart')}</span></div><span class="arrow">→</span><div><strong>${localTime(quote.arrivalTime)}</strong><span> ${t('common.arrive')}</span></div></div><div class="facts"><span>${escapeHtml(transfer)}</span><span>${escapeHtml(durationText(quote.duration))}</span><span>${t('transport.for_selected_day')}</span></div><div class="price-line"><b>${escapeHtml(fare)}</b><small>${escapeHtml(apiText(quote.fareReference?.label || quote.fareNote, ''))}</small></div>${reference}${quote.notice ? `<div class="api-note">${escapeHtml(apiText(quote.notice))}</div>` : ''}`;
    } catch (error) {
      card.innerHTML = `<div class="transport-label">${t('transport.matched')}</div><h2>${escapeHtml(plan.transport || t('transport.trains_pending'))}</h2><div class="price-line"><b>${t('transport.query_incomplete')}</b><small>${escapeHtml(apiText(error.message, t('transport.service_unavailable')))}</small></div><div class="api-note">${t('transport.reconnect_note')}</div>`;
    }
  }

  const airportFor = (destination, supplied='') => supplied || (/tenerife|特内里费/i.test(destination) ? 'TFS' : /paris|巴黎/i.test(destination) ? 'CDG' : /mallorca|马略卡/i.test(destination) ? 'PMI' : /milan|milano|米兰/i.test(destination) ? 'MXP' : '');
  const tripDates = plan => String(plan.dates || '').match(/(20\d{2}-\d{2}-\d{2}).*?(20\d{2}-\d{2}-\d{2})/);
  async function renderFlightQuote(card, plan, origin) {
    if (!card) return;
    const airport=airportFor(plan.destination,plan.airportCode), dates=tripDates(plan);
    card.innerHTML=`<div class="transport-choice-head"><span class="transport-mode-icon"><i class="ri-plane-line" aria-hidden="true"></i></span><div><div class="transport-label">${t('transport.recommend_flight')}</div><h2>${escapeHtml(origin)} → ${escapeHtml(plan.destination)}</h2></div></div><div class="transport-status">${t('transport.comparing_flights')}</div><div class="price-line"><b>${t('common.verifying')}</b><small>${t('transport.return_all')}</small></div><div class="api-note">${t('transport.price_disclaimer')}</div>`;
    try {
      let priced=null, label='', sourceUrl='';
      if (airport && dates) {
        const state=(await OffWeGoState.ready).state || {};
        const response=await fetch('/api/flights/window',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({originLocationCode:'ZRH',destinationLocationCode:airport,startDate:dates[1],endDate:dates[2],stayDays:parseDayCount(plan.days),adults:state.travellers?.adults||1,children:state.travellers?.children||0})});
        const result=await response.json(); if(response.ok){const offer=result.recommended||result.lowest;priced=offer&&{amount:offer.amount,currency:offer.currency};label=offer?.airline?t('transport.return_airline',{airline:offer.airline}):t('transport.lowest_return_ref');}
      }
      if (!priced) {
        const response=await fetch('/api/fare-reference',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin,destination:plan.destination,departureTime:departureIso(plan),mode:'flight'})});
        const result=await response.json(); if(!response.ok) throw new Error(result.error || t('transport.flight_unavailable')); priced=result.fareReference; label=apiText(priced?.label, t('transport.google_public')); sourceUrl=priced?.sourceUrl || '';
      }
      if(!priced) throw new Error(t('transport.no_public_flight'));
      setTransportPrice(card,money(priced.amount, priced.currency),label,sourceUrl,t('transport.flight_disclaimer'));
      card.querySelector('.transport-status').textContent=t('transport.flight_ok');
    } catch(error) { setTransportPrice(card,t('transport.not_found'),apiText(error.message, t('transport.flight_unavailable')),''); }
  }

  async function renderDriveQuote(card, origin, destination) {
    if (!card) return;
    card.innerHTML=`<div class="transport-choice-head"><span class="transport-mode-icon"><i class="ri-car-line" aria-hidden="true"></i></span><div><div class="transport-label">${t('transport.backup_drive')}</div><h2>${escapeHtml(origin)} → ${escapeHtml(destination)}</h2></div></div><div class="transport-status">${t('transport.drive_calculating')}</div><div class="drive-costs"><div><span>${t('transport.fuel_return')}</span><b>${t('transport.checking')}</b></div><div><span>${t('transport.vignette')}</span><b>CHF 40</b></div><div><span>${t('transport.estimate_total')}</span><b>${t('transport.checking')}</b></div></div><div class="api-note">${t('transport.parking_excluded')}</div>`;
    try {
      const response=await fetch('/api/drive-estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin,destination})}), drive=await response.json(); if(!response.ok) throw new Error(drive.error || t('transport.drive_unavailable'));
      card.querySelector('.transport-status').textContent=t('transport.drive_status', { km: drive.oneWayKm, duration: durationText(drive.duration), round: drive.roundTripKm });
      const values=card.querySelectorAll('.drive-costs b'); values[0].textContent=t('transport.about_chf', { amount: drive.fuelCost }); values[2].textContent=t('transport.about_chf', { amount: drive.totalWithVignette });
      card.querySelector('.api-note').innerHTML=`${escapeHtml(t('transport.drive_fuel_note', { consumption: drive.consumption, price: drive.fuelPrice.toFixed(2), without: drive.totalWithoutVignette }))} <a href="https://www.ch.ch/en/vehicles-and-traffic/how-to-behave-in-road-traffic/motorway-vignette/" target="_blank" rel="noreferrer">${t('transport.vignette_rules')} <i class="ri-external-link-line" aria-hidden="true"></i></a>`;
    } catch(error) { card.querySelector('.transport-status').textContent=apiText(error.message, t('transport.drive_unavailable')); }
  }

  async function renderModeAwareTransport(plan) {
    const grid=document.querySelector('#transport .transport-grid'); if(!grid) return;
    let origin=plan.origin || 'Kilchberg, Zürich'; try{origin=(await OffWeGoState.ready).state?.preferences?.origin||origin;}catch{}
    let decision;
    try{const response=await fetch('/api/transport-options',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin,destination:plan.destination,departureTime:departureIso(plan)})});decision=await response.json();if(!response.ok)throw new Error(decision.error);    }catch{const flight=/航班|flight|飞机/i.test(plan.transport||'')||/tenerife|特内里费/i.test(plan.destination);decision={modes:flight?['flight']:['train'],reason:flight?t('transport.prefer_flight'):t('transport.show_recommended')};}
    setText('#transport .section-head h2',decision.reason || t('transport.compare_sensible'));document.querySelector('#transport .section-head>p')?.remove();
    grid.innerHTML=decision.modes.map((mode,index)=>`<article class="transport-card transport-choice${index===0?' recommended':''}" data-mode="${mode}"></article>`).join('');
    await Promise.allSettled(decision.modes.map((mode,index)=>{const card=grid.children[index];if(mode==='flight')return renderFlightQuote(card,plan,origin);if(mode==='drive')return renderDriveQuote(card,origin,plan.destination);return renderTransportQuote(card,{...plan,origin});}));
  }

  function setTransportPrice(card, value, note, sourceUrl, disclaimer) {
    const price=card?.querySelector('.price-line b'), detail=card?.querySelector('.price-line small'), apiNote=card?.querySelector('.api-note');
    if (price) price.textContent=value;
    if (detail) detail.textContent=note;
    if (apiNote) apiNote.innerHTML=`${escapeHtml(disclaimer || t('transport.price_disclaimer'))}${sourceUrl ? ` <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">${t('transport.view_source')} <i class="ri-external-link-line" aria-hidden="true"></i></a>` : ''}`;
  }

  async function hydrateLuganoTransport(plan) {
    const grid=document.querySelector('#transport .transport-grid');
    document.querySelector('#transport .section-head>p')?.remove();
    setText('#transport .section-head h2', t('transport.train_or_drive'));
    if (!grid) return;
    let origin=plan.origin || 'Kilchberg, Zürich';
    try { origin=(await OffWeGoState.ready).state?.preferences?.origin || origin; } catch {}
    grid.innerHTML=`<article class="transport-card transport-choice recommended"><div class="transport-choice-head"><span class="transport-mode-icon"><i class="ri-train-line" aria-hidden="true"></i></span><div><div class="transport-label">${t('transport.recommend_train')}</div><h2>${escapeHtml(origin)} → Lugano</h2></div></div><div class="transport-status">${t('transport.querying_times')}</div><div class="facts"><span>${t('transport.no_parking')}</span><span>${t('transport.city_centre')}</span><span>${t('transport.family_ok')}</span></div><div class="price-line"><b>${t('common.verifying')}</b><small>OJP · Google Search</small></div><div class="api-note">${t('transport.price_disclaimer')}</div></article><article class="transport-card transport-choice"><div class="transport-choice-head"><span class="transport-mode-icon"><i class="ri-car-line" aria-hidden="true"></i></span><div><div class="transport-label">${t('transport.backup_drive')}</div><h2>${escapeHtml(origin)} → Lugano</h2></div></div><div class="transport-status drive-status">${t('transport.drive_calculating')}</div><div class="drive-costs"><div><span>${t('transport.fuel_return')}</span><b>${t('transport.checking')}</b></div><div><span>${t('transport.vignette')}</span><b>CHF 40</b></div><div><span>${t('transport.estimate_total')}</span><b>${t('transport.checking')}</b></div></div><div class="api-note">${t('transport.parking_excluded')}</div></article>`;
    const [trainCard,driveCard]=grid.querySelectorAll('.transport-card');
    try {
      const response=await fetch('/api/journey-quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin,destination:'Lugano',departureTime:departureIso(plan)})});
      const quote=await response.json(); if (!response.ok) throw new Error(quote.error || t('transport.service_unavailable'));
      const priced=quote.fare || quote.fareReference;
      if (!priced) throw new Error(t('fare.unverified'));
      setTransportPrice(trainCard,money(priced.amount, priced.currency),apiText(quote.fareReference?.label || quote.fareNote, t('transport.adult_second')),quote.fareReference?.sourceUrl || '',quote.fareReference ? t('transport.google_public') + ' ' + t('transport.price_disclaimer') : t('transport.ojp_final'));
      const status=trainCard.querySelector('.transport-status');
      if(status) status.textContent=`${localTime(quote.departureTime)} ${t('common.depart')} · ${localTime(quote.arrivalTime)} ${t('common.arrive')} · ${durationText(quote.duration)}`;
    } catch (error) { setTransportPrice(trainCard,t('transport.not_found'),apiText(error.message, t('transport.service_unavailable')),''); }
    try {
      const response=await fetch('/api/drive-estimate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({origin,destination:'Lugano'})});
      const drive=await response.json(); if (!response.ok) throw new Error(drive.error || t('transport.drive_unavailable'));
      driveCard.querySelector('.drive-status').textContent=t('transport.drive_status', { km: drive.oneWayKm, duration: durationText(drive.duration), round: drive.roundTripKm });
      const values=driveCard.querySelectorAll('.drive-costs b');
      values[0].textContent=t('transport.about_chf', { amount: drive.fuelCost }); values[1].textContent='CHF 40'; values[2].textContent=t('transport.about_chf', { amount: drive.totalWithVignette });
      driveCard.querySelector('.api-note').innerHTML=`${escapeHtml(t('transport.drive_fuel_note', { consumption: drive.consumption, price: drive.fuelPrice.toFixed(2), without: drive.totalWithoutVignette }))} <a href="https://www.ch.ch/en/vehicles-and-traffic/how-to-behave-in-road-traffic/motorway-vignette/" target="_blank" rel="noreferrer">${t('transport.vignette_rules')} <i class="ri-external-link-line" aria-hidden="true"></i></a>`;
    } catch (error) { driveCard.querySelector('.drive-status').textContent=apiText(error.message, t('transport.drive_unavailable')); }
  }

  async function hydrateLuganoActivityHours(plan) {
    const cableDay=[...document.querySelectorAll('#journey .day')].find(day=>/缆车|Monte Brè/i.test(day.textContent));
    const route=cableDay?.querySelector('.route-top span:last-child'); if(!route) return;
    if (cableDay.dataset.hoursHydrated === 'true') return;
    cableDay.dataset.hoursHydrated = 'true';
    route.innerHTML='<span class="loading-copy">'+t('copy.reading_monte_bre_hours')+'</span>';
    const renderHours=({opening,frequency,minutes,note,mapsUrl,sourceUrl})=>{
      route.innerHTML=`<strong>${t('Monte Brè 缆车 · '+opening)}</strong>`;
      cableDay.querySelector('.activity-hours-detail')?.remove();
      const detail=document.createElement('div'); detail.className='activity-hours-detail';
      detail.innerHTML=`<div class="mini-grid"><div class="mini"><b>${t('detail.opening_hours')}</b><span>${escapeHtml(opening)}</span></div><div class="mini"><b>${t('detail.times')}</b><span>${t(frequency)}</span></div><div class="mini"><b>${t('detail.ascent')}</b><span>${t('copy.about_n_min_one_way', { n: minutes })}</span></div></div><div class="hint"><b>${t('copy.departure_note')}</b>${t(note)}<span class="activity-hours-links">${googleMapsLink(mapsUrl)}${sourceUrl?externalLink(sourceUrl, t('copy.timetable_source')):''}${externalLink('https://www.lugano.ch/en/vivere-lugano/muoversi-lugano/trasporti-pubblici/funicolari/', t('copy.official_notes'))}</span></div>`;
      route.closest('.route-top').after(detail);
    };
    const start=String(plan.dates || '').match(/20\d{2}-\d{2}-\d{2}/)?.[0];
    const target=start ? new Date(`${start}T12:00:00Z`) : new Date('2026-10-05T12:00:00Z'); target.setUTCDate(target.getUTCDate()+2);
    const date=target.toISOString().slice(0,10);
    try{
      const response=await fetch('/api/place-hours',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'Funicolare Monte Brè, Lugano',date})}), hours=await response.json();
      if(!response.ok) throw new Error(hours.error || t('transport.hours_unavailable'));
      const opening=hours.hours ? hours.hours.replace(/^[^:：]+[:：]\s*/u,'') : '09:00–19:00';
      renderHours({opening,frequency:hours.frequency||t('transport.every_30'),minutes:hours.journeyMinutes||15,note:t('transport.weather_note'),mapsUrl:hours.mapsUrl,sourceUrl:hours.sourceUrl});
    }catch(error){renderHours({opening:'09:00–19:00',frequency:t('transport.every_30'),minutes:15,note:t('transport.public_ops'),mapsUrl:'https://www.google.com/maps/search/?api=1&query=Funicolare+Monte+Br%C3%A8+Lugano',sourceUrl:''});}
  }

  const normalizeDuration = value => {
    const clean = String(value || '5').replace(/\s*天$/u, '').replace(/[–—]/g, '-').trim();
    const range = clean.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) return t('format.days', { n: `${range[1]}–${range[2]}` });
    return t('format.days', { n: clean.match(/\d+/)?.[0] || '5' });
  };

  function renderSummary(plan, days) {
    const rawDate = String(plan.dateContext || plan.dates || '');
    const shortDate = /秋假|10-0?5/u.test(rawDate) ? t('秋假') : /圣诞|新年|12-21/u.test(rawDate) ? t('圣诞假期') : rawDate && rawDate !== '日期待定' ? t('自选日期') : '';
    const context = [shortDate, t(normalizeDuration(days)), t(plan.pace), t(plan.budget)]
      .filter(value => value && value !== t('日期待定') && value !== t('预算待定'))
      .join(' · ');
    setText('.trip-summary', context || normalizeDuration(days));
    setText('.traveller-summary-text', normalizeTravellers(plan.travellers));
  }

  function updateDayFocus(day, index) {
    if (!day) return;
    const card = document.querySelector('#journey .hero-card'); if (!card) return;
    setText('#journey .hero-card .eyebrow', t('format.day_n_focus', { n: index + 1 }));
    setText('#journey .hero-card h2', day.dataset.focusTitle || setTextValue(day, 'h3'));
    setText('#journey .hero-card p', day.dataset.focusText || setTextValue(day, '.day-summary p'));
    const link = card.querySelector('.map-link');
    if (link) {
      const href = day.dataset.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(day.dataset.focusTitle || setTextValue(day, 'h3'))}`;
      const wrap = document.createElement('div');
      wrap.innerHTML = googleMapsLink(href, 'map-link');
      const next = wrap.firstElementChild;
      if (next) link.replaceWith(next);
    }
    let places = [];
    try { places = JSON.parse(day.dataset.places || '[]'); } catch {}
    let placeList = card.querySelector('.day-focus-places');
    if (!placeList) { placeList = document.createElement('div'); placeList.className = 'day-focus-places'; link?.before(placeList); }
    placeList.innerHTML = places.length > 1 ? places.map(place => `<article class="day-focus-place"><b>${escapeHtml(place.name)}</b><span>${escapeHtml(place.reason || '')}</span>${googleMapsLink(place.mapUrl)}</article>`).join('') : '';
    placeList.hidden = places.length < 2;
    if (link) link.hidden = places.length > 1;
    const photo = card.querySelector('.photo');
    if (photo && day.dataset.photoUrl) photo.style.backgroundImage = `url("${day.dataset.photoUrl.replace(/"/g, '%22')}")`;
    const stayCard = document.querySelector('#journey .stay-card');
    if (stayCard) stayCard.hidden = index !== 0;
  }

  function setTextValue(root, selector) { return root?.querySelector(selector)?.textContent.trim() || ''; }

  function ensureDayCards(requestedCount) {
    const stack = document.querySelector('#journey .day-stack');
    if (!stack) return [];
    let cards = [...stack.querySelectorAll('.day')];
    while (cards.length < requestedCount) {
      const index = cards.length;
      const card = document.createElement('article');
      card.className = 'day';
      card.innerHTML = `<button class="day-summary" type="button"><span class="date"><b>${index + 1}</b>${t('format.day_n', { n: index + 1 })}</span><span><h3>${t('format.day_n_focus', { n: index + 1 })}</h3><p>${t('保留一项重点，其余时间按全家状态调整。')}</p></span><span class="chevron">⌄</span></button><div class="day-detail"><div class="route-top"><span>•</span><span>${t('copy.one_focus_today')}</span></div></div>`;
      card.querySelector('.day-summary').addEventListener('click', () => {
        const open = !card.classList.contains('active');
        stack.querySelectorAll('.day').forEach(item => { item.classList.remove('active'); item.querySelector('.chevron').textContent = '⌄'; });
        if (open) { card.classList.add('active'); card.querySelector('.chevron').textContent = '⌃'; }
        updateDayFocus(card, index);
      });
      stack.append(card);
      cards.push(card);
    }
    return cards;
  }

  function bindDayFocusCards() {
    document.querySelectorAll('#journey .day-summary').forEach((button, index) => button.addEventListener('click', () => updateDayFocus(button.closest('.day'), index)));
    const active = document.querySelector('#journey .day.active');
    if (active) updateDayFocus(active, [...document.querySelectorAll('#journey .day')].indexOf(active));
  }

  function renderJourney(plan, research, days) {
    const count = parseDayCount(days);
    const cards = ensureDayCards(count);
    const shopping = research.shopping || [];
    const stay = research.stay || {};
    cards.forEach((card, index) => {
      card.hidden = index >= count;
      if (index >= count) return;
      const projects = index === 1 && shopping.length > 1 ? shopping.slice(0, 2) : index > 1 ? shopping.slice(index, index + 1) : [];
      const item = index === 0 ? {
        title:t('journey.arrive_walk'),
        summary:t('journey.arrive_summary', { hotel: stay.name || t('stay.hotel_fallback') }),
        route:t('journey.arrive_route'),
        focusTitle:t('journey.arrive_focus'),
        mapUrl:stay.mapUrl,
        photoUrl:stay.images?.[0]?.url
      } : {
        title:projects.length > 1 ? t('journey.old_town') : t('journey.place_and_free', { name: projects[0]?.name || plan.destination }),
        summary:projects.length > 1 ? t('journey.places_summary', { places: projects.map(project => project.name).join(window.OffWeGoI18n?.getLanguage?.()==='en' ? ', ' : '、') }) : apiText(projects[0]?.reason, t('journey.one_focus')),
        route:projects.length > 1 ? projects.map(project => project.name).join(' → ') : t('journey.focus_route', { name: projects[0]?.name || plan.destination }),
        focusTitle:projects.length > 1 ? t('journey.today_places') : projects[0]?.name || t('format.day_n_focus', { n: index + 1 }),
        mapUrl:projects[0]?.mapUrl,
        photoUrl:projects[0]?.photo?.url,
        projects
      };
      setTextValue(card, 'h3') && (card.querySelector('h3').textContent = item.title);
      const summary = card.querySelector('.day-summary p'); if (summary) summary.textContent = item.summary;
      const route = card.querySelector('.route-top span:last-child'); if (route) route.textContent = item.route;
      card.dataset.focusTitle = item.focusTitle;
      card.dataset.focusText = item.summary;
      card.dataset.mapUrl = item.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.focusTitle + ', ' + plan.destination)}`;
      if (item.photoUrl) card.dataset.photoUrl = item.photoUrl;
      card.dataset.places = JSON.stringify((item.projects || []).map(project => ({name:project.name,reason:project.reason,mapUrl:project.mapUrl})));
    });
    const active = cards.find(card => !card.hidden && card.classList.contains('active')) || cards[0];
    if (active) updateDayFocus(active, cards.indexOf(active));
  }

  function renderShopping(items, days) {
    const container = document.querySelector('#shopping .placeholder');
    if (!container) return;
    const dayCount = parseDayCount(days);
    const dayTitles = [...document.querySelectorAll('#journey .day h3')].map(title => title.textContent.trim());
    const dayOptions = selectedDay => Array.from({length:dayCount}, (_, index) => `<option value="${index + 1}"${index + 1 === selectedDay ? ' selected' : ''}>${t('format.day_n', { n: index + 1 })}${dayTitles[index] ? ` · ${escapeHtml(dayTitles[index])}` : ''}</option>`).join('');
    container.innerHTML = items.map((item, index) => `<article class="research-shopping-card">
      ${item.photo?.url ? `<img class="research-card-photo" src="${escapeHtml(item.photo.url)}" alt="${escapeHtml(item.name)}" referrerpolicy="no-referrer">` : `<div class="research-card-photo research-card-photo-empty"><i class="ri-image-line" aria-hidden="true"></i><span>${t('shopping.photo_pending')}</span></div>`}
      <b>${escapeHtml(apiText(item.category, t('shopping.local')))}</b><h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.reason)}</p>
      ${googleMapsLink(item.mapUrl)}
      <div class="add-row research-add-tile"><label class="research-day-picker"><select aria-label="${t('shopping.pick_day', { name: item.name })}">${dayOptions(Math.min(dayCount, index + 2))}</select><i class="ri-arrow-down-s-line" aria-hidden="true"></i></label><button class="research-add" type="button"><i class="ri-add-line" aria-hidden="true"></i><span>${t('copy.add_to_itinerary')}</span></button></div>
    </article>`).join('');
    container.querySelectorAll('.research-add').forEach(button => button.addEventListener('click', () => {
      const selectedDay = button.parentElement.querySelector('select').value;
      button.classList.add('is-added');
      button.querySelector('i').className = 'ri-check-line';
      button.querySelector('span').textContent = t('shopping.added_day', { n: selectedDay });
    }));
  }

  function renderPreparation(preparation) {
    const container = document.querySelector('#prepare .placeholder');
    if (!container) return;
    container.innerHTML = ['entry','money','connectivity'].map(key => {
      const item = preparation[key] || {};
      return `<article><b>${escapeHtml(apiText(item.label, t('prepare.label_' + key)))}</b><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.body)}</p>${item.url ? `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${t('prepare.check_source')}</a>` : ''}</article>`;
    }).join('');
  }

  function renderStay(stay, travellers) {
    setText('#stayHotelName', stay.name); setText('#stayHotelDescription', stay.reason);
    setText('#railHotelName', stay.name); setText('#railHotelReason', stay.reason);
    const lowest = stay.lowestNightly;
    if (lowest?.amount) {
      const nightlyForTwoRooms = Number(lowest.amount) * 2;
      const total = nightlyForTwoRooms * Math.max(1, Number(stay.nights) || 1);
      setText('#stayNightly', t('stay.lowest_nightly', { price: money(nightlyForTwoRooms, lowest.currency, 0) }));
      setText('#stayFiveNights', t('stay.nights_from', { n: stay.nights, price: money(total, lowest.currency, 0) }));
      setText('#pricedTotal', t('stay.from_price', { price: money(total, lowest.currency, 0) }));
      setText('#budgetStayTotal', t('stay.from_price', { price: money(total, lowest.currency, 0) }));
      setText('#budgetStayDescription', t('stay.budget_line', { name: stay.name, n: stay.nights }));
      const note = document.querySelector('#stay .api-note');
      if (note) note.textContent = t('stay.note_calc', { price: money(lowest.amount, lowest.currency, 0), n: stay.nights });
    } else {
      setText('#stayNightly', t('stay.no_google_price')); setText('#stayFiveNights', apiText(stay.rooms, t('format.rooms', { n: 2 })));
    }
    const roomTags = document.querySelector('.room-tags');
    if (roomTags) roomTags.innerHTML = `<span>${t('format.rooms', { n: 2 })}</span><span>${escapeHtml(normalizeTravellers(travellers))}</span><span>${t('stay.rooms_pending')}</span>`;
    const facts = document.querySelectorAll('.stay-side-fact');
    if (facts[0]) { facts[0].querySelector('b').textContent = normalizeTravellers(travellers); facts[0].querySelector('span').textContent = t('stay.from_travellers'); }
    if (facts[1]) { facts[1].querySelector('b').textContent = t('format.rooms', { n: 2 }); facts[1].querySelector('span').textContent = t('stay.confirm_beds'); }
    if (facts[2]) { facts[2].querySelector('b').textContent = stay.area; facts[2].querySelector('span').textContent = t('stay.area_from_research'); }
    const positive = document.querySelector('.review-pro span'); if (positive) positive.textContent = stay.positive || t('stay.no_positive');
    const risks = document.querySelector('.review-risks ul');
    if (risks) risks.innerHTML = (stay.risks || []).map(risk => `<li>${escapeHtml(risk)}</li>`).join('') || `<li>${t('stay.no_risks')}</li>`;
    document.querySelector('.negative-feed')?.remove(); document.querySelector('.swap')?.remove();
    const booking = document.querySelector('#bookingLink'); if (booking) { booking.textContent = lowest?.amount ? t('stay.view_lowest') : t('stay.search_reviews'); booking.href = lowest?.sourceUrl || stay.bookingUrl; }
    const map = document.querySelector('#hotelMapLink');
    if (map) {
      const wrap = document.createElement('div');
      wrap.innerHTML = googleMapsLink(stay.mapUrl, 'booking-link');
      const next = wrap.firstElementChild;
      if (next) {
        next.id = 'hotelMapLink';
        map.replaceWith(next);
      }
    }
    const gallery = document.querySelector('.stay-gallery'); if (!gallery) return;
    gallery.style.display = '';
    const images = stay.images || [];
    if (!images.length) { gallery.innerHTML = `<div class="research-photo-empty"><i class="ri-image-line" aria-hidden="true"></i><span>${t('stay.no_photos')}</span>${googleMapsLink(stay.mapUrl)}</div>`; return; }
    gallery.innerHTML = `<div class="stay-stage"><img id="stayGalleryImage" src="${escapeHtml(images[0].url)}" alt="${escapeHtml(t('stay.photo_alt', { name: stay.name }))}" referrerpolicy="no-referrer"><button class="stay-gallery-button stay-gallery-prev" type="button" aria-label="${t('stay.prev_photo')}"><i class="ri-arrow-left-s-line" aria-hidden="true"></i></button><button class="stay-gallery-button stay-gallery-next" type="button" aria-label="${t('stay.next_photo')}"><i class="ri-arrow-right-s-line" aria-hidden="true"></i></button><span class="stay-gallery-count" aria-live="polite">1 / ${images.length}</span></div><div class="stay-thumbnails">${images.map((image,index) => `<button class="stay-thumb${index ? '' : ' active'}" type="button" aria-label="${t('stay.view_photo_n', { n: index + 1 })}"><img src="${escapeHtml(image.url)}" alt="" referrerpolicy="no-referrer"></button>`).join('')}</div>`;
    let current = 0;
    const show = next => { current = (next + images.length) % images.length; gallery.querySelector('#stayGalleryImage').src = images[current].url; gallery.querySelector('.stay-gallery-count').textContent = `${current + 1} / ${images.length}`; gallery.querySelectorAll('.stay-thumb').forEach((thumb,index)=>thumb.classList.toggle('active', index === current)); };
    gallery.querySelector('.stay-gallery-prev').onclick = () => show(current - 1);
    gallery.querySelector('.stay-gallery-next').onclick = () => show(current + 1);
    gallery.querySelectorAll('.stay-thumb').forEach((thumb,index) => thumb.onclick = () => show(index));
  }

  async function applyGenericPlan(plan) {
    if (!plan?.destination) return;
    const days = String(plan.days || '5');
    ensureDayCards(parseDayCount(days));
    if (/卢加诺|lugano/i.test(plan.destination)) { hydrateLuganoTransport(plan); hydrateLuganoActivityHours(plan); return; }
    document.title = 'Off We Go'; setText('.hero h1', plan.destination);
    setText('.hero .eyebrow', plan.dates === '日期待定' || plan.dates === t('nav.dates_pending') ? t('detail.your_plan') : plan.dates); renderSummary(plan, days);
    setText('#pricedTotal', t('detail.price_pending')); setText('#journey .section-head h2', t('journey.pace_family'));
    setText('#shopping .section-head>p', t('shopping.dates_ready'));
    document.querySelectorAll('#journey .day').forEach((day, index) => { const date = day.querySelector('.date'); if (date) date.innerHTML = `<b>${index + 1}</b>${t('format.day_n', { n: index + 1 })}`; });
    renderModeAwareTransport(plan);
    const shopping = document.querySelector('#shopping .placeholder'), prepare = document.querySelector('#prepare .placeholder');
    if (shopping) shopping.innerHTML = `<article class="research-loading"><i class="ri-loader-4-line" aria-hidden="true"></i><h2>${t('shopping.researching')}</h2><p>${t('shopping.gemini_places')}</p></article>`;
    if (prepare) prepare.innerHTML = `<article class="research-loading"><i class="ri-loader-4-line" aria-hidden="true"></i><h2>${t('prepare.researching')}</h2><p>${t('prepare.body')}</p></article>`;
    try {
      const response = await fetch('/api/trip-detail-research', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({destination:plan.destination,dates:plan.dates,days,travellers:normalizeTravellers(plan.travellers)})});
      const research = await response.json(); if (!response.ok) throw new Error(research.error || t('detail.research_unavailable'));
      renderJourney(plan, research, days); renderShopping(research.shopping || [], days); renderPreparation(research.preparation || {}); renderStay(research.stay || {}, plan.travellers);
    } catch (error) {
      const message = escapeHtml(apiText(error.message, t('detail.research_unavailable')));
      if (shopping) shopping.innerHTML = `<article><b>${t('shopping.heading')}</b><h2>${t('detail.cannot_load')}</h2><p>${message}</p><button type="button" onclick="location.reload()">${t('detail.research_again')}</button></article>`;
      if (prepare) prepare.innerHTML = `<article><b>${t('prepare.heading')}</b><h2>${t('detail.cannot_load')}</h2><p>${message}</p></article>`;
    }
    setText('.share-preview b', t('detail.share_title', { destination: plan.destination, days })); setText('.share-preview p', [plan.dates, normalizeTravellers(plan.travellers)].filter(Boolean).join(' · '));
  }

  bindDayFocusCards();
  const plan = readSelectedPlan();
  ensureDayCards(parseDayCount(plan?.days || document.querySelector('.trip-summary')?.textContent || 5));
  applyGenericPlan(plan);
  window.addEventListener('offwego:language', () => {
    const current = readSelectedPlan() || plan;
    if (current?.destination) applyGenericPlan(current);
    else window.OffWeGoI18n?.apply(document.body);
  });
  if (/缆车|Monte Brè/i.test(document.querySelector('#journey')?.textContent || '')) {
    hydrateLuganoActivityHours(plan || { dates: '' });
  }
  window.OffWeGoPlanDetail = Object.freeze({ readSelectedPlan, applyGenericPlan, normalizeTravellers });
})();
