import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OrderLaLogo } from './OrderLaLogo';
import { Zap } from 'lucide-react';
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
    // Default initial location: on the right side in front of the Demand sheet, above mobile bottom nav
    const defaultX = typeof window !== 'undefined' ? Math.max(window.innerWidth - 90, 20) : 300;
    const defaultY = typeof window !== 'undefined' ? Math.max(window.innerHeight - 180, 100) : 400;
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

  // Keep within screen boundaries on resize (above mobile bottom bar)
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        const btnSize = 64;
        const bottomNavOffset = window.innerWidth < 768 ? 85 : 20;
        const maxX = Math.max(window.innerWidth - btnSize - 16, 16);
        const maxY = Math.max(window.innerHeight - btnSize - bottomNavOffset, 16);
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
        isDragging ? 'cursor-grabbing scale-105' : 'cursor-grab'
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
          <span className="absolute -inset-1 rounded-full bg-[var(--accent-blue)]/25 animate-ping opacity-75 pointer-events-none" />
        )}

        {/* Electric Icon on top right point of circle */}
        <div className="absolute -top-1 -right-0.5 sm:-top-1 sm:-right-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-md border-2 border-[var(--bg-canvas)] z-10 pointer-events-none">
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-slate-950 text-slate-950" />
        </div>

        {/* Circular Tactile Soft UI Button with Blue Circle Brand Logo */}
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full neu-raised flex items-center justify-center bg-[var(--bg-canvas)] border-2 border-[var(--accent-blue)]/40 relative shadow-xl hover:border-[var(--accent-blue)] transition-colors">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full neu-inset-sm flex items-center justify-center overflow-hidden bg-[var(--accent-blue)]/5">
            <OrderLaLogo variant="circle" size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
