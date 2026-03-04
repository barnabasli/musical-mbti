import { Axis, AxisResult, Scores, ScoreAdjustment, Question } from './types';

// ─── Initial State ────────────────────────────────────────────────────────────

export const initialScores: Scores = {
  motivation: 0,
  entropy: 0,
  scope: 0,
  momentum: 0,
};

// ─── Scoring Engine ───────────────────────────────────────────────────────────

export function applyScores(current: Scores, adjustments: ScoreAdjustment[]): Scores {
  const next = { ...current };
  for (const { axis, points } of adjustments) {
    next[axis] += points;
  }
  return next;
}

export function calculateType(scores: Scores): string {
  const motivation = scores.motivation >= 0 ? 'V' : 'M';
  const entropy    = scores.entropy    >= 0 ? 'C' : 'S';
  const scope      = scores.scope      >= 0 ? 'H' : 'D';
  const momentum   = scores.momentum   >= 0 ? 'I' : 'P';
  return `${motivation}${entropy}${scope}${momentum}`;
}

// ─── Dynamic Bounds Calculator ────────────────────────────────────────────────

export type AxisBounds = Record<Axis, { min: number; max: number }>;

/** Shared helpers used by bounds calculators. */
const emptyScores = (): Scores => ({ motivation: 0, entropy: 0, scope: 0, momentum: 0 });
const addScores = (a: Scores, b: Scores): Scores => ({
  motivation: a.motivation + b.motivation,
  entropy:    a.entropy    + b.entropy,
  scope:      a.scope      + b.scope,
  momentum:   a.momentum   + b.momentum,
});

/** Returns all possible combined outcome scores for a single question. */
function questionOutcomes(q: any): Scores[] {
  let outcomes: Scores[] = [emptyScores()];

  if (q.answers && !q.answers.some((a: any) => a.secondAnswers)) {
    outcomes = q.answers.map((a: any) => applyScores(emptyScores(), a.scores || []));
  } else if (q.answers && q.answers.some((a: any) => a.secondAnswers)) {
    outcomes = [];
    for (const a of q.answers) {
      const base = applyScores(emptyScores(), a.scores || []);
      if (a.secondAnswers) {
        for (const sa of a.secondAnswers) { outcomes.push(applyScores(base, sa.scores || [])); }
      } else {
        outcomes.push(base);
      }
    }
  } else if (q.options) {
    outcomes = q.options.map((o: any) => applyScores(emptyScores(), o.scores || []));
  }

  if (q.secondQuestion?.answers) {
    const part2 = q.secondQuestion.answers.map((a: any) => applyScores(emptyScores(), a.scores || []));
    const combined: Scores[] = [];
    for (const o1 of outcomes) { for (const o2 of part2) { combined.push(addScores(o1, o2)); } }
    outcomes = combined;
  }

  if (q.secondScale?.options) {
    const part2 = q.secondScale.options.map((o: any) => applyScores(emptyScores(), o.scores || []));
    const combined: Scores[] = [];
    for (const o1 of outcomes) { for (const o2 of part2) { combined.push(addScores(o1, o2)); } }
    outcomes = combined;
  }

  return outcomes;
}

/** Returns one AxisBounds entry per question (not summed). */
export function computePerQuestionBounds(questions: any[]): AxisBounds[] {
  return questions.map((q) => {
    const outcomes = questionOutcomes(q);
    const qBounds: AxisBounds = {
      motivation: { min: 0, max: 0 },
      entropy:    { min: 0, max: 0 },
      scope:      { min: 0, max: 0 },
      momentum:   { min: 0, max: 0 },
    };
    for (const axis of Object.keys(qBounds) as Axis[]) {
      const s = outcomes.map((o) => o[axis]);
      qBounds[axis].max = Math.max(0, ...s);
      qBounds[axis].min = Math.min(0, ...s);
    }
    return qBounds;
  });
}

/**
 * Computes axis bounds dynamically from the user's actual answer history.
 * A question only contributes to an axis's bounds when the user's chosen
 * answer had a non-zero effect on that axis — picking an unrelated answer
 * never inflates the "total points possible" for axes the user didn't engage.
 */
