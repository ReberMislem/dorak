// ============================================
// دورك - Web Audio API Sound Synthesizer
// ============================================

export type SoundType = "classic-bell" | "soft-notification" | "arabic-bell" | "modern-ping" | "queue-alert";

export function playSynthesizedSound(type: SoundType, volume: number = 0.8) {
  // Return early if not in browser
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Create master volume node
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    switch (type) {
      case "classic-bell": {
        // High quality classic ringing bell
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        osc1.type = "sine";
        osc1.frequency.setValueAtTime(880, now); // A5

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(587.33, now); // D5

        // Bell envelope
        gain1.gain.setValueAtTime(0.5, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        gain2.gain.setValueAtTime(0.3, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc1.connect(gain1);
        gain1.connect(masterGain);

        osc2.connect(gain2);
        gain2.connect(masterGain);

        osc1.start(now);
        osc2.start(now);

        osc1.stop(now + 1.6);
        osc2.stop(now + 1.6);
        break;
      }

      case "soft-notification": {
        // Upward gentle arpeggio
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.setValueAtTime(0.6, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.7);
        break;
      }

      case "arabic-bell": {
        // Chord resembling a traditional chime/oud pluck
        const frequencies = [392.00, 493.88, 587.33, 783.99]; // G4, B4, D5, G5
        frequencies.forEach((freq, index) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now + index * 0.04); // subtle delay/strum

          gain.gain.setValueAtTime(0.25, now + index * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2 + index * 0.04);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + index * 0.04);
          osc.stop(now + 1.5);
        });
        break;
      }

      case "modern-ping": {
        // High frequency clean ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case "queue-alert": {
        // Double modern ping
        [0, 0.18].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(delay === 0 ? 587.33 : 880, now + delay);

          gain.gain.setValueAtTime(0.5, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.25);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now + delay);
          osc.stop(now + delay + 0.3);
        });
        break;
      }
    }
  } catch (e) {
    console.error("[SOUND SYNTHESIS ERROR]", e);
  }
}

// Play custom audio file or synthesized fallback
export function playSound(soundUrlOrType: string, volume: number = 0.8) {
  if (typeof window === "undefined") return;

  const presets = ["classic-bell", "soft-notification", "arabic-bell", "modern-ping", "queue-alert"];
  
  if (presets.includes(soundUrlOrType)) {
    playSynthesizedSound(soundUrlOrType as SoundType, volume);
  } else if (soundUrlOrType && (soundUrlOrType.startsWith("http") || soundUrlOrType.startsWith("/"))) {
    try {
      const audio = new Audio(soundUrlOrType);
      audio.volume = volume;
      audio.play().catch((err) => {
        console.warn("Autoplay restriction prevented sound playback. Synthesizing backup chimes...", err);
        // Fallback to classic bell synthesis if raw audio fails to autoplay
        playSynthesizedSound("classic-bell", volume);
      });
    } catch (e) {
      console.error("[PLAY AUDIO FILE ERROR]", e);
      playSynthesizedSound("classic-bell", volume);
    }
  } else {
    // Default fallback
    playSynthesizedSound("classic-bell", volume);
  }
}
