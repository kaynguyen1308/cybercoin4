import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useCameraScroll } from '@/lib/cameraController';
import { IMAGES } from '@/lib/images';

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
const FADE_IN = 1000;                // begins fading in this far before camera
const HOLD = 200;                   // fully visible band around camera
const FADE_OUT = 1400;               // fades out this far past camera
const REVEAL_START = 1000;           // text begins revealing this far before camera

// Scroll progress mapping
const P_CAMERA = 0.9;               // camera reaches David at this progress
const DAVID_DWELL = 0.1;            // David's reveal window after reaching camera

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
        flexShrink: 0,
      }}
    >
      <CyberFrame member={member} />
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
  <div
    className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 md:gap-12"
    style={{
      transform: "translateY(-70px)",
    }}
  >
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
  // The camera target is driven by ScrollTrigger progress (which Lenis feeds).
  // The controller eases toward that target with momentum — a tiny cinematic
  // glide after the wheel stops, no overshoot, no bounce.
  useCameraScroll(
    sectionRef,
    (p) => (p < P_CAMERA ? (p / P_CAMERA) * CAMERA_TRAVEL : CAMERA_TRAVEL),
    (offset) => {
      const scenes = sceneRefs.current;
      const bgs = bgRefs.current;
      const texts = textRefs.current;
      if (!scenes || !bgs || !texts) return;

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
          // Progress is reconstructed from the realized camera offset so the
          // text reveal inherits the same physical momentum.
          const p = offset / CAMERA_TRAVEL;
          revealText(texts[i] ?? [], (p - P_CAMERA) / DAVID_DWELL);
        } else {
          // Others reveal as they approach the camera.
          revealText(texts[i] ?? [], (z + REVEAL_START) / REVEAL_START);
        }
      }
    },
  );
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

/* ═══════════════════════════════════════════════════════════════════
   CYBER FRAME — cyberpunk data-chip portrait frame (HTML + Tailwind only)
   Keeps the image at exactly the same size/position; only adds the shell.
   ═══════════════════════════════════════════════════════════════════ */

