// --- Settings helpers ---
function getSetting(key, def) {
  const v = localStorage.getItem(key);
  return v === null ? def : v;
}
function setSetting(key, val) {
  localStorage.setItem(key, val);
}

// --- Rate and review ---
// Reviews live on the website's GameNight page, so the app sends players there
// rather than collecting reviews it cannot show. The prompt appears once, after
// a few finished rounds, and "Not now" postpones it for a while.
const REVIEW_URL = 'https://malu-xvge.github.io/gamenight.html#reviews';

function openReviewPage() {
  playClick();
  const cap = window.Capacitor;
  const browser = cap && cap.Plugins && cap.Plugins.Browser;
  if (browser && typeof browser.open === 'function') {
    browser.open({ url: REVIEW_URL, presentationStyle: 'fullscreen' });
    return;
  }
  const win = window.open(REVIEW_URL, '_blank');
  if (!win) window.location.href = REVIEW_URL;
}

function reviewPromptDue() {
  if (getSetting('gn_reviewDone', '') === '1') return false;
  const rounds = parseInt(getSetting('gn_rounds', '0'), 10) || 0;
  const snooze = parseInt(getSetting('gn_reviewSnooze', '0'), 10) || 0;
  return rounds >= 3 && rounds >= snooze;
}

// Every results screen calls this once, so the count reflects real finished rounds.
function addReviewPrompt(screen) {
  const rounds = (parseInt(getSetting('gn_rounds', '0'), 10) || 0) + 1;
  setSetting('gn_rounds', String(rounds));
  if (!screen || !reviewPromptDue() || screen.querySelector('.review-prompt')) return;

  const box = document.createElement('div');
  box.className = 'review-prompt';
  box.innerHTML = `
    <p>Enjoying GameNight? Rate it on the website and help other people find it.</p>
    <button id="reviewNowBtn">Rate GameNight</button>
    <button id="reviewLaterBtn" class="review-later">Not now</button>
  `;
  screen.appendChild(box);
  box.querySelector('#reviewNowBtn').addEventListener('click', () => {
    setSetting('gn_reviewDone', '1');
    box.remove();
    openReviewPage();
  });
  box.querySelector('#reviewLaterBtn').addEventListener('click', () => {
    setSetting('gn_reviewSnooze', String(rounds + 10));
    box.remove();
  });
}


// --- Navigation history ---
let screenHistory = ['homeScreen'];

function showScreen(id, skipHistory) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (!skipHistory && screenHistory[screenHistory.length - 1] !== id) {
    screenHistory.push(id);
  }
  // Leaving Quick Challenge must stop its clock, otherwise it keeps ticking in the background.
  if (id !== 'quickScreen' && typeof stopQuickChallenge === 'function') stopQuickChallenge();
  const fab = document.getElementById('settingsFabBtn');
  fab.style.display = (id === 'homeScreen' || id === 'categoryScreen') ? 'flex' : 'none';
  document.getElementById('infoFabBtn').style.display = (id === 'homeScreen' || id === 'categoryScreen') ? 'flex' : 'none';
  if (typeof updateMusic === 'function') updateMusic(id);
}

function goBack() {
  if (screenHistory.length > 1) {
    screenHistory.pop();
    const prev = screenHistory[screenHistory.length - 1];
    showScreen(prev, true);
  } else {
    showScreen('homeScreen', true);
  }
}

document.getElementById('startTriviaBtn').addEventListener('click', () => {
  showCategoryScreen('trivia');
});

document.getElementById('startCharadesBtn').addEventListener('click', () => {
  showCategoryScreen('charades');
});

document.getElementById('startDaresBtn').addEventListener('click', () => {
  showCategoryScreen('dares');
});

document.getElementById('startQuickBtn').addEventListener('click', () => {
  showScreen('quickScreen');
  startQuickChallenge();
});

document.getElementById('startNdagiBtn').addEventListener('click', () => {
  showCategoryScreen('ndagi');
});

document.getElementById('startApaBtn').addEventListener('click', () => {
  if (!isModeUnlocked('apa')) {
    openUnlock({ kind: 'mode', mode: 'apa' });
    return;
  }
  startApa();
});

document.querySelectorAll('.backBtn').forEach(btn => {
  btn.addEventListener('click', () => goBack());
});

// --- Settings screen ---
document.getElementById('settingsFabBtn').addEventListener('click', () => {
  renderSettings();
  showScreen('settingsScreen');
});

// The settings menu stays short: each entry opens its own screen, so the
// passes are one tap away instead of below a long scroll.
document.getElementById('openGameplayBtn').addEventListener('click', () => {
  renderSettings();
  showScreen('gameplayScreen');
});
document.getElementById('openUnlockBtn').addEventListener('click', () => {
  renderSettings();
  showScreen('unlockScreen');
});

function renderSettings() {
  const soundOn = getSetting('gn_soundEnabled', 'true') === 'true';
  document.getElementById('soundToggleBtn').textContent = soundOn ? 'ON' : 'OFF';
  document.getElementById('charadesTimerValue').textContent = getSetting('gn_charadesTimer', '60') + 's';
  document.getElementById('quickTimerValue').textContent = getSetting('gn_quickTimer', '45') + 's';
  updatePointsDisplays();
  updatePassUI();
  if (typeof renderMusicToggle === 'function') renderMusicToggle();
}

document.getElementById('soundToggleBtn').addEventListener('click', () => {
  const soundOn = getSetting('gn_soundEnabled', 'true') === 'true';
  setSetting('gn_soundEnabled', soundOn ? 'false' : 'true');
  renderSettings();
});

function adjustTimer(key, delta, min, max) {
  let val = parseInt(getSetting(key, key === 'gn_charadesTimer' ? '60' : '45'));
  val = Math.min(max, Math.max(min, val + delta));
  setSetting(key, val);
  renderSettings();
  playClick();
}

document.getElementById('charadesTimerMinus').addEventListener('click', () => adjustTimer('gn_charadesTimer', -15, 30, 180));
document.getElementById('charadesTimerPlus').addEventListener('click', () => adjustTimer('gn_charadesTimer', 15, 30, 180));
document.getElementById('quickTimerMinus').addEventListener('click', () => adjustTimer('gn_quickTimer', -15, 30, 180));
document.getElementById('quickTimerPlus').addEventListener('click', () => adjustTimer('gn_quickTimer', 15, 30, 180));

// Settings -> Rate GameNight: opens the reviews section on the website.
const rateAppBtn = document.getElementById('rateAppBtn');
if (rateAppBtn) rateAppBtn.addEventListener('click', openReviewPage);

// =====================================================
// How to play: the "i" button opens a card from the bottom
// =====================================================
const HOWTO_ART = {
  grid6: `<div class="howto-grid6">
    <span class="g6 mode-trivia"><img src="assets/img/icon-trivia.png" alt=""></span>
    <span class="g6 mode-charades"><img src="assets/img/icon-charades.png" alt=""></span>
    <span class="g6 mode-ndagi"><img src="assets/img/icon-ndagi.png" alt=""></span>
    <span class="g6 mode-dares"><img src="assets/img/icon-dares.png" alt=""></span>
    <span class="g6 mode-quick"><img src="assets/img/icon-quick.png" alt=""></span>
    <span class="g6 mode-apandipati"><img src="assets/img/icon-apa.png" alt=""></span>
  </div>`,
  cards: `<svg viewBox="0 0 140 110" width="130" height="102" aria-hidden="true"><g stroke="#FFF1C1" stroke-width="4" stroke-linejoin="round">
    <rect x="18" y="22" width="56" height="78" rx="9" fill="#7a30b8" transform="rotate(-14 46 61)"/>
    <rect x="42" y="14" width="56" height="78" rx="9" fill="#e29a14"/>
    <rect x="68" y="22" width="56" height="78" rx="9" fill="#14999a" transform="rotate(14 96 61)"/></g></svg>`,
  stopwatch: `<svg viewBox="0 0 120 120" width="108" height="108" aria-hidden="true">
    <rect x="50" y="6" width="20" height="10" rx="3" fill="#E6BC55"/>
    <circle cx="60" cy="68" r="42" fill="#1b3d1f" stroke="#FFD76A" stroke-width="5"/>
    <line x1="60" y1="68" x2="60" y2="40" stroke="#FFF1C1" stroke-width="6" stroke-linecap="round"/>
    <line x1="60" y1="68" x2="80" y2="78" stroke="#FFF1C1" stroke-width="6" stroke-linecap="round"/>
    <circle cx="60" cy="68" r="5" fill="#FFD76A"/></svg>`,
  people: `<svg viewBox="0 0 176 90" width="176" height="90" aria-hidden="true"><g stroke="#FFF1C1" stroke-width="3">
    <g fill="#6FD38B"><circle cx="24" cy="26" r="12"/><path d="M6 82 v-20 a18 18 0 0 1 36 0 v20z"/></g>
    <g fill="#e29a14"><circle cx="86" cy="26" r="12"/><path d="M68 82 v-20 a18 18 0 0 1 36 0 v20z"/>
    <circle cx="124" cy="26" r="12"/><path d="M106 82 v-20 a18 18 0 0 1 36 0 v20z"/>
    <circle cx="156" cy="26" r="10"/><path d="M142 82 v-18 a14 14 0 0 1 28 0 v18z"/></g></g></svg>`,
  forehead: `<svg viewBox="0 0 150 110" width="140" height="102" aria-hidden="true"><g stroke="#FFF1C1" stroke-width="3">
    <circle cx="60" cy="50" r="28" fill="#E6BC55"/><path d="M16 108 a44 36 0 0 1 88 0z" fill="#E6BC55"/>
    <rect x="86" y="20" width="16" height="48" rx="4" fill="#14999a" transform="rotate(8 94 44)"/></g>
    <g stroke="#FFD76A" stroke-width="3" fill="none" stroke-linecap="round"><path d="M112 30 q10 14 0 28"/><path d="M122 24 q16 20 0 40"/></g></svg>`,
  tilt: `<svg viewBox="0 0 220 120" width="210" height="114" aria-hidden="true">
    <rect x="65" y="34" width="90" height="52" rx="9" fill="#14999a" stroke="#FFF1C1" stroke-width="3"/>
    <text x="110" y="66" text-anchor="middle" font-family="Poppins,Arial" font-weight="800" font-size="13" fill="#fff">WORD</text>
    <g stroke="#6FD38B" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M110 26 V6"/><path d="M99 16 L110 5 L121 16"/></g>
    <text x="130" y="18" font-family="Poppins,Arial" font-weight="800" font-size="12" fill="#6FD38B">CORRECT</text>
    <g stroke="#FF8A80" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M110 94 V114"/><path d="M99 104 L110 115 L121 104"/></g>
    <text x="130" y="112" font-family="Poppins,Arial" font-weight="800" font-size="12" fill="#FF8A80">SKIP</text></svg>`,
  trivia: `<img class="howto-icon" src="assets/img/icon-trivia.png" alt="">`,
  charades: `<img class="howto-icon" src="assets/img/icon-charades.png" alt="">`,
  dares: `<img class="howto-icon" src="assets/img/icon-dares.png" alt="">`,
  ndagi: `<img class="howto-icon" src="assets/img/icon-ndagi.png" alt="">`,
  scroll: `<span class="howto-emoji">📜</span>`,
  star: `<svg viewBox="0 0 140 120" width="132" height="112" aria-hidden="true">
    <path d="M70 6 L85 42 L124 46 L94 72 L103 110 L70 90 L37 110 L46 72 L16 46 L55 42 Z" fill="#FFD76A" stroke="#A87B25" stroke-width="5" stroke-linejoin="round"/>
    <text x="70" y="76" text-anchor="middle" font-family="Poppins,Arial" font-weight="800" font-size="26" fill="#5a3a00">+1</text></svg>`,
  buyearn: `<svg viewBox="0 0 230 110" width="220" height="105" aria-hidden="true">
    <path d="M52 8 L62 34 L90 37 L69 55 L76 83 L52 68 L28 83 L35 55 L14 37 L42 34 Z" fill="#FFD76A" stroke="#A87B25" stroke-width="4" stroke-linejoin="round"/>
    <text x="115" y="62" text-anchor="middle" font-family="Poppins,Arial" font-weight="800" font-size="20" fill="#FFF1C1">OR</text>
    <rect x="152" y="8" width="56" height="92" rx="10" fill="#14999a" stroke="#FFF1C1" stroke-width="4"/>
    <text x="180" y="60" text-anchor="middle" font-family="Poppins,Arial" font-weight="800" font-size="20" fill="#fff">MK</text></svg>`
};

