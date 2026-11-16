// Custom Charades: a category that lives with the other Charades decks but lets
// the player type their own prompts. Two rounds are free per install; after that
// it opens with a pass, or with points for one month (same rule as any category).
// Decks are saved on the device, one name each, and can be edited any time.
const CUSTOM_DECK_KEY = 'gn_customDecks';
const CUSTOM_ACTIVE_KEY = 'gn_customDeckId';
const CUSTOM_POINTS_KEY = 'charades::Custom Charades';

function customDecks() {
  try {
    const list = JSON.parse(getSetting(CUSTOM_DECK_KEY, '[]'));
    return Array.isArray(list) ? list : [];
  } catch (e) { return []; }
}

function saveCustomDecks(list) {
  setSetting(CUSTOM_DECK_KEY, JSON.stringify(list));
}

function customRoundsPlayed() {
  return parseInt(getSetting('gn_customRounds', '0'), 10) || 0;
}

function customFreeLeft() {
  return Math.max(0, (Number(UNLOCK_CONFIG.customFreeRounds) || 0) - customRoundsPlayed());
}

// A pass (any pass) opens Custom Charades until it ends; points open it for one month.
function customUnlocked() {
  return isAllUnlocked() || getUnlockedList().includes(CUSTOM_POINTS_KEY) || customFreeLeft() > 0;
}

function customSub() {
  return 'Your own deck';
}

