/**
 * hooks/useLyraVoice.ts — Admin Panel (NexiService)
 *
 * Web Speech API del navegador (gratuita, sin API key):
 * - STT: SpeechRecognition (Chrome/Edge)
 * - TTS: SpeechSynthesis (todos los browsers)
 */

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseLyraVoiceOptions {
  apiUrl: string;
  projectId: string;
  onTranscript: (text: string) => void;
  autoSpeak?: boolean;
  language?: string;
}

interface UseLyraVoiceReturn {
  isListening: boolean;
  isSpeaking: boolean;
  voiceEnabled: boolean;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
  toggleVoice: () => void;
  error: string | null;
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

export function useLyraVoice({
  onTranscript,
  autoSpeak = false,
  language = 'es-CO',
}: UseLyraVoiceOptions): UseLyraVoiceReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(autoSpeak);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const SpeechRecognitionAPI = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;
  const isSupported = Boolean(SpeechRecognitionAPI);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognitionAPI) {
      setError('Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.');
      return;
    }
    if (isListening) return;
    setError(null);

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    // Diccionario de corrección fonética
    const phoneticMap: Record<string, string> = {
      'netflix': 'NexiService',
      'nexi service': 'NexiService',
      'nexiservis': 'NexiService',
      'nexi servis': 'NexiService',
      'laira': 'Lyra',
      'lira': 'Lyra',
      'la ira': 'Lyra',
    };

    const postProcessTranscript = (text: string) => {
      let processed = text;
      Object.entries(phoneticMap).forEach(([key, val]) => {
        const regex = new RegExp(`\\b${key}\\b`, 'gi');
        processed = processed.replace(regex, val);
      });
      return processed;
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim() || '';
      if (transcript) {
        const corrected = postProcessTranscript(transcript);
        onTranscript(corrected);
      } else {
        setError('No se detectó ningún texto. Intenta de nuevo.');
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setError('Permiso de micrófono denegado. Habilítalo en tu navegador.');
      } else if (event.error === 'no-speech') {
        setError('No se detectó voz. Habla más cerca del micrófono.');
      } else if (event.error !== 'aborted') {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setError('No se pudo iniciar el micrófono.');
      setIsListening(false);
    }
  }, [SpeechRecognitionAPI, isListening, language, onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !text || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(true);

    const cleanText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/#+\s/g, '')
      .replace(/- /g, '')
      .substring(0, 500);

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(v => v.lang.startsWith('es') && v.localService)
      || voices.find(v => v.lang.startsWith('es'));
    if (spanishVoice) utterance.voice = spanishVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled, language]);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled(prev => {
      if (prev) window.speechSynthesis?.cancel();
      return !prev;
    });
  }, []);

  return { isListening, isSpeaking, voiceEnabled, isSupported, startListening, stopListening, speak, toggleVoice, error };
}
