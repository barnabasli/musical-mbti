'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface LandingViewProps {
  onStart: () => void;
}

// ── Collage image — self-contained hover state so z-index is never animated ──

interface CollageImageProps {
  src: string;
  sizes: string;
  slideFrom: { x: number; y: number };
  rotation: number;
  delay: number;
  baseZ: number;
  style: React.CSSProperties;
}

function CollageImage({ src, sizes, slideFrom, rotation, delay, baseZ, style }: CollageImageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: slideFrom.x, y: slideFrom.y, rotate: rotation }}
      animate={{ opacity: 1, x: 0, y: 0, rotate: rotation }}
      transition={{
        opacity: { delay, duration: 0.75, ease: [0.22, 1, 0.36, 1] },
        x:       { delay, duration: 0.75, ease: [0.22, 1, 0.36, 1] },
        y:       { delay, duration: 0.75, ease: [0.22, 1, 0.36, 1] },
        rotate:  { delay, duration: 0.75, ease: [0.22, 1, 0.36, 1] },
      }}
      className="absolute"
      style={{ ...style, zIndex: baseZ }}
    >
      <div
        className="relative aspect-[4/5] w-full overflow-visible"
        style={{
          boxShadow: '0 2px 4px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.08), 0 20px 48px rgba(0,0,0,0.11)',
          borderRadius: '1px',
        }}
      >
        <div className="relative h-full w-full overflow-hidden" style={{ borderRadius: '1px' }}>
          <Image src={src} alt="" fill className="object-cover" sizes={sizes} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Landing view ──────────────────────────────────────────────────────────────

export function LandingView({ onStart }: LandingViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="grain flex min-h-screen flex-col"
      style={{ background: 'linear-gradient(160deg, #FDFBF7 0%, #F4F0E8 100%)' }}
    >
      {/* ── Wordmark ───────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative z-10 flex items-center px-8 py-6 sm:px-12"
      >
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-400">
          Musical MBTI
        </span>
      </motion.header>

      {/* ── Body: left content + right collage ─────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — text */}
        <div className="relative z-10 flex flex-1 flex-col items-start justify-center px-8 pb-16 pt-4 sm:px-12 md:px-20">
          <div className="max-w-sm">

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mb-10 text-[clamp(2.6rem,6vw,5rem)] font-light leading-[1.05] tracking-[-0.02em] text-neutral-900"
            >
              How do you hear<br />
              music?
            </motion.h1>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              onClick={onStart}
              className="group flex items-center gap-2 border-b border-neutral-900 pb-0.5 text-base font-medium text-neutral-900 transition-opacity hover:opacity-50"
            >
              <span>Begin</span>
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
            </motion.button>

          </div>
        </div>

        {/* Right — collage */}
        <div className="relative hidden overflow-hidden lg:block lg:w-[52%]">

          <CollageImage
            src="/covers/landing1.jpg"
            sizes="30vw"
            slideFrom={{ x: 60, y: 40 }}
            rotation={-5}
            delay={0.35}
            baseZ={1}
            style={{ top: '8%', left: '14%', width: '54%' }}
          />

          <CollageImage
            src="/covers/landing2.jpg"
            sizes="25vw"
            slideFrom={{ x: -50, y: 50 }}
            rotation={6}
            delay={0.5}
            baseZ={2}
            style={{ top: '34%', left: '36%', width: '46%' }}
          />

          <CollageImage
            src="/covers/landing3.jpg"
            sizes="25vw"
            slideFrom={{ x: 40, y: 60 }}
            rotation={-2}
            delay={0.65}
            baseZ={3}
            style={{ top: '55%', left: '6%', width: '44%' }}
          />

        </div>

      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="relative z-10 px-8 py-6 sm:px-12"
      >
        <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-300">
          ~3 minutes
        </p>
      </motion.footer>
    </motion.div>
  );
}
