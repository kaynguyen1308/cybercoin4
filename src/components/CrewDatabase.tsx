import { useEffect, useRef, useState } from 'react';
import { IMAGES } from '@/lib/images';

/* ─── types ─── */
type CrewMember = {
  file: string;
  codename: string;
  name: string;
  quote: string;
  img: string;
  side: 'left' | 'right' | 'center';
  accent: string;
  rgb: string;
};

/* ─── data ─── */
const CREW: CrewMember[] = [
  {
    file: 'FILE 01',
    codename: 'THE LITTLE DEVIL',
    name: 'Rebecca',
    quote: "I don't do second chances.",
    img: IMAGES.crew.rebecca,
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
    side: 'center',
    accent: '#FF2D2D',
    rgb: '255,45,45',
  },
];

/* ─── math ─── */
function ss(lo: number, hi: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - lo) / (hi - lo)));
  return t * t * (3 - 2 * t);
}

/* ─── scroll progress for a tall outer container ─── */
function useScrollProgress(ref: React.RefObject<HTMLDivElement>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      const rect = el.getBoundingClientRect();
      const range = rect.height - window.innerHeight;
      if (range > 0) setP(Math.max(0, Math.min(1, -rect.top / range)));
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [ref]);
  return p;
}

/* ─── single character scene ─── */
function CrewScene({ member, index }: { member: CrewMember; index: number }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const p = useScrollProgress(outerRef as React.RefObject<HTMLDivElement>);
  const [glitchFired, setGlitchFired] = useState(false);
  const isFinal = member.side === 'center';

  // Virtual camera phases
  // 0.00–0.20 : character waiting far in darkness
  // 0.20–0.62 : camera traveling toward character
  // 0.62–0.82 : camera at rest — optimal distance, text reveals
  // 0.82–1.00 : camera slowly moving past, character recedes
  const approach  = ss(0.08, 0.62, p);
  const arriving  = ss(0.56, 0.70, p);
  const leaving   = ss(0.80, 1.00, p);

  // IMAGE — camera distance simulation
  // scale: 0.14 (far/tiny) → 1.0 (at camera rest) → 0.80 (camera past)
  const imgScale      = Math.max(0.1, 0.14 + approach * (isFinal ? 0.93 : 0.86) - leaving * 0.20);
  // brightness: nearly 0 (darkness far away) → 0.9 (lit up close) → fades leaving
  const imgBrightness = Math.max(0.02, 0.04 + approach * 0.86 - leaving * 0.44);
  // blur: heavy far → 0 when camera arrives
  const imgBlur       = Math.max(0, 22 - approach * 22);
  // opacity: fades in as camera approaches, fades out as it leaves
  const imgOpacity    = Math.min(1, approach * 2.2) * (1 - leaving * 0.88);
  // ambient radial glow: appears as camera arrives, fades as it leaves
  const ambientOp     = ss(0.32, 0.64, p) * (1 - leaving);
  // camera has "arrived" and is gently drifting — controls drift animation
  const isDrifting    = arriving > 0.6 && leaving < 0.3;

  // TEXT — staggered reveal thresholds (only during camera-at-rest window)
  const textWindow = arriving * (1 - ss(0.81, 0.95, p));
  const fileIn   = p > 0.61;
  const codeIn   = p > 0.64;
  const nameIn   = p > 0.67;
  const quoteIn  = p > 0.70;

  // One-shot glitch for Adam Smasher
  useEffect(() => {
    if (isFinal && nameIn && !glitchFired) {
      setGlitchFired(true);
    }
  }, [isFinal, nameIn, glitchFired]);

  // Layout geometry
  const imgSide = isFinal
    ? { left: '50%', transform: `translateX(-50%) scale(${imgScale})`, width: 'min(540px,52vw)' }
    : member.side === 'left'
    ? { left: '5vw', transform: `scale(${imgScale})`, transformOrigin: 'center center', width: 'min(420px,38vw)' }
    : { right: '5vw', transform: `scale(${imgScale})`, transformOrigin: 'center center', width: 'min(420px,38vw)' };

  const textAlign = isFinal
    ? 'items-center text-center'
    : member.side === 'left'
    ? 'items-start text-left'
    : 'items-end text-right';

  // Text side offset — opposite the image
  const textOffset = isFinal
    ? ''
    : member.side === 'left'
    ? 'ml-auto pr-12'
    : 'mr-auto pl-12';

  return (
    <div ref={outerRef as React.RefObject<HTMLDivElement>} style={{ height: '170vh' }}>
      <div
        className="relative flex h-screen items-center overflow-hidden"
        style={{ position: 'sticky', top: 0 }}
      >
        {/* Ambient volumetric colour per character */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: ambientOp,
            background: `radial-gradient(50% 55% at ${
              isFinal ? '50% 48%' : member.side === 'left' ? '26% 50%' : '74% 50%'
            }, rgba(${member.rgb},0.14) 0%, transparent 68%)`,
          }}
        />

        {/* ── IMAGE — virtual camera depth ── */}
        <div
          className="absolute inset-0 z-0 flex items-center"
          style={{
            opacity: imgOpacity,
            filter: `blur(${imgBlur}px) brightness(${imgBrightness}) contrast(1.12) saturate(1.18)`,
            willChange: 'transform, filter, opacity',
            justifyContent: isFinal ? 'center' : member.side === 'left' ? 'flex-start' : 'flex-end',
            paddingLeft: member.side === 'left' && !isFinal ? '5vw' : undefined,
            paddingRight: member.side === 'right' && !isFinal ? '5vw' : undefined,
          }}
        >
          <div
            style={{
              width: isFinal ? 'min(560px,54vw)' : 'min(420px,38vw)',
              aspectRatio: '3 / 4',
              flexShrink: 0,
              transform: `scale(${imgScale})`,
              transformOrigin: 'center center',
              animation: isDrifting ? 'crew-cam-drift 9s ease-in-out infinite' : 'none',
              willChange: 'transform',
            }}
          >
            <img
              src={member.img}
              alt={member.name}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
            {/* portrait gradient — grounds character in darkness */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050507]/70 via-transparent to-[#050507]/20" />
            {/* subtle accent rim light */}
            <div
              className="absolute inset-0"
              style={{
                boxShadow: `inset -3px 0 40px rgba(${member.rgb},0.08), inset 3px 0 40px rgba(${member.rgb},0.04)`,
              }}
            />
          </div>
        </div>

        {/* Darkness vignette — deeper for final boss */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background: isFinal
              ? `radial-gradient(ellipse 70% 70% at 50% 50%, transparent 30%, rgba(5,5,7,0.82) 100%)`
              : member.side === 'left'
              ? `linear-gradient(90deg, rgba(5,5,7,0.1) 0%, rgba(5,5,7,0.0) 40%, rgba(5,5,7,0.88) 100%)`
              : `linear-gradient(90deg, rgba(5,5,7,0.88) 0%, rgba(5,5,7,0.0) 60%, rgba(5,5,7,0.1) 100%)`,
          }}
        />

        {/* ── TEXT ── */}
        <div className={`relative z-10 flex w-full items-center px-12`}>
          <div
            className={`flex flex-col ${textAlign} ${textOffset} max-w-sm`}
            style={{ opacity: textWindow }}
          >
            {/* FILE label */}
            <p
              className="font-mono text-[11px] tracking-[0.42em] text-gray-500"
              style={{
                opacity: fileIn ? 1 : 0,
                transform: `translateY(${fileIn ? 0 : 12}px)`,
                transition: 'opacity 0.5s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              {member.file}
            </p>

            {/* Codename */}
            <p
              className="mt-4 font-mono text-xs tracking-[0.38em] uppercase"
              style={{
                color: member.accent,
                opacity: codeIn ? 1 : 0,
                transform: `translateY(${codeIn ? 0 : 12}px)`,
                transition: 'opacity 0.5s ease 0.15s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.15s',
              }}
            >
              {member.codename}
            </p>

            {/* Character Name — oversized */}
            <h3
              className={`mt-3 font-display font-black leading-[0.92] tracking-tight text-white ${
                isFinal
                  ? 'text-[clamp(3.2rem,9vw,6.5rem)]'
                  : 'text-[clamp(2.6rem,6.5vw,5rem)]'
              } ${glitchFired ? 'crew-glitch' : ''}`}
              data-text={member.name}
              style={{
                opacity: nameIn ? 1 : 0,
                transform: `translateY(${nameIn ? 0 : 16}px)`,
                transition: 'opacity 0.65s ease 0.30s, transform 0.65s cubic-bezier(0.16,1,0.3,1) 0.30s',
              }}
            >
              {member.name}
            </h3>

            {/* Quote */}
            <p
              className="mt-5 max-w-xs font-body text-base italic leading-relaxed text-gray-400"
              style={{
                opacity: quoteIn ? 1 : 0,
                transform: `translateY(${quoteIn ? 0 : 10}px)`,
                transition: 'opacity 0.6s ease 0.48s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.48s',
              }}
            >
              &ldquo;{member.quote}&rdquo;
            </p>

            {/* Accent line */}
            <div
              className="mt-6 h-px"
              style={{
                width: nameIn ? '52px' : '0',
                background: member.accent,
                transition: 'width 0.9s cubic-bezier(0.16,1,0.3,1) 0.55s',
              }}
            />
          </div>
        </div>

        {/* File index marker */}
        <span className="pointer-events-none absolute bottom-7 right-6 z-10 font-mono text-[10px] tracking-[0.32em] text-gray-800">
          {String(index + 1).padStart(2, '0')} / 08
        </span>

        {/* Scene divider line — only when camera is far away or leaving */}
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-px -translate-x-1/2"
          style={{
            width: '120px',
            background: `linear-gradient(90deg, transparent, rgba(${member.rgb},0.25), transparent)`,
            opacity: Math.max(0, 1 - arriving * 3),
          }}
        />
      </div>
    </div>
  );
}

/* ─── section header ─── */
function SectionHeader() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative z-10 mx-auto flex max-w-6xl flex-col items-center px-6 pt-28 pb-20 text-center"
    >
      <p
        className="font-mono text-[11px] tracking-[0.5em] text-cyber-magenta"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}
      >
        // CREW DATABASE
      </p>
      <h2
        className="mt-5 font-display text-[clamp(3rem,10vw,7rem)] font-black leading-[0.95] tracking-tight text-white"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: 'opacity 0.9s ease 0.15s, transform 0.9s cubic-bezier(0.16,1,0.3,1) 0.15s',
        }}
      >
        LEGENDS <span style={{ color: '#FFE600' }}>NEVER</span> DIE.
      </h2>
      <p
        className="mt-6 font-body text-lg italic text-gray-500"
        style={{
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease 0.35s',
        }}
      >
        Every legend leaves a mark.
      </p>

      {/* decorative line */}
      <div
        className="mt-10 h-px"
        style={{
          width: visible ? '80px' : '0',
          background: 'linear-gradient(90deg, transparent, rgba(0,240,255,0.5), transparent)',
          transition: 'width 1.1s cubic-bezier(0.16,1,0.3,1) 0.5s',
        }}
      />
    </div>
  );
}

/* ─── main export ─── */
export default function CrewDatabase() {
  return (
    <section id="crew" className="relative bg-[#050507]">
      <SectionHeader />

      {CREW.map((member, i) => (
        <CrewScene key={member.name} member={member} index={i} />
      ))}

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
