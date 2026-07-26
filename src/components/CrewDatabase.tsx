import { useEffect, useRef, type CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IMAGES } from '@/lib/images';

gsap.registerPlugin(ScrollTrigger);

/* ─── data ─── */
type CrewMember = {
  file: string;
  codename: string;
  name: string;
  quote: string;
  img: string;
  side: 'left' | 'right';
  z: number; // initial translateZ depth (px)
};

// Rebecca opens the exhibition (closest to camera, arrives first);
// Lucy closes it (deepest, arrives last). Even 1600px spacing so the
// fade windows crossfade slightly — no dead space between characters.
const CREW: CrewMember[] = [
  {
    file: 'FILE 01',
    codename: 'THE LITTLE DEVIL',
    name: 'Rebecca',
    quote: "I don't do second chances.",
    img: IMAGES.crew.rebecca,
    side: 'left',
    z: -1200,
  },
  {
    file: 'FILE 02',
    codename: 'THE PATRIARCH',
    name: 'Maine',
    quote: "The streets don't forget. Neither do I.",
    img: IMAGES.crew.maine,
    side: 'right',
    z: -2800,
  },
  {
    file: 'FILE 03',
    codename: 'THE GHOST',
    name: 'Kiwi',
    quote: 'Every secret has a price. I collect.',
    img: IMAGES.crew.kiwi,
    side: 'left',
    z: -4400,
  },
  {
    file: 'FILE 04',
    codename: 'THE BLADE',
    name: 'Dorio',
    quote: 'Loyalty is the only currency I trust.',
    img: IMAGES.crew.dorio,
    side: 'right',
    z: -6000,
  },
  {
    file: 'FILE 05',
    codename: 'THE LOUDMOUTH',
    name: 'Pilar',
    quote: 'Talk big. Hit harder.',
    img: IMAGES.crew.pilar,
    side: 'left',
    z: -7600,
  },
  {
    file: 'FILE 06',
    codename: 'THE KID',
    name: 'David Martinez',
    quote: "I'm not trying to be a legend. I'm trying to stay alive.",
    img: IMAGES.crew.david,
    side: 'right',
    z: -9200,
  },
  {
    file: 'FILE 07',
    codename: 'THE MOON DREAMER',
    name: 'Lucy Kushinada',
    quote: "I'll take you to the moon. If you're ready to fall.",
    img: IMAGES.crew.lucy,
    side: 'left',
    z: -10800,
  },
];

// Scroll progress 0→1 is multiplied by TOTAL_DEPTH and added to every
// character's initial z, driving the whole cast forward through the camera.
const TOTAL_DEPTH = 12000;

// Text reveals once a character is close to the camera, finishing as it
// passes — so the codename/name/quote are readable right at the focal moment.
const REVEAL_THRESHOLD = -700; // z at which FILE begins to appear
const REVEAL_WINDOW = 1100; // z-range over which the four lines stagger in

// Opacity curve — quick fade-in, a tight full-opacity plateau near the
// camera, then a natural fade-out that completes well before the perspective
// plane (so characters never invert or blow up as they pass the viewer).
const FADE_NEAR = 1000; // fade-in begins at z = -FADE_NEAR
const PLATEAU = 200; // full opacity while |z| <= PLATEAU
const FADE_FAR = 700; // fade-out completes at z = +FADE_FAR (kept < perspective)

const depthOpacity = (z: number): number => {
  if (z <= -FADE_NEAR) return 0;
  if (z < -PLATEAU) return (z + FADE_NEAR) / (FADE_NEAR - PLATEAU);
  if (z <= PLATEAU) return 1;
  if (z < FADE_FAR) return 1 - (z - PLATEAU) / (FADE_FAR - PLATEAU);
  return 0;
};

const easePower3Out = (t: number) => 1 - Math.pow(1 - gsap.utils.clamp(0, 1, t), 3);

