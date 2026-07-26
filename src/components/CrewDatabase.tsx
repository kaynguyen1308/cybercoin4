import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { IMAGES } from '@/lib/images';

gsap.registerPlugin(ScrollTrigger);

/* ─── characters ─── */
type CrewMember = {
  file: string;
  codename: string;
  name: string;
  quote: string;
  img: string;
  bg: string;
  initialZ: number;
  side: 'left' | 'right' | 'center';
  accent: string;
  rgb: string;
};

const CREW: CrewMember[] = [
  {
    file: 'FILE 01',
    codename: 'THE LITTLE DEVIL',
    name: 'Rebecca',
    quote: "I don't do second chances.",
    img: IMAGES.crew.rebecca,
    bg: IMAGES.crew.rebecca,
    initialZ: -28000,
    side: 'left',
    accent: '#FF6FAE',
    rgb: '255,100,158',
  },
  {
    file: 'FILE 02',
    codename: 'THE PATRIARCH',
    name: 'Maine',
    quote: "The streets don't forget. Neither do I.",
    img: IMAGES.crew.maine,
    bg: IMAGES.crew.maine,
    initialZ: -24000,
    side: 'right',
    accent: '#FFB454',
    rgb: '255,180,84',
  },
  {
    file: 'FILE 03',
    codename: 'THE GHOST',
    name: 'Kiwi',
    quote: 'Every secret has a price. I collect.',
    img: IMAGES.crew.kiwi,
    bg: IMAGES.crew.kiwi,
    initialZ: -20000,
    side: 'left',
    accent: '#3FE0C8',
    rgb: '63,224,200',
  },
  {
    file: 'FILE 04',
    codename: 'THE BLADE',
    name: 'Dorio',
    quote: 'Loyalty is the only currency I trust.',
    img: IMAGES.crew.dorio,
    bg: IMAGES.crew.dorio,
    initialZ: -16000,
    side: 'right',
    accent: '#B985FF',
    rgb: '185,133,255',
  },
  {
    file: 'FILE 05',
    codename: 'THE LOUDMOUTH',
    name: 'Pilar',
    quote: 'Talk big. Hit harder.',
    img: IMAGES.crew.pilar,
    bg: IMAGES.crew.pilar,
    initialZ: -12000,
    side: 'left',
    accent: '#FF8A4C',
    rgb: '255,138,76',
  },
  {
    file: 'FILE 06',
    codename: 'THE KID',
    name: 'David Martinez',
    quote: "I'm not trying to be a legend. I'm trying to stay alive.",
    img: IMAGES.crew.david,
    bg: IMAGES.crew.david,
    initialZ: -8000,
    side: 'right',
    accent: '#4FB8FF',
    rgb: '79,184,255',
  },
  {
    file: 'FILE 07',
    codename: 'THE MOON DREAMER',
    name: 'Lucyna \u201cLucy\u201d Kushinada',
    quote: "I'll take you to the moon. If you're ready to fall.",
    img: IMAGES.crew.lucy,
    bg: IMAGES.crew.lucy,
    initialZ: -4000,
    side: 'left',
    accent: '#FF6FD8',
    rgb: '255,111,216',
  },
  {
    file: 'FILE 08',
    codename: 'THE FINAL BOSS',
    name: 'Adam Smasher',
    quote: "Legends die. I don't.",
    img: IMAGES.crew.smasher,
    bg: IMAGES.crew.smasher,
    initialZ: 0,
    side: 'center',
    accent: '#FF2D2D',
    rgb: '255,45,45',
  },
];

const TOTAL_TRAVEL = 28000; // distance the camera travels through Z space
const SCROLL_VH = 2000; // scroll distance in viewport heights

/* ─── helpers ─── */
function sidePosition(side: 'left' | 'right' | 'center'): string {
  if (side === 'left') return 'translateX(-30%)';
  if (side === 'right') return 'translateX(30%)';
  return 'translateX(0)';
}

function sideJustify(side: 'left' | 'right' | 'center'): string {
  if (side === 'left') return 'flex-start';
  if (side === 'right') return 'flex-end';
  return 'center';
}

function sideTextAlign(side: 'left' | 'right' | 'center'): string {
  if (side === 'left') return 'left';
  if (side === 'right') return 'right';
  return 'center';
}

