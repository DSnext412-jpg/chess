let audioContext: AudioContext | null = null;
let unlocked = false;

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!audioContext) {
    try {
      audioContext = new Ctor();
    } catch {
      return null;
    }
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume();
  }
  return audioContext;
}

export function unlockAudio(): void {
  if (unlocked) return;
  const ctx = getContext();
  if (!ctx) return;
  unlocked = true;
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }
}

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  endFrequency?: number;
}

function tone({
  frequency,
  duration,
  type = 'sine',
  gain = 0.05,
  delay = 0,
  endFrequency,
}: ToneOptions): void {
  const ctx = getContext();
  if (!ctx) return;
  const start = ctx.currentTime + delay;
  const oscillator = ctx.createOscillator();
  const amp = ctx.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  if (endFrequency) {
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFrequency),
      start + duration,
    );
  }
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(amp);
  amp.connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

function noise(duration: number, gain: number, delay = 0): void {
  const ctx = getContext();
  if (!ctx) return;
  const frameCount = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i += 1) {
    const decay = 1 - i / frameCount;
    data[i] = (Math.random() * 2 - 1) * decay * decay;
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 950;
  filter.Q.value = 0.9;
  const amp = ctx.createGain();
  amp.gain.value = gain;
  source.connect(filter);
  filter.connect(amp);
  amp.connect(ctx.destination);
  source.start(ctx.currentTime + delay);
}

export function playMoveSound(): void {
  tone({ frequency: 320, endFrequency: 180, duration: 0.075, type: 'triangle', gain: 0.05 });
  noise(0.035, 0.018);
}

export function playCaptureSound(): void {
  tone({ frequency: 180, endFrequency: 82, duration: 0.16, type: 'sawtooth', gain: 0.045 });
  noise(0.1, 0.03);
  tone({ frequency: 520, endFrequency: 300, duration: 0.08, type: 'triangle', gain: 0.03, delay: 0.03 });
}

export function playCheckSound(): void {
  tone({ frequency: 760, duration: 0.12, type: 'sine', gain: 0.04 });
  tone({ frequency: 1010, duration: 0.14, type: 'sine', gain: 0.028, delay: 0.09 });
}

export function playEndSound(): void {
  tone({ frequency: 392, duration: 0.35, type: 'sine', gain: 0.035 });
  tone({ frequency: 523.25, duration: 0.42, type: 'sine', gain: 0.028, delay: 0.06 });
  tone({ frequency: 659.25, duration: 0.55, type: 'sine', gain: 0.022, delay: 0.12 });
}

export function playClickSound(): void {
  tone({ frequency: 540, endFrequency: 420, duration: 0.035, type: 'triangle', gain: 0.022 });
}
