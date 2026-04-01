"use client";

import { useEffect, useRef } from "react";

/**
 * Minimal CSS-only confetti burst that fires once on mount.
 * Used on the SOP detail page when arriving from a fresh creation.
 */
export function ConfettiCelebration() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const colors = ["#C8861A", "#3D9960", "#4A90D9", "#E8674A", "#A855F7"];
    const count = 48;

    const particles = Array.from({ length: count }, (_, i) => {
      const el = document.createElement("div");
      const color = colors[i % colors.length];
      const size = Math.random() * 8 + 4;
      const x = Math.random() * 100;
      const delay = Math.random() * 0.5;
      const duration = Math.random() * 1.5 + 1;
      const rotation = Math.random() * 720 - 360;
      const animName = `confetti-fall-${i}`;

      el.style.cssText = `
        position: absolute;
        left: ${x}%;
        top: 0;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        opacity: 1;
        transform: translateY(0) rotate(0deg);
        animation: ${animName} ${duration}s ease-in ${delay}s forwards;
      `;

      el.setAttribute("aria-hidden", "true");
      container.appendChild(el);
      return { el, animName, rotation };
    });

    const style = document.createElement("style");
    style.textContent = particles
      .map(
        ({ animName, rotation }) => `
          @keyframes ${animName} {
            to {
              transform: translateY(120px) rotate(${rotation}deg);
              opacity: 0;
            }
          }
        `,
      )
      .join("\n");
    document.head.appendChild(style);

    const timeout = window.setTimeout(() => {
      particles.forEach((p) => p.el.remove());
      style.remove();
    }, 2500);

    return () => {
      window.clearTimeout(timeout);
      particles.forEach((p) => p.el.remove());
      style.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden z-50"
    />
  );
}
