// Browser Web Speech API helper for speech synthesis & recognition

export interface SpeechRecognitionResultItem {
  transcript: string;
  confidence: number;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
}

export function startSpeechRecognition(
  langCode: string,
  onResult: (transcript: string) => void,
  onError: (err: any) => void,
  onEnd: () => void
): { stop: () => void } | null {
  if (!isSpeechRecognitionSupported()) {
    onError(new Error('Speech recognition not supported in this browser.'));
    return null;
  }

  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = langCode || 'hi-IN';

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      onResult(finalTranscript);
    }
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
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
      } catch (e) {
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
