import { Question } from './types';

/**
 * The question bank.
 *
 * Each answer carries a `scores` array that the engine applies in full —
 * a single answer can shift multiple axes by independent amounts.
 *
 * ── Axes ────────────────────────────────────────────────────────────────────
 *
 *   motivation  (V / M)  Vibes ↔ Musicality
 *     V  +  You are drawn in by raw emotion, mood, and feeling.
 *     M  −  You are drawn in by craft, technique, and musical structure.
 *
 *   entropy     (C / S)  Comfort ↔ Surprise
 *     C  +  You gravitate toward the familiar — warmth of the known.
 *     S  −  You gravitate toward the unexpected — novelty and risk.
 *
 *   scope       (H / D)  Holistic ↔ Detailed
 *     H  +  You perceive music as a whole atmosphere or gestalt.
 *     D  −  You zero in on individual parts, layers, and micro-details.
 *
 *   momentum    (I / P)  Immersion ↔ Progression
 *     I  +  You want to stay locked inside a sustained moment or groove.
 *     P  −  You want the music to evolve, build, and take you somewhere.
 *
 * ── Convention for points ───────────────────────────────────────────────────
 *   +2  strong pull toward the positive trait  (V / C / H / I)
 *   +1  mild pull toward the positive trait
 *   −1  mild pull toward the negative trait    (M / S / D / P)
 *   −2  strong pull toward the negative trait
 */
