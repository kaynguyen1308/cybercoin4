import { useEffect, useRef } from 'react';
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
  side: 'left' | 'right' | 'center';
  z: number; // initial translateZ depth (px)
};

const CREW: CrewMember[] = [
  {
    file: 'FILE 01',
    codename: 'THE LITTLE DEVIL',
    name: 'Rebecca',
    quote: "I don't do second chances.",
    img: IMAGES.crew.rebecca,
    side: 'left',
    z: -35000,
  },
  {
    file: 'FILE 02',
    codename: 'THE PATRIARCH',
    name: 'Maine',
    quote: "The streets don't forget. Neither do I.",
    img: IMAGES.crew.maine,
    side: 'right',
    z: -30000,
  },
  {
    file: 'FILE 03',
    codename: 'THE GHOST',
    name: 'Kiwi',
    quote: 'Every secret has a price. I collect.',
    img: IMAGES.crew.kiwi,
    side: 'left',
    z: -25000,
  },
  {
    file: 'FILE 04',
    codename: 'THE BLADE',
    name: 'Dorio',
    quote: 'Loyalty is the only currency I trust.',
    img: IMAGES.crew.dorio,
    side: 'right',
    z: -20000,
  },
  {
    file: 'FILE 05',
    codename: 'THE LOUDMOUTH',
    name: 'Pilar',
    quote: 'Talk big. Hit harder.',
    img: IMAGES.crew.pilar,
    side: 'left',
    z: -15000,
  },
  {
    file: 'FILE 06',
    codename: 'THE KID',
    name: 'David Martinez',
    quote: "I'm not trying to be a legend. I'm trying to stay alive.",
    img: IMAGES.crew.david,
    side: 'right',
    z: -10000,
  },
  {
    file: 'FILE 07',
    codename: 'THE MOON DREAMER',
    name: 'Lucy Kushinada',
    quote: "I'll take you to the moon. If you're ready to fall.",
    img: IMAGES.crew.lucy,
    side: 'left',
    z: -5000,
  },
  {
    file: 'FILE 08',
    codename: 'THE FINAL BOSS',
    name: 'Adam Smasher',
    quote: "Legends die. I don't.",
    img: IMAGES.crew.smasher,
    side: 'center',
    z: -1000,
  },
];