const HOWTO = {
  home: { steps: [
    { t: 'Pick a Game', d: 'Six games to choose from: Trivia, Charades, Dares, Quick Challenge, Ndagi riddles and Apa Ndipati.', art: 'grid6' },
    { t: 'Choose a Category', d: 'Most games let you pick a category: Malawian culture, the wider world and more.', art: 'cards' },
    { t: 'Play and Score', d: 'Answer, act or perform before time runs out. Right answers can earn you points.', art: 'stopwatch' },
    { t: 'Earn Points', d: 'Every right answer earns 1 point in Trivia, Ndagi, Quick Challenge and Apa Ndipati. Charades and Dares pay no points, because you judge those yourselves.', art: 'star' },
    { t: 'Earn or Pass', d: 'A locked category opens when you have earned enough points, and it stays open. If you want everything at once, Settings has passes for a day, a month or longer.', art: 'buyearn' },
    { t: 'Play Together', d: 'GameNight is best with friends. In Trivia, choose a game master to read out the questions. In Charades, pass the phone around so everyone gets a turn.', art: 'people' }
  ]},
  trivia: { steps: [
    { t: 'Pick a Category', d: 'Choose a topic, from Malawian showbiz and history to world knowledge and pop culture.', art: 'cards' },
    { t: 'Choose the Answer', d: 'Every question has four options and only one is right. Tap your answer: green means you got it.', art: 'trivia' },
    { t: 'Earn Points', d: 'Every correct answer earns 1 point. Spend them on a locked category and it stays unlocked.', art: 'star' }
  ]},
  charades: { steps: [
    { t: 'Pick a Category', d: 'Choose a theme: Malawian culture, famous faces, landmarks, science, movies and more.', art: 'cards' },
    { t: 'Act and Guess', d: 'Hold the phone to your forehead so friends see the word and you do not. They can act, hint or describe it, but never say the word itself.', art: 'forehead' },
    { t: 'Master the Controls', d: 'Tilt the phone up, or swipe up, when you get it right. Tilt down, or swipe down, to skip. The buttons work too.', art: 'tilt' },
    { t: 'Be Quick', d: 'The clock is ticking! Get as many right as you can before time runs out. You can change the time in Settings.', art: 'stopwatch' },
    { t: 'Just for Fun', d: 'Charades pays no points, because you mark the answers yourselves. Earn points in Trivia, Ndagi, Quick Challenge and Apa Ndipati.', art: 'star' }
  ]},
  dares: { steps: [
    { t: 'Choose a Level', d: 'Vanilla is easy and fun, Mild is a bit bolder, and Spicy goes big. Pick what suits your group.', art: 'cards' },
    { t: 'Take the Dare', d: 'Read the dare out loud and let everyone watch. Be a good sport and have fun with it.', art: 'dares' },
    { t: 'Done or Next', d: 'Tap Done when you have completed it, or Next Dare for a new one. Keep it safe and respect everyone\'s limits.', art: 'people' },
    { t: 'Get Creative', d: 'Failed or skipped a dare? Agree on a punishment before you start and get creative with it. Keep it silly, never hurtful.', art: 'cards' },
    { t: 'Just for Fun', d: 'Dares pay no points, because you judge them yourselves. Earn points in Trivia, Ndagi, Quick Challenge and Apa Ndipati.', art: 'star' }
  ]},
  ndagi: { steps: [
    { t: 'Choose a Set', d: 'Pick riddles from Malawi, Africa, Europe and Asia, Malawian folktales, or complete Chichewa proverbs in Miyambi.', art: 'cards' },
    { t: 'Pick the Answer', d: 'Read the riddle, then tap the answer you think fits.', art: 'ndagi' },
    { t: 'Earn Points', d: 'Every right answer earns 1 point. After each answer you see the right one, and in Miyambi you also read what the proverb means.', art: 'star' }
  ]}
};

// ---- Pause / leave confirmation for Trivia and Charades ----
let pauseOpen = false;
let pauseMode = null;
let triviaNextTimer = null;
let triviaNextPending = false;   // a question was answered just before pausing; advance after resume

function openPause(mode) {
  if (pauseOpen) return;
  pauseOpen = true;
  pauseMode = mode;
  if (mode === 'charades') {
    clearInterval(charadesTimer);   // the clock stops while the card is up
    charadesLocked = true;          // and taps, swipes and tilts are ignored
    if (charadesFlashTimer) {
      // The player answered just as they paused: finish that card after resuming.
      clearTimeout(charadesFlashTimer);
      charadesFlashTimer = null;
      charadesSession++;
      charadesAdvancePending = true;
      document.querySelectorAll('#charadesScreen .charades-flash').forEach(el => el.remove());
    }
  }
  if (mode === 'trivia' && triviaNextTimer) {
    clearTimeout(triviaNextTimer);  // don't swap the question under the pause card
    triviaNextTimer = null;
    triviaNextPending = true;
  }
  document.getElementById('pauseOverlay').classList.add('open');
}

function closePause() {
  document.getElementById('pauseOverlay').classList.remove('open');
  pauseOpen = false;
}

function resumeFromPause() {
  if (!pauseOpen) return;
  const mode = pauseMode;
  closePause();
  if (mode === 'charades') {
    if (charadesAdvancePending) {
      charadesAdvancePending = false;
      if (timeLeft > 0) nextPrompt();
    } else {
      charadesLocked = false;
      if (timeLeft > 0) startTimer();
    }
  }
  if (mode === 'trivia' && triviaNextPending) {
    triviaNextPending = false;
    nextQuestion();
  }
}

function homeFromPause() {
  if (!pauseOpen) return;
  const mode = pauseMode;
  closePause();
  clearTimeout(triviaNextTimer);
  triviaNextTimer = null;
  triviaNextPending = false;
  if (mode === 'charades') exitCharadesRuntime();
  screenHistory = ['homeScreen'];
  showScreen('homeScreen', true);
}

document.getElementById('pauseResumeBtn').addEventListener('click', resumeFromPause);
document.getElementById('pauseHomeBtn').addEventListener('click', homeFromPause);
document.getElementById('pauseOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'pauseOverlay') resumeFromPause();
});

let howtoKey = 'home';
let howtoStep = 0;
let howtoOpen = false;

function renderHowTo() {
  const steps = HOWTO[howtoKey].steps;
  const step = steps[howtoStep];
  document.getElementById('howtoTitle').textContent = step.t;
  document.getElementById('howtoText').textContent = step.d;
  document.getElementById('howtoArt').innerHTML = HOWTO_ART[step.art] || '';
  document.getElementById('howtoDots').innerHTML = steps.map((_, i) => `<span class="${i === howtoStep ? 'on' : ''}"></span>`).join('');
  document.getElementById('howtoNextBtn').textContent = howtoStep === steps.length - 1 ? 'Close' : 'Next';
}

function openHowTo() {
  const top = screenHistory[screenHistory.length - 1];
  howtoKey = (top === 'categoryScreen' && HOWTO[currentCategoryMode]) ? currentCategoryMode : 'home';
  howtoStep = 0;
  renderHowTo();
  document.getElementById('howtoOverlay').classList.add('open');
  howtoOpen = true;
  playClick();
}

function closeHowTo() {
  document.getElementById('howtoOverlay').classList.remove('open');
  howtoOpen = false;
}

document.getElementById('infoFabBtn').addEventListener('click', openHowTo);
document.getElementById('howtoNextBtn').addEventListener('click', () => {
  if (howtoStep >= HOWTO[howtoKey].steps.length - 1) {
    closeHowTo();
  } else {
    howtoStep++;
    renderHowTo();
  }
});
document.getElementById('howtoOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'howtoOverlay') closeHowTo();
});

// =====================================================
// Points and unlocks (numbers and tiers live in js/unlocks.js)
// =====================================================
function getPoints() {
  return parseInt(getSetting('gn_points', '0'), 10) || 0;
}

function setPoints(n) {
  setSetting('gn_points', String(Math.max(0, Math.floor(n))));
  updatePointsDisplays();
}

function addPoints(n, quiet) {
  if (!n || n <= 0) return;
  setPoints(getPoints() + n);
  if (!quiet) showPointsToast('+' + n + ' ⭐');
}

function awardPoints(mode, quiet) {
  addPoints((UNLOCK_CONFIG.earn || {})[mode] || 0, quiet);
}

function fmtNum(n) {
  return Number(n).toLocaleString('en-US');
}

function updatePointsDisplays() {
  const el = document.getElementById('pointsBalance');
  if (el) el.textContent = fmtNum(getPoints());
}

function showPointsToast(text) {
  let t = document.getElementById('pointsToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'pointsToast';
    t.className = 'points-toast';
    document.body.appendChild(t);
  }
  t.textContent = text;
  t.classList.remove('show');
  void t.offsetWidth;
  t.classList.add('show');
  clearTimeout(showPointsToast.timer);
  showPointsToast.timer = setTimeout(() => t.classList.remove('show'), 1400);
}

// Points unlocks are stored as { "mode::cat": expiresAtMs }. A points unlock
// runs for UNLOCK_CONFIG.unlockDays (one month), then the category locks again.
function unlockDaysMs() {
  return Math.max(1, Number(UNLOCK_CONFIG.unlockDays) || 30) * 86400000;
}

function getUnlockedMap() {
  let raw = null;
  try { raw = JSON.parse(getSetting('gn_unlocked', '{}')); } catch (e) { raw = null; }
  // Older copies stored a plain list with no expiry; give those one month from now.
  if (Array.isArray(raw)) {
    const map = {};
    const until = Date.now() + unlockDaysMs();
    raw.forEach((k) => { map[k] = until; });
    setSetting('gn_unlocked', JSON.stringify(map));
    return map;
  }
  return raw && typeof raw === 'object' ? raw : {};
}