export function calculateBoundsFromHistory(
  perQuestionBounds: AxisBounds[],
  answerHistory: import('./types').ScoreAdjustment[][],
): AxisBounds {
  const bounds: AxisBounds = {
    motivation: { min: 0, max: 0 },
    entropy:    { min: 0, max: 0 },
    scope:      { min: 0, max: 0 },
    momentum:   { min: 0, max: 0 },
  };
  for (let i = 0; i < perQuestionBounds.length; i++) {
    const qBounds = perQuestionBounds[i];
    const chosen  = answerHistory[i] ?? [];
    for (const axis of Object.keys(bounds) as Axis[]) {
      const chosenScore = chosen
        .filter((adj) => adj.axis === axis)
        .reduce((sum, adj) => sum + adj.points, 0);
      if (chosenScore !== 0) {
        bounds[axis].max += qBounds[axis].max;
        bounds[axis].min += qBounds[axis].min;
      }
    }
  }
  return bounds;
}

/**
 * Sums per-question bounds across all questions (static / theoretical maximum).
 * Kept for reference; the quiz now uses calculateBoundsFromHistory instead.
 */
export function calculateAxisBounds(questions: any[]): AxisBounds {
  const bounds: AxisBounds = {
    motivation: { min: 0, max: 0 },
    entropy:    { min: 0, max: 0 },
    scope:      { min: 0, max: 0 },
    momentum:   { min: 0, max: 0 },
  };
  for (const qBounds of computePerQuestionBounds(questions)) {
    for (const axis of Object.keys(bounds) as Axis[]) {
      bounds[axis].max += qBounds[axis].max;
      bounds[axis].min += qBounds[axis].min;
    }
  }
  return bounds;
}

// ─── Axis Metadata ────────────────────────────────────────────────────────────

export const AXIS_META: Record<
  Axis,
  {
    positive: { letter: string; trait: string };
    negative: { letter: string; trait: string };
    color: string;
    description: string;
  }
> = {
  motivation: {
    positive: { letter: 'V', trait: 'Vibes' },
    negative: { letter: 'M', trait: 'Musicality' },
    color: '#6FA882',
    description: 'What pulls you in — pure emotion or the craft behind it?',
  },
  entropy: {
    positive: { letter: 'C', trait: 'Comfort' },
    negative: { letter: 'S', trait: 'Surprise' },
    color: '#5A98BE',
    description: 'Do you seek familiar warmth or unexpected terrain?',
  },
  scope: {
    positive: { letter: 'H', trait: 'Holistic' },
    negative: { letter: 'D', trait: 'Detailed' },
    color: '#9A7EC2',
    description: 'Do you see the forest first, or count the leaves?',
  },
  momentum: {
    positive: { letter: 'I', trait: 'Immersion' },
    negative: { letter: 'P', trait: 'Progression' },
    color: '#C4924A',
    description: 'Do you want to stay inside the moment, or arrive somewhere?',
  },
};

// ─── Result Helpers ───────────────────────────────────────────────────────────

/** * Converts raw scores into a rich AxisResult array, calculating the percentage 
 * strength towards the dominant trait (50% to 100%).
 */
export function getAxisResults(scores: Scores, bounds: AxisBounds): AxisResult[] {
  return (Object.keys(scores) as Axis[]).map((axis) => {
    const score = scores[axis];
    const meta = AXIS_META[axis];
    const isPositive = score >= 0;

    let percentage = 50; // Baseline neutral

    // Calculate how far they pushed towards the max limit
    if (score > 0 && bounds[axis].max > 0) {
      percentage = 50 + (score / bounds[axis].max) * 50;
    } else if (score < 0 && bounds[axis].min < 0) {
      percentage = 50 + (score / bounds[axis].min) * 50; 
    }

    // Clamp the percentage strictly between 50 and 100
    percentage = Math.min(100, Math.max(50, Math.round(percentage)));

    return {
      axis,
      score,
      percentage,
      trait: isPositive ? meta.positive.trait : meta.negative.trait,
      opposite: isPositive ? meta.negative.trait : meta.positive.trait,
      letter: isPositive ? meta.positive.letter : meta.negative.letter,
      color: meta.color,
    };
  });
}

// ─── Archetype Lookup ─────────────────────────────────────────────────────────

interface Archetype {
  name: string;
  description: string;
}

