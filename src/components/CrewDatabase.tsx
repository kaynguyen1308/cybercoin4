import { IMAGES } from '@/lib/images';

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
function CrewScene({ member, index }: { member: CrewMember; index: number }) {
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
    <div style={sceneStyle}>
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
          <p className="font-mono text-[11px] tracking-[0.42em] text-gray-500">
            {member.file}
          </p>
          <p className="mt-4 font-mono text-xs tracking-[0.38em] uppercase text-cyber-cyan">
            {member.codename}
          </p>
          <h3
            className={`mt-3 font-display font-black leading-[0.92] tracking-tight text-white ${
              isFinal
                ? 'text-[clamp(3.2rem,9vw,6.5rem)]'
                : 'text-[clamp(2.6rem,6.5vw,5rem)]'
            }`}
          >
            {member.name}
          </h3>
          <p className="mt-5 max-w-xs font-body text-base italic leading-relaxed text-gray-400">
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
  return (
    <section id="crew" className="relative bg-[#050507]">
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
            {CREW.map((m) => (
              <div
                key={m.name}
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
              <CrewScene key={m.name} member={m} index={i} />
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