/* ─── component ─── */
export default function CrewDatabase() {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const charsRef = useRef<HTMLDivElement[]>([]);
  const textsRef = useRef<HTMLDivElement[]>([]);
  const bgsRef = useRef<HTMLDivElement[]>([]);
  const glitchFiredRef = useRef(false);

  useEffect(() => {
    const section = sectionRef.current;
    const world = worldRef.current;
    if (!section || !world) return;

    const chars = charsRef.current.filter(Boolean);
    const texts = textsRef.current.filter(Boolean);
    const bgs = bgsRef.current.filter(Boolean);
    if (!chars.length) return;

    const ctx = gsap.context(() => {
      // Master scroll progress drives the entire 3D world.
      const trigger = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: () => `+=${SCROLL_VH * 100}%`,
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          const cameraZ = p * TOTAL_TRAVEL;

          chars.forEach((el, i) => {
            const member = CREW[i];
            // currentZ = initialZ + (scrollProgress × totalTravelDistance)
            const currentZ = member.initialZ + cameraZ;
            // Distance from camera (camera sits at Z=0 looking down -Z).
            // currentZ is negative when far away, approaches 0 when at camera.
            const dist = -currentZ; // positive when in front of camera

            // Opacity based on Z position — visible when approaching, fades when leaving.
            // Peak at currentZ ≈ 0 (at camera).
            let opacity = 0;
            if (currentZ < -200) {
              // Approaching: fade in from -4000 to -200
              opacity = gsap.utils.clamp(0, 1, gsap.utils.mapRange(-4000, -200, 0, 1, currentZ));
            } else if (currentZ <= 800) {
              // At camera: full opacity, slight fade as it passes
              opacity = gsap.utils.mapRange(-200, 800, 1, 0.35, currentZ);
            } else {
              // Past camera: fade out
              opacity = gsap.utils.clamp(0, 0.35, gsap.utils.mapRange(800, 4000, 0.35, 0, currentZ));
            }

            gsap.set(el, {
              transform: `${sidePosition(member.side)} translateZ(${currentZ}px)`,
              opacity,
              zIndex: Math.round(10000 - dist),
            });

            // Background image opacity tracks the foreground character.
            if (bgs[i]) {
              // Background fades in as character approaches, out as it leaves.
              let bgOpacity = 0;
              if (currentZ < -200) {
                bgOpacity = gsap.utils.clamp(0, 0.45, gsap.utils.mapRange(-5000, -200, 0, 0.45, currentZ));
              } else if (currentZ <= 800) {
                bgOpacity = gsap.utils.mapRange(-200, 800, 0.45, 0.2, currentZ);
              } else {
                bgOpacity = gsap.utils.clamp(0, 0.2, gsap.utils.mapRange(800, 5000, 0.2, 0, currentZ));
              }
              gsap.set(bgs[i], { opacity: bgOpacity });
            }

            // Text reveal — only when character is at the camera.
            const atCamera = currentZ > -600 && currentZ < 1200;
            const text = texts[i];
            if (text) {
              if (atCamera) {
                // Stagger reveal: FILE 200ms → Codename 150ms → Name 150ms → Quote 150ms
                const children = Array.from(text.children) as HTMLElement[];
                // children order: [file, codename, name, quote]
                const delays = [0, 200, 350, 500];
                children.forEach((child, ci) => {
                  if (!child.dataset.revealed) {
                    gsap.to(child, {
                      opacity: 1,
                      y: 0,
                      duration: 0.5,
                      delay: delays[ci] / 1000,
                      ease: 'power2.out',
                      onStart: () => {
                        child.dataset.revealed = '1';
                        // Adam Smasher one-shot RGB glitch when name appears.
                        if (member.name === 'Adam Smasher' && ci === 2 && !glitchFiredRef.current) {
                          glitchFiredRef.current = true;
                          gsap.fromTo(
                            child,
                            { textShadow: '0 0 0 transparent' },
                            {
                              textShadow: '-3px 0 #00F0FF, 3px 0 #FF2D2D, 0 0 12px #FF2D2D',
                              duration: 0.09,
                              yoyo: true,
                              repeat: 1,
                              onComplete: () => {
                                gsap.set(child, { textShadow: '0 0 12px rgba(255,45,45,0.6)' });
                              },
                            }
                          );
                        }
                      },
                    });
                  }
                });
              } else if (currentZ > 1200) {
                // Character has passed — hide text so it can re-reveal if scrolled back.
                const children = Array.from(text.children) as HTMLElement[];
                children.forEach((child) => {
                  if (child.dataset.revealed) {
                    gsap.set(child, { opacity: 0, y: 16 });
                    delete child.dataset.revealed;
                  }
                });
              }
            }
          });

          // Final character — darken environment with red ambient.
          const finalMember = CREW[CREW.length - 1];
          const finalZ = finalMember.initialZ + cameraZ;
          if (finalZ > -3000) {
            const darkness = gsap.utils.clamp(0, 1, gsap.utils.mapRange(-3000, 0, 0, 1, finalZ));
            const overlay = section.querySelector('[data-dark-overlay]') as HTMLElement | null;
            if (overlay) {
              gsap.set(overlay, {
                opacity: darkness * 0.7,
                background:
                  'radial-gradient(ellipse at 50% 50%, rgba(40,0,0,0.4) 0%, rgba(5,5,7,0.92) 100%)',
              });
            }
          } else {
            const overlay = section.querySelector('[data-dark-overlay]') as HTMLElement | null;
            if (overlay) gsap.set(overlay, { opacity: 0 });
          }
        },
      });

      return trigger;
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="crew"
      ref={sectionRef}
      className="relative bg-[#050507]"
      style={{ height: `${SCROLL_VH}vh` }}
    >
      {/* ── Fixed fullscreen background layer ── */}
      <div
        ref={bgRef}
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        style={{ background: '#050507' }}
      >
        {/* Stacked background images — only opacity changes, never move */}
        {CREW.map((member, i) => (
          <div
            key={`bg-${i}`}
            ref={(el) => {
              if (el) bgsRef.current[i] = el;
            }}
            className="absolute inset-0"
            style={{ opacity: 0 }}
          >
            <img
              src={member.bg}
              alt=""
              className="h-full w-full object-cover"
              style={{
                filter:
                  'contrast(1.2) saturate(1.1) brightness(0.35)',
              }}
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(180deg, rgba(5,5,7,0.6) 0%, rgba(5,5,7,0.3) 50%, rgba(5,5,7,0.85) 100%)',
              }}
            />
          </div>
        ))}

        {/* Dark overlay for final character ambient */}
        <div
          data-dark-overlay
          className="absolute inset-0"
          style={{ opacity: 0, pointerEvents: 'none' }}
        />
      </div>

      {/* ── 3D foreground world ── */}
      <div
        ref={worldRef}
        className="sticky top-0 h-screen w-full overflow-visible"
        style={{
          perspective: '1400px',
          perspectiveOrigin: '50% 50%',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {CREW.map((member, i) => (
            <div
              key={`char-${i}`}
              ref={(el) => {
                if (el) charsRef.current[i] = el;
              }}
              className="absolute inset-0 flex items-center"
              style={{
                transformStyle: 'preserve-3d',
                justifyContent: sideJustify(member.side),
                opacity: 0,
                willChange: 'transform, opacity',
              }}
            >
              {/* Character portrait */}
              <div
                className="relative"
                style={{
                  width:
                    member.side === 'center'
                      ? 'min(520px, 50vw)'
                      : 'min(420px, 38vw)',
                  aspectRatio: '3 / 4',
                  transformStyle: 'preserve-3d',
                }}
              >
                <img
                  src={member.img}
                  alt={member.name}
                  className="h-full w-full object-cover object-top"
                  style={{
                    filter:
                      'contrast(1.12) saturate(1.18) brightness(0.82)',
                  }}
                  loading="lazy"
                />
                {/* Cinematic grade */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(5,5,7,0.2) 0%, transparent 40%, rgba(5,5,7,0.7) 100%)',
                  }}
                />
                {/* Accent rim */}
                <div
                  className="absolute inset-0"
                  style={{
                    boxShadow: `inset -3px 0 40px rgba(${member.rgb},0.1), inset 3px 0 40px rgba(${member.rgb},0.05)`,
                  }}
                />
                {/* Thin border */}
                <div
                  className="absolute inset-0"
                  style={{ border: `1px solid rgba(${member.rgb},0.18)` }}
                />
              </div>

              {/* Text block — positioned opposite the image */}
              <div
                ref={(el) => {
                  if (el) textsRef.current[i] = el;
                }}
                className="absolute flex flex-col"
                style={{
                  left: member.side === 'left' ? 'auto' : member.side === 'right' ? '6vw' : '50%',
                  right: member.side === 'left' ? '6vw' : member.side === 'right' ? 'auto' : 'auto',
                  top: '50%',
                  transform:
                    member.side === 'center'
                      ? 'translate(-50%, -50%)'
                      : 'translateY(-50%)',
                  textAlign: sideTextAlign(member.side),
                  maxWidth: '22rem',
                  pointerEvents: 'none',
                }}
              >
                <p
                  className="font-mono text-[11px] tracking-[0.42em] text-gray-500"
                  style={{ opacity: 0, transform: 'translateY(16px)' }}
                >
                  {member.file}
                </p>
                <p
                  className="mt-4 font-mono text-xs tracking-[0.38em] uppercase"
                  style={{
                    color: member.accent,
                    opacity: 0,
                    transform: 'translateY(16px)',
                  }}
                >
                  {member.codename}
                </p>
                <h3
                  className="mt-3 font-display font-black leading-[0.92] tracking-tight text-white"
                  style={{
                    fontSize:
                      member.side === 'center'
                        ? 'clamp(3.2rem, 9vw, 6.5rem)'
                        : 'clamp(2.6rem, 6.5vw, 5rem)',
                    opacity: 0,
                    transform: 'translateY(16px)',
                  }}
                >
                  {member.name}
                </h3>
                <p
                  className="mt-5 max-w-xs font-body text-base italic leading-relaxed text-gray-400"
                  style={{ opacity: 0, transform: 'translateY(16px)' }}
                >
                  &ldquo;{member.quote}&rdquo;
                </p>
                <div
                  className="mt-6 h-px"
                  style={{ background: member.accent, width: '52px' }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Scene index marker */}
        <div className="pointer-events-none absolute bottom-7 right-6 z-50 font-mono text-[10px] tracking-[0.32em] text-gray-700">
          CREW DATABASE
        </div>
      </div>
    </section>
  );
}
