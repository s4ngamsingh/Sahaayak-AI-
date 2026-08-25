// Browser Web Speech API helper for speech synthesis & recognition

export interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

export interface SpeechRecognitionSession {
  stop: () => void;
  abort: () => void;
}

export function startSpeechRecognition(
  langCode: string,
  onResult: (result: { finalTranscript: string; interimTranscript: string; fullTranscript: string }) => void,
  onError: (err: any) => void,
  onEnd: () => void
): SpeechRecognitionSession | null {
  if (!isSpeechRecognitionSupported()) {
    onError(new Error('Speech recognition not supported in this browser.'));
    return null;
  }

  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;
  recognition.lang = langCode || 'hi-IN';

  let accumulatedFinal = '';

  recognition.onresult = (event: any) => {
    let currentInterim = '';
    let currentFinal = '';

    for (let i = 0; i < event.results.length; ++i) {
      const item = event.results[i];
      if (item.isFinal) {
        currentFinal += item[0].transcript;
      } else {
        currentInterim += item[0].transcript;
      }
    }

    accumulatedFinal = currentFinal;

    const fullTranscript = (accumulatedFinal + ' ' + currentInterim).trim();
    if (fullTranscript) {
      onResult({
        finalTranscript: accumulatedFinal.trim(),
        interimTranscript: currentInterim.trim(),
        fullTranscript,
      });
    }
  };

  recognition.onerror = (event: any) => {
    // 'no-speech' is a common benign event when citizen is pausing
    if (event.error === 'no-speech') {
      return;
    }
    console.warn('Speech recognition event warning:', event.error);
    onError(event);
  };

  recognition.onend = () => {
    onEnd();
  };

  try {
    recognition.start();
  } catch (e) {
    console.error('Failed to start recognition', e);
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    },
    abort: () => {
      try {
        recognition.abort();
      } catch {
        // ignore
      }
    },
  };
}

export function speakText(text: string, langCode = 'hi-IN') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}
