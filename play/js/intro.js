// GameNight launch intro (splash circle -> info slides), cartoon characters and background music.
// Loaded after app.js. The drawing helpers at the top are pure functions that return SVG markup.

/* ---------------------------------------------------------------- cartoon people */
let __avId = 0;
const SKIN = {
  deep:  { skin: '#5b3826', dark: '#46291b' },
  brown: { skin: '#7c4b31', dark: '#613a26' },
  warm:  { skin: '#9b6542', dark: '#7d5034' },
  light: { skin: '#c48a5c', dark: '#a56f47' },
  asian: { skin: '#dfb185', dark: '#c4966b' }   // a Malawian of Asian origin
};

// o: skin, hair ('short'|'afro'|'braids'|'wrap'|'bun'|'straight'), hairColor, cloth, pattern, arms ('down'|'up'|'wave'|'phone'), glasses, x, y, s
function person(o) {
  const id = 'pv' + (++__avId);
  const sk = SKIN[o.skin || 'brown'];
  const hairC = o.hairColor || '#2a1c14';
  const cloth = o.cloth || '#14999a';
  const fill = o.pattern ? `url(#${id})` : cloth;
  const wrapC = o.wrapColor || '#c0392b';
  let s = `<g transform="translate(${o.x || 0},${o.y || 0}) scale(${o.s || 1})">`;
  if (o.pattern) {
    s += `<defs><pattern id="${id}" width="12" height="12" patternUnits="userSpaceOnUse">
      <rect width="12" height="12" fill="${cloth}"/><path d="M6 1 L11 6 L6 11 L1 6 Z" fill="${o.pattern}" opacity="0.9"/></pattern></defs>`;
  }
  // hair behind the head
  if (o.hair === 'afro') s += `<circle cx="50" cy="40" r="32" fill="${hairC}" stroke="#5a4333" stroke-width="2.5"/>`;
  if (o.hair === 'braids') s += `<path d="M26 44 C24 70 24 84 28 92 L36 92 L34 52 Z M74 44 C76 70 76 84 72 92 L64 92 L66 52 Z" fill="${hairC}"/>`;
  if (o.hair === 'straight') s += `<path d="M24 46 C22 74 24 88 30 94 L40 94 L34 54 Z M76 46 C78 74 76 88 70 94 L60 94 L66 54 Z" fill="${hairC}"/>`;
  // arms that go behind the body
  const armW = 13;
  const arm = (x1, y1, x2, y2, hx, hy) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${fill}" stroke-width="${armW}" stroke-linecap="round"/>
      <circle cx="${hx}" cy="${hy}" r="7.5" fill="${sk.skin}"/>`;
  const a = o.arms || 'down';
  let armsFront = '';
  if (a === 'down') s += arm(20, 100, 14, 124, 13, 128) + arm(80, 100, 86, 124, 87, 128);
  if (a === 'wave') { s += arm(20, 100, 14, 124, 13, 128); armsFront = arm(80, 98, 94, 62, 95, 56); }
  if (a === 'up') armsFront = arm(20, 98, 8, 58, 7, 52) + arm(80, 98, 92, 58, 93, 52);
  if (a === 'phone') armsFront = arm(22, 100, 28, 54, 30, 46) + arm(78, 100, 72, 54, 70, 46);
  // body, neck, ears, head
  s += `<path d="M10 200 L10 132 C10 100 28 88 50 88 C72 88 90 100 90 132 L90 200 Z" fill="${fill}"/>`;
  s += `<rect x="43" y="72" width="14" height="20" rx="6" fill="${sk.dark}"/>`;
  s += `<ellipse cx="26" cy="54" rx="4.5" ry="6.5" fill="${sk.skin}"/><ellipse cx="74" cy="54" rx="4.5" ry="6.5" fill="${sk.skin}"/>`;
  s += `<ellipse cx="50" cy="52" rx="24" ry="27" fill="${sk.skin}"/>`;
  // front hair
  if (o.hair === 'short' || o.hair === 'bun') s += `<path d="M26 48 C24 22 40 17 50 17 C60 17 76 22 74 48 C70 38 62 33 50 33 C38 33 30 38 26 48 Z" fill="${hairC}"/>`;
  if (o.hair === 'bun') s += `<circle cx="50" cy="12" r="9" fill="${hairC}"/>`;
  if (o.hair === 'afro') s += `<path d="M27 46 C28 30 38 25 50 25 C62 25 72 30 73 46 C67 38 60 34 50 34 C40 34 33 38 27 46 Z" fill="${hairC}"/>`;
  if (o.hair === 'braids') s += `<path d="M26 48 C24 22 40 17 50 17 C60 17 76 22 74 48 C70 38 62 33 50 33 C38 33 30 38 26 48 Z" fill="${hairC}"/>`;
  if (o.hair === 'straight') s += `<path d="M25 50 C22 20 78 20 75 50 C72 38 62 32 50 32 C38 32 28 38 25 50 Z" fill="${hairC}"/>`;
  if (o.hair === 'wrap') {
    s += `<path d="M25 46 C22 18 78 18 75 46 C70 34 60 30 50 30 C40 30 30 34 25 46 Z" fill="${wrapC}"/>
      <path d="M30 36 L40 28 M42 32 L54 24 M56 30 L68 26" stroke="#FFD76A" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="62" cy="14" rx="14" ry="9" fill="${wrapC}" transform="rotate(-20 62 14)"/>
      <path d="M54 14 L70 10" stroke="#FFD76A" stroke-width="3" stroke-linecap="round"/>`;
  }
  // face
  s += `<circle cx="41" cy="53" r="2.8" fill="#24150e"/><circle cx="59" cy="53" r="2.8" fill="#24150e"/>`;
  s += `<path d="M36 46 Q41 43 46 46 M54 46 Q59 43 64 46" stroke="#24150e" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M39 63 Q50 77 61 63 Z" fill="#fff" stroke="#24150e" stroke-width="2" stroke-linejoin="round"/>`;
  s += `<circle cx="34" cy="62" r="4.2" fill="#e0645a" opacity="0.28"/><circle cx="66" cy="62" r="4.2" fill="#e0645a" opacity="0.28"/>`;
  if (o.glasses) s += `<circle cx="41" cy="53" r="7.5" fill="none" stroke="#24150e" stroke-width="2"/><circle cx="59" cy="53" r="7.5" fill="none" stroke="#24150e" stroke-width="2"/><path d="M48.5 53 H51.5" stroke="#24150e" stroke-width="2"/>`;
  s += armsFront;
  if (a === 'phone') {
    s += `<g transform="rotate(5 50 30)"><rect x="38" y="6" width="24" height="40" rx="5" fill="#14999a" stroke="#FFF1C1" stroke-width="2.5"/>
      <rect x="42" y="12" width="16" height="22" rx="2" fill="#0d6e70"/><text x="50" y="27" text-anchor="middle" font-family="Poppins,Arial" font-weight="800" font-size="7" fill="#FFF1C1">?</text></g>`;
    s += `<circle cx="30" cy="46" r="7.5" fill="${sk.skin}"/><circle cx="70" cy="46" r="7.5" fill="${sk.skin}"/>`;
  }
  return s + '</g>';
}

