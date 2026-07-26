// Curated cyberpunk stock photography from Pexels (free license).
// Direct image URLs — referenced, not downloaded.
//
// The gallery portraits evoke the spirit of the Edgerunners cast without
// using copyrighted anime artwork — each is a free Pexels stock photo.

const px = (id: number, slug: string, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}/${slug}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const IMAGES = {
  heroBg: px(30315845, 'urban-street-scene-at-night-with-neon-lights', 1920),

  // About-section feature cards
  aboutPortrait: px(8108330, 'man-in-black-jacket-smiling', 900),
  aboutRobotic: px(31840611, 'futuristic-cyberpunk-woman-with-robotic-arm', 900),

  // Gallery — 6 portraits evoking the Edgerunners crew
  gallery: [
    px(36064312, 'futuristic-cyberpunk-portrait-in-vibrant-colors', 800),   // young man, vibrant neon — David vibe
    px(8108553, 'woman-in-neon-light-at-the-party', 800),                   // woman in neon light — Lucy vibe
    px(6940320, 'neon-lights-behind-a-bald-man', 800),                     // bald man, tough — Maine vibe
    px(2825033, 'model-holding-neon-lights', 800),                          // woman holding neon — Rebecca vibe
    px(8108429, 'man-in-black-t-shirt', 800),                               // man in black, neon — Pilar vibe
    px(8108589, 'woman-leaning-on-a-wall', 800),                            // woman leaning, neon — Kiwi vibe
  ],

  // Quote portraits
  quotes: [
    px(8108382, 'man-in-black-jacket', 400),
    px(8107899, 'woman-wearing-sunglasses', 400),
    px(2825033, 'model-holding-neon-lights', 400),
  ],

  // Crew Database — 8 classified files
  crew: {
    rebecca: px(2825033, 'model-holding-neon-lights', 900),
    maine: px(6940320, 'neon-lights-behind-a-bald-man', 900),
    kiwi: px(8108589, 'woman-leaning-on-a-wall', 900),
    dorio: px(8107899, 'woman-wearing-sunglasses', 900),
    pilar: px(8108429, 'man-in-black-t-shirt', 900),
    david: px(36064312, 'futuristic-cyberpunk-portrait-in-vibrant-colors', 900),
    lucy: px(8108553, 'woman-in-neon-light-at-the-party', 900),
    smasher: px(31840611, 'futuristic-cyberpunk-woman-with-robotic-arm', 900),
  },

  roadmapBg: px(10591995, 'street-in-city-at-night-after-rain', 1600),
  buyBg: px(31966784, 'futuristic-portrait-with-neon-lighting', 1200),
  footerBg: px(31987988, 'free-photo-of-futuristic-fashion-portrait-with-neon-glow', 1600),
};
