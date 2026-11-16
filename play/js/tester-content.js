// Content for the first-run tester (js/tester.js).
// Everything here is copied word for word from the owner's data files, so the
// tester never invents a question, a proverb or a card:
//   trivia   -> questions.js, "Malawian History"
//   ndagi    -> ndagi-extra.js, "Malawi Proverbs"
//   apa      -> apa.js, an existing place (photo, name, town, decoys)
//   charades -> charades-influencers.js, the free deck
const testerContent = {
  trivia: {
    label: 'Malawian History',
    q: 'In which year did Malawi gain independence from Britain?',
    options: ['1960', '1963', '1964', '1966'],
    answer: 2
  },
  ndagi: {
    label: 'Malawi Proverbs',
    q: 'Chiswe chimodzi sichiumba ____.',
    options: ['chulu', 'nyumba', 'phiri', 'mtengo'],
    answer: 0,
    meaning: 'Great achievements require cooperation.'
  },
  apa: {
    label: 'Apa Ndipati',
    id: 'parliament-zomba'
  },
  charades: {
    label: 'Malawian Influencers',
    word: 'Tusaiwe Yana'
  }
};
