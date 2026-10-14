import React from 'react';

interface QlolaLogoProps {
  className?: string;
  glow?: boolean;
  active?: boolean;
}

export const QlolaLogo: React.FC<QlolaLogoProps> = ({
  className = 'w-72 md:w-96 lg:w-[420px]',
  glow = true,
  active = false,
}) => {
  return (
    <div
      className={`relative flex flex-col items-center justify-center select-none transition-transform duration-700 ${
        active ? 'scale-[1.03]' : 'scale-100'
      } ${className}`}
    >
      {/* Ambient Sapphire Glow behind logo */}
      {glow && (
        <div
          className={`absolute inset-0 -inset-x-12 -inset-y-6 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
            active ? 'opacity-90 scale-110' : 'opacity-60 scale-100'
          }`}
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0, 87, 203, 0.55) 0%, rgba(0, 60, 160, 0.25) 50%, rgba(0, 0, 0, 0) 80%)',
          }}
        />
      )}

      {/* High-Precision SVG matching Qlola_by_BRI_2026.svg.webp */}
      <svg
        viewBox="0 0 540 215"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-[0_4px_30px_rgba(0,87,203,0.5)]"
      >
        <defs>
          <filter id="logoGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor="#0057CB" floodOpacity="0.4" />
          </filter>
        </defs>

        {/* 1. Iconic Squircle 'Q' with diagonal tail */}
        <g stroke="#0057CB" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round">
          {/* Rounded Squircle */}
          <rect x="22" y="20" width="118" height="118" rx="42" fill="none" />
          {/* Diagonal Tail exiting through bottom-right corner */}
          <line x1="84" y1="84" x2="148" y2="148" />
        </g>

        {/* 2. First 'l' with rightward curved foot (from uploaded logo) */}
        <path
          d="M 188 20 V 114 C 188 136 200 148 230 148"
          stroke="#0057CB"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 3. 'o' geometric circular loop */}
        <circle
          cx="298"
          cy="92"
          r="48"
          stroke="#0057CB"
          strokeWidth="24"
          fill="none"
        />

        {/* 4. Second 'l' with matching rightward curved foot */}
        <path
          d="M 388 20 V 114 C 388 136 400 148 430 148"
          stroke="#0057CB"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 5. 'a' with circular bowl and curved right stem */}
        <circle
          cx="472"
          cy="99"
          r="41"
          stroke="#0057CB"
          strokeWidth="23"
          fill="none"
        />
        <path
          d="M 513 58 V 126 C 513 140 522 148 528 148"
          stroke="#0057CB"
          strokeWidth="23"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* 6. 'by BRI' lockup on the bottom right */}
        <g fill="#0057CB">
          <text
            x="392"
            y="198"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontSize="34"
            fontWeight="700"
            letterSpacing="-0.5px"
          >
            by
          </text>
          <text
            x="442"
            y="198"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontSize="37"
            fontWeight="800"
            letterSpacing="0.5px"
          >
            BRI
          </text>
        </g>
      </svg>
    </div>
  );
};
