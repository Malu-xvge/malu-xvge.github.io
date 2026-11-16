// Celebrations: streak milestones and the round party at the end of every game.
// Loaded after app.js. Games call Celebrations.correct() / .wrong() as answers land,
// and Celebrations.round() from their results screen.
//
// The round party is a stage laid over the results screen: lightning strikes, the
// motif dances in with the one line it owns, lightning strikes again, and the whole
// thing clears away so the results are all that is left.

const Celebrations = (() => {
  // The ladder only ever steps down: 5,10,15,20 -> 10,15,20 -> 15,20 -> 20 -> 20 ...
  const LADDERS = [[5, 10, 15, 20], [10, 15, 20], [15, 20], [20]];
  const COLORS = ['#FFD76A', '#E6BC55', '#F6E9C8', '#2E7D32', '#c0392b', '#14999a'];
  const STAGE_HOLD = 3500;   // sparks, dance, sparks, then clear
  let toastTimer = null;
  let stageTimer = null;

  function streak() { return parseInt(getSetting('gn_streak', '0'), 10) || 0; }
  function setStreak(n) { setSetting('gn_streak', String(Math.max(0, n))); }
  function rung() { return Math.min(LADDERS.length - 1, parseInt(getSetting('gn_streakLadder', '0'), 10) || 0); }
  function ladder() { return LADDERS[rung()]; }

  /* ---------------------------------------------------------------- motif art */
  // Five painted motifs, cut to true alpha and gilded to the app palette, plus the
  // gold sparkle which is still vector. Picture and line always travel together.
  const ART = 'assets/img/motifs/';
  const MOTIFS = {
    winnower: 'winnower.png',
    mortar: 'mortar.png',
    net: 'net.png',
    beni: 'beni.png',
    gule: 'gule.png',
    spark: 'spark.svg'
  };

  function art(name) {
    const file = MOTIFS[name] || MOTIFS.spark;
    return `<img class="motif motif-${name}" src="${ART}${file}" alt="" aria-hidden="true" draggable="false" decoding="async">`;
  }

  // Warm the cache so the first party of a session is never a blank frame.
  Object.keys(MOTIFS).forEach((k) => { const i = new Image(); i.src = ART + MOTIFS[k]; });

  // What a finished round gets: which motif turns up, and the one line it says.
  // 80–99% tosses a coin between the fisherman and the beni dancers.
  const TIERS = {
    light: { motif: 'winnower', line: 'Zakupeta, but we go again' },
    medium: { motif: 'mortar', line: 'kusinja kugwetsa' },
    big: [
      { motif: 'net', line: 'Gatherer of Knowledge' },
      { motif: 'beni', line: 'Call the Popo' }
    ],
    perfect: { motif: 'gule', line: 'Superstar' }
  };

  function tierFor(kind) {
    const t = TIERS[kind];
    return Array.isArray(t) ? t[Math.floor(Math.random() * t.length)] : t;
  }

  // The confetti that falls over the whole screen on a perfect round.
  function pieces(n) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const left = Math.round(Math.random() * 96);
      const delay = (Math.random() * 0.8).toFixed(2);
      const dur = (1.7 + Math.random() * 0.9).toFixed(2);
      const col = COLORS[i % COLORS.length];
      const w = 4 + Math.round(Math.random() * 4);
      out += `<i style="left:${left}%;width:${w}px;height:${w + 5}px;background:${col};animation-delay:${delay}s;animation-duration:${dur}s"></i>`;
    }
    return out;
  }

  // Golden lightning the way a brush dabs it: a short strike here, a little star
  // there, crowded round the spot where the motif is about to dance. Two bursts —
  // one to bring the dancer in, one after it has finished — and nothing else.
  const STRIKE = '<svg viewBox="0 0 24 34" aria-hidden="true"><path d="M15.4 1 5.4 17.6h5.3L7.6 33l10.4-18.2h-5.4L15.4 1z"/></svg>';
  const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5 14.7 9.3 23.5 12l-8.8 2.7L12 23.5 9.3 14.7.5 12l8.8-2.7L12 .5z"/></svg>';

  function dabs(at, count) {
    let out = '';
    for (let i = 0; i < count; i++) {
      const star = i % 3 === 0;
      const ang = Math.round(Math.random() * 360);
      const a = (i / count) * Math.PI * 2 + Math.random() * 0.9;
      const r = 24 + Math.random() * 34;            // % from centre: a broad ring round the dancer
      const x = 50 + Math.cos(a) * r;
      const y = 50 + Math.sin(a) * r * 0.94;
      const w = star ? 0.95 + Math.random() * 0.45 : 1.15 + Math.random() * 0.55;
      const h = star ? w : w * 1.35;
      const d = at + Math.round(Math.random() * 240);
      out += `<span class="stage-dab${star ? ' star' : ''}" style="left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${w.toFixed(2)}em;height:${h.toFixed(2)}em;--rot:${ang}deg;animation-delay:${d}ms">${star ? STAR : STRIKE}</span>`;
    }
    return out;
  }

  /* ---------------------------------------------------------- streak milestones */
  function milestone(n) {
    if (!document.getElementById('streakToast')) {
      const t = document.createElement('div');
      t.id = 'streakToast';
      t.setAttribute('role', 'status');
      t.setAttribute('aria-live', 'polite');
      document.body.appendChild(t);
    }
    const t = document.getElementById('streakToast');
    const dancer = n >= 15;
    const line = n >= 20 ? 'Unstoppable.'
      : n >= 15 ? 'You are on fire.'
      : n >= 10 ? 'Double digits — keep it rolling.'
      : 'The rhythm is yours.';
    t.innerHTML = `<span class="streak-art">${art(dancer ? 'beni' : 'mortar')}</span>
      <span class="streak-copy"><strong>${n} in a row!</strong><span>${line}</span></span>`;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
    playSuccess();
    vibrateSuccess();
  }

  function correct() {
    const n = streak() + 1;
    setStreak(n);
    if (ladder().includes(n)) milestone(n);
    return n;
  }

  function wrong() {
    setStreak(0);
    clearTimeout(toastTimer);
    const t = document.getElementById('streakToast');
    if (t) t.classList.remove('show');
  }

  /* ----------------------------------------------------------- round celebration */
  function still() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function clearStage(el) {
    el.classList.add('out');
    stageTimer = setTimeout(() => el.remove(), 640);
  }

  function stage(kind, motif, line) {
    const old = document.querySelector('.round-stage');
    if (old) old.remove();
    clearTimeout(stageTimer);

    const calm = still();
    const el = document.createElement('div');
    el.className = 'round-stage ' + kind + (calm ? ' still' : '');
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = `
      <div class="stage-mid">
        <div class="stage-flash" aria-hidden="true"></div>
        ${calm ? '' : `<div class="stage-fx" aria-hidden="true">${dabs(70, 9)}</div><div class="stage-fx" aria-hidden="true">${dabs(3020, 11)}</div>`}
        <div class="stage-art"><div class="stage-art-in">${art(motif)}</div></div>
      </div>
      <p class="stage-copy">${line}</p>
      ${!calm && kind === 'perfect' ? `<div class="stage-confetti" aria-hidden="true">${pieces(44)}</div>` : ''}`;
    document.body.appendChild(el);

    // Tapping anywhere clears it early; the results screen is underneath.
    el.addEventListener('click', () => { clearTimeout(stageTimer); clearStage(el); }, { once: true });

    if (calm) { stageTimer = setTimeout(() => el.remove(), 2400); return; }
    stageTimer = setTimeout(() => clearStage(el), STAGE_HOLD);
  }

  function round(screen, correctCount, total, mode) {
    if (!screen) return;
    const played = Math.max(0, Number(total) || 0);
    const right = Math.max(0, Number(correctCount) || 0);
    const pct = played ? Math.round((right / played) * 100) : 0;
    const kind = pct >= 100 ? 'perfect' : pct >= 80 ? 'big' : pct >= 50 ? 'medium' : 'light';
    const tier = tierFor(kind);

    // The milestone ladder steps down once a scored round is finished.
    if (played > 0 && mode !== 'charades' && mode !== 'dares') {
      setSetting('gn_streakLadder', String(Math.min(LADDERS.length - 1, rung() + 1)));
    }

    stage(kind, tier.motif, tier.line);
  }

  return { correct, wrong, round, streak, ladder, art, stage };
})();
