// Mobile-money purchases.
// The app talks only to our small backend (server/). The PayChangu secret key
// stays on the server. An unlock is granted only after the server verifies the
// payment with PayChangu.
(function () {
  const POLL_EVERY_MS = 3000;
  const POLL_FOR_MS = 5 * 60 * 1000;
  const REQUEST_TIMEOUT_MS = 60000;

  function paymentConfig() {
    const cfg = (typeof UNLOCK_CONFIG !== 'undefined' && UNLOCK_CONFIG) || {};
    return {
      apiBase: String(cfg.paymentApiBase || '').replace(/\/+$/, ''),
      enabled: cfg.paymentsEnabled === true
    };
  }

  function paymentsReady() {
    const c = paymentConfig();
    return c.enabled && /^https?:\/\//i.test(c.apiBase);
  }

  function paymentUnavailableMessage() {
    if (paymentsReady()) return '';
    return 'Buying is not switched on yet. You can still unlock this with points.';
  }

  function paymentErrorMessage(err) {
    const code = err && err.code;
    if (code === 'unavailable') return err.message;
    if (code === 'timeout') return 'We have not seen the payment yet. If you paid, tap Buy again to check.';
    if (code === 'failed' || code === 'cancelled' || code === 'reversed') {
      return 'Payment was not completed. You can try again or unlock with points.';
    }
    if (code === 'init_failed') return 'Could not start the payment. Check your connection and try again.';
    if (code === 'network') return 'No connection to the payment service. Check your internet and try again.';
    return 'Could not confirm the payment. Please try again.';
  }

  function paymentStageText(stage) {
    switch (stage) {
      case 'starting': return 'Starting payment…';
      case 'opening': return 'Opening secure checkout…';
      case 'waiting': return 'Waiting for payment. Complete it in the browser, then come back here.';
      case 'checking': return 'Checking payment…';
      default: return '';
    }
  }

  // ---- Pending purchase recovery ----
  // If the app is killed, or the player pays but never returns, we keep the
  // tx_ref locally and re-check it on the next launch instead of losing the unlock.
  const PENDING_KEY = 'gn_pending_payments';
  const PENDING_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

  function readPending() {
    try {
      const list = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function writePending(list) {
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20)));
    } catch (e) {}
  }

  function rememberPending(txRef, itemId) {
    const list = readPending().filter((p) => p && p.txRef !== txRef);
    list.push({ txRef, itemId, at: Date.now() });
    writePending(list);
  }

  function forgetPending(txRef) {
    writePending(readPending().filter((p) => p && p.txRef !== txRef));
  }

  function getPendingPayments() {
    return readPending().slice();
  }

  // Re-check any purchase that was started but not confirmed. Calls
  // onUnlocked(itemId) for each payment PayChangu now reports as successful.
  async function resumePendingPurchases(onUnlocked) {
    if (!paymentsReady()) return;
    const now = Date.now();
    const pending = readPending();

    for (const p of pending) {
      if (!p || !p.txRef) { if (p) forgetPending(p.txRef); continue; }
      if (now - (p.at || 0) > PENDING_MAX_AGE_MS) { forgetPending(p.txRef); continue; }

      try {
        const result = await request('/api/payment/verify/' + encodeURIComponent(p.txRef));
        const status = String((result && result.status) || '').toLowerCase();
        if (status === 'success') {
          forgetPending(p.txRef);
          if (typeof onUnlocked === 'function') onUnlocked(p.itemId);
        } else if (status === 'failed' || status === 'cancelled' || status === 'reversed') {
          forgetPending(p.txRef);
        }
      } catch (e) {
        if (e && e.code === 'unknown_tx_ref') forgetPending(p.txRef);
      }
    }
  }

  // Called before starting a new purchase: if this item already has a pending
  // payment that succeeded, confirm it instead of charging the player twice.
  async function checkPendingPurchase(itemId) {
    if (!paymentsReady()) return null;
    const pending = readPending().filter((p) => p && p.itemId === itemId);
    for (const p of pending) {
      try {
        const result = await request('/api/payment/verify/' + encodeURIComponent(p.txRef));
        const status = String((result && result.status) || '').toLowerCase();
        if (status === 'success') { forgetPending(p.txRef); return result; }
        if (status === 'failed' || status === 'cancelled' || status === 'reversed') forgetPending(p.txRef);
      } catch (e) {
        if (e && e.code === 'unknown_tx_ref') forgetPending(p.txRef);
        else throw e;
      }
    }
    return null;
  }

  async function request(path, options) {
    const c = paymentConfig();
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;
    try {
      const res = await fetch(c.apiBase + path, {
        ...(options || {}),
        signal: controller ? controller.signal : undefined,
        headers: {
          Accept: 'application/json',
          ...((options && options.headers) || {})
        }
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const err = new Error((body && (body.message || body.error)) || ('HTTP ' + res.status));
        err.code = (body && body.error) || 'http';
        throw err;
      }
      return body;
    } catch (e) {
      if (e && e.code) throw e;
      const err = new Error('network');
      err.code = 'network';
      throw err;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  async function openCheckout(url) {
    const cap = window.Capacitor;
    const browser = cap && cap.Plugins && cap.Plugins.Browser;
    if (browser && typeof browser.open === 'function') {
      await browser.open({ url, presentationStyle: 'fullscreen' });
      return;
    }
    const win = window.open(url, '_blank');
    if (!win) window.location.href = url;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function waitForPayment(txRef, onStage) {
    const deadline = Date.now() + POLL_FOR_MS;
    let lastStatus = 'pending';

    while (Date.now() < deadline) {
      let result = null;
      try {
        result = await request('/api/payment/verify/' + encodeURIComponent(txRef));
      } catch (e) {
        if (e && e.code === 'unknown_tx_ref') throw e;
        if (onStage) onStage('checking');
        await sleep(POLL_EVERY_MS);
        continue;
      }

      const status = String((result && result.status) || 'pending').toLowerCase();
      if (status === 'success') return result;
      if (status === 'failed' || status === 'cancelled' || status === 'reversed') {
        const err = new Error('payment_' + status);
        err.code = status;
        throw err;
      }

      if (status !== lastStatus && onStage) onStage('waiting');
      lastStatus = status;
      await sleep(POLL_EVERY_MS);
    }

    const err = new Error('payment_timeout');
    err.code = 'timeout';
    throw err;
  }

  // itemId is the unlock key used by the app: "trivia::World Trivia",
  // "mode::apa" or "all". Resolves with { status:'success', itemId, ... }.
  async function startPurchase(itemId, onStage) {
    if (!paymentsReady()) {
      const err = new Error(paymentUnavailableMessage());
      err.code = 'unavailable';
      throw err;
    }

    if (onStage) onStage('starting');
    const init = await request('/api/payment/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId })
    });

    if (!init || !init.txRef || !init.checkoutUrl) {
      const err = new Error('init_failed');
      err.code = 'init_failed';
      throw err;
    }

    if (onStage) onStage('opening');
    await openCheckout(init.checkoutUrl);
    if (onStage) onStage('waiting');

    rememberPending(init.txRef, itemId);
    try {
      const result = await waitForPayment(init.txRef, onStage);
      forgetPending(init.txRef);
      return result;
    } catch (e) {
      // Keep timeouts so the next launch can check them again. A failed or
      // cancelled payment is final, so drop it.
      if (!e || e.code !== 'timeout') forgetPending(init.txRef);
      throw e;
    }
  }

  window.paymentsReady = paymentsReady;
  window.paymentUnavailableMessage = paymentUnavailableMessage;
  window.paymentErrorMessage = paymentErrorMessage;
  window.paymentStageText = paymentStageText;
  window.startPurchase = startPurchase;
  window.resumePendingPurchases = resumePendingPurchases;
  window.checkPendingPurchase = checkPendingPurchase;
  window.getPendingPayments = getPendingPayments;
})();
