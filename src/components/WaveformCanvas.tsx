import React, { useEffect, useRef } from 'react';
import { AssistantState } from '../types';

interface WaveformCanvasProps {
  analyser: AnalyserNode | null;
  state: AssistantState;
}

export const WaveformCanvas: React.FC<WaveformCanvasProps> = ({ analyser, state }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const smoothedLevelRef = useRef<number>(0.15);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    const dataArray = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const render = () => {
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      // 1. Calculate Audio Energy Level
      let currentLevel = 0.08; // Ambient baseline
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray);
        // Calculate average across speech-frequency bins (approx 100Hz - 3kHz)
        let sum = 0;
        const binLimit = Math.min(dataArray.length, 128);
        for (let i = 2; i < binLimit; i++) {
          sum += dataArray[i];
        }
        const avg = sum / (binLimit - 2);
        currentLevel = Math.max(0.08, avg / 255);
      }

      // Smooth the level transition for organic fluidity
      const smoothingFactor = state === 'speaking' || state === 'listening' ? 0.35 : 0.08;
      smoothedLevelRef.current += (currentLevel - smoothedLevelRef.current) * smoothingFactor;
      const energy = smoothedLevelRef.current;

      // Increment phase based on state and energy
      const speed =
        state === 'thinking'
          ? 0.06
          : state === 'speaking'
          ? 0.035 + energy * 0.03
          : state === 'listening'
          ? 0.028 + energy * 0.025
          : 0.015;

      phaseRef.current += speed;
      const phase = phaseRef.current;

      // 2. Clear canvas with pure black
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // 3. Render Deep Black-to-BRI Blue Ambient Radial Gradient Background
      const bgGrad = ctx.createRadialGradient(
        displayWidth * 0.5,
        displayHeight * 0.5,
        displayWidth * 0.05,
        displayWidth * 0.5,
        displayHeight * 0.5,
        displayWidth * 0.75
      );
      // BRI Signature Royal Blue (#00529C) core to deep midnight (#000e26) to pure black (#000000)
      bgGrad.addColorStop(0, state === 'thinking' ? '#002866' : '#001a47');
      bgGrad.addColorStop(0.35, '#00102e');
      bgGrad.addColorStop(0.7, '#00081a');
      bgGrad.addColorStop(1, '#000000');

      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Subtle atmospheric center glow
      const centerGlow = ctx.createRadialGradient(
        displayWidth * 0.5,
        displayHeight * 0.5,
        0,
        displayWidth * 0.5,
        displayHeight * 0.5,
        displayWidth * 0.45
      );
      const glowOpacity = state === 'speaking' ? 0.28 : state === 'listening' ? 0.22 : 0.12;
      centerGlow.addColorStop(0, `rgba(0, 82, 156, ${glowOpacity})`);
      centerGlow.addColorStop(0.5, `rgba(0, 102, 214, ${glowOpacity * 0.5})`);
      centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = centerGlow;
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // 4. Draw Multi-Layer Bioluminescent Fluid Waveform
      ctx.save();
      ctx.globalCompositeOperation = 'lighter'; // Additive blending for bioluminescent radiance

      const centerY = displayHeight * 0.5;
      const baseAmplitude = displayHeight * 0.075 * (0.4 + energy * 1.8);

      // Wave configurations tuned for BRI Royal Blue & Cyan bioluminescence
      const waveLayers = [
        {
          color: 'rgba(0, 82, 156, 0.45)', // Deep BRI Royal Blue
          lineWidth: 4,
          freq: 0.0035,
          ampMult: 0.65,
          phaseOffset: 0,
          speedMult: 1.0,
        },
        {
          color: 'rgba(0, 102, 204, 0.65)', // Bright Royal Blue
          lineWidth: 3.5,
          freq: 0.005,
          ampMult: 0.9,
          phaseOffset: Math.PI * 0.35,
          speedMult: 1.25,
        },
        {
          color: 'rgba(0, 140, 255, 0.85)', // Electric Sapphire
          lineWidth: 3,
          freq: 0.007,
          ampMult: 1.15,
          phaseOffset: Math.PI * 0.7,
          speedMult: 1.5,
        },
        {
          color: 'rgba(0, 229, 255, 0.95)', // Neon Cyan Crest (Core Luminescence)
          lineWidth: 2.5,
          freq: 0.009,
          ampMult: 1.3,
          phaseOffset: Math.PI * 1.05,
          speedMult: 1.8,
        },
        {
          color: 'rgba(210, 245, 255, 0.8)', // White-Ice highlight
          lineWidth: 1.5,
          freq: 0.012,
          ampMult: 0.75,
          phaseOffset: Math.PI * 1.4,
          speedMult: 2.1,
        },
      ];

      // Draw each fluid wave
      waveLayers.forEach((layer) => {
        ctx.beginPath();
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = layer.lineWidth;
        ctx.shadowBlur = 18;
        ctx.shadowColor = layer.color;

        const points: { x: number; y: number }[] = [];
        const step = displayWidth < 640 ? 5 : 8; // Keep narrow screens smooth without oversized wave segments

        for (let x = 0; x <= displayWidth; x += step) {
          // Windowing envelope function (smooth bell curve towards screen edges)
          const normX = x / displayWidth;
          const envelope = Math.sin(normX * Math.PI); // 0 at edges, 1 at center

          // Multi-harmonic sine equation
          const wavePhase = phase * layer.speedMult + layer.phaseOffset;
          const primarySine = Math.sin(x * layer.freq + wavePhase);
          const secondarySine = Math.sin(x * layer.freq * 2.1 - wavePhase * 0.8) * 0.45;
          const tertiarySine = Math.cos(x * layer.freq * 0.6 + wavePhase * 1.2) * 0.25;

          // Thinking state introduces slight orbital ripples
          const thinkingMod = state === 'thinking' ? Math.sin(phase * 4 + normX * 12) * 20 : 0;

          const y =
            centerY +
            (primarySine + secondarySine + tertiarySine) *
              baseAmplitude *
              layer.ampMult *
              envelope +
            thinkingMod * envelope;

          points.push({ x, y });
        }

        // Render smooth curve through points
        if (points.length > 0) {
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
          }
          if (points.length > 1) {
            ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);
          }
        }
        ctx.stroke();

        // Optional translucent fluid fill underneath the primary cyan layer
        if (layer.freq === 0.007) {
          ctx.save();
          const fillGrad = ctx.createLinearGradient(0, centerY - baseAmplitude, 0, centerY + baseAmplitude * 1.5);
          fillGrad.addColorStop(0, 'rgba(0, 102, 204, 0.12)');
          fillGrad.addColorStop(1, 'rgba(0, 20, 60, 0)');
          ctx.fillStyle = fillGrad;
          ctx.lineTo(displayWidth, displayHeight);
          ctx.lineTo(0, displayHeight);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      });

      // 5. Subtle ambient floating energy particles (representing AI neural presence)
      if (state === 'speaking' || state === 'listening' || state === 'thinking') {
        const particleCount = state === 'thinking' ? 24 : 16;
        for (let i = 0; i < particleCount; i++) {
          const pAngle = (phase * 1.5 + (i * Math.PI * 2) / particleCount) % (Math.PI * 2);
          const pRadius = 70 + Math.sin(phase * 2 + i) * 45 * (0.8 + energy * 1.5);
          const px = displayWidth * 0.5 + Math.cos(pAngle) * pRadius * 1.8;
          const py = centerY + Math.sin(pAngle) * pRadius * 0.6;

          ctx.beginPath();
          ctx.arc(px, py, 1.5 + energy * 2, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? 'rgba(0, 229, 255, 0.7)' : 'rgba(0, 115, 230, 0.6)';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#00E5FF';
          ctx.fill();
        }
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, state]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  );
};
