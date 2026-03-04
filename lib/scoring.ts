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
    name: 'The Comfort Pick',
    description: 'Has many comfort playlists they will listen to for hours on end. They tend to be emotionally affected by music and love immersing themselves in their favorite songs.',
  },
  VCHP: {
    name: 'The Storyteller',
    description: 'Wants an emotional, comforting experience and appreciates a narrative arc. They appreciate music that guides their feelings toward a resolution.',
  },
  VCDI: {
    name: 'The Vibe Rider',
    description: 'Loves locking into a vibey, comfortable space. However, they don\'t just exist in this space and are are instead actively drawn to sections of songs they find interesting.',
  },
  VCDP: {
    name: 'The Pop Connoisseur',
    description: 'Enjoys a predictable, evolving emotional trajectory, but delights primarily in emotional peaks, vocal acrobatics, and punchy melodic hooks placed along the journey.',
  },
  VSHI: {
    name: 'The Mood Alchemist',
    description: 'Seeks intense, unexpected emotional atmospheres to immerse themselves in. They enjoy lingering in unconventional, dissonant, or bizarre overarching moods without needing the song to go anywhere.',
  },
  VSHP: {
    name: 'The Theatrical Explorer',
    description: 'Wants an unpredictable emotional experience with a dramatic overarching narrative. They thrive on music that builds its emotional direction toward a grand climax.',
  },
  VSDI: {
    name: 'The Fever Dreamer',
    description: 'Immerses themselves in highly unconventional, bizarre emotional atmospheres. They fixate on shocking emotional outbursts, jarring atmospheric shifts, or intense vocal deliveries.',
  },
  VSDP: {
    name: 'The Chaos Chaser',
    description: 'Craves music that takes them on an unpredictable journey, fueled by shocking, brilliant moments of disruption and intense localized shifts as the track evolves.',
  },
  MCHI: {
    name: 'The Formalist',
    description: 'Appreciates structurally sound, familiar compositions meant to be experienced as a complete, unchanging work. They evaluate adherence to established musical theory at a macro level.',
  },
  MCHP: {
    name: 'The Symphonic Voyager',
    description: 'Loves well-structured, familiar musical forms that develop logically. They appreciate how traditional compositional techniques are used to build momentum toward a satisfying musical climax.',
  },
  MCDI: {
    name: 'The Analyst',
    description: 'Enjoys breaking down the theory and interplay of a steady, reliable groove or complex but familiar musical pattern.',
  },
  MCDP: {
    name: 'The Virtuoso',
    description: 'Likes more standard musical structures that move forward, but focuses their attention heavily on the technical brilliance of individual performances or the highly specific development of a localized motif over time.',
  },
  MSHI: {
    name: 'The Abstract Surveyor',
    description: 'Appreciates highly unconventional, unpredictable musical environments. They immerse themselves in abstract or dissonant soundscapes, evaluating the overarching theoretical framework and structural rules governing the chaos.',
  },
  MSHP: {
    name: 'The Prog Architect',
    description: 'Demands complex, highly unconventional compositions that push musical boundaries while constantly driving forward through unpredictable structural and rhythmic phases.',
  },
  MSDI: {
    name: 'The Deconstructor',
    description: 'Fascinated by highly technical, unpredictable micro-interactions, complex time signatures, and intricate voicing details within a more static and overarching form.',
  },
  MSDP: {
    name: 'The Jazz Maverick',
    description: 'Thrives on technical complexity and sudden structural shifts. They focus intensely on brilliant, unpredictable localized interplay between instruments and love structured songs that continuously change for a purpose.',
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