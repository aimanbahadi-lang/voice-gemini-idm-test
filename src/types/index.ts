export type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface VoiceChatResponse {
  text: string;
  audioBase64?: string | null;
  action?: 'none' | 'show_video';
  turnCount: number;
  timestamp?: number;
}

export type GeminiVoice = 'Kore' | 'Puck' | 'Fenrir' | 'Zephyr' | 'Charon';

export interface BackstageConfig {
  voice: GeminiVoice;
  customPrompt: string;
  autoListen: boolean;
  micSensitivity: number; // 0.5 to 2.0
  showSubtitles: boolean;
}
