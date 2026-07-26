import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
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
};

const CREW: CrewMember[] = [
  {
    file: 'FILE 01',
    codename: 'THE LITTLE DEVIL',
    name: 'Rebecca',
    quote: "I don't do second chances.",
    img: IMAGES.crew.rebecca,
  },
  {
    file: 'FILE 02',
    codename: 'THE PATRIARCH',
    name: 'Maine',
    quote: "The streets don't forget. Neither do I.",
    img: IMAGES.crew.maine,
  },
  {
    file: 'FILE 03',
    codename: 'THE GHOST',
    name: 'Kiwi',
    quote: 'Every secret has a price. I collect.',
    img: IMAGES.crew.kiwi,
  },
  {
    file: 'FILE 04',
    codename: 'THE BLADE',
    name: 'Dorio',
    quote: 'Loyalty is the only currency I trust.',
    img: IMAGES.crew.dorio,
  },
  {
    file: 'FILE 05',
    codename: 'THE LOUDMOUTH',
    name: 'Pilar',
    quote: 'Talk big. Hit harder.',
    img: IMAGES.crew.pilar,
  },
  {
    file: 'FILE 06',
    codename: 'THE MOON DREAMER',
    name: 'Lucy Kushinada',
    quote: "I'll take you to the moon. If you're ready to fall.",
    img: IMAGES.crew.lucy,
  },
  {
    file: 'FILE 07',
    codename: 'THE KID',
    name: 'David Martinez',
    quote: "I'm not trying to be a legend. I'm trying to stay alive.",
    img: IMAGES.crew.david,
  },
];

const COUNT = CREW.length;            // 7
const DAVID_INDEX = COUNT - 1;        // 6

/* ─── depth system ─── */
const SPACING = 1000;                 // even gap between characters (px of translateZ)
const PERSPECTIVE = 1400;             // parent perspective
const TRAVEL = COUNT * SPACING;       // 7000 — camera travel to bring David to camera

/* ─── progress mapping ─── */
const P_D = 0.6;                      // progress at which David reaches the camera
const DAVID_REVEAL_SPAN = 0.28;       // dwell reveal window (completes at p ≈ 0.88)

/* ─── visibility windows (in rendered-z) ─── */
const FADE_IN = 800;                  // approach fade-in distance
const HOLD = 120;                     // fully-visible band around camera
const FADE_OUT = 700;                 // past-camera fade-out distance
const REVEAL_START = 500;             // text begins revealing this far before camera

/* ─── easing ─── */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

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