function getUnlockedList() {
  const map = getUnlockedMap();
  const now = Date.now();
  return Object.keys(map).filter((k) => (Number(map[k]) || 0) > now);
}

function addUnlocked(key) {
  const map = getUnlockedMap();
  map[key] = Date.now() + unlockDaysMs();
  setSetting('gn_unlocked', JSON.stringify(map));
}

function tierOf(mode, cat) {
  const t = (UNLOCK_CONFIG.tiers || {})[mode];
  return (t && t[cat]) || 'free';
}

function passList() {
  return (UNLOCK_CONFIG.passes || []).slice();
}

function passById(id) {
  return passList().find((p) => p.id === id) || null;
}

function passUntilMs() {
  return parseInt(getSetting('gn_passUntil', '0'), 10) || 0;
}

function passGraceMs() {
  return Math.max(0, Number(UNLOCK_CONFIG.passGraceHours) || 0) * 3600 * 1000;
}

// A pass is still honoured for passGraceHours after it ends, so a game night
// that runs late is never cut off mid-round.
function activePass() {
  const until = passUntilMs();
  if (!until || Date.now() > until + passGraceMs()) return null;
  return { until, label: getSetting('gn_passLabel', 'Pass') };
}

function isAllUnlocked() {
  return getSetting('gn_unlockAll', '') === '1' || !!activePass();
}

function isUnlocked(mode, cat) {
  return isAllUnlocked() || tierOf(mode, cat) === 'free' || getUnlockedList().includes(mode + '::' + cat);
}

function isModeUnlocked(mode) {
  const m = (UNLOCK_CONFIG.modes || {})[mode];
  return isAllUnlocked() || !m || m.tier === 'free' || getUnlockedList().includes('mode::' + mode);
}

function lockTag(mode, cat) {
  const info = unlockInfo({ kind: 'category', mode, cat });
  return `<span class="deck-lock">🔒 ${fmtNum(info.points)} pts</span>`;
}

function refreshHomeLocks() {
  const apa = document.getElementById('startApaBtn');
  if (apa) apa.classList.toggle('locked', !isModeUnlocked('apa'));
}

// ---- Unlock card (bottom sheet, same look as the how-to card) ----
let unlockOpen = false;
let unlockCtx = null;

function unlockInfo(ctx) {
  if (ctx.kind === 'mode') {
    const m = UNLOCK_CONFIG.modes[ctx.mode];
    return { key: 'mode::' + ctx.mode, tier: m.tier, title: 'Apa Ndipati', points: m.points };
  }
  const tier = tierOf(ctx.mode, ctx.cat);
  const price = UNLOCK_CONFIG[tier] || UNLOCK_CONFIG.premium;
  const points = (UNLOCK_CONFIG.pointsByMode || {})[ctx.mode] || price.points;
  return { key: ctx.mode + '::' + ctx.cat, tier, title: categoryLabel(ctx.cat), points };
}

// One taste of what is inside, so the lock is tempting rather than a blank wall.
function unlockSample(ctx) {
  if (ctx.kind === 'mode') {
    const place = apaPlaces[Math.floor(Math.random() * apaPlaces.length)];
    return `<img class="unlock-blur" src="${place.photo}" alt=""><small>Sneak peek</small>Can you tell where in Malawi this photo was taken? Unlock to find out.`;
  }
  const sources = { trivia: triviaCategories, charades: charadesCategories, dares: daresCategories, ndagi: ndagiCategories };
  const list = (sources[ctx.mode] || {})[ctx.cat] || [];
  if (!list.length) return '';
  const it = list[Math.floor(Math.random() * list.length)];
  const text = typeof it === 'string' ? it : (it.q || it.riddle || it.proverb || '');
  const label = { trivia: 'Sample question', charades: 'Sample prompt', dares: 'Sample dare', ndagi: 'Sample' }[ctx.mode];
  return `<small>${label}</small>${text}`;
}

function openUnlock(ctx) {
  unlockCtx = ctx;
  const info = unlockInfo(ctx);
  document.getElementById('unlockTitle').textContent = info.title;
  document.getElementById('unlockSample').innerHTML = unlockSample(ctx);
  renderUnlockBody();
  document.getElementById('unlockOverlay').classList.add('open');
  unlockOpen = true;
}

function renderUnlockBody() {
  const info = unlockInfo(unlockCtx);
  const have = getPoints();
  const pct = Math.min(100, Math.round(have / info.points * 100));
  const enough = have >= info.points;
  const canBuy = typeof paymentsReady === 'function' && paymentsReady();
  const cheapest = passList()[0] || { kwacha: 500 };
  document.getElementById('unlockBody').innerHTML = `
    <p class="unlock-or">EARN IT</p>
    <p class="unlock-price"><strong>${fmtNum(info.points)} points</strong></p>
    <div class="unlock-progress"><div style="width:${pct}%"></div></div>
    <p class="unlock-have">You have ${fmtNum(have)} of ${fmtNum(info.points)} points</p>
    <p class="unlock-note">Points open it for one month, then it locks again.</p>
    <button id="unlockPointsBtn" class="unlock-secondary" ${enough ? '' : 'disabled'}>
      ${enough ? 'Unlock with points' : 'Unlock with points (' + fmtNum(info.points - have) + ' to go)'}
    </button>
    <p id="unlockNote" class="unlock-note">${canBuy ? '' : 'Mobile money buying is not active yet. Unlock with points for now.'}</p>
    <p class="unlock-alt">Or open everything at once with a pass, from MK ${fmtNum(cheapest.kwacha)} for a day.</p>
    <button id="unlockPassBtn" class="howto-next">See the passes</button>`;
  document.getElementById('unlockPointsBtn').addEventListener('click', spendPointsToUnlock);
  document.getElementById('unlockPassBtn').addEventListener('click', openPasses);
}

// Settings -> passes. Jump straight there from a locked category.
function openPasses() {
  closeUnlock();
  renderSettings();
  showScreen('unlockScreen');
  const grid = document.getElementById('passOptions');
  if (grid) setTimeout(() => grid.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
}

// One payment opens everything until the pass ends. Nothing renews by itself,
// because a mobile-money wallet cannot be charged without the player.
function updatePassUI() {
  const grid = document.getElementById('passOptions');
  if (grid && grid.dataset.built !== '1') {
    grid.innerHTML = passList().map((p) => `
      <button class="${p.days === 0 ? 'howto-next' : 'unlock-secondary'}" data-pass="${p.id}">MK ${fmtNum(p.kwacha)} — ${p.note || p.label}</button>`).join('');
    grid.dataset.built = '1';
    grid.querySelectorAll('[data-pass]').forEach((btn) => {
      btn.addEventListener('click', () => buyPass(btn.dataset.pass));
    });
  }

  const lifetime = getSetting('gn_unlockAll', '') === '1';
  const pass = activePass();
  const status = document.getElementById('passStatus');
  if (status) {
    if (lifetime) status.textContent = 'Everything is unlocked for good.';
    else if (pass) status.textContent = 'Everything is open until ' + new Date(pass.until).toLocaleDateString() + ', ' + new Date(pass.until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '.';
    else status.textContent = 'Everything is locked for now. Earn points to open a category for a month, or buy a pass below.';
  }
  if (grid) {
    grid.querySelectorAll('[data-pass]').forEach((btn) => {
      const p = passById(btn.dataset.pass);
      btn.disabled = !p || (p.days === 0 && lifetime);
    });
  }
}

async function buyPass(itemId) {
  const note = document.getElementById('unlockAllNote');
  if (typeof paymentsReady !== 'function' || !paymentsReady()) {
    if (note) note.textContent = typeof paymentUnavailableMessage === 'function'
      ? paymentUnavailableMessage()
      : 'Buying is coming soon.';
    return;
  }
  if (!passById(itemId)) return;
  if (note) note.textContent = paymentStageText('checking');
  try {
    const recovered = typeof checkPendingPurchase === 'function' ? await checkPendingPurchase(itemId) : null;
    if (recovered && recovered.status === 'success') {
      applyPass(itemId, recovered.days);
      return;
    }
  } catch (e) {
    if (note) note.textContent = 'Could not check your last payment. Please try again in a moment.';
    return;
  }
  if (note) note.textContent = paymentStageText('starting');
  startPurchase(itemId, (stage) => {
    if (note) note.textContent = paymentStageText(stage);
  }).then((result) => {
    if (result && result.status === 'success') applyPass(itemId, result.days);
  }).catch((err) => {
    if (note) note.textContent = paymentErrorMessage(err);
  });
}

// Called once the server has confirmed a pass payment. Buying while a pass is
// still running adds the new days to the end of it.
function applyPass(itemId, days) {
  const p = passById(itemId) || {};
  if (p.days === 0 || itemId === 'unlock::life') {
    unlockEverything();
    return;
  }
  const addDays = Number(days) > 0 ? Number(days) : (p.days || 1);
  const base = Math.max(Date.now(), passUntilMs());
  setSetting('gn_passUntil', String(base + addDays * 86400000));
  setSetting('gn_passLabel', p.label || 'Pass');
  refreshHomeLocks();
  updatePassUI();
  playSuccess();
  vibrateSuccess();
  showPointsToast('🔓 Everything open — ' + (p.note || addDays + ' days') + '!');
}

// Call this once the payment has been confirmed by the server.
function unlockEverything() {
  setSetting('gn_unlockAll', '1');
  refreshHomeLocks();
  updatePassUI();
  playSuccess();
  vibrateSuccess();
  showPointsToast('🔓 Everything unlocked for good!');
}

function spendPointsToUnlock() {
  const ctx = unlockCtx;
  const info = unlockInfo(ctx);
  if (getPoints() < info.points) return;
  setPoints(getPoints() - info.points);
  finishUnlock(ctx, info);
}

function finishUnlock(ctx, info) {
  addUnlocked(info.key);
  playSuccess();
  vibrateSuccess();
  closeUnlock();
  showPointsToast('🔓 ' + info.title + ' unlocked!');
  refreshHomeLocks();
  if (ctx.kind === 'mode') {
    startApa();
  } else {
    showCategoryScreen(ctx.mode);
  }
}

function closeUnlock() {
  document.getElementById('unlockOverlay').classList.remove('open');
  unlockOpen = false;
}

document.getElementById('unlockCloseBtn').addEventListener('click', closeUnlock);
document.getElementById('unlockOverlay').addEventListener('click', (e) => {
  if (e.target.id === 'unlockOverlay') closeUnlock();
});

// First launch: a small welcome gift so the first unlock feels close
let pendingGift = 0;

function flushGiftToast() {
  if (pendingGift) {
    showPointsToast('🎁 Welcome gift: ' + pendingGift + ' points!');
    pendingGift = 0;
  }
}

function initPoints() {
  if (getSetting('gn_welcome', '') !== '1') {
    setSetting('gn_welcome', '1');
    setPoints(getPoints() + (UNLOCK_CONFIG.welcomePoints || 0));
    pendingGift = UNLOCK_CONFIG.welcomePoints || 0;
    if (getSetting('gn_intro', '') === '1') setTimeout(flushGiftToast, 900);
  }
  updatePointsDisplays();
  refreshHomeLocks();
}
initPoints();

// A purchase confirmed by the server (now or on a later launch) grants the
// unlock without opening any screens.
function grantPaidUnlock(itemId) {
  if (!itemId) return;
  if (itemId === 'all' || itemId === 'unlock::life') {
    if (getSetting('gn_unlockAll', '') !== '1') unlockEverything();
    return;
  }
  const pass = passById(itemId);
  if (pass) { applyPass(itemId, pass.days); return; }
  // A category bought before passes existed: give it the same one-month run.
  addUnlocked(itemId);
  refreshHomeLocks();
  updatePassUI();
  playSuccess();
  vibrateSuccess();
  const label = itemId.indexOf('mode::') === 0
    ? 'Apa Ndipati'
    : itemId.split('::').slice(1).join('::');
  showPointsToast('🔓 ' + (label || 'Unlocked') + '!');
}

// Recover payments that succeeded but were never confirmed, e.g. the player
// paid and then closed the app before coming back.
function resumePaidPurchases() {
  if (typeof resumePendingPurchases !== 'function') return;
  resumePendingPurchases(grantPaidUnlock);
}
setTimeout(resumePaidPurchases, 2000);

if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
  window.Capacitor.Plugins.App.addListener('appStateChange', (state) => {
    if (state && state.isActive) setTimeout(resumePaidPurchases, 800);
  });
}

// --- Hardware back button ---
if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
  window.Capacitor.Plugins.App.addListener('backButton', () => {
    if (typeof introOpen !== 'undefined' && introOpen) {
      finishIntro();
      return;
    }
    if (unlockOpen) {
      closeUnlock();
      return;
    }
    if (howtoOpen) {
      closeHowTo();
      return;
    }
    if (pauseOpen) {
      resumeFromPause();
      return;
    }
    const charadesScreenEl = document.getElementById('charadesScreen');
    if (charadesScreenEl.classList.contains('charades-fullscreen') && charadesScreenEl.classList.contains('active')) {
      openPause('charades');
      return;
    }
    const triviaEl = document.getElementById('triviaScreen');
    if (triviaEl.classList.contains('active') && triviaEl.querySelector('.optionBtn')) {
      openPause('trivia');
      return;
    }
    if (screenHistory.length > 1) {
      goBack();
    } else {
      window.Capacitor.Plugins.App.exitApp();
    }
  });
}

