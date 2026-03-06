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

  if (q.format === 'multiselect' && q.options) {
    // Each option is independently selectable — treat each as its own potential outcome.
    // (Bounds represent the extreme of any single option, which is sufficient when
    // each option affects a distinct axis.)
    outcomes = q.options.map((o: any) => applyScores(emptyScores(), o.scores || []));
  } else if (q.answers && !q.answers.some((a: any) => a.secondAnswers)) {
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
  genres: string[];
}

const ARCHETYPES: Partial<Record<string, Archetype>> = {
  VCHI: {
    name: 'The Average Joe',
    description: 'Has many comfort playlists that you can listen to for hours on end. You tend to be emotionally affected by music and love immersing yourself in your favorite tracks. You care a lot about the ambience and mood a song instills in you and listen to music primarily for that reason.',
    genres: ['Indie Pop', 'Contemporary R&B', 'Neo-Soul', 'Alternative Country', 'Classic Rock'],
  },
  VCHP: {
    name: 'The Healing Era Girl',
    description: 'Wants an emotional and atmospheric experience, and appreciates music that guides your feelings toward a resolution. You probably like songs that mean something or tell a story, and relate deeply to one of your favorite artists. A lot of your playlists are categorized by a mood or occasion.',
    genres: ['Chamber Pop', 'Indie Folk', 'Singer-Songwriter', 'Soft Rock', 'Acoustic'],
  },
  VCDI: {
    name: 'The Failed Guitar Player',
    description: 'Loves locking into a vibey, comfortable space. However, you don\'t just exist in this space and are instead drawn to sections of songs you may find interesting. You love immersing yourself in little details of songs you enjoy and you\'re probably the person your friends go to for music recs.',
    genres: ['Dream Pop', 'Lo-fi Hip Hop', 'Indie Rock', 'Smooth Jazz', 'Shoegaze'],
  },
  VCDP: {
    name: 'The Nerdy Swiftie',
    description: 'You connect deeply with the emotional nuances of your favorite tracks. You listen closely to the details and are able to tell how a specific lyric or subtle shift carefully builds the emotional narrative from the first verse to the final chorus. You love music that sounds familiar to you.',
    genres: ['Indie Folk', 'Chamber Pop', 'Art Rock', 'Alternative Country', 'Folk Pop'],
  },
  VSHI: {
    name: 'The Alt Middle Schooler',
    description: 'Seeks an intense emotional atmosphere to immerse themselves in. You enjoy lingering in unconventional, dissonant, and bizarre overarching moods without needing the song to go anywhere, and care a lot about the overall feeling that a song instills in you. You probably listen to music that\'s weird, but not too weird.',
    genres: ['Indie/Alternative Rock', 'Shoegaze', 'Dream Pop', 'Emo Pop', 'Post Metalcore'],
  },
  VSHP: {
    name: 'The Theater Kid',
    description: 'Wants a musical experience filled with a lot of emotion. You likely thrive on songs that build its direction toward a grand climax. You\'re open to trying new music and appreciate when it tells a story, and are heavily affected by the mood of each song. Most of your music is energetic rather than calm.',
    genres: ['Art Pop', 'Glam Rock', 'Baroque Pop', 'Psychedelic Pop', 'Musicals'],
  },
  VSDI: {
    name: 'The Bedroom Philosopher',
    description: 'Loves music that immerses you in its emotional atmosphere. You pay a lot of attention to detail and notice little moments in each song, and are open to trying new genres. You probably listen to a lot of music and curate your playlists carefully, heavily considering the mood of each song and its overall aesthetic.',
    genres: ['Experimental Pop', 'Indie Electronic', 'Art Rock', 'Shoegaze', 'Alternative Hip Hop'],
  },
  VSDP: {
    name: 'The Unemployed Artist',
    description: 'Loves music that builds up and takes you on a journey, fueled by occasional moments of disruption as the track evolves. You appreciate originality in music and like songs that are different for the sake of being different. You have a discerning ear and can separate out the layers of songs.',
    genres: ['Neo-Soul', 'Latin Rock', 'Indie Folk', 'Alternative R&B', 'Experimental Rock'],
  },
  MCHI: {
    name: 'The Retired Conductor',
    description: 'You have a good sense of structure for music and love songs and albums meant to be experienced as a complete, cohesive whole. You find deep satisfaction in resting within a perfectly balanced composition. You take a bird\'s-eye view of the music and appreciate its grand design and overarching atmosphere.',
    genres: ['Acoustic', 'Classical', 'New Age', 'Classic Rock', 'Cinematic'],
  },
  MCHP: {
    name: 'The Hans Zimmer Fanboy',
    description: 'Loves structured musical forms that develop logically and have an emotional payoff at the end. You appreciate songs following familiar patterns and enjoy music that builds momentum toward a satisfying climax. You are likely a safe bet for music recs among your friends.',
    genres: ['Classic Rock', 'Symphonic', 'EDM', 'Classical', 'Metal'],
  },
  MCDI: {
    name: 'The Casual Musician',
    description: 'You appreciate the mechanics of a well-crafted composition. You enjoy in locking into a steady, reliable piece that you find interesting, and are able to immerse your brain into the little details that make up your favorite songs. You have probably played an instrument at some point and have a good ear.',
    genres: ['Blues', 'Classical', 'Bossa Nova', 'Pop', 'Soul Jazz'],
  },
  MCDP: {
    name: 'The Unsufferable Virtuoso',
    description: 'Enjoys music that follows the rules, but is still sophisticated enough that it satisfies your brain. You appreciate songs that move forward and likely have an analytical ear. You naturally focus your attention on the technical brilliance of individual sections or the specific development of localized motifs.',
    genres: ['Jazz Fusion', 'Classical', 'Classic Rock', 'Romantic Era', 'Progressive Metal'],
  },
  MSHI: {
    name: 'The "It\'s Actually Art" Guy',
    description: 'Appreciates highly unconventional, unpredictable, and creative musical environments. You like to immerse yourself in abstract and dissonant soundscapes and care about the overarching frameworks and structure governing each song. You probably listen to a lot of music that most people have never heard of.',
    genres: ['Free Jazz', 'Math Rock', 'Modernism', 'Impressionist Era', 'EDM'],
  },
  MSHP: {
    name: 'The Elitist',
    description: 'Demands complex and unconventional compositions that push musical boundaries while constantly driving forward throughout creative structural and rhythmic phases. You love experimentalist music but require it to make sense as a whole, and care deeply about the big picture. Your friends have probably never heard of 99% songs you listen to.',
    genres: ['Post Rock', 'Progressive Metal', 'Experimental Jazz', 'Impressionist Era', 'Free Jazz'],
  },
  MSDI: {
    name: 'The Hyperfixator',
    description: 'Fascinated by technical interactions, complexity, and intricate details within a song. You like a variety of music that constantly occupies your brain with something you find interesting, whatever that may be. You probably have a creative mind and a strong musical intuition, and are able to loop a song you find appealing for hours without getting bored of it.',
    genres: ['Indie/Alternative Rock', 'Jazz Fusion', 'Romantic/Impressionist Era', 'EDM', 'Math Rock'],
  },
  MSDP: {
    name: 'The Aesthetic Snob',
    description: 'Thrives on complexity and loves brilliant, unique details as well as interplay between different parts of a song. Although you love sophistication and intricacy, you require it to be justified by an overarching purpose and don\'t enjoy songs that seem needlessly complex. You have a diverse taste in music and value musicality, originality, and beauty above all.',
    genres: ['Jazz Fusion', 'Contemporary Classical', 'Progressive Rock', 'Romantic/Impressionist Era', 'Metal'],
  },
};

export function getArchetype(type: string): Archetype {
  return (
    ARCHETYPES[type] ?? {
      name: 'The Musical Cognitivist',
      description: `Your ${type} profile reflects a uniquely calibrated way of experiencing music — a fingerprint of four axes that defines your listening identity.`,
      genres: ['Experimental', 'Ambient', 'Art Rock', 'Jazz', 'Contemporary Classical'],
    }
  );
}
