/**
 * Initial contents of the `categories` and `pois` tables, loaded by `npm run db:seed`.
 * Once seeded, edit them in the admin (/admin), not here.
 */
import type { CategorySectionId } from '../data/sections.ts'
import type { SeedPoi } from '../data/pois.ts'
import type { CategoryTypeId } from '../lib/category-types.ts'

/** A category to create, with its subcategories. Its id and address are its name, slugified. */
export interface SeedCategory {
  label: string
  /** Defaults to a list of categories. */
  type?: CategoryTypeId
  /** "Nuovo …" in the admin; defaults to "categoria" for lists, "luogo" otherwise. */
  singular?: string
  children?: SeedCategory[]
}

const places = (label: string): SeedCategory => ({ label, type: 'place', singular: 'luogo' })
const recipes = (label: string): SeedCategory => ({ label, type: 'recipe', singular: 'ricetta' })
const products = (label: string): SeedCategory => ({ label, type: 'product', singular: 'prodotto' })
const producers = (label: string): SeedCategory => ({ label, type: 'producer', singular: 'produttore' })

/** Top-level categories of each section, all lists of categories, with the subcategories their places go in. */
export const seedCategories: Record<CategorySectionId, (string | SeedCategory)[]> = {
  scopri: [
    { label: 'Borghi', children: [places('Borghi di collina'), places('Borghi delle Apuane')] },
    { label: 'Musei', children: [places('Musei e collezioni')] },
    { label: 'Luoghi storici', children: [places('Castelli e fortificazioni'), places('Piazze e testimonianze')] },
    { label: 'Siti naturalistici', children: [places('Montagne, grotte e cascate'), places('Mare e parchi')] },
    { label: 'Palazzi', children: [places('Palazzi, ville e teatri')] },
    { label: 'Chiese e luoghi sacri', children: [places('Chiese del centro'), places('Pievi e abbazie')] },
  ],
  vivi: ['Esperienze', 'Itinerari culturali', 'Eventi', 'Mercati'],
  gusta: [
    { label: 'Ricette', children: [recipes('Piatti della tradizione')] },
    { label: 'Prodotti tipici', children: [products('Salumi')] },
    { label: 'I produttori camaioresi', children: [producers('Aziende agricole'), producers('Apicoltori')] },
  ],
  info: [],
}

/**
 * Places of the Scopri section: real places of Camaiore, from Visit Tuscany, Wikipedia,
 * versilia.org and the Lucca museums; coordinates from those pages or OpenStreetMap.
 */
