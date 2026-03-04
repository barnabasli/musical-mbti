import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface QuizAnswer {
  questionId: number;
  scenario: string;
  label: string;
  text: string;
}

export async function saveQuizResponse(
  musicalType: string,
  scores: { motivation: number; entropy: number; scope: number; momentum: number },
  answers: QuizAnswer[],
) {
  const { error } = await supabase.from('quiz_responses').insert({
    musical_type: musicalType,
    motivation_score: scores.motivation,
    entropy_score: scores.entropy,
    scope_score: scores.scope,
    momentum_score: scores.momentum,
    answers,
  });

  if (error) {
    console.error('Failed to save quiz response:', error.message);
  }
}
