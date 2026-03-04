import { Question } from './types';

/**
 * The question bank.
 *
 * Each answer carries a `scores` array that the engine applies in full —
 * a single answer can shift multiple axes by independent amounts.
 *
 * ── Axes ────────────────────────────────────────────────────────────────────
 *
 * motivation  (V / M)  Vibes ↔ Musicality
 * V  +  You are drawn in by raw emotion, mood, and feeling.
 * M  −  You are drawn in by craft, technique, and musical structure.
 *
 * entropy     (C / S)  Comfort ↔ Surprise
 * C  +  You gravitate toward the familiar — warmth of the known.
 * S  −  You gravitate toward the unexpected — novelty and risk.
 *
 * scope       (H / D)  Holistic ↔ Detailed
 * H  +  You perceive music as a whole atmosphere or gestalt.
 * D  −  You zero in on individual parts, layers, and micro-details.
 *
 * momentum    (I / P)  Immersion ↔ Progression
 * I  +  You want to stay locked inside a sustained moment or groove.
 * P  −  You want the music to evolve, build, and take you somewhere.
 *
 * ── Convention for points ───────────────────────────────────────────────────
 * +2  strong pull toward the positive trait  (V / C / H / I)
 * +1  mild pull toward the positive trait
 * −1  mild pull toward the negative trait    (M / S / D / P)
 * −2  strong pull toward the negative trait
 */