const scopriPois: SeedPoi[] = [
  // ── Borghi ──
  {
    id: 'pedona',
    name: 'Pedona',
    category: 'borghi-di-collina',
    summary: 'Il borgo raccolto attorno al suo antico castello, sulle colline sopra Camaiore.',
    description:
      "Pedona è nata attorno al castello dei Nobili Flammi, documentato dall'XI secolo, con una torre circolare e spesse mura di difesa. I lucchesi lo distrussero nel 1170, ma l'impianto è ancora riconoscibile: le case si stringono dentro il circuito delle mura, attorno al campanile. Nel 1324 Castruccio Castracani vi fece costruire una nuova torre di avvistamento, rimasta in piedi fino al Seicento. Al centro del paese sorge la chiesa di San Jacopo, del Duecento, che conserva un organo ottocentesco di Agati e Tronci.",
    area: 'Colline di Camaiore',
    lat: 43.92356,
    lon: 10.29613,
  },
  {
    id: 'monteggiori',
    name: 'Monteggiori',
    category: 'borghi-di-collina',
    summary: 'Vicoli lastricati in cima a un colle, con lo sguardo sulla costa della Versilia.',
    description:
      'A pochi chilometri da Camaiore, Monteggiori si raccoglie in cima a un dolce colle, tra vicoli lastricati e case in pietra. In alto sorge la rocca, sul sito di un castello documentato dal 1224 e restaurato tra il 1995 e il 2000, oggi residenza privata. Dal borgo la vista si apre sulla pianura e sulla costa, fino al mare.',
    area: 'Colline di Camaiore',
    lat: 43.94678,
    lon: 10.26665,
  },
  {
    id: 'montemagno',
    name: 'Montemagno',
    category: 'borghi-di-collina',
    summary: 'Il borgo della valle della Freddana, sulla strada per Lucca.',
    description:
      'Piccolo borgo raccolto attorno alla sua chiesa e attraversato dalla strada che da Camaiore sale per la panoramica valle della Freddana verso Lucca. Sul colle che lo domina restano le rovine del castello, documentato dal 1099, che sorvegliava il passaggio della Via Francigena tra la piana della Versilia e Lucca.',
    area: 'Valle della Freddana',
    lat: 43.91048,
    lon: 10.33915,
  },
  {
    id: 'gombitelli',
    name: 'Gombitelli',
    category: 'borghi-di-collina',
    summary: 'Il borgo dei fabbri sul crinale, con un dialetto tutto suo.',
    description:
      "A quasi 500 metri, su un crinale tra la valle della Freddana e quella della Pedogna, Gombitelli è cresciuto attorno a un castello documentato nel 1029, di cui restano i ruderi di due torri. Tra Quattrocento e Cinquecento il paese fu ripopolato da famiglie venute dal Nord, e la lavorazione del ferro, in particolare dei chiodi, ne è diventata la tradizione: le scorie delle fucine si vedono ancora nella calce dei muri. Gombitelli è un'isola linguistica, con un dialetto vicino a quelli dell'Italia settentrionale. La chiesa di San Michele Arcangelo, citata nel 1260, fu ricostruita dal 1614.",
    area: 'Valle della Freddana',
    lat: 43.92047,
    lon: 10.37171,
  },
  {
    id: 'casoli',
    name: 'Casoli',
    category: 'borghi-delle-apuane',
    summary: 'Il borgo dei graffiti, ai piedi del Monte Matanna.',
    description:
      "Casoli, a circa 400 metri tra le Apuane, è conosciuto come il borgo dei graffiti: muri, piazzette e vicoli sono decorati con opere eseguite con la tecnica dello sgraffito, nei toni del rosso, del giallo e delle terre. La tradizione nasce all'inizio degli anni Cinquanta, quando il pittore e scultore Rosario Murabito si stabilì in paese e realizzò il primo graffito nella piazza principale; negli anni molti altri artisti hanno lasciato il loro segno, fino a farne un museo all'aperto. Nel vecchio lavatoio, nella parte bassa del borgo, si trova il Narciso che si specchia nell'acqua. La casa dell'artista, la Casa Museo Murabito, è stata lasciata al Comune perché fosse aperta al pubblico. Da qui partono i sentieri per il Matanna, il Prana e la Grotta all'Onda.",
    area: 'Valle del Lombricese',
    lat: 43.96354,
    lon: 10.33032,
    featured: true,
  },
  {
    id: 'lombrici',
    name: 'Lombrici',
    category: 'borghi-delle-apuane',
    summary: "Il paese all'imbocco della valle del Lombricese.",
    description:
      "Piccolo paese all'ingresso della valle del torrente Lombricese, a pochi minuti da Camaiore. È il punto di partenza dell'anello del Monte Prana, con un piccolo parcheggio subito dopo la chiesa, e delle passeggiate verso le cascate di Candalla e le rovine del castello di Montecastrese.",
    area: 'Valle del Lombricese',
    lat: 43.95346,
    lon: 10.31997,
  },

  // ── Musei ──
  {
    id: 'museo-archeologico',
    name: 'Civico Museo Archeologico',
    category: 'musei-e-collezioni',
    summary: 'Dalla preistoria al Medioevo, nelle sale di Palazzo Tori Massoni.',
    description:
      "Il museo occupa il rinascimentale Palazzo Tori Massoni e racconta il territorio in tredici sale, dall'evoluzione umana all'età protoindustriale. Le sezioni archeologiche espongono i reperti della Grotta all'Onda, frequentata dai Neanderthal, quelli etrusco-romani della villa di via Acquarella a Capezzano Pianore e quelli medievali del castello di Montecastrese. Tra gli oggetti più curiosi, il calco di un femore di Neanderthal trovato alla Buca del Tasso e i corredi in selce, rame e conchiglie della Buca del Corno. Postazioni tattili e sperimentali permettono di toccare le riproduzioni e provare le tecniche del passato.",
    area: 'Centro storico',
    address: 'Via Vittorio Emanuele 181',
    lat: 43.93713,
    lon: 10.30525,
  },
  {
    id: 'museo-arte-sacra',
    name: "Museo d'Arte Sacra",
    category: 'musei-e-collezioni',
    summary: "Le opere d'arte delle chiese di Camaiore, accanto alla chiesa di San Michele.",
    description:
      "Il museo, legato alla Confraternita del Santissimo Sacramento, di San Michele e di San Vincenzo, raccoglie dipinti, sculture, tessuti e oggetti liturgici provenienti dalle chiese di Camaiore e dei dintorni, con opere toscane e fiamminghe a partire dal Quattrocento. Si trova in un edificio del Seicento lungo la Via Francigena, nel cuore del centro storico.",
    area: 'Centro storico',
    address: 'Via IV Novembre 71',
    lat: 43.93704,
    lon: 10.30472,
  },

  // ── Luoghi storici ──
  {
    id: 'castello-di-montemagno',
    name: 'Castello di Montemagno',
    category: 'castelli-e-fortificazioni',
    summary: 'Le rovine del castello che sorvegliava la Via Francigena.',
    description:
      "Sul colle sopra il borgo di Montemagno restano le rovine del castello, citato nei documenti già nel 1099. Era residenza nobiliare e rifugio durante gli assedi, e dalla sua posizione dominava la Via Francigena tra la piana della Versilia e Lucca. Le indagini archeologiche indicano che sulla sommità sorgeva un palazzo signorile; oggi rimangono tratti delle mura e la facciata della chiesa di San Bartolomeo, restaurati dal proprietario.",
    area: 'Valle della Freddana',
    lat: 43.90945,
    lon: 10.34032,
  },
  {
    id: 'montecastrese',
    name: 'Castello di Montecastrese',
    category: 'castelli-e-fortificazioni',
    summary: 'Un villaggio fortificato medievale, riemerso dagli scavi archeologici.',
    description:
      "Sulle alture sopra Lombrici si trovano i resti di Montecastrese, castello citato dal 1219 e conquistato e distrutto da Lucca nella prima metà del Duecento. Il sito copre circa due ettari, chiusi da una doppia cerchia di mura, con due torri quadrate, il villaggio di un centinaio di case e la chiesa di Santa Barbara. Gli scavi delle università toscane sono ancora in corso e i reperti sono esposti al Civico Museo Archeologico, che organizza visite guidate. Si raggiunge solo a piedi, con una camminata dall'area di Candalla.",
    area: 'Valle del Lombricese',
    lat: 43.95128,
    lon: 10.32266,
  },
  {
    id: 'porta-lombricese',
    name: 'Porta di San Pietro',
    category: 'castelli-e-fortificazioni',
    summary: 'Detta anche Porta Lombricese: l’unica porta rimasta delle mura del 1374.',
    description:
      "Nel 1374 Lucca trasformò Camaiore in un castello, con mura merlate alte circa nove metri, tredici torri e quattro porte. Le mura furono in gran parte demolite dalla seconda metà dell'Ottocento: resta questa porta, sul lato nord vicino alla Collegiata, con un tratto della cinta settentrionale. Sull'arco, un affresco del Seicento con la Vergine e il Bambino tra i santi Benedetto e Rocco, dipinto su uno più antico del Quattrocento; accanto, gli stemmi di Camaiore.",
    area: 'Centro storico',
    lat: 43.93857,
    lon: 10.30451,
  },
  {
    id: 'piazza-san-bernardino',
    name: 'Piazza San Bernardino',
    category: 'piazze-e-testimonianze',
    summary: 'Il cuore del centro storico, tra la Collegiata e il Municipio.',
    description:
      "La piazza principale di Camaiore, su cui si affacciano la Collegiata di Santa Maria Assunta e il palazzo comunale, circondata dalle antiche case del borgo e dai caffè. Il centro, l'antico Campus Maior, fu fondato da Lucca nel 1255 con un impianto regolare di strade parallele. Per il Corpus Domini le vie intorno si coprono dei tappeti di segatura colorata su cui passa la processione.",
    area: 'Centro storico',
    lat: 43.93828,
    lon: 10.30416,
    featured: true,
  },
  {
    id: 'ferriera-dei-barsi',
    name: 'Ferriera dei Barsi',
    category: 'piazze-e-testimonianze',
    summary: 'Una ferriera storica a Candalla, dove il maglio ad acqua batte ancora il ferro.',
    description:
      "La ferriera di Candalla è documentata nel 1808, quando apparteneva alla famiglia Cerù; all'inizio del Novecento la acquistarono i Barsi, fabbri venuti dalla zona di Stazzema, che la conducono ancora oggi. Conserva il maglio idraulico, ancora funzionante, e le forge originali: si può entrare a vedere da vicino il lavoro del fabbro.",
    area: 'Valle del Lombricese',
    address: 'Via di Candalla 264',
    lat: 43.95566,
    lon: 10.32269,
  },

  // ── Siti naturalistici ──
  {
    id: 'cascate-di-candalla',
    name: 'Cascate di Candalla',
    category: 'montagne-grotte-e-cascate',
    summary: 'Pozze di acqua limpida e cascate lungo il torrente Lombricese.',
    description:
      "Lungo la valle del Lombricese le acque limpide del torrente formano pozze e cascatelle, in particolare nella gola di Candalla, dove la cascata principale si getta in una piscina naturale. Il sentiero, segnato CAI 00, parte dalla località Cascine e risale il torrente tra i resti di mulini, frantoi e opifici dell'Ottocento e ripari dell'età del Bronzo. È facile ma scivoloso vicino all'acqua. In estate i parcheggi sono pochi e regolamentati: conviene usare la navetta organizzata dal Comune dal centro di Camaiore.",
    area: 'Valle del Lombricese',
    lat: 43.95739,
    lon: 10.32394,
    featured: true,
  },
  {
    id: 'grotta-all-onda',
    name: "Grotta all'Onda",
    category: 'montagne-grotte-e-cascate',
    summary: "Una grande grotta carsica abitata dai Neanderthal, nei boschi del Matanna.",
    description:
      "A circa 700 metri di quota, sopra Casoli, la Grotta all'Onda è un unico grande ambiente di circa 40 per 60 metri, con piccole cascate che scendono lungo le pareti esterne e alimentano un ruscello. I suoi sedimenti raccontano circa 170.000 anni di storia: fu riparo dei cacciatori Neanderthal e, nel Neolitico e nell'età del Rame, di comunità di agricoltori e allevatori. Si raggiunge a piedi con un comodo sentiero CAI tra i boschi di querce del Monte Matanna; i reperti sono esposti al Civico Museo Archeologico.",
    area: 'Valle del Lombricese',
    lat: 43.9751,
    lon: 10.34121,
  },
  {
    id: 'monte-prana',
    name: 'Monte Prana',
    category: 'montagne-grotte-e-cascate',
    summary: 'La montagna di Camaiore, con la vista dal mare alle Apuane.',
    description:
      "Con i suoi oltre 1.200 metri, il Prana domina la conca di Camaiore: ai suoi piedi i Romani fondarono i piccoli villaggi da cui è nato il paese. L'anello classico parte da Lombrici, circa 14 km con quasi 1.200 metri di dislivello, ed è adatto a escursionisti allenati. Dalla vetta lo sguardo spazia sul mare, sul Monte Gabberi, sulle Alpi Apuane e sul lago di Massaciuccoli.",
    area: 'Valle del Lombricese',
    lat: 43.95269,
    lon: 10.3554,
  },
  {
    id: 'pontile-lido-di-camaiore',
    name: 'Pontile Bellavista Vittoria',
    category: 'mare-e-parchi',
    summary: 'Il pontile del Lido, con la rotonda sul mare e le Apuane alle spalle.',
    description:
      "Simbolo del Lido di Camaiore, il pontile inaugurato nel 2008 si allunga dritto nel mare fino a una rotonda da cui si vedono il Tirreno e, alle spalle, le Alpi Apuane. Intorno, chilometri di spiaggia di sabbia fine, premiata con la Bandiera Blu, e la passeggiata di viale Pistelli ed Europa, tra stabilimenti, gelaterie e ristoranti. Bonificato nell'Ottocento, il Lido è diventato presto una meta di villeggiatura amata da artisti e scrittori.",
    area: 'Lido di Camaiore',
    lat: 43.89185,
    lon: 10.22253,
  },
  {
    id: 'parco-bussoladomani',
    name: 'Parco Bussoladomani',
    category: 'mare-e-parchi',
    summary: 'Il parco della mitica Bussoladomani, oggi spazio verde e arena per concerti.',
    description:
      "Nel 1976 Sergio Bernardini aprì qui il tendone della Bussoladomani, che ospitò artisti internazionali e, nel 1978, l'ultimo concerto dal vivo di Mina. Dopo anni di abbandono il Comune ha recuperato l'area in un parco pubblico di circa 75.000 metri quadrati, con un'arena per i grandi concerti, i festival e il cinema all'aperto, e il complesso dei vecchi casolari della tenuta agricola, detto delle Fattorie.",
    area: 'Lido di Camaiore',
    address: 'Viale John Fitzgerald Kennedy',
    lat: 43.90874,
    lon: 10.21661,
  },

  // ── Palazzi ──
  {
    id: 'villa-borbone-delle-pianore',
    name: 'Villa Borbone delle Pianore',
    category: 'palazzi-ville-e-teatri',
    summary: "La villa dei duchi di Borbone, dove nacque l'ultima imperatrice d'Austria.",
    description:
      "Il nucleo più antico è un vecchio mulino degli Orsucci, trasformato in villa alla fine del Settecento per Maria Teresa di Savoia, duchessa di Lucca e moglie di Carlo Lodovico di Borbone, che vi visse a lungo e vi morì nel 1879. Più tardi divenne una delle residenze preferite di Roberto I di Borbone-Parma: qui nacque nel 1892 Zita, futura ultima imperatrice d'Austria. Il parco, disegnato da Jean-Pierre Barillet-Deschamps, ospita specie rare ed esotiche; la cappella ha una facciata neorinascimentale del 1893. Oggi è sede di una scuola internazionale e si visita in occasione delle giornate delle dimore storiche.",
    area: 'Piana di Capezzano',
    lat: 43.93401,
    lon: 10.26283,
  },
  {
    id: 'teatro-dell-olivo',
    name: "Teatro dell'Olivo",
    category: 'palazzi-ville-e-teatri',
    summary: 'Uno dei teatri più antichi della lucchesia, nato da una filanda di lana.',
    description:
      "A metà del Seicento l'Accademia dei Deboli trasformò un filatoio di lana in teatro. Intorno al 1770 la sala fu ridisegnata a pianta ovale con i palchetti, e nel 1920 fu ridecorata dal pittore Domenico Ghiselli. Danneggiato nella guerra e chiuso negli anni Cinquanta, il teatro è stato acquistato dal Comune e restaurato su progetto di Riccardo Gizdulich: ha riaperto nell'agosto 2003 e oggi ospita 255 spettatori.",
    area: 'Centro storico',
    address: 'Via Vittorio Emanuele',
    lat: 43.93645,
    lon: 10.30665,
  },

  // ── Chiese e luoghi sacri ──
  {
    id: 'collegiata',
    name: 'Collegiata di Santa Maria Assunta',
    category: 'chiese-del-centro',
    summary: 'La chiesa principale di Camaiore, del 1278, con il suo campanile.',
    description:
      "Costruita nel 1278 su Piazza San Bernardino, ha una facciata romanica con un piccolo rosone; il campanile, del 1365, domina il profilo del centro storico. All'interno, a tre navate, si trovano uno degli organi più antichi della Toscana, del Cinquecento, un crocifisso ligneo del Trecento, la Madonna del Carmine di Giovanni Marracci e la Comunione degli Apostoli di Pier Dandini. Il fonte battesimale è ricavato da un sarcofago romano.",
    area: 'Centro storico',
    lat: 43.93801,
    lon: 10.30431,
    featured: true,
  },
  {
    id: 'chiesa-di-san-michele',
    name: 'Chiesa di San Michele',
    category: 'chiese-del-centro',
    summary: 'Una sobria chiesa romanica in pietra, ricostruita com’era dopo la guerra.',
    description:
      "Chiesa romanica del XII secolo, austera, con la muratura in pietra a vista dentro e fuori. Distrutta nel 1944, è stata ricostruita nelle forme originali. È sede della Confraternita del Santissimo Sacramento, di San Michele e di San Vincenzo, che custodisce gli arredi e le opere del vicino Museo d'Arte Sacra.",
    area: 'Centro storico',
    lat: 43.93706,
    lon: 10.30497,
  },
  {
    id: 'chiesa-di-san-lazzaro',
    name: "Chiesa dell'Immacolata e di San Lazzaro",
    category: 'chiese-del-centro',
    summary: 'Un portico a due ordini che apre sulla chiesa e sul chiostro.',
    description:
      "La chiesa risale al 1610: un portico a due ordini introduce sia alla chiesa sia al chiostro. All'interno l'altare maggiore con la statua dell'Immacolata Concezione, sei altari laterali, un coro ligneo e ricchi arredi.",
    area: 'Centro storico',
    lat: 43.93927,
    lon: 10.29276,
  },
  {
    id: 'badia-san-pietro',
    name: 'Badia di San Pietro',
    category: 'pievi-e-abbazie',
    summary: 'Abbazia benedettina di origine longobarda, tappa della Via Francigena.',
    description:
      "Fondata dai monaci benedettini nell'alto Medioevo, lungo la strada tra Lucca e Luni, la Badia è stata per secoli un punto di riferimento per i pellegrini della Via Francigena. Nel XII secolo, anche grazie ai doni di Matilde di Canossa, la chiesa fu ampliata a tre navate. Conserva l'impianto romanico originale, l'abside, la parte bassa della facciata e i resti delle mura merlate del monastero; si entra dalla vecchia porta del convento. L'organo seicentesco è il protagonista, ogni estate, del Festival Organistico Internazionale Città di Camaiore.",
    area: 'Centro storico',
    address: 'Via Badia 15',
    lat: 43.93856,
    lon: 10.31034,
    featured: true,
  },
  {
    id: 'pieve-di-santo-stefano',
    name: 'Pieve dei Santi Stefano e Giovanni Battista',
    category: 'pievi-e-abbazie',
    summary: 'La chiesa madre del territorio di Camaiore, citata già nell’817.',
    description:
      "Sulle colline sotto il Monte Prana, lungo la Via Francigena, la pieve è citata in una pergamena vescovile dell'817 e fu la prima chiesa madre del territorio, da cui il cristianesimo si diffuse a Camaiore. L'aspetto romanico attuale è del XII secolo, con parti di un edificio del X. All'interno, il fonte battesimale è ricavato da un sarcofago romano del II-III secolo e un trittico della Madonna con il Bambino e santi porta la firma di Battista di Gerio, detto Battista da Pisa, del 1418.",
    area: 'Colline di Camaiore',
    lat: 43.93066,
    lon: 10.32803,
  },
]

