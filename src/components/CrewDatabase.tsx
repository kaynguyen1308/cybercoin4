import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { useCameraScroll } from '@/lib/cameraController';
import gsap from 'gsap';
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
      <CyberFrame member={member} index={index} />
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
      <CrewFXStyles />

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

/* Injected once. All effects animate only transform / opacity / box-shadow.
   No layout properties, no heavy filters — keeps 60 FPS. */
function CrewFXStyles() {
  return (
    <style>{`
@keyframes crewFlicker {
  0%,100% { opacity: 1; }
  92.5% { opacity: 1; }
  93.5% { opacity: 0.96; }
  95% { opacity: 1; }
  97% { opacity: 0.97; }
  98.5% { opacity: 1; }
}
@keyframes crewGlassSweep {
  0% { transform: translateX(-160%) skewX(-18deg); opacity: 0; }
  14% { opacity: 0.5; }
  86% { opacity: 0.35; }
  100% { transform: translateX(260%) skewX(-18deg); opacity: 0; }
}
@keyframes crewScanBar {
  0% { transform: translateY(-30px); opacity: 0; }
  6% { opacity: 0.75; }
  94% { opacity: 0.75; }
  100% { transform: translateY(900px); opacity: 0; }
}
@keyframes crewHoloGlow {
  0%,100% { box-shadow: 0 0 16px rgba(0,240,255,0.22), inset 0 0 16px rgba(0,240,255,0.12); }
  50% { box-shadow: 0 0 28px rgba(0,240,255,0.42), inset 0 0 24px rgba(0,240,255,0.22); }
}
@keyframes crewBloom {
  0%,100% { opacity: 0.25; }
  50% { opacity: 0.55; }
}
@keyframes crewLedPulse {
  0%,100% { opacity: 0.35; box-shadow: 0 0 3px currentColor; }
  50% { opacity: 1; box-shadow: 0 0 7px currentColor, 0 0 13px currentColor; }
}
.crew-flicker { animation: crewFlicker 4.2s steps(1) infinite; }
.crew-scanlines { position:absolute; inset:0; background: repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(0,0,0,0.32) 2px, rgba(0,0,0,0.32) 3px); opacity:0.22; mix-blend-mode:multiply; pointer-events:none; }
.crew-glass { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
.crew-glass-bar { position:absolute; top:0; left:0; width:42%; height:100%; background:linear-gradient(115deg, transparent, rgba(255,255,255,0.16), transparent); animation: crewGlassSweep 7s ease-in-out infinite; }
.crew-scanbar { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
.crew-scanbar-line { position:absolute; left:0; right:0; height:12px; top:0; background:linear-gradient(180deg, transparent, rgba(0,240,255,0.4), transparent); box-shadow:0 0 14px rgba(0,240,255,0.45); animation: crewScanBar 5.5s linear infinite; }
.crew-ca-red { position:absolute; inset:0; box-shadow: inset 2px 0 0 rgba(255,0,60,0.35), inset -2px 0 0 rgba(255,0,60,0.22); mix-blend-mode:screen; opacity:0.5; pointer-events:none; }
.crew-ca-cyan { position:absolute; inset:0; box-shadow: inset -2px 0 0 rgba(0,240,255,0.35), inset 2px 0 0 rgba(0,240,255,0.22); mix-blend-mode:screen; opacity:0.5; pointer-events:none; }
.crew-bloom { position:absolute; inset:0; background:radial-gradient(ellipse at center, rgba(0,240,255,0.12), transparent 70%); animation: crewBloom 5s ease-in-out infinite; pointer-events:none; mix-blend-mode:screen; }
.crew-holo { position:absolute; inset:0; border:1px solid rgba(0,240,255,0.28); animation: crewHoloGlow 4s ease-in-out infinite; pointer-events:none; }
.crew-led { animation: crewLedPulse 2s ease-in-out infinite; }
    `}</style>
  );
}

/* Random micro-glitch + brief RGB split on the portrait image only.
   Fires every 6–12s, lasts 100–150ms. No React re-renders, no layout. */
function useCyberGlitch(imgRef: React.RefObject<HTMLImageElement | null>) {
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    let killed = false;
    let to: ReturnType<typeof setTimeout>;
    const fire = () => {
      if (killed) return;
      const dur = 0.1 + Math.random() * 0.05; // 100–150ms
      const tx = (Math.random() - 0.5) * 5;
      const tl = gsap.timeline({ onComplete: () => gsap.set(img, { filter: 'none', x: 0 }) });
      tl.fromTo(
        img,
        { filter: 'drop-shadow(3px 0 #ff003c) drop-shadow(-3px 0 #00f0ff)' },
        { filter: 'drop-shadow(0px 0 rgba(255,0,60,0)) drop-shadow(0px 0 rgba(0,240,255,0))', duration: dur, ease: 'power2.out' },
      );
      tl.to(img, { x: tx, duration: dur * 0.5, ease: 'power2.out', yoyo: true, repeat: 1 }, 0);
      to = setTimeout(fire, 6000 + Math.random() * 6000);
    };
    to = setTimeout(fire, 6000 + Math.random() * 6000);
    return () => {
      killed = true;
      clearTimeout(to);
      gsap.killTweensOf(img);
    };
  }, [imgRef]);
}

function CyberFrame({ member, index }: { member: CrewMember; index: number }) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  useCyberGlitch(imgRef);
  const d = (n: number) => `${(index * 0.7 + n).toFixed(2)}s`;
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
              ref={imgRef}
              src={member.img}
              alt={member.name}
              className="crew-flicker h-full w-full object-cover object-top"
              loading="lazy"
              style={{ animationDelay: d(1.3) }}
            />
            {/* Color grade */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(5,5,7,0.15) 0%, transparent 22%, transparent 62%, rgba(5,5,7,0.72) 100%)',
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
            {/* CRT scanlines */}
            <div className="crew-scanlines" />
            {/* Glass reflection sweep */}
            <div className="crew-glass">
              <div className="crew-glass-bar" style={{ animationDelay: d(0.4) }} />
            </div>
            {/* Moving scan bar */}
            <div className="crew-scanbar">
              <div className="crew-scanbar-line" style={{ animationDelay: d(0.6) }} />
            </div>
            {/* Chromatic aberration edges */}
            <div className="crew-ca-red" />
            <div className="crew-ca-cyan" />
            {/* Cyan bloom */}
            <div className="crew-bloom" style={{ animationDelay: d(0.2) }} />
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
            className="crew-led absolute"
            style={{
              top: '26px',
              left: '14px',
              width: '5px',
              height: '5px',
              borderRadius: '9999px',
              color: '#00f0ff',
              background: '#00f0ff',
              animationDelay: d(0.1),
            }}
          />
          <div
            className="crew-led absolute"
            style={{
              top: '26px',
              right: '14px',
              width: '5px',
              height: '5px',
              borderRadius: '9999px',
              color: '#ffe600',
              background: '#ffe600',
              animationDelay: d(0.5),
            }}
          />
          <div
            className="crew-led absolute"
            style={{
              bottom: '26px',
              left: '14px',
              width: '5px',
              height: '5px',
              borderRadius: '9999px',
              color: '#ff2d2d',
              background: '#ff2d2d',
              animationDelay: d(0.9),
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

          {/* Holographic edge glow */}
          <div className="crew-holo" style={{ animationDelay: d(0) }} />
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