export const questions: Question[] = [
  // ============================================================================
  // PHASE 1: NO BACKGROUND, NO AUDIO
  // Focuses on overarching habits, alternating between Motivation, Scope, and Momentum.
  // ============================================================================

  // ── Q1 — Foreign Language Song ──────────────────────────────────────────────
  // Tests: Vibes vs. Musicality, Scope
    // ── Q2 — September Rain ─────────────────────────────────────────────────────
  // Tests: Vibes vs Musicality (First audio interaction)
  // [Add a short sentence here describing what the song means and what it's
  //  written for before deploying — e.g. "September Rain is a song about ..."]
  {
    id: 2,
    scenario: 'September Rain',
    audioSrc: '/audio/September-Rain.mp3',
    audioLabel: '♫ Makoto Matsushita - September Rain',
    coverSrc: '/covers/september rain.jpg',
    cinematicVideoSrc: '/backgrounds/september%20rain.mp4',
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
          { axis: 'scope',      points: 1 }, // mild Holistic
        ],
      },
      {
        label: 'C',
        text: 'The song arrangement and how it\'s put together',
        scores: [
          { axis: 'scope', points: -2 }, // strong Detailed
        ], 
      },
      {
        label: 'D',
        text: 'The chords and melody',
        scores: [{ axis: 'motivation', points: -2 }], // strong Musicality
      },
    ],
  },

  // ── Q9 — Studying ───────────────────────────────────────────────────────────
  // Tests: Momentum, Entropy, Scope (Breaks up the Vibes focus of Q1)
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
        text: 'Yes, most music helps me lock in',
        scores: [
          { axis: 'momentum',   points: 2 }, // strong Immersion
        ],
      },
      {
        label: 'C',
        text: 'Yes, but I have to listen to comfort songs',
        scores: [
          { axis: 'entropy',   points: 2 }, // strong Comfort
          { axis: 'momentum',   points: 1 }, // mild Immersion
        ],
      },
      {
        label: 'D',
        text: 'Yes, but I need interesting music to keep my brain active',
        scores: [
          { axis: 'scope', points: -1 }, // mild Detailed
          { axis: 'momentum', points: -1 }, // mild Progression
          { axis: 'entropy',    points: -1 }, // mild Surprise
        ],
      },
    ],
  },

  // ── Q14 — Playlist ──────────────────────────────────────────────
  // Tests: Scope, Vibes, Musicality
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
        ],
      },
      {
        label: 'C',
        text: 'I categorize songs based off their genre or quality',
        scores: [
          { axis: 'motivation', points: -2 }, // strong Musicality
        ],
      },
      {
        label: 'D',
        text: 'I make playlists for specific activities or situations, like workouts, parties, or road trips',
        scores: [
          { axis: 'momentum', points: 1 }, // mild Immersion (consistent groove for the activity)
        ],
      }
    ],
  },


  // ── Q5 — Composers ──────────────────────────────────────────────────────────
  // Tests: Comfort vs Surprise, Holistic vs Detailed (CLASSICAL #1)
  {
    id: 5,
    scenario: 'The Composers',
    cinematicVideoSrc: '/backgrounds/beethoven.mp4',
    cinematicBlur: { paused: '5px', playing: '0px' },
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

  // ── Q16 — Structural Purpose ──────────────────────────────────────────────
  // Tests: Momentum heavily (Breaks up the Scope/Vibes focus of Q14)
  {
    id: 16,
    scenario: 'The Purpose',
    questionText: 'Does a song usually need to have a clear direction or destination for you to enjoy it?',
    answers: [
      {
        label: 'A',
        text: 'No, I\'m fine with a song that locks into a groove or atmosphere and stays in it',
        scores: [
          { axis: 'momentum',   points: 2 }, // strong Immersion
        ],
      },
      {
        label: 'B',
        text: 'Yes, I prefer music that evolves, builds tension, and takes me somewhere',
        scores: [
          { axis: 'momentum',   points: -2 }, // strong Progression
        ],
      },
      {
        label: 'C',
        text: 'No, as long as the feeling or mood is strong enough, it doesn\'t need to go anywhere',
        scores: [
          { axis: 'motivation', points: 2 }, // strong Vibes
          { axis: 'momentum',   points: 1 }, // mild Immersion
        ],
      },
      {
        label: 'D',
        text: 'Yes, I usually want the song to have some kind of purpose or structure',
        scores: [
          { axis: 'scope',      points: -1 }, // mild Detailed
          { axis: 'momentum',   points: -2 }, // mild Progression
        ],
      },
    ],
  },

  {
    id: 30,
    scenario: 'The First Impression',
    questionText: 'You are thirty seconds into a brand new track. What is your brain naturally doing?',
    answers: [
      {
        label: 'A',
        text: 'Taking in the overarching mood and painting a mental picture of the whole environment',
        scores: [{ axis: 'scope', points: 2 }], // strong Holistic
      },
      {
        label: 'B',
        text: 'Listening to the melody, a specific instrument or vocalist, or a rhythm that caught your attention',
        scores: [{ axis: 'scope', points: -2 }], // strong Detailed
      },
    ],
  },

  // ── Q10 — The Passionate Singer ─────────────────────────────────────────────
  // Tests: Vocals & Motivation
  {
    id: 10,
    format: 'likert' as const,
    scenario: 'The Passionate Singer',
    cinematicVideoSrc: '/backgrounds/ashes.mp4',
    cinematicBlur: { paused: '10px', playing: '3px' },
    audioSrc: '/audio/ashes.mp3',
    audioLabel: '♫ Céline Dion — Ashes',
    coverSrc: '/covers/ashes.jpg',
    questionText:
      'When you listen to an emotional singer, what do you focus on? You can use the song below as reference.',
    leftLabel: 'I mostly connect with the emotion in their voice and the story/feeling they are trying to convey',
    rightLabel: 'I treat their voice like another instrument and focus more on the emotional impact of all the instruments',
    options: [
      { value: 1, scores: [{ axis: 'motivation', points:  2 }] }, // strong Vibes
      { value: 2, scores: [{ axis: 'motivation', points:  1 }] }, // mild Vibes
      { value: 3, scores: [] },
      { value: 4, scores: [{ axis: 'motivation', points: -1 }] }, // mild Musicality
      { value: 5, scores: [{ axis: 'motivation', points: -2 },  // strong Musicality
        { axis: 'scope',      points: -1 }, // mild Detailed
      ] },
    ],
  },

  // ── Q8 — Song Stuck in Head ──────────────────────────────────────────────────
  // Tests: Entropy, Memory, Motivation
  {
    id: 8,
    scenario: 'The Earworm',
    questionText: 'When you\'re replaying a song in your head, what are you usually replaying?',
    answers: [
      {
        label: 'A',
        text: 'A random part I found catchy',
        scores: [{ axis: 'entropy', points: 1 }], // mild Comfort
      },
      {
        label: 'B',
        text: 'A section I thought was interesting',
        scores: [
          { axis: 'scope', points: -2 }, // strong Detailed
        ],
      },
      {
        label: 'C',
        text: 'A cool moment in the song where everything changes up',
        scores: [{ axis: 'entropy', points: -2 }], // strong Surprise
      },
      {
        label: 'D',
        text: 'The general vibe or atmosphere of the song',
        scores: [{ axis: 'motivation', points: 2 }], // strong Vibes
      },
      {
        label: 'E',
        text: 'A section I find really beautiful',
        scores: [{ axis: 'motivation', points: -2 }], // strong Musicality
      },
    ],
  },

  // ── Q13 — Feeling ──────────────────────────────────────────────
  // Tests: Immersion vs Progression
  {
    id: 13,
    scenario: 'Feel when listening to a song',
    questionText: 'Pick your favorite genre of music. How do you feel when you listen to songs in that genre?',
    answers: [
      {
        label: 'A',
        text: 'I lock into a hypnotic state and just float there',
        scores: [
          { axis: 'momentum',   points: 2 }, // strong Immersion
          { axis: 'motivation',   points: 1 }, // mild Vibes
        ],
      },
      {
        label: 'B',
        text: 'The music is interesting and drives forward, it constantly pushes towards something',
        scores: [
          { axis: 'momentum', points: -2 }, // strong Progression
        ],
      },
      {
        label: 'C',
        text: 'I\'m actively paying attention to the details of each song',
        scores: [
          { axis: 'scope',   points: -2 }, // strong Detailed
        ],
      },
    ],
  },

  {
    id: 27,
    scenario: 'The Masterpiece',
    questionText: 'When you declare a song a masterpiece, what is usually the defining reason?',
    answers: [
      {
        label: 'A',
        text: 'It captures an emotion, mood, or atmosphere perfectly in a way that deeply moves me',
        scores: [{ axis: 'motivation', points: 1 }], // weak Vibes
      },
      {
        label: 'B',
        text: 'The sheer brilliance of the composition and the beauty of the music itself',
        scores: [{ axis: 'motivation', points: -1 }], // weak Musicality
      },
    ],
  },

  // ── Q11 — Tokyo Dream ─────────────────────────────────────────────────────
  // Tests: Extreme Entropy, Boundary-pushing
  {
    id: 11,
    format: 'likert' as const,
    scenario: 'Tokyo Dream',
    cinematicVideoSrc: '/backgrounds/holdsworth.mp4',
    cinematicBlur: { paused: '10px', playing: '3px' },
    audioSrc: '/audio/tokyo dream.mp3',
    audioLabel: '♫ Allan Holdsworth — Tokyo Dream',
    coverSrc: '/covers/tokyo dream.jpg',
    questionText: 'What are your thoughts on this song?',
    leftLabel: 'This song is weird',
    rightLabel: 'This song is cool',
    options: [
      { value: 1, scores: [{ axis: 'entropy', points:  2 }] }, // strong Comfort
      { value: 2, scores: [{ axis: 'entropy', points:  1 }] }, // mild Comfort
      { value: 3, scores: [] },
      { value: 4, scores: [{ axis: 'entropy', points: -1 }] }, // mild Surprise
      { value: 5, scores: [{ axis: 'entropy', points: -2 }] }, // strong Surprise
    ],
  },

    // ── Q3 — Pan Neo ────────────────────────────────────────────────────────────
  // Tests: Entropy, Momentum (Breaks up the heavy "Vibes" focus of Q2)
  {
    id: 3,
    scenario: 'Pan Neo',
    audioSrc: '/audio/pan-neo.mp3',
    audioLabel: '♫ Keep - Pan Neo',
    coverSrc: '/covers/pan neo.jpg',
    cinematicImageSrc: '/backgrounds/pan%20neo.jpg',
    cinematicBlur: { paused: '10px', playing: '3px' },
    questionText:
      'Listen to this song. Without overthinking it, what did you naturally focus on?',
    answers: [
      {
        label: 'A',
        text: 'The energy and the mood of the whole section',
        scores: [
          { axis: 'motivation', points:  1 }, // mild Vibes
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
        text: 'How interesting and creative everything is',
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
      {
        label: 'E',
        text: 'How weird it sounds',
        scores: [
          { axis: 'entropy', points:  2 }, // strong Comfort
        ],
      },
    ],
    secondQuestion: {
      questionText: 'How much did you enjoy this song?',
      answers: [
        {
          label: '1',
          text: 'Not at all',
          scores: [
            { axis: 'entropy', points:  2 }, // strong Comfort
          ],
        },
        {
          label: '2',
          text: 'A little',
          scores: [{ axis: 'entropy', points: -1 }], // mild Surprise
        },
        {
          label: '3',
          text: 'Quite a bit',
          scores: [{ axis: 'entropy', points: -2 }], // strong Surprise
        },
        {
          label: '4',
          text: 'A lot',
          scores: [
            { axis: 'entropy',    points: -2 }, // strong Surprise
            { axis: 'motivation', points: -1 }, // mild Musicality
          ],
        },
      ],
    },
  },

  // ── Q4 — Carti vs. Kendrick (cascade) ───────────────────────────────────────
  // Tests: Motivation, Momentum
  {
    id: 4,
    scenario: 'Playboi Carti vs. Kendrick',
    cinematicVideoSrc: '/backgrounds/kendrick.mp4',
    cinematicBlur: { paused: '5px', playing: '3px' },
    questionText:
      'Between these two artists, which do you prefer and why?',
    answers: [
      {
        label: 'A',
        text: 'Playboi Carti',
        scores: [
          { axis: 'motivation', points: 2 }, // strong Vibes
        ],
        secondAnswers: [
          {
            label: 'A',
            text: 'His flow / the beat',
            scores: [
              { axis: 'momentum',   points: 2 }, // mild Immersion
            ],
          },
          {
            label: 'B',
            text: 'His lyrics, the writing and storytelling',
            scores: [{ axis: 'motivation', points: 1 }, // mild Vibes
                    { axis: 'momentum',   points: 1 }, // mild Immersion
            ], 
          },
          {
            label: 'C',
            text: 'His music, the composition and production',
            scores: [{ axis: 'motivation', points: 2 }], // strong Vibes
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
            ],
          },
          {
            label: 'B',
            text: 'His lyrics, the writing and storytelling',
            scores: [{ axis: 'motivation', points: 1 }, // mild Vibes
              { axis: 'momentum',   points: 1 }, // mild Immersion
            ], 
          },
          {
            label: 'C',
            text: 'His music, the composition and production',
            scores: [
              { axis: 'motivation', points: -1 }, // mild Musicality
              { axis: 'scope',      points: -1 }, // mild Detailed
            ], 
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

{
    id: 22,
    scenario: 'The Learning Curve',
    questionText: 'You are listening to music on autoplay and a new song comes on. It sounds a little weird and not like what you usually listen to. What is your immediate reflex?',
    answers: [
      {
        label: 'A',
        text: 'I\'ll let it play out for a bit',
        scores: [{ axis: 'entropy', points: -2 }], // strong Surprise
      },
      {
        label: 'B',
        text: 'I\'ll probably skip it',
        scores: [{ axis: 'entropy', points: 2 }], // strong Comfort
      },
    ],
  },
  {
    id: 32,
    scenario: 'The Loop',
    questionText: 'A song features a heavily repetitive instrumental beat or loop. How do you naturally react to it?',
    answers: [
      {
        label: 'A',
        text: 'If the groove is perfect, I could listen to it loop forever without it ever needing to change',
        scores: [{ axis: 'momentum', points: 2 }], // strong Immersion
      },
      {
        label: 'B',
        text: 'It needs to do something or build towards something to keep me engaged',
        scores: [{ axis: 'momentum', points: -2 }], // strong Progression
      },
    ],
  },
  {
    id: 23,
    scenario: 'The Listening History',
    questionText: 'If you looked at your listening stats over the last year, what would be the most obvious trend?',
    answers: [
      {
        label: 'A',
        text: 'I cycle through a lot of different phases and pick up new artists, genres, or albums to obsess over',
        scores: [{ axis: 'entropy', points: -2 }], // strong Surprise
      },
      {
        label: 'B',
        text: 'I rely on a core group of artists, albums, or playlists that I’ve trusted and loved for a long time',
        scores: [{ axis: 'entropy', points: 2 }], // strong Comfort
      },
    ],
  },
  {
    id: 25,
    format: 'likert' as const,
    scenario: 'Remix Evaluation',
    questionText: 'When listening to a remix of a familiar song, where does your attention go?',
    leftLabel: 'The new mood and how it transforms the original feel',
    rightLabel: 'Individual changes and how it differs from the original song',
    options: [
      { value: 1, scores: [{ axis: 'scope', points:  2 }] }, // strong Holistic
      { value: 2, scores: [{ axis: 'scope', points:  1 }] }, // mild Holistic
      { value: 3, scores: [] },
      { value: 4, scores: [{ axis: 'scope', points: -1 }] }, // mild Detailed
      { value: 5, scores: [{ axis: 'scope', points: -2 }] }, // strong Detailed
      ],
  },
  {
    id: 26,
    scenario: 'Workout Playlist',
    questionText: 'What kind of music keeps you motivated during a workout?',
    answers: [
    {
    label: 'A',
    text: 'Tracks with a steady, repetitive beat that let me zone out and maintain pace',
    scores: [{ axis: 'momentum', points: 2 }], // strong Immersion
    },
    {
    label: 'B',
    text: 'Songs that build intensity gradually, with drops or climaxes to push me forward',
    scores: [{ axis: 'momentum', points: -2 }], // strong Progression
    },
    ],
    }

];