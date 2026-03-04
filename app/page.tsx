'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';

import { LandingView }  from '@/components/LandingView';
import { QuizView }     from '@/components/QuizView';
import { ResultsView }  from '@/components/ResultsView';
import { BlogView }     from '@/components/BlogView';

import { questions }                                     from '@/lib/questions';
import { initialScores, applyScores, computePerQuestionBounds, calculateBoundsFromHistory, calculateType } from '@/lib/scoring';
import { AppView, ScoreAdjustment, Scores }                                                  from '@/lib/types';
import { saveQuizResponse, QuizAnswer }                   from '@/lib/supabase';

// ── Cinematic media & Cover preloaders ─────────────────────────────────────────

const ESSENTIAL_VIDEOS = [
  '/backgrounds/september%20rain.mp4',
];

const ESSENTIAL_IMAGES = [
  // Add your September Rain album cover here
  '/covers/september rain.jpg', 
];

const DEFERRED_VIDEOS = [
  '/backgrounds/beethoven.mp4',
  '/backgrounds/ashes.mp4',
  '/backgrounds/holdsworth.mp4',
  '/backgrounds/kendrick.mp4',
];

const DEFERRED_IMAGES = [
  '/backgrounds/pan%20neo.jpg',
  // Add the rest of your album covers here
  '/covers/ashes.jpg',
  '/covers/tokyo%20dream.jpg',
];

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
  const [quizAnswers, setQuizAnswers]     = useState<QuizAnswer[]>([]);
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
    setQuizAnswers([]);
    setView('quiz');
  }, []);

  const handleAnswer = useCallback(
    (adjustments: ScoreAdjustment[], info: { label: string; text: string }) => {
      const newScores = applyScores(scores, adjustments);
      setScores(newScores);
      setAnswerHistory((prev) => [...prev, adjustments]);

      const question = questions[currentIndex];
      const record: QuizAnswer = {
        questionId: question.id,
        scenario: question.scenario,
        label: info.label,
        text: info.text,
      };

      if (currentIndex + 1 >= questions.length) {
        const allAnswers = [...quizAnswers, record];
        saveQuizResponse(calculateType(newScores), newScores, allAnswers);
        setView('results');
      } else {
        setQuizAnswers((prev) => [...prev, record]);
        setCurrentIndex((prev) => prev + 1);
      }
    },
    [scores, currentIndex, quizAnswers],
  );

  const handleRetake = useCallback(() => {
    setCurrentIndex(0);
    setScores(initialScores);
    setAnswerHistory([]);
    setQuizAnswers([]);
    setView('landing');
  }, []);

  const handleBlog   = useCallback(() => setView('blog'),    []);
  const handleBackFromBlog = useCallback(() => setView('results'), []);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <main className="relative min-h-screen overflow-hidden bg-white">
      {/* Essential preloader: Mounts instantly on render so the first question is guaranteed ready */}
      <MediaPreloader videos={ESSENTIAL_VIDEOS} images={ESSENTIAL_IMAGES} />
      
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
            onBlog={handleBlog}
          />
        )}

        {view === 'blog' && (
          <BlogView key="blog" onBack={handleBackFromBlog} />
        )}
      </AnimatePresence>
    </main>
  );
}