export const questions: Question[] = [

  // ── Q1 — Foreign Language Song ──────────────────────────────────────────────
  {
    id: 1,
    scenario: 'Lost in Translation',
    questionText:
      'You are listening to a song in a foreign language you do not understand. How do you process the vocals?',
    answers: [
      {
        label: 'A',
        text: 'I focus on the emotion and tone of the singer\'s voice to feel what they\'re conveying',
        scores: [
          { axis: 'motivation', points: 1 }, // mild Vibes
          { axis: 'scope',      points: 1 }, // mild Holistic
        ],
      },
      {
        label: 'B',
        text: 'I treat the voice as another instrument and don\'t care about the vocals',
        scores: [
          { axis: 'motivation', points: -1 }, // mild Musicality
          { axis: 'scope',      points: -1 }, // mild Detailed
        ],
      },
      {
        label: 'C',
        text: 'I look up the lyrics so I know what they\'re saying',
        scores: [{ axis: 'motivation', points: 2 }], // strong Vibes
      },
    ],
  },

  // ── Q2 — September Rain ─────────────────────────────────────────────────────
  // [Add a short sentence here describing what the song means and what it's
  //  written for before deploying — e.g. "September Rain is a song about ..."]
  {
    id: 2,
    scenario: 'September Rain',
    audioSrc: '/audio/September-Rain.mp3',
    audioLabel: '♫ Makoto Matsushita - September Rain',
    coverSrc: '/covers/september rain.jpg',
    questionText:
      'What do you like most about this song?',
    answers: [
      {
        label: 'A',
        text: 'The atmosphere and overall vibe',
        scores: [{ axis: 'motivation', points: 2 }], // strong Vibes
      },
      {
        label: 'B',
        text: 'The lyrics and what the song means',
        scores: [
          { axis: 'motivation', points: 2 }, // strong Vibes
          { axis: 'scope',      points: 1 }, // mild Holistic
        ],
      },
      {
        label: 'C',
        text: 'The song arrangement and how it\'s put together',
        scores: [
          { axis: 'scope', points: -2 }, // strong Detailed
          { axis: 'motivation', points: -1 } // mild Musicality
        ], 
      },
      {
        label: 'D',
        text: 'The chords and melody',
        scores: [{ axis: 'motivation', points: -1 }], // mild Musicality
      },
    ],
  },

  // ── Q3 — Pan Neo ────────────────────────────────────────────────────────────
  // This will sound very unfamiliar to most — reliable comfort/surprise filter.
  // If someone genuinely loves it, it's safe to nudge toward musicality.
  {
    id: 3,
    scenario: 'Pan Neo',
    audioSrc: '/audio/pan-neo.mp3',
    audioLabel: '♫ Keep - Pan Neo',
    coverSrc: '/covers/pan neo.jpg',
    questionText:
      'Listen to this song. Without overthinking it, what did you naturally focus on?',
    answers: [
      {
        label: 'A',
        text: 'The energy and the fast-paced, exciting mood of the whole section',
        scores: [
          { axis: 'motivation', points:  2 }, // strong Vibes
          { axis: 'scope',      points:  1 }, // mild Holistic
        ],
      },
      {
        label: 'B',
        text: 'The rhythm and the overall groove',
        scores: [
          { axis: 'momentum',   points:  1 }, // mild Immersion
          { axis: 'motivation', points:  1 }, // mild Vibes
        ],
      },
      {
        label: 'C',
        text: 'How interesting and creative everything sounds',
        scores: [{ axis: 'motivation', points: -2 }], // strong Musicality
      },
      {
        label: 'D',
        text: 'The technicality and interplay between the instruments',
        scores: [
          { axis: 'scope',      points: -2 }, // strong Detailed
          { axis: 'motivation', points: -1 }, // mild Musicality
        ],
      },
    ],
    secondQuestion: {
      questionText: 'On a scale of 1 to 4, how much do you enjoy this song? (1 = not at all)',
      answers: [
        {
          label: '1',
          text: 'Not at all',
          scores: [
            { axis: 'entropy', points:  2 }, // strong Comfort
            { axis: 'scope',   points:  1 }, // mild Holistic
          ],
        },
        {
          label: '2',
          text: 'A little',
          scores: [{ axis: 'entropy', points: 1 }], // mild Comfort
        },
        {
          label: '3',
          text: 'Quite a bit',
          scores: [{ axis: 'entropy', points: -1 }], // mild Surprise
        },
        {
          label: '4',
          text: 'A lot',
          scores: [
            { axis: 'entropy',    points: -1 }, // mild Surprise
            { axis: 'motivation', points: -1 }, // mild Musicality
          ],
        },
      ],
    },
  },

  // ── Q4 — Carti vs. Kendrick (cascade) ───────────────────────────────────────
  // The real question is which dimension — flow, lyrics, or music — matters most
  // to you. The two artists represent opposite ends of each. Carti+Music = vibes
  // (production/aesthetic). Kendrick+Music = musicality (arrangement/craft).
  {
    id: 4,
    scenario: 'Playboi Carti vs. Kendrick',
    questionText:
      'Between these two artists, which do you prefer and why?',
    answers: [
      {
        label: 'A',
        text: 'Playboi Carti',
        scores: [
          { axis: 'motivation', points: 3 }, // strong Vibes
        ],
        secondAnswers: [
          {
            label: 'A',
            text: 'His flow / the beat',
            scores: [
              { axis: 'momentum',   points: 1 }, // mild Immersion
              { axis: 'motivation', points: 1 }, // mild Vibes
            ],
          },
          {
            label: 'B',
            text: 'His lyrics, the writing and storytelling',
            scores: [{ axis: 'motivation', points: 2 }], // strong Vibes
          },
          {
            label: 'C',
            text: 'His music, the composition and production',
            scores: [{ axis: 'motivation', points: 5 }], // strong Vibes
          },
        ],
      },
      {
        label: 'B',
        text: 'Kendrick Lamar',
        scores: [],
        secondAnswers: [
          {
            label: 'A',
            text: 'His flow / the beat',
            scores: [
              { axis: 'momentum',   points: 1 }, // mild Immersion
              { axis: 'motivation', points: 1 }, // mild Vibes
            ],
          },
          {
            label: 'B',
            text: 'His lyrics, the writing and storytelling',
            scores: [{ axis: 'motivation', points: 2 }], // strong Vibes
          },
          {
            label: 'C',
            text: 'His music, the composition and production',
            scores: [{ axis: 'motivation', points: -2 }], // strong Musicality
          },
        ],
      },
      {
        label: '–',
        text: "I don't know these artists",
        scores: [],
      },
    ],
  },

  // ── Q5 — Composers ──────────────────────────────────────────────────────────
  // Group A (Medtner, Rachmaninoff, Beethoven): emotionally dense, harmonically
  // complex, structurally ambitious — leans Surprise + Musicality + Detailed.
  // Group B (Mozart, Chopin, Mahler): melodic beauty, accessible emotion,
  // refined elegance — leans Comfort + Holistic.
  // Adding musicality to both because anyone who knows these composers deserves it
  {
    id: 5,
    scenario: 'The Composers',
    questionText:
      'Compare these two groups of composers. Which group resonates with you more?',
    answers: [
      {
        label: 'A',
        text: 'Medtner, Rachmaninoff, Beethoven',
        scores: [
          { axis: 'motivation', points: -1 }, // mild Musicality
          { axis: 'entropy',    points: -2 }, // strong Surprise
          { axis: 'scope',      points: -1 }, // mild Detailed
        ],
      },
      {
        label: 'B',
        text: 'Mozart, Chopin, Mahler',
        scores: [
          { axis: 'motivation', points: -1 }, // mild Musicality
          { axis: 'entropy', points: 2 }, // strong Comfort
          { axis: 'scope',   points: 2 }, // strong Holistic
        ],
      },
      {
        label: '–',
        text: "I'm not familiar with these composers",
        scores: [],
      },
    ],
  },

  // ── Q6 — Rach Concerto 2: Pianist preference ────────────────────────────────
  {
    id: 6,
    scenario: 'The Concerto Opening',
    audioSrc: '/audio/richter-rach-2.mp3',
    audioLabel: 'Richter — Rachmaninoff Piano Concerto No. 2',
    audioSrc2: '/audio/zimerman-rach-2.mp3',
    audioLabel2: 'Zimerman — Rachmaninoff Piano Concerto No. 2',
    questionText:
      'Listen to these two pianists play the opening to a concerto. Which approach do you prefer musically?',
    answers: [
      {
        label: 'A',
        text: 'The first recording (Richter)',
        scores: [{ axis: 'momentum', points: -2 }], // strong Progression
      },
      {
        label: 'B',
        text: 'The second recording (Zimerman)',
        scores: [{ axis: 'momentum', points: 2 }], // strong Immersion
      },
    ],
  },

  // ── Q7 — Rach Concerto 2: Grading criteria ──────────────────────────────────
  {
    id: 7,
    scenario: 'The Concerto Opening',
    questionText:
      'If you were grading a pianist on how they played those opening chords, what would be your most important criteria?',
    answers: [
      {
        label: 'A',
        text: 'They need to create a sense of forward momentum and build a massive, continuous tension leading up to the orchestra',
        scores: [{ axis: 'scope', points: 2 }], // strong Holistic
      },
      {
        label: 'B',
        text: 'They need to perfectly balance the weight of every individual chord and bring out the beauty of the inner notes',
        scores: [{ axis: 'scope', points: -2 }], // strong Detailed
      },
    ],
  },

  // ── Q8 — Song Stuck in Head ──────────────────────────────────────────────────
  {
    id: 8,
    scenario: 'The Earworm',
    questionText: 'When a song gets stuck in your head, what about the song gets stuck?',
    answers: [
      {
        label: 'A',
        text: 'A random part I found catchy',
        scores: [{ axis: 'entropy', points: 2 }], // strong Comfort
      },
      {
        label: 'B',
        text: 'A specific section I thought was interesting',
        scores: [
          { axis: 'scope',      points: -1 }, // mild Detailed
          { axis: 'motivation', points: -1 }, // mild Musicality
        ],
      },
      {
        label: 'C',
        text: 'The moment when the song flipped on its head',
        scores: [{ axis: 'entropy', points: -2 }], // strong Surprise
      },
      {
        label: 'D',
        text: 'The general vibe or atmosphere of the song',
        scores: [{ axis: 'motivation', points: 2 }], // strong Vibes
      },
    ],
  },

  // ── Q9 — Studying ───────────────────────────────────────────────────────────
  {
    id: 9,
    scenario: 'The Study Session',
    questionText: 'Do you listen to music while studying for something important?',
    answers: [
      {
        label: 'A',
        text: 'No, music distracts me',
        scores: [{ axis: 'scope', points: -2 }], // strong Detailed
      },
      {
        label: 'B',
        text: 'Yes, music helps me lock in',
        scores: [
          { axis: 'motivation', points: 2 }, // strong Vibes
          { axis: 'momentum',   points: 2 }, // strong Immersion
        ],
      },
    ],
  },

  // ── Q10 — The Passionate Singer ─────────────────────────────────────────────
  // TODO: add Celine Dion — Ashes audio. The Spotify API approach mentioned in
  // the brief would require a separate backend integration; for now, drop the
  // audio file at /audio/celine dion ashes.mp3 and /covers/celine dion ashes.jpg.
  {
    id: 10,
    format: 'likert' as const,
    scenario: 'The Passionate Singer',
    audioSrc: '/audio/ashes.mp3',
    audioLabel: '♫ Céline Dion — Ashes',
    coverSrc: '/covers/ashes.jpg',
    questionText:
      'When you listen to an emotional singer, what do you focus on? You can use the song below as reference.',
    leftLabel: 'I connect with the raw emotion in their voice and the story/feeling they are trying to convey',
    rightLabel: 'I treat their voice like another instrument and focus more on the emotional impact of all the instruments',
    options: [
      { value: 1, scores: [{ axis: 'motivation', points:  2 }, { axis: 'scope', points:  1 }] }, // strong Vibes + mild Holistic
      { value: 2, scores: [{ axis: 'motivation', points:  1 }] },                                 // mild Vibes
      { value: 3, scores: [] },
      { value: 4, scores: [{ axis: 'motivation', points: -1 }] },                                 // mild Musicality
      { value: 5, scores: [{ axis: 'motivation', points: -2 }] },                                 // strong Musicality
    ],
  },

  // ── Q11 — Looking Glass ─────────────────────────────────────────────────────
  // Slider 1 tests comfort vs surprise: unconventional harmony filters comfort-
  // seekers. Slider 2 filters pseudo-intellectual "cool vibes" listeners —
  // Holdsworth's choices defy traditional theory, so liking them is a vibes
  // response, not a musicality one.
  {
    id: 11,
    format: 'likert' as const,
    scenario: 'Looking Glass',
    audioSrc: '/audio/Looking-Glass.mp3',
    audioLabel: '♫ Allan Holdsworth — Looking Glass',
    coverSrc: '/covers/looking glass.jpg',
    questionText: 'Listen to this song and answer the questions',
    leftLabel: 'This song is too weird for me to enjoy',
    rightLabel: 'I really enjoy this song',
    options: [
      { value: 1, scores: [{ axis: 'entropy', points:  2 }] }, // strong Comfort
      { value: 2, scores: [{ axis: 'entropy', points:  1 }] }, // mild Comfort
      { value: 3, scores: [] },
      { value: 4, scores: [{ axis: 'entropy', points: -1 }] }, // mild Surprise
      { value: 5, scores: [{ axis: 'entropy', points: -2 }] }, // strong Surprise
    ],
    secondScale: {
      leftLabel: "There's something wrong with this song musically",
      rightLabel: 'This song is creative and pushes the boundaries of music',
      options: [
        { value: 1, scores: [{ axis: 'motivation', points: -1 }] }, // Musicality
        { value: 2, scores: [] },
        { value: 3, scores: [] },
        { value: 4, scores: [{ axis: 'motivation', points:  1 }] }, // mild Vibes
        { value: 5, scores: [{ axis: 'motivation', points:  2 }] }, // strong Vibes
      ],
    },
  },

  // ── Q12 — Least Favourite Type ──────────────────────────────────────────────
  {
    id: 12,
    scenario: 'The Dealbreaker',
    questionText: 'Which type of song is your least favourite?',
    answers: [
      {
        label: 'A',
        text: 'A song that is technically perfect but contains little emotion',
        scores: [
          { axis: 'motivation', points: 1 }, // mild Vibes
          { axis: 'scope',      points: 1 }, // mild Holistic
        ],
      },
      {
        label: 'B',
        text: 'A song that has a lot of passion but is boring and has no originality',
        scores: [
          { axis: 'scope',   points: -1 }, // mild Detailed
          { axis: 'entropy', points: -2 }, // mild Surprise
        ],
      },
    ],
  },

  // ── Q13 — Feeling ──────────────────────────────────────────────
  {
    id: 13,
    scenario: 'Feel when listening to song',
    questionText: 'Pick your favorite genre of music. How do you feel when you listen to songs in that genre?',
    answers: [
      {
        label: 'A',
        text: 'I lock into a hypnotic groove or atmosphere and just float in that state',
        scores: [
          { axis: 'entropy', points: 1 }, // mild Comfort
          { axis: 'momentum',   points: 2 }, // strong Immersion
          { axis: 'motivation',   points: 1 }, // mild Vibes
        ],
      },
      {
        label: 'B',
        text: 'The music drives forward, it constantly evolves and pushes towards something',
        scores: [
          { axis: 'scope',   points: -1 }, // mild Detailed
          { axis: 'momentum', points: -2 }, // strong Progression
        ],
      },
      {
        label: 'C',
        text: 'It makes time blur, I get lost in the vibes of the songs',
        scores: [
          { axis: 'motivation', points: 2 }, // strong Vibes
          { axis: 'momentum',   points: 1 }, // mild Immersion
        ],
      },
      {
        label: 'D',
        text: 'I\'m actively paying attention to the details of each song',
        scores: [
          { axis: 'scope',   points: -2 }, // strong Detailed
        ],
      },
    ],
  },
  // ── Q14 — Playlist ──────────────────────────────────────────────
  {
    id: 14,
    scenario: 'Playlist',
    questionText: 'Imagine you\'re building a playlist. Which option best describes how you decide what songs go into that playlist?',
    answers: [
      {
        label: 'A',
        text: 'My playlists tell a story; the order of my songs matters a lot',
        scores: [
          { axis: 'scope', points: 2 }, // strong Holistic
          { axis: 'momentum',   points: -2 }, // strong Progression
        ],
      },
      {
        label: 'B',
        text: 'I make playlists based off how the songs make me feel',
        scores: [
          { axis: 'motivation', points: 2 }, // strong Vibes
          { axis: 'momentum',   points: 1 }, // mild Immersion
        ],
      },
      {
        label: 'C',
        text: 'I categorize songs based off their genre or quality',
        scores: [
          { axis: 'motivation', points: -2 }, // strong Musicality
          { axis: 'momentum',   points: 1 }, // mild Immersion
        ],
      },
      {
        label: 'D',
        text: 'I make playlists for specific activities or situations, like workouts, parties, or road trips',
        scores: [
          { axis: 'momentum', points: 2 }, // strong Immersion (consistent groove for the activity)
          { axis: 'entropy', points: 1 } // mild Comfort (familiar songs that fit the routine)
        ],
      }
    ],
  },
    // ── Q15 — Radio ──────────────────────────────────────────────
  {
    id: 15,
    scenario: 'Radio',
    questionText: 'You\'re at a concert for your favorite artist. Which option best describes your preferred setlist?',
    answers: [
      {
        label: 'A',
        text: 'Everything should be seamless so the atmosphere never gets interrupted',
        scores: [
          { axis: 'momentum',   points: 2 }, // strong Immersion
          { axis: 'motivation', points: 2 }, // strong Vibes
        ],
      },
      {
        label: 'B',
        text: 'I want the songs to relate together in a way that works musically',
        scores: [
          { axis: 'motivation', points: -2 }, // strong Musicality
          { axis: 'momentum',   points: -2 }, // strong Progression
        ],
      },
      {
        label: 'C',
        text: 'I want to hear my favorite songs',
        scores: [
          { axis: 'entropy', points: 2 } // strong Comfort
        ],
      }
    ],
  },
];
