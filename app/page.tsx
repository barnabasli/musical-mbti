'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import { LandingView }  from '@/components/LandingView';
import { QuizView }     from '@/components/QuizView';
import { ResultsView }  from '@/components/ResultsView';

import { questions }                                     from '@/lib/questions';
import { initialScores, applyScores, computePerQuestionBounds, calculateBoundsFromHistory } from '@/lib/scoring';
import { AppView, ScoreAdjustment, Scores }                                                  from '@/lib/types';

// ── Cinematic media preloaders ─────────────────────────────────────────────────

const ESSENTIAL_VIDEOS = [
  '/backgrounds/september%20rain.mp4',
];

const DEFERRED_VIDEOS = [
  '/backgrounds/beethoven.mp4',
  '/backgrounds/ashes.mp4',
  '/backgrounds/holdsworth.mp4',
  '/backgrounds/kendrick.mp4',
  '/backgrounds/zimerman.mp4',
];

const DEFERRED_IMAGES = ['/backgrounds/pan%20neo.jpg'];

function MediaPreloader({ videos = [], images = [] }: { videos?: string[], images?: string[] }) {
  if (videos.length === 0 && images.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '1px', height: '1px', pointerEvents: 'none' }}
    >
      {videos.map((src) => (
        // eslint-disable-next-line jsx-a11y/media-has-caption
        <video key={src} src={src} preload="auto" muted playsInline />
      ))}
      {images.map((src) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={src} src={src} alt="" />
      ))}
    </div>
  );
}

export default function Home() {
  const [view, setView]                 = useState<AppView>('landing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores]             = useState<Scores>(initialScores);
  const [answerHistory, setAnswerHistory] = useState<ScoreAdjustment[][]>([]);
  const [shouldPreloadDeferred, setShouldPreloadDeferred] = useState(false);

  // Wait for the window to fully load before triggering the heavy media downloads
  useEffect(() => {
    if (document.readyState === 'complete') {
      setShouldPreloadDeferred(true);
    } else {
      const handleLoad = () => setShouldPreloadDeferred(true);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  // Pre-compute per-question bounds once; aggregate dynamically from answer history
  const perQuestionBounds = useMemo(() => computePerQuestionBounds(questions), []);
  const bounds = useMemo(
    () => calculateBoundsFromHistory(perQuestionBounds, answerHistory),
    [perQuestionBounds, answerHistory],
  );

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleStart = useCallback(() => {
    setCurrentIndex(0);
    setScores(initialScores);
    setAnswerHistory([]);
    setView('quiz');
  }, []);

  const handleAnswer = useCallback(
    (adjustments: ScoreAdjustment[]) => {
      const newScores = applyScores(scores, adjustments);
      setScores(newScores);
      setAnswerHistory((prev) => [...prev, adjustments]);

      if (currentIndex + 1 >= questions.length) {
        setView('results');
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [scores, currentIndex],
  );

  const handleRetake = useCallback(() => {
    setCurrentIndex(0);
    setScores(initialScores);
    setView('landing');
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* Essential preloader: Mounts instantly on render so the first question is guaranteed ready */}
      <MediaPreloader videos={ESSENTIAL_VIDEOS} />
      
      {/* Deferred preloader: Mounts only after the initial page resources are fully loaded */}
      {shouldPreloadDeferred && <MediaPreloader videos={DEFERRED_VIDEOS} images={DEFERRED_IMAGES} />}
      
      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <LandingView key="landing" onStart={handleStart} />
        )}

        {view === 'quiz' && (
          <QuizView
            key="quiz"
            question={questions[currentIndex]}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
          />
        )}

        {view === 'results' && (
          <ResultsView 
            key="results" 
            scores={scores} 
            bounds={bounds} 
            onRetake={handleRetake} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}