/* ─── section header (static) ─── */
function SectionHeader() {
  return (
    <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-28 pb-20 text-center">
      <p className="font-mono text-[11px] tracking-[0.5em] text-cyber-magenta">
        // CREW DATABASE
      </p>
      <h2 className="mt-5 font-display text-[clamp(3rem,10vw,7rem)] font-black leading-[0.95] tracking-tight text-white">
        LEGENDS <span style={{ color: '#FFE600' }}>NEVER</span> DIE.
      </h2>
      <p className="mt-6 font-body text-lg italic text-gray-500">
        Every legend leaves a mark.
      </p>
      <div
        className="mt-10 h-px w-20"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.5), transparent)' }}
      />
    </div>
  );
}

/* ─── single character scene (static 3D positioning) ─── */
function CrewScene({
  member,
  index,
  sceneRef,
  textRefs,
}: {
  member: CrewMember;
  index: number;
  sceneRef: (el: HTMLDivElement | null) => void;
  textRefs: (els: (HTMLParagraphElement | HTMLHeadingElement | null)[]) => void;
}) {
  const isLeft = member.side === 'left';

  const sceneStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transform: `translateZ(${member.z}px)`,
    opacity: 0,
    pointerEvents: 'none',
  };

  // Portrait + text belong to the same visual composition: a single
  // centered flex row so the text always sits beside its own portrait
  // (40–60px gap) and never drifts toward the screen edges.
  const composeStyle: CSSProperties = {
    position: 'absolute',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'min(900px, 92vw)',
    display: 'flex',
    alignItems: 'center',
    flexDirection: isLeft ? 'row' : 'row-reverse',
    gap: 'clamp(40px, 4.5vw, 56px)',
  };

  const portraitStyle: CSSProperties = {
    width: 'clamp(180px, 32vw, 380px)',
    aspectRatio: '3 / 4',
    position: 'relative',
    overflow: 'hidden',
    flexShrink: 0,
  };

  const textBlockStyle: CSSProperties = {
    maxWidth: 'clamp(200px, 38vw, 360px)',
  };

  return (
    <div ref={sceneRef} style={sceneStyle}>
      <div style={composeStyle}>
        {/* ── PORTRAIT ── */}
        <div style={portraitStyle}>
          <img
            src={member.img}
            alt={member.name}
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507]/60 via-transparent to-[#050507]/15" />
        </div>

        {/* ── TEXT (beside portrait) ── */}
        <div
          className={`flex flex-col ${isLeft ? 'items-start text-left' : 'items-end text-right'}`}
          style={textBlockStyle}
        >
          <p
            ref={(el) => textRefs([el, null, null, null])}
            className="font-mono text-[11px] tracking-[0.42em] text-gray-500"
            style={{ opacity: 0 }}
          >
            {member.file}
          </p>
          <p
            ref={(el) => textRefs([null, el, null, null])}
            className="mt-4 font-mono text-xs tracking-[0.38em] uppercase text-cyber-cyan"
            style={{ opacity: 0 }}
          >
            {member.codename}
          </p>
          <h3
            ref={(el) => textRefs([null, null, el, null])}
            className="mt-3 font-display font-black leading-[0.92] tracking-tight text-white text-[clamp(2.6rem,6.5vw,5rem)]"
            style={{ opacity: 0 }}
          >
            {member.name}
          </h3>
          <p
            ref={(el) => textRefs([null, null, null, el])}
            className="mt-5 max-w-xs font-body text-base italic leading-relaxed text-gray-400"
            style={{ opacity: 0 }}
          >
            &ldquo;{member.quote}&rdquo;
          </p>
          <div className="mt-6 h-px w-[52px] bg-cyber-cyan/60" />
        </div>
      </div>

      {/* File index marker */}
      <span className="pointer-events-none absolute bottom-7 right-6 font-mono text-[10px] tracking-[0.32em] text-gray-700">
        {String(index + 1).padStart(2, '0')} / {String(CREW.length).padStart(2, '0')}
      </span>
    </div>
  );
}

