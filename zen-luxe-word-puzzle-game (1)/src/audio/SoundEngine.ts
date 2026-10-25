type FlipStatus = "correct" | "present" | "absent";

/**
 * SoundEngine — a tiny, dependency-free Web Audio synthesizer.
 * Every sound is generated at runtime: no samples, no network requests.
 *
 * Marimba taps, pentatonic flip chimes, a dull invalid thud, shimmering
 * harp cascades for wins and soft filtered-noise gusts for Gale.
 */
class SoundEngine {
  enabled = true;
  hapticsEnabled = true;

  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private space: AudioNode | null = null;

  /** Must be called from a user gesture at least once on iOS. */
  unlock(): void {
    const ctx = this.init();
    if (ctx && ctx.state === "suspended") void ctx.resume();
  }

  private init(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (this.ctx) return this.ctx;

    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;

    try {
      const ctx = new Ctor();
      const master = ctx.createGain();
      master.gain.value = 0.5;

      const comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -20;
      comp.knee.value = 24;
      comp.ratio.value = 3.5;
      comp.attack.value = 0.004;
      comp.release.value = 0.24;

      master.connect(comp);
      comp.connect(ctx.destination);

      // A tiny feedback line gives chimes an airy, wooden-room tail.
      const delay = ctx.createDelay(0.8);
      delay.delayTime.value = 0.19;
      const feedback = ctx.createGain();
      feedback.gain.value = 0.24;
      const wet = ctx.createGain();
      wet.gain.value = 0.18;
      const damp = ctx.createBiquadFilter();
      damp.type = "lowpass";
      damp.frequency.value = 2600;
      delay.connect(damp);
      damp.connect(feedback);
      feedback.connect(delay);
      damp.connect(wet);
      wet.connect(master);

      this.ctx = ctx;
      this.master = master;
      this.space = delay;
      return ctx;
    } catch {
      return null;
    }
  }

  setEnabled(on: boolean): void {
    this.enabled = on;
    if (on) this.unlock();
  }

  setHaptics(on: boolean): void {
    this.hapticsEnabled = on;
  }

