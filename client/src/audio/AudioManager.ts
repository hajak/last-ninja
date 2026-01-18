/**
 * Panda & Dog - Audio Manager
 * Handles sound effects and background music
 */

type SoundEffect =
  | 'button_press'
  | 'lever_toggle'
  | 'door_open'
  | 'door_close'
  | 'door_locked'
  | 'crate_push'
  | 'checkpoint_activate'
  | 'hazard_hit'
  | 'respawn'
  | 'puzzle_complete'
  | 'level_complete'
  | 'footstep_stone'
  | 'footstep_grass'
  | 'footstep_water'
  | 'guard_alert'
  | 'guard_suspicious'
  | 'conveyor_running'
  | 'platform_move'
  | 'spike_trap';

type MusicTrack = 'menu' | 'level_1' | 'level_2' | 'level_3' | 'level_4' | 'level_5' | 'victory' | 'game_over';

// Sound configurations with synthesized parameters
interface SoundConfig {
  type: 'oscillator' | 'noise';
  frequency?: number;
  duration: number;
  attack: number;
  decay: number;
  sustain: number;
  release: number;
  waveform?: OscillatorType;
  volume: number;
  pitchEnvelope?: number;
  filterFreq?: number;
}

const SOUND_CONFIGS: Record<SoundEffect, SoundConfig> = {
  button_press: {
    type: 'oscillator',
    frequency: 800,
    duration: 0.1,
    attack: 0.01,
    decay: 0.05,
    sustain: 0.3,
    release: 0.05,
    waveform: 'square',
    volume: 0.3,
    pitchEnvelope: 200,
  },
  lever_toggle: {
    type: 'oscillator',
    frequency: 300,
    duration: 0.15,
    attack: 0.01,
    decay: 0.1,
    sustain: 0.5,
    release: 0.05,
    waveform: 'sawtooth',
    volume: 0.25,
    pitchEnvelope: -100,
  },
  door_open: {
    type: 'noise',
    duration: 0.3,
    attack: 0.05,
    decay: 0.1,
    sustain: 0.4,
    release: 0.15,
    volume: 0.2,
    filterFreq: 800,
  },
  door_close: {
    type: 'noise',
    duration: 0.2,
    attack: 0.01,
    decay: 0.1,
    sustain: 0.3,
    release: 0.1,
    volume: 0.25,
    filterFreq: 400,
  },
  door_locked: {
    type: 'oscillator',
    frequency: 200,
    duration: 0.2,
    attack: 0.01,
    decay: 0.1,
    sustain: 0.3,
    release: 0.1,
    waveform: 'square',
    volume: 0.3,
    pitchEnvelope: -50,
  },
  crate_push: {
    type: 'noise',
    duration: 0.15,
    attack: 0.02,
    decay: 0.08,
    sustain: 0.3,
    release: 0.05,
    volume: 0.2,
    filterFreq: 600,
  },
  checkpoint_activate: {
    type: 'oscillator',
    frequency: 523,
    duration: 0.5,
    attack: 0.05,
    decay: 0.2,
    sustain: 0.5,
    release: 0.25,
    waveform: 'sine',
    volume: 0.3,
    pitchEnvelope: 262,
  },
  hazard_hit: {
    type: 'noise',
    duration: 0.3,
    attack: 0.01,
    decay: 0.15,
    sustain: 0.2,
    release: 0.15,
    volume: 0.4,
    filterFreq: 2000,
  },
  respawn: {
    type: 'oscillator',
    frequency: 440,
    duration: 0.6,
    attack: 0.1,
    decay: 0.2,
    sustain: 0.4,
    release: 0.3,
    waveform: 'sine',
    volume: 0.25,
    pitchEnvelope: 220,
  },
  puzzle_complete: {
    type: 'oscillator',
    frequency: 523,
    duration: 0.8,
    attack: 0.05,
    decay: 0.3,
    sustain: 0.5,
    release: 0.45,
    waveform: 'sine',
    volume: 0.35,
    pitchEnvelope: 262,
  },
  level_complete: {
    type: 'oscillator',
    frequency: 659,
    duration: 1.2,
    attack: 0.1,
    decay: 0.4,
    sustain: 0.5,
    release: 0.7,
    waveform: 'sine',
    volume: 0.4,
    pitchEnvelope: 330,
  },
  footstep_stone: {
    type: 'noise',
    duration: 0.08,
    attack: 0.01,
    decay: 0.04,
    sustain: 0.2,
    release: 0.03,
    volume: 0.1,
    filterFreq: 1500,
  },
  footstep_grass: {
    type: 'noise',
    duration: 0.1,
    attack: 0.02,
    decay: 0.05,
    sustain: 0.2,
    release: 0.03,
    volume: 0.08,
    filterFreq: 3000,
  },
  footstep_water: {
    type: 'noise',
    duration: 0.12,
    attack: 0.02,
    decay: 0.06,
    sustain: 0.3,
    release: 0.04,
    volume: 0.12,
    filterFreq: 2000,
  },
  guard_alert: {
    type: 'oscillator',
    frequency: 880,
    duration: 0.4,
    attack: 0.02,
    decay: 0.2,
    sustain: 0.3,
    release: 0.18,
    waveform: 'square',
    volume: 0.35,
    pitchEnvelope: -440,
  },
  guard_suspicious: {
    type: 'oscillator',
    frequency: 400,
    duration: 0.3,
    attack: 0.05,
    decay: 0.15,
    sustain: 0.4,
    release: 0.1,
    waveform: 'triangle',
    volume: 0.25,
    pitchEnvelope: 100,
  },
  conveyor_running: {
    type: 'noise',
    duration: 0.5,
    attack: 0.1,
    decay: 0.2,
    sustain: 0.6,
    release: 0.2,
    volume: 0.1,
    filterFreq: 500,
  },
  platform_move: {
    type: 'oscillator',
    frequency: 150,
    duration: 0.3,
    attack: 0.05,
    decay: 0.15,
    sustain: 0.5,
    release: 0.1,
    waveform: 'sawtooth',
    volume: 0.15,
    pitchEnvelope: 50,
  },
  spike_trap: {
    type: 'noise',
    duration: 0.15,
    attack: 0.01,
    decay: 0.08,
    sustain: 0.3,
    release: 0.06,
    volume: 0.2,
    filterFreq: 4000,
  },
};

