"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  angle: number;
  velocity: number;
  size: number;
  color: string;
}

interface Heart {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
}

export function Valentine() {
  const [noButtonPosition, setNoButtonPosition] = useState<Position>({ x: 65, y: 55 });
  const [escapeAttempts, setEscapeAttempts] = useState(0);
  const [hasExploded, setHasExploded] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [celebrationHearts, setCelebrationHearts] = useState<Heart[]>([]);
  const [showPoof, setShowPoof] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const lastEscapeTime = useRef(0);

  // Background floating hearts
  const [backgroundHearts] = useState<Heart[]>(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 20 + 10,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 4,
    }))
  );

  useEffect(() => {
    setMounted(true);
    // Detect mobile/touch device
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches || "ontouchstart" in window);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const escapeNoButton = useCallback((e?: React.TouchEvent | React.MouseEvent) => {
    if (hasExploded || escapeAttempts >= 3) return;

    // Debounce rapid escapes
    const now = Date.now();
    if (now - lastEscapeTime.current < 300) return;
    lastEscapeTime.current = now;

    // Prevent default on touch to stop the tap from registering
    if (e && "touches" in e) {
      e.preventDefault();
    }

    const newAttempts = escapeAttempts + 1;
    setEscapeAttempts(newAttempts);

    if (newAttempts >= 3) {
      // Trigger explosion sequence
      setIsShaking(true);
      setTimeout(() => {
        setIsShaking(false);
        setHasExploded(true);
        setShowPoof(true);

        // Create explosion particles
        const newParticles: Particle[] = Array.from({ length: 20 }, (_, i) => ({
          id: i,
          x: noButtonPosition.x,
          y: noButtonPosition.y,
          angle: (i / 20) * 360 + Math.random() * 30,
          velocity: Math.random() * 150 + 100,
          size: Math.random() * 10 + 5,
          color: ["#e11d48", "#f43f5e", "#fb7185", "#fda4af", "#fecdd3"][Math.floor(Math.random() * 5)],
        }));
        setParticles(newParticles);

        setTimeout(() => {
          setShowPoof(false);
          setParticles([]);
        }, 1000);
      }, 500);
      return;
    }

    // Calculate safe bounds (percentage-based with padding)
    // Keep button in the lower portion of screen, away from the Yes button
    const minX = 10;
    const maxX = 90;
    const minY = 45; // Below the Yes button area
    const maxY = 85;

    // Generate new position away from current position
    let newX: number;
    let newY: number;
    do {
      newX = Math.random() * (maxX - minX) + minX;
      newY = Math.random() * (maxY - minY) + minY;
    } while (
      Math.abs(newX - noButtonPosition.x) < 20 &&
      Math.abs(newY - noButtonPosition.y) < 20
    );

    setNoButtonPosition({ x: newX, y: newY });
  }, [escapeAttempts, hasExploded, noButtonPosition]);

  // Handle touch move for proximity detection on mobile
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (hasExploded || escapeAttempts >= 3 || !noButtonRef.current) return;

      const touch = e.touches[0];
      const buttonRect = noButtonRef.current.getBoundingClientRect();
      const buttonCenterX = buttonRect.left + buttonRect.width / 2;
      const buttonCenterY = buttonRect.top + buttonRect.height / 2;

      // Calculate distance from touch to button center
      const distance = Math.sqrt(
        Math.pow(touch.clientX - buttonCenterX, 2) + Math.pow(touch.clientY - buttonCenterY, 2)
      );

      // If finger is within 80px of button, escape
      if (distance < 80) {
        escapeNoButton();
      }
    },
    [escapeNoButton, hasExploded, escapeAttempts]
  );

  const handleYesClick = () => {
    setHasAccepted(true);

    // Create celebration hearts
    const hearts: Heart[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 110,
      size: Math.random() * 30 + 15,
      delay: Math.random() * 2,
      duration: Math.random() * 2 + 3,
    }));
    setCelebrationHearts(hearts);
  };

  if (!mounted) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative min-h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-cream via-blush to-rose-100"
      onTouchMove={handleTouchMove}
    >
      {/* Background floating hearts */}
      {backgroundHearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute pointer-events-none animate-float-heart opacity-20"
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            fontSize: `${heart.size}px`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
          }}
        >
          ❤️
        </div>
      ))}

      {/* Sparkle particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-gold rounded-full animate-sparkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center min-h-[100dvh] px-4 pt-[15vh] sm:pt-[20vh]">
        {!hasAccepted ? (
          <>
            {/* The Question */}
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-script text-rose-700 text-center mb-8 sm:mb-12 animate-fade-in drop-shadow-lg px-2">
              Mary, will you be my Valentine?
            </h1>

            {/* Yes Button - Fixed position at top of button area */}
            <button
              onClick={handleYesClick}
              className="px-8 sm:px-12 py-3 sm:py-4 text-lg sm:text-xl font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-lg shadow-rose-300/50 hover:shadow-xl hover:shadow-rose-400/50 active:scale-95 hover:scale-105 transition-all duration-300 animate-pulse-glow z-20"
            >
              Yes! 💕
            </button>

            {/* Escape attempt counter */}
            {escapeAttempts > 0 && !hasExploded && (
              <p className="mt-6 text-rose-400 text-sm animate-fade-in text-center">
                Nice try! ({3 - escapeAttempts} {3 - escapeAttempts === 1 ? "attempt" : "attempts"} remaining...)
              </p>
            )}

            {hasExploded && (
              <p className="mt-6 text-rose-500 text-base sm:text-lg font-medium animate-fade-in text-center px-4">
                Oops! Looks like &quot;No&quot; isn&apos;t an option anymore... 😏
              </p>
            )}

            {/* No Button - Absolute positioned, can move anywhere in lower portion */}
            {!hasExploded && (
              <button
                ref={noButtonRef}
                onMouseEnter={escapeNoButton}
                onTouchStart={escapeNoButton}
                className={`fixed px-5 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-rose-700 bg-white/90 border-2 border-rose-300 rounded-full shadow-md hover:bg-white active:bg-rose-50 transition-all duration-300 z-30 ${
                  isShaking ? "animate-shake" : ""
                }`}
                style={{
                  left: `${noButtonPosition.x}%`,
                  top: `${noButtonPosition.y}%`,
                  transform: "translate(-50%, -50%)",
                  transition: isShaking ? "none" : "left 0.3s ease-out, top 0.3s ease-out",
                  touchAction: "none", // Prevents browser handling of touch
                }}
              >
                No
              </button>
            )}

            {/* Explosion particles */}
            {particles.map((particle) => (
              <div
                key={particle.id}
                className="fixed rounded-full animate-explode pointer-events-none"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  "--angle": `${particle.angle}deg`,
                  "--velocity": `${particle.velocity}px`,
                } as React.CSSProperties}
              />
            ))}

            {/* Poof text */}
            {showPoof && (
              <div
                className="fixed text-xl sm:text-2xl font-bold text-rose-500 animate-poof pointer-events-none z-40"
                style={{
                  left: `${noButtonPosition.x}%`,
                  top: `${noButtonPosition.y}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                POOF! 💨
              </div>
            )}

            {/* Mobile hint */}
            {isMobile && escapeAttempts === 0 && !hasExploded && (
              <p className="fixed bottom-8 left-0 right-0 text-center text-rose-300 text-xs animate-pulse">
                Try tapping &quot;No&quot; if you dare...
              </p>
            )}
          </>
        ) : (
          /* Celebration state */
          <div className="text-center animate-fade-in px-4">
            <div className="text-5xl sm:text-6xl md:text-8xl mb-6 sm:mb-8 animate-bounce">
              💖
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-script text-rose-700 mb-4 sm:mb-6 drop-shadow-lg">
              I knew you&apos;d say yes!
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-rose-500 mb-3 sm:mb-4">
              You&apos;ve made me the happiest person ever xo
            </p>
          </div>
        )}
      </div>

      {/* Celebration hearts */}
      {celebrationHearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute pointer-events-none animate-confetti"
          style={{
            left: `${heart.x}%`,
            bottom: `-${heart.size}px`,
            fontSize: `${heart.size}px`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
          }}
        >
          {["❤️", "💕", "💖", "💗", "💓"][Math.floor(Math.random() * 5)]}
        </div>
      ))}
    </div>
  );
}