/**
 * Recipes, typical products and producers of the Gusta section: from the Toscana Promozione sheets on
 * Camaiore, Visit Tuscany, versilia.org and the producers' own pages. Recipes and products sit where they
 * come from; producers at their frazione or street, to refine in the admin.
 */
const gustaPois: SeedPoi[] = [
  // ── Ricette ──
  {
    id: 'tordelli-camaioresi',
    name: 'Tordelli camaioresi',
    category: 'piatti-della-tradizione',
    summary: 'La pasta ripiena di carne simbolo di Camaiore, condita con il ragù.',
    description:
      "Il piatto di Camaiore per eccellenza: grandi ravioli ripieni di carne di manzo e di maiale, pane, formaggio ed erbe, conditi con un ricco sugo di carne. Un tempo si preparavano nelle famiglie contadine solo nei giorni di festa, e ancora oggi ogni casa ha la sua ricetta. Nel 2022 il premio Tordello d'Oro per il miglior tordello della Versilia è andato al Caffè Centrale di Camaiore.",
    area: 'Camaiore',
    lat: 43.93333,
    lon: 10.3,
    featured: true,
    details: {
      ingredients:
        'Per la pasta:\nfarina\n4 uova\nun pizzico di sale\n\nPer il ripieno:\n300 g di carne di manzo e di maiale\npane raffermo ammollato nel brodo\nparmigiano e pecorino grattugiati\nuova\ntimo e prezzemolo\nnoce moscata\nsale e pepe\n\nPer condire:\nragù di carne e formaggio grattugiato',
      preparation:
        "Rosolare la carne nell'olio caldo e tritarla finemente. Unire il pane ammollato nel brodo e strizzato, i formaggi, le uova, il timo, il prezzemolo, la noce moscata, sale e pepe, e impastare bene.\n\nImpastare la farina con le uova e il sale, lasciar riposare la pasta e tirarla in sfoglie sottili. Disporre piccole palline di ripieno lungo le strisce di sfoglia, ripiegarle e chiudere bene i bordi, poi ritagliare i tordelli a mezzaluna.\n\nCuocerli in abbondante acqua salata finché salgono a galla, scolarli e condirli con il ragù e il formaggio grattugiato.",
      difficulty: 'hard',
      occasion: 'Nei giorni di festa',
    },
  },
  {
    id: 'torta-di-pepe',
    name: 'Torta di pepe',
    category: 'piatti-della-tradizione',
    summary: 'Detta anche torta coi becchi o coi pizzi: torta salata di riso, bietola e pecorino.',
    description:
      "Una torta salata con un ripieno di riso, bietola, pecorino e uova, ben pepata, chiusa da un bordo di pasta che sporge dalla teglia e si ripiega in tante punte: i pizzi, o becchi, che le danno il nome. A Camaiore si prepara per Pasqua e per la festa di San Vincenzo, il 5 aprile, e si trova tutto l'anno nelle pizzerie a taglio del centro. Esiste anche una variante con la cannella.",
    area: 'Centro storico',
    lat: 43.93661,
    lon: 10.30658,
    details: {
      ingredients:
        'Per la pasta:\nfarina\nolio extravergine di oliva\nacqua\nuova\nun pizzico di sale\n\nPer il ripieno:\nriso lessato\nbietola sbollentata\nun po’ di prezzemolo\npecorino grattugiato\nuova sbattute\npepe e sale',
      preparation:
        "Impastare la farina con olio, acqua, uova e un pizzico di sale e stendere una sfoglia sottile. Foderare una teglia tonda unta, lasciando che la pasta sporga dai bordi.\n\nMescolare il riso lessato con la bietola tritata, il prezzemolo, il pecorino, le uova sbattute, sale e abbondante pepe. Versare il ripieno nella teglia per circa due centimetri e mezzo.\n\nRipiegare la pasta che sporge formando le punte, spolverare con formaggio grattugiato e cuocere in forno ben caldo per circa 45 minuti.",
      difficulty: 'medium',
      occasion: 'A Pasqua e per San Vincenzo, il 5 aprile',
    },
  },
  {
    id: 'scarpaccia-camaiorese',
    name: 'Scarpaccia camaiorese',
    category: 'piatti-della-tradizione',
    summary: 'La torta salata di zucchine, bassa come una vecchia suola.',
    description:
      "Una torta bassa di zucchine e farina che, una volta cotta, ha lo spessore di una vecchia suola di scarpa: da qui il nome. A Camaiore è salata, mentre a Viareggio se ne fa una versione dolce. Si mangia come antipasto o merenda ed è buona anche fredda, perfetta per un picnic. Un tempo si cuoceva nel forno a legna comune; a Capezzano Pianore nella pastella si aggiungono anche parmigiano, olio e uova.",
    area: 'Piana di Capezzano',
    lat: 43.92839,
    lon: 10.26281,
    details: {
      ingredients: 'zucchine\nfiori di zucca\ncipolla\nfarina\nacqua\nolio extravergine di oliva\nsale e pepe',
      preparation:
        "Affettare sottilmente le zucchine e salarle, lasciandole due o tre ore perché perdano l'acqua. Con quell'acqua, la farina, sale, pepe e la cipolla preparare una pastella morbida, poi unire le zucchine e i fiori.\n\nStendere il composto in uno strato sottile in teglie ben unte d'olio e cuocere in forno caldo finché la superficie è dorata e croccante.",
      difficulty: 'easy',
      occasion: "D'estate, quando le zucchine sono di stagione",
    },
  },

  // ── Prodotti tipici ──
  {
    id: 'mortadella-di-camaiore',
    name: 'Mortadella di Camaiore',
    category: 'salumi',
    summary: 'La sbriciolona, il salume di maiale dolce e profumato della Versilia.',
    description:
      "Chiamata anche sbriciolona per la sua consistenza morbida, ha la forma di un salame, un colore scuro e un sapore dolce e delicato, profumato di finocchio e spezie. Si produce in pochi salumifici di Camaiore e Massarosa, quasi solo per il consumo locale e regionale.",
    area: 'Camaiore',
    lat: 43.94175,
    lon: 10.29639,
    details: {
      ingredients: 'carne di maiale: lombo, spalla, coppa e pancetta\nlardo\nsale e pepe\nsemi di finocchio\ncannella\nchiodi di garofano',
      production:
        "La carne viene macinata insieme al grasso duro, impastata a mano, insaccata nel budello naturale e legata stretta. Riposa circa una settimana in un ambiente ventilato e poi stagiona per un tempo che dipende dal peso.",
      whereToBuy: 'Salumifici, salumerie e macellerie di Camaiore e della Versilia',
    },
  },

  // ── Produttori ──
  {
    id: 'nicobio',
    name: 'Azienda Agricola Biologica Nico',
    category: 'aziende-agricole',
    summary: 'Ortaggi, frutta e olio biologici sulle colline di Orbicciano, con agriturismo.',
    description:
      "Un'azienda di famiglia che ha convertito la tradizionale coltivazione di ortaggi al biologico e segue anche i principi della biodinamica. Oltre a verdure, frutta e olio, ha un piccolo agriturismo con due camere, dove la sera si cena con i prodotti dei campi, senza un menù fisso, seguendo la stagione. Organizza anche attività didattiche.",
    area: 'Colline di Camaiore',
    address: 'Località Gello di Sopra 119, Orbicciano',
    phone: '0584 971993',
    email: 'info@nicobio.it',
    website: 'https://nicobio.it',
    lat: 43.90985,
    lon: 10.39437,
    details: {
      products: 'Ortaggi di stagione\nFrutta\nOlio extravergine di oliva',
      organic: true,
    },
  },
  {
    id: 'tenuta-mareli',
    name: 'Tenuta Mareli',
    category: 'aziende-agricole',
    summary: 'Vino, olio e miele biologici tra gli ulivi e le vigne di Montemagno.',
    description:
      "Sulle colline di Montemagno, Francesca Tomei e Daniele Lencioni coltivano vigne e uliveti secondo il metodo biologico e biodinamico. Producono quattro vini IGT Toscana, tra cui il Remagno, Sangiovese in purezza, e il bianco Le Murette, oltre all'olio extravergine Goccia d'Oro e ai mieli di acacia, castagno e millefiori. Su prenotazione si fanno degustazioni guidate tra vigna e cantina, con i prodotti del territorio sotto il pergolato panoramico; l'antica rimessa delle carrozze è diventata un relais di campagna.",
    area: 'Valle della Freddana',
    address: 'Via per Frascalino, Montemagno',
    phone: '+39 333 4585266',
    email: 'info@tenutamareli.it',
    website: 'http://www.tenutamareli.it',
    lat: 43.91309,
    lon: 10.35524,
    details: {
      products: 'Vini IGT Toscana: Remagno, Il Pittiere, Le Murette, Nicodemo\nOlio extravergine di oliva Goccia d’Oro\nMiele di acacia, castagno e millefiori\nPolline',
      organic: true,
      visits: true,
    },
  },
  {
    id: 'apicoltura-regina-schleicher',
    name: 'Apicoltura Regina Schleicher',
    category: 'apicoltori',
    summary: "Miele biologico della Versilia, dall'ex campionessa del mondo di ciclismo.",
    description:
      "Regina Schleicher, campionessa del mondo di ciclismo su strada nel 2005, ha lasciato le corse e nel 2014 ha iniziato ad allevare api con una decina di arnie; oggi sono alcune centinaia, sparse tra Camaiore, Torre del Lago, Pietrasanta e Massarosa. Il miele, biologico, si trova ai mercati di Campagna Amica, con consegna anche a domicilio.",
    area: 'Valle del Lombricese',
    address: 'Via Padronetti 17',
    phone: '340 3836091',
    lat: 43.94108,
    lon: 10.30611,
    details: {
      products: 'Miele millefiori, di tiglio, di castagno, di spiaggia e melata\nPropoli\nPolline',
      organic: true,
      directSale: true,
      whereToBuy: 'Ai mercati di Campagna Amica, o con consegna a domicilio',
    },
  },
  {
    id: 'colle-fibbialla',
    name: 'Azienda Agricola Colle Fibbialla',
    category: 'apicoltori',
    summary: 'Pochi mieli selezionati dalle colline di Fibbialla, premiati con le Due Gocce d’Oro.',
    description:
      "Un'azienda giovane, fondata nel 2012 da Francesco Lucchesi sulle colline di Fibbialla, che produce pochi mieli selezionati: acacia, castagno e millefiori, e nelle annate buone anche tiglio e melata. Il miele di acacia ha ricevuto le Due Gocce d'Oro al concorso Grandi Mieli d'Italia 2015.",
    area: 'Colline di Camaiore',
    address: 'Frazione Fibbialla 7',
    lat: 43.88723,
    lon: 10.38009,
    details: {
      products: 'Miele di acacia, castagno e millefiori\nMiele di tiglio e melata, in alcune annate',
    },
  },
]

