// Audio synthétisé (Web Audio) : des bruitages "8 bits" sans aucun fichier.
// Un bruitage est une suite de notes : { type, notes:[[freq, durée], ...], vol, slide }.
// Plus tard : lecture de fichiers .ogg/.mp3 et musiques en boucle.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sounds = new Map();
    this.volume = 0.35;
    this.muted = false;
  }

  /** Les navigateurs exigent une interaction utilisateur avant de jouer du son. */
  unlock() {
    if (!this.ctx) {
      const AC = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.value = muted ? 0 : this.volume;
  }

  /** Déclare un bruitage réutilisable : audio.define('door', {...}) puis audio.play('door'). */
  define(name, spec) {
    this.sounds.set(name, spec);
  }

  play(nameOrSpec) {
    const spec = typeof nameOrSpec === 'string' ? this.sounds.get(nameOrSpec) : nameOrSpec;
    if (!spec || !this.ctx || this.muted) return;
    const { type = 'square', notes = [[440, 0.1]], vol = 0.3, slide = 0 } = spec;
    let t = this.ctx.currentTime;
    for (const [freq, dur] of notes) {
      if (freq > 0) this._tone(type, freq, dur, vol, slide, t);
      t += dur;
    }
  }

  _tone(type, freq, dur, vol, slide, when) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + dur);
    g.connect(this.master);
    if (type === 'noise') {
      const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(g);
      src.start(when);
      return;
    }
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + slide), when + dur);
    osc.connect(g);
    osc.start(when);
    osc.stop(when + dur + 0.02);
  }
}