const CONFETTI = ['#FFD76A', '#c0392b', '#2E7D32', '#14999a', '#a82bb4'];
function confetti(w, h, n) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = (i * 53 + 17) % w, y = (i * 37 + 9) % (h * 0.7), r = (i * 47) % 90;
    s += `<rect x="${x}" y="${y}" width="6" height="10" rx="1.5" fill="${CONFETTI[i % 5]}" transform="rotate(${r} ${x} ${y})"/>`;
  }
  return s;
}

const FRIENDS = {
  a: { skin: 'deep',  hair: 'afro',     cloth: '#2E7D32', pattern: '#FFD76A' },
  b: { skin: 'warm',  hair: 'wrap',     cloth: '#8a1c1c', pattern: '#FFD76A', wrapColor: '#e29a14' },
  c: { skin: 'asian', hair: 'straight', cloth: '#14999a', glasses: true },
  d: { skin: 'brown', hair: 'short',    cloth: '#7a30b8' },
  e: { skin: 'light', hair: 'braids',   cloth: '#e29a14', pattern: '#7a1d10' }
};

// Flat scene: warm rounded backdrop, with the people clipped inside it
function sceneWrap(inner) {
  return `<svg viewBox="0 0 330 150" width="100%" height="100%" aria-hidden="true">
    <defs><linearGradient id="sceneBg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b3a14"/><stop offset="1" stop-color="#241208"/></linearGradient>
      <clipPath id="sceneClip"><rect x="0" y="0" width="330" height="150" rx="18"/></clipPath></defs>
    <rect x="0" y="0" width="330" height="150" rx="18" fill="url(#sceneBg)"/>
    <g clip-path="url(#sceneClip)">${inner}</g></svg>`;
}