// --- Category Selection ---
const categoryMeta = {
  "Malawian Influencers": { icon: "⭐", sub: "Trendsetters" },
  "Malawian Showbiz": { icon: "🎤", sub: "Music, dance & entertainment" },
  "Malawian History": { icon: "🏛️", sub: "Independence & heritage" },
  "Malawian Geography": { icon: "🗺️", sub: "Lakes, mountains & places" },
  "Malawian Politics": { icon: "🗳️", sub: "Government & leadership" },
  "World Trivia": { icon: "🌍", sub: "General knowledge" },
  "Sports Trivia": { icon: "⚽", sub: "Football & more" },
  "Science & Nature": { icon: "🔬", sub: "Facts about our world" },
  "Pop Culture": { icon: "🎬", sub: "Movies, music & pop culture" },
  "General Knowledge": { icon: "📚", sub: "Books, words & general knowledge" },
  "Famous Faces": { icon: "🌟", sub: "Icons everyone knows" },
  "Landmarks": { icon: "🗽", sub: "Famous places to act out" },
  "Science in Action": { icon: "🧪", sub: "Processes & discoveries" },
  "World Class Athletes": { icon: "🏅", sub: "Sporting legends" },
  "Malawi Proverbs": { icon: "📜", sub: "Miyambi ya makolo" },
  "Asian Proverbs": { icon: "🏮", sub: "Wise sayings from Asia" },
  "World & General": { icon: "🌍", sub: "Animals, actions & more" },
  "Vanilla": { icon: "🍦", sub: "Easy & fun" },
  "Mild": { icon: "🌶️", sub: "A bit bolder" },
  "Spicy": { icon: "🔥", sub: "Go big or go home" },
  "Authentic Malawian": { icon: "🇲🇼", sub: "Classic riddles" },
  "Malawian Folktales": { icon: "📖", sub: "Legends & spirits" },
  "African": { icon: "🌍", sub: "Riddles from the continent" },
  "European": { icon: "🏰", sub: "Classic brain teasers" }
};

// Icon + subtitle for a category tile. Uses the list above; for a brand-new category
// it picks an icon from keywords in the name and shows how many items it contains.
function getCategoryMeta(cat, count) {
  if (categoryMeta[cat]) return categoryMeta[cat];
  const rules = [
    [/film|movie|music|pop|tv|celebr/, '🎬'],
    [/book|language|read|literat|word/, '📚'],
    [/science|nature|animal|space/, '🔬'],
    [/sport|football|netball/, '⚽'],
    [/histor/, '🏛️'],
    [/geograph|place|city|travel/, '🗺️'],
    [/politic|govern/, '🗳️'],
    [/food|cook|nsima/, '🍲'],
    [/world|general/, '🌍']
  ];
  const lower = cat.toLowerCase();
  const match = rules.find(r => r[0].test(lower));
  return { icon: match ? match[1] : '⭐', sub: count ? count + ' to play' : 'Tap to play' };
}

let currentCategoryMode = 'trivia';

// Ndagi tile order. Malawian Proverbs is the main attraction (tile 1) and
// Authentic Malawian moves to tile 5. The data files keep their own order.
const NDAGI_CATEGORY_ORDER = [
  'Malawi Proverbs',
  'Malawian Folktales',
  'African',
  'European',
  'Authentic Malawian',
  'Asian Proverbs'
];

// Charades deck order on screen. Any new deck not listed here still shows, at the end.
const CHARADES_CATEGORY_ORDER = [
  'Malawian Influencers',
  'Malawian Showbiz',
  'Malawian History',
  'Malawian Geography',
  'Malawian Politics',
  'World Class Athletes',
  'World & General',
  'Famous Faces',
  'Landmarks',
  'Science in Action',
  'Pop Culture'
];

// Friendly display names (internal keys stay unchanged so unlocks and data still match).
const CATEGORY_LABELS = { 'Malawi Proverbs': 'Malawian Proverbs' };
function categoryLabel(cat) {
  return CATEGORY_LABELS[cat] || cat;
}

// File-name safe version of a category name, used for its card backdrop.
function catSlug(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Charades has its own painted faces for these decks; every other deck uses the
// shared art. Landmarks and Science in Action have no charades-only file yet.
const CHARADES_OWN_ART = new Set([
  'custom-charades', 'famous-faces', 'malawian-geography', 'malawian-history',
  'malawian-influencers', 'malawian-politics', 'malawian-showbiz', 'pop-culture',
  'world-and-general', 'world-class-athletes'
]);

function cardArt(mode, cat) {
  const slug = catSlug(cat);
  const own = mode === 'charades' && CHARADES_OWN_ART.has(slug);
  return own ? `assets/img/cats/charades/${slug}.jpg` : `assets/img/cats/${slug}.jpg`;
}

// A locked deck wears this in its top-right corner: a small gold padlock on a
// darkened bead, with a single glint so it reads as a charm and not a UI chip.
const LOCKED_MARK = `
  <span class="deck-lock-mark" aria-hidden="true">
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M7 10.4V7.2a5 5 0 0 1 10 0v3.2" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"/>
      <rect x="4.6" y="10.2" width="14.8" height="10.6" rx="2.6" fill="currentColor"/>
      <circle cx="12" cy="14.6" r="1.35" fill="#140E06"/>
      <rect x="11.25" y="15.2" width="1.5" height="3.1" rx="0.75" fill="#140E06"/>
    </svg>
    <span class="deck-lock-spark"></span>
  </span>`;

function orderedCategories(mode, source) {
  const keys = Object.keys(source || {});
  if (mode !== 'ndagi') return keys;
  const ordered = NDAGI_CATEGORY_ORDER.filter(k => keys.includes(k));
  return ordered.concat(keys.filter(k => !ordered.includes(k)));
}

function showCategoryScreen(mode) {
  currentCategoryMode = mode;
  const screen = document.getElementById('categoryScreen');
  let categories, title, source;

  if (mode === 'trivia') {
    categories = Object.keys(triviaCategories);
    source = triviaCategories;
    title = 'Trivia — Select Category';
  } else if (mode === 'charades') {
    // Deck order is set here, not by the question files. Custom Charades sits in the fourth slot.
    const all = Object.keys(charadesCategories);
    categories = CHARADES_CATEGORY_ORDER.filter((c) => all.includes(c))
      .concat(all.filter((c) => !CHARADES_CATEGORY_ORDER.includes(c)));
    if (typeof customSub === 'function') categories.splice(3, 0, 'Custom Charades');
    source = charadesCategories;
    title = 'Charades — Select Category';
    } else if (mode === 'dares') {
    categories = Object.keys(daresCategories);
    source = daresCategories;
    title = 'Dares — Select Level';
  } else if (mode === 'ndagi') {
    source = ndagiCategories;
    categories = orderedCategories(mode, source);
    title = 'Ndagi — Select Category';
  }

  screen.innerHTML = `
    <h2>${title}</h2>
    <div class="deck-carousel" id="deckCarousel">
      ${categories.map((cat, i) => {
        const isCustom = cat === 'Custom Charades';
        const meta = isCustom
          ? { sub: customSub() }
          : getCategoryMeta(cat, source && Array.isArray(source[cat]) ? source[cat].length : 0);
        const locked = !isCustom && !isUnlocked(mode, cat);
        const featured = mode === 'ndagi' && i === 0;
        return `
          <div class="deck-card carousel-card cat-deck-${(i % 7) + 1}${locked ? ' locked' : ''}${featured ? ' deck-featured' : ''}${isCustom ? ' deck-custom' : ''}" data-cat="${cat}">
            <span class="deck-art" style="background-image:url('${cardArt(mode, cat)}')">
              <span class="deck-art-tint"></span>
            </span>
            ${locked ? LOCKED_MARK : ''}
            <span class="deck-caption">
              <span class="deck-title">${categoryLabel(cat)}</span>
            </span>
            <span class="deck-sub">${meta.sub}</span>
          </div>
        `;
      }).join('')}
    </div>
    <button class="backBtn">Back</button>
  `;

  // PS4-style carousel: the card nearest the middle is the one in focus, and the
  // old-iPod trick: side cards lean in towards the middle as you scroll past.
  const carousel = screen.querySelector('#deckCarousel');
  if (carousel) {
    const cards = Array.from(carousel.querySelectorAll('.carousel-card'));
    const markActive = () => {
      const cs = getComputedStyle(carousel);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const gap = parseFloat(cs.columnGap) || 0;
      const w = cards.length ? cards[0].offsetWidth : 0;
      const step = w + gap || 1;
      const mid = carousel.scrollLeft + carousel.clientWidth / 2;
      let best = 0;
      let bestGap = Infinity;
      cards.forEach((c, i) => {
        const raw = (padL + i * step + w / 2 - mid) / step;
        const abs = Math.abs(raw);
        if (abs < bestGap) { bestGap = abs; best = i; }
        // Clamp so far-away cards keep the same lean as the first neighbour.
        const d = Math.max(-1, Math.min(1, raw));
        c.style.transform = `rotateY(${(-d * 20).toFixed(2)}deg) scale(${(1 - 0.16 * Math.abs(d)).toFixed(3)})`;
        c.style.opacity = (1 - 0.5 * Math.abs(d)).toFixed(3);
      });
      cards.forEach((c, i) => c.classList.toggle('active', i === best));
    };
    carousel.addEventListener('scroll', () => {
      if (carousel._raf) return;
      carousel._raf = requestAnimationFrame(() => { carousel._raf = null; markActive(); });
    }, { passive: true });
    window.addEventListener('resize', markActive);
    requestAnimationFrame(markActive);
  }

  screen.querySelectorAll('.deck-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = e.currentTarget.dataset.cat;
      // A card that is still off to the side just slides into the middle first.
      if (e.currentTarget.classList.contains('carousel-card') && !e.currentTarget.classList.contains('active')) {
        const rail = e.currentTarget.closest('.deck-carousel');
        if (rail) {
          const rb = rail.getBoundingClientRect();
          const cb = e.currentTarget.getBoundingClientRect();
          rail.scrollTo({ left: rail.scrollLeft + (cb.left + cb.width / 2) - (rb.left + rb.width / 2), behavior: 'smooth' });
        }
        return;
      }
      playClick();
      if (mode === 'charades' && cat === 'Custom Charades') { openCustomCharades(); return; }
      if (!isUnlocked(mode, cat)) {
        openUnlock({ kind: 'category', mode, cat });
        return;
      }
      if (mode === 'trivia') { showScreen('triviaScreen'); startTrivia(cat); }
      else if (mode === 'charades') { showScreen('charadesScreen'); startCharades(cat); }
      else if (mode === 'dares') { showScreen('daresScreen'); startDares(cat); }
      else if (mode === 'ndagi') { showScreen('ndagiScreen'); startNdagi(cat); }
    });
  });

  screen.classList.toggle('cat-few', categories.length <= 6);
  screen.classList.add('cat-carousel');
  screen.querySelector('.backBtn').addEventListener('click', () => goBack());
  showScreen('categoryScreen');
}