function CyberFrame({ member }: { member: CrewMember }) {
  return (
    <div className="relative h-full w-full">
      {/* Thick dark metallic outer shell with bevel */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(145deg, #23262b 0%, #0a0b0d 38%, #15171b 62%, #050608 100%)',
          boxShadow:
            'inset 0 0 0 1px rgba(0,240,255,0.18), inset 0 0 0 2px rgba(0,0,0,0.7), inset 0 2px 6px rgba(255,255,255,0.06), inset 0 -3px 10px rgba(0,0,0,0.9), 0 0 0 1px #000, 0 22px 50px rgba(0,0,0,0.85), 0 0 40px rgba(0,240,255,0.12)',
          clipPath:
            'polygon(0 14px, 14px 0, calc(100% - 28px) 0, 100% 28px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 28px 100%, 0 calc(100% - 28px))',
        }}
      >
        {/* Inner layered border — metallic mid plate */}
        <div
          className="absolute"
          style={{
            inset: '8px',
            background: 'linear-gradient(150deg, #14161a, #070809)',
            boxShadow:
              'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 0 2px rgba(0,0,0,0.6), inset 0 0 22px rgba(0,0,0,0.85)',
            clipPath:
              'polygon(0 10px, 10px 0, calc(100% - 22px) 0, 100% 22px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 22px 100%, 0 calc(100% - 22px))',
          }}
        >
          {/* Image well */}
          <div
            className="absolute overflow-hidden"
            style={{
              inset: '12px',
              boxShadow:
                'inset 0 0 0 1px rgba(0,240,255,0.25), inset 0 0 0 2px rgba(0,0,0,0.8), inset 0 0 30px rgba(0,0,0,0.9)',
              clipPath:
                'polygon(0 8px, 8px 0, calc(100% - 18px) 0, 100% 18px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 18px 100%, 0 calc(100% - 18px))',
            }}
          >
            <img
              src={member.img}
              alt={member.name}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
            {/* Color grade + glass reflection */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(5,5,7,0.15) 0%, transparent 22%, transparent 62%, rgba(5,5,7,0.72) 100%)',
              }}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 16%, transparent 30%, transparent 100%)',
                mixBlendMode: 'screen',
              }}
            />
            {/* Diagonal holographic sheen */}
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                background:
                  'repeating-linear-gradient(115deg, transparent 0px, transparent 5px, rgba(0,240,255,0.04) 5px, rgba(0,240,255,0.04) 6px)',
                mixBlendMode: 'screen',
              }}
            />
            {/* Scanline overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-25"
              style={{
                background:
                  'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.35) 2px, rgba(0,0,0,0.35) 3px)',
              }}
            />
          </div>

          {/* Thin magenta electronic traces */}
          <div
            className="pointer-events-none absolute"
            style={{
              left: '4px',
              top: '4px',
              right: '4px',
              bottom: '4px',
              background:
                'linear-gradient(90deg, transparent 0%, transparent 14%, rgba(255,0,200,0.5) 14%, rgba(255,0,200,0.5) 15%, transparent 15%, transparent 86%, rgba(255,0,200,0.5) 86%, rgba(255,0,200,0.5) 87%, transparent 87%)',
              mixBlendMode: 'screen',
              opacity: 0.6,
            }}
          />
          <div
            className="pointer-events-none absolute"
            style={{
              left: '14%',
              top: '4px',
              width: '1px',
              bottom: '4px',
              background:
                'linear-gradient(180deg, transparent, rgba(255,0,200,0.4), transparent)',
              mixBlendMode: 'screen',
            }}
          />

          {/* Cyan glowing corner brackets */}
          <CornerBracket position="top-left" />
          <CornerBracket position="top-right" />
          <CornerBracket position="bottom-left" />
          <CornerBracket position="bottom-right" />

          {/* Top scan label bar */}
          <div
            className="absolute left-3 right-3 flex items-center justify-between font-mono"
            style={{ top: '14px', fontSize: '7px', letterSpacing: '0.18em' }}
          >
            <span style={{ color: 'rgba(0,240,255,0.85)' }}>FILE VERIFIED</span>
            <span style={{ color: 'rgba(255,230,0,0.85)' }}>NC-2077</span>
          </div>

          {/* Bottom scan label bar */}
          <div
            className="absolute left-3 right-3 flex items-center justify-between font-mono"
            style={{ bottom: '14px', fontSize: '7px', letterSpacing: '0.18em' }}
          >
            <span style={{ color: 'rgba(255,230,0,0.85)' }}>CREW DATA</span>
            <span style={{ color: 'rgba(0,240,255,0.7)' }}>{member.file}</span>
          </div>

          {/* Side micro text */}
          <div
            className="absolute font-mono"
            style={{
              left: '5px',
              top: '50%',
              transform: 'translateY(-50%) rotate(-90deg)',
              transformOrigin: 'left center',
              fontSize: '6px',
              letterSpacing: '0.3em',
              color: 'rgba(255,230,0,0.55)',
              whiteSpace: 'nowrap',
            }}
          >
            NET-77//CHROME-2.1
          </div>
          <div
            className="absolute font-mono"
            style={{
              right: '5px',
              top: '50%',
              transform: 'translateY(-50%) rotate(90deg)',
              transformOrigin: 'right center',
              fontSize: '6px',
              letterSpacing: '0.3em',
              color: 'rgba(0,240,255,0.55)',
              whiteSpace: 'nowrap',
            }}
          >
            ID:{member.file.replace(/\s/g, '')}
          </div>

          {/* Bolts / screws */}
          <Bolt style={{ top: '10px', left: '10px' }} />
          <Bolt style={{ top: '10px', right: '10px' }} />
          <Bolt style={{ bottom: '10px', left: '10px' }} />
          <Bolt style={{ bottom: '10px', right: '10px' }} />

          {/* Indicator LEDs */}
          <div
            className="absolute"
            style={{
              top: '26px',
              left: '14px',
              width: '5px',
              height: '5px',
              borderRadius: '9999px',
              background: '#00f0ff',
              boxShadow: '0 0 6px #00f0ff, 0 0 12px rgba(0,240,255,0.6)',
            }}
          />
          <div
            className="absolute"
            style={{
              top: '26px',
              right: '14px',
              width: '5px',
              height: '5px',
              borderRadius: '9999px',
              background: '#ffe600',
              boxShadow: '0 0 6px #ffe600, 0 0 12px rgba(255,230,0,0.5)',
            }}
          />
          <div
            className="absolute"
            style={{
              bottom: '26px',
              left: '14px',
              width: '5px',
              height: '5px',
              borderRadius: '9999px',
              background: '#ff2d2d',
              boxShadow: '0 0 6px #ff2d2d, 0 0 12px rgba(255,45,45,0.5)',
            }}
          />

          {/* Yellow industrial warning stripe — bottom edge */}
          <div
            className="pointer-events-none absolute"
            style={{
              left: '24px',
              right: '24px',
              bottom: '4px',
              height: '3px',
              background:
                'repeating-linear-gradient(45deg, #ffe600 0px, #ffe600 4px, #0a0b0d 4px, #0a0b0d 8px)',
              opacity: 0.7,
            }}
          />
          {/* Yellow warning stripe — top edge */}
          <div
            className="pointer-events-none absolute"
            style={{
              left: '24px',
              right: '24px',
              top: '4px',
              height: '2px',
              background:
                'repeating-linear-gradient(45deg, rgba(255,230,0,0.6) 0px, rgba(255,230,0,0.6) 3px, transparent 3px, transparent 6px)',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function CornerBracket({ position }: { position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const base = 'absolute h-4 w-4';
  const map: Record<string, string> = {
    'top-left': 'left-2 top-2',
    'top-right': 'right-2 top-2',
    'bottom-left': 'left-2 bottom-2',
    'bottom-right': 'right-2 bottom-2',
  };
  const borderMap: Record<string, string> = {
    'top-left': 'border-l-2 border-t-2',
    'top-right': 'border-r-2 border-t-2',
    'bottom-left': 'border-l-2 border-b-2',
    'bottom-right': 'border-r-2 border-b-2',
  };
  return (
    <div
      className={`${base} ${map[position]} ${borderMap[position]}`}
      style={{ borderColor: '#00f0ff', boxShadow: '0 0 6px rgba(0,240,255,0.7)' }}
    />
  );
}

function Bolt({ style }: { style: CSSProperties }) {
  return (
    <div
      className="absolute flex items-center justify-center"
      style={{
        width: '7px',
        height: '7px',
        borderRadius: '9999px',
        background: 'radial-gradient(circle at 35% 35%, #5a5e66, #15171b 70%, #050608)',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.8), 0 1px 2px rgba(0,0,0,0.9)',
        ...style,
      }}
    >
      <div
        style={{
          width: '3px',
          height: '1px',
          background: 'rgba(0,0,0,0.85)',
          transform: 'rotate(45deg)',
        }}
      />
    </div>
  );
}