// Simple procedural music patterns
interface MusicPattern {
  tempo: number;
  notes: number[];
  durations: number[];
  loop: boolean;
}

const MUSIC_PATTERNS: Record<MusicTrack, MusicPattern> = {
  menu: {
    tempo: 80,
    notes: [262, 294, 330, 349, 392, 349, 330, 294],
    durations: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    loop: true,
  },
  level_1: {
    tempo: 100,
    notes: [330, 392, 440, 392, 330, 294, 262, 294],
    durations: [0.25, 0.25, 0.5, 0.25, 0.25, 0.25, 0.5, 0.25],
    loop: true,
  },
  level_2: {
    tempo: 110,
    notes: [349, 392, 440, 494, 440, 392, 349, 330],
    durations: [0.25, 0.25, 0.25, 0.5, 0.25, 0.25, 0.25, 0.5],
    loop: true,
  },
  level_3: {
    tempo: 90,
    notes: [262, 330, 392, 523, 392, 330, 262, 196],
    durations: [0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 1],
    loop: true,
  },
  level_4: {
    tempo: 70,
    notes: [196, 220, 247, 262, 247, 220, 196, 175],
    durations: [0.5, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 1],
    loop: true,
  },
  level_5: {
    tempo: 120,
    notes: [440, 494, 523, 587, 659, 587, 523, 494],
    durations: [0.25, 0.25, 0.25, 0.25, 0.5, 0.25, 0.25, 0.5],
    loop: true,
  },
  victory: {
    tempo: 140,
    notes: [523, 587, 659, 698, 784, 880, 988, 1047],
    durations: [0.25, 0.25, 0.25, 0.25, 0.25, 0.25, 0.5, 1],
    loop: false,
  },
  game_over: {
    tempo: 60,
    notes: [330, 294, 262, 220, 196, 175, 165, 147],
    durations: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1],
    loop: false,
  },
};

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private sfxVolume = 0.5;
  private musicVolume = 0.3;
  private muted = false;

  private currentMusic: MusicTrack | null = null;
  private musicNodes: AudioScheduledSourceNode[] = [];
  private musicTimeoutId: number | null = null;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

      // Create gain nodes
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);

      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.connect(this.masterGain);
      this.sfxGain.gain.value = this.sfxVolume;

      this.musicGain = this.audioContext.createGain();
      this.musicGain.connect(this.masterGain);
      this.musicGain.gain.value = this.musicVolume;
    } catch {
      console.warn('Web Audio API not supported');
    }
  }

  private ensureAudioContext(): void {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  playSFX(effect: SoundEffect): void {
    if (this.muted || !this.audioContext || !this.sfxGain) return;

    this.ensureAudioContext();

    const config = SOUND_CONFIGS[effect];
    const now = this.audioContext.currentTime;

    if (config.type === 'oscillator') {
      this.playOscillatorSound(config, now);
    } else {
      this.playNoiseSound(config, now);
    }
  }

  private playOscillatorSound(config: SoundConfig, startTime: number): void {
    if (!this.audioContext || !this.sfxGain) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = config.waveform ?? 'sine';
    oscillator.frequency.setValueAtTime(config.frequency ?? 440, startTime);

    // Apply pitch envelope
    if (config.pitchEnvelope) {
      oscillator.frequency.exponentialRampToValueAtTime(
        (config.frequency ?? 440) + config.pitchEnvelope,
        startTime + config.duration * 0.8
      );
    }

    // ADSR envelope
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(config.volume, startTime + config.attack);
    gainNode.gain.linearRampToValueAtTime(config.volume * config.sustain, startTime + config.attack + config.decay);
    gainNode.gain.linearRampToValueAtTime(0, startTime + config.duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.sfxGain);

    oscillator.start(startTime);
    oscillator.stop(startTime + config.duration);
  }

  private playNoiseSound(config: SoundConfig, startTime: number): void {
    if (!this.audioContext || !this.sfxGain) return;

    // Create noise buffer
    const bufferSize = this.audioContext.sampleRate * config.duration;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    // Filter for noise shaping
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = config.filterFreq ?? 1000;

    // Gain envelope
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(config.volume, startTime + config.attack);
    gainNode.gain.linearRampToValueAtTime(config.volume * config.sustain, startTime + config.attack + config.decay);
    gainNode.gain.linearRampToValueAtTime(0, startTime + config.duration);

    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.sfxGain);

    noiseSource.start(startTime);
    noiseSource.stop(startTime + config.duration);
  }

  playMusic(track: MusicTrack): void {
    if (this.currentMusic === track) return;

    this.stopMusic();
    this.currentMusic = track;

    if (this.muted || !this.audioContext) return;

    this.ensureAudioContext();
    this.scheduleMusicPattern(MUSIC_PATTERNS[track]);
  }

  private scheduleMusicPattern(pattern: MusicPattern): void {
    if (!this.audioContext || !this.musicGain) return;

    const beatDuration = 60 / pattern.tempo;
    let time = this.audioContext.currentTime;

    const playPattern = () => {
      if (!this.audioContext || !this.musicGain || !this.currentMusic) return;

      for (let i = 0; i < pattern.notes.length; i++) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = 'sine';
        oscillator.frequency.value = pattern.notes[i];

        const noteDuration = pattern.durations[i] * beatDuration;
        const noteStart = time;

        gainNode.gain.setValueAtTime(0, noteStart);
        gainNode.gain.linearRampToValueAtTime(0.15, noteStart + 0.02);
        gainNode.gain.linearRampToValueAtTime(0.1, noteStart + noteDuration * 0.5);
        gainNode.gain.linearRampToValueAtTime(0, noteStart + noteDuration);

        oscillator.connect(gainNode);
        gainNode.connect(this.musicGain);

        oscillator.start(noteStart);
        oscillator.stop(noteStart + noteDuration);

        this.musicNodes.push(oscillator);
        time += noteDuration;
      }

      if (pattern.loop && this.currentMusic) {
        const loopDelay = (time - this.audioContext.currentTime) * 1000;
        this.musicTimeoutId = window.setTimeout(playPattern, loopDelay);
      }
    };

    playPattern();
  }

  stopMusic(): void {
    if (this.musicTimeoutId !== null) {
      window.clearTimeout(this.musicTimeoutId);
      this.musicTimeoutId = null;
    }

    for (const node of this.musicNodes) {
      try {
        node.stop();
      } catch {
        // Node may have already stopped
      }
    }
    this.musicNodes = [];
    this.currentMusic = null;
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.sfxVolume;
    }
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.musicGain) {
      this.musicGain.gain.value = this.musicVolume;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 1;
    }
    if (muted) {
      this.stopMusic();
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  getSFXVolume(): number {
    return this.sfxVolume;
  }

  getMusicVolume(): number {
    return this.musicVolume;
  }

  destroy(): void {
    this.stopMusic();
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}

// Singleton instance
let audioManagerInstance: AudioManager | null = null;

export function getAudioManager(): AudioManager {
  if (!audioManagerInstance) {
    audioManagerInstance = new AudioManager();
  }
  return audioManagerInstance;
}
