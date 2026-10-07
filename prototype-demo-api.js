(() => {
  'use strict';

  const STORAGE_KEY = 'offwego:prototype-state';
  const defaults = {
    preferences: { language: 'zh', currency: 'CHF', origin: 'Zürich', pace: '轻松' },
    family: [],
    travellers: { adults: 2, children: 0, pets: 0 },
    trips: [],
    pets: 0
  };

  function readState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
      return {
        ...defaults,
        ...parsed,
        preferences: { ...defaults.preferences, ...(parsed.preferences || {}) },
        travellers: { ...defaults.travellers, ...(parsed.travellers || {}) }
      };
    } catch {
      return { ...defaults, preferences: { ...defaults.preferences }, travellers: { ...defaults.travellers } };
    }
  }

  function json(status, body) {
    return new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
  }

  function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function pathnameOf(input) {
    const url = String(input instanceof Request ? input.url : input);
    try { return new URL(url, location.href).pathname; }
    catch { return url; }
  }

  async function readBody(input, init) {
    const raw = init?.body != null ? init.body : (input instanceof Request ? await input.clone().text() : '');
    if (!raw) return {};
    try { return JSON.parse(typeof raw === 'string' ? raw : String(raw)); }
    catch { return {}; }
  }

  const recommendations = [
    {
      destination: '卢加诺',
      reason: '从苏黎世坐火车即可到达，湖边步道和游乐场适合带孩子的轻松假期。',
      note: '车站到湖边酒店有巴士，抵达当天不用拖着行李走很远。',
      transportMode: 'train',
      transportNote: '苏黎世到卢加诺火车约 2 小时 10 分，途中可看湖景。'
    },
    {
      destination: '米兰',
      reason: '同一段假期里，火车当天往返也够用；老城和公园可以按孩子的节奏拆开。',
      note: '想压缩路程就选早班车，下午给自由活动。',
      transportMode: 'train',
      airportCode: 'MXP',
      transportNote: '苏黎世到米兰火车约 3 小时 20 分。'
    },
    {
      destination: '科尔马',
      reason: '阿尔萨斯小镇步行尺度小，适合不想赶场的家庭。',
      note: '老城街道短，中午可以回住处休息。',
      transportMode: 'train',
      transportNote: '苏黎世经巴塞尔到科尔马，火车约 2 小时 30 分。'
    }
  ];

  function journeyQuote(payload) {
    const destination = payload.destination || 'Lugano';
    const origin = payload.origin || 'Zürich HB';
    const start = payload.departureTime ? new Date(payload.departureTime) : new Date('2026-10-05T07:00:00Z');
    const arrival = new Date(start.getTime() + 2.2 * 3600 * 1000);
    return {
      origin,
      destination,
      source: '示例时刻表',
      departureTime: start.toISOString(),
      arrivalTime: arrival.toISOString(),
      duration: 'PT2H12M',
      transfers: 0,
      fare: { amount: 63, currency: 'CHF' },
      fareNote: '成人二等座单程公开参考价',
      fareReference: {
        label: '公开参考价',
        amount: 63,
        currency: 'CHF',
        checkedAt: '09:00',
        sourceUrl: 'https://www.sbb.ch/'
      }
    };
  }

  function tripDetailResearch(payload) {
    const destination = payload.destination || '卢加诺';
    return {
      destination,
      stay: {
        name: 'Hotel De La Paix',
        area: '湖边 / Paradiso',
        reason: '车站可接巴士，适合抵达日减少拖行李。',
        positive: '家庭房和湖景早餐露台。',
        risks: ['旺季需提前预订'],
        rooms: '按家庭人数估算 2 间房',
        lowestNightly: { amount: 240, currency: 'CHF', sourceUrl: '', checkedAt: '上午' },
        nights: Math.max(1, Number(payload.days) || 5),
        images: [],
        mapUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+De+La+Paix+Lugano',
        bookingUrl: 'https://www.google.com/travel/hotels?q=Hotel%20De%20La%20Paix%20Lugano'
      },
      shopping: [
        { name: 'Gabbani', category: '食品', reason: '买当天的面包和水果，走路就能到。', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Gabbani+Lugano', photo: null },
        { name: 'Via Nassa', category: '步行街', reason: '短街，孩子走累了随时可以折返。', mapUrl: 'https://www.google.com/maps/search/?api=1&query=Via+Nassa+Lugano', photo: null }
      ],
      preparation: {
        entry: { label: '入境', title: '申根旅行', body: '瑞士在申根区。带好护照，从苏黎世出发通常不需要额外签证手续。', url: '' },
        money: { label: '钱与支付', title: 'CHF 为主', body: '湖边餐厅多数可刷卡；建议带少量现金买零食和游乐场。', url: '' },
        connectivity: { label: '网络', title: 'eSIM 或漫游', body: '抵达后打开漫游即可。酒店有无线网，湖边步道信号稳定。', url: '' }
      },
      sources: [],
      provider: '示例行程资料',
      researchedAt: new Date().toISOString()
    };
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const method = (init.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const pathname = pathnameOf(input);
    if (!pathname.includes('/api/')) return nativeFetch(input, init);
    const apiPath = pathname.slice(pathname.indexOf('/api/'));
    const payload = method === 'GET' ? {} : await readBody(input, init);

    if (apiPath === '/api/bootstrap' && method === 'GET') {
      return json(200, {
        state: readState(),
        keys: { DeepSeek: false, Gemini: false, GoogleMaps: false, Duffel: false, OJP: false, OJPFare: false }
      });
    }
    if (apiPath === '/api/state' && method === 'PUT') {
      const prev = readState();
      const next = {
        ...prev,
        ...payload,
        preferences: { ...prev.preferences, ...(payload.preferences || {}) },
        travellers: { ...prev.travellers, ...(payload.travellers || {}) }
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return json(200, { ok: true });
    }
    if (apiPath === '/api/exchange-rates' && method === 'GET') {
      return json(200, { base: 'CHF', date: '2026-09-26', rates: { CHF: 1, EUR: 1.04, USD: 1.22, CNY: 8.70 }, source: 'prototype' });
    }
    if (apiPath === '/api/recommendations' && method === 'POST') {
      await wait(700);
      return json(200, { recommendations, generatedAt: new Date().toISOString(), source: '示例推荐' });
    }
    if (apiPath === '/api/flights/window' && method === 'POST') {
      const start = payload.startDate || '2026-10-05';
      return json(200, {
        lowest: { departureDate: start, returnDate: payload.endDate || '2026-10-09', currency: 'CHF', amount: 186, airline: 'easyJet' },
        recommended: { departureDate: start, returnDate: payload.endDate || '2026-10-09', currency: 'CHF', amount: 186, airline: 'easyJet' },
        checkedDates: 4,
        stayDays: Number(payload.stayDays) || 5
      });
    }
    if (apiPath === '/api/hotel-research' && method === 'POST') {
      return json(200, {
        provider: '示例住宿备注',
        text: `${payload.destination || '目的地'}：湖边或老城步行范围内的家庭房更合适。示例数据，不是实时报价。`,
        sources: []
      });
    }
    if (apiPath === '/api/trip-detail-research' && method === 'POST') {
      await wait(400);
      return json(200, tripDetailResearch(payload));
    }
    if (apiPath === '/api/places/autocomplete' && method === 'POST') {
      const query = String(payload.input || '').toLowerCase();
      const all = ['Zürich', 'Zürich HB', 'Zürich Flughafen', 'Lugano'];
      return json(200, { suggestions: all.filter(item => item.toLowerCase().includes(query) || query.length < 2).slice(0, 5).map(text => ({ text })) });
    }
    if (apiPath === '/api/journey-quote' && method === 'POST') return json(200, journeyQuote(payload));
    if (apiPath === '/api/fare-reference' && method === 'POST') {
      return json(200, { fareReference: { label: '公开参考价', amount: payload.mode === 'flight' ? 186 : 63, currency: 'CHF', checkedAt: '09:00', sourceUrl: 'https://www.sbb.ch/' } });
    }
    if (apiPath === '/api/drive-estimate' && method === 'POST') {
      return json(200, { origin: payload.origin, destination: payload.destination, oneWayKm: 220, roundTripKm: 440, duration: 'PT2H40M', consumption: 7, fuelPrice: 2.10, fuelLitres: 30.8, fuelCost: 65, vignette: 40, totalWithVignette: 105, totalWithoutVignette: 65 });
    }
    if (apiPath === '/api/transport-options' && method === 'POST') {
      const flight = /tenerife|特内里费|flight|飞机/i.test(payload.destination || '');
      return json(200, { modes: flight ? ['flight'] : ['train', 'drive'], primary: flight ? 'flight' : 'train', reason: flight ? '需要飞机' : '火车是这次的推荐方式' });
    }
    if (apiPath === '/api/place-hours' && method === 'POST') {
      return json(200, { name: payload.query || 'Monte Brè', date: payload.date || '2026-10-07', hours: '09:00–19:00', frequency: '约每 30 分钟', journeyMinutes: 15, mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Funicolare+Monte+Bre+Lugano' });
    }
    if (apiPath.startsWith('/api/keys/') && method === 'PUT') return json(200, { ok: true });
    if ((apiPath === '/api/duffel' || apiPath === '/api/ojp' || apiPath === '/api/ojp-fare') && method === 'PUT') return json(200, { ok: true });
    if (apiPath === '/api/flights' && method === 'POST') {
      return json(200, { data: { live_mode: false, offers: [{ total_amount: '186', total_currency: 'CHF', owner: { name: 'easyJet' } }] } });
    }
    return json(200, { ok: true, prototype: true });
  };
})();
