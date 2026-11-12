// ALUM site content. One entry per app; add an object and it appears on
// the downloads list automatically.

const SITE = {
  name: 'ALUM',
  full: 'ALUM',
  city: 'Lilongwe, Malawi',
  email: 'malumbomsopa@gmail.com',
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

    version: '1.2.3',
    versionCode: 7,
    released: '12 Nov 2026',
    size: '14.4 MB',
    minAndroid: '7.0',
    price: 'Free',
    apk: 'downloads/GameNight-1.2.3.apk',
    sha256: 'E4AEF91E38C3D484DE4A53BF8173EE306D48D5A88C5AAA953C3294F8CBD58CA9',

    // Real ratings only. average stays null until there are reviews.
    rating: { average: null, count: 0 },
    reviews: [],

    summary: 'Six games in one app, for a room full of people and a single phone passing around the circle.',

    about: [
      'GameNight is a pack of six games for a group with one phone: Trivia, Charades, Dares, Quick Challenge, Ndagi and Apa Ndipati.',
      'It works completely offline. Trivia covers Malawian and world topics, Ndagi is built on Malawian proverbs and riddles, and Charades and Dares are written for a Malawian crowd rather than translated from somewhere else.',
      'Games run for a fixed number of rounds so nobody is stuck holding the phone all night. Every right answer is worth exactly 1 point, and points open up the locked categories.'
    ],

    highlights: [
      { t: 'One point per answer', d: 'Every correct answer is worth exactly 1 point. Charades and Dares are for laughs, not points.' },
      { t: 'Play with no internet', d: 'Games, questions and timers are all on the phone. Only buying an unlock needs a connection.' },
      { t: 'Built for Malawian nights', d: 'Chichewa proverbs, Malawian trivia, and dares that make sense here.' },
      { t: 'Cheap to unlock', d: 'Earn points by playing, or pay with mobile money. One category, or the whole game.' }
    ],

    modes: ['Trivia', 'Charades', 'Dares', 'Quick Challenge', 'Ndagi', 'Apa Ndipati'],

    whatsNew: [
      'The intro can be replayed any time from Settings.',
      'Ndagi now plays Malawian proverbs properly, with the meaning shown after each answer.',
      'Asian Proverbs added as its own Ndagi set.',
      'Intro is shorter and no longer mentions any price.'
    ],

    screenshots: [
      { src: 'assets/img/shots/home.jpg', alt: 'GameNight home screen with the six game tiles' },
      { src: 'assets/img/shots/trivia.jpg', alt: 'A trivia question with four answers' },
      { src: 'assets/img/shots/ndagi.jpg', alt: 'A Malawian proverb with its meaning revealed' },
      { src: 'assets/img/shots/charades.jpg', alt: 'A charades card with the timer running' },
      { src: 'assets/img/shots/results.jpg', alt: 'End of round score screen' }
    ]
  }
];