const CustomCharades = (() => {
  let overlay = null;
  let deck = null;
  let timer = 0;
  let editingId = '';

  function newDeck() {
    return { id: 'd' + Date.now().toString(36), name: 'My deck', timer: 0, prompts: [] };
  }

  function build() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'customOverlay';
    overlay.className = 'custom-overlay';
    overlay.innerHTML = `
      <div class="custom-sheet" role="dialog" aria-modal="true" aria-label="Custom Charades">
        <div class="custom-top">
          <button id="customBackBtn" class="custom-back" type="button">&#8249; Back</button>
          <span class="custom-kicker">Custom Charades</span>
          <span id="customFreeTag" class="custom-free"></span>
        </div>
        <div id="customDeckRow" class="custom-deck-row"></div>
        <label class="custom-field">
          <span>Deck name</span>
          <input id="customName" type="text" maxlength="24" placeholder="My deck">
        </label>
        <div class="custom-timer">
          <span class="custom-timer-label">Timer</span>
          <button class="custom-step" type="button" data-t="-5" aria-label="Less time">&minus;</button>
          <span id="customTimerVal" class="custom-timer-val">&infin;</span>
          <button class="custom-step" type="button" data-t="5" aria-label="More time">+</button>
          <span class="custom-timer-note">0 = no timer</span>
        </div>
        <label class="custom-field">
          <span>Prompts — one per line (3 to 20)</span>
          <textarea id="customPrompts" rows="7" placeholder="Type a name or thing on each line"></textarea>
        </label>
        <p id="customCount" class="custom-count">0 of 20</p>
        <p id="customNote" class="custom-note"></p>
        <button id="customStartBtn" class="howto-next" type="button">Start round</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#customBackBtn').addEventListener('click', close);
    overlay.querySelector('#customStartBtn').addEventListener('click', startRound);
    overlay.querySelectorAll('[data-t]').forEach((b) => b.addEventListener('click', () => {
      timer = Math.max(0, Math.min(60, timer + Number(b.dataset.t)));
      paintTimer();
      playClick();
    }));
    overlay.querySelector('#customName').addEventListener('input', (e) => {
      deck.name = e.target.value.slice(0, 24);
      paintDecks();
    });
    overlay.querySelector('#customPrompts').addEventListener('input', paintCount);
    return overlay;
  }

  function prompts() {
    return (overlay.querySelector('#customPrompts').value || '')
      .split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 20);
  }

  function paintTimer() {
    const el = overlay.querySelector('#customTimerVal');
    el.textContent = timer <= 0 ? '∞' : timer + 's';
  }

  function paintCount() {
    const n = prompts().length;
    const el = overlay.querySelector('#customCount');
    el.textContent = n + ' of 20';
    el.classList.toggle('short', n > 0 && n < 3);
  }

  function paintFreeTag() {
    const tag = overlay.querySelector('#customFreeTag');
    if (isAllUnlocked()) tag.textContent = 'Everything open';
    else if (getUnlockedList().includes(CUSTOM_POINTS_KEY)) tag.textContent = 'Open (this month)';
    else if (customFreeLeft() > 0) tag.textContent = customFreeLeft() + ' free left';
    else tag.textContent = 'Pass needed';
  }

  function paintDecks() {
    const row = overlay.querySelector('#customDeckRow');
    const list = customDecks();
    row.innerHTML = list.map((d) => `
      <button class="custom-chip${d.id === editingId ? ' on' : ''}" type="button" data-deck="${d.id}">${d.name || 'Deck'}</button>
    `).join('') + `<button class="custom-chip ghost" type="button" data-new="1">+ New deck</button>`;
    row.querySelectorAll('[data-deck]').forEach((b) => b.addEventListener('click', () => {
      const found = customDecks().find((d) => d.id === b.dataset.deck);
      if (found) load(found);
    }));
    const newBtn = row.querySelector('[data-new]');
    if (newBtn) newBtn.addEventListener('click', () => load(newDeck()));
    const nameInput = overlay.querySelector('#customName');
    if (nameInput && document.activeElement !== nameInput) nameInput.value = deck.name || '';
    paintFreeTag();
  }

  function load(d) {
    deck = d;
    editingId = d.id;
    timer = Math.max(0, Math.min(60, Number(d.timer) || 0));
    overlay.querySelector('#customName').value = d.name || '';
    overlay.querySelector('#customPrompts').value = (d.prompts || []).join('\n');
    paintTimer();
    paintCount();
    paintDecks();
    overlay.querySelector('#customNote').textContent = '';
  }

  function persist() {
    const list = customDecks();
    const i = list.findIndex((d) => d.id === deck.id);
    deck.prompts = prompts();
    deck.timer = timer;
    if (!deck.name) deck.name = 'My deck';
    if (i >= 0) list[i] = deck; else list.push(deck);
    saveCustomDecks(list);
    setSetting(CUSTOM_ACTIVE_KEY, deck.id);
  }

  function gateNote() {
    const el = overlay.querySelector('#customNote');
    const pts = (UNLOCK_CONFIG.standard || {}).points || 200;
    const canBuy = typeof paymentsReady === 'function' && paymentsReady();
    el.innerHTML = `
      <strong>Your ${UNLOCK_CONFIG.customFreeRounds || 2} free rounds are used up.</strong>
      A pass opens Custom Charades until it ends, or open it with ${fmtNum(pts)} points for one month.
      <button id="customPointsBtn" class="custom-gate-btn" type="button" ${getPoints() >= pts ? '' : 'disabled'}>
        ${getPoints() >= pts ? 'Open with points' : 'You have ' + fmtNum(getPoints()) + ' of ' + fmtNum(pts) + ' points'}
      </button>
      <button id="customPassBtn" class="custom-gate-btn ghost" type="button">${canBuy ? 'See the passes' : 'Passes and points'}</button>`;
    const pointsBtn = el.querySelector('#customPointsBtn');
    if (pointsBtn) pointsBtn.addEventListener('click', () => {
      const info = { key: CUSTOM_POINTS_KEY, title: 'Custom Charades', points: pts, mode: 'charades', cat: 'Custom Charades', kind: 'category' };
      if (getPoints() < info.points) return;
      setPoints(getPoints() - info.points);
      addUnlocked(info.key);
      playSuccess();
      vibrateSuccess();
      showPointsToast('🔓 Custom Charades open for a month!');
      paintFreeTag();
      el.textContent = '';
      startRound();
    });
    const passBtn = el.querySelector('#customPassBtn');
    if (passBtn) passBtn.addEventListener('click', () => { close(); openPasses(); });
  }

  function startRound() {
    const list = prompts();
    persist();
    if (list.length < 3) {
      overlay.querySelector('#customNote').textContent = 'Add at least 3 prompts — up to 20.';
      return;
    }
    if (!customUnlocked()) { gateNote(); return; }
    if (customFreeLeft() > 0) setSetting('gn_customRounds', String(customRoundsPlayed() + 1));
    charadesCategories['Custom Charades'] = list.slice();
    customCharadesTimer = timer;
    close();
    if (typeof showScreen === 'function') showScreen('charadesScreen');
    startCharades('Custom Charades');
  }

  function open() {
    build();
    const list = customDecks();
    const active = getSetting(CUSTOM_ACTIVE_KEY, '');
    const found = list.find((d) => d.id === active) || list[0] || newDeck();
    load(found);
    if (list.length === 0) {
      overlay.querySelector('#customNote').innerHTML = '<strong>Your first deck starts here.</strong> Give it a name, add 3–20 prompts, and the round is yours to keep.';
    }
    overlay.classList.add('show');
    overlay.scrollTop = 0;
  }

  function close() {
    if (!overlay) return;
    overlay.classList.remove('show');
  }

  return { open, close, startRound };
})();

function openCustomCharades() { CustomCharades.open(); }
