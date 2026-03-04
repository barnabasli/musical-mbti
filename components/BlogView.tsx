'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';

interface BlogViewProps {
  onBack: () => void;
}

export function BlogView({ onBack }: BlogViewProps) {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="relative min-h-screen bg-[#F3F5F8] px-6 py-16 md:px-12 lg:px-20"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5A98BE]/4 blur-[200px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">

        {/* Back button */}
        <button
          onClick={onBack}
          className="mb-12 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#6B8FAB] transition-colors hover:text-[#1A2133]"
        >
          ← Back to Results
        </button>

        {/* Title */}
        <h2 className="mb-6 text-2xl font-black text-[#1A2133]">Behind the Test</h2>

        {/* Disclaimer + Intro */}
        <section className="mb-14">
          <p className="text-base leading-[1.85] text-[#4E5F77]">
            First, I want to add a quick disclaimer: this is not a scientifically or psychologically grounded assessment. While I&apos;ve tried my best to make this framework as fair and unbiased as possible, please remember that the questions and ideologies behind this test were designed by a 22-year-old without a degree in music or psychology. Although I&apos;ve tested this with a few friends, there are no rigorous studies backing my methodology. Basically, what I&apos;m trying to say is, don&apos;t take this too seriously.
            <br /><br />
            That being said, music and psychology are both topics I care about, and therefore I&apos;ve put a level of effort into making this test that I typically wouldn&apos;t do for other side projects. If you&apos;re curious about the philosophy, mechanics, and considerations behind the test, read on.
          </p>
        </section>

        <div className="mb-14 h-px bg-[#D8DFE8]" />

        {/* Methodology */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-black text-[#1A2133]">Methodology</h2>
          <p className="mb-10 text-base leading-[1.85] text-[#4E5F77]">
            Designing an MBTI for music is incredibly difficult because how we process audio is influenced by countless external variables. To make this test function properly, I established a few core design rules:
          </p>

          <div className="flex flex-col gap-9">

            <div>
              <h3 className="mb-3 text-base font-bold text-[#1A2133]">Testing Impulse Over Ability</h3>
              <p className="text-base leading-[1.85] text-[#4E5F77]">
                The questions are formulated around your natural inclinations and immediate impulses. Much like how your everyday behaviors change over time, your responses and placement on these axes can easily shift. I am not testing what you are capable of analyzing; I am testing what your brain naturally defaults to.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-base font-bold text-[#1A2133]">Eliminating the &ldquo;Right&rdquo; Answer</h3>
              <p className="text-base leading-[1.85] text-[#4E5F77]">
                I deliberately framed the scenarios so that no single answer feels inherently &ldquo;better&rdquo; or more desirable than the rest. I wanted to eliminate the pressure of picking an answer just because it sounds smarter or cooler.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-base font-bold text-[#1A2133]">Avoiding Popular Music</h3>
              <p className="text-base leading-[1.85] text-[#4E5F77]">
                Your taste is shaped by exposure, environment, and social variables, and therefore, asking &ldquo;Do you like this song?&rdquo; about a popular track can introduce some positive or negative biases that I&apos;d prefer to avoid. I do think that a more accurate test would involve more listening, but potential biases due to genre and other factors are difficult to negate without substantial effort. Therefore, the majority of the test relies on questions without music, and the few songs present are relatively obscure tracks placed to capture your raw and unfiltered reaction.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-base font-bold text-[#1A2133]">The Exposure Gap</h3>
              <p className="text-base leading-[1.85] text-[#4E5F77]">
                Bridging the gap between people with and without formal music training is extremely difficult and makes it hard to test certain things, especially the axis of Holistic v Detailed. A listener&apos;s ability to process complex music is heavily linked to their previous musical exposure, as well as certain biological and psychological traits. To account for this, I&apos;ve decided primarily to test this axis through written questions rather than questions involving listening. It&apos;s not fair to expect the same level of attention to detail from an average person compared to someone with a PHD in sound composition.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-base font-bold text-[#1A2133]">A Note on Lyrics & Aesthetics</h3>
              <p className="text-base leading-[1.85] text-[#4E5F77]">
                Many people listen to music purely for the lyrics, the aesthetic, or the artist&apos;s persona. If you fall entirely into this group, your results here will likely be inaccurate and you probably didn&apos;t know how to respond to a lot of the questions. This test is specifically designed to measure the function of music and how the actual sound interacts with your brain. Lyrics introduce an entirely new dimension that I didn&apos;t feel like I could capture easily, and therefore the test doesn't account for it very well.
              </p>
            </div>

          </div>
        </section>

        <div className="mb-14 h-px bg-[#D8DFE8]" />

        {/* The Four Axes */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-black text-[#1A2133]">The Four Axes</h2>

          <div className="flex flex-col gap-14">

            {/* Axis 1 */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                  style={{ backgroundColor: '#5A98BE18', color: '#5A98BE', border: '1.5px solid #5A98BE45' }}
                >
                  1
                </span>
                <h3 className="text-lg font-black text-[#1A2133]">Motivation: Vibes vs. Musicality</h3>
              </div>
              <p className="mb-5 text-base leading-[1.85] text-[#4E5F77]">
                I would argue this is the most polarizing distinction in how people approach music. This spectrum measures whether you are drawn in by the pure emotion and atmosphere a track gives off, or if you enjoy it because of the underlying framework and musical craft.
              </p>
              <p className="mb-5 text-base leading-[1.85] text-[#4E5F77]">
                I want to clarify a common misconception here: your placement on this spectrum is NOT an indicator of your natural ability, &ldquo;music IQ,&rdquo; or intelligence. I have a friend who has proven himself to be a very talented musician through competitions, who also happens to have perfect pitch. It&apos;s pretty clear that he has a high &ldquo;music IQ&rdquo;, yet many of his playlists consist entirely of low-effort rap and trap. I&apos;ve asked him about this, and he said he listens purely for the vibes.
              </p>
              <p className="text-base leading-[1.85] text-[#4E5F77]">
                Similarly, music taste does not dictate general intelligence. For example, look at{' '}
                <a
                  href="https://open.spotify.com/playlist/1yfvwkxXDxtTOqFUvDWaG0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#6B8FAB] underline underline-offset-2 transition-colors hover:text-[#1A2133]"
                >
                  this Spotify playlist
                </a>
                {' '}comprised mostly of pop. The creator of this playlist is one of the top competitive programmers in the world; someone objectively brilliant who just happens to enjoy uncomplicated, straightforward music. This is not to bash on pop, but rather to dispel a stereotype often associated with the genre; liking pop doesn&apos;t make you dumb.
              </p>
            </div>

            {/* Axis 2 */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                  style={{ backgroundColor: '#6FA88218', color: '#6FA882', border: '1.5px solid #6FA88245' }}
                >
                  2
                </span>
                <h3 className="text-lg font-black text-[#1A2133]">Entropy: Comfort vs. Surprise</h3>
              </div>
              <p className="mb-5 text-base leading-[1.85] text-[#4E5F77]">
                I debated including this axis because it feels more like a standard personality trait than a musical one. However, your personality directly dictates how you appreciate art, and I&apos;ve found that this distinction matters a lot and is reflected quite significantly in someone&apos;s music taste. Why is it that you can guess what songs your friends listen to just by observing how they behave?
              </p>
              <p className="mb-5 text-base leading-[1.85] text-[#4E5F77]">
                Testing this was harder than I anticipated. I originally planned to rely solely on jazz songs to test this, since the genre relies on unconventional chords and rhythms that still follow musici theory. I still think this is a good way to test the axis, as I don&apos;t want all questions to be theoretical; it's important to actually listen to something and gauge your reaction. However, I realized that listeners without prior exposure to jazz wouldn&apos;t always hear surprise; their brains would just categorize it as dissonant noise due to it being an incredibly unfamiliar pattern, forcing them to lean heavily towards comfort by default. To account for this, I also included questions that test your tolerance for friction and novelty in more psychologically grounded ways. 
              </p>
              <p className="text-base leading-[1.85] text-[#4E5F77]">
                Before including these questions, I also thought about whether someone&apos;s openness to new experiences can actually directly correlate to their openness towards new music, and I&apos;ve been unable to answer it for myself because I believe music has some inherent properties that easily conflict with this. However, there have been papers published proving there is at least a correlation, so therefore I won&apos;t think too hard about it and just accept what&apos;s been done by people with more education than me. If you&apos;re curious about this study, you can read about it{' '}
                <a
                  href="https://gosling.psy.utexas.edu/wp-content/uploads/2014/09/JPSP03musicdimensions.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#6B8FAB] underline underline-offset-2 transition-colors hover:text-[#1A2133]"
                >
                  here
                </a>
                .
              </p>
            </div>

            {/* Axis 3 */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                  style={{ backgroundColor: '#9A7EC218', color: '#9A7EC2', border: '1.5px solid #9A7EC245' }}
                >
                  3
                </span>
                <h3 className="text-lg font-black text-[#1A2133]">Scope: Holistic vs. Detailed</h3>
              </div>
              <p className="mb-5 text-base leading-[1.85] text-[#4E5F77]">
                This is the musical equivalent of function vs. form; do you care more about how a song is as a whole, or are you drawn towards the things comprising it?
              </p>
              <p className="mb-5 text-base leading-[1.85] text-[#4E5F77]">
                I was inspired to make this axis by studying two polarizing recordings of Rachmaninoff&apos;s Piano Concerto No. 2 by Krystian Zimerman and Sviatoslav Richter. Both recordings are definitive masterpieces with cult followings, but with entirely different philosophies. A summary of what I believe to be their key difference is as follows:
              </p>
              <div className="my-6 flex flex-col gap-4 rounded-xl border border-[#DDE4EE] bg-[#F8FAFC] px-6 py-5">
                <div>
                  <span className="text-sm font-bold text-[#1A2133]">Zimerman: </span>
                  <span className="text-sm leading-relaxed text-[#4E5F77]">
                    Deeply introspective, highly expressive, bending the tempo to perfectly execute the beauty of each individual section.
                  </span>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#1A2133]">Richter: </span>
                  <span className="text-sm leading-relaxed text-[#4E5F77]">
                    Maintains strict rhythmic discipline, sacrificing micro-expression for the sake of amplifying the massive structural impact of later passages.
                  </span>
                </div>
              </div>
              <p className="text-base leading-[1.85] text-[#4E5F77]">
                I believe the philosophy behind how these two pianists chose to approach this song is something distinct and worth examining, as well as something that can be generalized into how people treat music: do you care more about the moment-to-moment details, or the entirety of the song and what it represents?
              </p>
            </div>

            {/* Axis 4 */}
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black"
                  style={{ backgroundColor: '#C4924A18', color: '#C4924A', border: '1.5px solid #C4924A45' }}
                >
                  4
                </span>
                <h3 className="text-lg font-black text-[#1A2133]">Momentum: Immersion vs. Progression</h3>
              </div>
              <p className="mb-5 text-base leading-[1.85] text-[#4E5F77]">
                This tests whether you lean toward music that envelops and sustains a specific mood or music that builds, evolves, and takes you on a journey. For example, some people can sit with an unchanging minimalist track or repetitive ASMR for hours, while others need the song to go somewhere to be satisfied.
              </p>
              <p className="text-base leading-[1.85] text-[#4E5F77]">
                I was pretty conflicted about whether to include this axis because of its inherent overlap with the others. Progression overlaps with Holistic, as if you need music to progress, you may also care about its overall structure. Immersion also overlaps with Comfort, as if you are immersed, you are likely comfortable. However, every axis overlaps in some way, and this holds true for almost all methods of classification in psychology, including the MBTI test this was based on. Again, I&apos;ve decided not to think to deeply about it as this is ultimately something I&apos;ve made for fun; it&apos;s not meant to be a definitive scientific measure.
              </p>
            </div>

          </div>
        </section>

        <div className="mb-14 h-px bg-[#D8DFE8]" />

        {/* Scoring Engine */}
        <section className="mb-14">
          <h2 className="mb-6 text-2xl font-black text-[#1A2133]">How the Scoring Engine Actually Works</h2>
          <p className="mb-5 text-base leading-[1.85] text-[#4E5F77]">
            You might be wondering how the test actually calculates your result. As you probably expected, every answer you pick carries a specific weight that pulls you toward one end of an axis or the other. For example, picking an answer might give you +2 points towards Vibes and -1 point towards Detailed. At the end of the test, if your final score for a specific axis is greater than or equal to zero, you get the positive letter (like V). If it drops below zero, you get the negative letter (like M).
          </p>
          <p className="mb-5 text-base leading-[1.85] text-[#4E5F77]">
            However, many questions test more than one axis, and so a more standard scoring algorithm doesn&apos;t work. In a normal quiz, the system calculates your percentage based on a static maximum score. But what happens if you skip a question because you don&apos;t recognize the composers? Or what if you pick an answer that heavily tests Immersion, but has absolutely zero effect on your Scope? If the test used a static maximum score, skipping a question or picking a result not corresponding to an axis that is present would artificially dilute your final percentages. You would look like you had a weak preference just because you didn&apos;t answer a question that didn&apos;t apply to you.
          </p>
          <p className="mb-6 text-base leading-[1.85] text-[#4E5F77]">
            Therefore, the scoring algorithm includes a dynamic bounds calculator. Before you even see your results, the code looks at every possible path you could have taken through the test and maps out the absolute maximum and minimum points possible for every single question. Then, it looks at your specific answer history. The engine only adds a question&apos;s maximum potential points to your final scale if your chosen answer actually affected that axis. If you pick an answer that awards zero points for Scope, the engine completely erases that question&apos;s theoretical Scope points from your total possible bounds.
          </p>
          <div className="rounded-xl border border-[#DDE4EE] bg-[#F8FAFC] px-6 py-5">
            <p className="text-sm leading-[1.75] text-[#4E5F77]">
              <span className="font-bold text-[#1A2133]">TLDR: </span>
              You are only graded on the battles you choose to fight. The scoring algorithm adjusts on the fly, so your final results are an unbiased reflection of the choices you actually engaged with.
            </p>
          </div>
        </section>

        <div className="mb-14 h-px bg-[#D8DFE8]" />

        {/* Conclusion */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-black text-[#1A2133]">Conclusion</h2>
          <p className="text-base leading-[1.85] text-[#4E5F77]">
            I hope that you&apos;ve found this test or blog to be insightful, and that this framework has opened your mind a bit more to the mechanics behind why we enjoy the music that we do. It really is an interesting field that has surprisingly little definitive research behind it.
          </p>
        </section>

      </div>
    </motion.div>
  );
}
