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

    version: '1.5.1',
    versionCode: 13,
    released: '16 Nov 2026',
    size: '21.2 MB',
    minAndroid: '7.0',
    price: 'Free',
    apk: 'https://github.com/Malu-xvge/malu-xvge.github.io/releases/download/gamenight-1.5.1/GameNight-1.5.1.apk',
    sha256: '4DC0C16FED8E60920E8904F3D2A5AFFA36342E2D85C944F1036EBEB83563803A',

    // The APK is attached to a GitHub release, so the download count comes
    // straight from GitHub. All releases with this prefix are added together,
    // so updating the app does not reset the count to zero.
    release: { repo: 'Malu-xvge/malu-xvge.github.io', prefix: 'gamenight-' },

    // Same build, running as a web app for iPhone/iPad at /play/.
    iphone: {
      url: 'play/',
      size: '17 MB',
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

    screenshots: [
      { src: 'assets/img/shots/home.jpg', alt: 'GameNight home screen with the six game tiles' },
      { src: 'assets/img/shots/apa-chisepo-hut.jpg', alt: 'Apa Ndipati: Chisepo Hut on the Mulanje Massif' },
      { src: 'assets/img/shots/ndagi.jpg', alt: 'A Malawian proverb with its meaning revealed' },
      { src: 'assets/img/shots/apa-parliament-zomba.jpg', alt: 'Apa Ndipati: the Old Parliament Building in Zomba' },
      { src: 'assets/img/shots/results.jpg', alt: 'End of round score screen' },
      { src: 'assets/img/shots/charades-eli-njuchi.jpg', alt: 'Charades card reading Eli Njuchi, in landscape', wide: true },
      { src: 'assets/img/shots/charades-driemo.jpg', alt: 'Charades card reading Driemo, in landscape', wide: true },
      { src: 'assets/img/shots/charades-noel-lifa.jpg', alt: 'Charades card reading Noel Stern Lifa, in landscape', wide: true },
      { src: 'assets/img/shots/charades-voodoo-streams.jpg', alt: 'Charades card reading Voodoo Streams, in landscape', wide: true }
    ]
  }
];
