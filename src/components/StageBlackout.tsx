import React, { useEffect } from 'react';

interface StageBlackoutProps {
  isActive: boolean;
  onDismiss: () => void;
}

export const StageBlackout: React.FC<StageBlackoutProps> = ({ isActive, onDismiss }) => {
  useEffect(() => {
    if (isActive) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
          onDismiss();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, onDismiss]);

  return (
    <div
      className={`fixed inset-0 z-40 bg-black transition-opacity duration-[1500ms] ease-in-out select-none ${
        isActive ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onDismiss}
      title="Layar hitam (Klik atau tekan Spasi/Esc untuk kembali ke gelombang)"
    />
  );
};