// --- Trivia Game Logic ---
// Questions are served in rounds. Seen questions are stored per category, so a
// new round uses fresh questions until the category is used up. Round size is
// 5 now and grows to 10 automatically when a category has enough questions.
let triviaPool = [];
let triviaRoundTotal = 0;
let triviaAnswered = 0;
let triviaChoices = [];
let currentQuestion = null;
let score = 0;
let currentTriviaCategory = '';
let triviaStreak = 0;

function triviaRoundSize(total) {
  return Math.max(5, Math.min(10, Math.floor(total / 2))) || total;
}

function readTriviaSeen() {
  try {
    const v = JSON.parse(getSetting('gn_trivia_seen', '{}'));
    return v && typeof v === 'object' ? v : {};
  } catch (e) {
    return {};
  }
}

function triviaSeenKeys(category) {
  const all = triviaCategories[category] || [];
  const saved = readTriviaSeen()[category];
  return Array.isArray(saved) ? saved.filter(k => all.some(q => q.q === k)) : [];
}

// Picks a round from questions that have not been shown yet. When the category
// runs out, it starts a fresh cycle but never repeats inside one round.
function buildTriviaRound(category) {
  const all = triviaCategories[category] || [];
  if (!all.length) return [];
  const size = Math.min(triviaRoundSize(all.length), all.length);
  const seen = triviaSeenKeys(category);
  let unseen = all.filter(q => !seen.includes(q.q));

  if (unseen.length === 0) {
    unseen = all.slice();
  }

  return shuffleArray(unseen.slice()).slice(0, Math.min(size, unseen.length));
}

function markTriviaSeen(category, questionText) {
  const all = triviaCategories[category] || [];
  const store = readTriviaSeen();
  const saved = Array.isArray(store[category])
    ? store[category].filter(k => all.some(q => q.q === k))
    : [];
  if (!saved.includes(questionText)) saved.push(questionText);
  store[category] = saved;
  setSetting('gn_trivia_seen', JSON.stringify(store));
}

function startTrivia(category) {
  currentTriviaCategory = category;
  clearTimeout(triviaNextTimer);
  triviaNextTimer = null;
  triviaPool = buildTriviaRound(category);
  triviaRoundTotal = triviaPool.length;
  triviaAnswered = 0;
  score = 0;
  triviaStreak = 0;
  nextQuestion();
}

function nextQuestion() {
  if (triviaPool.length === 0) {
    endTrivia();
    return;
  }
  currentQuestion = triviaPool.shift();
  markTriviaSeen(currentTriviaCategory, currentQuestion.q);
  triviaChoices = shuffleArray(currentQuestion.options.slice());
  renderQuestion();
}

function renderQuestion() {
  const screen = document.getElementById('triviaScreen');
  screen.scrollTop = 0;
  screen.innerHTML = `
    <h2>Trivia — ${currentTriviaCategory}</h2>
    <p class="score">Score: ${score} | Question ${Math.min(triviaAnswered + 1, triviaRoundTotal)} of ${triviaRoundTotal}</p>
    <div class="game-card">
      <p class="question">${currentQuestion.q}</p>
      <div class="options">
        ${triviaChoices.map((opt, i) =>
          `<button class="optionBtn" data-i="${i}">${opt}</button>`
        ).join('')}
      </div>
    </div>
    <div class="game-actions">
      <button class="game-back">Back</button>
      <button class="game-finish">Finish</button>
    </div>
  `;

  screen.querySelectorAll('.optionBtn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const chosen = parseInt(e.target.dataset.i);
      checkAnswer(chosen);
    });
  });

  // Back goes Home, as requested. Hardware back still opens the pause card.
  screen.querySelector('.game-back').addEventListener('click', quitTriviaToHome);
  screen.querySelector('.game-finish').addEventListener('click', finishTrivia);
}

function quitTriviaToHome() {
  clearTimeout(triviaNextTimer);
  triviaNextTimer = null;
  triviaPool = [];
  screenHistory = ['homeScreen'];
  showScreen('homeScreen', true);
}

function finishTrivia() {
  clearTimeout(triviaNextTimer);
  triviaNextTimer = null;
  triviaPool = [];
  endTrivia();
}

function checkAnswer(chosen) {
  const buttons = document.querySelectorAll('#triviaScreen .optionBtn');
  buttons.forEach(btn => btn.disabled = true);

  const correctText = currentQuestion.options[currentQuestion.answer];
  const correctIdx = triviaChoices.indexOf(correctText);
  const isCorrect = chosen === correctIdx;
  const feedback = document.createElement('div');
  triviaAnswered++;

  if (isCorrect) {
    score++;
    triviaStreak++;
    playCorrect();
    awardPoints('trivia');
    vibrateShort();
    if (typeof Celebrations !== 'undefined') Celebrations.correct();
    buttons[chosen].style.outline = '4px solid #2E7D32';
    feedback.innerHTML = `
      <p class="feedback-text" style="color:#43A047;">Nice one! 🔥</p>
      <p class="points-text">+${UNLOCK_CONFIG.earn.trivia} POINT</p>
      ${triviaStreak > 1 ? `<p class="streak-text">🔥 ${triviaStreak} STREAK</p>` : ''}
    `;
  } else {
    triviaStreak = 0;
    playWrong();
    vibrateMedium();
    if (typeof Celebrations !== 'undefined') Celebrations.wrong();
    buttons[chosen].style.outline = '4px solid #B71C1C';
    if (correctIdx >= 0) buttons[correctIdx].style.outline = '4px solid #2E7D32';
    feedback.innerHTML = `<p class="feedback-text" style="color:#E53935;">So close! 😅</p>`;
  }

  document.querySelector('#triviaScreen .game-card').appendChild(feedback);
  clearTimeout(triviaNextTimer);
  triviaNextTimer = setTimeout(nextQuestion, 1400);
}

function endTrivia() {
  const screen = document.getElementById('triviaScreen');
  const answered = triviaAnswered;
  const round = triviaRoundTotal;
  playSuccess();
  vibrateSuccess();
  screen.innerHTML = `
    <h2>Trivia Results</h2>
    <p class="score">${score} / ${answered} correct</p>
    <p class="unlock-note">${answered < round ? 'You finished early — ' + (round - answered) + ' question' + (round - answered === 1 ? '' : 's') + ' left in this round.' : 'Round complete.'}</p>
    <p class="score">${score} point${score === 1 ? '' : 's'} earned</p>
    <button id="playAgainBtn">Play Again</button>
    <button class="backBtn">Back to Home</button>
  `;
  document.getElementById('playAgainBtn').addEventListener('click', () => startTrivia(currentTriviaCategory));
  screen.querySelector('.backBtn').addEventListener('click', () => {
    screenHistory = ['homeScreen'];
    showScreen('homeScreen', true);
  });
  if (typeof Celebrations !== 'undefined') Celebrations.round(screen, score, answered, 'trivia');
  addReviewPrompt(screen);
}

// --- Charades Game Logic (Heads Up! style: full-screen flash + tilt + landscape) ---
let charadesPool = [];
let charadesScore = 0;
let charadesStreak = 0;
let charadesCorrectWords = [];
let charadesWrongWords = [];
let charadesTimer = null;
let timeLeft = 60;
let charadesTotalTime = 60;
let currentCharadesCategory = '';
let currentCharadesWord = '';
let charadesLocked = false;
let charadesRunning = false;      // true only while a round is on screen (false on the results screen)
let charadesSession = 0;          // bumped on start/exit so stale flash timers cannot revive the game
let charadesFlashTimer = null;
let charadesAdvancePending = false; // the card was answered just before pausing; advance after resume
let tiltListenerActive = false;
let charadesTouchStartY = 0;
let charadesTouchListenersAttached = false;
// Set by Custom Charades before a round starts: 0 means no timer at all.
let customCharadesTimer = null;

function startCharades(category) {
  charadesSession++;
  charadesRunning = true;
  clearTimeout(charadesFlashTimer);
  charadesFlashTimer = null;
  charadesAdvancePending = false;
  currentCharadesCategory = category;
  charadesPool = [...charadesCategories[category]];
  charadesScore = 0;
  charadesStreak = 0;
  charadesCorrectWords = [];
  charadesWrongWords = [];
  charadesTotalTime = (customCharadesTimer === null)
    ? parseInt(getSetting('gn_charadesTimer', '60'))
    : customCharadesTimer;
  timeLeft = charadesTotalTime;
  customCharadesTimer = null;
  lockLandscape();
  attachCharadesTouchListeners();
  nextPrompt();
  startTimer();
  enableTiltDetection();
}

function attachCharadesTouchListeners() {
  if (charadesTouchListenersAttached) return;
  const screen = document.getElementById('charadesScreen');
  screen.addEventListener('touchstart', (e) => {
    if (!charadesRunning) return;
    charadesTouchStartY = e.touches[0].clientY;
  });
  screen.addEventListener('touchend', (e) => {
    // The results screen reuses this element; a swipe there must not score a word.
    if (!charadesRunning) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = charadesTouchStartY - touchEndY;
    if (diff > 60) handleCharadesResult(true);
    else if (diff < -60) handleCharadesResult(false);
  });
  charadesTouchListenersAttached = true;
}

