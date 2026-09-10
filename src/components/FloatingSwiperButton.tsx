import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OrderLaLogo } from './OrderLaLogo';
import { Zap, Move } from 'lucide-react';
import { Language } from '../types';

interface FloatingSwiperButtonProps {
  onOpenSwiper: () => void;
  language: Language;
}

const STORAGE_KEY = 'orderla_floating_swiper_pos_v1';

export const FloatingSwiperButton: React.FC<FloatingSwiperButtonProps> = ({
  onOpenSwiper,
  language
}) => {
  const isUrdu = language === 'ur';

  // Position state (pixels from top-left)
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {
      /* ignore fallback */
    }
    // Default initial location: on the right side in front of the Demand sheet
    const defaultX = typeof window !== 'undefined' ? Math.max(window.innerWidth - 90, 20) : 300;
    const defaultY = typeof window !== 'undefined' ? Math.max(window.innerHeight - 150, 100) : 400;
    return { x: defaultX, y: defaultY };
  });

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialPosX: number;
    initialPosY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialPosX: 0,
    initialPosY: 0,
    hasMoved: false
  });

  const buttonRef = useRef<HTMLDivElement>(null);

  // Keep within screen boundaries on resize
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const btnSize = 64;
        const maxX = Math.max(window.innerWidth - btnSize - 16, 16);
        const maxY = Math.max(window.innerHeight - btnSize - 16, 16);
        const clampedX = Math.min(Math.max(prev.x, 16), maxX);
        const clampedY = Math.min(Math.max(prev.y, 16), maxY);
        return { x: clampedX, y: clampedY };
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse / Touch drag handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only left click or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPosX: position.x,
      initialPosY: position.y,
      hasMoved: false
    };

    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStartRef.current.startX;
    const deltaY = e.clientY - dragStartRef.current.startY;
    const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (dist > 5) {
      dragStartRef.current.hasMoved = true;
    }

    const btnSize = 64;
    const maxX = Math.max(window.innerWidth - btnSize - 12, 12);
    const maxY = Math.max(window.innerHeight - btnSize - 12, 12);

    const newX = Math.min(
      Math.max(dragStartRef.current.initialPosX + deltaX, 12),
      maxX
    );
    const newY = Math.min(
      Math.max(dragStartRef.current.initialPosY + deltaY, 12),
      maxY
    );

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);

    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }

    // Save final position
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    } catch {
      /* ignore */
    }

    // If it was a click without movement, trigger open
    if (!dragStartRef.current.hasMoved) {
      onOpenSwiper();
    }
  };

  return (
    <div
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none'
      }}
      className={`fixed top-0 left-0 z-40 select-none transition-shadow duration-150 ${
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab hover:scale-105 active:scale-95'
      }`}
      title={
        isUrdu
          ? '⚡ ریپڈ ڈیمانڈ سوائپر (دبا کر رکھیں اور کہیں بھی منتقل کریں)'
          : '⚡ Rapid Demand Swiper (Press & hold to drag anywhere)'
      }
    >
      {/* Outer Pulse Indicator when idle */}
      <div className="relative group">
        {!isDragging && (
          <span className="absolute -inset-1 rounded-full bg-amber-500/20 animate-ping opacity-75 pointer-events-none" />
        )}

        {/* Circular Tactile Soft UI Button */}
        <div className="w-16 h-16 rounded-full neu-raised flex flex-col items-center justify-center bg-[var(--bg-canvas)] border-2 border-[var(--accent-blue)]/40 relative shadow-xl">
          {/* Logo Badge */}
          <div className="w-10 h-10 rounded-full neu-inset-sm flex items-center justify-center">
            <OrderLaLogo variant="icon" size="sm" />
          </div>

          {/* Tiny Drag Handle Cue */}
          <div className="absolute -top-1 right-2 bg-amber-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-xs">
            ⚡
          </div>

          {/* Label Badge underneath */}
          <div className="absolute -bottom-2.5 px-2 py-0.5 rounded-full bg-[var(--bg-canvas)] neu-raised text-[10px] font-black text-amber-600 dark:text-amber-400 whitespace-nowrap border border-amber-500/30">
            {isUrdu ? 'سوائپر' : 'Swiper'}
          </div>
        </div>

        {/* Floating Tooltip hint on hover */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center pointer-events-none whitespace-nowrap z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2.5 py-1 rounded-xl bg-slate-900/90 text-white text-[11px] font-bold shadow-lg flex items-center gap-1.5">
            <Move className="w-3 h-3 text-amber-400" />
            <span>
              {isUrdu
                ? 'کلک کریں یا پکڑ کر کہیں بھی رکھیں'
                : 'Click or drag anywhere on screen'}
            </span>
          </div>
          <div className="w-2 h-2 bg-slate-900/90 rotate-45 -mt-1" />
        </div>
      </div>
    </div>
  );
};
