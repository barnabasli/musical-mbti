'use client';

import { motion } from 'framer-motion';
import { Scores } from '@/lib/types';
import { AXIS_META, AxisBounds, calculateType, getArchetype, getAxisResults } from '@/lib/scoring';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ResultsViewProps {
  scores: Scores;
  bounds: AxisBounds;
  onRetake: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ResultsView({ scores, bounds, onRetake }: ResultsViewProps) {
  const type        = calculateType(scores);
  const archetype   = getArchetype(type);
  const axisResults = getAxisResults(scores, bounds);
  const axisEntries = Object.values(AXIS_META);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="relative flex min-h-screen flex-col items-center justify-center bg-[#F3F5F8] px-6 py-16"
    >
      {/* ── Soft ambient glow ──────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5A98BE]/5 blur-[160px]" />
      </div>

      <div className="relative z-10 w-full max-w-xl">

        {/* ── Eyebrow ──────────────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.28em] text-[#6B8FAB]"
        >
          Your Musical Type
        </motion.p>

        {/* ── Four-letter type — each letter animates in separately ─────── */}
        <div className="mb-6 flex justify-center gap-3">
          {type.split('').map((letter, i) => {
            const meta = axisEntries[i];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32, scale: 0.75 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.35 + i * 0.14,
                  type: 'spring',
                  stiffness: 220,
                  damping: 18,
                }}
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-black md:h-20 md:w-20 md:text-4xl"
                style={{
                  backgroundColor: `${meta.color}18`,
                  color:            meta.color,
                  border:          `1.5px solid ${meta.color}45`,
                  boxShadow:       '0 2px 12px rgba(0,0,0,0.07)',
                }}
              >
                {letter}
              </motion.div>
            );
          })}
        </div>

        {/* ── Archetype name + description ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mb-8 text-center"
        >
          <h2 className="mb-2 text-2xl font-black text-[#1A2133]">{archetype.name}</h2>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-[#4E5F77]">
            {archetype.description}
          </p>
        </motion.div>

        {/* ── Axis breakdown card ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
          className="mb-8 rounded-2xl border border-[#E2E8EF] bg-white p-6"
          style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.05)' }}
        >
          <h3 className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-[#8B9BAD]">
            Profile Breakdown
          </h3>

          <div className="flex flex-col gap-6">
            {axisResults.map((result, i) => {
              const meta = AXIS_META[result.axis];

              /**
               * Bar visualisation — bidirectional fill from centre using dynamic bounds.
               *
               * result.percentage ranges from 50 (neutral) to 100 (max bound hit).
               * Subtracting 50 gives us the exact visual width (0% to 50%) for the UI.
               */
              const isPositive  = result.score >= 0;
              const fillPercent = Math.max(0, result.percentage - 50);

              return (
                <motion.div
                  key={result.axis}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.15 + i * 0.1 }}
                >
                  {/* Trait labels */}
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                    {/* Left = negative trait */}
                    <span style={{ color: !isPositive ? result.color : '#B8C4D0' }}>
                      {meta.negative.trait}
                    </span>

                    {/* Axis description */}
                    <span className="mx-2 text-center text-[10px] font-normal text-[#B8C4D0]">
                      {meta.description}
                    </span>

                    {/* Right = positive trait */}
                    <span style={{ color: isPositive ? result.color : '#B8C4D0' }}>
                      {meta.positive.trait}
                    </span>
                  </div>

                  {/* Track */}
                  <div className="relative h-1.5 overflow-hidden rounded-full bg-[#E8ECF2]">
                    {/* Centre marker */}
                    <div className="absolute inset-y-0 left-1/2 w-px -translate-x-px bg-[#C8D4DD]" />

                    {/* Fill — grows from centre towards the dominant side */}
                    <motion.div
                      className="absolute top-0 h-full rounded-full"
                      style={{
                        backgroundColor: result.color,
                        left:  isPositive ? '50%'  : 'auto',
                        right: isPositive ? 'auto' : '50%',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${fillPercent}%` }}
                      transition={{
                        delay:    1.25 + i * 0.1,
                        duration: 0.7,
                        ease:     [0.4, 0, 0.2, 1],
                      }}
                    />
                  </div>

                  {/* Letter result beneath bar */}
                  <div className="mt-1.5 flex justify-between text-[10px] text-[#B8C4D0]">
                    <span>{meta.negative.letter}</span>
                    <span
                      className="font-bold"
                      style={{ color: result.color }}
                    >
                      {result.letter} — {result.trait}
                    </span>
                    <span>{meta.positive.letter}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* ── Actions ───────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="flex justify-center"
        >
          <button
            onClick={onRetake}
            className="rounded-full border border-[#DDE3EC] bg-white px-7 py-2.5 text-sm font-medium text-[#4E5F77] shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all duration-200 hover:border-[#C0CBDA] hover:text-[#1A2133] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
          >
            ↺ Retake Quiz
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
}