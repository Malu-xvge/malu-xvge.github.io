// First-run test drive: four one-card demos, no score, skippable.
// Runs after the intro slides on the very first launch, and again whenever
// Settings -> Rewatch intro is used. Content lives in js/tester-content.js.
const Tester = (() => {
  const STEPS = ['trivia', 'ndagi', 'apa', 'charades'];
  let overlay = null;
  let body = null;
  let index = 0;
  let open = false;

  function shouldRun() {
    const replay = typeof introReplayWanted !== 'undefined' && introReplayWanted;
    return getSetting('gn_testerDone', '') !== '1' || replay;
  }

  function build() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'testerOverlay';
    overlay.className = 'tester-overlay';
    overlay.innerHTML = `
      <div class="tester-sheet" role="dialog" aria-modal="true" aria-label="Test drive">
        <div class="tester-top">
          <span class="tester-kicker">Test drive</span>
          <button id="testerSkipBtn" class="tester-skip" type="button">Skip</button>
        </div>
        <div id="testerBody" class="tester-body"></div>
        <div id="testerDots" class="tester-dots"></div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#testerSkipBtn').addEventListener('click', close);
    body = overlay.querySelector('#testerBody');
    return overlay;
  }

  function dots() {
    const el = overlay.querySelector('#testerDots');
    el.innerHTML = STEPS.map((_, i) => `<span class="${i === index ? 'on' : ''}"></span>`).join('');
  }

  function nextButton(label) {
    const b = document.createElement('button');
    b.className = 'howto-next tester-next';
    b.type = 'button';
    b.textContent = label || 'Next';
    b.addEventListener('click', () => {
      index++;
      if (index >= STEPS.length) { close(); return; }
      render();
    });
    return b;
  }

  function feedback(ok, text, extra) {
    const fb = document.getElementById('testerFb');
    if (!fb) return;
    fb.className = 'tester-fb show ' + (ok ? 'good' : 'bad');
    fb.innerHTML = (ok
      ? `<strong>Correct!</strong> That is how a right answer lands.`
      : `<strong>Not quite.</strong> It was <strong>${text}</strong>. No points lost here.`)
      + (extra ? `<span class="tester-meaning">${extra}</span>` : '');
    if (ok) { playSuccess(); vibrateSuccess(); } else { playWrong(); vibrateShort(); }
    body.appendChild(nextButton());
    const nb = body.querySelector('.tester-next');
    if (nb) nb.scrollIntoView({ block: 'nearest' });
  }

  // Options that behave like the real game: one tap, verdict, no second try.
  function wireOptions(answerIndex, answerText, extra) {
    const opts = Array.from(body.querySelectorAll('.tester-opt'));
    opts.forEach((b) => b.addEventListener('click', () => {
      if (opts.some((o) => o.disabled)) return;
      const picked = Number(b.dataset.i);
      opts.forEach((o, j) => {
        o.disabled = true;
        if (j === answerIndex) o.classList.add('right');
        else if (j === picked) o.classList.add('wrong');
      });
      feedback(picked === answerIndex, answerText, extra);
    }));
  }

  function renderQuiz() {
    const c = testerContent[index === 0 ? 'trivia' : 'ndagi'];
    body.innerHTML = `
      <p class="tester-chip">${c.label}</p>
      <p class="tester-q">${c.q}</p>
      <div class="tester-opts">
        ${c.options.map((o, i) => `<button class="tester-opt" data-i="${i}" type="button">${o}</button>`).join('')}
      </div>
      <p class="tester-fb" id="testerFb"></p>`;
    // Ndagi reveals the proverb's meaning after the answer, like the real game.
    wireOptions(Number(c.answer), c.options[c.answer], c.meaning ? '<strong>Meaning:</strong> ' + c.meaning : '');
  }

  function renderApa() {
    const place = apaPlaces.find((p) => p.id === testerContent.apa.id) || apaPlaces[0];
    const choices = apaChoices(place);
    body.innerHTML = `
      <p class="tester-chip">${testerContent.apa.label}</p>
      <img class="tester-photo" src="${place.photo}" alt="">
      <p class="tester-q">Where is this?</p>
      <div class="tester-opts">
        ${choices.map((o, i) => `<button class="tester-opt" data-i="${i}" type="button">${o}</button>`).join('')}
      </div>
      <p class="tester-fb" id="testerFb"></p>`;
    const answer = apaLabel(place);
    const answerIndex = choices.indexOf(answer);
    wireOptions(answerIndex, answer);
  }

  function renderCharades() {
    const c = testerContent.charades;
    body.innerHTML = `
      <p class="tester-chip">Charades &middot; ${c.label}</p>
      <div class="tester-card" id="testerCard">
        <span class="tester-card-word">${c.word}</span>
        <span class="tester-hand" aria-hidden="true">☝</span>
      </div>
      <p class="tester-hint">Swipe up when your team guesses it. Swipe down to skip.</p>
      <div class="tester-gesture-row">
        <button class="tester-opt" type="button" data-act="up">↑ Swipe up = guessed</button>
        <button class="tester-opt" type="button" data-act="down">↓ Swipe down = skip</button>
      </div>`;
    const card = body.querySelector('#testerCard');
    const go = () => renderTilt();
    body.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', go));
    let y0 = null;
    card.addEventListener('touchstart', (e) => { y0 = e.touches[0].clientY; }, { passive: true });
    card.addEventListener('touchend', (e) => {
      if (y0 === null) return;
      const dy = e.changedTouches[0].clientY - y0;
      y0 = null;
      if (Math.abs(dy) > 40) go();
    }, { passive: true });
  }

  function renderTilt() {
    const c = testerContent.charades;
    body.innerHTML = `
      <p class="tester-chip">Charades &middot; hands-free</p>
      <div class="tester-tilt">
        <div class="tester-phone"><span>${c.word}</span></div>
        <p class="tester-hint">No tapping needed: tilt the phone up for a correct guess, down to skip.</p>
      </div>
      <p class="tester-fb show good"><strong>That's it.</strong> Every game works the same way — pick it, play it, see your score.</p>
      <button class="howto-next tester-next" type="button" id="testerDoneBtn">Start playing</button>`;
    body.querySelector('#testerDoneBtn').addEventListener('click', close);
  }

  function render() {
    dots();
    if (index === 0) return renderQuiz();
    if (index === 1) return renderQuiz();
    if (index === 2) return renderApa();
    return renderCharades();
  }

  function start() {
    if (open) return;
    build();
    open = true;
    index = 0;
    setSetting('gn_testerDone', '1');
    if (typeof introReplayWanted !== 'undefined') introReplayWanted = false;
    render();
    overlay.classList.add('show');
    overlay.scrollTop = 0;
  }

  function close() {
    if (!overlay || !open) return;
    open = false;
    overlay.classList.add('closing');
    setTimeout(() => overlay.classList.remove('show', 'closing'), 380);
    if (typeof flushGiftToast === 'function') setTimeout(flushGiftToast, 500);
  }

  return { start, close, shouldRun };
})();