/* ─── single character scene — ONE object, portrait + text move together ─── */
function CrewScene({
  member,
  index,
  onSceneRef,
  onTextRef,
}: {
  member: CrewMember;
  index: number;
  onSceneRef: (i: number, el: HTMLDivElement | null) => void;
  onTextRef: (i: number, slot: number, el: HTMLParagraphElement | HTMLHeadingElement | null) => void;
}) {
  const isFinal = index === DAVID_INDEX;

  const sceneStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    transform: `translateZ(${-(index + 1) * SPACING}px)`,
    opacity: 0,
    pointerEvents: 'none',
    willChange: 'transform, opacity',
  };

  return (
    <div ref={(el) => onSceneRef(index, el)} style={sceneStyle}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 md:gap-14">
        {/* ── PORTRAIT ── */}
        <div
          className="relative overflow-hidden"
          style={{
            width: 'min(300px, 58vw)',
            aspectRatio: '3 / 4',
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

        {/* ── TEXT (centered, never drifts to edges) ── */}
        <div className="flex max-w-md flex-col items-center text-center">
          <p
            ref={(el) => onTextRef(index, 0, el)}
            className="font-mono text-[11px] tracking-[0.42em] text-gray-500"
            style={{ opacity: 0, willChange: 'transform, opacity' }}
          >
            {member.file}
          </p>
          <p
            ref={(el) => onTextRef(index, 1, el)}
            className="mt-4 font-mono text-xs tracking-[0.38em] uppercase text-cyber-cyan"
            style={{ opacity: 0, willChange: 'transform, opacity' }}
          >
            {member.codename}
          </p>
          <h3
            ref={(el) => onTextRef(index, 2, el)}
            className={`mt-3 font-display font-black leading-[0.92] tracking-tight text-white ${
              isFinal
                ? 'text-[clamp(3.2rem,9vw,6.5rem)]'
                : 'text-[clamp(2.6rem,6.5vw,5rem)]'
            }`}
            style={{ opacity: 0, willChange: 'transform, opacity' }}
          >
            {member.name}
          </h3>
          <p
            ref={(el) => onTextRef(index, 3, el)}
            className="mt-5 max-w-xs font-body text-base italic leading-relaxed text-gray-400"
            style={{ opacity: 0, willChange: 'transform, opacity' }}
          >
            &ldquo;{member.quote}&rdquo;
          </p>
          <div className="mt-6 h-px w-[52px] bg-cyber-cyan/60" />
        </div>
      </div>

      {/* File index marker */}
      <span className="pointer-events-none absolute bottom-7 right-6 font-mono text-[10px] tracking-[0.32em] text-gray-700">
        {String(index + 1).padStart(2, '0')} / {String(COUNT).padStart(2, '0')}
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

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scenes = sceneRefs.current;
    const bgs = bgRefs.current;
    const texts = textRefs.current;

    // depth-driven opacity: 0 far away → 1 at camera → 0 past camera
    const depthOpacity = (z: number): number => {
      if (z <= -FADE_IN) return 0;
      if (z < -HOLD) return (z + FADE_IN) / (FADE_IN - HOLD);
      if (z <= HOLD) return 1;
      if (z < HOLD + FADE_OUT) return 1 - (z - HOLD) / FADE_OUT;
      return 0;
    };

    // progressive text reveal: FILE → CODENAME → NAME → QUOTE
    const revealText = (i: number, f: number) => {
      const els = texts[i];
      if (!els) return;
      const fe = easeInOutCubic(clamp01(f));
      for (let j = 0; j < 4; j++) {
        const el = els[j];
        if (!el) continue;
        const op = clamp01((fe - j * 0.25) / 0.25);
        el.style.opacity = String(op);
        el.style.transform = `translateY(${(1 - op) * 12}px)`;
      }
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        // camera offset: travels 0 → TRAVEL over [0, P_D], then holds at TRAVEL for David's dwell
        const offset = p < P_D ? (p / P_D) * TRAVEL : TRAVEL;

        for (let i = 0; i < COUNT; i++) {
          const scene = scenes[i];
          if (!scene) continue;

          // rendered z = initial depth + camera offset
          const z = -(i + 1) * SPACING + offset;
          const op = depthOpacity(z);

          // only touch transform + opacity — no layout recalc
          scene.style.transform = `translateZ(${z}px)`;
          scene.style.opacity = String(op);

          // synced background atmosphere
          const bg = bgs[i];
          if (bg) bg.style.opacity = String(op * 0.55);

          // text reveal
          if (i === DAVID_INDEX) {
            // David reveals only during the dwell (after reaching camera)
            revealText(i, (p - P_D) / DAVID_REVEAL_SPAN);
          } else {
            // others reveal as they approach the camera
            revealText(i, (z + REVEAL_START) / REVEAL_START);
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

      {/* Scroll runway */}
      <div style={{ height: '650vh', position: 'relative' }}>
        {/* Pinned viewport */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            height: '100vh',
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Background atmosphere layer — synced to active character */}
          <div className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}>
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
              perspective: `${PERSPECTIVE}px`,
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
                onSceneRef={(idx, el) => {
                  sceneRefs.current[idx] = el;
                }}
                onTextRef={(idx, slot, el) => {
                  const row = textRefs.current[idx] ?? [null, null, null, null];
                  row[slot] = el;
                  textRefs.current[idx] = row;
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
