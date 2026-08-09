// Synthesized typing feedback sounds (WebAudio) — no audio assets needed.
let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(v: boolean) {
  enabled = v;
  try { localStorage.setItem("lingotrio-sound", v ? "1" : "0"); } catch { /* ignore */ }
}
export function initSoundPref(): boolean {
  try { enabled = localStorage.getItem("lingotrio-sound") !== "0"; } catch { /* ignore */ }
  return enabled;
}

function ac(): AudioContext | null {
  if (!enabled) return null;
  try {
    ctx ||= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch { return null; }
}

function tone(freq: number, dur: number, type: OscillatorType, gain: number, delay = 0) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.02);
}

/** soft mechanical click for each correct keystroke */
export function keyClick() { tone(2400, 0.03, "triangle", 0.06); tone(180, 0.03, "square", 0.05); }
/** low buzz on a wrong keystroke */
export function errorBeep() { tone(140, 0.2, "sawtooth", 0.16); }
/** rising two-tone chime when a word is completed */
export function successChime() { tone(880, 0.1, "sine", 0.14); tone(1318.5, 0.16, "sine", 0.14, 0.09); }
