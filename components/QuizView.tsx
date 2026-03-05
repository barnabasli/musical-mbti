'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AnswerOption, BinaryQuestion, LikertOption, LikertQuestion, LikertScale, MultiselectQuestion, Question, ScoreAdjustment } from '@/lib/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AnswerInfo {
  label: string;
  text: string;
}

interface QuizViewProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (scores: ScoreAdjustment[], info: AnswerInfo) => void;
}

// ── Main component ────────────────────────────────────────────────────────────

export function QuizView({ question, questionIndex, totalQuestions, onAnswer }: QuizViewProps) {
  const [progressPercent, setProgressPercent] = useState(((questionIndex + 1) / totalQuestions) * 100);
  const [coverExpanded, setCoverExpanded] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  // Track if animations are finished to prevent early clicks
  const [isInteractable, setIsInteractable] = useState(false);

  const isCinematic = !!(question.cinematicVideoSrc || question.cinematicImageSrc);

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { setIsAudioPlaying(false); }, [question.id]);
  
  // Disable interactions on question change, re-enable after 700ms
  useEffect(() => {
    setIsInteractable(false);
    const timer = setTimeout(() => setIsInteractable(true), 700);
    return () => clearTimeout(timer);
  }, [question.id]);

  function handleAnswer(scores: ScoreAdjustment[], info: AnswerInfo) {
    setIsInteractable(false);
    const next = ((questionIndex + 1) / totalQuestions) * 100;
    setProgressPercent(next);
    setTimeout(() => onAnswer(scores, info), 480);
  }

  return (
    <>
      {/* ── Main QuizView shell ──────────────────────────────────────────── */}
      <motion.div
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="grain flex min-h-screen flex-col"
        style={{ zIndex: 20, position: 'relative' }}
      >
        {/* Entry fade overlay */}
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{ position: 'fixed', inset: 0, zIndex: 999, background: '#fff', pointerEvents: 'none' }}
        />
        
        {/* White background overlay */}
        <motion.div
          initial={{ opacity: isCinematic ? 0 : 1 }}
          animate={{ opacity: isCinematic ? 0 : 1 }}
          transition={{ duration: 0.55, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background: 'linear-gradient(to bottom, #ffffff 0%, #f7f5f2 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* ── UI content ─────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', flex: 1 }}>

          {/* Cover lightbox */}
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

          {/* Wordmark + counter */}
          <header className="flex items-center justify-between px-8 py-6 sm:px-12">
            <motion.span
              className="text-[10px] font-medium uppercase tracking-[0.3em]"
              animate={{ 
                color: isCinematic ? 'rgba(255, 255, 255, 0.45)' : 'rgba(163, 163, 163, 1)' 
              }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            >
              Musical MBTI
            </motion.span>
            <motion.span
              className="text-[10px] font-medium uppercase tracking-[0.25em]"
              animate={{ 
                color: isCinematic ? 'rgba(255, 255, 255, 0.3)' : 'rgba(212, 212, 212, 1)' 
              }}
              transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            >
              {questionIndex + 1} / {totalQuestions}
            </motion.span>
          </header>

          {/* Progress bar */}
          <div className="px-8 sm:px-12">
            <div className="mx-auto max-w-2xl">
              <motion.div
                className="h-px w-full"
                animate={{ 
                  backgroundColor: isCinematic ? 'rgba(255, 255, 255, 0.15)' : 'rgba(229, 229, 229, 1)' 
                }}
                transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
              >
                <motion.div
                  className="h-full"
                  initial={{ width: '0%' }}
                  animate={{ 
                    width: `${progressPercent}%`,
                    backgroundColor: isCinematic ? 'rgba(255, 255, 255, 0.5)' : 'rgba(163, 163, 163, 1)'
                  }}
                  transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                />
              </motion.div>
            </div>
          </div>

          {/* Question card */}
          <div className="flex flex-1 items-center justify-center px-8 py-8 sm:px-12 sm:py-16">
            <AnimatePresence mode="wait">
              <motion.div
                key={question.id}
                initial={isCinematic ? { x: 40 } : { opacity: 0, x: 40 }}
                animate={isCinematic ? { x: 0 } : { opacity: 1, x: 0 }}
                exit={isCinematic ? { x: -40 } : { opacity: 0, x: -40 }}
                transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                className="w-full max-w-2xl"
              >
                {/* Question body */}
                <motion.p
                  initial={{ opacity: isCinematic ? 0 : 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: isCinematic ? 0 : 1 }}
                  transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                  className="mb-6 sm:mb-10 text-[clamp(1.25rem,3vw,1.75rem)] font-light leading-[1.35] tracking-[-0.01em]"
                  style={{ color: isCinematic ? 'rgba(255,255,255,0.95)' : '#171717' }}
                >
                  {question.questionText}
                </motion.p>

                {/* Interactable Wrapper for Audio & Answers */}
                <div style={{ pointerEvents: isInteractable ? 'auto' : 'none' }}>
                  
                  {/* Audio player(s) */}
                  {question.audioSrc && (
                    <div className="mb-6 sm:mb-10 flex flex-col gap-4">
                      <AudioPlayer
                        src={question.audioSrc}
                        label={question.audioLabel}
                        coverSrc={question.coverSrc}
                        onExpandCover={question.coverSrc ? () => setCoverExpanded(true) : undefined}
                        accentColor="#C4924A"
                        key={`${question.id}-1`}
                        onPlayingChange={isCinematic ? setIsAudioPlaying : undefined}
                        cinematic={isCinematic}
                      />
                      {question.audioSrc2 && (
                        <AudioPlayer
                          src={question.audioSrc2}
                          label={question.audioLabel2}
                          accentColor="#5A98BE"
                          key={`${question.id}-2`}
                          cinematic={isCinematic}
                        />
                      )}
                    </div>
                  )}

                  {/* Answer options */}
                  <motion.div
                    initial={{ opacity: isCinematic ? 0 : 1 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: isCinematic ? 0 : 1 }}
                    transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
                  >
                    {question.format === 'likert' ? (
                      <LikertScaleGroup question={question} onAnswer={handleAnswer} cinematic={isCinematic} />
                    ) : question.format === 'multiselect' ? (
                      <MultiSelectGroup question={question as MultiselectQuestion} onAnswer={handleAnswer} cinematic={isCinematic} />
                    ) : (
                      <MultiChoiceGroup question={question as BinaryQuestion} onAnswer={handleAnswer} cinematic={isCinematic} />
                    )}
                  </motion.div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Cinematic background portal */}
      {isMounted && createPortal(
        <AnimatePresence mode="wait">
          {isCinematic && (
            <motion.div
              key={`cinematic-${question.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
              style={{ position: 'fixed', inset: 0, zIndex: 10, background: '#000' }}
            >
              <CinematicBackground
                videoSrc={question.cinematicVideoSrc}
                imageSrc={question.cinematicImageSrc}
                isPlaying={isAudioPlaying}
                alwaysPlay={true}
                blurPaused={question.cinematicBlur?.paused}
                blurPlaying={question.cinematicBlur?.playing}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

// ── Cinematic background ───────────────────────────────────────────────────────

const bottomGradient = {
  position: 'absolute' as const,
  bottom: 0, left: 0, right: 0,
  height: '65%',
  background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, transparent 100%)',
  pointerEvents: 'none' as const,
};

function CinematicBackground({
  videoSrc,
  imageSrc,
  isPlaying,
  alwaysPlay = false,
  blurPaused,
  blurPlaying,
}: {
  videoSrc?: string;
  imageSrc?: string;
  isPlaying: boolean;
  alwaysPlay?: boolean;
  blurPaused?: string;
  blurPlaying?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (alwaysPlay || isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying, alwaysPlay]);

  if (imageSrc) {
    return (
      <>
        <div style={{ position: 'absolute', inset: '-20px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isPlaying ? `blur(${blurPlaying ?? '3px'})` : `blur(${blurPaused ?? '5px'})`,
              transition: 'filter 2s ease',
              animationName: 'cinematic-pan',
              animationDuration: '16s',
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              animationDirection: 'alternate',
              transformOrigin: 'center',
            }}
          />
        </div>
        <div style={bottomGradient} />
      </>
    );
  }

  return (
    <>
      <div style={{ position: 'absolute', inset: '-20px' }}>
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          playsInline
          preload="auto"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: isPlaying ? `blur(${blurPlaying ?? '0px'})` : `blur(${blurPaused ?? '10px'})`,
            transition: 'filter 2s ease',
            animationName: 'cinematic-scale',
            animationDuration: '8s',
            animationTimingFunction: 'ease-in-out',
            animationIterationCount: 'infinite',
            animationDirection: 'alternate',
            transformOrigin: 'center',
          }}
        />
      </div>
      <div style={bottomGradient} />
    </>
  );
}

// ── Audio player ──────────────────────────────────────────────────────────────

interface AudioPlayerProps {
  src: string;
  label?: string;
  coverSrc?: string;
  onExpandCover?: () => void;
  accentColor?: string;
  onPlayingChange?: (playing: boolean) => void;
  cinematic?: boolean;
}

function AudioPlayer({
  src,
  label,
  coverSrc,
  onExpandCover,
  accentColor = '#5A98BE',
  onPlayingChange,
  cinematic,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => setCurrentTime(el.currentTime);
    const onLoaded = () => setDuration(el.duration);
    const onEnded = () => {
      setPlaying(false);
      onPlayingChange?.(false);
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('ended', onEnded);
    };
  }, [onPlayingChange]);

  function togglePlay() {
    const el = audioRef.current;
    if (!el) return;
    const next = !playing;
    if (next) { el.play(); } else { el.pause(); }
    setPlaying(next);
    onPlayingChange?.(next);
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = Number(e.target.value);
    setCurrentTime(el.currentTime);
  }

  function fmt(s: number) {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <motion.div
      initial={{ opacity: cinematic ? 0 : 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: cinematic ? 0 : 1 }}
      transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
      className="overflow-hidden rounded-xl"
      style={{
        background: 'transparent',
        backdropFilter: cinematic ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: cinematic ? 'blur(16px)' : 'none',
        border: '1px solid rgba(255, 255, 255, 0.5)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.05)',
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {coverSrc && (
        <button
          onClick={onExpandCover}
          className="group relative block w-full"
          aria-label="Expand album cover"
          style={{ background: cinematic ? 'rgba(0, 0, 0, 0.22)' : 'rgba(240, 238, 233, 0.12)' }}
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

      <div
        className="px-5 pb-5 pt-4"
        style={{ background: 'rgba(255, 255, 255, 0.75)' }}
      >
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
          className="mb-3 h-1 sm:h-px w-full cursor-pointer appearance-none rounded-full bg-neutral-200"
          style={{ accentColor }}
        />

        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            className="flex h-10 w-10 sm:h-7 sm:w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
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
    </motion.div>
  );
}

// ── Likert scale group (handles optional second scale) ────────────────────────

function LikertScaleGroup({
  question,
  onAnswer,
  cinematic,
}: {
  question: LikertQuestion;
  onAnswer: (scores: ScoreAdjustment[], info: AnswerInfo) => void;
  cinematic?: boolean;
}) {
  const [firstScores, setFirstScores] = useState<ScoreAdjustment[] | null>(null);
  const [firstLabel, setFirstLabel] = useState<string | null>(null);

  function handleFirst(scores: ScoreAdjustment[], info: AnswerInfo) {
    if (!question.secondScale) {
      onAnswer(scores, info);
    } else {
      setFirstScores(scores);
      setFirstLabel(info.label);
    }
  }

  function handleSecond(scores: ScoreAdjustment[], info: AnswerInfo) {
    onAnswer([...(firstScores ?? []), ...scores], { label: `${firstLabel}/${info.label}`, text: '' });
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
            cinematic={cinematic}
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
            cinematic={cinematic}
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
  cinematic,
}: {
  leftLabel: string;
  rightLabel: string;
  options: LikertScale['options'];
  onSelect: (scores: ScoreAdjustment[], info: AnswerInfo) => void;
  cinematic?: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);

  function handleClick(opt: LikertOption) {
    setSelected(opt.value);
    onSelect(opt.scores, { label: String(opt.value), text: '' });
  }

  return (
    <div>
      <div className="mb-6 flex justify-between">
        <span className={`max-w-[42%] text-sm font-light leading-snug ${cinematic ? 'text-white/70' : 'text-neutral-500'}`}>
          {leftLabel}
        </span>
        <span className={`max-w-[42%] text-right text-sm font-light leading-snug ${cinematic ? 'text-white/70' : 'text-neutral-500'}`}>
          {rightLabel}
        </span>
      </div>

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
                    ? `flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full text-sm font-light transition-all duration-200 ${cinematic ? 'bg-white text-neutral-900' : 'bg-neutral-900 text-white'}`
                    : `flex h-11 w-11 sm:h-9 sm:w-9 items-center justify-center rounded-full border text-sm font-light transition-all duration-200 ${cinematic ? 'border-white/30 text-white/50 hover:border-white/70 hover:text-white/90' : 'border-neutral-200 text-neutral-400 hover:border-neutral-400 hover:text-neutral-600'}`
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
  cinematic,
}: {
  question: BinaryQuestion;
  onAnswer: (scores: ScoreAdjustment[], info: AnswerInfo) => void;
  cinematic?: boolean;
}) {
  const [firstScores, setFirstScores] = useState<ScoreAdjustment[] | null>(null);
  const [firstInfo, setFirstInfo] = useState<AnswerInfo | null>(null);
  const [cascadeAnswers, setCascadeAnswers] = useState<AnswerOption[] | null>(null);
  const [showSecond, setShowSecond] = useState(false);

  function handlePrimary(answer: AnswerOption) {
    if (answer.secondAnswers) {
      setFirstScores(answer.scores);
      setFirstInfo({ label: answer.label, text: answer.text });
      setCascadeAnswers(answer.secondAnswers);
    } else if (question.secondQuestion) {
      setFirstScores(answer.scores);
      setFirstInfo({ label: answer.label, text: answer.text });
      setShowSecond(true);
    } else {
      onAnswer(answer.scores, { label: answer.label, text: answer.text });
    }
  }

  function handleSecondary(answer: AnswerOption) {
    onAnswer(
      [...(firstScores ?? []), ...answer.scores],
      { label: `${firstInfo?.label}→${answer.label}`, text: `${firstInfo?.text} / ${answer.text}` },
    );
  }

  let activeKey: string;
  let activeContent: React.ReactNode;

  if (cascadeAnswers) {
    activeKey = 'cascade';
    activeContent = cascadeAnswers.map((answer, i) => (
      <AnswerButton
        key={answer.label}
        answer={answer}
        index={i}
        onClick={() => handleSecondary(answer)}
        isLast={i === cascadeAnswers.length - 1}
        cinematic={cinematic}
      />
    ));
  } else if (showSecond && question.secondQuestion) {
    activeKey = 'second';
    activeContent = (
      <>
        <p
          className="mb-8 text-[clamp(1.1rem,2.5vw,1.4rem)] font-light leading-[1.4] tracking-[-0.01em]"
          style={{ color: cinematic ? 'rgba(255,255,255,0.9)' : '#171717' }}
        >
          {question.secondQuestion.questionText}
        </p>
        {question.secondQuestion.answers.map((answer, i) => (
          <AnswerButton
            key={answer.label}
            answer={answer}
            index={i}
            onClick={() => handleSecondary(answer)}
            isLast={i === question.secondQuestion!.answers.length - 1}
            cinematic={cinematic}
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
        cinematic={cinematic}
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

// ── Multi-select group ────────────────────────────────────────────────────────

function MultiSelectGroup({
  question,
  onAnswer,
  cinematic,
}: {
  question: MultiselectQuestion;
  onAnswer: (scores: ScoreAdjustment[], info: AnswerInfo) => void;
  cinematic?: boolean;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const max = question.maxSelect ?? Infinity;

  function toggle(label: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(label)) {
        next.delete(label);
      } else if (next.size < max) {
        next.add(label);
      }
      return next;
    });
  }

  function submit() {
    const chosen = question.options.filter(o => selected.has(o.label));
    const allScores = chosen.flatMap(o => o.scores);
    const label = Array.from(selected).sort().join(',');
    const text = chosen.map(o => o.text).join(' / ');
    onAnswer(allScores, { label, text });
  }

  const atMax = selected.size >= max;

  return (
    <div>
      {question.maxSelect && (
        <p className={`mb-5 text-xs font-light ${cinematic ? 'text-white/40' : 'text-neutral-400'}`}>
          Select up to {question.maxSelect}
        </p>
      )}
      {question.options.map((opt, i) => {
        const isSelected = selected.has(opt.label);
        const isDisabled = !isSelected && atMax;
        return (
          <motion.button
            key={opt.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 + 0.12 }}
            onClick={() => toggle(opt.label)}
            disabled={isDisabled}
            className={`group flex w-full items-center gap-4 border-t py-4 text-left transition-colors duration-200 ${
              i === question.options.length - 1 ? 'border-b' : ''
            } ${cinematic ? 'border-white/15' : 'border-neutral-200'} ${isDisabled ? 'opacity-30' : ''}`}
          >
            {/* Checkbox */}
            <span
              className={`shrink-0 flex h-4 w-4 items-center justify-center rounded border transition-all duration-150 ${
                isSelected
                  ? cinematic ? 'border-white bg-white' : 'border-neutral-900 bg-neutral-900'
                  : cinematic ? 'border-white/30' : 'border-neutral-300'
              }`}
            >
              {isSelected && (
                <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke={cinematic ? '#111' : '#fff'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>

            {/* Label badge */}
            {!question.hideLabels && (
              <span className={`shrink-0 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-200 ${
                cinematic
                  ? isSelected ? 'text-white/60' : 'text-white/30'
                  : isSelected ? 'text-neutral-500' : 'text-neutral-300'
              }`}>
                {opt.label}
              </span>
            )}

            {/* Text */}
            <span className={`flex-1 text-[15px] font-light leading-relaxed transition-colors duration-200 ${
              cinematic
                ? isSelected ? 'text-white' : 'text-white/70'
                : isSelected ? 'text-neutral-900' : 'text-neutral-600'
            }`}>
              {opt.text}
            </span>
          </motion.button>
        );
      })}

      {/* Submit — always rendered to avoid layout shift; fades in on first selection */}
      <div className="mt-7 flex justify-center">
        <motion.button
          animate={{ opacity: selected.size > 0 ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          onClick={submit}
          style={{ pointerEvents: selected.size > 0 ? 'auto' : 'none' }}
          className={`group flex items-center gap-2 border-b pb-0.5 text-sm font-medium transition-opacity hover:opacity-50 ${
            cinematic ? 'border-white text-white' : 'border-neutral-900 text-neutral-900'
          }`}
        >
          Continue <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
        </motion.button>
      </div>
    </div>
  );
}

// ── Answer button ─────────────────────────────────────────────────────────────

interface AnswerButtonProps {
  answer: AnswerOption;
  index: number;
  isLast?: boolean;
  onClick: () => void;
  cinematic?: boolean;
}

function AnswerButton({ answer, index, isLast = false, onClick, cinematic }: AnswerButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 + 0.12 }}
      onClick={onClick}
      className={`group flex w-full items-baseline gap-5 border-t py-4 text-left transition-colors duration-200 ${isLast ? 'border-b' : ''} ${
        cinematic
          ? 'border-white/15 hover:border-white/30'
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      <span
        className={`shrink-0 text-[10px] font-medium uppercase tracking-[0.2em] transition-colors duration-200 ${
          cinematic
            ? 'text-white/30 group-hover:text-white/60'
            : 'text-neutral-300 group-hover:text-neutral-500'
        }`}
      >
        {answer.label}
      </span>

      <span
        className={`flex-1 text-[15px] font-light leading-relaxed transition-colors duration-200 ${
          cinematic
            ? 'text-white/85 group-hover:text-white/60'
            : 'text-neutral-800 group-hover:text-neutral-500'
        }`}
      >
        {answer.text}
      </span>

      <span
        className={`shrink-0 self-center text-[13px] transition-all duration-300 group-hover:translate-x-1 ${
          cinematic
            ? 'text-white/20 group-hover:text-white/50'
            : 'text-neutral-200 group-hover:text-neutral-400'
        }`}
      >
        →
      </span>
    </motion.button>
  );
}