const ARCHETYPES: Partial<Record<string, Archetype>> = {
  VCHI: {
    name: 'The Average Joe',
    description: 'Has many comfort playlists they will listen to for hours on end. They tend to be emotionally affected by music and love immersing themselves in their favorite songs.',
  },
  VCHP: {
    name: 'The Healing Era Girl',
    description: 'Wants an emotional experience and appreciates music that guides their feelings toward a resolution. You probably like songs that tell a story and relate deeply to one of your favorite artists.',
  },
  VCDI: {
    name: 'The Failed Guitar Player',
    description: 'Loves locking into a vibey, comfortable space. However, you don\'t just exist in this space and are are instead drawn to sections of songs you may find interesting. You\'re love immersing yourself in little details of songs you enjoy.',
  },
  VCDP: {
    name: 'The Nerdy Swiftie',
    description: 'You connect deeply with the emotional nuances of your favorite tracks. You listen closely to the details and obsess over how a specific lyric or subtle shift carefully builds the emotional narrative from the first verse to the final chorus.',
  },
  VSHI: {
    name: 'The Alt Middle Schooler',
    description: 'Seeks an intense emotional atmosphere to immerse themselves in. You enjoy lingering in unconventional, dissonant, and bizarre overarching moods without needing the song to go anywhere, and care a lot about the overall feeling that a song instills in you.',
  },
  VSHP: {
    name: 'The Theater Kid',
    description: 'Wants a shocking emotional experience with a lot of drama. You likely thrive on songs that build its emotional direction toward a grand climax and love listening to musicals. You\'re open to trying new music and appreciate when it tells a story.',
  },
  VSDI: {
    name: 'The Bedroom Philosopher',
    description: 'Loves music that immerses you in its bizzare emotional atmospheres. You pay attention to little moments in each song and are open to trying new genres. You probably listen to a lot of music and curate your playlist carefully.',
  },
  VSDP: {
    name: 'The Unemployed Artist',
    description: 'Craves music that takes them on a journey, fueled by brilliant moments of disruption as the track evolves. You appreciate originality in music and like songs that are different for the sake of being different.',
  },
  MCHI: {
    name: 'The Retired Conductor',
    description: 'You view music structurally and love pieces meant to be experienced as a complete, cohesive whole. You find deep satisfaction in resting within a perfectly balanced composition. You take a bird\'s-eye view of the music and appreciate its grand design and overarching atmosphere.',
  },
  MCHP: {
    name: 'The Hans Zimmer Fanboy',
    description: 'Loves structured musical forms that develop logically and have an emotional payoff at the end. You appreciate songs following traditional music theory and enjoy songs that build momentum toward a satisfying musical climax.',
  },
  MCDI: {
    name: 'The Casual Musician',
    description: 'You appreciate the deep mechanics of a well-crafted composition. You find immense satisfaction in locking into a steady, reliable piece that\'s still interesting, and are able to immerse your brain into the little details that make up your favorite songs.',
  },
  MCDP: {
    name: 'The Unsufferable Virtuoso',
    description: 'Likes music that follows the rules, but is still creative and sophisticated enough that it satisfies your brain. You appreciate music that moves forward and likely have an analytical ear. You focus your attention on the technical brilliance of individual sections or the specific development of localized motifs.',
  },
  MSHI: {
    name: 'The "It\'s Actually Art" Guy',
    description: 'Appreciates highly unconventional, unpredictable musical environments. You like to immerse yourself in abstract or dissonant soundscapes and care about the overarching frameworks and structure governing each song.',
  },
  MSHP: {
    name: 'The Elitist',
    description: 'Demands complex and unconventional compositions that push musical boundaries while constantly driving forward through unpredictable structural and rhythmic phases. You love experimentalist music but require it to make sense somehow or move somewhere.',
  },
  MSDI: {
    name: 'The Hyperfixator',
    description: 'Fascinated by technical, unpredictable micro-interactions, complexity, and intricate details within a song. You like music that constantly occupies your brain with something you find interesting, whatever that may be. You can likely loop a song you find appealing for hours without getting bored of it.',
  },
  MSDP: {
    name: 'The Aesthetic Snob',
    description: 'Thrives on technical complexity and sudden structural shifts and loves brilliant, unpredictable localized interplay between instruments. You like songs that are complex but not needlessly complex, as the complexity has to serve a purpose. You value musicality, originality, and beauty in music above all.',
  }
};

export function getArchetype(type: string): Archetype {
  return (
    ARCHETYPES[type] ?? {
      name: 'The Musical Cognitivist',
      description: `Your ${type} profile reflects a uniquely calibrated way of experiencing music — a fingerprint of four axes that defines your listening identity.`,
    }
  );
}