const TOTAL_DEPTH = 35000; // scrollProgress × this drives every character forward
const REVEAL_THRESHOLD = -500; // text reveals once currentZ passes this
const SMASHER_INDEX = CREW.findIndex((c) => c.name === 'Adam Smasher');

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
  const isFinal = member.side === 'center';

  const sceneStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transform: `translateZ(${member.z}px)`,
    pointerEvents: 'none',
  };

  // Image placement per side
  const imgWrapStyle: React.CSSProperties = isFinal
    ? { left: '50%', transform: 'translateX(-50%)', width: 'min(560px,54vw)' }
    : member.side === 'left'
    ? { left: '5vw', width: 'min(420px,38vw)' }
    : { right: '5vw', width: 'min(420px,38vw)' };

  const textAlign = isFinal
    ? 'items-center text-center'
    : member.side === 'left'
    ? 'items-start text-left'
    : 'items-end text-right';

  const textOffset = isFinal
    ? ''
    : member.side === 'left'
    ? 'ml-auto pr-12'
    : 'mr-auto pl-12';

  return (
    <div ref={sceneRef} style={sceneStyle}>
      {/* ── IMAGE ── */}
      <div
        className="absolute flex items-center"
        style={{
          top: '50%',
          transform: 'translateY(-50%)',
          ...imgWrapStyle,
        }}
      >
        <div
          style={{
            width: '100%',
            aspectRatio: '3 / 4',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={member.img}
            alt={member.name}
            className="h-full w-full object-cover object-top"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050507]/70 via-transparent to-[#050507]/20" />
        </div>
      </div>

      {/* ── TEXT ── */}
      <div className="absolute inset-0 flex items-center px-12">
        <div className={`flex flex-col ${textAlign} ${textOffset} max-w-sm`}>
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
            className={`mt-3 font-display font-black leading-[0.92] tracking-tight text-white ${
              isFinal
                ? 'text-[clamp(3.2rem,9vw,6.5rem)]'
                : 'text-[clamp(2.6rem,6.5vw,5rem)]'
            }`}
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
        {String(index + 1).padStart(2, '0')} / 08
      </span>
    </div>
  );
}

/* ─── main export ─── */
export default function CrewDatabase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLParagraphElement | HTMLHeadingElement | null)[][]>([]);
  const smasherOverlayRef = useRef<HTMLDivElement | null>(null);
  const glitchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scenes = sceneRefs.current;
    const bgs = bgRefs.current;
    const texts = textRefs.current;
    const smasherOverlay = smasherOverlayRef.current;
    const glitch = glitchRef.current;

    // Track which characters have had their text revealed (for reset-on-backward)
    const revealedFlags = CREW.map(() => false);
    let smasherGlitched = false;

    // Sequential reveal helper — reveals FILE → Codename → Name → Quote
    const revealText = (memberIndex: number, progress: number) => {
      const els = texts[memberIndex];
      if (!els) return;
      // progress 0..1 across the reveal window; stagger the four elements
      const staggers = [0, 0.25, 0.5, 0.75];
      els.forEach((el, i) => {
        if (!el) return;
        const local = (progress - staggers[i]) / 0.25;
        const op = gsap.utils.clamp(0, 1, local);
        el.style.opacity = String(op);
        el.style.transform = `translateY(${(1 - op) * 14}px)`;
      });
    };

    const resetReveal = (memberIndex: number) => {
      const els = texts[memberIndex];
      if (!els) return;
      els.forEach((el) => {
        if (!el) return;
        el.style.opacity = '0';
        el.style.transform = 'translateY(14px)';
      });
      revealedFlags[memberIndex] = false;
    };

    // One-shot RGB split glitch for Adam Smasher
    const playSmasherGlitch = () => {
      if (smasherGlitched || !glitch) return;
      smasherGlitched = true;
      const tl = gsap.timeline();
      tl.set(glitch, { opacity: 1 });
      tl.to(glitch, { opacity: 0.85, duration: 0.04 }, 0);
      tl.to(glitch, { opacity: 0, duration: 0.12, ease: 'power2.out' }, 0.08);
      // total ~200ms
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const scrollProgress = self.progress; // 0 → 1 across the section

        for (let i = 0; i < CREW.length; i++) {
          const member = CREW[i];
          const scene = scenes[i];
          const bg = bgs[i];
          if (!scene) continue;

          // ── translateZ drives everything ──
          const currentZ = member.z + scrollProgress * TOTAL_DEPTH;
          scene.style.transform = `translateZ(${currentZ}px)`;

          // ── opacity from depth ──
          // Far away (very negative) → 0; near camera (≈0) → 1; past camera (positive) → fades back to 0.
          let opacity: number;
          if (currentZ <= 0) {
            // approaching: ramp up as we go from -8000 → 0
            opacity = gsap.utils.clamp(0, 1, 1 - Math.abs(currentZ) / 8000);
          } else {
            // passed camera: fade out over the next 4000px
            opacity = gsap.utils.clamp(0, 1, 1 - currentZ / 4000);
          }
          scene.style.opacity = String(opacity);

          // ── background sync: fades in as character approaches, out when leaving ──
          if (bg) {
            // background mirrors foreground opacity but a touch softer
            const bgOpacity = gsap.utils.clamp(0, 1, opacity * 0.55);
            bg.style.opacity = String(bgOpacity);
          }

          // ── text reveal: only after currentZ ≈ -500 ──
          if (currentZ >= REVEAL_THRESHOLD) {
            // map -500 → +1500 to a 0..1 reveal progress
            const revealProgress = gsap.utils.clamp(
              0,
              1,
              (currentZ - REVEAL_THRESHOLD) / 2000,
            );
            revealText(i, revealProgress);
            revealedFlags[i] = true;
          } else if (revealedFlags[i]) {
            // scrolled backward past the threshold → reset
            resetReveal(i);
          }
        }

        // ── Adam Smasher: red overlay + one-shot glitch when active ──
        if (smasherOverlay) {
          const smasherScene = scenes[SMASHER_INDEX];
          const smasherOpacity = smasherScene
            ? parseFloat(smasherScene.style.opacity || '0')
            : 0;
          smasherOverlay.style.opacity = String(smasherOpacity * 0.5);
        }
        // trigger glitch once when Smasher is near camera
        const smasherZ = CREW[SMASHER_INDEX].z + scrollProgress * TOTAL_DEPTH;
        if (!smasherGlitched && smasherZ >= -800 && smasherZ <= 800) {
          playSmasherGlitch();
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

      {/* Parent container — ~2000vh tall to provide scroll space */}
      <div style={{ height: '2000vh', position: 'relative' }}>
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
                <div className="absolute inset-0 bg-[#050507]/80" />
              </div>
            ))}
          </div>

          {/* Foreground 3D scene */}
          <div
            className="absolute inset-0"
            style={{
              perspective: '1400px',
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

          {/* Adam Smasher dark red overlay (controlled by motion engine) */}
          <div
            ref={smasherOverlayRef}
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: 2,
              opacity: 0,
              background:
                'radial-gradient(ellipse at center, rgba(139,0,0,0.55) 0%, rgba(80,0,0,0.35) 45%, rgba(20,0,0,0.6) 100%)',
              mixBlendMode: 'multiply',
            }}
          />

          {/* One-shot RGB split glitch layer for Adam Smasher */}
          <div
            ref={glitchRef}
            className="pointer-events-none absolute inset-0"
            style={{
              zIndex: 3,
              opacity: 0,
              background:
                'linear-gradient(90deg, rgba(255,0,0,0.35) 0%, rgba(0,255,255,0.35) 50%, rgba(255,0,255,0.35) 100%)',
              mixBlendMode: 'screen',
            }}
          />
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