  haptic(pattern: number | number[]): void {
    if (!this.hapticsEnabled) return;
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      /* haptics are a garnish, never a failure */
    }
  }

  private tone(opts: {
    freq: number;
    type?: OscillatorType;
    dur?: number;
    vol?: number;
    attack?: number;
    glide?: number;
    delay?: number;
    send?: number;
    detune?: number;
  }): void {
    if (!this.enabled) return;
    const ctx = this.init();
    if (!ctx || !this.master) return;

    const t = ctx.currentTime + (opts.delay ?? 0);
    const dur = opts.dur ?? 0.24;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? "sine";
    osc.frequency.setValueAtTime(Math.max(30, opts.freq), t);
    if (opts.glide) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(30, opts.glide), t + dur * 0.9);
    }
    if (opts.detune) osc.detune.value = opts.detune;

    const peak = Math.max(0.0002, opts.vol ?? 0.12);
    const attack = Math.min(opts.attack ?? 0.008, dur * 0.6);
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(peak, t + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    osc.connect(gain);
    gain.connect(this.master);
    if (this.space && opts.send) {
      const send = ctx.createGain();
      send.gain.value = opts.send;
      gain.connect(send);
      send.connect(this.space);
    }
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private noise(opts: {
    dur?: number;
    vol?: number;
    freq?: number;
    q?: number;
    sweepTo?: number;
    delay?: number;
  }): void {
    if (!this.enabled) return;
    const ctx = this.init();
    if (!ctx || !this.master) return;

    const dur = opts.dur ?? 0.25;
    const t = ctx.currentTime + (opts.delay ?? 0);
    const frames = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(opts.freq ?? 700, t);
    filter.Q.value = opts.q ?? 1.2;
    if (opts.sweepTo) filter.frequency.exponentialRampToValueAtTime(opts.sweepTo, t + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.vol ?? 0.05), t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(t);
    source.stop(t + dur);
  }

  /** Soft wooden marimba tap as letters land. */
  tap(seed = 0): void {
    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
    const f = scale[Math.abs(seed) % scale.length];
    this.tone({ freq: f, type: "sine", dur: 0.2, vol: 0.1, attack: 0.004, send: 0.14 });
    this.tone({ freq: f * 2, type: "triangle", dur: 0.1, vol: 0.028, attack: 0.002 });
    this.tone({ freq: f * 4.02, type: "sine", dur: 0.05, vol: 0.012, attack: 0.001 });
    this.haptic(6);
  }

  /** Warm pentatonic chime; jade notes rise, honey sits mid, stone is muted. */
  flip(status: FlipStatus, index = 0): void {
    if (status === "correct") {
      const scale = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
      const f = scale[index % scale.length];
      this.tone({ freq: f, type: "sine", dur: 0.55, vol: 0.14, attack: 0.006, send: 0.32 });
      this.tone({ freq: f * 2, type: "sine", dur: 0.34, vol: 0.045, attack: 0.004, send: 0.2 });
      this.tone({ freq: f * 3.01, type: "sine", dur: 0.16, vol: 0.018, attack: 0.002 });
    } else if (status === "present") {
      const scale = [293.66, 329.63, 392.0, 440.0, 523.25];
      const f = scale[index % scale.length];
      this.tone({ freq: f, type: "triangle", dur: 0.4, vol: 0.09, attack: 0.006, send: 0.22 });
      this.tone({ freq: f * 2, type: "sine", dur: 0.2, vol: 0.03, attack: 0.004 });
    } else {
      this.tone({ freq: 146.83, type: "sine", dur: 0.16, vol: 0.055, attack: 0.003, glide: 120 });
      this.noise({ dur: 0.1, vol: 0.02, freq: 420, q: 1.4 });
    }
  }

  /** Low, dull thud for a word that isn't in the lexicon. */
  invalid(): void {
    this.tone({ freq: 110, type: "sine", dur: 0.26, vol: 0.14, attack: 0.004, glide: 62 });
    this.tone({ freq: 82, type: "triangle", dur: 0.2, vol: 0.08, attack: 0.002, glide: 54 });
    this.noise({ dur: 0.15, vol: 0.035, freq: 300, q: 0.9 });
    this.haptic([36, 30, 36]);
  }

  /** Gentle harp cascade for a solved level. */
  win(): void {
    const notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98];
    notes.forEach((f, i) => {
      this.tone({
        freq: f,
        type: "sine",
        dur: 1.15,
        vol: 0.12 - i * 0.006,
        attack: 0.006,
        delay: i * 0.072,
        send: 0.4,
      });
      if (i % 2 === 0) {
        this.tone({
          freq: f * 2,
          type: "sine",
          dur: 0.5,
          vol: 0.026,
          delay: i * 0.072,
          send: 0.3,
        });
      }
    });
    this.tone({ freq: 130.81, type: "sine", dur: 1.6, vol: 0.07, attack: 0.05, send: 0.2 });
    this.haptic([16, 50, 22, 50, 30, 60, 55]);
  }

  lose(): void {
    this.tone({ freq: 196, type: "sine", dur: 0.9, vol: 0.08, send: 0.25 });
    this.tone({ freq: 146.83, type: "sine", dur: 1.2, vol: 0.06, delay: 0.16, send: 0.25 });
    this.tone({ freq: 98, type: "sine", dur: 1.4, vol: 0.05, delay: 0.32 });
    this.haptic([20, 70, 20]);
  }

  /** Dewdrops, purchases, daily gifts. */
  reward(): void {
    [1046.5, 1318.51, 1567.98].forEach((f, i) =>
      this.tone({ freq: f, type: "sine", dur: 0.42, vol: 0.08, delay: i * 0.06, send: 0.3 }),
    );
    this.haptic([10, 30, 14]);
  }

  /** Word Fever solve: bright flourish + low pulse. */
  feverSolve(combo = 1): void {
    const base = [523.25, 659.25, 783.99][Math.min(2, combo % 3)];
    [0, 4, 7, 12].forEach((semi, i) =>
      this.tone({
        freq: base * Math.pow(2, semi / 12),
        type: "triangle",
        dur: 0.5,
        vol: 0.09,
        attack: 0.004,
        delay: i * 0.05,
        send: 0.3,
      }),
    );
    this.tone({ freq: 65.41, type: "sine", dur: 0.4, vol: 0.11, glide: 98 });
    this.haptic([10, 24, 16]);
  }

  tick(urgent = false): void {
    this.tone({
      freq: urgent ? 880 : 659.25,
      type: "sine",
      dur: urgent ? 0.2 : 0.12,
      vol: urgent ? 0.07 : 0.035,
    });
  }

  gale(): void {
    this.noise({ dur: 0.7, vol: 0.09, freq: 320, q: 0.7, sweepTo: 3400 });
    this.noise({ dur: 0.5, vol: 0.04, freq: 2200, q: 0.8, sweepTo: 700 });
    this.haptic([12, 26, 12, 26, 18]);
  }

  sunbeam(): void {
    [659.25, 783.99, 880, 1046.5, 1318.51].forEach((f, i) =>
      this.tone({ freq: f, type: "sine", dur: 0.7, vol: 0.075, delay: i * 0.055, send: 0.35 }),
    );
    this.haptic([8, 20, 8]);
  }

  click(): void {
    this.tone({ freq: 660, type: "sine", dur: 0.07, vol: 0.04 });
    this.haptic(5);
  }

  sheet(open: boolean): void {
    this.noise({ dur: 0.22, vol: 0.02, freq: open ? 500 : 1500, q: 0.8, sweepTo: open ? 1800 : 400 });
  }
}

export const sound = new SoundEngine();
