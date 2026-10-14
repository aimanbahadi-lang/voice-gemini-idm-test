import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Google GenAI client with required User-Agent
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Pre-defined script responses as requested
const SCRIPTED_RESPONSES = {
  TURN_1: 'Halo Bapak dan teman teman semua, ada yang bisa saya bantu?',
  TURN_2: 'Baik, berikut videonya!',
};

const INDONESIAN_SYSTEM_INSTRUCTION = `
Anda adalah asisten kecerdasan buatan suara untuk platform Qlola by BRI, platform Corporate Banking terintegrasi nomor satu dari Bank Rakyat Indonesia (BRI).
Karakter Anda:
- Sangat profesional, hangat, sopan, dan berwibawa khas perbankan korporat terpercaya.
- Selalu berbicara dalam Bahasa Indonesia yang baku dan elegan.
- Berikan jawaban yang padat, ringkas, dan to the point (maksimal 2-3 kalimat) karena jawaban Anda akan disuarakan langsung melalui sistem tata suara panggung LED.
- Anda menguasai seluruh produk dan solusi ekosistem Qlola by BRI:
  1. Cash Management (Payment, Collection, Liquidity Management)
  2. Trade Finance & Bank Guarantee
  3. Supply Chain Management
  4. Foreign Exchange & Global Markets
  5. Financial Dashboard & Investment Services
- Jika ditanya hal umum, jawab secara ramah dan hubungkan dengan kesiapan Qlola mendukung pertumbuhan bisnis nasabah.
`.trim();

/**
 * Synthesizes Indonesian speech using Gemini 3.8 Flash Lite TTS
 * Guarantees QLOLA is pronounced authentically as 'Ke-Lo-La' ('Kelola')
 */
async function generateSpeechAudio(text: string, voiceName: string = 'Kore'): Promise<string | null> {
  if (!ai) return null;

  try {
    // Phonetic normalization for natural Indonesian pronunciation
    // 'Qlola' -> 'Kelola' (pronounced Ke-Lo-La)
    const phoneticText = text
      .replace(/Qlola by BRI/gi, 'Kelola by B R I')
      .replace(/Qlola/gi, 'Kelola')
      .replace(/QLOLA/gi, 'Kelola');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: phoneticText,
                speechMetadata: {
                  style: 'Clear, polite, and warmly articulate Indonesian banking presenter. Pronounce QLOLA as Ke-lo-la.',
                },
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) return base64Audio;
    } catch (liteErr: any) {
      // If free tier quota reached on lite-tts, attempt flagship flash-tts
      try {
        const response2 = await ai.models.generateContent({
          model: 'gemini-3.8-flash-tts',
          contents: [
            {
              role: 'user',
              parts: [{ text: phoneticText }],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
              },
            },
          },
        });
        const base64Audio2 = response2.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio2) return base64Audio2;
      } catch (_) {
        // Handled smoothly by client Indonesian speech synthesis
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    brand: 'Qlola by BRI',
    hasApiKey: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

// Dedicated TTS endpoint
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text parameter' });
    }

    const audioBase64 = await generateSpeechAudio(text, voice);
    res.json({
      text,
      audioBase64,
      mimeType: 'audio/wav',
    });
  } catch (err: any) {
    console.error('TTS endpoint error:', err);
    res.status(500).json({ error: err.message || 'TTS generation failed' });
  }
});

// Core Voice Chat Turn-Based API
app.post('/api/voice-chat', async (req: Request, res: Response) => {
  try {
    const { message, turnCount = 1, voice = 'Kore', customPrompt } = req.body;

    let responseText = '';
    let action: 'none' | 'show_video' = 'none';

    // Scripted Flow for Event Showcase
    if (turnCount === 1) {
      // 1st time answer: "Halo Bapak dan teman teman semua, ada yang bisa saya bantu?"
      responseText = SCRIPTED_RESPONSES.TURN_1;
      action = 'none';
    } else if (turnCount === 2) {
      // 2nd answer: "Baik, berikut videonya!"
      responseText = SCRIPTED_RESPONSES.TURN_2;
      action = 'show_video';
    } else {
      // Turn 3+: Dynamic Gemini 3.8 Flash intelligence in Indonesian
      if (ai) {
        try {
          const userMessage = message?.trim() || 'Mohon jelaskan secara singkat keunggulan utama Qlola by BRI.';
          const completion = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userMessage,
            config: {
              systemInstruction: customPrompt?.trim() || INDONESIAN_SYSTEM_INSTRUCTION,
              temperature: 0.7,
            },
          });

          responseText = completion.text?.trim() || 'Qlola by BRI siap mengintegrasikan seluruh solusi perbankan korporasi Anda.';
        } catch (genErr) {
          console.error('Gemini generateContent error:', genErr);
          responseText = 'Qlola by BRI mengintegrasikan Cash Management, Trade Finance, dan Supply Chain dalam satu dashboard terpadu untuk efisiensi bisnis Anda.';
        }
      } else {
        responseText = 'Qlola by BRI mengintegrasikan seluruh solusi perbankan korporasi dalam satu platform seamless.';
      }
    }

    // Generate natural speech audio
    const audioBase64 = await generateSpeechAudio(responseText, voice);

    res.json({
      text: responseText,
      audioBase64,
      action,
      turnCount,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    console.error('Voice chat error:', err);
    res.status(500).json({
      error: err.message || 'Voice chat processing failed',
      fallbackText: 'Halo Bapak dan teman teman semua, ada yang bisa saya bantu?',
    });
  }
});

// Mounting Vite in development or serving static dist in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Hosted previews proxy HTTP but do not expose Vite's HMR WebSocket.
    // Return an empty module for the injected client so it cannot retry a
    // connection that the preview host cannot open.
    app.get(['/__vite_ping', '/@vite/client'], (_req: Request, res: Response) => {
      res.type('application/javascript').send('');
    });

    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
      // The hosted preview proxies HTTP but does not expose Vite's websocket endpoint.
      // Disable HMR there to prevent repeated "WebSocket closed without opened" errors.
          hmr: false,
          // The preview proxy cannot forward Vite's HMR WebSocket. Disable the
          // watcher too so the injected Vite client never attempts a connection.
          watch: null,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Qlola Voice Server] Running at http://localhost:${PORT} in ${isProd ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
