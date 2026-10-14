# Qlola Voice: Event LED Stage Minimalist Waveform Experience

An ultra-minimalist, voice-driven AI interface designed specifically for live event stage LED screens. The visual preview displays **strictly a pure bioluminescent fluid waveform on a deep black-to-BRI royal blue gradient background**, with zero visible UI chrome, text boxes, or buttons. The presenter interacts seamlessly via natural speech, delivering the scripted showcase (Turn 1 greeting, Turn 2 video reveal) and dynamic Indonesian corporate banking AI responses.

## User Review & Critical Decisions

> [!IMPORTANT]
> The plan is strictly revised to accommodate the live Event Stage LED Screen requirements:

- **100% Pure Waveform Display**: Zero visible UI elements (no top bars, headers, floating badges, chat bubbles, or visible buttons) during the LED showcase. The screen is an uninterrupted, cinematic canvas.
- **Background Atmosphere**: Rich, deep black gradient with subtle atmospheric BRI corporate royal blue depth (`radial-gradient(ellipse at center, #002b66 0%, #00122e 45%, #000208 100%)`).
- **Qlola Royal Blue Waveform**: The multi-layered bioluminescent fluid wave glows in Qlola by BRI signature royal blue (`#00529C` / `#0066FF`) with radiant cyan electric energy (`#00E5FF`), reacting in real time to microphone audio and Indonesian voice synthesis.
- **Stage Interaction Flow**:
  - **Turn 1**: Presenter speaks $\rightarrow$ AI responds in natural Indonesian speech:
    > *"Halo Bapak dan teman teman semua, ada yang bisa saya bantu?"*
    *(Waveform dances to the speech frequencies with intense blue bioluminescence).*
  - **Turn 2**: Presenter prompts for video/presentation $\rightarrow$ AI responds:
    > *"Baik, berikut videonya!"*
    *(Smoothly transitions into full-screen cinematic video playback on the LED screen, dismissible back to the waveform via Spacebar/Esc/Tap).*
  - **Turn 3+**: Continues real-time Indonesian banking assistant dialogue.
- **Hands-Free & Discreet Stage Controls**:
  - Tap anywhere on screen or press Spacebar to trigger/listen.
  - Optional hands-free auto-listening mode for the stage microphone.
  - Hidden presenter hotkey (`S` key or discreet corner click) to access backstage settings (audio gain, Vercel export guide, reset turn demo) without showing anything on the LED screen during the presentation.

---

## 1. Overview & Core Concept

- **What It Does**: Serves as the visual and auditory centerpiece for a live keynote or product launch on a massive LED stage screen. The audience sees only a living, breathing blue waveform on an expansive black-blue canvas. When the speaker addresses the system, the wave vibrates with energy, seamlessly delivers Indonesian vocal responses, and triggers the video showcase on cue.
- **Target Audience / Persona**: Keynote attendees, executive VIPs, and corporate banking clients watching the Qlola by BRI stage demonstration.
- **Key Value**: Delivers the visual awe of a futuristic AI presence without any clumsy app UI elements, menus, or software chrome visible to the audience.

---

## 2. User Experience & Visual Design (LED Stage Profile)

### The Stage Presentation Flow
1. **LED Stage Standby (Ambient)**:
   - Pitch-black edges with a centered deep BRI blue gradient core.
   - An organic fluid waveform gently breathes at low amplitude, indicating the system is alive and listening.
   - Absolutely zero visible text, buttons, icons, or navigation bars.
2. **Presenter Speaking (Microphone Reactivity)**:
   - Presenter speaks into the microphone (or taps the stage remote/spacebar).
   - The waveform expands vertically and undulates in real time, mirroring the presenter's voice pitch and volume with fluid ripples.
3. **Turn 1 Vocal Response**:
   - The system synthesizes speech and responds through the stage sound system:
     > *"Halo Bapak dan teman teman semua, ada yang bisa saya bantu?"*
   - The waveform illuminates brightly in neon cyan and royal blue, pulsing harmonically to every syllable.
4. **Turn 2 Video Reveal**:
   - Presenter requests the demo or video.
   - AI speaks:
     > *"Baik, berikut videonya!"*
   - Smooth cinematic cross-fade reveals the full-screen Qlola by BRI showcase video on the LED screen with zero jarring window frames.
   - Pressing `Esc` or clicking seamlessly transitions back to the ambient waveform for continued Q&A.
