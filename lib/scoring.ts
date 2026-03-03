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

/**
 * Parses the entire question array to find the maximum possible positive 
 * and negative points a user could earn on each axis. Accounts for 
 * nested questions and cascades.
 */
export function calculateAxisBounds(questions: any[]): AxisBounds {
  const bounds: AxisBounds = {
    motivation: { min: 0, max: 0 },
    entropy: { min: 0, max: 0 },
    scope: { min: 0, max: 0 },
    momentum: { min: 0, max: 0 },
  };

  const emptyScores = (): Scores => ({ motivation: 0, entropy: 0, scope: 0, momentum: 0 });
  const addScores = (a: Scores, b: Scores): Scores => ({
    motivation: a.motivation + b.motivation,
    entropy: a.entropy + b.entropy,
    scope: a.scope + b.scope,
    momentum: a.momentum + b.momentum,
  });

  for (const q of questions) {
    let outcomes: Scores[] = [emptyScores()];

    // Part 1: Main answers (including cascades) or likert options
    if (q.answers && !q.answers.some((a: any) => a.secondAnswers)) {
      outcomes = q.answers.map((a: any) => applyScores(emptyScores(), a.scores || []));
    } else if (q.answers && q.answers.some((a: any) => a.secondAnswers)) {
      outcomes = [];
      for (const a of q.answers) {
        const base = applyScores(emptyScores(), a.scores || []);
        if (a.secondAnswers) {
          for (const sa of a.secondAnswers) {
            outcomes.push(applyScores(base, sa.scores || []));
          }
        } else {
          outcomes.push(base);
        }
      }
    } else if (q.options) {
      outcomes = q.options.map((o: any) => applyScores(emptyScores(), o.scores || []));
    }

    // Part 2: Independent secondary questions (cumulative)
    if (q.secondQuestion?.answers) {
      const part2Outcomes = q.secondQuestion.answers.map((a: any) => applyScores(emptyScores(), a.scores || []));
      const combined = [];
      for (const o1 of outcomes) {
        for (const o2 of part2Outcomes) { combined.push(addScores(o1, o2)); }
      }
      outcomes = combined;
    }

    if (q.secondScale?.options) {
      const part2Outcomes = q.secondScale.options.map((o: any) => applyScores(emptyScores(), o.scores || []));
      const combined = [];
      for (const o1 of outcomes) {
        for (const o2 of part2Outcomes) { combined.push(addScores(o1, o2)); }
      }
      outcomes = combined;
    }

    // Add this question's max/min to the global bounds
    for (const axis of Object.keys(bounds) as Axis[]) {
      const possibleScores = outcomes.map(o => o[axis]);
      bounds[axis].max += Math.max(0, ...possibleScores);
      bounds[axis].min += Math.min(0, ...possibleScores);
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
    name: 'The Ambient Dreamer',
    description: 'Seeks a cohesive, comforting emotional atmosphere. They value music that establishes a steady, soothing mood over its entire duration that doesn\'t demand attention.',
  },
  VCHP: {
    name: 'The Storyteller',
    description: 'Wants an emotional, comforting experience with a clear narrative arc. They appreciate music that predictably guides their feelings toward a satisfying resolution.',
  },
  VCDI: {
    name: 'The Groover',
    description: 'Loves finding a comfortable emotional space and focusing heavily on the textures and rhythms within that state.',
  },
  VCDP: {
    name: 'The Pop Connoisseur',
    description: 'Enjoys a predictable emotional trajectory but delights in the production details, vocal runs, and catchy hooks placed along the way.',
  },
  VSHI: {
    name: 'The Mood Alchemist',
    description: 'Seeks intense, unexpected emotional atmospheres to immerse themselves in. They enjoy lingering in unconventional, dissonant, or bizarre overarching moods.',
  },
  VSHP: {
    name: 'The Theatrical Explorer',
    description: 'Wants an unpredictable emotional experience with a dramatic overarching narrative. They thrive on music that continuously and shockingly shifts its emotional direction.',
  },
  VSDI: {
    name: 'The Texture Junkie',
    description: 'Loves unconventional emotional sonic landscapes, fixating on strange, unexpected sound design choices and raw audio details within a static mood.',
  },
  VSDP: {
    name: 'The Chaos Chaser',
    description: 'Craves music that takes them on an unpredictable emotional journey, fueled by shocking, brilliant moments of sonic disruption and intense localized shifts.',
  },
  MCHI: {
    name: 'The Formalist',
    description: 'Appreciates structurally sound, familiar compositions meant to be experienced as a complete, unchanging work. They listen for the adherence to established musical theory.',
  },
  MCHP: {
    name: 'The Symphonic Voyager',
    description: 'Loves well-structured, familiar musical forms that develop logically and build through more traditional compositional techniques to a satisfying climax.',
  },
  MCDI: {
    name: 'The Pocket Analyst',
    description: 'Enjoys breaking down the theory and interplay of a steady, reliable groove or complex but repeating musical pattern.',
  },
  MCDP: {
    name: 'The Virtuoso Tracker',
    description: 'Likes standard musical structures but focuses their attention on the technical brilliance of individual performances or the highly specific development of a motif over time.',
  },
  MSHI: {
    name: 'The Avant-Garde Meditator',
    description: 'Appreciates complex, unconventional musical structures designed to create a challenging environment. They evaluate the overarching theoretical framework of experimental pieces.',
  },
  MSHP: {
    name: 'The Prog Architect',
    description: 'Demands complex, highly unconventional compositions that push musical boundaries while constantly developing through unpredictable structural and rhythmic phases.',
  },
  MSDI: {
    name: 'The Deconstructor',
    description: 'Fascinated by highly technical, unpredictable micro-interactions, complex time signatures, and details within a relatively static overarching form.',
  },
  MSDP: {
    name: 'The Jazz Maverick',
    description: 'Thrives on technical complexity and sudden structural shifts, focusing intensely on brilliant, unpredictable localized interplay between instruments as the piece rapidly evolves.',
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