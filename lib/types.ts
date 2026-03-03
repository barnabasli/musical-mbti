// ─── Axis Identifiers ────────────────────────────────────────────────────────
// Each axis is a spectrum between two opposing cognitive traits.
//
//   motivation : Vibes       (V, +) ↔ Musicality  (M, −)
//   entropy    : Comfort     (C, +) ↔ Surprise    (S, −)
//   scope      : Holistic    (H, +) ↔ Detailed    (D, −)
//   momentum   : Immersion   (I, +) ↔ Progression (P, −)
//
// A positive score on any axis means the listener leans toward the first trait;
// a negative score means they lean toward the second.

export type Axis = 'motivation' | 'entropy' | 'scope' | 'momentum';

// ─── Score Model ─────────────────────────────────────────────────────────────

/** A single point-adjustment applied to one axis when an answer is selected. */
export interface ScoreAdjustment {
  axis: Axis;
  /** Positive → first trait (V/C/H/I). Negative → second trait (M/S/D/P). */
  points: number;
}

/** The running totals across all four axes. */
export interface Scores {
  motivation: number;
  entropy: number;
  scope: number;
  momentum: number;
}

// ─── Question / Answer Model ──────────────────────────────────────────────────

export interface AnswerOption {
  /** Display label shown on the button badge (e.g. "A", "B", "C", "D", or a short word). */
  label: string;
  /** The answer text shown to the user. */
  text: string;
  /**
   * Score adjustments this answer applies — can affect multiple axes at once.
   * The scoring engine iterates over this array and accumulates every adjustment.
   */
  scores: ScoreAdjustment[];
  /**
   * Optional cascade: when set, selecting this answer does NOT submit immediately.
   * Instead a second set of answer options is revealed, and the final score is the
   * sum of this answer's scores plus whichever second answer the user picks.
   */
  secondAnswers?: AnswerOption[];
}

export interface LikertOption {
  value: number;
  /** Optional short label displayed under the button, e.g. "Strongly A". */
  label?: string;
  scores: ScoreAdjustment[];
}

interface BaseQuestion {
  id: number;
  /** Short evocative name displayed as the scenario header. */
  scenario: string;
  /** The longer question body the user actually reads. */
  questionText: string;
  /** Optional path (relative to /public) or URL to an audio clip. */
  audioSrc?: string;
  /** Attribution shown above the audio player, e.g. "Allan Holdsworth — Looking Glass". */
  audioLabel?: string;
  /** Optional second audio clip for comparison questions. */
  audioSrc2?: string;
  /** Attribution for the second audio clip. */
  audioLabel2?: string;
  /** Optional album/cover art path (relative to /public), shown alongside the audio player. */
  coverSrc?: string;
}

/**
 * A follow-up question shown after the user answers the primary set,
 * with its own prompt text and independent answer options.
 */
export interface SecondMultiQuestion {
  questionText: string;
  answers: AnswerOption[];
}

/** Multi-choice question — supports 2–6 answer options, optional cascade, and optional sequential follow-up. */
export interface BinaryQuestion extends BaseQuestion {
  format?: 'binary';
  answers: AnswerOption[];
  /** When set, a second question is revealed after the first set is answered. Scores from both are combined. */
  secondQuestion?: SecondMultiQuestion;
}

/** A single five-point scale with pole labels (reusable for multi-scale questions). */
export interface LikertScale {
  leftLabel: string;
  rightLabel: string;
  options: [LikertOption, LikertOption, LikertOption, LikertOption, LikertOption];
}

/** Five-point scale question with labelled poles. Supports an optional second scale. */
export interface LikertQuestion extends BaseQuestion {
  format: 'likert';
  /** Text anchoring the left (low/A) end of the scale. */
  leftLabel: string;
  /** Text anchoring the right (high/B) end of the scale. */
  rightLabel: string;
  options: [LikertOption, LikertOption, LikertOption, LikertOption, LikertOption];
  /** Optional second scale shown after the first is answered. */
  secondScale?: LikertScale;
}

export type Question = BinaryQuestion | LikertQuestion;

// ─── Result Model ─────────────────────────────────────────────────────────────

/** The result for a single axis after all questions have been answered. */
export interface AxisResult {
  axis: Axis;
  /** Raw accumulated score for this axis. */
  score: number;
  /** The trait the user leans toward (e.g. "Vibes"). */
  trait: string;
  /** The opposing trait (e.g. "Musicality"). */
  opposite: string;
  /** Single-letter code for the dominant trait (e.g. "V"). */
  letter: string;
  /** Hex colour representing this axis in the UI. */
  color: string;
}

/** The four-letter Musical Type string, e.g. "VSDI". */
export type MusicalType = `${'V' | 'M'}${'C' | 'S'}${'H' | 'D'}${'I' | 'P'}`;

/** Which top-level view is currently rendered. */
export type AppView = 'landing' | 'quiz' | 'results';

export interface AxisResult {
  axis: Axis;
  score: number;
  percentage: number; // New: 50 to 100
  trait: string;
  opposite: string;
  letter: string;
  color: string;
}