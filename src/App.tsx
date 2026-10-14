import React, { useState, useEffect, useRef, useCallback } from 'react';
import { WaveformCanvas } from './components/WaveformCanvas';
import { StageBlackout } from './components/StageBlackout';
import { BackstageModal } from './components/BackstageModal';
import { QlolaLogo } from './components/QlolaLogo';
import { AssistantState, BackstageConfig, VoiceChatResponse } from './types';

// SCRIPTED FALLBACKS
const SCRIPTED = {
  TURN_1: 'Halo Bapak dan teman teman semua, ada yang bisa saya bantu?',
  TURN_2: 'Baik, berikut videonya!',
};

export default function App() {
  const [state, setState] = useState<AssistantState>('idle');
  const [turnCount, setTurnCount] = useState<number>(1);
  const [isBlackout, setIsBlackout] = useState<boolean>(false);
  const [isBackstageOpen, setIsBackstageOpen] = useState<boolean>(false);
  const [lastSpokenText, setLastSpokenText] = useState<string>('');

  const [config, setConfig] = useState<BackstageConfig>({
    voice: 'Kore',
    customPrompt: '',
    autoListen: false,
    micSensitivity: 1.0,
    showSubtitles: false,
  });

  // Audio Context & Analyser
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Initialize Web Audio Context
  const ensureAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.85;
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return { ctx: audioCtxRef.current, analyser: analyserRef.current };
  }, []);

  /**
   * Plays synthesized speech audio and routes it into the AnalyserNode
   */
  const playAudioPayload = useCallback(
    async (base64Audio: string | null | undefined, textFallback: string, onEnded?: () => void) => {
      const { ctx, analyser } = ensureAudioContext();
      if (!ctx || !analyser) return;

      setState('speaking');
      setLastSpokenText(textFallback);

      if (base64Audio) {
        try {
          const binaryString = atob(base64Audio);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const audioBuffer = await ctx.decodeAudioData(bytes.buffer.slice(0));

          if (currentAudioSourceRef.current) {
            try {
              currentAudioSourceRef.current.stop();
            } catch (_) {}
          }

          const source = ctx.createBufferSource();
          source.buffer = audioBuffer;

          // Route source to analyser and to speakers
          source.connect(analyser);
          analyser.connect(ctx.destination);

          source.onended = () => {
            setState('idle');
            if (onEnded) onEnded();
          };

          currentAudioSourceRef.current = source;
          source.start(0);
          return;
        } catch (err) {
          console.warn('WAV decode failed, falling back to Web Speech Synthesis:', err);
        }
      }

      // Robust fallback using browser Indonesian speech synthesis
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        // Pronounce QLOLA as 'Ke-Lo-La' ('Kelola')
        const phoneticFallback = textFallback
          .replace(/Qlola by BRI/gi, 'Kelola by B R I')
          .replace(/Qlola/gi, 'Kelola')
          .replace(/QLOLA/gi, 'Kelola');

        const utterance = new SpeechSynthesisUtterance(phoneticFallback);
        utterance.lang = 'id-ID';
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        // Try to pick an Indonesian voice if available
        const voices = window.speechSynthesis.getVoices();
        const idVoice = voices.find((v) => v.lang.includes('id') || v.lang.includes('ID'));
        if (idVoice) utterance.voice = idVoice;

        // Modulate audio analyser so the waveform undulates to speech synthesis
        let osc: OscillatorNode | null = null;
        let oscGain: GainNode | null = null;
        try {
          osc = ctx.createOscillator();
          oscGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, ctx.currentTime);
          oscGain.gain.setValueAtTime(0.35, ctx.currentTime);
          osc.connect(oscGain);
          oscGain.connect(analyser); // Route only into analyser, not to speakers
          osc.start();
        } catch (_) {}

        const cleanup = () => {
          if (osc) {
            try {
              osc.stop();
              osc.disconnect();
            } catch (_) {}
          }
          setState('idle');
          if (onEnded) onEnded();
        };

        utterance.onend = cleanup;
        utterance.onerror = cleanup;

        window.speechSynthesis.speak(utterance);
      } else {
        setState('idle');
        if (onEnded) onEnded();
      }
    },
    [ensureAudioContext]
  );

  /**
   * Processes the user's speech turn through the backend
   */
  const handleVoiceTurn = useCallback(
    async (transcript?: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      // Stop mic capture
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
        micStreamRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }

      setState('thinking');

      try {
        const response = await fetch('/api/voice-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: transcript || '',
            turnCount,
            voice: config.voice,
            customPrompt: config.customPrompt,
          }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data: VoiceChatResponse = await response.json();

        // Advance turn counter
        const nextTurn = turnCount + 1;
        setTurnCount(nextTurn);

        // Play the speech audio
        playAudioPayload(data.audioBase64, data.text, () => {
          // If Turn 2 was executed ("Baik, berikut videonya!"), trigger 1.5s transition dimming to black screen
          if (data.action === 'show_video' || turnCount === 2) {
            setIsBlackout(true);
          }
        });
      } catch (err) {
        console.error('Turn processing error:', err);
        // Fallback to strict client-side guarantee for the stage presentation
        const fallbackText = turnCount === 1 ? SCRIPTED.TURN_1 : SCRIPTED.TURN_2;
        const currentTurn = turnCount;
        setTurnCount((prev) => prev + 1);

        playAudioPayload(null, fallbackText, () => {
          if (currentTurn === 2) {
            setIsBlackout(true);
          }
        });
      } finally {
        isProcessingRef.current = false;
      }
    },
    [turnCount, config.voice, config.customPrompt, playAudioPayload]
  );

  /**
   * Starts listening to presenter's microphone and captures speech
   */
  const startListening = useCallback(async () => {
    if (state === 'thinking' || state === 'speaking') return;

    try {
      const { ctx, analyser } = ensureAudioContext();
      if (!ctx || !analyser) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      micStreamRef.current = stream;
      const source = ctx.createMediaStreamSource(stream);
      micSourceRef.current = source;
      source.connect(analyser);

      setState('listening');

      // Initialize Web Speech Recognition if available (id-ID)
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'id-ID';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0]?.[0]?.transcript || '';
          handleVoiceTurn(transcript);
        };

        recognition.onerror = () => {
          // If speech recognition times out or errors, automatically advance turn
          handleVoiceTurn('');
        };

        recognition.onend = () => {
          if (state === 'listening' && !isProcessingRef.current) {
            handleVoiceTurn('');
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } else {
        // Fallback: 3.5-second listening window
        setTimeout(() => {
          if (state === 'listening' && !isProcessingRef.current) {
            handleVoiceTurn('');
          }
        }, 3500);
      }
    } catch (err) {
      console.warn('Microphone permission or capture issue:', err);
      // Immediately simulate the turn so stage flow never stalls
      handleVoiceTurn('');
    }
  }, [state, ensureAudioContext, handleVoiceTurn]);

  /**
   * Stops listening or toggles conversation
   */
  const toggleListening = useCallback(() => {
    if (state === 'speaking') {
      // If speaking, stop audio and return to idle
      if (currentAudioSourceRef.current) {
        try {
          currentAudioSourceRef.current.stop();
        } catch (_) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setState('idle');
      return;
    }

    if (state === 'listening') {
      // User tapped while listening -> finish speech
      handleVoiceTurn('');
    } else if (state === 'idle') {
      startListening();
    }
  }, [state, startListening, handleVoiceTurn]);

  // Global Keyboard Shortcuts for the Stage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Do not trigger if typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        toggleListening();
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsBackstageOpen((prev) => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setTurnCount(1);
      } else if (e.key === '1') {
        e.preventDefault();
        setTurnCount(1);
        handleVoiceTurn('');
      } else if (e.key === '2') {
        e.preventDefault();
        setTurnCount(2);
        handleVoiceTurn('');
      } else if (e.key === 'Escape') {
        setIsBlackout(false);
        setIsBackstageOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleListening, handleVoiceTurn]);

  // Clean-up on unmount
  useEffect(() => {
    return () => {
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden bg-black cursor-pointer select-none"
      onClick={toggleListening}
    >
      {/* 100% PURE BIOLUMINESCENT WAVEFORM CANVAS ON BLACK GRADIENT BLUE */}
      <WaveformCanvas analyser={analyserRef.current} state={state} />

      {/* OFFICIAL QLOLA BY BRI LOGO ON TOP OF THE WAVEFORM */}
      <div className="absolute top-10 md:top-14 lg:top-16 inset-x-0 flex flex-col items-center justify-center pointer-events-none z-10 transition-all duration-700">
        <QlolaLogo
          className="w-56 sm:w-64 md:w-80 lg:w-[420px]"
          glow={true}
          active={state === 'speaking' || state === 'listening'}
        />
      </div>

      {/* PURE BLACKOUT SCREEN TRANSITION (1.5S FADE TO BLACK AFTER TURN 2) */}
      <StageBlackout isActive={isBlackout} onDismiss={() => setIsBlackout(false)} />

      {/* HIDDEN BACKSTAGE MODAL (HOTKEY 'S' OR CLICK HIDDEN CORNER) */}
      <BackstageModal
        isOpen={isBackstageOpen}
        onClose={() => setIsBackstageOpen(false)}
        turnCount={turnCount}
        onResetTurn={() => setTurnCount(1)}
        onSimulateTurn={(turn) => {
          setTurnCount(turn);
          setIsBackstageOpen(false);
          handleVoiceTurn('');
        }}
        config={config}
        onChangeConfig={setConfig}
        onTestVoice={() => {
          playAudioPayload(null, SCRIPTED.TURN_1);
        }}
      />

      {/* INVISIBLE DISCREET BACKSTAGE TRIGGER (Bottom-Right 44x44 corner area, 0 opacity) */}
      <div
        className="fixed bottom-0 right-0 w-14 h-14 z-30 opacity-0 hover:opacity-20 transition-opacity flex items-center justify-center cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setIsBackstageOpen(true);
        }}
        title="Buka Pengendali Panggung (Hotkey: S)"
      >
        <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
      </div>
    </main>
  );
}