function startTimer() {
  clearInterval(charadesTimer);
  // A custom round can run with no clock at all.
  if (charadesTotalTime <= 0) {
    const el = document.getElementById('charadesTimer');
    if (el) el.textContent = '∞';
    return;
  }
  charadesTimer = setInterval(() => {
    timeLeft--;
    const timerEl = document.getElementById('charadesTimer');
    if (timerEl) {
      timerEl.textContent = timeLeft + 's';
      timerEl.classList.toggle('timer-warning', timeLeft <= 10);
    }
    if (timeLeft <= 0) {
      clearInterval(charadesTimer);
      exitCharadesRuntime();
      endCharades();
    }
  }, 1000);
}

function nextPrompt() {
  if (!charadesRunning) return;
  if (charadesPool.length === 0) {
    charadesPool = [...charadesCategories[currentCharadesCategory]];
  }
  const idx = Math.floor(Math.random() * charadesPool.length);
  currentCharadesWord = charadesPool.splice(idx, 1)[0];
  charadesLocked = false;
  renderCharades();
}

function renderCharades() {
  const screen = document.getElementById('charadesScreen');
  screen.classList.add('active', 'charades-fullscreen');

  let contentArea = screen.querySelector('.charades-content');
  if (!contentArea) {
    screen.innerHTML = '<div class="charades-content"></div>';
    contentArea = screen.querySelector('.charades-content');
  }

  contentArea.innerHTML = `
    <div class="charades-topbar">
      <span id="charadesTimer" class="charades-timer">${charadesTotalTime > 0 ? timeLeft + 's' : '∞'}</span>
      <span id="charadesFinishBtn" class="charades-finish">Finish</span>
    </div>
    <p class="streak-text charades-streak${charadesStreak > 1 ? '' : ' off'}">🔥 ${charadesStreak > 1 ? charadesStreak : 2} STREAK!</p>
    <div class="charades-wordbox"><p class="charades-word">${currentCharadesWord}</p></div>
    <p class="charades-hint">⬆️ Tilt up or swipe up: Correct &nbsp; ⬇️ Tilt down or swipe down: Skip</p>
    <div class="charades-buttons">
      <button id="skipBtn">⏭ Skip</button>
      <button id="correctBtn">✅ Correct</button>
    </div>
  `;

  document.getElementById('charadesFinishBtn').addEventListener('click', () => {
    exitCharadesRuntime();
    endCharades();
  });

  document.getElementById('correctBtn').addEventListener('click', () => handleCharadesResult(true));
  document.getElementById('skipBtn').addEventListener('click', () => handleCharadesResult(false));
  fitCharadesWord();
}

// Sizes the charades word to the space between the streak line and the hint, whatever its length.
function fitCharadesWord() {
  const word = document.querySelector('#charadesScreen .charades-word');
  if (!word) return;
  const fit = () => {
    const box = word.parentElement;
    fitTextToBox(word, box, Math.min(72, box.clientHeight * 0.55), 18);
  };
  requestAnimationFrame(fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
}
window.addEventListener('resize', () => {
  const cs = document.getElementById('charadesScreen');
  if (cs && cs.classList.contains('active') && cs.classList.contains('charades-fullscreen')) fitCharadesWord();
});

function handleCharadesResult(isCorrect) {
  if (!charadesRunning || charadesLocked) return;
  charadesLocked = true;

  const screen = document.getElementById('charadesScreen');
  const flash = document.createElement('div');
  flash.className = isCorrect ? 'charades-flash flash-correct' : 'charades-flash flash-skip';
  flash.innerHTML = `<span>${isCorrect ? '✅ Correct!' : '⏭ Skip!'}</span>`;
  screen.appendChild(flash);

  if (isCorrect) {
    charadesScore++;
    charadesStreak++;
    charadesCorrectWords.push(currentCharadesWord);
    playCorrect();
    awardPoints('charades', true);
    vibrateShort();
  } else {
    charadesStreak = 0;
    charadesWrongWords.push(currentCharadesWord);
    playClick();
    vibrateMedium();
  }

  const session = charadesSession;
  clearTimeout(charadesFlashTimer);
  charadesFlashTimer = setTimeout(() => {
    charadesFlashTimer = null;
    flash.remove();
    // If the player left/restarted Charades, this callback is stale.
    if (session !== charadesSession || !charadesRunning) return;
    // Paused before the flash finished: advance once the player resumes.
    if (pauseOpen && pauseMode === 'charades') {
      charadesAdvancePending = true;
      return;
    }
    charadesLocked = false;
    if (timeLeft > 0) nextPrompt();
  }, 550);
}

// Tilt detection — bonus input alongside buttons/swipe.
// Uses the accelerometer's gravity vector instead of deviceorientation beta/gamma,
// which becomes unstable when the phone is held upright in landscape (the
// "forehead" position) and caused phantom tilts and missing tilt-down.
//
// tilt angle:  0 = phone upright | +90 = screen faces ceiling | -90 = screen faces floor
// It is independent of which landscape side the phone is rotated to.
const TILT_UP_IS_CORRECT = true;   // screen toward ceiling = Correct, toward floor = Skip (set false to swap)
const TILT_NEUTRAL_DEG = 25;       // must return inside +/- this to re-arm
const TILT_TRIGGER_DEG = 40;       // beyond +/- this counts as a tilt
const TILT_HOLD_MS = 120;          // must stay beyond the trigger this long (ignores jolts)
const TILT_REARM_MS = 350;         // must stay neutral this long before another tilt counts
let tiltAngle = null;
let tiltArmed = false;
let tiltNeutralSince = 0;
let tiltBeyondSince = 0;

let tiltRequestPending = false;

function enableTiltDetection() {
  if (tiltListenerActive || tiltRequestPending || typeof window.DeviceMotionEvent === 'undefined') return;

  // iOS 13+ only exposes motion sensors after an explicit permission request,
  // and that request must happen inside a user gesture (a tap on the game tile).
  if (typeof window.DeviceMotionEvent.requestPermission === 'function') {
    tiltRequestPending = true;
    window.DeviceMotionEvent.requestPermission()
      .then((state) => {
        if (state === 'granted') attachTiltListener();
      })
      .catch(() => { /* denied or unavailable — buttons and swipes still work */ })
      .then(() => { tiltRequestPending = false; });
    return;
  }

  attachTiltListener();
}

function attachTiltListener() {
  if (tiltListenerActive) return;
  // The player may have left Charades while the permission dialog was up.
  const cs = document.getElementById('charadesScreen');
  if (!cs || !cs.classList.contains('active') || !cs.classList.contains('charades-fullscreen')) return;
  tiltAngle = null;
  tiltArmed = false;
  tiltNeutralSince = 0;
  tiltBeyondSince = 0;
  window.addEventListener('devicemotion', onTiltEvent);
  tiltListenerActive = true;
}

function disableTiltDetection() {
  window.removeEventListener('devicemotion', onTiltEvent);
  tiltListenerActive = false;
  tiltAngle = null;
  tiltArmed = false;
}

function onTiltEvent(event) {
  // Permission can resolve after the player has already left the game.
  // Only react while a Charades round is actually on screen.
  if (!charadesRunning) return;
  const cs = document.getElementById('charadesScreen');
  if (!cs || !cs.classList.contains('active') || !cs.classList.contains('charades-fullscreen')) return;

  const g = event.accelerationIncludingGravity;
  if (!g || g.x === null || g.y === null || g.z === null) return;

  const raw = Math.atan2(g.z, Math.hypot(g.x, g.y)) * 180 / Math.PI;
  tiltAngle = tiltAngle === null ? raw : tiltAngle * 0.7 + raw * 0.3; // smooth out hand shake
  const now = Date.now();

  // While the Correct/Skip flash is showing, ignore tilting and force a fresh re-arm afterwards
  if (charadesLocked) {
    tiltArmed = false;
    tiltNeutralSince = 0;
    tiltBeyondSince = 0;
    return;
  }

  // Not armed: wait for the phone to settle in the neutral (upright) zone
  if (!tiltArmed) {
    if (Math.abs(tiltAngle) < TILT_NEUTRAL_DEG) {
      if (!tiltNeutralSince) tiltNeutralSince = now;
      if (now - tiltNeutralSince >= TILT_REARM_MS) {
        tiltArmed = true;
        tiltBeyondSince = 0;
      }
    } else {
      tiltNeutralSince = 0;
    }
    return;
  }

  // Armed: a deliberate tilt past the trigger angle, held briefly
  if (Math.abs(tiltAngle) > TILT_TRIGGER_DEG) {
    if (!tiltBeyondSince) tiltBeyondSince = now;
    if (now - tiltBeyondSince >= TILT_HOLD_MS) {
      const up = tiltAngle > 0;
      tiltArmed = false;
      tiltNeutralSince = 0;
      tiltBeyondSince = 0;
      handleCharadesResult(TILT_UP_IS_CORRECT ? up : !up);
    }
  } else {
    tiltBeyondSince = 0;
  }
}

function lockLandscape() {
  try {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ScreenOrientation) {
      window.Capacitor.Plugins.ScreenOrientation.lock({ orientation: 'landscape' });
    }
  } catch (e) { /* ignore */ }
}

function unlockOrientation() {
  try {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.ScreenOrientation) {
      window.Capacitor.Plugins.ScreenOrientation.unlock();
    }
  } catch (e) { /* ignore */ }
}

function exitCharadesRuntime() {
  charadesSession++;
  charadesRunning = false;
  clearTimeout(charadesFlashTimer);
  charadesFlashTimer = null;
  charadesAdvancePending = false;
  charadesLocked = false;
  clearInterval(charadesTimer);
  disableTiltDetection();
  unlockOrientation();
  const screen = document.getElementById('charadesScreen');
  screen.classList.remove('charades-fullscreen');
}

function endCharades() {
  charadesRunning = false;
  const screen = document.getElementById('charadesScreen');
  playSuccess();
  vibrateSuccess();
  const correct = charadesCorrectWords;
  const wrong = charadesWrongWords;
  const list = (words, empty) => words.length
    ? '<ul>' + words.map(w => `<li>${w}</li>`).join('') + '</ul>'
    : `<p class="charades-result-empty">${empty}</p>`;
  screen.innerHTML = `
    <h2>Charades Results</h2>
    <p class="score">${correct.length} correct · ${wrong.length} skipped</p>
    <div class="charades-results">
      <div class="charades-result-col correct">
        <h3>✅ Correct (${correct.length})</h3>
        ${list(correct, 'No correct words this round.')}
      </div>
      <div class="charades-result-col wrong">
        <h3>⏭ Wrong / Skipped (${wrong.length})</h3>
        ${list(wrong, 'Nothing skipped this round.')}
      </div>
    </div>
    <button id="playAgainCharadesBtn">Play Again</button>
    <button class="backBtn">Back to Home</button>
  `;
  document.getElementById('playAgainCharadesBtn').addEventListener('click', () => {
    screen.classList.add('charades-fullscreen');
    lockLandscape();
    startCharades(currentCharadesCategory);
  });
  screen.querySelector('.backBtn').addEventListener('click', () => {
    screenHistory = ['homeScreen'];
    showScreen('homeScreen', true);
  });
  if (typeof Celebrations !== 'undefined') Celebrations.round(screen, correct.length, correct.length + wrong.length, 'charades');
  addReviewPrompt(screen);
}

