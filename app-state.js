(() => {
  'use strict';

  // Owns server-backed user data: preferences, family, travellers, trips, currentTrip, pets.
  // Does not own localStorage car-rental prefs or sessionStorage plan handoff —
  // those are per-device / per-tab ephemeral, not synced user data.

  const BOOTSTRAP_URL = '/api/bootstrap';
  const STATE_URL = '/api/state';

  let snapshot = null;
  let persistInFlight = null;
  let persistQueued = false;
  const listeners = new Set();

  function clone(value) {
    if (value == null) return value;
    return typeof structuredClone === 'function'
      ? structuredClone(value)
      : JSON.parse(JSON.stringify(value));
  }

  function view() {
    return {
      state: clone(snapshot.state),
      keys: { ...snapshot.keys }
    };
  }

  function notify() {
    const current = view();
    listeners.forEach(listener => {
      try { listener(current); } catch {}
    });
  }

  async function requestJson(url, options) {
    const response = await fetch(url, options);
    const raw = await response.text();
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; }
    catch { throw new Error(window.OffWeGoI18n?.t('toast.unreadable') || '本机服务返回了无法读取的响应。'); }
    if (!response.ok) throw new Error(window.OffWeGoI18n?.t(data.error) || data.error || window.OffWeGoI18n?.t('common.request_failed') || '请求失败');
    return data;
  }

  const ready = requestJson(BOOTSTRAP_URL).then(data => {
    snapshot = {
      state: data.state && typeof data.state === 'object' ? data.state : {},
      keys: data.keys && typeof data.keys === 'object' ? data.keys : {}
    };
    return view();
  });

  function get() {
    if (!snapshot) {
      throw new Error('OffWeGoState.get() called before OffWeGoState.ready resolved');
    }
    return view();
  }

  function apply(updater) {
    const current = snapshot.state;
    const partial = typeof updater === 'function' ? updater(clone(current)) : updater;
    if (!partial || typeof partial !== 'object' || Array.isArray(partial)) {
      throw new Error('OffWeGoState.patch() requires an object or (current) => partial');
    }
    snapshot.state = { ...current, ...partial };
  }

  function persist() {
    if (persistInFlight) {
      persistQueued = true;
      return persistInFlight;
    }
    persistInFlight = (async () => {
      try {
        do {
          persistQueued = false;
          const payload = clone(snapshot.state);
          await requestJson(STATE_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
        } while (persistQueued);
      } finally {
        persistInFlight = null;
      }
      if (persistQueued) return persist();
    })();
    return persistInFlight;
  }

  async function patch(updater) {
    if (!snapshot) await ready;
    apply(updater);
    notify();
    await persist();
    return get();
  }

  function subscribe(listener) {
    if (typeof listener !== 'function') return () => {};
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  window.OffWeGoState = Object.freeze({
    ready,
    get,
    patch,
    subscribe
  });
})();
