/**
 * Romantic Web Audio API Synthesizer
 * Generates fairytale sparkles, sweet smile chimes, and soft dreamy harp ambient chords.
 * No external audio files needed - runs 100% in pure Web Audio API.
 */

export class RomanticAudio {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.ambientPlaying = false;
    this.ambientTimer = null;
    this.lastChimeTime = 0;
    this.masterGain = null;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.5, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  /**
   * Magical Celestial Chime played when person smiles
   */
  playSmileChime(intensity = 1.0) {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const now = performance.now();
    // Throttle chime so it doesn't spam (minimum 1.2s between chimes)
    if (now - this.lastChimeTime < 1200) return;
    this.lastChimeTime = now;

    // Romantic Pentatonic/Major Arpeggio (E5, G#5, B5, E6, G#6)
    const notes = [659.25, 830.61, 987.77, 1318.51, 1661.22];

    notes.forEach((freq, index) => {
      const delay = index * 0.085;
      const startTime = this.ctx.currentTime + delay;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Sine wave with subtle harmonics for music-box / bell tone
      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      // Gentle pitch glide upwards for magical fairy feel
      osc.frequency.exponentialRampToValueAtTime(freq * 1.02, startTime + 0.6);

      const noteVolume = 0.18 * intensity;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(noteVolume, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.85);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.9);
    });
  }

  /**
   * Dreamy Romantic Ambient Chords (celesta & harp)
   */
  toggleAmbient(enable) {
    this.init();
    this.resume();

    if (enable === undefined) {
      this.ambientPlaying = !this.ambientPlaying;
    } else {
      this.ambientPlaying = enable;
    }

    if (!this.ambientPlaying) {
      if (this.ambientTimer) {
        clearInterval(this.ambientTimer);
        this.ambientTimer = null;
      }
      return false;
    }

    // Progression of Romantic Major 9th & 7th Chords
    // [Cmaj9, Am9, Fmaj7, G9]
    const chordProgressions = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // Cmaj9 (C4, E4, G4, B4, D5)
      [220.00, 261.63, 329.63, 392.00, 493.88], // Am9 (A3, C4, E4, G4, B4)
      [174.61, 261.63, 329.63, 349.23, 440.00], // Fmaj7 (F3, C4, E4, F4, A4)
      [196.00, 246.94, 293.66, 349.23, 440.00]  // G9 (G3, B3, D4, F4, A4)
    ];

    let chordIdx = 0;

    const playChord = () => {
      if (!this.ambientPlaying || this.isMuted || !this.ctx) return;

      const chord = chordProgressions[chordIdx];
      chordIdx = (chordIdx + 1) % chordProgressions.length;

      chord.forEach((freq, noteIdx) => {
        const arpeggioDelay = noteIdx * 0.12;
        const startTime = this.ctx.currentTime + arpeggioDelay;

        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        // Soft low-pass filter for warm, dreamy velvet tone
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, startTime);

        gain.gain.setValueAtTime(0.0001, startTime);
        gain.gain.linearRampToValueAtTime(0.045, startTime + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        osc.start(startTime);
        osc.stop(startTime + 4.0);
      });
    };

    playChord();
    this.ambientTimer = setInterval(playChord, 3800);
    return true;
  }

  /**
   * Cute UI click sound
   */
  playPop() {
    if (this.isMuted) return;
    this.init();
    this.resume();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }
}

