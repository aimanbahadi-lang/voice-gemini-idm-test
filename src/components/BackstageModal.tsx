import React, { useState } from 'react';
import { X, RotateCcw, Volume2, Mic, Settings2, Cloud, Copy, Check, Play } from 'lucide-react';
import { BackstageConfig, GeminiVoice } from '../types';

interface BackstageModalProps {
  isOpen: boolean;
  onClose: () => void;
  turnCount: number;
  onResetTurn: () => void;
  onSimulateTurn: (turn: number) => void;
  config: BackstageConfig;
  onChangeConfig: (config: BackstageConfig) => void;
  onTestVoice: () => void;
}

const VOICES: { id: GeminiVoice; name: string; desc: string }[] = [
  { id: 'Kore', name: 'Kore (Rekomendasi)', desc: 'Hangat, sopan, artikulatif khas perbankan' },
  { id: 'Puck', name: 'Puck', desc: 'Ceria, antusias, berenergi tinggi' },
  { id: 'Zephyr', name: 'Zephyr', desc: 'Tenang, ramah, teduh' },
  { id: 'Fenrir', name: 'Fenrir', desc: 'Berwibawa, dalam, tegas' },
  { id: 'Charon', name: 'Charon', desc: 'Resonan, mantap, formal' },
];

export const BackstageModal: React.FC<BackstageModalProps> = ({
  isOpen,
  onClose,
  turnCount,
  onResetTurn,
  onSimulateTurn,
  config,
  onChangeConfig,
  onTestVoice,
}) => {
  const [activeTab, setActiveTab] = useState<'stage' | 'voice' | 'vercel'>('stage');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const vercelJsonCode = `{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "env": {
    "GEMINI_API_KEY": "@gemini_api_key"
  }
}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 animate-in fade-in select-none text-slate-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-[#030a1c] border border-[#00529C]/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#00193d]/50">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
            <h3 className="text-base font-semibold text-white tracking-wide">
              Panel Pengendali Panggung & Vercel (Backstage)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/10 bg-[#010614]">
          <button
            onClick={() => setActiveTab('stage')}
            className={`pb-2.5 px-3 text-xs font-semibold tracking-wider uppercase transition-colors relative ${
              activeTab === 'stage'
                ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Kontrol Demo Panggung
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`pb-2.5 px-3 text-xs font-semibold tracking-wider uppercase transition-colors relative ${
              activeTab === 'voice'
                ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Suara & Persona AI
          </button>
          <button
            onClick={() => setActiveTab('vercel')}
            className={`pb-2.5 px-3 text-xs font-semibold tracking-wider uppercase transition-colors relative ${
              activeTab === 'vercel'
                ? 'text-[#00E5FF] border-b-2 border-[#00E5FF]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Ekspor ke Vercel
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {activeTab === 'stage' && (
            <div className="space-y-6">
              {/* Turn Status Card */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#002b66]/40 to-[#001433]/40 border border-[#00529C]/40 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider text-[#00E5FF] font-semibold mb-1">
                    Status Alur Panggung Saat Ini
                  </div>
                  <div className="text-lg font-bold text-white flex items-center gap-2">
                    <span>
                      {turnCount === 1
                        ? 'Giliran 1: Salam Pembuka ("Halo Bapak dan teman teman...")'
                        : turnCount === 2
                        ? 'Giliran 2: Jawaban Video ("Baik, berikut videonya!")'
                        : `Giliran ${turnCount}: Tanya Jawab Interaktif Dinamis`}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1 flex items-center gap-1.5">
                    <span className="text-cyan-400 font-medium">Pelafalan:</span>
                    <span>QLOLA dilafalkan sebagai <strong className="text-white">"Ke-Lo-La"</strong> (Kelola by BRI)</span>
                  </div>
                </div>
                <button
                  onClick={onResetTurn}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#00529C] hover:bg-[#0066CC] text-white font-medium text-xs transition-colors shrink-0"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset ke Giliran 1
                </button>
              </div>

              {/* Direct Simulator Triggers */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Uji Coba Suara Langsung (Presenter Remote Fallback)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => onSimulateTurn(1)}
                    className="p-3 text-left rounded-xl bg-white/5 hover:bg-[#00529C]/30 border border-white/10 hover:border-[#00529C] transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-[#00E5FF]">
                        Putar Giliran 1
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        "Halo Bapak dan teman teman semua..."
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-slate-400 group-hover:text-[#00E5FF]" />
                  </button>

                  <button
                    onClick={() => onSimulateTurn(2)}
                    className="p-3 text-left rounded-xl bg-white/5 hover:bg-[#00529C]/30 border border-white/10 hover:border-[#00529C] transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-white group-hover:text-[#00E5FF]">
                        Putar Giliran 2 + Layar Hitam (1.5s)
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        "Baik, berikut videonya!" & Redup ke Layar Hitam 1.5s
                      </div>
                    </div>
                    <Play className="w-4 h-4 text-slate-400 group-hover:text-[#00E5FF]" />
                  </button>
                </div>
              </div>

              {/* Hotkeys info */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="text-xs font-semibold text-white uppercase tracking-wider">
                  Pintasan Tombol Panggung
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>
                    <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/20 text-white font-mono">
                      Spasi / Klik
                    </kbd>{' '}
                    : Mulai Bicara / Berhenti Bicara
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/20 text-white font-mono">
                      S
                    </kbd>{' '}
                    : Buka Panel Pengendali Ini
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/20 text-white font-mono">
                      Esc
                    </kbd>{' '}
                    : Tutup Video / Tutup Panel
                  </div>
                  <div>
                    <kbd className="px-1.5 py-0.5 rounded bg-black border border-white/20 text-white font-mono">
                      R
                    </kbd>{' '}
                    : Reset Giliran Demo ke 1
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-5">
              {/* Voice Picker */}
              <div>
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Model Suara Gemini TTS
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {VOICES.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => onChangeConfig({ ...config, voice: v.id })}
                      className={`p-3 text-left rounded-xl border transition-all ${
                        config.voice === v.id
                          ? 'bg-[#00529C]/40 border-[#00E5FF] text-white shadow-md shadow-[#00529C]/30'
                          : 'bg-white/5 border-white/10 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <div className="font-semibold text-sm flex items-center justify-between">
                        <span>{v.name}</span>
                        {config.voice === v.id && (
                          <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Test Voice Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={onTestVoice}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#00529C] hover:bg-[#0066CC] text-white font-medium text-xs transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  Tes Suara Bahasa Indonesia
                </button>
                <span className="text-xs text-slate-400">
                  Model: gemini-3.8-flash-lite-tts
                </span>
              </div>
            </div>
          )}

          {activeTab === 'vercel' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#00529C]/20 border border-[#00529C]/50 text-xs text-slate-200 leading-relaxed">
                <strong className="text-[#00E5FF] block mb-1">
                  100% Siap untuk Vercel Deployment!
                </strong>
                Arsitektur suara ini menggunakan endpoint Express Serverless turn-based
                (<code className="text-white font-mono">/api/voice-chat</code>) yang kompatibel secara native dengan Vercel Serverless Functions tanpa memerlukan WebSocket server terpisah.
              </div>

              {/* vercel.json preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-300">
                    File vercel.json (Sudah Disediakan di Root Project)
                  </span>
                  <button
                    onClick={() => copyToClipboard(vercelJsonCode)}
                    className="flex items-center gap-1.5 text-xs text-[#00E5FF] hover:underline"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Tersalin!' : 'Salin JSON'}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-black/80 border border-white/10 text-xs font-mono text-cyan-300 overflow-x-auto">
                  {vercelJsonCode}
                </pre>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <div className="font-semibold text-white">Langkah Cepat Deploy ke Vercel:</div>
                <ol className="list-decimal pl-5 space-y-1.5 text-slate-400">
                  <li>Push kode repositori ini ke GitHub / GitLab.</li>
                  <li>Impor repositori ke dashboard Vercel Anda.</li>
                  <li>
                    Di bagian <strong className="text-white">Environment Variables</strong>, tambahkan{' '}
                    <code className="text-cyan-300 font-mono">GEMINI_API_KEY</code> dengan API key Google AI Studio Anda.
                  </li>
                  <li>Klik <strong>Deploy</strong>. Proyek akan online dalam ~1 menit!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