/* ─── main export ─── */
export default function CrewDatabase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLParagraphElement | HTMLHeadingElement | null)[][]>([]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const scenes = sceneRefs.current;
    const bgs = bgRefs.current;
    const texts = textRefs.current;

    // Track which characters have had their text revealed (for reset-on-backward)
    const revealedFlags = CREW.map(() => false);

    // Sequential reveal — FILE → Codename → Name → Quote, soft Power3.out
    const revealText = (memberIndex: number, progress: number) => {
      const els = texts[memberIndex];
      if (!els) return;
      const staggers = [0, 0.25, 0.5, 0.75];
      els.forEach((el, i) => {
        if (!el) return;
        const local = (progress - staggers[i]) / 0.25;
        const e = easePower3Out(local);
        el.style.opacity = String(e);
        el.style.transform = `translateY(${(1 - e) * 30}px)`;
      });
    };

    const resetReveal = (memberIndex: number) => {
      const els = texts[memberIndex];
      if (!els) return;
      els.forEach((el) => {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
      });
      revealedFlags[memberIndex] = false;
    };

    const trigger = ScrollTrigger.create({
      trigger: scrollContainer,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.4,
      onUpdate: (self) => {
        const scrollProgress = self.progress; // 0 → 1 across the pinned range

        for (let i = 0; i < CREW.length; i++) {
          const member = CREW[i];
          const scene = scenes[i];
          const bg = bgs[i];
          if (!scene) continue;

          // ── translateZ drives everything ──
          const currentZ = member.z + scrollProgress * TOTAL_DEPTH;
          scene.style.transform = `translateZ(${currentZ}px)`;

          // ── opacity from depth (quick in, plateau, natural out) ──
          const opacity = depthOpacity(currentZ);
          scene.style.opacity = String(opacity);

          // ── background sync: supports the active portrait without overpowering ──
          if (bg) {
            const bgOpacity = gsap.utils.clamp(0, 1, opacity * 0.55);
            bg.style.opacity = String(bgOpacity);
          }

          // ── text reveal: only once the character is near the camera ──
          if (currentZ >= REVEAL_THRESHOLD) {
            const revealProgress = gsap.utils.clamp(
              0,
              1,
              (currentZ - REVEAL_THRESHOLD) / REVEAL_WINDOW,
            );
            revealText(i, revealProgress);
            revealedFlags[i] = true;
          } else if (revealedFlags[i]) {
            resetReveal(i);
          }
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} id="crew" className="relative bg-[#050507]">
      <SectionHeader />

      {/* Parent container — provides scroll space for the pinned 3D pass */}
      <div ref={scrollContainerRef} style={{ height: '1250vh', position: 'relative' }}>
        {/* Fixed fullscreen viewport — stays pinned while scrolling this section */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Fixed fullscreen background layer — all images stacked, opacity 0 */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{ zIndex: 0 }}
          >
            {CREW.map((m, i) => (
              <div
                key={m.name}
                ref={(el) => {
                  bgRefs.current[i] = el;
                }}
                className="absolute inset-0"
                style={{ opacity: 0 }}
              >
                <img
                  src={m.img}
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-[#050507]/35" />
              </div>
            ))}
          </div>

          {/* Foreground 3D scene */}
          <div
            className="absolute inset-0"
            style={{
              perspective: '900px',
              transformStyle: 'preserve-3d',
              overflow: 'visible',
              zIndex: 1,
            }}
          >
            {CREW.map((m, i) => (
              <CrewScene
                key={m.name}
                member={m}
                index={i}
                sceneRef={(el) => {
                  sceneRefs.current[i] = el;
                }}
                textRefs={(els) => {
                  const existing = textRefs.current[i] || [null, null, null, null];
                  textRefs.current[i] = els.map((el, j) => el ?? existing[j]);
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* End of transmission */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <div
          className="h-px w-20"
          style={{ background: 'linear-gradient(90deg, transparent, #FF2D2D, transparent)' }}
        />
        <p className="mt-8 font-mono text-[10px] tracking-[0.45em] text-gray-700">
          END OF TRANSMISSION
        </p>
      </div>
    </section>
  );
}
