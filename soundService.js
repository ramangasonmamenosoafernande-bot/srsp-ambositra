/**
 * Service de signaux sonores et alertes acoustiques
 * SRSP Ambositra — Amoron'i Mania
 * Utilise la Web Audio API native pour une compatibilité 100% hors-ligne
 */

let audioCtx = null;
let isAudioUnlocked = false;

export const unlockAudio = () => {
  if (isAudioUnlocked && audioCtx && audioCtx.state === 'running') return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    isAudioUnlocked = true;
  } catch (e) {
    console.warn('AudioContext non supporté ou bloqué:', e);
  }
};

if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudio();
    window.removeEventListener('click', handleFirstInteraction);
    window.removeEventListener('keydown', handleFirstInteraction);
    window.removeEventListener('touchstart', handleFirstInteraction);
  };
  window.addEventListener('click', handleFirstInteraction);
  window.addEventListener('keydown', handleFirstInteraction);
  window.addEventListener('touchstart', handleFirstInteraction);
}

export const playAcousticSignal = (type = 'notification') => {
  try {
    unlockAudio();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    switch (type) {
      case 'notification':
      case 'depot': {
        // Carillon harmonieux 3 tons (Do-Mi-Sol : 523Hz, 659Hz, 784Hz)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.setValueAtTime(659.25, now + 0.1);
        osc.frequency.setValueAtTime(783.99, now + 0.22);
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.35, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.2, now + 0.22);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
        osc.start(now);
        osc.stop(now + 0.56);
        break;
      }
      case 'success':
      case 'validation': {
        // Accord ascendant lumineux (Fa5 - La5)
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(698.46, now);
        osc.frequency.setValueAtTime(880.0, now + 0.12);
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.3, now + 0.04);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.46);
        break;
      }
      case 'alert':
      case 'warning': {
        // Signal d'avertissement deux tons
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(622.25, now);
        osc.frequency.setValueAtTime(440.0, now + 0.14);
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(0.25, now + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.42);
        break;
      }
      default: {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.31);
        break;
      }
    }
  } catch (err) {
    console.error('Erreur lecture signal acoustique:', err);
  }
};