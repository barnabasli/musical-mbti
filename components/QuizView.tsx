'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AnswerOption, BinaryQuestion, LikertOption, LikertQuestion, LikertScale, Question, ScoreAdjustment } from '@/lib/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface QuizViewProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (scores: ScoreAdjustment[]) => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export function QuizView({ question, questionIndex, totalQuestions, onAnswer }: QuizViewProps) {
  const [progressPercent, setProgressPercent] = useState((questionIndex / totalQuestions) * 100);
  const [coverExpanded, setCoverExpanded] = useState(false);

  function handleAnswer(scores: ScoreAdjustment[]) {
    const next = ((questionIndex + 1) / totalQuestions) * 100;
    setProgressPercent(next);
    setTimeout(() => onAnswer(scores), 480);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="grain flex min-h-screen flex-col"
      style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #f7f5f2 100%)' }}
    >
      {/* ── Cover lightbox ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {coverExpanded && question.coverSrc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm"
            onClick={() => setCoverExpanded(false)}
          >
            <motion.img
              src={question.coverSrc}
              alt={question.audioLabel ?? 'Album cover'}
              initial={{ scale: 0.88, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.88, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Wordmark + counter ──────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 sm:px-12">
        <span className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-400">
          Musical MBTI
        </span>
        <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-neutral-300">
          {questionIndex + 1} / {totalQuestions}
        </span>
      </header>

      {/* ── Progress bar ────────────────────────────────────────────────── */}
      <div className="px-8 sm:px-12">
        <div className="mx-auto max-w-2xl">
          <div className="h-px w-full bg-neutral-200">
            <motion.div
              className="h-full bg-neutral-400"
              initial={{ width: '0%' }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            />
          </div>
        </div>
      </div>

      {/* ── Question card ─────────────────────────────────────────────── */}
      <div className="flex flex-1 items-center justify-center px-8 py-16 sm:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-2xl"
          >
            {/* Question body */}
            <p className="mb-10 text-[clamp(1.25rem,3vw,1.75rem)] font-light leading-[1.35] tracking-[-0.01em] text-neutral-900">
              {question.questionText}
            </p>

            {/* Audio player(s) */}
            {question.audioSrc && (
              <div className="mb-10 flex flex-col gap-4">
                <AudioPlayer
                  src={question.audioSrc}
                  label={question.audioLabel}
                  coverSrc={question.coverSrc}
                  onExpandCover={question.coverSrc ? () => setCoverExpanded(true) : undefined}
                  accentColor="#C4924A"
                  key={`${question.id}-1`}
                />
                {question.audioSrc2 && (
                  <AudioPlayer
                    src={question.audioSrc2}
                    label={question.audioLabel2}
                    accentColor="#5A98BE"
                    key={`${question.id}-2`}
                  />
                )}
              </div>
            )}

            {/* Answer options */}
            {question.format === 'likert' ? (
              <LikertScaleGroup question={question} onAnswer={handleAnswer} />
            ) : (
              <MultiChoiceGroup question={question} onAnswer={handleAnswer} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Audio player ──────────────────────────────────────────────────────────────

interface AudioPlayerProps {
  src: string;
  label?: string;
  coverSrc?: string;
  onExpandCover?: () => void;
  accentColor?: string;
}

function AudioPlayer({
  src,
  label,
  coverSrc,
  onExpandCover,
  accentColor = '#5A98BE',
}: AudioPlayerProps) {
  const audioRef                    = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying]       = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration]     = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime   = () => setCurrentTime(el.currentTime);
    const onLoaded = () => setDuration(el.duration);
    const onEnded  = () => setPlaying(false);
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('ended', onEnded);
    };
  }, []);

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) { el.pause(); } else { el.play(); }
    setPlaying(!playing);
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Number(e.target.value);
    setCurrentTime(el.currentTime);
  }

  function fmt(s: number) {
    if (!isFinite(s)) return '0:00';
    const m   = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div
      className="overflow-hidden rounded-xl"
      style={{
        background:           'rgba(255, 255, 255, 0.75)',
        backdropFilter:       'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border:               '1px solid rgba(255, 255, 255, 0.9)',
        boxShadow:            '0 1px 4px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.05)',
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* ── Album cover ─────────────────────────────────────────────────── */}
      {coverSrc && (
        <button
          onClick={onExpandCover}
          className="group relative block w-full"
          aria-label="Expand album cover"
          style={{ background: '#F0EEE9' }}
        >
          <div className="mx-auto aspect-square max-w-[300px] py-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverSrc}
              alt={label ?? 'Album cover'}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/6">
            <div
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.15em] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{ background: 'rgba(255,255,255,0.9)', color: '#6B7280', backdropFilter: 'blur(8px)' }}
            >
              View full size
            </div>
          </div>
        </button>
      )}

      {/* ── Controls ────────────────────────────────────────────────────── */}
      <div className="px-5 pb-5 pt-4">
        {label && (
          <p
            className="mb-4 text-[10px] font-medium uppercase tracking-[0.25em]"
            style={{ color: accentColor }}
          >
            {label}
          </p>
        )}

        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={seek}
          className="mb-3 h-px w-full cursor-pointer appearance-none rounded-full bg-neutral-200"
          style={{ accentColor }}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
          >
            {playing ? (
              <svg width="9" height="11" viewBox="0 0 10 12" fill="currentColor">
                <rect x="0" y="0" width="3.5" height="12" rx="1" />
                <rect x="6.5" y="0" width="3.5" height="12" rx="1" />
              </svg>
            ) : (
              <svg width="9" height="11" viewBox="0 0 10 12" fill="currentColor">
                <path d="M0 0l10 6-10 6V0z" />
              </svg>
            )}
          </button>

          <span className="tabular-nums text-[10px] text-neutral-400">{fmt(currentTime)}</span>
          <div className="flex-1" />
          <span className="tabular-nums text-[10px] text-neutral-400">{fmt(duration)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Likert scale group (handles optional second scale) ────────────────────────

function LikertScaleGroup({
  question,
  onAnswer,
}: {
  question: LikertQuestion;
  onAnswer: (scores: ScoreAdjustment[]) => void;
}) {
  const [firstScores, setFirstScores] = useState<ScoreAdjustment[] | null>(null);

  function handleFirst(scores: ScoreAdjustment[]) {
    if (!question.secondScale) {
      onAnswer(scores);
    } else {
      setFirstScores(scores);
    }
  }

  function handleSecond(scores: ScoreAdjustment[]) {
    onAnswer([...(firstScores ?? []), ...scores]);
  }

  return (
    <AnimatePresence mode="wait">
      {firstScores === null ? (
        <motion.div
          key="first"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <SingleScale
            leftLabel={question.leftLabel}
            rightLabel={question.rightLabel}
            options={question.options}
            onSelect={handleFirst}
          />
        </motion.div>
      ) : (
        <motion.div
          key="second"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <SingleScale
            leftLabel={question.secondScale!.leftLabel}
            rightLabel={question.secondScale!.rightLabel}
            options={question.secondScale!.options}
            onSelect={handleSecond}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Single five-point scale ───────────────────────────────────────────────────

function SingleScale({
  leftLabel,
  rightLabel,
  options,
  onSelect,
}: {
  leftLabel: string;
  rightLabel: string;
  options: LikertScale['options'];
  onSelect: (scores: ScoreAdjustment[]) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  function handleClick(opt: LikertOption) {
    setSelected(opt.value);
    onSelect(opt.scores);
  }

  return (
    <div>
      {/* Pole labels */}
      <div className="mb-6 flex justify-between">
        <span className="max-w-[42%] text-sm font-light leading-snug text-neutral-500">
          {leftLabel}
        </span>
        <span className="max-w-[42%] text-right text-sm font-light leading-snug text-neutral-500">
          {rightLabel}
        </span>
      </div>

      {/* Five-point buttons */}
      <div className="grid grid-cols-5 gap-2">
        {options.map((opt, i) => {
          const isSelected = selected === opt.value;
          return (
            <motion.button
              key={opt.value}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 + 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleClick(opt)}
              className="group flex flex-col items-center gap-2"
            >
              <span
                className={
                  isSelected
                    ? 'flex h-9 w-9 items-center justify-center rounded-full text-sm font-light transition-all duration-200 bg-neutral-900 text-white'
                    : 'flex h-9 w-9 items-center justify-center rounded-full border border-neutral-200 text-sm font-light text-neutral-400 transition-all duration-200 hover:border-neutral-400 hover:text-neutral-600'
                }
              >
                {opt.value}
              </span>
              {opt.label && (
                <span className="text-center text-[10px] leading-tight text-neutral-300 transition-colors group-hover:text-neutral-500">
                  {opt.label}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Multi-choice group (handles optional cascade) ─────────────────────────────


function MultiChoiceGroup({
  question,
  onAnswer,
}: {
  question: BinaryQuestion;
  onAnswer: (scores: ScoreAdjustment[]) => void;
}) {
  const [firstScores, setFirstScores] = useState<ScoreAdjustment[] | null>(null);
  const [cascadeAnswers, setCascadeAnswers] = useState<AnswerOption[] | null>(null);
  const [showSecond, setShowSecond] = useState(false);

  function handlePrimary(answer: AnswerOption) {
    if (answer.secondAnswers) {
      setFirstScores(answer.scores);
      setCascadeAnswers(answer.secondAnswers);
    } else if (question.secondQuestion) {
      setFirstScores(answer.scores);
      setShowSecond(true);
    } else {
      onAnswer(answer.scores);
    }
  }

  function handleSecondary(scores: ScoreAdjustment[]) {
    onAnswer([...(firstScores ?? []), ...scores]);
  }

  // ── Determine which panel to show ───────────────────────────────────────────
  let activeKey: string;
  let activeContent: React.ReactNode;

  if (cascadeAnswers) {
    activeKey = 'cascade';
    activeContent = cascadeAnswers.map((answer, i) => (
      <AnswerButton
        key={answer.label}
        answer={answer}
        index={i}
        onClick={() => handleSecondary(answer.scores)}
        isLast={i === cascadeAnswers.length - 1}
      />
    ));
  } else if (showSecond && question.secondQuestion) {
    activeKey = 'second';
    activeContent = (
      <>
        <p className="mb-8 text-[clamp(1.1rem,2.5vw,1.4rem)] font-light leading-[1.4] tracking-[-0.01em] text-neutral-900">
          {question.secondQuestion.questionText}
        </p>
        {question.secondQuestion.answers.map((answer, i) => (
          <AnswerButton
            key={answer.label}
            answer={answer}
            index={i}
            onClick={() => handleSecondary(answer.scores)}
            isLast={i === question.secondQuestion!.answers.length - 1}
          />
        ))}
      </>
    );
  } else {
    activeKey = 'primary';
    activeContent = question.answers.map((answer, i) => (
      <AnswerButton
        key={answer.label}
        answer={answer}
        index={i}
        onClick={() => handlePrimary(answer)}
        isLast={i === question.answers.length - 1}
      />
    ));
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeKey}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      >
        {activeContent}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Answer button ─────────────────────────────────────────────────────────────

interface AnswerButtonProps {
  answer: AnswerOption;
  index: number;
  isLast?: boolean;
  onClick: () => void;
}

function AnswerButton({ answer, index, isLast = false, onClick }: AnswerButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 + 0.12 }}
      onClick={onClick}
      className={`group flex w-full items-baseline gap-5 border-t border-neutral-200 py-4 text-left transition-colors duration-200 hover:border-neutral-300 ${isLast ? 'border-b' : ''}`}
    >
      {/* Letter label */}
      <span
        className="shrink-0 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-300 transition-colors duration-200 group-hover:text-neutral-500"

      >
        {answer.label}
      </span>

      {/* Answer text */}
      <span className="flex-1 text-[15px] font-light leading-relaxed text-neutral-800 transition-colors duration-200 group-hover:text-neutral-500">
        {answer.text}
      </span>

      {/* Arrow */}
      <span className="shrink-0 self-center text-[13px] text-neutral-200 transition-all duration-300 group-hover:translate-x-1 group-hover:text-neutral-400">
        →
      </span>
    </motion.button>
  );
}
