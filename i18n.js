(() => {
  'use strict';

  const STORAGE_KEY = 'offwego:language';
  const COOKIE_KEY = 'offwego_language';
  const ATTRS = ['placeholder', 'aria-label', 'title', 'alt'];
  const SKIP = 'script, style, textarea, noscript, code, pre';
  const SKIP_SELECT = '#language, #detailLanguage';
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const LOCALES = window.OffWeGoLocales || { zh: {}, en: {} };
  const originals = new WeakMap();
  const originalAttrs = new WeakMap();
  let language = 'zh';
  let applying = false;

  const ZH_TO_KEY = {};
  const EN_TO_KEY = {};
  const SHORT_SKIP = new Set(['天', '晚', '日', '月', '年', '至', '共', '位', '只', '个', '第', '和', '的', '了', '与', '或', '在', '为', '是']);
  const SEPARATOR = /([·•|/／;；:：\n]+)/;
  const warned = new Set();
  Object.keys(LOCALES.zh || {}).forEach(key => {
    const zh = LOCALES.zh[key];
    const en = LOCALES.en?.[key];
    if (zh && !/\{[a-z]+\}/.test(zh)) ZH_TO_KEY[zh] = key;
    if (en && !/\{[a-z]+\}/.test(en)) EN_TO_KEY[en] = EN_TO_KEY[en] || key;
  });
  const PHRASE_KEYS = Object.keys(ZH_TO_KEY)
    .filter(zh => zh.length >= 2 && !SHORT_SKIP.has(zh))
    .sort((a, b) => b.length - a.length);

  const PATTERNS = [
    [/^(\d+) 位成人，(\d+) 位孩子$/, (zh, adults, children) => fill('family.count', { adults, children }, zh)],
    [/^(\d+) 位成人，(\d+) 位孩子，(\d+) 只宠物$/, (zh, adults, children, pets) => fill('family.count_with_pets', { adults, children, pets }, zh)],
    [/^(\d+) 位成人 · (\d+) 位孩子$/, (zh, adults, children) => fill('family.count_dot', { adults, children }, zh)],
    [/^(\d+) 位成人与 (\d+) 位孩子$/, (zh, adults, children) => fill('family.count_and', { adults, children }, zh)],
    [/^(\d+) 位成员已保存$/, (zh, n) => fill('format.members_saved', { n }, zh)],
    [/^(\d+) 位旅客$/, (zh, n) => fill('format.travellers', { n }, zh)],
    [/^(\d+) 只宠物$/, (zh, n) => fill('format.pets', { n }, zh)],
    [/^(\d+) 位成人$/, (zh, n) => fill('format.adults', { n }, zh)],
    [/^(\d+) 位孩子$/, (zh, n) => fill('format.children', { n }, zh)],
    [/^孩子 (\d+)$/, (zh, n) => fill('format.child_n', { n }, zh)],
    [/^孩子 (\d+) 的出生日期$/, (zh, n) => fill('format.child_n_dob', { n }, zh)],
    [/^第 (\d+) 天重点$/, (zh, n) => fill('format.day_n_focus', { n }, zh)],
    [/^第 (\d+) 天$/, (zh, n) => fill('format.day_n', { n }, zh)],
    [/^(\d+)–(\d+) 天$/, (_, a, b) => language === 'en' ? `${a}–${b} days` : `${a}–${b} 天`],
    [/^(\d+) 天$/, (zh, n) => fill('format.days', { n }, zh)],
    [/^(\d+) 晚$/, (zh, n) => fill('format.nights', { n }, zh)],
    [/^(\d+) 间房$/, (zh, n) => fill('format.rooms', { n }, zh)],
    [/^(\d+) 小时$/, (zh, n) => fill('format.hours', { n }, zh)],
    [/^(\d+) 分$/, (zh, n) => fill('format.minutes', { n }, zh)],
    [/^(\d+) 次换乘$/, (zh, n) => fill('format.transfers', { n }, zh)],
    [/^暂按 (\d+) 天安排。?$/, (zh, n) => fill('format.plan_days', { n }, zh)],
    [/^已选 (\d+) 天。?$/, (zh, n) => fill('format.selected_days', { n }, zh)],
    [/^日期还没定 · 暂按 (\d+) 天安排。?$/, (zh, n) => fill('dates.undecided_plan', { n }, zh)],
    [/^连接 ([A-Za-z][\w .]*)$/, (zh, name) => fill('connect.title', { name }, zh)],
    [/^将 (.+) 的 API 密钥保存在你的本地设置中。$/, (zh, name) => fill('connect.help', { name }, zh)],
    [/^(.+) 已安全存入 macOS 钥匙串。$/, (zh, name) => fill('connect.stored_keychain', { name }, zh)],
    [/^(.+) 已验证并保存在本机钥匙串。$/, (zh, name) => fill('connect.verified_keychain', { name }, zh)],
    [/^([A-Za-z][\w .]*) 已连接。$/, (zh, name) => fill('connect.connected_named', { name }, zh)],
    [/^正在测试 (.+)…$/, (zh, name) => fill('connect.testing', { name }, zh)],
    [/^(.+) 连接正常。$/, (zh, name) => fill('connect.ok', { name }, zh)],
    [/^(.+) 已保存为本地演示配置。$/, (zh, name) => fill('connect.demo_saved', { name }, zh)],
    [/^连接失败：(.+)$/, (zh, message) => fill('connect.failed', { message }, zh)],
    [/^测试失败：(.+)$/, (zh, message) => fill('toast.test_failed', { message }, zh)],
    [/^保存失败：(.+)$/, (zh, message) => fill('toast.save_failed_prefix', { message }, zh)],
    [/^请粘贴完整的 (.+) Token。$/, (zh, name) => fill('connect.paste_token', { name }, zh)],
    [/^(.+) Token 已安全保存到本机。$/, (zh, name) => fill('connect.token_saved', { name }, zh)],
    [/^已移除“(.+)”，已更新可选方向。$/, (zh, item) => fill('toast.removed', { item: translate(item) }, zh)],
    [/^已恢复“(.+)”。$/, (zh, title) => fill('toast.restored', { title }, zh)],
    [/^以 (.+) 估算，之后可按目的地和人数细调。$/, (zh, code) => fill('budget.helper_code', { code }, zh)],
    [/^预算（(.+)）$/, (zh, code) => fill('budget.label_code', { code }, zh)],
    [/^已安排 (.+) 至 (.+) · 共 (\d+) 天$/, (zh, start, end, n) => fill('dates.range_days', { start, end, n }, zh)],
    [/^(\d{4}) 年 (\d{1,2}) 月 (\d{1,2}) 日至 (\d{1,2}) 日 · 共 (\d+) 天$/, (_, y, mo, d1, d2, n) => language === 'en' ? `${d1}–${d2} ${MONTHS[Number(mo) - 1]} ${y} · ${n} days` : _],
    [/^(\d{4}) 年 (\d{1,2}) 月 (\d{1,2}) 日至 (\d{4}) 年 (\d{1,2}) 月 (\d{1,2}) 日 · 共 (\d+) 天$/, (_, y1, m1, d1, y2, m2, d2, n) => language === 'en' ? `${d1} ${MONTHS[Number(m1) - 1]} ${y1}–${d2} ${MONTHS[Number(m2) - 1]} ${y2} · ${n} days` : _],
    [/^(\d{4}) 年 (\d{1,2}) 月 (\d{1,2})[–-](\d{1,2}) 日$/, (_, y, mo, d1, d2) => language === 'en' ? `${d1}–${d2} ${MONTHS[Number(mo) - 1]} ${y}` : _],
    [/^(\d{1,2}) 月 (\d{1,2})\s*至\s*(\d{1,2}) 日$/, (_, mo, d1, d2) => language === 'en' ? `${MONTHS[Number(mo) - 1]} ${d1}–${d2}` : _],
    [/^(\d{1,2}) 月 (\d{1,2}) 日$/, (_, mo, d) => language === 'en' ? `${Number(d)} ${MONTHS[Number(mo) - 1]}` : _],
    [/^已同步家庭资料 · (\d{4}) 年 (\d{2}) 月出生$/, (_, y, mo) => language === 'en' ? `Synced from family profile · born ${y}-${mo}` : _],
    [/^(\d{4}) 年 (\d{2}) 月出生$/, (_, y, mo) => language === 'en' ? `Born ${y}-${mo}` : _],
    [/^(\d+) 晚约 (.+)$/, (_, n, price) => language === 'en' ? `${n} nights about ${price}` : _],
    [/^(\d+) 间房 · (.+) \/ 晚起$/, (_, n, price) => language === 'en' ? `${n} rooms · from ${price} / night` : _],
    [/^(\d+) 间房 · (.+)$/, (_, n, rest) => language === 'en' ? `${n} rooms · ${translate(rest)}` : _],
    [/^(.+) 起$/, (zh, price) => fill('stay.from_price', { price }, zh)],
    [/^(\d+) 路$/, (zh, n) => fill('copy.line_n', { n }, zh)],
    [/^每 (\d+) 分钟一班$/, (_, n) => language === 'en' ? `Every ${n} minutes` : _],
    [/^约每 (\d+) 分钟一班$/, (_, n) => language === 'en' ? `About every ${n} minutes` : _],
    [/^单程约 (\d+) 分钟$/, (zh, n) => fill('copy.about_n_min_one_way', { n }, zh)],
    [/^单程约 (\d+) km · (.+) · 往返约 (\d+) km$/, (zh, km, duration, round) => fill('transport.drive_status', { km, duration, round }, zh)],
    [/^按 (\d+) 天估算；保险、燃油、停车和附加设备另计。$/, (_, n) => language === 'en' ? `Estimated for ${n} days; insurance, fuel, parking, and extras are separate.` : _],
    [/^按 (\d+) 天 × (.+) \/ 天估算，含基础租金参考，不含保险升级、儿童座椅、燃油、停车与异地还车费。$/, (_, n, rate) => language === 'en' ? `Estimated as ${n} days × ${rate} / day, base rental only. Insurance upgrades, child seats, fuel, parking, and one-way fees are extra.` : _],
    [/^秋假 · (\d+) 天 · (.+)$/, (_, n, rest) => language === 'en' ? `Autumn break · ${n} days · ${translate(rest)}` : _],
    [/^(\d{4}) 年 (\d{1,2}) 月 (\d{1,2})[–-](\d{1,2}) 日 · (\d+) 天 · 计划$/, (_, y, mo, d1, d2, n) => language === 'en' ? `${d1}–${d2} ${MONTHS[Number(mo) - 1]} ${y} · ${n} days · trip` : _],
    [/^(.+) · (\d+) 天 · 计划$/, (_, title, n) => language === 'en' ? `${translate(title)} · ${n} days · trip` : _],
    [/^最多上浮 (\d+)%\)$/, (_, n) => language === 'en' ? `up to +${n}%)` : _],
    [/^CHF (.+) \(最多上浮 (\d+)%\)$/, (_, amount, n) => language === 'en' ? `CHF ${amount} (up to +${n}%)` : _],
    [/^火车出行：(.+)$/, (zh, note) => fill('research.train_travel', { note: translate(note) }, zh)],
    [/^航班价格：(.+)$/, (zh, note) => fill('research.flight_price', { note: translate(note) }, zh)],
    [/^照片：(.+)$/, (zh, name) => fill('research.photo_credit', { name }, zh)],
    [/^正在比较 (\d+) 个 (\d+) 天组合…$/, (zh, count, days) => fill('research.comparing_combos', { count, days }, zh)],
    [/^已加入第 (\d+) 天$/, (zh, n) => fill('shopping.added_day', { n }, zh)],
    [/^Google Maps 尚未连接：(.+)$/, (zh, message) => fill('origin.maps_error', { message }, zh)],
    [/^查看 (.+) 的完整方案$/, (zh, name) => language === 'en' ? `View the full plan for ${translate(name)}` : zh],
    [/^已切换至 (.+)$/, (zh, name) => fill('share.switched', { name }, zh)],
    [/^选择加入 (.+) 的日期$/, (zh, name) => language === 'en' ? `Choose a day for ${name}` : zh],
    [/^选择将 (.+) 加入哪一天$/, (zh, name) => language === 'en' ? `Choose which day to add ${name}` : zh],
    [/^已选 (\d+) 天。可在这里改为其他范围或输入精确天数。$/, (zh, n) => language === 'en' ? `Selected ${n} days. Change the range here, or enter an exact number.` : zh],
    [/^苏黎世秋季假期 · (.+)$/, (zh, range) => language === 'en' ? `Zurich autumn holiday · ${translate(range)}` : zh],
    [/^卢加诺，瑞士｜(.+)$/, (zh, rest) => language === 'en' ? `Lugano, Switzerland | ${translate(rest)}` : zh],
    [/^(.+) 站 → (.+)：巴士约 (.+)；湖边步行约 (.+)。$/, (zh, from, hotel, bus, walk) => language === 'en' ? `${from} station → ${hotel}: bus about ${bus}; lakeside walk about ${walk}.` : zh],
    [/^(.+) 站 → (.+)$/, (zh, from, to) => language === 'en' ? `${from} station → ${translate(to)}` : zh],
    [/^Monte Brè 缆车 · (.+)$/, (zh, hours) => language === 'en' ? `Monte Brè funicular · ${hours}` : zh],
  ];

  const hasHan = value => /[\u4e00-\u9fff]/.test(value || '');

  function lookup(key, lang = language) {
    return LOCALES[lang]?.[key] ?? LOCALES.zh?.[key] ?? LOCALES.en?.[key] ?? null;
  }

  function interpolate(text, vars) {
    if (!vars || text == null) return text;
    return String(text).replace(/\{(\w+)\}/g, (_, name) => (
      vars[name] == null ? `{${name}}` : String(vars[name])
    ));
  }

  function fill(key, vars, fallback) {
    const template = lookup(key) ?? fallback;
    return interpolate(template, vars);
  }

  function warnMissing(original, result) {
    if (language !== 'en' || !hasHan(result) || warned.has(original)) return;
    warned.add(original);
    console.warn('[i18n] residual Chinese:', original, '→', result);
  }

  function translateExact(text) {
    const key = ZH_TO_KEY[text] || ZH_TO_KEY[`${text}…`] || ZH_TO_KEY[`${text}...`];
    if (key) return lookup(key, 'en') || text;
    for (const [pattern, replacer] of PATTERNS) {
      if (pattern.test(text)) return text.replace(pattern, replacer);
    }
    return null;
  }

  function greedyReplace(text) {
    let index = 0;
    let out = '';
    while (index < text.length) {
      let matched = null;
      for (const phrase of PHRASE_KEYS) {
        if (!text.startsWith(phrase, index)) continue;
        if (phrase.length <= 2) {
          const before = index === 0 || /[\s·•|/／,，、;；:：\n\dA-Za-z]/.test(text[index - 1]);
          const after = index + phrase.length >= text.length || /[\s·•|/／,，、;；:：\n\dA-Za-z]/.test(text[index + phrase.length]);
          if (!(before && after)) continue;
        }
        matched = phrase;
        break;
      }
      if (matched) {
        out += lookup(ZH_TO_KEY[matched], 'en') || matched;
        index += matched.length;
      } else {
        out += text[index];
        index += 1;
      }
    }
    return out;
  }

  function translate(text) {
    if (!text || language !== 'en') return text;
    const exact = translateExact(text);
    if (exact != null) return exact;

    const parts = text.split(SEPARATOR);
    if (parts.length > 1) {
      const translated = parts.map((part, index) => {
        if (index % 2 === 1) return part;
        const trimmed = part.trim();
        if (!trimmed) return part;
        const found = translateExact(trimmed);
        if (found != null) return swapTrimmed(part, found);
        const greedy = greedyReplace(trimmed);
        return greedy === trimmed ? part : swapTrimmed(part, greedy);
      });
      const result = translated.join('');
      warnMissing(text, result);
      return result;
    }

    const greedy = greedyReplace(text);
    warnMissing(text, greedy);
    return greedy;
  }

  function resolveKey(key) {
    if (!key) return key;
    if (lookup(key, 'zh') || lookup(key, 'en')) return key;
    if (ZH_TO_KEY[key]) return ZH_TO_KEY[key];
    if (EN_TO_KEY[key]) return EN_TO_KEY[key];
    return key;
  }

  function t(key, vars) {
    if (key == null) return '';
    const resolved = resolveKey(String(key));
    const template = lookup(resolved);
    if (template != null) return interpolate(template, vars);
    const raw = String(key);
    if (language === 'en') {
      const translated = translate(raw);
      if (translated === raw && hasHan(raw)) warnMissing(raw, translated);
      return interpolate(translated, vars);
    }
    return interpolate(raw, vars);
  }

  function swapTrimmed(value, nextTrimmed) {
    const trimmed = value.trim();
    if (trimmed === nextTrimmed) return value;
    const start = value.indexOf(trimmed);
    return value.slice(0, start) + nextTrimmed + value.slice(start + trimmed.length);
  }

  function chineseSource(value) {
    if (!value) return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (hasHan(trimmed)) return value;
    if (EN_TO_KEY[trimmed] && lookup(EN_TO_KEY[trimmed], 'zh')) {
      return swapTrimmed(value, lookup(EN_TO_KEY[trimmed], 'zh'));
    }
    return null;
  }

  function rememberSource(store, key, value) {
    const source = chineseSource(value);
    const existing = store.get(key);
    if (source) {
      if (existing && existing.length > source.length) return;
      store.set(key, source);
    } else if (!store.has(key) && hasHan(value)) {
      store.set(key, value);
    }
  }

  function localized(source) {
    const trimmed = source.trim();
    const translated = translate(trimmed);
    return translated === trimmed ? source : swapTrimmed(source, translated);
  }

  function skipElement(element) {
    if (!element || element.nodeType !== 1) return true;
    if (element.matches(SKIP) || element.closest(SKIP)) return true;
    if (element.matches(`${SKIP_SELECT} option`)) return true;
    return false;
  }

  function applyKeyed(root) {
    if (!root || root.nodeType !== Node.ELEMENT_NODE) return;
    const scoped = selector => (root.matches?.(selector) ? [root, ...root.querySelectorAll(selector)] : [...root.querySelectorAll(selector)]);
    scoped('[data-i18n]').forEach(element => {
      if (skipElement(element)) return;
      const next = t(element.getAttribute('data-i18n'));
      const textNode = [...element.childNodes].find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
      if (textNode) {
        rememberSource(originals, textNode, textNode.nodeValue);
        if (textNode.nodeValue.trim() !== next) textNode.nodeValue = swapTrimmed(textNode.nodeValue, next);
      } else if (!element.childElementCount) {
        element.textContent = next;
      }
    });
    scoped('[data-i18n-placeholder]').forEach(element => {
      element.setAttribute('placeholder', t(element.getAttribute('data-i18n-placeholder')));
    });
    scoped('[data-i18n-aria-label]').forEach(element => {
      element.setAttribute('aria-label', t(element.getAttribute('data-i18n-aria-label')));
    });
    scoped('[data-i18n-title]').forEach(element => {
      element.setAttribute('title', t(element.getAttribute('data-i18n-title')));
    });
    scoped('[data-i18n-attr]').forEach(element => {
      String(element.getAttribute('data-i18n-attr') || '').split(',').forEach(part => {
        const [attr, key] = part.trim().split(':');
        if (attr && key) element.setAttribute(attr, t(key));
      });
    });
  }

  function applyTextNode(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const parent = node.parentElement;
    if (skipElement(parent)) return;
    const current = node.nodeValue;
    const trimmed = current.trim();
    if (!trimmed) return;
    rememberSource(originals, node, current);
    if (language === 'zh') {
      const source = originals.get(node);
      const next = (source && hasHan(source.trim())) ? source : (chineseSource(current) || current);
      if (node.nodeValue !== next) node.nodeValue = next;
      return;
    }
    const source = originals.get(node) || current;
    const next = localized(source);
    if (node.nodeValue !== next) node.nodeValue = next;
  }

  function applyAttrs(element) {
    if (skipElement(element)) return;
    let stored = originalAttrs.get(element);
    if (!stored) {
      stored = {};
      originalAttrs.set(element, stored);
    }
    ATTRS.forEach(name => {
      const current = element.getAttribute(name);
      if (current == null) return;
      const recovered = chineseSource(current) || chineseSource(stored[name] || '');
      if (recovered) stored[name] = recovered;
      else if (stored[name] == null) stored[name] = current;
      const source = stored[name];
      const next = language === 'en' ? localized(source) : source;
      if (element.getAttribute(name) !== next) element.setAttribute(name, next);
    });
  }

  function apply(root = document.body) {
    if (!root) return;
    const wasApplying = applying;
    applying = true;
    observer.disconnect();
    try {
      if (root.nodeType === Node.TEXT_NODE) {
        applyTextNode(root);
        return;
      }
      if (root.nodeType !== Node.ELEMENT_NODE && root !== document.body && root !== document.documentElement) return;
      applyKeyed(root);
      if (root === document.body) applyKeyed(document.head);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) applyTextNode(node);
      if (root.nodeType === Node.ELEMENT_NODE) {
        applyAttrs(root);
        root.querySelectorAll(ATTRS.map(name => `[${name}]`).join(',')).forEach(applyAttrs);
      }
    } finally {
      if (!wasApplying) {
        observe();
        applying = false;
      }
    }
  }

  function captureNewSource(node) {
    if (!node || node.nodeType !== Node.TEXT_NODE) return;
    const trimmed = node.nodeValue.trim();
    if (!trimmed) return;
    rememberSource(originals, node, node.nodeValue);
    if (language === 'en' || chineseSource(node.nodeValue)) applyTextNode(node);
  }

  const observer = new MutationObserver(mutations => {
    if (applying) return;
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        captureNewSource(mutation.target);
        continue;
      }
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) captureNewSource(node);
        else if (node.nodeType === Node.ELEMENT_NODE) apply(node);
      });
    }
  });

  function observe() {
    if (!document.body) return;
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: ATTRS
    });
  }

  function readCookieLanguage() {
    const match = document.cookie.match(/(?:^|; )offwego_language=(en|zh)/);
    return match ? match[1] : null;
  }

  function readStoredLanguage() {
    try {
      const local = localStorage.getItem(STORAGE_KEY);
      if (local === 'en' || local === 'zh') return local;
    } catch {}
    const cookie = readCookieLanguage();
    if (cookie === 'en' || cookie === 'zh') return cookie;
    return null;
  }

  function persistLocal(next) {
    try { localStorage.setItem(STORAGE_KEY, next); } catch {}
    document.cookie = `${COOKIE_KEY}=${next};path=/;max-age=31536000;SameSite=Lax`;
  }

  function bindSelects() {
    document.querySelectorAll('#language, #detailLanguage').forEach(select => {
      if (select.dataset.i18nBound === 'true') return;
      select.dataset.i18nBound = 'true';
      if (select.value !== language) select.value = language;
      select.addEventListener('change', () => setLanguage(select.value));
    });
  }

  function setLanguage(next, options = {}) {
    const persist = options.persist !== false;
    const normalized = next === 'en' ? 'en' : 'zh';
    const changed = normalized !== language;
    language = normalized;
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    document.documentElement.dataset.language = language;
    document.querySelectorAll('#language, #detailLanguage').forEach(select => {
      if (select.value !== language) select.value = language;
    });
    apply(document.body);
    document.documentElement.dataset.i18nReady = 'true';
    bindSelects();
    if (persist) persistLocal(language);
    if (changed) {
      window.dispatchEvent(new CustomEvent('offwego:language', { detail: { language } }));
      requestAnimationFrame(() => apply(document.body));
      [0, 50, 300, 800].forEach(delay => setTimeout(() => apply(document.body), delay));
    }
    if (persist && changed && window.OffWeGoState) {
      OffWeGoState.patch(current => ({
        preferences: { ...(current.preferences || {}), language }
      })).catch(() => {});
    }
    return language;
  }

  async function hydrate() {
    bindSelects();
    apply(document.body);
    const local = readStoredLanguage();
    try {
      if (window.OffWeGoState?.ready) {
        await OffWeGoState.ready;
        const saved = OffWeGoState.get().state?.preferences?.language;
        if (local === 'en' || local === 'zh') {
          setLanguage(local, { persist: saved !== local });
        } else if (saved === 'en' || saved === 'zh') {
          setLanguage(saved, { persist: true });
        }
      } else if (local === 'en' || local === 'zh') {
        setLanguage(local, { persist: false });
      }
    } catch {
      apply(document.body);
    }
    bindSelects();
    document.documentElement.dataset.i18nReady = 'true';
  }

  const stored = readStoredLanguage();
  if (stored) language = stored;
  document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
  document.documentElement.dataset.language = language;

  window.OffWeGoI18n = {
    t,
    apply,
    getLanguage: () => language,
    setLanguage,
    locale: () => (language === 'en' ? 'en-GB' : 'zh-CN'),
    has: key => Boolean(lookup(resolveKey(key))),
    matches(text, zh) {
      const value = String(text || '');
      const english = ZH_TO_KEY[zh] ? lookup(ZH_TO_KEY[zh], 'en') : '';
      return value.includes(zh) || (english && value.includes(english));
    },
    acceptLanguage: () => (language === 'en' ? 'en-GB,en;q=0.9' : 'zh-CN,zh;q=0.9,en;q=0.5'),
    languageCode: () => (language === 'en' ? 'en' : 'zh-CN'),
    message(text) {
      if (!text) return '';
      const translated = t(String(text));
      return translated;
    },
    format: {
      family({ adults = 0, children = 0, pets = 0 } = {}) {
        return pets
          ? t('family.count_with_pets', { adults, children, pets })
          : t('family.count', { adults, children });
      },
      days: n => t('format.days', { n }),
      members: n => t('format.members_saved', { n }),
      number(value, options) {
        return new Intl.NumberFormat(language === 'en' ? 'en-GB' : 'zh-CN', options).format(Number(value));
      },
      money(amount, currency, options = {}) {
        const value = Number(amount);
        if (!Number.isFinite(value)) return '';
        const digits = options.digits ?? (Number.isInteger(value) ? 0 : 2);
        const formatted = new Intl.NumberFormat(language === 'en' ? 'en-GB' : 'zh-CN', {
          minimumFractionDigits: digits,
          maximumFractionDigits: digits
        }).format(value);
        return currency ? `${currency} ${formatted}` : formatted;
      },
      date(value, options) {
        const raw = String(value || '');
        const iso = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? `${raw}T12:00:00` : raw;
        const date = value instanceof Date ? value : new Date(iso);
        if (Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'zh-CN', options || { month: 'short', day: 'numeric' }).format(date);
      },
      time(value, options) {
        const date = value instanceof Date ? value : new Date(value);
        if (Number.isNaN(date.getTime())) return '';
        return new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'zh-CN', options || { hour: '2-digit', minute: '2-digit', hour12: false }).format(date);
      },
      familyType(type) {
        if (type === '成年人' || type === 'adult' || type === 'Adult') return t('family.type_adult');
        if (type === '孩子' || type === 'child' || type === 'Child') return t('family.type_child');
        return t(type);
      }
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate, { once: true });
  } else {
    hydrate();
  }
  window.addEventListener('load', () => {
    document.documentElement.dataset.i18nReady = 'true';
  });
  window.addEventListener('offwego:navigate', () => apply(document.body));

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url || '';
    const headers = new Headers(init.headers || {});
    const langValue = language === 'en' ? 'en' : 'zh';
    if (!headers.has('X-OffWeGo-Language')) headers.set('X-OffWeGo-Language', langValue);
    if (!headers.has('Accept-Language')) {
      headers.set('Accept-Language', language === 'en' ? 'en-GB,en;q=0.9' : 'zh-CN,zh;q=0.9,en;q=0.5');
    }
    let body = init.body;
    const pathname = (() => { try { return new URL(url, location.href).pathname; } catch { return url; } })();
    if (
      pathname.startsWith('/api/') &&
      pathname !== '/api/state' &&
      typeof body === 'string' &&
      (headers.get('Content-Type') || '').includes('application/json')
    ) {
      try {
        const parsed = JSON.parse(body);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.language == null && parsed.locale == null) {
          parsed.language = langValue;
          body = JSON.stringify(parsed);
        }
      } catch {}
    }
    return nativeFetch(input, { ...init, headers, body });
  };
})();
