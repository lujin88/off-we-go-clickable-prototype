(function () {
  'use strict';

  const SUPPORTED = new Set(['CHF', 'EUR', 'USD', 'CNY']);
  const MONEY_PATTERN = /\b(CHF|EUR|USD|CNY)\s+(\d[\d'’.,]*)/g;
  const originals = new WeakMap();
  const rendered = new WeakMap();
  let target = 'CHF';
  const FALLBACK_RATES = { CHF: 1, EUR: 1.04, USD: 1.22, CNY: 8.70 };
  let rates = FALLBACK_RATES;
  let applying = false;

  const parseAmount = value => {
    let normalized = value.replace(/['’]/g, '');
    if (/^\d{1,3}(,\d{3})+$/.test(normalized)) normalized = normalized.replace(/,/g, '');
    else if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) normalized = normalized.replace(/\./g, '');
    else normalized = normalized.replace(',', '.');
    return Number(normalized);
  };

  const formatAmount = amount => {
    const rounded = Math.round(amount * 100) / 100;
    const [whole, decimals] = rounded.toFixed(Number.isInteger(rounded) ? 0 : 2).split('.');
    const grouped = Number(whole).toLocaleString(window.OffWeGoI18n?.locale?.() || 'de-CH').replace(/’/g, "'");
    return decimals ? `${grouped}.${decimals}` : grouped;
  };

  const convertText = text => text.replace(MONEY_PATTERN, (match, source, rawAmount) => {
    if (!SUPPORTED.has(source) || source === target) return `${target} ${rawAmount}`;
    const amount = parseAmount(rawAmount);
    const sourceRate = rates[source];
    const targetRate = rates[target];
    if (!Number.isFinite(amount) || !sourceRate || !targetRate) return match;
    return `${target} ${formatAmount(amount / sourceRate * targetRate)}`;
  });

  const eligible = node => {
    const parent = node.parentElement;
    return parent && !parent.closest('script,style,textarea,[data-no-currency-convert]');
  };

  const renderNode = node => {
    if (!eligible(node) || !MONEY_PATTERN.test(node.nodeValue || '')) {
      MONEY_PATTERN.lastIndex = 0;
      return;
    }
    MONEY_PATTERN.lastIndex = 0;
    const lastRendered = rendered.get(node);
    if (!originals.has(node) || (lastRendered && node.nodeValue !== lastRendered)) originals.set(node, node.nodeValue);
    const next = convertText(originals.get(node));
    rendered.set(node, next);
    if (node.nodeValue !== next) node.nodeValue = next;
  };

  const renderTree = root => {
    applying = true;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) renderNode(node);
    applying = false;
    document.documentElement.dataset.currency = target;
  };

  const load = async preferred => {
    target = SUPPORTED.has(preferred) ? preferred : 'CHF';
    rates = FALLBACK_RATES;
    renderTree(document.body);
    try {
      const data = await fetch('/api/exchange-rates?base=CHF', { signal: AbortSignal.timeout(3000) }).then(response => {
        if (!response.ok) throw new Error(window.OffWeGoI18n?.t('api.unsupported_currency') || '汇率暂时不可用');
        return response.json();
      });
      rates = { ...FALLBACK_RATES, ...(data.rates || {}) };
    } catch {}
    renderTree(document.body);
  };

  const init = async () => {
    let preferred = document.documentElement.dataset.currency;
    try {
      const data = await fetch('/api/bootstrap').then(response => response.json());
      preferred = data.state?.preferences?.currency || preferred;
    } catch {}
    await load(preferred || 'CHF');

    new MutationObserver(mutations => {
      if (applying) return;
      mutations.forEach(mutation => {
        if (mutation.type === 'characterData') renderNode(mutation.target);
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.TEXT_NODE) renderNode(node);
          else if (node.nodeType === Node.ELEMENT_NODE) renderTree(node);
        });
      });
    }).observe(document.body, { childList: true, characterData: true, subtree: true });

    window.addEventListener('currencychange', event => load(event.detail?.currency));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();

  window.OffWeGoCurrency = { refresh: load };
})();