5. **Turn 3+ Dynamic Banking Intelligence**:
   - Presenter can ask any impromptu question about Qlola by BRI (Cash Management, Trade Finance, Supply Chain, etc.), and the AI provides concise, professional Indonesian answers with matching vocal synthesis.

### Visual Styling
- **Canvas Base**: Pure `#000000` with subtle radial vignette towards `#00193d` / `#002f6c` in the center.
- **Waveform Rendering**: Additive canvas blending (`lighter`) using multiple sine-cosine harmonic curves with Gaussian glow:
  - Base wave: Deep BRI Royal Blue (`rgba(0, 82, 156, 0.7)`)
  - Mid wave: Electric Sapphire (`rgba(0, 115, 230, 0.85)`)
  - Core crest: Luminous Cyan / Ice Blue (`rgba(0, 229, 255, 0.95)`)

---

## 3. Key Product Decisions & Trade-Offs

- **No UI Chrome on Screen**:
  - *Chosen Approach*: Completely remove all headers, footer bars, status badges, and buttons from the main viewport.
  - *Why*: Designed specifically for live LED event screens where any standard web browser UI (buttons, sliders, headers) degrades the theatrical immersion.
  - *Backstage Access*: A hidden hotkey (`S` or subtle bottom-right tap) opens a discreet backstage modal for the AV operator to test audio, reset turn counters, or export to Vercel.
- **Turn-Based Audio API for Instant Vercel Portability**:
  - *Chosen Approach*: Keep clean HTTP `/api/voice-chat` endpoints.
  - *Why*: Enables instant export and deployment to Vercel without requiring complex stateful WebSocket servers.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                   STAGE LED SCREEN VIEWPORT (100% Fullscreen)          │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │   Deep Black Gradient Blue Background                          │   │
│   │   (radial-gradient: #000000 -> #00122e -> #002b66)             │   │
│   │                                                                │   │
│   │   ┌────────────────────────────────────────────────────────┐   │   │
│   │   │   Bioluminescent Qlola Royal Blue Waveform (60 FPS)    │   │   │
│   │   │   • Real-time Web Audio Analyser reactivity            │   │   │
│   │   │   • Additive glowing harmonics                         │   │   │
│   │   └────────────────────────────────────────────────────────┘   │   │
│   │                                                                │   │
│   │   [ Turn 2 Fullscreen Video Overlay (Smooth Cinematic Fade) ]  │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   Hidden Hotkeys: [Space/Tap] = Talk | [S] = Backstage Panel           │
└───────────────────────────────────────┬────────────────────────────────┘
                                        │ HTTP POST /api/voice-chat
                                        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express / Vercel Ready)                  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ /api/voice-chat                                                  │  │
│  │  • Turn 1: "Halo Bapak dan teman teman semua,..."                │  │
│  │  • Turn 2: "Baik, berikut videonya!" + triggerVideo: true        │  │
│  │  • Turn 3+: Gemini 3.8 Flash Indonesian Banking Model            │  │
│  │  • Gemini 3.8 Flash Lite TTS (Indonesian voice audio)            │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy
- **`src/App.tsx`**: LED fullscreen container managing stage state, audio nodes, turn logic, and keybindings.
- **`src/components/WaveformCanvas.tsx`**: Dedicated 60fps canvas wave generator with additive bioluminescent royal blue glow.
- **`src/components/StageVideoOverlay.tsx`**: Full-screen cinematic video playback component revealed on Turn 2.
- **`src/components/BackstageModal.tsx`**: Hidden backstage settings dialog (opened via `S` key or hidden touch point) with turn reset, mic sensitivity, audio test, and Vercel export guide.
- **`server.ts` & `src/server/geminiService.ts`**: Express backend providing `/api/voice-chat` with Gemini 3.8 Flash & TTS, ready for local dev and Vercel deployment with `vercel.json`.

### Verification Steps
1. Verify `compile_applet` succeeds without errors.
2. Confirm the display is 100% clean waveform only on a black gradient blue background.
3. Test Turn 1 Indonesian audio: *"Halo Bapak dan teman teman semua, ada yang bisa saya bantu?"*.
4. Test Turn 2 Indonesian audio: *"Baik, berikut videonya!"* and verify full-screen video overlay transition.
5. Verify hidden backstage panel (`S` key) operates seamlessly for stage technicians.
