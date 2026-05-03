'use client';

import { useState, useRef, useCallback } from 'react';
import { Check, X } from 'lucide-react';

const SWIPE_THRESHOLD = 80;

interface SwipeCardProps {
  onSwipe: (direction: 'left' | 'right') => void;
  children: React.ReactNode;
  /** 0 = top of stack */
  stackIndex: number;
}

export function SwipeCard({ onSwipe, children, stackIndex }: SwipeCardProps) {
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [flyOut, setFlyOut] = useState<'left' | 'right' | null>(null);
  const startRef = useRef({ x: 0, y: 0, t: 0 });
  const lastRef = useRef({ x: 0, t: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const isTop = stackIndex === 0;

  const triggerSwipe = useCallback(
    (dir: 'left' | 'right') => {
      setFlyOut(dir);
      setTimeout(() => {
        onSwipe(dir);
        setFlyOut(null);
        setDrag({ x: 0, y: 0 });
      }, 340);
    },
    [onSwipe]
  );

  function onPointerDown(e: React.PointerEvent) {
    if (!isTop || flyOut) return;
    e.preventDefault();
    setDragging(true);
    const now = Date.now();
    startRef.current = { x: e.clientX, y: e.clientY, t: now };
    lastRef.current = { x: e.clientX, t: now };
    cardRef.current?.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    lastRef.current = { x: e.clientX, t: Date.now() };
    setDrag({ x: e.clientX - startRef.current.x, y: e.clientY - startRef.current.y });
  }

  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    const dt = Math.max(1, Date.now() - startRef.current.t);
    const velocity = (lastRef.current.x - startRef.current.x) / dt;
    if (Math.abs(drag.x) > SWIPE_THRESHOLD || Math.abs(velocity) > 0.4) {
      triggerSwipe(drag.x > 0 ? 'right' : 'left');
    } else {
      setDrag({ x: 0, y: 0 });
    }
  }

  const scale = 1 - stackIndex * 0.04;
  const offsetY = stackIndex * 10;
  const rotation = dragging ? drag.x * 0.07 : 0;
  const likeAlpha = Math.min(1, Math.max(0, drag.x / 80));
  const nopeAlpha = Math.min(1, Math.max(0, -drag.x / 80));

  let transform: string;
  if (flyOut === 'right') transform = `translate(130vw, ${drag.y}px) rotate(25deg)`;
  else if (flyOut === 'left') transform = `translate(-130vw, ${drag.y}px) rotate(-25deg)`;
  else if (isTop) transform = `translate(${drag.x}px, ${drag.y}px) rotate(${rotation}deg)`;
  else transform = `translateY(${offsetY}px) scale(${scale})`;

  const transition = dragging
    ? 'none'
    : flyOut
    ? 'transform 0.34s cubic-bezier(0.5,0,1,0.5)'
    : 'transform 0.4s cubic-bezier(0.175,0.885,0.32,1.275)';

  return (
    <div
      ref={cardRef}
      className="absolute inset-0"
      style={{ transform, transition, zIndex: 30 - stackIndex, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {isTop && (
        <>
          <div
            className="absolute top-6 left-5 z-10 flex items-center gap-1 border-4 border-green-400 text-green-400 text-lg font-black px-3 py-1 rounded-lg pointer-events-none"
            style={{ opacity: likeAlpha, transform: 'rotate(-18deg)' }}
          >
            <Check size={18} strokeWidth={3} /> LIKE
          </div>
          <div
            className="absolute top-6 right-5 z-10 flex items-center gap-1 border-4 border-red-400 text-red-400 text-lg font-black px-3 py-1 rounded-lg pointer-events-none"
            style={{ opacity: nopeAlpha, transform: 'rotate(18deg)' }}
          >
            NOPE <X size={18} strokeWidth={3} />
          </div>
        </>
      )}
      {children}
    </div>
  );
}
