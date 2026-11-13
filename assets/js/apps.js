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

    version: '1.3.0',
    versionCode: 9,
    released: '13 Nov 2026',
    size: '15.5 MB',
    minAndroid: '7.0',
    price: 'Free',
    apk: 'downloads/GameNight-1.3.0.apk',
    sha256: 'E490EA71B2401022C17AD23A1B86F45270CF79FE7FDA2386CEC643E007FB8AD0',

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
      'Passes replace the single-category price: MK 500 for a day, MK 2,000 for a month, MK 5,000 for three months, MK 10,000 for life.',
      'Locked categories now open with points only, and a category you open stays open for good.',
      'Buying while a pass is running adds the new days to the end of it. Nothing renews on its own.',
      'The intro can be replayed any time from Settings.'
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
