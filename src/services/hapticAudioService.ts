/**
 * Haptic & Audio Feedback Service for Accessibility Support.
 * Tailored for visually impaired users to assist with waypoint navigation
 * and route alignment.
 */

export interface NavigationVoiceInstruction {
  currentNodeName: string;
  nextNodeName: string | null;
  distanceMeters: number;
  nodeType?: string;
  isDestination: boolean;
}

class HapticAudioService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled = true;
  private voiceEnabled = true;
  private hapticsEnabled = true;
  private onLogCallback: ((message: string) => void) | null = null;

  constructor() {
    // Lazy initialize to avoid blocking user interaction or early-play policy blocks
  }

  public registerLogCallback(callback: (message: string) => void) {
    this.onLogCallback = callback;
  }

  private log(message: string) {
    console.log(`[HapticAudioService] ${message}`);
    if (this.onLogCallback) {
      this.onLogCallback(message);
    }
  }

  private initAudio() {
    if (!this.audioCtx) {
      try {
        const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      } catch (e) {
        console.warn('Could not initialize AudioContext', e);
      }
    }
    // Resume if suspended by browser auto-play policy
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Toggles
  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    this.log(`Audio tone cues ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  public setVoiceEnabled(enabled: boolean) {
    this.voiceEnabled = enabled;
    this.log(`Spoken voice guidance ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  public setHapticsEnabled(enabled: boolean) {
    this.hapticsEnabled = enabled;
    this.log(`Tactile haptic vibration ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  public getSettings() {
    return {
      soundEnabled: this.soundEnabled,
      voiceEnabled: this.voiceEnabled,
      hapticsEnabled: this.hapticsEnabled,
    };
  }

  /**
   * Triggers a browser haptic vibration pattern.
   * Includes safety guards for iframes, permissions, and browser compatibility.
   */
  public triggerVibration(pattern: number | number[], description: string) {
    if (!this.hapticsEnabled) return;

    this.log(`📳 [Haptic Triggered] ${description} (Pattern: ${JSON.stringify(pattern)}ms)`);

    if ('vibrate' in navigator) {
      try {
        const success = navigator.vibrate(pattern);
        if (!success) {
          this.log(`⚠️ Haptic vibration request ignored by OS/Browser (likely missing user gesture or device doesn't support vibration).`);
        }
      } catch (e) {
        this.log(`⚠️ Native vibration blocked or unsupported (likely running inside an iframe).`);
      }
    } else {
      this.log(`ℹ️ Vibration API not supported on this platform/device.`);
    }
  }

  /**
   * Synthesizes an elegant, directionally-panned acoustic tone.
   * @param frequency The pitch frequency in Hertz.
   * @param pan Panning direction: -1 (full left) to 1 (full right).
   * @param duration Tone length in seconds.
   * @param waveType Synth wave profile shape.
   */
  public playTone(frequency: number, pan: number = 0, duration: number = 0.3, waveType: OscillatorType = 'sine') {
    if (!this.soundEnabled) return;

    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      // Simple click-prevention ramp
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.05);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime + duration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0.001, ctx.currentTime + duration);

      // Stereo Panning (Directional Audio)
      let destinationNode: AudioNode = gainNode;
      let panLabel = 'Center';

      if ('createStereoPanner' in ctx) {
        const panner = ctx.createStereoPanner();
        // Constrain between -1 and 1
        const clampedPan = Math.max(-1, Math.min(1, pan));
        panner.pan.setValueAtTime(clampedPan, ctx.currentTime);
        gainNode.connect(panner);
        destinationNode = panner;

        if (clampedPan < -0.2) panLabel = `Left (${Math.round(Math.abs(clampedPan) * 100)}%)`;
        else if (clampedPan > 0.2) panLabel = `Right (${Math.round(clampedPan * 100)}%)`;
      }

      destinationNode.connect(ctx.destination);
      osc.connect(gainNode);

      osc.start();
      osc.stop(ctx.currentTime + duration);

      this.log(`🔊 [Audio Cue] ${frequency}Hz Tone • Stereo Pan: ${panLabel}`);
    } catch (e) {
      console.warn('Failed to play directional audio tone cue:', e);
    }
  }

  /**
   * Speaks out directional instructions using Text-To-Speech (SpeechSynthesis).
   */
  public speak(text: string) {
    if (!this.voiceEnabled) return;

    try {
      if ('speechSynthesis' in window) {
        // Cancel ongoing speech to respond instantly to current action
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.05;
        utterance.volume = 0.95;
        
        // Attempt to find a natural voice, default fallback if unavailable
        window.speechSynthesis.speak(utterance);
        this.log(`💬 [Voice Spoken] "${text}"`);
      } else {
        this.log(`ℹ️ Speech synthesis not supported in this browser.`);
      }
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
    }
  }

  // Preset Navigation Events for easy trigger

  /**
   * Triggered when a new route path is constructed/compiled.
   */
  public playRouteInitiated(startName: string, endName: string) {
    // 1. Triple ascending chime
    setTimeout(() => this.playTone(392, -0.2, 0.15, 'triangle'), 0); // G4
    setTimeout(() => this.playTone(523.25, 0, 0.15, 'triangle'), 150); // C5
    setTimeout(() => this.playTone(659.25, 0.2, 0.3, 'triangle'), 300); // E5

    // 2. Double haptic vibration
    this.triggerVibration([100, 60, 150], 'Route Initiated');

    // 3. Spoken instruction
    this.speak(`Path configured. Beginning route from ${startName} to ${endName}. Please follow the guided path ahead.`);
  }

  /**
   * Triggered when walking along the path and reaching an intermediate waypoint.
   * @param step Number of current waypoint
   * @param instruction Object with current navigation metrics
   */
  public playWaypointReached(step: number, info: NavigationVoiceInstruction) {
    const { currentNodeName, nextNodeName, distanceMeters, nodeType } = info;

    // 1. Double pleasant synth chime
    // Calculate direction of panning based on node comparison if available
    let panValue = 0; // Default center
    this.playTone(523.25, panValue, 0.15, 'sine');
    setTimeout(() => this.playTone(783.99, panValue, 0.2, 'sine'), 120);

    // 2. Standard single subtle haptic pulse
    this.triggerVibration(180, `Reached Waypoint ${step}: ${currentNodeName}`);

    // 3. Spoken announcement
    let announcement = `Waypoint reached. ${currentNodeName}. `;
    if (nodeType === 'elevator') {
      announcement += `Use the elevator here. `;
    } else if (nodeType === 'ramp') {
      announcement += `Use the accessibility ramp here. `;
    } else if (nodeType === 'turnstile') {
      announcement += `Turnstile gate entry point. `;
    }

    if (nextNodeName) {
      announcement += `Next heading towards ${nextNodeName}, in approximately ${distanceMeters} meters.`;
    }
    
    this.speak(announcement);
  }

  /**
   * Triggered when user successfully arrives at final destination.
   */
  public playDestinationArrived(destinationName: string) {
    // 1. Melodic celebratory arpeggio
    setTimeout(() => this.playTone(523.25, -0.4, 0.12, 'sine'), 0); // C5
    setTimeout(() => this.playTone(659.25, -0.1, 0.12, 'sine'), 120); // E5
    setTimeout(() => this.playTone(783.99, 0.1, 0.12, 'sine'), 240); // G5
    setTimeout(() => this.playTone(1046.5, 0.4, 0.4, 'sine'), 360); // C6

    // 2. Long celebratory pulse vibration
    this.triggerVibration([150, 50, 150, 50, 350], `Arrived at Destination: ${destinationName}`);

    // 3. Spoken announcement
    this.speak(`Destination reached! You have arrived safely at ${destinationName}. Thank you for using the AR Wayfinder.`);
  }

  /**
   * Triggered on deviation or structural alert along waypoint path
   */
  public playAlertNotification(message: string) {
    // 1. Alarm warning buzzer tone
    this.playTone(220, 0, 0.2, 'sawtooth');
    setTimeout(() => this.playTone(220, 0, 0.3, 'sawtooth'), 250);

    // 2. High attention rapid haptic vibration
    this.triggerVibration([80, 80, 80, 80, 80, 80], 'Pathing Alert Warning');

    // 3. Spoken warning
    this.speak(`Alert: ${message}`);
  }
}

export const hapticAudioService = new HapticAudioService();