function sceneFriends() {
  return sceneWrap(`
    ${person({ ...FRIENDS.a, arms: 'wave', x: 6, s: 1 })}
    ${person({ ...FRIENDS.c, arms: 'up', x: 113, y: -6, s: 1.08 })}
    ${person({ ...FRIENDS.b, arms: 'wave', x: 224, s: 1 })}`);
}
function sceneForehead() {
  return sceneWrap(`
    ${person({ ...FRIENDS.d, arms: 'up', x: 4 })}
    ${person({ ...FRIENDS.e, arms: 'phone', x: 113, y: -4, s: 1.1 })}
    ${person({ ...FRIENDS.a, arms: 'wave', x: 226 })}`);
}
function sceneCelebrate() {
  return sceneWrap(`${confetti(330, 150, 26)}
    ${person({ ...FRIENDS.b, arms: 'up', x: -6, s: 0.92, y: 6 })}
    ${person({ ...FRIENDS.a, arms: 'up', x: 78, s: 0.98 })}
    ${person({ ...FRIENDS.c, arms: 'up', x: 160, s: 0.98 })}
    ${person({ ...FRIENDS.d, arms: 'up', x: 240, s: 0.92, y: 6 })}`);
}
function splashCircle() {
  return `<svg viewBox="0 0 300 300" width="100%" height="100%" aria-hidden="true">
    <defs><clipPath id="spClip"><circle cx="150" cy="150" r="138"/></clipPath>
      <radialGradient id="spBg" cx="50%" cy="38%" r="75%"><stop offset="0" stop-color="#7a3d10"/><stop offset="0.55" stop-color="#2a1608"/><stop offset="1" stop-color="#0c0805"/></radialGradient></defs>
    <circle cx="150" cy="150" r="146" fill="#FFD76A"/><circle cx="150" cy="150" r="141" fill="#1b1208"/>
    <g clip-path="url(#spClip)"><rect width="300" height="300" fill="url(#spBg)"/>
      <g transform="translate(150 118)" fill="#FFD76A" opacity="0.5">${Array.from({ length: 14 }, (_, i) => `<path d="M-6 0 L0 -150 L6 0 Z" transform="rotate(${i * 360 / 14})"/>`).join('')}</g>
      <circle cx="150" cy="118" r="34" fill="#FFD76A" opacity="0.85"/>
      ${confetti(300, 300, 18)}
      ${person({ ...FRIENDS.d, arms: 'up', x: 56, y: 100, s: 0.62 })}
      ${person({ ...FRIENDS.b, arms: 'wave', x: 172, y: 100, s: 0.62 })}
      ${person({ ...FRIENDS.a, arms: 'up', x: 14, y: 140, s: 0.84 })}
      ${person({ ...FRIENDS.c, arms: 'wave', x: 194, y: 140, s: 0.84 })}
      ${person({ ...FRIENDS.e, arms: 'phone', x: 102, y: 112, s: 0.96 })}
    </g></svg>`;
}


/* ---------------------------------------------------------------- music (original drum loop) */
const Music = (() => {
  const el = new Audio('assets/audio/drum-loop.mp3');
  el.loop = true;
  el.preload = 'auto';
  el.volume = 0;
  const TARGET = 0.35;
  let want = false;
  let fade = null;

  function enabled() { return getSetting('gn_music', 'on') === 'on'; }

  function fadeTo(v, ms, done) {
    clearInterval(fade);
    const from = el.volume, steps = 12, dt = ms / steps;
    let i = 0;
    fade = setInterval(() => {
      i++;
      el.volume = Math.max(0, Math.min(1, from + (v - from) * (i / steps)));
      if (i >= steps) { clearInterval(fade); if (done) done(); }
    }, dt);
  }

  function start() {
    if (!want || !enabled() || document.hidden) return;
    const p = el.play();
    if (p && p.catch) p.catch(() => {});      // blocked until the first tap: the listener below retries
    fadeTo(TARGET, 900);
  }

  function stop() {
    fadeTo(0, 500, () => { if (!want) el.pause(); });
  }

  // the first tap anywhere unlocks audio on devices that block autoplay
  document.addEventListener('pointerdown', () => { if (want && el.paused) start(); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) el.pause(); else start();
  });

  return {
    el,
    enabled,
    setWanted(flag) {
      want = flag;
      if (flag && enabled()) start();
      else if (!flag) stop();
      else el.pause();
    },
    refresh() {
      if (enabled()) { if (want) start(); } else { el.pause(); el.volume = 0; }
    }
  };
})();

// Music plays in the intro and on the menus, and stops while a game is being played
const MUSIC_SCREENS = ['homeScreen', 'categoryScreen', 'settingsScreen', 'gameplayScreen', 'unlockScreen'];
function updateMusic(screenId) {
  Music.setWanted(introOpen || MUSIC_SCREENS.includes(screenId));
}

function renderMusicToggle() {
  const b = document.getElementById('musicToggleBtn');
  if (b) b.textContent = Music.enabled() ? 'ON' : 'OFF';
}
document.getElementById('musicToggleBtn').addEventListener('click', () => {
  setSetting('gn_music', Music.enabled() ? 'off' : 'on');
  renderMusicToggle();
  Music.refresh();
});

