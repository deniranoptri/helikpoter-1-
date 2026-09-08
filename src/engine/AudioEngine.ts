export class AudioEngine {
  private ctx: AudioContext | null = null;
  
  // Web Audio for Rotor
  private rotorBuffer: AudioBuffer | null = null;
  private activeRotorSource: AudioBufferSourceNode | null = null;
  private rotorGain: GainNode | null = null;
  private isLoadingRotor = false;
  private loadFailed = false;
  private rotorUrl = 'https://raw.githubusercontent.com/deniranoptri/media/refs/heads/sibungas/ElevenLabs_Seamless_looping_propeller-spin-whir_like_a_character_spinning_two_tails_to_fly_like_a_helicopter.mp3';

  private waterNode: AudioNode | null = null;
  private waterGain: GainNode | null = null;
  
  private isRotorPlaying = false;
  private isWaterPlaying = false;
  private isMuted = false;

  constructor() {
    // Initial fetch trigger will happen in unlock
  }

  private async loadRotorBuffer() {
    if (this.rotorBuffer || this.isLoadingRotor || this.loadFailed) return;
    if (!this.ctx) return;
    
    this.isLoadingRotor = true;
    try {
      const response = await fetch(this.rotorUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      this.rotorBuffer = await this.ctx.decodeAudioData(arrayBuffer);
      
      // If startRotor was called while loading, play it now
      if (this.isRotorPlaying && !this.activeRotorSource) {
        this.playRotorBuffer();
      }
    } catch (e) {
      console.error('Failed to load rotor audio:', e);
      this.loadFailed = true;
    } finally {
      this.isLoadingRotor = false;
    }
  }

  public unlock() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    if (!this.rotorBuffer && !this.isLoadingRotor) {
      this.loadRotorBuffer();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    
    if (this.rotorGain) {
      this.rotorGain.gain.value = muted ? 0 : 0.15;
    }
    
    if (muted) {
      this.stopAll();
    } else {
        if (this.isRotorPlaying && !this.activeRotorSource) {
            this.playRotorBuffer();
        }
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  private playRotorBuffer() {
    if (this.isMuted || !this.ctx || !this.rotorBuffer || this.activeRotorSource) return;
    
    try {
      this.activeRotorSource = this.ctx.createBufferSource();
      this.activeRotorSource.buffer = this.rotorBuffer;
      this.activeRotorSource.loop = true;
      
      this.rotorGain = this.ctx.createGain();
      this.rotorGain.gain.value = this.isMuted ? 0 : 0.15;
      
      this.activeRotorSource.connect(this.rotorGain);
      this.rotorGain.connect(this.ctx.destination);
      
      this.activeRotorSource.start();
    } catch (e) {
      console.error('Failed to play rotor buffer:', e);
      this.activeRotorSource = null;
    }
  }

  public startRotor() {
    if (this.isMuted) {
        this.isRotorPlaying = true;
        return;
    }
    if (this.isRotorPlaying) return;
    
    this.isRotorPlaying = true;
    
    if (this.rotorBuffer) {
        this.playRotorBuffer();
    } else if (!this.isLoadingRotor && this.ctx) {
        this.loadRotorBuffer();
    }
  }

  public stopRotor() {
    if (!this.isRotorPlaying) return;
    
    if (this.activeRotorSource) {
        try {
            this.activeRotorSource.stop();
            this.activeRotorSource.disconnect();
        } catch (e) {}
        this.activeRotorSource = null;
    }
    
    this.isRotorPlaying = false;
  }

  public startWater() {
    if (this.isMuted || !this.ctx) return;
    if (this.isWaterPlaying) return;

    const bufferSize = this.ctx.sampleRate * 2; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    filter.Q.value = 0.5;

    const gain = this.ctx.createGain();
    gain.gain.value = 0.15; 

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();

    this.waterNode = noise;
    this.waterGain = gain;
    this.isWaterPlaying = true;
  }

  public stopWater() {
    if (!this.isWaterPlaying || !this.waterNode || !this.waterGain) return;
    
    const node = this.waterNode as AudioBufferSourceNode;
    
    try {
      this.waterGain.gain.setTargetAtTime(0, this.ctx!.currentTime, 0.05);
      setTimeout(() => {
        try {
          node.stop();
          node.disconnect();
        } catch (e) {}
      }, 100);
    } catch (e) {}
    
    this.isWaterPlaying = false;
    this.waterNode = null;
    this.waterGain = null;
  }

  public playExtinguish() {
    if (this.isMuted || !this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc1.frequency.exponentialRampToValueAtTime(1046.50, this.ctx.currentTime + 0.1); // C6
    
    osc2.frequency.setValueAtTime(659.25, this.ctx.currentTime); // E5
    osc2.frequency.exponentialRampToValueAtTime(1318.51, this.ctx.currentTime + 0.1); // E6

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.5);
    osc2.stop(this.ctx.currentTime + 0.5);
  }

  public stopAll() {
    this.stopRotor();
    this.stopWater();
  }
}

export const sharedAudioEngine = new AudioEngine();
