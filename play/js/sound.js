// Simple sound effects using Web Audio API — no audio files needed
const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
const audioCtx = AudioCtxClass ? new AudioCtxClass() : null;

// Browsers keep a new audio context suspended until the first user gesture,
// so resume it on the first tap/key press. Without this, the first sounds are silent.
function unlockAudio() {
  if (audioCtx && audioCtx.state === 'suspended') {
    const p = audioCtx.resume();
    if (p && p.catch) p.catch(() => {});
  }
}
document.addEventListener('pointerdown', unlockAudio, { passive: true });
document.addEventListener('touchstart', unlockAudio, { passive: true });
document.addEventListener('keydown', unlockAudio);

function playTone(freq, duration, type = 'sine', vol = 0.15) {
  if (!audioCtx || localStorage.getItem('gn_soundEnabled') === 'false') return;
  unlockAudio();
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) { /* ignore audio errors silently */ }
}

function playClick() { playTone(440, 0.08, 'square', 0.08); }
function playCorrect() {
  playTone(523.25, 0.12);
  setTimeout(() => playTone(659.25, 0.15), 100);
}
function playWrong() { playTone(160, 0.25, 'sawtooth', 0.12); }
function playTick() { playTone(880, 0.05, 'square', 0.05); }
function playSuccess() {
  playTone(523.25, 0.1);
  setTimeout(() => playTone(659.25, 0.1), 100);
  setTimeout(() => playTone(783.99, 0.2), 200);
}

// Haptic feedback (uses browser Vibration API, works in Capacitor's WebView)
function vibrateShort() { if (navigator.vibrate) navigator.vibrate(20); }
function vibrateMedium() { if (navigator.vibrate) navigator.vibrate(40); }
function vibrateSuccess() { if (navigator.vibrate) navigator.vibrate([30, 50, 30]); }