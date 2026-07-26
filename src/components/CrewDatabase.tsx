import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IMAGES } from '@/lib/images';

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════
   CREW DATA
   ═══════════════════════════════════════════════════════════════════ */

type Side = 'left' | 'right' | 'center';

interface CrewMember {
  file: string;
  codename: string;
  name: string;
  img: string;
  side: Side;
}

const CREW: CrewMember[] = [
  { file: 'FILE 01', codename: 'THE LITTLE DEVIL', name: 'Rebecca', img: IMAGES.crew.rebecca, side: 'left' },
  { file: 'FILE 02', codename: 'THE PATRIARCH', name: 'Maine', img: IMAGES.crew.maine, side: 'right' },
  { file: 'FILE 03', codename: 'THE GHOST', name: 'Kiwi', img: IMAGES.crew.kiwi, side: 'left' },
  { file: 'FILE 04', codename: 'THE BLADE', name: 'Dorio', img: IMAGES.crew.dorio, side: 'right' },
  { file: 'FILE 05', codename: 'THE LOUDMOUTH', name: 'Pilar', img: IMAGES.crew.pilar, side: 'left' },
  { file: 'FILE 06', codename: 'THE MOON DREAMER', name: 'Lucy Kushinada', img: IMAGES.crew.lucy, side: 'right' },
  { file: 'FILE 07', codename: 'THE KID', name: 'David Martinez', img: IMAGES.crew.david, side: 'center' },
];

const COUNT = CREW.length;          // 7
const DAVID_INDEX = COUNT - 1;      // 6

/* ═══════════════════════════════════════════════════════════════════
   DEPTH SYSTEM — evenly spaced translateZ, real perspective
   ═══════════════════════════════════════════════════════════════════ */

const SPACING = 1500;               // px between characters (translateZ)
const PERSPECTIVE = 1000;           // parent perspective px
const CAMERA_TRAVEL = COUNT * SPACING; // 7000 — full camera travel

// Visibility windows measured in rendered-z (px from camera)
const FADE_IN = 800;                // begins fading in this far before camera
const HOLD = 120;                   // fully visible band around camera
const FADE_OUT = 700;               // fades out this far past camera
const REVEAL_START = 500;           // text begins revealing this far before camera

// Scroll progress mapping
const P_CAMERA = 0.6;               // camera reaches David at this progress
const DAVID_DWELL = 0.28;            // David's reveal window after reaching camera

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// Depth-driven opacity: 0 far → 1 at camera → 0 past camera
const depthOpacity = (z: number): number => {
  if (z <= -FADE_IN) return 0;
  if (z < -HOLD) return (z + FADE_IN) / (FADE_IN - HOLD);
  if (z <= HOLD) return 1;
  if (z < HOLD + FADE_OUT) return 1 - (z - HOLD) / FADE_OUT;
  return 0;
};

/* ═══════════════════════════════════════════════════════════════════
   SECTION HEADER
   ═══════════════════════════════════════════════════════════════════ */

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

/* ═══════════════════════════════════════════════════════════════════
   CREW SCENE — one character, portrait + text as a single 3D object
   ═══════════════════════════════════════════════════════════════════ */

interface SceneRefs {
  scene: (el: HTMLDivElement | null) => void;
  text: (slot: number, el: HTMLParagraphElement | HTMLHeadingElement | null) => void;
}