// --- Dares Game Logic ---
let daresPool = [];
let currentDaresCategory = '';

function startDares(category) {
  currentDaresCategory = category;
  daresPool = [...daresCategories[category]];
  nextDare();
}

function nextDare() {
  if (daresPool.length === 0) {
    daresPool = [...daresCategories[currentDaresCategory]];
  }
  const idx = Math.floor(Math.random() * daresPool.length);
  const dare = daresPool.splice(idx, 1)[0];
  renderDare(dare);
}

// Shrinks text until it fits inside its box, so the layout never depends on how long the text is.
function fitTextToBox(textEl, boxEl, maxPx, minPx) {
  if (!textEl || !boxEl) return;
  const cs = getComputedStyle(boxEl);
  const availH = boxEl.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const availW = boxEl.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  let px = Math.max(minPx, maxPx);
  textEl.style.fontSize = px + 'px';
  while ((textEl.scrollHeight > availH || textEl.scrollWidth > availW) && px > minPx) {
    px -= 1;
    textEl.style.fontSize = px + 'px';
  }
}

function renderDare(dare) {
  const screen = document.getElementById('daresScreen');
  screen.innerHTML = `
    <h2>Dares — ${currentDaresCategory}</h2>
    <div class="game-card dare-card">
      <p class="question">${dare}</p>
    </div>
    <div class="dare-actions">
      <button id="doneDareBtn">✅ Done</button>
      <button id="nextDareBtn">⏭ Next Dare</button>
    </div>
    <button class="backBtn">Back</button>
  `;
  screen.scrollTop = 0;
  const dareCard = screen.querySelector('.dare-card');
  requestAnimationFrame(() => fitTextToBox(dareCard.querySelector('.question'), dareCard, 26, 14));

  document.getElementById('doneDareBtn').addEventListener('click', () => {
    playCorrect();
    awardPoints('dares');
    vibrateShort();
    nextDare();
  });
  document.getElementById('nextDareBtn').addEventListener('click', () => {
    playClick();
    nextDare();
  });
  screen.querySelector('.backBtn').addEventListener('click', () => goBack());
}

// --- Quick Challenge Game Logic (Brady-style rapid fire) ---
let quickPool = [];
let quickScore = 0;
let quickAnswered = 0;
let quickTimer = null;
let quickTimeLeft = 45;
let currentQuick = null;

function startQuickChallenge() {
  clearTimeout(quickAdvanceTimeout);
  quickPool = [...quickChallengeQuestions];
  quickScore = 0;
  quickAnswered = 0;
  quickTimeLeft = parseInt(getSetting('gn_quickTimer', '45'));
  nextQuick();
  startQuickTimer();
}

// Stops the round clock and any pending "next question" callback.
// Called by the Back button, hardware back, and showScreen() when leaving the screen.
function stopQuickChallenge() {
  clearInterval(quickTimer);
  clearTimeout(quickAdvanceTimeout);
}

function startQuickTimer() {
  clearInterval(quickTimer);
  quickTimer = setInterval(() => {
    quickTimeLeft--;
    const timerEl = document.getElementById('quickTimer');
    if (timerEl) {
      timerEl.textContent = quickTimeLeft;
      timerEl.classList.toggle('timer-warning', quickTimeLeft <= 10);
    }
    if (quickTimeLeft <= 0) {
      clearInterval(quickTimer);
      endQuickChallenge();
    }
  }, 1000);
}

function nextQuick() {
  if (quickPool.length === 0) {
    quickPool = [...quickChallengeQuestions];
  }
  const idx = Math.floor(Math.random() * quickPool.length);
  currentQuick = quickPool.splice(idx, 1)[0];
  renderQuick();
}

// --- Shared helpers for pick-the-answer modes (Quick Challenge, Ndagi) ---
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Builds 4 shuffled choices. Uses the item's own wrong answers when present;
// if it has fewer than 3, fills the gap with answers from other items so new questions never break.
function buildChoices(correct, wrong, pool) {
  let distractors = (Array.isArray(wrong) ? wrong : []).filter(w => w && w !== correct);
  if (distractors.length < 3) {
    const others = shuffleArray((pool || []).filter(a => a && a !== correct && !distractors.includes(a)));
    distractors = distractors.concat(others.slice(0, 3 - distractors.length));
  }
  return shuffleArray([correct, ...distractors.slice(0, 3)]);
}

function markChoices(buttons, choices, chosenIdx, correctText) {
  buttons.forEach((b, i) => {
    b.disabled = true;
    if (choices[i] === correctText) {
      b.style.outline = '4px solid #2E7D32';
      b.style.background = 'rgba(46, 125, 50, 0.6)';
    } else if (i === chosenIdx) {
      b.style.outline = '4px solid #B71C1C';
      b.style.background = 'rgba(183, 28, 28, 0.6)';
    }
  });
}

let quickLocked = false;
let quickAdvanceTimeout = null;

function renderQuick() {
  const screen = document.getElementById('quickScreen');
  screen.scrollTop = 0;
  quickLocked = false;
  const choices = buildChoices(currentQuick.a, currentQuick.wrong, quickChallengeQuestions.map(q => q.a));

  screen.innerHTML = `
    <h2>⚡ Quick Challenge</h2>
    <p class="score">Score: ${quickScore} | Time: <span id="quickTimer">${quickTimeLeft}</span>s</p>
    <div class="game-card">
      <p class="question">${currentQuick.q}</p>
      <div class="options">
        ${choices.map((c, i) => `<button class="optionBtn" data-i="${i}">${c}</button>`).join('')}
      </div>
    </div>
    <button class="backBtn">Back</button>
  `;

  const buttons = screen.querySelectorAll('.optionBtn');
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (quickLocked) return;
      quickLocked = true;
      quickAnswered++;
      const correct = choices[i] === currentQuick.a;
      markChoices(buttons, choices, i, currentQuick.a);
      if (correct) {
        quickScore++;
        playCorrect();
        awardPoints('quick', true);
        vibrateShort();
        if (typeof Celebrations !== 'undefined') Celebrations.correct();
      } else {
        playWrong();
        vibrateMedium();
        if (typeof Celebrations !== 'undefined') Celebrations.wrong();
      }
      quickAdvanceTimeout = setTimeout(() => {
        if (quickTimeLeft > 0) nextQuick();
      }, correct ? 600 : 1100);
    });
  });

  screen.querySelector('.backBtn').addEventListener('click', () => {
    stopQuickChallenge();
    goBack();
  });
}

function endQuickChallenge() {
  clearTimeout(quickAdvanceTimeout);
  const screen = document.getElementById('quickScreen');
  playSuccess();
  vibrateSuccess();
  screen.innerHTML = `
    <h2>⚡ Time's Up!</h2>
    <p class="score">Final Score: ${quickScore}</p>
    <p>Follow to get smarter 🧠</p>
    <button id="playAgainQuickBtn">Play Again</button>
    <button class="backBtn">Back to Home</button>
  `;
  document.getElementById('playAgainQuickBtn').addEventListener('click', startQuickChallenge);
  screen.querySelector('.backBtn').addEventListener('click', () => {
    screenHistory = ['homeScreen'];
    showScreen('homeScreen', true);
  });
  if (typeof Celebrations !== 'undefined') Celebrations.round(screen, quickScore, quickAnswered, 'quick');
  addReviewPrompt(screen);
}

// --- Ndagi (Riddles) Game Logic ---
let ndagiPool = [];
let ndagiScore = 0;
let ndagiAnswered = 0;
let currentNdagiCategory = '';
let currentNdagi = null;

// =====================================================
// Apa Ndipati — "Where is this?" photo game
// =====================================================
const APA_ROUNDS = 10;
let apaPool = [];
let apaScore = 0;
let apaRound = 0;
let apaCurrent = null;
let apaLocked = false;

function apaLabel(p) {
  return p.name + ' · ' + p.town;
}

// 4 choices as text labels: the right place plus 3 look-alike decoys written for that photo
// (place.decoys, 3 picked at random each time). A place with no decoys falls back to
// real places from other areas.
function apaChoices(place) {
  const correct = apaLabel(place);
  let wrong = [];
  if (Array.isArray(place.decoys) && place.decoys.length >= 3) {
    wrong = shuffleArray(place.decoys.filter(d => d !== correct)).slice(0, 3);
  } else {
    const others = apaPlaces.filter(p => p.id !== place.id);
    const usedAreas = new Set([place.area]);
    for (const p of shuffleArray(others.filter(p => p.area !== place.area))) {
      if (!usedAreas.has(p.area)) {
        wrong.push(apaLabel(p));
        usedAreas.add(p.area);
      }
      if (wrong.length === 3) break;
    }
    for (const p of shuffleArray(others)) {
      if (wrong.length < 3 && !wrong.includes(apaLabel(p))) wrong.push(apaLabel(p));
    }
  }
  return shuffleArray([correct, ...wrong]);
}

function startApa() {
  apaPool = shuffleArray([...apaPlaces]).slice(0, Math.min(APA_ROUNDS, apaPlaces.length));
  apaScore = 0;
  apaRound = 0;
  nextApa();
  showScreen('apaScreen');
}

function nextApa() {
  apaCurrent = apaPool[apaRound];
  renderApa();
  const upcoming = apaPool[apaRound + 1];
  if (upcoming) {
    const preload = new Image();
    preload.src = upcoming.photo;
  }
}

function renderApa() {
  const screen = document.getElementById('apaScreen');
  screen.scrollTop = 0;
  apaLocked = false;
  const total = apaPool.length;
  const labels = apaChoices(apaCurrent);
  const correctLabel = apaLabel(apaCurrent);

  screen.innerHTML = `
    <h2>📍 Apa Ndipati</h2>
    <p class="score">Score: ${apaScore} | Photo ${apaRound + 1} of ${total}</p>
    <div class="game-card apa-card">
      <img class="apa-photo" src="${apaCurrent.photo}" alt="Where is this?">
      <div class="apa-side">
        <p class="question">Where is this?</p>
        <div class="options">
          ${labels.map((l, i) => `<button class="optionBtn" data-i="${i}">${l}</button>`).join('')}
        </div>
        <div class="apa-reveal" id="apaReveal" style="display:none;"></div>
      </div>
    </div>
    <button id="apaNextBtn" style="display:none;">${apaRound + 1 === total ? 'Finish ▶' : 'Next ▶'}</button>
    <button class="backBtn">Back</button>
  `;

  const buttons = screen.querySelectorAll('.optionBtn');
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (apaLocked) return;
      apaLocked = true;
      const correct = labels[i] === correctLabel;
      markChoices(buttons, labels, i, correctLabel);
      if (correct) {
        apaScore++;
        playCorrect();
        awardPoints('apa');
        vibrateShort();
        if (typeof Celebrations !== 'undefined') Celebrations.correct();
      } else {
        playWrong();
        vibrateMedium();
        if (typeof Celebrations !== 'undefined') Celebrations.wrong();
      }
      const reveal = document.getElementById('apaReveal');
      reveal.innerHTML = `
        <p class="apa-verdict" style="color:${correct ? '#6FD38B' : '#FF8A80'}">${correct ? '✅ Correct!' : '❌ Not quite'}</p>
        <p class="apa-town">📍 ${apaCurrent.name}, ${apaCurrent.town}</p>
        ${apaCurrent.fact ? `<p class="apa-fact">${apaCurrent.fact}</p>` : ''}
        ${apaCurrent.credit ? `<p class="apa-credit">📷 ${apaCurrent.credit}</p>` : ''}
      `;
      reveal.style.display = 'block';
      document.getElementById('apaNextBtn').style.display = 'inline-block';
      setTimeout(() => {
        const nb = document.getElementById('apaNextBtn');
        if (nb) nb.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    });
  });

  document.getElementById('apaNextBtn').addEventListener('click', () => {
    apaRound++;
    if (apaRound >= apaPool.length) {
      endApa();
    } else {
      nextApa();
    }
  });
  screen.querySelector('.backBtn').addEventListener('click', () => goBack());
}

