
const ndagiCategories = {
  "Authentic Malawian": [
    {
      "riddle": "Chikhadakhala ndi mpeni tikadatha tonse.",
      "answer": "Mdima",
      "wrong": ["Mphepo", "Moto", "Mvula"]
    },
    {
      "riddle": "Komwe ayang'ana ndi konko.",
      "answer": "Madzi",
      "wrong": ["Mphepo", "Utsi", "Moto"]
    },
    {
      "riddle": "Kanthu kosagona tulo.",
      "answer": "Madzi",
      "wrong": ["Dzuwa", "Mwezi", "Moto"]
    },
    {
      "riddle": "Kanthu kosamangika n'chiyani?",
      "answer": "Madzi",
      "wrong": ["Mwala", "Mtengo", "Dengu"]
    },
    {
      "riddle": "Sioneka!",
      "answer": "Mphepo",
      "wrong": ["Utsi", "Mtambo", "Mvula"]
    },
    {
      "riddle": "Angakuphere bambo wako n'kofunikabe.",
      "answer": "Moto",
      "wrong": ["Mpeni", "Mtsinje", "Mwala"]
    },
    {
      "riddle": "Dziwe lalikulu alikusamba m'mbali mokha.",
      "answer": "Moto",
      "wrong": ["Nyanja", "Mvula", "Mtsinje"]
    },
    {
      "riddle": "Kanthu kosaoneka komwe kadagwera.",
      "answer": "Mtambo",
      "wrong": ["Mwala", "Mtengo", "Nyumba"]
    },
    {
      "riddle": "Njira imeneyo ukapanda mubvi sungaipite.",
      "answer": "Nyanja (bwato ndi mponda)",
      "wrong": ["Phiri", "Nkhalango", "Msewu"]
    },
    {
      "riddle": "Ndacera msampha wanga, kalangali kapita.",
      "answer": "Mphepo",
      "wrong": ["Mbewa", "Kalulu", "Nkhunda"]
    },
    {
      "riddle": "Ngakhale Mzungu amamulemekeza.",
      "answer": "Ntedza",
      "wrong": ["Mbatata", "Chimanga", "Nzimbe"]
    },
    {
      "riddle": "Njobvu yafera ku Blantyre, kuno mafupa okha gobede-gobede.",
      "answer": "Nkhungulupsya",
      "wrong": ["Mchenga", "Makala", "Miyala"]
    },
    {
      "riddle": "Nyumba yanga ili ndi mzati umodzi.",
      "answer": "Bowa",
      "wrong": ["Mtengo", "Nkhuku", "Mwala"]
    },
    {
      "riddle": "Nyumba yanga yaikulu koma iribe chitseko.",
      "answer": "Dzira",
      "wrong": ["Dengu", "Nyumba", "Mphika"]
    },
    {
      "riddle": "Amayi anga abereka mwana wachilimwe.",
      "answer": "Mkhwani",
      "wrong": ["Mwana wa munthu", "Mwana wa mbuzi", "Mwana wa nkhuku"]
    },
    {
      "riddle": "Nyumba yanga imatsegulidwa ndi zala chokha.",
      "answer": "Ntedza",
      "wrong": ["Dzira", "Bowa", "Mphika"]
    },
    {
      "riddle": "Mtsogoleri amene amanyamula madzi mumtengo.",
      "answer": "Nzimbe",
      "wrong": ["Mtsinje", "Mchere", "Mwala"]
    },
    {
      "riddle": "Chiri pafupi ndi mpira koma sichiponyedwa.",
      "answer": "Zikope",
      "wrong": ["Mwala", "Mpira", "Nsidze"]
    },
    {
      "riddle": "Imafika m'mawa kwambiri koma imagona dzuwa lisanafike pamutu.",
      "answer": "Lume",
      "wrong": ["Mvula", "Mame a m'mawa", "Mwezi"]
    },
    {
      "riddle": "Mtsikana wina woyala mphasa yaikulu koma amagonera pansi.",
      "answer": "Dungu",
      "wrong": ["Nkhuku", "Mbuzi", "Mbalame"]
    },
    {
      "riddle": "Mbalame yanga yaikulu njofooka, kumenya nkhondo popanda chinthu.",
      "answer": "Tambala",
      "wrong": ["Nkhunda", "Chiwombankhanga", "Nkhuku yaikazi"]
    },
    {
      "riddle": "Amasamba tsiku lililonse koma satha udindo wotuluka m'dzenje.",
      "answer": "Chule",
      "wrong": ["Nsomba", "Mbuzi", "Nkhuku"]
    }
  ],

  "Malawian Folktales": [
    {
      "riddle": "M'nthano zambiri za nyama, ndi nyama iti yaing'ono yomwe imagonjetsa zazikulu pogwiritsa ntchito nzeru?",
      "answer": "Kalulu",
      "wrong": ["Mkango", "Njovu", "Mphiri"]
    },
    {
      "riddle": "M'nthano za Kalulu, kodi mphamvu yake yaikulu nthawi zambiri imakhala iti?",
      "answer": "Nzeru ndi machenjerero",
      "wrong": ["Kukula kwa thupi", "Mano akuthwa", "Kuthamanga kokha"]
    },
    {
      "riddle": "M'nthano za nyama, ndi nyama iti yomwe imadziwika ndi chipolopolo chake cholimba?",
      "answer": "Fulu",
      "wrong": ["Kalulu", "Fisi", "Mbalame"]
    },
    {
      "riddle": "M'nthano, nyama yanzeru ikafuna kuthawa mdani wamphamvu, nthawi zambiri imagwiritsa ntchito chiyani?",
      "answer": "Nzeru",
      "wrong": ["Mkwiyo", "Dyera", "Kugona"]
    },
    {
      "riddle": "M'nthano za nyama, ndi nyama iti yomwe imadziwika ndi kulira kwake komanso kudya nyama zakufa?",
      "answer": "Fisi",
      "wrong": ["Nkhunda", "Kalulu", "Gulugufe"]
    },
    {
      "riddle": "Ndi nyama iti yomwe ili ndi chipolopolo ndipo imadziwika chifukwa cha kuyenda pang'onopang'ono?",
      "answer": "Fulu",
      "wrong": ["Galu", "Mbuzi", "Nkhuku"]
    },
    {
      "riddle": "M'nthano, munthu amene amangofuna kutenga zonse yekha nthawi zambiri amatchedwa chiyani?",
      "answer": "Wadyera",
      "wrong": ["Wopatsa", "Woleza mtima", "Wolimbikira"]
    },
    {
      "riddle": "M'nthano zambiri, n'chifukwa chiyani nyama yaing'ono imatha kupulumuka pamene yayikulu ikulephera?",
      "answer": "Imagwiritsa ntchito nzeru",
      "wrong": ["Imakhala ndi mphamvu zambiri", "Imakhala yayikulu mwadzidzidzi", "Imakhala yolemera"]
    },
    {
      "riddle": "Ndi nyama iti yomwe m'nthano zambiri imadziwika ndi kunyenga anzake kuti ipeze chakudya?",
      "answer": "Kalulu",
      "wrong": ["Nkhunda", "Mbuzi", "Ng'ombe"]
    },
    {
      "riddle": "Kodi phunziro lalikulu la nthano zambiri zokhudza dyera ndi lotani?",
      "answer": "Dyera lingabweretse mavuto",
      "wrong": ["Dyera limapambana nthawi zonse", "Mphamvu ndiyo yokhayo yofunika", "Kunyenga ena ndi kwabwino"]
    },
    {
      "riddle": "M'nthano za Fulu, ndi khalidwe liti lomwe nthawi zina limamubweretsera mavuto?",
      "answer": "Dyera kapena kudzikuza",
      "wrong": ["Kugawana", "Kuthandiza ena", "Kuleza mtima"]
    },
    {
      "riddle": "Ndi chiyani chomwe munthu wanzeru angagwiritse ntchito kuti agonjetse vuto lalikulu popanda kumenya nkhondo?",
      "answer": "Kuganiza mwanzeru",
      "wrong": ["Kukwiya", "Kuthawa nthawi zonse", "Kudzitamandira"]
    }
  ],

  "African": [
    {
      "riddle": "I have cities but no houses, forests but no trees, and rivers but no water. What am I?",
      "answer": "A map",
      "wrong": ["A photograph", "A storybook", "A dream"]
    },
    {
      "riddle": "I speak every language but have no mouth. I answer when you call, but I am not alive. What am I?",
      "answer": "An echo",
      "wrong": ["A parrot", "A radio", "A singer"]
    },
    {
      "riddle": "The more you take away from me, the bigger I become. What am I?",
      "answer": "A hole",
      "wrong": ["A basket", "A tree", "A river"]
    },
    {
      "riddle": "I have a neck but no head, and I can hold water. What am I?",
      "answer": "A bottle",
      "wrong": ["A drum", "A shoe", "A basket"]
    },
    {
      "riddle": "I have four legs but cannot walk. People sit on me every day. What am I?",
      "answer": "A chair",
      "wrong": ["A goat", "A dog", "A tortoise"]
    },
    {
      "riddle": "I have no wings, yet I fly. I have no eyes, yet I can bring tears. What am I?",
      "answer": "Smoke",
      "wrong": ["A stone", "A tree", "A drum"]
    },
    {
      "riddle": "I am born in the ground, wrapped in a skin, and become food when cooked. What am I?",
      "answer": "A tuber",
      "wrong": ["A fish", "A bird", "A shell"]
    },
    {
      "riddle": "I stand on one leg with a hat on my head, and when the rain comes I may grow. What am I?",
      "answer": "A mushroom",
      "wrong": ["A chicken", "A tree", "A goat"]
    },
    {
      "riddle": "I carry my house wherever I go. What am I?",
      "answer": "A tortoise",
      "wrong": ["A monkey", "A lion", "A fish"]
    },
    {
      "riddle": "I have a mouth but never eat, and I keep moving without legs. What am I?",
      "answer": "A river",
      "wrong": ["A cooking pot", "A mountain", "A house"]
    },
    {
      "riddle": "I can be planted, watered, and harvested, but I am not an animal. What am I?",
      "answer": "A crop",
      "wrong": ["A stone", "A cooking pot", "A drum"]
    },
    {
      "riddle": "I am made by many hands, yet I can be carried by one. I hold grain but never eat. What am I?",
      "answer": "A woven basket",
      "wrong": ["A cooking fire", "A hoe", "A water well"]
    },
    {
      "riddle": "I rise in the morning, bring light to the land, and disappear at evening. What am I?",
      "answer": "The sun",
      "wrong": ["The moon", "A star", "A firefly"]
    },
    {
      "riddle": "I have no feet, but I can cross a village and reach another country. What am I?",
      "answer": "A story",
      "wrong": ["A cooking pot", "A tree stump", "A stone"]
    },
    {
      "riddle": "I am strongest when many of me work together, but weak when alone. What am I?",
      "answer": "A community",
      "wrong": ["A mountain", "A river", "A shadow"]
    },
    {
      "riddle": "I can feed a family, but if I am wasted, hunger may follow. What am I?",
      "answer": "Food",
      "wrong": ["A drum", "A mat", "A broom"]
    },
    {
      "riddle": "I have a head and a tail, but no body. What am I?",
      "answer": "A coin",
      "wrong": ["A snake", "A fish", "A lizard"]
    },
    {
      "riddle": "I am invisible, but you can feel me moving through the trees. What am I?",
      "answer": "Wind",
      "wrong": ["A rock", "A shadow", "A root"]
    }
  ],

  "European": [
    {
      "riddle": "What has to be broken before you can use it?",
      "answer": "An egg",
      "wrong": ["A glass", "A plate", "A pencil"]
    },
    {
      "riddle": "What gets wetter the more it dries?",
      "answer": "A towel",
      "wrong": ["A sponge cake", "A blanket", "A newspaper"]
    },
    {
      "riddle": "What has many keys but cannot open a single lock?",
      "answer": "A piano",
      "wrong": ["A keyring", "A toolbox", "A door"]
    },
    {
      "riddle": "What has hands and a face but no arms or eyes?",
      "answer": "A clock",
      "wrong": ["A doll", "A statue", "A mirror"]
    },
    {
      "riddle": "The more you take, the more you leave behind. What are they?",
      "answer": "Footsteps",
      "wrong": ["Coins", "Books", "Leaves"]
    },
    {
      "riddle": "What can travel around the world while staying in one corner?",
      "answer": "A postage stamp",
      "wrong": ["A suitcase", "A compass", "A passport"]
    },
    {
      "riddle": "What belongs to you, but other people use it more than you do?",
      "answer": "Your name",
      "wrong": ["Your shoes", "Your house", "Your money"]
    },
    {
      "riddle": "What has one eye but cannot see?",
      "answer": "A needle",
      "wrong": ["A camera", "A mirror", "A telescope"]
    },
    {
      "riddle": "What can fill a room but takes up no physical space?",
      "answer": "Light",
      "wrong": ["A table", "A chair", "A wardrobe"]
    },
    {
      "riddle": "What has a head and a tail but no body?",
      "answer": "A coin",
      "wrong": ["A snake", "A fish", "A horse"]
    },
    {
      "riddle": "What has words but never speaks?",
      "answer": "A book",
      "wrong": ["A parrot", "A radio", "A telephone"]
    },
    {
      "riddle": "What goes up but never comes down?",
      "answer": "Your age",
      "wrong": ["A balloon", "A staircase", "A kite"]
    },
    {
      "riddle": "What has a thumb and four fingers but is not alive?",
      "answer": "A glove",
      "wrong": ["A hand", "A shoe", "A sock"]
    },
    {
      "riddle": "What begins with T, ends with T, and has T inside it?",
      "answer": "A teapot",
      "wrong": ["A tent", "A ticket", "A trumpet"]
    },
    {
      "riddle": "What can you catch but cannot throw?",
      "answer": "A cold",
      "wrong": ["A ball", "A fish", "A stone"]
    },
    {
      "riddle": "I am tall when young and short when old. What am I?",
      "answer": "A candle",
      "wrong": ["A mountain", "A tree", "A tower"]
    },
    {
      "riddle": "What has many teeth but cannot bite?",
      "answer": "A comb",
      "wrong": ["A crocodile", "A wolf", "A shark"]
    },
    {
      "riddle": "What has a ring but no finger?",
      "answer": "A telephone",
      "wrong": ["A glove", "A bracelet", "A watch strap"]
    },
    {
      "riddle": "What comes once in a minute, twice in a moment, but never in a thousand years?",
      "answer": "The letter M",
      "wrong": ["The letter T", "The letter A", "The letter O"]
    },
    {
      "riddle": "The more there is of me, the less you can see. What am I?",
      "answer": "Darkness",
      "wrong": ["Light", "Music", "Heat"]
    }
  ]
};
