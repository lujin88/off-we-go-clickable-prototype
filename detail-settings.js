(function () {
  'use strict';

  const PROVIDERS = {
    DeepSeek: { endpoint: '/api/keys/DeepSeek', field: 'key' },
    Gemini: { endpoint: '/api/keys/Gemini', field: 'key' },
    GoogleMaps: { endpoint: '/api/keys/GoogleMaps', field: 'key' },
    Duffel: { endpoint: '/api/duffel', field: 'token' },
    OJP: { endpoint: '/api/ojp', field: 'token' },
    OJPFare: { endpoint: '/api/ojp-fare', field: 'token' }
  };

  const t = (key, vars) => window.OffWeGoI18n?.t(key, vars) ?? key;
  const requestJson = async (url, options) => {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) throw new Error(window.OffWeGoI18n?.t(data.error) || data.error || t('common.request_failed'));
    return data;
  };

  const familyCount = (state, type, fallback) => {
    const travellerKey = type === '成年人' ? 'adults' : 'children';
    const saved = Number(state.travellers?.[travellerKey]);
    if (Number.isFinite(saved) && saved >= 0) return saved;
    const count = (state.family || []).filter(member => member.type === type).length;
    return count || fallback;
  };

  function init({ notify = () => {} } = {}) {
    const panel = document.querySelector('#settingsPanel');
    const trigger = document.querySelector('.settings');
    if (!panel || !trigger) return;

    const language = panel.querySelector('#detailLanguage');
    const currency = panel.querySelector('#detailCurrency');
    const origin = panel.querySelector('#detailOrigin');
    const family = panel.querySelector('#detailFamily');
    let state = null;

    const render = data => {
      state = data.state;
      const preferences = state.preferences || {};
      let storedLanguage = null;
      try { storedLanguage = localStorage.getItem('offwego:language'); } catch {}
      language.value = (storedLanguage === 'en' || storedLanguage === 'zh') ? storedLanguage : (preferences.language || 'zh');
      currency.value = preferences.currency || 'CHF';
      origin.textContent = preferences.origin || 'Kilchberg, Zürich';
      family.childNodes[0].textContent = t('family.count', {
        adults: familyCount(state, '成年人', 2),
        children: familyCount(state, '孩子', 0)
      });

      panel.querySelectorAll('.api-status').forEach(status => {
        const connected = Boolean(data.keys?.[status.dataset.provider]);
        status.dataset.connected = connected ? 'true' : 'false';
        status.textContent = t(connected ? 'common.connected' : 'common.not_connected');
        status.classList.toggle('connected', connected);
        const action = panel.querySelector(`.provider-action[data-provider="${status.dataset.provider}"]`);
        if (action) action.textContent = t(connected ? 'common.update' : 'common.connect');
      });
    };

    const refresh = async () => {
      try {
        await OffWeGoState.ready;
        render(OffWeGoState.get());
      } catch {
        panel.querySelectorAll('.api-status').forEach(status => { status.textContent = t('common.could_not_load'); });
      }
    };

    const persist = async updater => {
      await OffWeGoState.patch(updater);
      state = OffWeGoState.get().state;
    };

    const open = () => {
      panel.classList.add('show');
      panel.setAttribute('aria-hidden', 'false');
      trigger.setAttribute('aria-expanded', 'true');
      document.body.classList.add('modal-open');
      panel.querySelector('.settings-close')?.focus();
      refresh();
    };

    const close = () => {
      panel.classList.remove('show');
      panel.setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('modal-open');
      trigger.focus();
    };

    window.addEventListener('offwego:language', () => { if (state) refresh(); });
    trigger.addEventListener('click', open);
    panel.querySelectorAll('.settings-close').forEach(button => button.addEventListener('click', close));
    panel.addEventListener('click', event => { if (event.target === panel) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && panel.classList.contains('show')) close(); });

    language.addEventListener('change', async event => {
      if (window.OffWeGoI18n) {
        window.OffWeGoI18n.setLanguage(event.target.value);
      } else {
        await persist(current => ({
          preferences: { ...(current.preferences || {}), language: event.target.value }
        }));
      }
      notify(t('copy.interface_language_saved'));
    });

    currency.addEventListener('change', async event => {
      await persist(current => ({
        preferences: { ...(current.preferences || {}), currency: event.target.value }
      }));
      window.dispatchEvent(new CustomEvent('currencychange', { detail: { currency: event.target.value } }));
      notify(t('copy.display_currency_saved'));
    });

    const originButton = panel.querySelector('#detailEditOrigin');
    const setOriginAction = mode => {
      originButton.textContent = t(mode === 'done' ? 'common.done' : 'common.edit');
    };
    originButton.addEventListener('click', async () => {
      const escapeHtml = window.OffWeGoUi?.escapeHtml || (value => String(value ?? '').replace(/[&<>'"]/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
      }[character])));
      const row = origin.closest('.setting-row');
      const existing = row.querySelector('.origin-editor');
      if (existing) {
        const value = existing.querySelector('input')?.value.trim();
        if (!value) {
          existing.querySelector('input')?.focus();
          return;
        }
        origin.textContent = value;
        origin.hidden = false;
        existing.remove();
        setOriginAction('edit');
        await persist(live => ({
          preferences: { ...(live.preferences || {}), origin: value }
        }));
        notify(t('copy.default_departure_saved'));
        return;
      }
      await OffWeGoState.ready;
      const current = OffWeGoState.get().state?.preferences?.origin || origin.textContent || 'Kilchberg, Zürich';
      origin.hidden = true;
      const editor = document.createElement('div');
      editor.className = 'origin-editor';
      editor.innerHTML = `<label class="visually-hidden" for="detailOriginSearch">${escapeHtml(t('settings.origin'))}</label><input id="detailOriginSearch" type="text" value="${escapeHtml(current)}" aria-label="${escapeHtml(t('settings.origin'))}">`;
      origin.after(editor);
      setOriginAction('done');
      const input = editor.querySelector('input');
      input.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          originButton.click();
        }
        if (event.key === 'Escape') {
          event.preventDefault();
          event.stopPropagation();
          origin.hidden = false;
          editor.remove();
          setOriginAction('edit');
        }
      });
      input.focus();
      input.select();
    });

    panel.querySelector('#detailEditFamily').addEventListener('click', () => {
      notify(t('copy.manage_family_members_from_the_home_workbench'));
    });

    panel.querySelectorAll('.provider-action').forEach(button => {
      button.addEventListener('click', () => {
        const provider = button.dataset.provider;
        const config = PROVIDERS[provider];
        const row = button.closest('.setting-row');
        const label = row.querySelector('b').childNodes[0].textContent.trim();
        const existing = panel.querySelector(`.service-inline[data-provider="${provider}"]`);
        if (existing) {
          existing.querySelector('input')?.focus();
          return;
        }
        if (!config) return;
        const escapeHtml = window.OffWeGoUi?.escapeHtml || (value => String(value ?? '').replace(/[&<>'"]/g, character => ({
          '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[character])));
        const editor = document.createElement('div');
        const inputId = `secret-${provider}`;
        editor.className = 'service-inline';
        editor.dataset.provider = provider;
        editor.innerHTML = `<label for="${inputId}">${escapeHtml(t('connect.prompt_secret', { name: label }))}</label><input id="${inputId}" class="field" type="password" autocomplete="off"><p class="service-error" hidden></p><div class="actions"><button type="button" class="outline secret-cancel">${escapeHtml(t('common.cancel'))}</button><button type="button" class="primary secret-save">${escapeHtml(t('common.save'))}</button></div>`;
        row.after(editor);
        const input = editor.querySelector('input');
        const error = editor.querySelector('.service-error');
        editor.querySelector('.secret-cancel').addEventListener('click', () => editor.remove());
        input.addEventListener('keydown', event => {
          if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            editor.remove();
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            editor.querySelector('.secret-save').click();
          }
        });
        editor.querySelector('.secret-save').addEventListener('click', async () => {
          const value = input.value.trim();
          if (!value) {
            error.hidden = false;
            error.textContent = t('api.invalid_key');
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', error.id || (error.id = `${inputId}-error`));
            input.focus();
            return;
          }
          button.disabled = true;
          button.textContent = t('common.checking');
          try {
            await requestJson(config.endpoint, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ [config.field]: value })
            });
            const status = panel.querySelector(`.api-status[data-provider="${provider}"]`);
            if (status) {
              status.textContent = t('common.connected');
              status.classList.add('connected');
              status.dataset.connected = 'true';
            }
            button.textContent = t('common.update');
            editor.remove();
            notify(t('connect.connected_named', { name: label }));
          } catch (err) {
            error.hidden = false;
            error.id = `${inputId}-error`;
            error.textContent = t('connect.failed', { message: err.message });
            input.setAttribute('aria-invalid', 'true');
            input.setAttribute('aria-describedby', error.id);
            notify(t('connect.failed', { message: err.message }), 4200);
          } finally {
            button.disabled = false;
          }
        });
        input.focus();
      });
    });

    window.addEventListener('offwego:language', () => {
      if (state) {
        try { render({ state, keys: OffWeGoState.get().keys }); } catch {}
      }
    });
  }

  window.OffWeGoDetailSettings = { init };
})();
