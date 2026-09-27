(() => {
  const t = (key, vars) => window.OffWeGoI18n?.t(key, vars) ?? key;
  const STORAGE_KEY = 'offwego:selectedPlan';
  const DETAIL_PATH = './trip-detail-tabs-v2-design-v2-prototype.html?source=workbench';

  function text(root, selector, fallback = '') {
    return root?.querySelector(selector)?.textContent.trim() || fallback;
  }

  function normalizeTravellers(value) {
    return String(value || t('nav.travellers_pending')).replace(/^同行人\s*/u, '').replace(/成年人/g, '成人').replace(/\s+/g, ' ').trim();
  }

  function travellerText() {
    const saved = text(document, '#travellerSummaryText');
    if (saved) return normalizeTravellers(saved);
    const adults = Number(text(document, '#adultsCount', '0'));
    const children = Number(text(document, '#childrenCount', '0'));
    return [adults ? t('format.adults', { n: adults }) : '', children ? t('format.children', { n: children }) : ''].filter(Boolean).join(' · ') || t('nav.travellers_pending');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>'"]/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[character]));
  }

  function compactDate(value) {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return window.OffWeGoI18n?.format?.date(`${match[1]}-${match[2]}-${match[3]}`, { month: 'short', day: 'numeric' })
      || (window.OffWeGoI18n?.getLanguage?.() === 'en'
      ? `${Number(match[3])} ${months[Number(match[2]) - 1]}`
      : `${Number(match[2])}月${Number(match[3])}日`);
  }

  function dateText() {
    const manual = document.querySelector('#manualDates')?.value || '';
    const active = document.querySelector('#dates .school-break-card.active, #holidayChoice.active');
    const holiday = text(active, 'em');
    const match = manual.match(/^(\d{4}-\d{2}-\d{2})\s+至\s+(\d{4}-\d{2}-\d{2})$/);
    const breakKind = active?.dataset.break || active?.dataset.kind || '';
    if (breakKind === 'autumn' || /秋假|autumn/i.test(holiday)) return t('copy.autumn_break');
    if (breakKind === 'winter' || /圣诞|新年|christmas/i.test(holiday)) return t('nav.christmas');
    if (match) return t('copy.custom_dates');
    return holiday && !/日期|date/i.test(holiday) ? holiday : t('nav.dates_pending');
  }

  function durationText() {
    const active = text(document, '#dates [data-days].active b');
    const exact = String(document.querySelector('#customDuration')?.value || '').replace(/[^0-9]/g, '');
    return active || (exact ? t('format.days', { n: exact }) : t('copy.length_tbd'));
  }

  function paceText() {
    return text(document, '#pace [data-pace].active b', t('copy.relaxed')).replace(/节奏/gu, '').trim();
  }

  function budgetText() {
    return window.currentTripBudget && window.currentTripBudget !== t('copy.budget_undecided_2') && window.currentTripBudget !== '预算未定' ? window.currentTripBudget : '';
  }

  function contextParts(stage = 'results') {
    if (stage === 'dates') return [travellerText()];
    const parts = [dateText(), durationText()];
    if (stage !== 'pace') parts.push(paceText());
    if (stage === 'results') parts.push(budgetText());
    parts.push(travellerText());
    return parts.filter(Boolean);
  }

  function contextHtml(parts) {
    return parts.map((part, index) => `${index ? '<span aria-hidden="true">·</span>' : ''}<b>${escapeHtml(part)}</b>`).join('');
  }

  function renderWorkbenchSummary() {
    const node = document.querySelector('#resultsQuery');
    if (!node) return;
    const expected = `${contextHtml(contextParts('results'))}<button type="button" aria-label="${escapeHtml(t('common.edit_alt'))}"><i class="ri-edit-line" aria-hidden="true"></i><span>${t('common.edit_alt')}</span></button>`;
    if (node.dataset.summaryHtml === expected) return;
    node.dataset.summaryHtml = expected;
    node.classList.add('trip-context-summary');
    summaryObserver?.disconnect();
    node.innerHTML = expected;
    observeSummary(node);
  }

  function selectedPlanFrom(card) {
    const activeDays = text(document, '#dates [data-days].active b').replace(/\s*天$/u, '');
    const customDays = String(document.querySelector('#customDuration')?.value || '').replace(/[^0-9]/g, '');
    return {
      destination: text(card, 'h2', t('nav.your_destination')),
      reason: text(card, '.dest-copy p'),
      note: text(card, '.live-card-note'),
      transport: card?.dataset.transport || t('nav.check_transport_later'),
      transportMode: card?.dataset.transportMode || '',
      airportCode: card?.dataset.airportCode || '',
      dates: document.querySelector('#manualDates')?.value || card?.dataset.recommendedDates || t('nav.dates_pending'),
      dateContext: dateText(),
      days: activeDays || customDays || '5',
      pace: text(document, '#pace [data-pace].active b', t('copy.relaxed')).replace(/节奏/gu, '').trim(),
      travellers: travellerText(),
      budget: window.currentTripBudget || t('copy.budget_tbd')
    };
  }

  function openDetailHref(href) {
    if (location.protocol === 'file:') {
      if (typeof window.note === 'function') window.note('research.offline_detail');
      else {
        const toast = document.querySelector('#toast');
        if (toast) {
          toast.textContent = t('research.offline_detail');
          toast.classList.add('show');
          setTimeout(() => toast.classList.remove('show'), 2200);
        }
      }
      return false;
    }
    location.href = href;
    return true;
  }

  function openV2Plan(card) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedPlanFrom(card)));
    return openDetailHref(DETAIL_PATH);
  }

  document.addEventListener('click', event => {
    const trigger = event.target.closest('.plan-detail-button, #openPlan');
    if (!trigger) return;
    const card = trigger.closest('.destination') || document.querySelector('.destination.selected');
    if (!card) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openV2Plan(card);
  }, true);

  let summaryObserver = null;
  function observeSummary(node) {
    const summaryNode = node || document.querySelector('#resultsQuery');
    if (!summaryNode) return;
    if (!summaryObserver) {
      summaryObserver = new MutationObserver(() => queueMicrotask(renderWorkbenchSummary));
    }
    summaryObserver.observe(summaryNode, { childList:true, characterData:true, subtree:true });
  }

  const summaryNode = document.querySelector('#resultsQuery');
  if (summaryNode) {
    observeSummary(summaryNode);
    renderWorkbenchSummary();
    window.addEventListener('offwego:language', renderWorkbenchSummary);
  }

  window.OffWeGoPlanNavigation = Object.freeze({
    storageKey: STORAGE_KEY,
    selectedPlanFrom,
    openV2Plan,
    openDetailHref,
    normalizeTravellers,
    renderWorkbenchSummary,
    contextParts,
    contextHtml
  });
})();
