import { GameSettings } from '../types/game';
import { DEFAULT_SETTINGS } from '../utils/constants';

/**
 * Procedural Web Audio System
 * Synthesizes retro-fantasy SFX and atmospheric BGM directly via Web Audio API.
 * Never throws 404s, never breaks if assets are missing, and fully supports volume controls.
 */
export class AudioSystem {
  private static instance: AudioSystem;
  private ctx: AudioContext | null = null;
  private settings: GameSettings = { ...DEFAULT_SETTINGS };
  private bgmGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private bgmIntervalId: number | null = null;
  private currentBgmTheme: string | null = null;

  private constructor() {
    // Lazy initialize on first user interaction
    const initAudio = () => {
      this.ensureContext();
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
      window.removeEventListener('touchstart', initAudio);
    };
    window.addEventListener('click', initAudio);
    window.addEventListener('keydown', initAudio);
    window.addEventListener('touchstart', initAudio);
  }

  public static getInstance(): AudioSystem {
    if (!AudioSystem.instance) {
      AudioSystem.instance = new AudioSystem();
    }
    return AudioSystem.instance;
  }

  private ensureContext(): boolean {
    try {
      if (!this.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return false;
        this.ctx = new AudioContextClass();

        this.masterGainNode = this.ctx.createGain();
        this.masterGainNode.gain.value = this.settings.masterVolume;
        this.masterGainNode.connect(this.ctx.destination);

        this.bgmGainNode = this.ctx.createGain();
        this.bgmGainNode.gain.value = this.settings.musicVolume;
        this.bgmGainNode.connect(this.masterGainNode);

        this.sfxGainNode = this.ctx.createGain();
        this.sfxGainNode.gain.value = this.settings.sfxVolume;
        this.sfxGainNode.connect(this.masterGainNode);
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return true;
    } catch {
      return false;
    }
  }

  public updateSettings(settings: GameSettings): void {
    this.settings = { ...settings };
    if (this.masterGainNode) {
      this.masterGainNode.gain.value = this.settings.masterVolume;
    }
    if (this.bgmGainNode) {
      this.bgmGainNode.gain.value = this.settings.musicVolume;
    }
    if (this.sfxGainNode) {
      this.sfxGainNode.gain.value = this.settings.sfxVolume;
    }
  }

  // ==========================================
  // SOUND EFFECTS
  // ==========================================

  public playSlash(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGainNode) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playArcBurst(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGainNode) return;
    const now = this.ctx.currentTime;

    // Magical sweeping chord
    [329.63, 440, 659.25, 880].forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.75, now + i * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.35);

      gain.gain.setValueAtTime(0.18, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(now + i * 0.04);
      osc.stop(now + 0.4);
    });
  }

  public playHit(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGainNode) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playCoin(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGainNode) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  public playLevelUp(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGainNode) return;
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99]; // C, E, G, C, E, G

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.25, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.25);
    });
  }

  public playChestOpen(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGainNode) return;
    const now = this.ctx.currentTime;
    const notes = [349.23, 440, 523.25, 698.46];

    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(0.2, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGainNode!);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.4);
    });
  }

  public playDialogueBlip(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGainNode) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440 + Math.random() * 80, now);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  public playUiClick(): void {
    if (!this.ensureContext() || !this.ctx || !this.sfxGainNode) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGainNode);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // ==========================================
  // AMBIENT BACKGROUND SYNTHESIS
  // ==========================================

  public playBgm(theme: 'meadow' | 'forest' | 'ruins' | 'menu'): void {
    if (this.currentBgmTheme === theme) return;
    this.stopBgm();
    this.currentBgmTheme = theme;

    if (!this.ensureContext()) return;

    let chords: number[][];
    if (theme === 'meadow') {
      // Warm lyrical chords (Cmaj7, Fmaj7, Am, G)
      chords = [
        [261.63, 329.63, 392.0, 493.88],
        [174.61, 261.63, 329.63, 440.0],
        [220.0, 261.63, 329.63, 392.0],
        [196.0, 246.94, 293.66, 392.0],
      ];
    } else if (theme === 'forest') {
      // Mystical, nocturnal chords (Dm, Bbmaj7, Gm9, Asus4)
      chords = [
        [146.83, 220.0, 261.63, 349.23],
        [116.54, 174.61, 220.0, 349.23],
        [98.0, 146.83, 220.0, 293.66],
        [110.0, 164.81, 220.0, 293.66],
      ];
    } else if (theme === 'ruins') {
      // Dramatic ancient titan chords (Em, C, B7, Em)
      chords = [
        [82.41, 164.81, 196.0, 246.94],
        [130.81, 164.81, 196.0, 261.63],
        [123.47, 185.0, 246.94, 311.13],
        [82.41, 123.47, 164.81, 246.94],
      ];
    } else {
      // Title menu dreamlike chord
      chords = [
        [220.0, 277.18, 329.63, 440.0],
        [174.61, 220.0, 261.63, 349.23],
      ];
    }

    let chordIndex = 0;
    const playChordStep = () => {
      if (!this.ctx || !this.bgmGainNode || this.currentBgmTheme !== theme) return;
      const now = this.ctx.currentTime;
      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      currentChord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Slow soothing attack and decay
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 1.2);
        gain.gain.linearRampToValueAtTime(0.001, now + 3.8);

        osc.connect(gain);
        gain.connect(this.bgmGainNode!);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    };

    playChordStep();
    this.bgmIntervalId = window.setInterval(playChordStep, 4000);
  }

  public stopBgm(): void {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.currentBgmTheme = null;
  }
}