function CrewScene({ member, index, refs }: { member: CrewMember; index: number; refs: SceneRefs }) {
  const isFinal = member.side === 'center';
  const isLeft = member.side === 'left';

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

  const portrait = (
    <div
      style={{
        width: '100%',
        aspectRatio: '3 / 4',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
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
  );

  const textBlock = (
    <div
      className={`flex flex-col max-w-sm ${
        isFinal ? 'items-center text-center'
        : isLeft ? 'items-start text-left'
        : 'items-end text-right'
      }`}
    >
      <p
        ref={(el) => refs.text(0, el)}
        className="font-mono text-[11px] tracking-[0.42em] text-gray-500"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        {member.file}
      </p>
      <p
        ref={(el) => refs.text(1, el)}
        className="mt-4 font-mono text-xs tracking-[0.38em] uppercase text-cyber-cyan"
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        {member.codename}
      </p>
      <h3
        ref={(el) => refs.text(2, el)}
        className={`mt-3 font-display font-black leading-[0.92] tracking-tight text-white ${
          isFinal ? 'text-[clamp(3.2rem,9vw,6.5rem)]' : 'text-[clamp(2.6rem,6.5vw,5rem)]'
        }`}
        style={{ opacity: 0, willChange: 'transform, opacity' }}
      >
        {member.name}
      </h3>
    </div>
  );

  return (
    <div ref={refs.scene} style={sceneStyle}>
      {isFinal ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 md:gap-12">
          <div style={{ width: 'min(560px,54vw)' }}>{portrait}</div>
          {textBlock}
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center px-6">
          <div
            className="flex items-center gap-6 md:gap-12"
            style={{
              flexDirection: isLeft ? 'row' : 'row-reverse',
              transform: `translateX(${isLeft ? '-6vw' : '6vw'})`,
            }}
          >
            <div style={{ width: 'min(420px,38vw)' }}>{portrait}</div>
            {textBlock}
          </div>
        </div>
      )}

      <span className="pointer-events-none absolute bottom-7 right-6 font-mono text-[10px] tracking-[0.32em] text-gray-700">
        {String(index + 1).padStart(2, '0')} / {String(COUNT).padStart(2, '0')}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SCROLL ANIMATION ENGINE
   ═══════════════════════════════════════════════════════════════════ */

// Progressive text reveal: FILE → CODENAME → NAME
function revealText(els: (HTMLParagraphElement | HTMLHeadingElement | null)[], f: number) {
  const fe = easeInOutCubic(clamp01(f));
  for (let j = 0; j < 3; j++) {
    const el = els[j];
    if (!el) continue;
    const op = clamp01((fe - j * 0.33) / 0.33);
    el.style.opacity = String(op);
    el.style.transform = `translateY(${(1 - op) * 12}px)`;
  }
}

function useCrewEngine(
  sectionRef: React.RefObject<HTMLElement | null>,
  sceneRefs: React.RefObject<(HTMLDivElement | null)[]>,
  bgRefs: React.RefObject<(HTMLDivElement | null)[]>,
  textRefs: React.RefObject<(HTMLParagraphElement | HTMLHeadingElement | null)[][]>,
) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scenes = sceneRefs.current;
    const bgs = bgRefs.current;
    const texts = textRefs.current;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;
        // Camera reaches David at P_CAMERA, then holds for David's dwell.
        const offset = p < P_CAMERA ? (p / P_CAMERA) * CAMERA_TRAVEL : CAMERA_TRAVEL;

        for (let i = 0; i < COUNT; i++) {
          const scene = scenes[i];
          if (!scene) continue;

          const z = -(i + 1) * SPACING + offset;
          const op = depthOpacity(z);

          // Only transform + opacity — no layout recalculation.
          scene.style.transform = `translateZ(${z}px)`;
          scene.style.opacity = String(op);

          const bg = bgs[i];
          if (bg) bg.style.opacity = String(op * 0.55);

          if (i === DAVID_INDEX) {
            // David reveals only during the dwell (after reaching camera).
            revealText(texts[i] ?? [], (p - P_CAMERA) / DAVID_DWELL);
          } else {
            // Others reveal as they approach the camera.
            revealText(texts[i] ?? [], (z + REVEAL_START) / REVEAL_START);
          }
        }
      },
    });

    return () => {
      trigger.kill();
    };
  }, [sectionRef, sceneRefs, bgRefs, textRefs]);
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */

export default function CrewDatabase() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const bgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const textRefs = useRef<(HTMLParagraphElement | HTMLHeadingElement | null)[][]>([]);

  useCrewEngine(sectionRef, sceneRefs, bgRefs, textRefs);

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
          {/* Background atmosphere — each character owns its own fullscreen bg */}
          <div className="pointer-events-none absolute inset-0" style={{ zIndex: 0 }}>
            {CREW.map((m, i) => (
              <div
                key={m.name}
                ref={(el) => { bgRefs.current[i] = el; }}
                className="absolute inset-0"
                style={{ opacity: 0 }}
              >
                <img src={m.img} alt="" className="h-full w-full object-cover" loading="lazy" />
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
                refs={{
                  scene: (el) => { sceneRefs.current[i] = el; },
                  text: (slot, el) => {
                    const row = textRefs.current[i] ?? [null, null, null];
                    row[slot] = el;
                    textRefs.current[i] = row;
                  },
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