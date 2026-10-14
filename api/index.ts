import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '15mb' }));

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

const SCRIPTED_RESPONSES = {
  TURN_1: 'Halo Bapak dan teman teman semua, ada yang bisa saya bantu?',
  TURN_2: 'Baik, berikut videonya!',
};

const INDONESIAN_SYSTEM_INSTRUCTION = `
Anda adalah asisten suara cerdas Qlola by BRI, platform Corporate Banking terintegrasi nomor satu dari Bank Rakyat Indonesia (BRI).
Karakter Anda:
- Sangat profesional, hangat, sopan, dan berwibawa khas perbankan korporat terpercaya.
- Selalu berbicara dalam Bahasa Indonesia yang baku dan elegan.
- Berikan jawaban yang padat, ringkas, dan to the point (maksimal 2-3 kalimat) karena jawaban Anda akan disuarakan langsung di panggung presentasi.
- Menguasai ekosistem Qlola: Cash Management, Trade Finance, Supply Chain Management, Foreign Exchange, dan Investment Services.
`.trim();

async function generateSpeechAudio(text: string, voiceName: string = 'Kore'): Promise<string | null> {
  if (!ai) return null;
  try {
    const phoneticText = text
      .replace(/Qlola by BRI/gi, 'Kelola by B R I')
      .replace(/Qlola/gi, 'Kelola')
      .replace(/QLOLA/gi, 'Kelola');

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

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error('TTS error on Vercel handler:', error);
    return null;
  }
}

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    environment: 'vercel-serverless',
    brand: 'Qlola by BRI',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) return res.status(400).json({ error: 'Missing text' });
    const audioBase64 = await generateSpeechAudio(text, voice);
    res.json({ text, audioBase64, mimeType: 'audio/wav' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'TTS failure' });
  }
});

app.post('/api/voice-chat', async (req: Request, res: Response) => {
  try {
    const { message, turnCount = 1, voice = 'Kore', customPrompt } = req.body;
    let responseText = '';
    let action: 'none' | 'show_video' = 'none';

    if (turnCount === 1) {
      responseText = SCRIPTED_RESPONSES.TURN_1;
      action = 'none';
    } else if (turnCount === 2) {
      responseText = SCRIPTED_RESPONSES.TURN_2;
      action = 'show_video';
    } else {
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
          responseText = completion.text?.trim() || 'Qlola by BRI mengintegrasikan seluruh solusi perbankan korporasi dalam satu platform.';
        } catch (genErr) {
          responseText = 'Qlola by BRI mengintegrasikan Cash Management, Trade Finance, dan Supply Chain dalam satu dashboard terpadu.';
        }
      } else {
        responseText = 'Qlola by BRI mengintegrasikan seluruh ekosistem bisnis Anda.';
      }
    }

    const audioBase64 = await generateSpeechAudio(responseText, voice);
    res.json({
      text: responseText,
      audioBase64,
      action,
      turnCount,
      timestamp: Date.now(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Voice chat processing failed' });
  }
});

export default app;