export const seedPois: SeedPoi[] = [
  ...scopriPois,
  ...gustaPois,
  // Demo listings: replace with real restaurants, B&Bs and events.
  {
    id: 'osteria-del-borgo',
    name: 'Osteria del Borgo',
    category: 'restaurant',
    summary: 'Cucina toscana tra i vicoli del centro storico.',
    description:
      'Una piccola osteria a conduzione familiare nascosta tra i vicoli del centro storico. In menù i classici della cucina lucchese e versiliese: tordelli al ragù, zuppa di farro, coniglio in umido e i dolci fatti in casa, accompagnati dai vini delle colline intorno a Camaiore.',
    area: 'Centro storico',
    lat: 43.9389,
    lon: 10.3031,
  },
  {
    id: 'trattoria-la-pieve',
    name: 'Trattoria la Pieve',
    category: 'restaurant',
    summary: 'Tordelli, zuppe e vino delle colline.',
    description:
      "Trattoria dall'atmosfera semplice e accogliente, a due passi dalla Collegiata. La cucina segue le stagioni: zuppe di verdure e legumi in inverno, piatti di funghi in autunno e verdure dell'orto in estate, con olio extravergine delle colline e vino della casa.",
    area: 'Centro storico',
    lat: 43.9371,
    lon: 10.3058,
  },
  {
    id: 'ristorante-sul-mare',
    name: 'Ristorante sul Mare',
    category: 'restaurant',
    summary: 'Pesce fresco affacciato sulla passeggiata.',
    description:
      "Affacciato sulla passeggiata del Lido, propone pesce fresco del Tirreno cucinato in modo semplice: crudi, spaghetti alle arselle, fritture e grigliate. Al tramonto la terrazza si colora d'arancio e si vedono le Apuane alle spalle.",
    area: 'Lido di Camaiore',
    lat: 43.8955,
    lon: 10.2245,
  },
  {
    id: 'pizzeria-del-lido',
    name: 'Pizzeria del Lido',
    category: 'restaurant',
    summary: 'Pizza al forno a legna a due passi dal pontile.',
    description:
      'Pizzeria con forno a legna a pochi passi dal pontile, frequentata da famiglie e ragazzi dopo una giornata in spiaggia. Impasti a lunga lievitazione, ingredienti locali e la classica cecina toscana da gustare calda.',
    area: 'Lido di Camaiore',
    lat: 43.8925,
    lon: 10.2262,
  },
  {
    id: 'bnb-le-mura',
    name: 'B&B Le Mura',
    category: 'bnb',
    summary: 'Camere in una casa del Seicento nel centro.',
    description:
      'Poche camere ricavate in una casa del Seicento lungo le antiche mura del centro storico. Soffitti con travi a vista, colazione con dolci fatti in casa e la possibilità di visitare Camaiore a piedi, tra piazze, chiese e botteghe.',
    area: 'Centro storico',
    lat: 43.9397,
    lon: 10.3046,
  },
  {
    id: 'agriturismo-gli-ulivi',
    name: 'Agriturismo Gli Ulivi',
    category: 'bnb',
    summary: 'Tra gli ulivi delle colline, con vista mare.',
    description:
      "Un agriturismo tra gli uliveti sulle colline sopra Camaiore, con vista sulla piana fino al mare. Camere in pietra, piscina panoramica e prodotti dell'azienda: olio, miele e marmellate. Ideale per chi cerca silenzio a pochi minuti dal centro.",
    area: 'Colline di Camaiore',
    lat: 43.9445,
    lon: 10.2945,
  },
  {
    id: 'bnb-la-pineta',
    name: 'B&B La Pineta',
    category: 'bnb',
    summary: "All'ombra dei pini, a cinque minuti dalla spiaggia.",
    description:
      'Un B&B immerso nella pineta del Lido di Camaiore, a cinque minuti a piedi dalla spiaggia. Biciclette a disposizione degli ospiti per percorrere la passeggiata a mare e raggiungere i paesi vicini della Versilia.',
    area: 'Lido di Camaiore',
    lat: 43.9005,
    lon: 10.2305,
  },
  {
    id: 'tappeti-segatura',
    name: 'Tappeti di segatura',
    category: 'events',
    summary: 'Per il Corpus Domini le vie del centro si coprono di tappeti di segatura colorata.',
    description:
      'Ogni anno, per la festa del Corpus Domini, gli abitanti di Camaiore lavorano tutta la notte per coprire le vie del centro storico con tappeti di segatura colorata: disegni sacri e geometrici che al mattino accompagnano la processione. Una tradizione secolare che richiama visitatori da tutta la Toscana.',
    area: 'Centro storico',
    lat: 43.9378,
    lon: 10.3037,
    featured: true,
  },
  {
    id: 'mercato-centro',
    name: 'Mercato settimanale',
    category: 'events',
    summary: 'Bancarelle di prodotti locali e artigianato in centro.',
    description:
      "Il mercato settimanale anima le piazze e le vie del centro con bancarelle di frutta e verdura delle aziende locali, formaggi, salumi, piante e artigianato. Un'occasione per vivere Camaiore come i suoi abitanti.",
    area: 'Centro storico',
    lat: 43.9393,
    lon: 10.3022,
  },
  {
    id: 'cinema-sotto-le-stelle',
    name: 'Cinema sotto le stelle',
    category: 'events',
    summary: "Proiezioni all'aperto sul lungomare nelle sere d'estate.",
    description:
      "Nelle sere d'estate, sul lungomare del Lido, uno schermo all'aperto propone film per tutte le età: classici, novità della stagione e serate dedicate ai più piccoli. Si porta un telo e si guarda il film con la brezza del mare.",
    area: 'Lido di Camaiore',
    lat: 43.8975,
    lon: 10.2232,
  },
]
