// Approved audit fixes. They are applied in memory, on top of the question files, when the app starts,
// so your own files (questions.js, quickchallenge.js, ndagi.js ...) are never overwritten.
// Each fix finds its question by a piece of its text; if you have already edited that question, the fix simply skips it.
(function () {
  const skipped = [];

  function idx(list, part) {
    return list.findIndex(it => (it.q || it.riddle || '').toLowerCase().includes(part.toLowerCase()));
  }
  function setTrivia(cat, part, newItem) {
    const list = triviaCategories[cat];
    const i = list ? idx(list, part) : -1;
    if (i < 0) { skipped.push(cat + ': ' + part); return; }
    list[i] = newItem;
  }
  function moveTrivia(fromCat, part, toCat, replacement) {
    const from = triviaCategories[fromCat], to = triviaCategories[toCat];
    const i = from ? idx(from, part) : -1;
    if (i < 0 || !to) { skipped.push(fromCat + ': ' + part); return; }
    const item = replacement || from[i];
    from.splice(i, 1);
    to.push(item);
  }
  function fixAnswer(item, text) {   // keep the answer number pointing at the right option
    const k = item.options.indexOf(text);
    if (k >= 0) item.answer = k;
  }

  if (typeof triviaCategories !== 'undefined') {
    // Showbiz
    const sb = triviaCategories['Malawian Showbiz'];
    let i = sb ? idx(sb, 'roots reggae') : -1;
    if (i >= 0) { sb[i].q = 'Which Malawian band is known for reggae?'; fixAnswer(sb[i], 'Black Missionaries'); } else skipped.push('Showbiz: reggae');
    i = sb ? idx(sb, 'Wambali') : -1;
    if (i >= 0) sb[i] = { q: 'Wambali Mkandawire is best known for creating what kind of sound?',
      options: ['An authentic Malawian sound', 'Heavy metal', 'Country and western', 'Electronic techno'], answer: 0 }; else skipped.push('Showbiz: Wambali');
    setTrivia('Malawian Showbiz', 'recognises Gule Wamkulu', {
      q: 'The Chewa masked dance recognised by UNESCO is performed in Malawi, Zambia and which other country?',
      options: ['Tanzania', 'Mozambique', 'Zimbabwe', 'Botswana'], answer: 1 });

    // Geography and Politics wording
    setTrivia('Malawian Geography', 'Lake of Stars', {
      q: "Which lake is nicknamed the 'Lake of Stars'?",
      options: ['Lake Malombe', 'Lake Malawi', 'Lake Chiuta', 'Lake Kazuni'], answer: 1 });
    setTrivia('Malawian Politics', 'interpret Malawi', {
      q: "Which is Malawi's highest court?",
      options: ['Supreme Court of Appeal', 'High Court', 'Industrial Relations Court', 'Magistrate Court'], answer: 0 });

    // Pop culture: two Titanic questions -> one
    setTrivia('Film, Music & Pop Culture', 'played Jack', {
      q: "Which animated film features the song 'Let It Go'?",
      options: ['Moana', 'Frozen', 'Tangled', 'Encanto'], answer: 1 });

    // Football questions move from History to Sports
    const hist = triviaCategories['Malawian History'];
    const top = hist ? idx(hist, 'all-time leading goal scorer') : -1;
    if (top >= 0) fixAnswer(hist[top], 'Kinnah Phiri');
    moveTrivia('Malawian History', 'all-time leading goal scorer', 'Sports Trivia');
    moveTrivia('Malawian History', 'Joseph Kamwendo', 'Sports Trivia');
    moveTrivia('Malawian History', 'Gerald Phiri', 'Sports Trivia', {
      q: 'What is the nickname of the Malawi national football team?',
      options: ['The Flames', 'The Super Eagles', 'The Chipolopolo', 'The Warriors'], answer: 0 });
    // keep History at 10 questions
    if (hist && hist.length < 10) {
      const extra = [
        { q: "Which town was Malawi's capital until the government moved to Lilongwe in the 1970s?", options: ['Blantyre', 'Zomba', 'Mzuzu', 'Mangochi'], answer: 1 },
        { q: 'In which year did Malawi become a republic?', options: ['1963', '1964', '1966', '1971'], answer: 2 },
        { q: 'In which year did David Livingstone reach Lake Malawi, then called Lake Nyasa?', options: ['1841', '1859', '1873', '1890'], answer: 1 }
      ];
      while (hist.length < 10 && extra.length) hist.push(extra.shift());
    }

    // Netball: the league in 2015 was the ANZ Championship
    setTrivia('Sports Trivia', 'Mwai Kumwenda', {
      q: 'Mwai Kumwenda was named Player of the Tournament at the 2015 Netball World Cup. In which league was she playing at the time?',
      options: ['Suncorp Super Netball (Australia)', 'Netball Super League (UK)', 'ANZ Championship', 'Premier Netball League'], answer: 2 });
  }

  if (typeof quickChallengeQuestions !== 'undefined') {
    const swap = (text, item) => {
      const i = quickChallengeQuestions.findIndex(q => q.q === text);
      if (i < 0) { skipped.push('Quick: ' + text); return; }
      quickChallengeQuestions[i] = item;
    };
    swap('Capital of Malawi?', { q: "Which colour is the top stripe of Malawi's flag?", a: 'Black', wrong: ['Red', 'Green', 'White'] });
    swap('Year of independence?', { q: "What does 'Muli bwanji?' mean?", a: 'How are you?', wrong: ['Thank you', 'Goodbye', 'I am hungry'] });
    swap('Neighboring country to the west?', { q: "Chichewa for 'water' is?", a: 'Madzi', wrong: ['Moto', 'Nsima', 'Mkaka'] });
    swap("Malawi's first president?", { q: 'Which district is Zomba Plateau in?', a: 'Zomba', wrong: ['Mulanje', 'Dedza', 'Salima'] });
    swap('Traditional masked dance?', { q: "Chichewa for 'friend' is?", a: 'Bwenzi', wrong: ['Mlendo', 'Mwana', 'Mfumu'] });
  }

  if (typeof ndagiCategories !== 'undefined') {
    // two riddles had the same answer (a river): drop the second
    const am = ndagiCategories['Authentic Malawian'];
    const r = am ? idx(am, 'bank but no money') : -1;
    if (r >= 0) am.splice(r, 1); else skipped.push('Ndagi: river duplicate');

    // Folktales: one clear answer each. Sources: Tumbuka mythology (Wikipedia); "The Mean Hyena: a folktale from Malawi"
    // (J. Sierra, 1997); "Kalulu nthawi ya cilala", Chewa tale recorded at Dedza in 1958 (ILAM); Chimombo, "Napolo and the Python".
    ndagiCategories['Malawian Folktales'] = [
      { riddle: 'In Chewa and Nyanja folktales, this clever trickster is called Kalulu. What animal is it?', answer: 'The hare', wrong: ['The hyena', 'The tortoise', 'The lion'] },
      { riddle: 'In Malawian folktales, Fisi is the greedy trickster who plays nasty tricks on the others. What animal is Fisi?', answer: 'The hyena', wrong: ['The hare', 'The leopard', 'The crocodile'] },
      { riddle: "In the Malawian folktale 'The Mean Hyena', which animal gets revenge on Fisi by painting new coats for all the animals?", answer: 'Kamba the tortoise', wrong: ['Kalulu the hare', 'The lion', 'The elephant'] },
      { riddle: 'In a Chewa drought tale recorded in Dedza, Kalulu tells the animals water will be found under which tree?', answer: 'The Msendekere tree', wrong: ['The baobab', 'The mango tree', 'The fig tree'] },
      { riddle: 'Among the three animals that recur in Tumbuka stories (fulu, kalulu and chimbwi), which one is generally the wisest?', answer: 'Fulu, the tortoise', wrong: ['Kalulu, the hare', 'Chimbwi, the hyena', 'The lion'] },
      { riddle: 'Which legendary rainmaker of the Nyanja people is said to have left his footprints in solid granite?', answer: 'Mbona', wrong: ['Napolo', 'Kalulu', 'Chauta'] },
      { riddle: 'In Malawian tradition, which serpent spirit is blamed for earthquakes and landslides?', answer: 'Napolo', wrong: ['Mbona', 'Chauta', 'Kalulu'] }
    ];
  }

  // Charades: drop the accidental empty slot, remove duplicate prompts and fix a few typos.
  // Applied in memory so the owner's charades.js is never rewritten.
  if (typeof charadesCategories !== 'undefined') {
    const rename = {
      'Temwah Chawinga 🐐': 'Temwa Chawinga 🐐',
      'Louis Hamilton': 'Lewis Hamilton',
      'Lebron James': 'LeBron James',
      'Floyd Money Mayweather': 'Floyd Mayweather',
      'Dr.Saulos Chilima': 'Dr. Saulos Chilima'
    };
    Object.keys(charadesCategories).forEach(cat => {
      const list = charadesCategories[cat];
      if (!Array.isArray(list)) return;
      const seen = new Set();
      charadesCategories[cat] = list
        .filter(item => typeof item === 'string' && item.trim())
        .map(item => {
          const clean = item.trim();
          return rename[clean] || clean;
        })
        .filter(item => {
          const key = item.toLowerCase();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
    });
  }

  if (skipped.length && typeof console !== 'undefined') console.warn('audit-fixes: skipped (already edited?)', skipped);
})();
