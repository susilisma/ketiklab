// Synthesized typing feedback sounds (WebAudio) — no audio assets needed.
// Four selectable key-sound profiles plus a shared error/success cue.
export type SoundProfile = "soft" | "crisp" | "typewriter" | "off";

let ctx: AudioContext | null = null;
let enabled = true;
let profile: SoundProfile = "soft";

export function setSoundEnabled(v: boolean) {
  enabled = v;
  try { localStorage.setItem("lingotrio-sound", v ? "1" : "0"); } catch { /* ignore */ }
}
export function setSoundProfile(p: SoundProfile) {
  profile = p;
  if (p === "off") enabled = false; else enabled = true;
  try { localStorage.setItem("lingotrio-sound-profile", p); } catch { /* ignore */ }
}
export function initSoundPref(): { enabled: boolean; profile: SoundProfile } {
  try {
    const p = localStorage.getItem("lingotrio-sound-profile") as SoundProfile | null;
    if (p) profile = p;
    const legacy = localStorage.getItem("lingotrio-sound");
    enabled = profile !== "off" && legacy !== "0";
  } catch { /* ignore */ }
  return { enabled, profile };
}
export function getProfile(): SoundProfile { return profile; }

function ac(): AudioContext | null {
  if (!enabled || profile === "off") return null;
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

function noiseBurst(dur: number, gain: number) {
  const c = ac();
  if (!c) return;
  const n = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource();
  const g = c.createGain();
  g.gain.setValueAtTime(gain, c.currentTime);
  src.buffer = buf;
  src.connect(g).connect(c.destination);
  src.start();
}

/** per-correct-keystroke click, styled by the chosen profile */
export function keyClick() {
  if (profile === "crisp") { tone(3200, 0.025, "square", 0.05); tone(1600, 0.02, "sine", 0.04); }
  else if (profile === "typewriter") { noiseBurst(0.03, 0.14); tone(220, 0.025, "square", 0.05); }
  else { tone(2400, 0.03, "triangle", 0.06); tone(180, 0.03, "square", 0.05); } // soft
}
/** low buzz on a wrong keystroke */
export function errorBeep() { tone(140, 0.2, "sawtooth", 0.16); }
/** rising chime when a word is completed */
export function successChime() { tone(880, 0.1, "sine", 0.14); tone(1318.5, 0.16, "sine", 0.14, 0.09); }
