// GameNight points and unlock settings.
// Edit the numbers below, or move a category between tiers, without touching anything else.
// Any category that is not listed here is FREE. Every locked item can be unlocked by EARNING points or by BUYING it.
//   locked category: 200 points or MK 500   (Ndagi categories: 100 points)
//   whole game:     MK 2,000
const UNLOCK_CONFIG = {
  welcomePoints: 100,                                   // one-time gift on first launch
  // points per right answer. Charades and Dares are marked by the players themselves, so they earn nothing.
  earn: { trivia: 1, ndagi: 1, quick: 1, apa: 1, charades: 0, dares: 0 },
  standard: { points: 200, kwacha: 500 },
  premium: { points: 200, kwacha: 500 },
  pointsByMode: { ndagi: 100 },                         // overrides the tier points for these modes
  unlockAllKwacha: 2000,                                // "unlock everything" in Settings
  paymentApiBase: 'https://gamenight-payments.onrender.com', // public HTTPS URL of server/ (no trailing slash)
  paymentsEnabled: true,                                // true only after paymentApiBase is deployed

  tiers: {
    trivia:   { 'World Trivia': 'premium', 'Malawian Politics': 'premium', 'Film, Music & Pop Culture': 'premium',
                'Science & Nature': 'standard', 'Books, Language & General Knowledge': 'standard' },
    charades: { 'Malawian History': 'premium', 'Malawian Geography': 'premium', 'Famous Faces': 'premium', 'Movies & Pop Culture': 'premium',
                'Malawian Politics': 'standard', 'Landmarks & Wonders': 'standard', 'Science in Action': 'standard' },
    dares:    { 'Spicy': 'premium' },
    // Malawian Proverbs is free and featured first. Authentic Malawian starts locked.
    ndagi:    { 'Authentic Malawian': 'standard', 'European': 'standard', 'Asian Proverbs': 'standard' }
  },

  // whole game modes that are locked (Quick Challenge and the rest are free)
  modes: { apa: { tier: 'premium', points: 200, kwacha: 500 } }
};
