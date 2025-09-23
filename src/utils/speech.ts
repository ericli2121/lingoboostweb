export class SpeechService {
  private synthesis: SpeechSynthesis | null = null;
  public voices: SpeechSynthesisVoice[] = [];
  private isMuted: boolean = false;
  private speechRate: number = 1.0;

  constructor() {
    console.log('SpeechService constructor');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
    }
  }

  private loadVoices() {
    if (!this.synthesis) return;
    
    this.voices = this.synthesis.getVoices();
    this.voices.forEach(voice => {
      console.log(`${voice.name} (${voice.lang})`);
  });
    // If voices are not loaded yet, wait for them
    if (this.voices.length === 0) {
      this.synthesis.addEventListener('voiceschanged', () => {
        this.voices = this.synthesis?.getVoices() || [];
      });
    }
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  hasVoiceForLanguage(languageCode: string): boolean {
    return this.voices.some(voice => 
      voice.lang.toLowerCase().startsWith(languageCode.toLowerCase())
    );
  }

  speak(text: string, language: string = 'vi-VN', onEnd?: () => void) {
    if (!this.synthesis) {
      console.warn('Speech synthesis not supported');
      onEnd?.();
      return;
    }

    // If muted, skip speech and call onEnd immediately
    if (this.isMuted) {
      setTimeout(() => onEnd?.(), 100); // Small delay for better UX
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a voice for the specified language
    const voice = this.voices.find(v => v.lang.startsWith(language.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = language;
    utterance.rate = this.speechRate; // Use configurable rate
    utterance.pitch = 1;
    utterance.volume = 0.8;

    // Add event listeners
    if (onEnd) {
      utterance.addEventListener('end', onEnd);
      utterance.addEventListener('error', onEnd);
    }

    this.synthesis.speak(utterance);
  }

  setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.synthesis) {
      this.synthesis.cancel(); // Stop current speech if muting
    }
  }

  isSpeechMuted(): boolean {
    return this.isMuted;
  }

  setSpeechRate(rate: number) {
    this.speechRate = Math.max(0.1, Math.min(2.0, rate)); // Clamp between 0.1 and 2.0
  }

  getSpeechRate(): number {
    return this.speechRate;
  }

  stop() {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const speechService = new SpeechService();