function endApa() {
  const screen = document.getElementById('apaScreen');
  const total = apaPool.length;
  playSuccess();
  vibrateSuccess();
  const msg = apaScore >= total * 0.8 ? 'You really know your Malawi! ✨'
    : apaScore >= total * 0.5 ? 'Good going — keep exploring!'
    : 'Plenty more of the Warm Heart of Africa to discover!';
  screen.innerHTML = `
    <h2>Apa Ndipati Complete!</h2>
    <p class="score">Final Score: ${apaScore} / ${total}</p>
    <p class="apa-msg">${msg}</p>
    <button id="playAgainApaBtn">Play Again</button>
    <button class="backBtn">Back to Home</button>
  `;
  document.getElementById('playAgainApaBtn').addEventListener('click', () => startApa());
  screen.querySelector('.backBtn').addEventListener('click', () => {
    screenHistory = ['homeScreen'];
    showScreen('homeScreen', true);
  });
  if (typeof Celebrations !== 'undefined') Celebrations.round(screen, apaScore, total, 'apa');
  addReviewPrompt(screen);
}

const NDAGI_ROUNDS = 10;
let ndagiTotal = 0;

// Owner data comes in two shapes: classic riddles (answer + wrong) and
// fill-the-blank proverbs (q + options + answer index + meaning). Normalise the
// proverb shape to the riddle shape so both play the same way.
function ndagiItem(item) {
  if (item && Array.isArray(item.options) && typeof item.answer === 'number') {
    return {
      proverb: item.q,
      riddle: item.q,
      answer: item.options[item.answer],
      wrong: item.options.filter((_, i) => i !== item.answer),
      meaning: item.meaning || ''
    };
  }
  return item;
}

function startNdagi(category) {
  currentNdagiCategory = category;
  ndagiPool = shuffleArray([...ndagiCategories[category]].map(ndagiItem)).slice(0, NDAGI_ROUNDS);
  ndagiTotal = ndagiPool.length;
  ndagiScore = 0;
  ndagiAnswered = 0;
  nextNdagi();
}

function nextNdagi() {
  if (ndagiPool.length === 0) {
    endNdagi();
    return;
  }
  const idx = Math.floor(Math.random() * ndagiPool.length);
  currentNdagi = ndagiPool.splice(idx, 1)[0];
  renderNdagi();
}

let ndagiLocked = false;

// "Malawi Proverbs": the screen is in Chichewa; the meaning is explained in English.
function renderProverb() {
  const screen = document.getElementById('ndagiScreen');
  screen.scrollTop = 0;
  ndagiLocked = false;
  const chi = currentNdagiCategory === 'Malawi Proverbs';
  const allAnswers = Object.values(ndagiCategories).flat()
    .map(p => (Array.isArray(p.options) && typeof p.answer === 'number' ? p.options[p.answer] : p.answer));
  const labels = buildChoices(currentNdagi.answer, currentNdagi.wrong, allAnswers);
  const shown = currentNdagi.proverb.replace('____', '<span class="proverb-blank">_____</span>');
  const full = currentNdagi.proverb.replace('____', currentNdagi.answer);

  screen.innerHTML = `
    <h2>${chi ? 'Ndagi — Miyambi' : 'Ndagi — ' + currentNdagiCategory}</h2>
    <p class="score">${chi ? 'Marks' : 'Score'}: ${ndagiScore}</p>
    <div class="game-card">
      <p class="proverb-prompt">${chi ? 'Malizitsani mwambi uwu:' : 'Complete the proverb:'}</p>
      <p class="question proverb-text">${shown}</p>
      <div class="options">
        ${labels.map((l, i) => `<button class="optionBtn" data-i="${i}">${l}</button>`).join('')}
      </div>
      <div class="proverb-reveal" id="proverbReveal" style="display:none;"></div>
    </div>
    <button id="ndagiNextBtn" style="display:none;">Next ▶</button>
    <div class="game-actions">
      <button class="game-back">Back</button>
      <button class="game-finish">Finish</button>
    </div>
  `;

  const buttons = screen.querySelectorAll('.optionBtn');
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (ndagiLocked) return;
      ndagiLocked = true;
      const correct = labels[i] === currentNdagi.answer;
      ndagiAnswered++;
      markChoices(buttons, labels, i, currentNdagi.answer);
      if (correct) {
        ndagiScore++;
        playCorrect();
        awardPoints('ndagi');
        vibrateShort();
        if (typeof Celebrations !== 'undefined') Celebrations.correct();
      } else {
        playWrong();
        vibrateMedium();
        if (typeof Celebrations !== 'undefined') Celebrations.wrong();
      }
      const reveal = document.getElementById('proverbReveal');
      reveal.innerHTML = `
        <p class="apa-verdict" style="color:${correct ? '#6FD38B' : '#FF8A80'}">${correct ? (chi ? '✅ Zabwino kwambiri!' : '✅ Correct!') : (chi ? '❌ Yankho lolondola ndi: ' : '❌ Correct answer: ') + currentNdagi.answer}</p>
        <p class="proverb-full">${full}</p>
        <p class="proverb-meaning"><strong>${chi ? 'Tanthauzo' : 'Meaning'}:</strong> ${currentNdagi.meaning || ''}</p>
      `;
      reveal.style.display = 'block';
      document.getElementById('ndagiNextBtn').style.display = 'inline-block';
      setTimeout(() => {
        const nb = document.getElementById('ndagiNextBtn');
        if (nb) nb.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 150);
    });
  });

  document.getElementById('ndagiNextBtn').addEventListener('click', () => nextNdagi());
  screen.querySelector('.game-back').addEventListener('click', quitNdagiToHome);
  screen.querySelector('.game-finish').addEventListener('click', finishNdagi);
}

function renderNdagi() {
  if (currentNdagi && currentNdagi.proverb) {
    renderProverb();
    return;
  }
  const screen = document.getElementById('ndagiScreen');
  screen.scrollTop = 0;
  ndagiLocked = false;
  const choices = buildChoices(currentNdagi.answer, currentNdagi.wrong, Object.values(ndagiCategories).flat().map(x => x.answer));

  screen.innerHTML = `
    <h2>Ndagi — ${currentNdagiCategory}</h2>
    <p class="score">Score: ${ndagiScore}</p>
    <div class="game-card">
      <p class="question">${currentNdagi.riddle}</p>
      <div class="options">
        ${choices.map((c, i) => `<button class="optionBtn" data-i="${i}">${c}</button>`).join('')}
      </div>
      <p class="feedback-text" id="ndagiFeedback"></p>
    </div>
    <button id="ndagiNextBtn" style="display:none;">Next ▶</button>
    <div class="game-actions">
      <button class="game-back">Back</button>
      <button class="game-finish">Finish</button>
    </div>
  `;

  const buttons = screen.querySelectorAll('.optionBtn');
  const feedback = document.getElementById('ndagiFeedback');
  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      if (ndagiLocked) return;
      ndagiLocked = true;
      const correct = choices[i] === currentNdagi.answer;
      ndagiAnswered++;
      markChoices(buttons, choices, i, currentNdagi.answer);
      if (correct) {
        ndagiScore++;
        feedback.textContent = '✅ Correct!';
        feedback.style.color = '#6FD38B';
        playCorrect();
        awardPoints('ndagi');
        vibrateShort();
        if (typeof Celebrations !== 'undefined') Celebrations.correct();
      } else {
        feedback.textContent = '❌ The answer is: ' + currentNdagi.answer;
        feedback.style.color = '#FF8A80';
        playWrong();
        vibrateMedium();
        if (typeof Celebrations !== 'undefined') Celebrations.wrong();
      }
      document.getElementById('ndagiNextBtn').style.display = 'inline-block';
    });
  });

  document.getElementById('ndagiNextBtn').addEventListener('click', () => nextNdagi());
  screen.querySelector('.game-back').addEventListener('click', quitNdagiToHome);
  screen.querySelector('.game-finish').addEventListener('click', finishNdagi);
}

function quitNdagiToHome() {
  screenHistory = ['homeScreen'];
  showScreen('homeScreen', true);
}

function finishNdagi() {
  endNdagi();
}

function endNdagi() {
  const screen = document.getElementById('ndagiScreen');
  const answered = ndagiAnswered;
  const planned = ndagiTotal;
  playSuccess();
  vibrateSuccess();
  const chi = currentNdagiCategory === 'Malawi Proverbs';
  const msg = answered === 0 ? 'Give the riddles another go!'
    : ndagiScore >= answered * 0.8 ? 'Muli ndi nzeru zambiri! ✨'
    : ndagiScore >= answered * 0.5 ? 'Mwachita bwino, pitirizani!'
    : 'Pitirizani kuphunzira miyambi!';
  screen.innerHTML = `
    <h2>${chi ? 'Mwamaliza!' : 'Ndagi Results'}</h2>
    <p class="score">${chi ? 'Your marks' : 'Final Score'}: ${ndagiScore} / ${answered}</p>
    <p class="unlock-note">${answered < planned ? 'You finished early — ' + (planned - answered) + ' question' + (planned - answered === 1 ? '' : 's') + ' left in this round.' : 'Round complete.'}</p>
    ${chi ? `<p class="apa-msg">${msg}</p>` : ''}
    <button id="playAgainNdagiBtn">Play Again</button>
    <button class="backBtn">Back to Home</button>
  `;
  document.getElementById('playAgainNdagiBtn').addEventListener('click', () => startNdagi(currentNdagiCategory));
  screen.querySelector('.backBtn').addEventListener('click', () => {
    screenHistory = ['homeScreen'];
    showScreen('homeScreen', true);
  });
  if (typeof Celebrations !== 'undefined') Celebrations.round(screen, ndagiScore, answered, 'ndagi');
  addReviewPrompt(screen);
}

// --- Easter Egg: tap title 5x for version popup ---
let titleTapCount = 0;
let titleTapTimer = null;

document.getElementById('appTitle').addEventListener('click', () => {
  titleTapCount++;
  clearTimeout(titleTapTimer);
  titleTapTimer = setTimeout(() => { titleTapCount = 0; }, 2000);

  if (titleTapCount === 5) {
    titleTapCount = 0;
    playSuccess();
    vibrateSuccess();
    document.getElementById('versionModal').style.display = 'flex';
  }
});

document.getElementById('closeModalBtn').addEventListener('click', () => {
  document.getElementById('versionModal').style.display = 'none';
});