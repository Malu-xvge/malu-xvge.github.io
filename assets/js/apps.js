// ALUM site content. One entry per app; add an object and it appears on
// the downloads list automatically.

const SITE = {
  name: 'ALUM',
  full: 'ALUM',
  city: 'Lilongwe, Malawi',
  email: 'alumtech9@gmail.com',
  github: 'https://github.com/Malu-xvge'
};

const APPS = [
  {
    id: 'gamenight',
    name: 'GameNight',
    tagline: 'Six party games for one phone, one room, no signal.',
    icon: 'assets/img/gamenight-icon.png',
    status: 'available',
    featured: true,

    version: '1.4.0',
    versionCode: 10,
    released: '14 Nov 2026',
    size: '15.5 MB',
    minAndroid: '7.0',
    price: 'Free',
    apk: 'https://github.com/Malu-xvge/malu-xvge.github.io/releases/download/gamenight-1.4.0/GameNight-1.4.0.apk',
    sha256: 'B14F415939F03F629A84EAC57F2CC8AE219312DB4B368D5AB39A0A8A31039E94',

    // The APK is attached to this GitHub release, so the download count comes
    // straight from GitHub instead of a made-up number.
    release: { repo: 'Malu-xvge/malu-xvge.github.io', tag: 'gamenight-1.4.0' },

    // Same build, running as a web app for iPhone/iPad at /play/.
    iphone: {
      url: 'play/',
      size: '11 MB',
      label: 'Play on iPhone'
    },

    // Real ratings only. average stays null until there are reviews.
    rating: { average: null, count: 0 },
    reviews: [],

    summary: 'Six games in one app, for a room full of people and a single phone passing around the circle.',

    about: [
      'GameNight is a pack of six games for a group with one phone: Trivia, Charades, Dares, Quick Challenge, Ndagi and Apa Ndipati.',
      'It works completely offline. Trivia covers Malawian and world topics, Ndagi is built on Malawian proverbs and riddles, and Charades and Dares are written for a Malawian crowd rather than translated from somewhere else.',
      'Games run for a fixed number of rounds so nobody is stuck holding the phone all night. Every right answer is worth exactly 1 point, and points open up the locked categories for good.',
      'Cash is sold as a pass, never as a subscription: a day is MK 500, thirty days MK 2,000, ninety days MK 5,000, and MK 10,000 buys it for life. A pass opens everything until it ends, and it never renews by itself.'
    ],

    highlights: [
      { t: 'One point per answer', d: 'Every correct answer is worth exactly 1 point. Charades and Dares are for laughs, not points.' },
      { t: 'Play with no internet', d: 'Games, questions and timers are all on the phone. Only buying a pass needs a connection.' },
      { t: 'Built for Malawian nights', d: 'Chichewa proverbs, Malawian trivia, and dares that make sense here.' },
      { t: 'Pay for as long as you need', d: 'A day is MK 500, a month is MK 2,000 and three months are MK 5,000. Lifetime is MK 10,000. Points still open categories for good, free.' }
    ],

    modes: ['Trivia', 'Charades', 'Dares', 'Quick Challenge', 'Ndagi', 'Apa Ndipati'],

    passes: [
      { name: 'Day pass', price: 'MK 500', note: '24 hours' },
      { name: 'Month', price: 'MK 2,000', note: '30 days' },
      { name: 'Three months', price: 'MK 5,000', note: '90 days' },
      { name: 'Lifetime', price: 'MK 10,000', note: 'Pay once, keep it' }
    ],

    whatsNew: [
      'Settings is split into Gameplay and Unlock, so sound, timers and the intro sit apart from points and passes.',
      'The intro now points to Settings → Unlock when it explains earning and unlocking.',
      'After a few finished rounds, a one-time card offers to rate GameNight. The same button is in Settings; both open the reviews section on the website.',
      'No price changes: points still open a category for good, and passes still never renew by themselves.'
    ],

    screenshots: [
      { src: 'assets/img/shots/home.jpg', alt: 'GameNight home screen with the six game tiles' },
      { src: 'assets/img/shots/trivia.jpg', alt: 'A trivia question with four answers, in landscape', wide: true },
      { src: 'assets/img/shots/ndagi.jpg', alt: 'A Malawian proverb with its meaning revealed' },
      { src: 'assets/img/shots/charades.jpg', alt: 'A charades card and the running timer, in landscape', wide: true },
      { src: 'assets/img/shots/results.jpg', alt: 'End of round score screen' }
    ]
  }
];
