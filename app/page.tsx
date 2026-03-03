'use client';

import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';

import { LandingView }  from '@/components/LandingView';
import { QuizView }     from '@/components/QuizView';
import { ResultsView }  from '@/components/ResultsView';

import { questions }                                     from '@/lib/questions';
import { initialScores, applyScores, calculateAxisBounds } from '@/lib/scoring';
import { AppView, ScoreAdjustment, Scores }              from '@/lib/types';

export default function Home() {
  const [view, setView]                 = useState<AppView>('landing');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores]             = useState<Scores>(initialScores);

  // Calculate the max/min possible scores across all questions once
  const bounds = useMemo(() => calculateAxisBounds(questions), []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleStart = useCallback(() => {
    setCurrentIndex(0);
    setScores(initialScores);
    setView('quiz');
  }, []);

  /**
   * Called when the user selects an answer.
   * Applies all score adjustments for that answer, then either advances
   * to the next question or transitions to the results view.
   */
  const handleAnswer = useCallback(
    (adjustments: ScoreAdjustment[]) => {
      const newScores = applyScores(scores, adjustments);
      setScores(newScores);

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
      {/*
        AnimatePresence with mode="wait" ensures the exiting view fully
        unmounts before the entering view mounts, enabling clean page transitions.
      */}
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
            bounds={bounds} // <-- Passed the dynamic bounds here!
            onRetake={handleRetake} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}