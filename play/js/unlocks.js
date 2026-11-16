// GameNight points and unlock settings.
// Edit the numbers below, or move a category between tiers, without touching anything else.
// Any category that is not listed here is FREE.
// Locked categories open with POINTS for one month (unlockDays below), then they lock again.
// Cash does not buy a single category: it buys a PASS that opens everything until it ends,
// or a lifetime unlock.
//   locked category: 200 points   (Ndagi categories: 100 points)
//   day pass MK 500 (24 h) | 30-day MK 2,000 | 90-day MK 5,000 | lifetime MK 10,000
const UNLOCK_CONFIG = {
  welcomePoints: 100,                                   // one-time gift on first launch
  // points per right answer. Charades and Dares are marked by the players themselves, so they earn nothing.
  earn: { trivia: 1, ndagi: 1, quick: 1, apa: 1, charades: 0, dares: 0 },
  standard: { points: 200 },
  premium: { points: 200 },
  pointsByMode: { ndagi: 100 },                         // overrides the tier points for these modes
  unlockDays: 30,                                       // a points unlock lasts this long, then locks again
  customFreeRounds: 2,                                  // Custom Charades rounds that need no pass
  passGraceHours: 12,                                   // a pass keeps working this long after it ends
  paymentApiBase: 'https://gamenight-payments.onrender.com', // public HTTPS URL of server/ (no trailing slash)
  paymentsEnabled: true,                                // true only after paymentApiBase is deployed

  // Paid access. days: 0 means it never expires. Buying while a pass is
  // running adds the new days to the end of the current one.
  passes: [
    { id: 'pass::day',     days: 1, kwacha: 500,   label: 'Day pass',     note: '24 hours' },
    { id: 'pass::month',   days: 30, kwacha: 2000,  label: '30-day pass',  note: 'One month' },
    { id: 'pass::quarter', days: 90, kwacha: 5000,  label: '3-month pass', note: 'Three months' },
    { id: 'unlock::life',  days: 0, kwacha: 10000, label: 'Lifetime',     note: 'Pay once, keep it' }
  ],

  tiers: {
    trivia:   { 'World Trivia': 'premium', 'Malawian Politics': 'premium', 'Pop Culture': 'premium',
                'Science & Nature': 'standard', 'General Knowledge': 'standard' },
    charades: { 'Malawian History': 'premium', 'Malawian Geography': 'premium', 'Famous Faces': 'premium', 'Pop Culture': 'premium',
                'Malawian Politics': 'standard', 'Landmarks': 'standard', 'Science in Action': 'standard',
                // Dream Team: Influencers is free, so Showbiz is the deck that locks.
                'Malawian Showbiz': 'standard' },
    dares:    { 'Spicy': 'premium' },
    // Malawian Proverbs is free and featured first. Authentic Malawian starts locked.
    ndagi:    { 'Authentic Malawian': 'standard', 'European': 'standard', 'Asian Proverbs': 'standard' }
  },

  // whole game modes that are locked (Quick Challenge and the rest are free)
  modes: { apa: { tier: 'premium', points: 200 } }
};