/* ---------------------------------------------------------------- launch intro */
const INTRO_IMAGES = {
  splash: 'assets/img/intro/intro-splash.jpg',
  welcome: 'assets/img/intro/intro-welcome.jpg',
  modes: 'assets/img/intro/intro-modes.jpg',
  points: 'assets/img/intro/intro-points.jpg',
  help: 'assets/img/intro/intro-help.jpg',
  play: 'assets/img/intro/intro-play.jpg'
};

const INTRO_SLIDES = [
  { t: 'Welcome to GameNight', d: 'Party games rooted in Malawian culture. Gather your friends and let the fun begin.', img: INTRO_IMAGES.welcome, art: sceneFriends },
  { t: 'Six Ways to Play', d: 'Quiz each other, act it out, take a dare, solve riddles or guess places across Malawi.', img: INTRO_IMAGES.modes, art: sceneForehead },
  { t: 'Earn and Unlock', d: 'Every right answer earns 1 point. Open Settings and tap Unlock to spend points on a category for good, or get a pass that opens everything for a day, a month or longer.', img: INTRO_IMAGES.points, art: () => HOWTO_ART.star },
  { t: 'How to Play', d: 'Tap the i button when you pick a category in any game — it shows a step-by-step guide to that game.', img: INTRO_IMAGES.help, art: () => HOWTO_ART.grid6 },
  { t: "Let's Play!", d: 'Pick a game master for Trivia and pass the phone around for Charades. Have fun! You can replay this intro any time in Settings.', img: INTRO_IMAGES.play, art: sceneCelebrate }
];
let introOpen = false;
let introStep = 0;
let introTimer = null;

function renderIntroArt(sl) {
  const box = document.getElementById('introArt');
  if (!sl.img) { box.innerHTML = sl.art(); return; }
  box.innerHTML = `<img class="intro-photo" src="${sl.img}" alt="">`;
  const img = box.querySelector('img');
  if (img) img.addEventListener('error', () => { box.innerHTML = sl.art(); });
}

function renderIntroSlide() {
  const sl = INTRO_SLIDES[introStep];
  renderIntroArt(sl);
  document.getElementById('introTitle').textContent = sl.t;
  document.getElementById('introText').textContent = sl.d;
  document.getElementById('introDots').innerHTML = INTRO_SLIDES.map((_, i) => `<span class="${i === introStep ? 'on' : ''}"></span>`).join('');
  document.getElementById('introNextBtn').textContent = introStep === INTRO_SLIDES.length - 1 ? "Let's go" : 'Next';
}

function renderSplashArt() {
  const box = document.getElementById('introCircle');
  box.innerHTML = `<img class="intro-splash-photo" src="${INTRO_IMAGES.splash}" alt="">`;
  const img = box.querySelector('img');
  if (img) img.addEventListener('error', () => { box.innerHTML = splashCircle(); });
}

function startIntro(skipSplash) {
  const ov = document.getElementById('introOverlay');
  introOpen = true;
  updateMusic('homeScreen');
  if (skipSplash) {
    ov.classList.add('show', 'phase-slides');
    ov.classList.remove('phase-splash');
    introStep = 0;
    renderIntroSlide();
    return;
  }
  renderSplashArt();
  ov.classList.add('show', 'phase-splash');
  ov.classList.remove('phase-slides');
  introTimer = setTimeout(() => {
    ov.classList.remove('phase-splash');
    ov.classList.add('phase-slides');
    introStep = 0;
    renderIntroSlide();
  }, 2800);
}

function finishIntro() {
  if (!introOpen) return;
  clearTimeout(introTimer);
  setSetting('gn_intro', '1');
  const ov = document.getElementById('introOverlay');
  ov.classList.add('closing');
  setTimeout(() => {
    ov.classList.remove('show', 'phase-splash', 'phase-slides', 'closing');
    document.documentElement.classList.remove('intro-pending');
  }, 600);
  introOpen = false;
  const current = (typeof screenHistory !== 'undefined' && screenHistory[screenHistory.length - 1]) || 'homeScreen';
  updateMusic(current);
  if (typeof flushGiftToast === 'function') setTimeout(flushGiftToast, 700);
}

document.getElementById('introNextBtn').addEventListener('click', () => {
  if (introStep >= INTRO_SLIDES.length - 1) { finishIntro(); return; }
  introStep++;
  renderIntroSlide();
});
document.getElementById('introSkipBtn').addEventListener('click', finishIntro);

// Settings -> "Watch the intro again": straight to the slides, no splash.
const replayIntroBtn = document.getElementById('replayIntroBtn');
if (replayIntroBtn) replayIntroBtn.addEventListener('click', () => {
  if (!introOpen) startIntro(true);
});

if (getSetting('gn_intro', '') !== '1') {
  startIntro();
} else {
  updateMusic('homeScreen');
}
renderMusicToggle();
