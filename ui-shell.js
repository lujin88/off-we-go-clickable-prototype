/* Dialog, toast, escape, and focus-trap behavior shared by the workbench and trip detail. */
(() => {
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[character]));

  const externalLinkHtml = ({ href, label, className = 'external-link' } = {}) => {
    const classes = String(className || 'external-link').trim() || 'external-link';
    return `<a class="${escapeHtml(classes)}" href="${escapeHtml(href || '#')}" target="_blank" rel="noreferrer">${escapeHtml(label || '')} <i class="ri-external-link-line" aria-hidden="true"></i></a>`;
  };

  const googleMapsLinkHtml = ({ href, extraClass = '' } = {}) => {
    const t = window.OffWeGoI18n?.t || (key => key);
    const classes = ['google-map-link', extraClass].filter(Boolean).join(' ');
    return externalLinkHtml({ href, label: t('copy.google_maps'), className: classes });
  };

  window.OffWeGoUi = Object.freeze({
    ...(window.OffWeGoUi || {}),
    escapeHtml,
    externalLinkHtml,
    googleMapsLinkHtml
  });
})();

(() => {
  const FOCUSABLE = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  const DIALOG_ROOTS = '.modal, .plan-confirm, .settings-panel, .share-panel, .confirm-panel';
  const OPEN_DIALOGS = [
    '.modal.show',
    '.plan-confirm.show',
    '.settings-panel.show',
    '.share-panel.show',
    '.confirm-panel.show'
  ].join(',');
  const DIALOG_CLOSE = '.close, .settings-close, .share-close, .share-cancel, .plan-confirm-cancel, .confirm-cancel, [data-dialog-close]';

  const isShown = element => {
    if (!element || element.disabled || element.hidden) return false;
    if (element.closest('[hidden], [inert]')) return false;
    if (typeof element.checkVisibility === 'function') {
      return element.checkVisibility({ checkOpacity: false, checkVisibilityCSS: true });
    }
    let current = element;
    while (current && current !== document.documentElement) {
      const style = window.getComputedStyle(current);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      current = current.parentElement;
    }
    return true;
  };

  const focusables = root => [...root.querySelectorAll(FOCUSABLE)].filter(isShown);

  const firstFocusable = root => focusables(root)[0];

  const activeDialog = () => [...document.querySelectorAll(OPEN_DIALOGS)].at(-1) || null;

  const syncBackdrop = () => {
    const openDialogs = [...document.querySelectorAll(OPEN_DIALOGS)];
    const locked = openDialogs.length > 0;
    [...document.body.children].forEach(child => {
      const isDialog = child.matches?.(DIALOG_ROOTS);
      if (child.id === 'toast' || child.id === 'planSnackbar' || child.classList?.contains('skip-link')) {
        child.removeAttribute('inert');
        return;
      }
      if (isDialog) {
        child.toggleAttribute('inert', locked && !child.classList.contains('show'));
        return;
      }
      if (child.id === 'home') {
        child.toggleAttribute('inert', locked || child.style.display === 'none');
        return;
      }
      if (child.classList?.contains('page')) {
        child.toggleAttribute('inert', locked || !child.classList.contains('show'));
        return;
      }
      child.toggleAttribute('inert', locked);
    });
  };

  const trapFocus = event => {
    if (event.key !== 'Tab') return;
    const dialog = activeDialog();
    if (!dialog) return;
    const items = focusables(dialog);
    if (!items.length) {
      event.preventDefault();
      dialog.tabIndex = -1;
      dialog.focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    const inside = dialog.contains(active);
    if (event.shiftKey && (!inside || active === first)) {
      event.preventDefault();
      last.focus();
      return;
    }
    if (!event.shiftKey && (!inside || active === last)) {
      event.preventDefault();
      first.focus();
    }
  };

  document.querySelectorAll(DIALOG_ROOTS).forEach(dialog => {
    const hasInnerDialog = Boolean(dialog.querySelector('[role="dialog"], [role="alertdialog"]'));
    if (!dialog.hasAttribute('role') && !hasInnerDialog) dialog.setAttribute('role', 'dialog');
    if (!hasInnerDialog) dialog.setAttribute('aria-modal', 'true');
    if (!dialog.hasAttribute('aria-hidden')) {
      dialog.setAttribute('aria-hidden', dialog.classList.contains('show') ? 'false' : 'true');
    }
    if (!dialog.hasAttribute('tabindex')) dialog.tabIndex = -1;
    new MutationObserver(() => {
      const open = dialog.classList.contains('show');
      dialog.setAttribute('aria-hidden', open ? 'false' : 'true');
      syncBackdrop();
      if (open) {
        dialog._returnFocus = dialog._returnFocus || document.activeElement;
        if (!dialog.contains(document.activeElement)) firstFocusable(dialog)?.focus();
      } else if (dialog._returnFocus instanceof HTMLElement) {
        dialog._returnFocus.focus();
        dialog._returnFocus = null;
      }
    }).observe(dialog, { attributes: true, attributeFilter: ['class'] });
  });

  const moveRoving = (items, current, key) => {
    const index = items.indexOf(current);
    if (index < 0) return null;
    if (key === 'Home') return items[0];
    if (key === 'End') return items[items.length - 1];
    if (key === 'ArrowRight' || key === 'ArrowDown') return items[(index + 1) % items.length];
    return items[(index - 1 + items.length) % items.length];
  };

  document.addEventListener('keydown', event => {
    trapFocus(event);

    const radioGroup = event.target.closest?.('[role="radiogroup"]');
    if (radioGroup && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      const radios = [...radioGroup.querySelectorAll('[role="radio"]')].filter(isShown);
      const next = moveRoving(radios, event.target, event.key);
      if (next) {
        event.preventDefault();
        next.focus();
        next.click();
      }
    } else {
      const tablist = event.target.closest?.('[role="tablist"]');
      if (tablist && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        const tabs = [...tablist.querySelectorAll('[role="tab"]')].filter(tab => !tab.hidden && isShown(tab));
        const next = moveRoving(tabs, event.target, event.key);
        if (next) {
          event.preventDefault();
          next.focus();
          next.click();
        }
      }
    }

    if (event.key !== 'Escape') return;
    const dialog = activeDialog();
    if (!dialog) {
      document.querySelector('#profileMenu.show')?.classList.remove('show');
      return;
    }
    event.preventDefault();
    if (dialog.id === 'settings' && typeof window.closeSettings === 'function') {
      window.closeSettings();
      return;
    }
    const closer = dialog.querySelector(DIALOG_CLOSE);
    if (closer) closer.click();
    else dialog.classList.remove('show');
  });

  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    if (!/\bnoopener\b/.test(link.rel) && !/\bnoreferrer\b/.test(link.rel)) {
      link.rel = `${link.rel} noreferrer`.trim();
    }
  });

  const toast = document.querySelector('#toast');
  if (toast) {
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');
  }

  document.querySelector('.skip-link')?.addEventListener('click', event => {
    const home = document.querySelector('#home');
    const homeOpen = !home || home.style.display !== 'none';
    const target = (!homeOpen && document.querySelector('.page.show h1'))
      || document.querySelector('#homeTitle')
      || document.querySelector('#tripTitle');
    if (!target) return;
    event.preventDefault();
    if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
    target.focus();
  });
})();
