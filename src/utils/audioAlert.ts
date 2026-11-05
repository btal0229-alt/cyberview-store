/**
 * Web Audio API synthesizer for kitchen order alerts.
 * Uses native oscillators to create a realistic, crisp 3-tone kitchen chime (Ding-Dong-Ding)
 * without requiring external MP3 assets or network requests.
 */

class KitchenSoundAlert {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedMute = localStorage.getItem('kitchen_audio_muted');
      if (savedMute !== null) {
        this.isMuted = savedMute === 'true';
      }
    }
  }

  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioContextClass = 
        window.AudioContext || 
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  /**
   * Plays a crisp, melodic 3-tone kitchen bell notification
   */
  playOrderAlert(): void {
    if (this.isMuted) return;

    try {
      const ctx = this.initContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Tone 1: Warm E5 (659.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.45);

      // Tone 2: Bright G#5 (830.61 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(830.61, now + 0.14);
      gain2.gain.setValueAtTime(0.4, now + 0.14);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.14);
      osc2.stop(now + 0.7);

      // Tone 3: Resonant Bell B5 (987.77 Hz)
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(987.77, now + 0.28);
      gain3.gain.setValueAtTime(0.45, now + 0.28);
      gain3.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.28);
      osc3.stop(now + 1.2);
    } catch (err) {
      console.warn('Audio alert playback error:', err);
    }
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kitchen_audio_muted', String(this.isMuted));
    }
    return this.isMuted;
  }

  isSoundMuted(): boolean {
    return this.isMuted;
  }
}

export const kitchenSound = new KitchenSoundAlert();
