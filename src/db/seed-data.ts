/**
 * Initial contents of the `categories` and `pois` tables, loaded by `npm run db:seed`.
 * Once seeded, edit them in the admin (/admin), not here.
 */
import type { CategorySectionId } from '../data/sections.ts'
import type { SeedPoi } from '../data/pois.ts'
import type { CategoryTypeId } from '../lib/category-types.ts'
import type { PoiLink } from '../lib/media.ts'
import { seedPhotos } from './seed-photos.ts'

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
    {
      label: 'Outdoor',
      children: [
        { label: 'Trekking', type: 'trekking', singular: 'percorso' },
        { label: 'Arrampicata', type: 'climbing', singular: 'falesia' },
      ],
    },
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
    id: 'metato',
    name: 'Metato',
    category: 'borghi-di-collina',
    summary: 'Il borgo dei seccatoi di castagne sulle pendici del Prana, con la vista fino alle isole.',
    description:
      "Arroccato a 414 metri sulle pendici del Monte Prana, Metato prende il nome dal metato, il seccatoio delle castagne. Il paese prese forma soprattutto nel Settecento, quando furono costruiti la chiesa di Santa Maria Assunta, il campanile e la fontana. Fino alla fine degli anni Settanta non aveva luce elettrica né strada: ci si arrivava solo a piedi, in un'ora di sentiero da Vado. Si viveva di olive e castagne, e ogni famiglia aveva il suo forno per il pane, le torte salate e la scarpaccia.\n\nDal borgo lo sguardo scende sulla piana di Camaiore e, oltre i colli di Pedona e Monteggiori, fino al mare; nelle giornate più limpide si vedono Capraia, la Gorgona e forse la Corsica. Sulla piazza della chiesa, una lapide riporta i versi del poeta Bruno Moriconi dedicati al paese. Poco lontano, nella Buca del Tasso, sono stati trovati i resti di un uomo di Neanderthal di circa 40.000 anni fa.",
    area: 'Colline di Camaiore',
    lat: 43.95238,
    lon: 10.32897,
  },
  {
    id: 'salapreti-summonti',
    name: 'Salapreti e Summonti',
    category: 'borghi-di-collina',
    summary: 'Piccole località sulle colline sotto il Prana, affacciate sulla conca di Camaiore.',
    description:
      "Salapreti e Summonti sono piccoli nuclei di case sparsi sulle colline tra la Pieve e Metato, ai piedi del Monte Prana, con la vista aperta sulla conca di Camaiore e fino al mare. Sono attraversati da alcuni sentieri: la Via del Lucente, che da Gombitelli scende a mezza costa sul Prana passando per Torcigliano, Buchignano, Peralla e Salapreti, e l'anello facile che dalla Badia sale a Metato e torna per Summonti. Da Salapreti, in occasione delle processioni, si impartisce la benedizione sulla vallata di Camaiore.",
    area: 'Colline di Camaiore',
    lat: 43.93696,
    lon: 10.3306,
  },
  {
    id: 'candalla',
    name: 'Candalla',
    category: 'borghi-di-collina',
    summary: 'La valle dei mulini lungo il Lombricese, tra acqua fredda e pareti di roccia.',
    description:
      "Candalla è il piccolo nucleo raccolto lungo il Rio Lombricese, ai piedi delle pareti del Monte Penna. Per secoli la forza dell'acqua ha mosso decine di opifici: lungo il torrente si incontrano ancora i resti dei mulini Marchetti e Pardini, del Cinquecento, del Molino Moriconi (1648), del Molinaccio (1690), del frantoio Benedetti e del mulino e polverificio Benetti (1834) e del pastificio Beragna, dell'Ottocento, oltre all'antica ferriera Barsi, ancora in attività.\n\nDal vecchio mulino di Candalla parte un sentiero facile e ombreggiato, di circa 5 km e 310 metri di dislivello, che risale le cascatelle d'acqua fredda dove d'estate si fa il bagno; le pareti intorno sono amate dagli arrampicatori. Si arriva seguendo le indicazioni per Vado e Casoli; i parcheggi sono pochi e in estate il Comune organizza una navetta. Alcuni ruderi sono pericolanti: meglio non entrarci.",
    area: 'Valle del Lombricese',
    lat: 43.95739,
    lon: 10.32394,
  },
  {
    id: 'orbicciano',
    name: 'Orbicciano',
    category: 'borghi-di-collina',
    summary: 'Case sparse sulle colline della Freddana, con due chiese romaniche e una villa del Cinquecento.',
    description:
      "Orbicciano non ha un vero centro: è un insieme di nuclei sparsi sulle colline della val Freddana, a metà strada tra Camaiore e Lucca, come Brentaccio, Campo, Piana di Colle e Misigliano. Il nome è di origine romana e ricorda probabilmente un antico proprietario del fondo. Nel 1183 gli uomini del castello di Urbicciano giurarono fedeltà al Comune di Lucca, e dal 1617 il paese fa parte della Vicaria di Camaiore.\n\nLa chiesa di San Lorenzo, del IX secolo, è la più antica e conserva i tratti romanici, con il portale laterale ad archivolto bicolore. La parrocchiale di San Giorgio, citata già nel 967, è stata ampliata nel Settecento e nell'Ottocento, ma mantiene il campanile dell'XI secolo. Tra le case si trova anche la cinquecentesca Villa Cenami Spada.",
    area: 'Valle della Freddana',
    lat: 43.90985,
    lon: 10.39437,
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
    id: 'monte-matanna',
    name: 'Monte Matanna',
    category: 'montagne-grotte-e-cascate',
    summary: 'La piramide di roccia più alta delle Apuane meridionali, sopra Casoli.',
    description:
      "Con i suoi 1.317 metri, il Matanna è la cima più alta delle Apuane meridionali: la vetta, dalla caratteristica forma a piramide, si trova nel comune di Stazzema, ma le sue pendici scendono su Casoli e sulla Grotta all'Onda. Il massiccio comprende anche il Monte Nona e il Procinto, separati dalla vetta dal Passo del Callare; vicino alla cima c'è un piccolo laghetto, il Bozzone. Nel 1910 una funicolare saliva dalla Grotta all'Onda fino alla Foce del Pallone.\n\nIn alto la roccia nuda si alterna a piccoli prati fioriti, più in basso boschi di faggi e conifere, dove vivono mufloni, caprioli e daini; nel cielo si vede l'aquila reale. Nessun sentiero CAI arriva in vetta, che si raggiunge per tracce di cresta, ma i sentieri 3, 5, 109 e 121 girano attorno al massiccio. Dalla cima la vista abbraccia tutta la catena apuana e gran parte della Toscana settentrionale. Per una sosta ci sono il Ristoro Alto Matanna, a 1.038 metri, e il rifugio CAI Forte dei Marmi, a 865.",
    area: 'Valle del Lombricese',
    lat: 43.98392,
    lon: 10.336,
  },
  {
    id: 'monte-pedone',
    name: 'Monte Pedone',
    category: 'montagne-grotte-e-cascate',
    summary: 'La cima più meridionale delle Apuane, un prato panoramico tra Lucchesia e mare.',
    description:
      "Alto 1.013 metri, il Pedone chiude a sud la cresta del Monte Prana ed è considerato la cima più meridionale delle Alpi Apuane: oltre, i rilievi scendono in colline verso Massarosa e il Pisano. È una montagna erbosa, che ricorda l'Appennino, con rimboschimenti di conifere più in basso e agrifogli lungo il sentiero. Dalla vetta, segnata da un gruppo di sassi, la vista corre dal Piglione e dalla Pania Secca alla piana di Camaiore, alla costa con le isole, alla Corsica e al lago di Massaciuccoli.\n\nNon ci sono sentieri segnati fino in cima, ma la salita è semplice per chi sa orientarsi. Il percorso più comodo parte dal Passo del Lucese, dove sorge l'antica chiesa di San Jacopo: si segue il sentiero 101 fino al bivio per le Case Stradone e si sale per la Casa del Maestro fino alla vetta. Altre tracce partono da Torcigliano, da Buchignano e da Agliano-Peralla.",
    area: 'Valle della Freddana',
    lat: 43.93741,
    lon: 10.36336,
  },
  {
    id: 'grotta-del-tambugione',
    name: 'Grotta del Tambugione',
    category: 'montagne-grotte-e-cascate',
    summary: "Una grande caverna sopra Metato, usata come sepolcro collettivo nell'età del Rame.",
    description:
      "Sul versante occidentale del Monte Ciurlaglia, sopra Metato, si apre una grande caverna larga all'ingresso oltre 12 metri e profonda 24, con un'ampia volta a cupola. Circa 5.000 anni fa, nell'età del Rame, fu usata come luogo di sepoltura collettiva: gli scavi di Nello Puccioni, nel 1914, hanno riportato alla luce le ossa di almeno sei persone, tra adulti, un ragazzo e un bambino, con un corredo semplice di ceramiche, un raschiatoio e due punte di freccia in pietra, insieme a resti di capre, caprioli e cinghiali.\n\nSi raggiunge con una breve deviazione, circa 40 minuti andata e ritorno, dalla mulattiera di Metato, lungo l'anello Candalla – Casoli – Metato. Il bivio è segnato in rosso con la scritta \"grotta Tambugione\"; vicino alle sorgenti la traccia sembra sparire, ma i segni riprendono poco dopo. Non c'è parcheggio vicino: si lascia l'auto a Candalla.",
    area: 'Valle del Lombricese',
    lat: 43.9584,
    lon: 10.33447,
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
    summary: 'La chiesa madre del centro, nata nel 1278, con il campanile trecentesco sulla piazza.',
    description:
      "Nasce nel 1278, quando il borgo, fino ad allora legato alla Badia di San Pietro, si allarga a nuovo centro di Camaiore. Diventa chiesa battesimale nel 1387 e collegiata nel 1515, per volere di papa Leone X su richiesta della Repubblica di Lucca. Dopo il terremoto del 1536 e gli ampliamenti barocchi del Settecento, all'inizio del Novecento ha ritrovato fuori l'aspetto romanico: una facciata asimmetrica in pietra squadrata, con due portali e un rosone, e a sinistra il campanile quadrato, alzato tra il 1350 e il 1365.\n\nL'interno a croce latina, a tre navate con cupola, conserva il fonte battesimale del 1387, le pale di Giovanni Marracci, l'Annunciazione di Stefano Tofanelli e la Comunione degli Apostoli di Pier Dandini, l'Incoronazione della Vergine affrescata da Benedetto Brandimarte nella cupola e un crocifisso ligneo del Trecento. Sopra l'ingresso, l'organo costruito da Paolino Bertolucci nel 1866.",
    area: 'Centro storico',
    address: 'Piazza San Bernardino da Siena',
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
    summary: 'L’abbazia già citata nel 761, per secoli tappa dei pellegrini della Via Francigena.',
    description:
      "Documentata già nel 761, in età longobarda, la Badia crebbe nei secoli in un complesso di chiesa, campanile, cimitero e monastero chiuso da mura merlate, e all'inizio del XII secolo il suo abate governava anche la vita civile del territorio. In quegli anni, grazie anche a una donazione di Matilde di Canossa, la chiesa a navata unica fu ampliata con le navate laterali, la facciata e l'abside. Nel Duecento passò ai monaci florensi; nel 1315 e nel 1329 fu saccheggiata e incendiata insieme a Camaiore, da Castruccio Castracani e poi da Marco Visconti.\n\nSi entra dall'arco in pietra, unico resto delle mura, attraverso il prato dell'antico cimitero. La facciata romanica ha sul portale un affresco della Madonna in trono tra due santi; accanto all'abside si alza il campanile coronato da merli ghibellini. Dentro, tre navate su pilastri quadrati e due immagini trecentesche sui pilastri, Santa Maria Egiziaca e la Madonna della Pietà. L'organo Mascioni del 1995 è il protagonista, ogni estate, del Festival Organistico Internazionale Città di Camaiore.",
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
    showOnMap: false,
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
    showOnMap: false,
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
    showOnMap: false,
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

  {
    id: 'biroldo',
    name: 'Biroldo',
    category: 'piatti-della-tradizione',
    showOnMap: false,
    summary: 'Il salume cotto della tradizione contadina, fatto con le parti povere del maiale e il suo sangue.',
    description:
      "Il biroldo nasce dall'abitudine contadina di non buttare via nulla del maiale: testa, lingua, cotenna e a volte il polmone vengono lessati, tritati e insaporiti con il sangue e le spezie, poi insaccati e cotti di nuovo. Si mangia freddo, a fette. A Camaiore lo si prepara come in Garfagnana, da dove viene il più noto biroldo, presidio Slow Food, tanto che a volte è chiamato biroldo della Versilia; dalla versione di Lucca si distingue per l'assenza di pinoli.\n\nÈ un piatto della stagione fredda, quando si macellava il maiale: si fa da ottobre ad aprile e va consumato entro una quindicina di giorni.",
    area: 'Camaiore',
    lat: 43.93333,
    lon: 10.3,
    details: {
      ingredients:
        'testa di maiale disossata\nlingua\ncotenna\npolmone, a piacere\nsangue di maiale\nsale e pepe\nfinocchio selvatico\nnoce moscata, chiodi di garofano, cannella e anice stellato\naglio\nbudello naturale, vescica o stomaco di maiale',
      preparation:
        "Lessare a lungo la testa, la lingua e la cotenna, circa tre ore, poi disossare e tagliare la carne a pezzetti.\n\nMescolarla con un po' di sangue di maiale, sale, pepe e le spezie, aggiungendole poco alla volta e assaggiando: il finocchio selvatico deve prevalere.\n\nInsaccare il composto nel budello, nella vescica o nello stomaco, legarlo e lessarlo di nuovo. Lasciarlo raffreddare e servirlo freddo, tagliato a fette.",
      difficulty: 'hard',
      occasion: 'Da ottobre ad aprile, quando si macella il maiale',
    },
  },

  // ── Prodotti tipici ──
  {
    id: 'mortadella-di-camaiore',
    name: 'Mortadella di Camaiore',
    category: 'salumi',
    showOnMap: false,
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

/**
 * Hikes of the Outdoor section, each placed at its starting point: routes from escursioniapuane.com,
 * SeiVersilia and CAI Firenze; lengths, gains and times only where a source gives them.
 */
const trekkingPois: SeedPoi[] = [
  {
    id: 'trekking-matanna-da-casoli',
    name: 'Monte Matanna da Casoli',
    category: 'trekking',
    summary: 'Il grande anello del Matanna da Trescolli, per crinali facili e panoramici.',
    description:
      "Dalla frazione di Trescolli, sopra Casoli, il sentiero 106 sale alla Foce di San Rocchino, con la cappella di San Rocco, e il 3 raggiunge la Foce di Grattaculo e poi, a mezza costa sul versante sud, la Foce del Pallone, con una marginetta in marmo. Da qui il crinale est-sud-est, facile e panoramico, porta in vetta a 1.317 metri. Si scende per il crinale nord-ovest, segnato in blu, fino al Callare del Matanna con il suo grande crocifisso, poi con il 5 al rifugio Forte dei Marmi e con il 121 si torna a Grattaculo, chiudendo l'anello.\n\nDalla vetta la vista abbraccia le Panie, le Apuane, il lago di Massaciuccoli, il mare e, nelle giornate limpide, l'Arcipelago Toscano.",
    area: 'Valle del Lombricese',
    lat: 43.96428,
    lon: 10.32424,
    details: {
      difficulty: 'E',
      elevationGain: 1000,
      duration: '6–7 h',
      start: 'Trescolli, frazione di Casoli (523 m)',
      loop: true,
    },
  },
  {
    id: 'trekking-prana-da-metato',
    name: 'Monte Prana da Metato',
    category: 'trekking',
    summary: 'La salita classica al Prana sul sentiero 104, dal borgo dei seccatoi.',
    description:
      "Da Metato (414 m), raggiunto da Lombrici con una strada a tornanti, il sentiero CAI 104 sale per le Casette fino al colle a 914 metri, poi per la valletta sommitale e la cresta nord-ovest arriva alla grande croce di ferro della vetta, a 1.221 metri. È la via normale, senza difficoltà. Si può tornare per la stessa strada o chiudere un anello sul versante occidentale.\n\nDalla vetta la vista corre dalla costa alle isole, dall'Altissimo e dalle Panie alle colline di Lucca e di Pisa.",
    area: 'Colline di Camaiore',
    lat: 43.95238,
    lon: 10.32897,
    details: {
      difficulty: 'E',
      length: 9.8,
      elevationGain: 800,
      duration: '4 h 30',
      start: 'Metato (414 m)',
      loop: true,
    },
  },
  {
    id: 'trekking-prana-da-passo-del-lucese',
    name: 'Monte Prana dal Passo del Lucese',
    category: 'trekking',
    summary: 'Al Prana dal valico tra Camaiore e la Pedogna, sul sentiero 101.',
    description:
      "Dal Passo del Lucese (558 m), con l'antica chiesa di San Jacopo, il sentiero CAI 101 sale prima su asfalto ripido, poi su sterrato, fino alla Focetta di San Vincenzo (912 m), dove si prende il 104 per la vetta (1.221 m). In alternativa, dalla Casa Bianca (775 m) si sale per tracce non segnate lungo la cresta sud-est. Il percorso è adatto anche a escursionisti poco allenati, ma sul crinale ci sono alcuni tratti esposti.",
    area: 'Valle della Freddana',
    lat: 43.93648,
    lon: 10.38217,
    details: {
      difficulty: 'E',
      length: 12,
      elevationGain: 700,
      duration: '5–6 h',
      start: 'Passo del Lucese (558 m)',
    },
  },
  {
    id: 'trekking-gabberi-da-la-culla',
    name: 'Monte Gabberi da La Culla',
    category: 'trekking',
    summary: 'La salita più panoramica al Gabberi, ripida, sul sentiero 107.',
    description:
      "Da La Culla (451 m) il sentiero 107 sale per le Case ai Lecci (601 m) e la Foce dell'Arsiccio. Verso i 950 metri si attraversa il Ripiano dei Pennati, dove la roccia è incisa da tante figure a forma di roncola; poco oltre c'è la vetta, a 1.108 metri, con una grande croce di metallo. È la via più panoramica, ma anche ripida e faticosa.\n\nDalla cima, cantata da D'Annunzio, si vede la costa da Livorno a La Spezia con le isole e la piana dal lago di Massaciuccoli a Camaiore. Si può tornare per la stessa via o scendere con il 107 alla Foce di San Rocchino.",
    area: 'Colline di Camaiore',
    lat: 43.95749,
    lon: 10.27613,
    details: {
      difficulty: 'E',
      elevationGain: 660,
      start: 'La Culla (451 m)',
    },
  },
  {
    id: 'trekking-gabberi-da-casoli',
    name: 'Monte Gabberi da Casoli',
    category: 'trekking',
    summary: 'Da Trescolli a San Rocchino e poi per la cresta est, con vista sul mare.',
    description:
      "Da Trescolli (523 m), frazione di Casoli, il sentiero 106 sale alla Foce di San Rocchino (801 m). Da qui si segue per circa 2 km la cresta est del Gabberi, tenendosi sul versante sud con il mare davanti, con alcuni facili passaggi su roccia nel tratto finale, fino alla croce della vetta (1.108 m).",
    area: 'Valle del Lombricese',
    lat: 43.96428,
    lon: 10.32424,
    details: {
      difficulty: 'E',
      elevationGain: 590,
      start: 'Trescolli, frazione di Casoli (523 m)',
    },
  },
  {
    id: 'trekking-gabberi-da-santanna',
    name: "Monte Gabberi da Sant'Anna",
    category: 'trekking',
    summary: "Dal paese della memoria al Gabberi, per i boschi della Foce di Farnocchia.",
    description:
      "Da Sant'Anna di Stazzema (650 m) il sentiero 4 passa per le Case Sennari e le Case di Berna e, attraverso il bosco, raggiunge la Foce di Farnocchia (873 m). Da qui la cresta nord-ovest, segnata in blu, porta alla vetta (1.108 m). Si può chiudere un anello passando per il Monte Lieto e la Foce di Sant'Anna.\n\nSant'Anna è il paese della strage del 12 agosto 1944, in cui furono uccisi oltre 560 civili: oggi è Parco Nazionale della Pace e merita una visita al museo e all'ossario del Col di Cava.",
    area: 'Colline di Camaiore',
    lat: 43.97412,
    lon: 10.27353,
    details: {
      difficulty: 'E',
      length: 9.5,
      elevationGain: 700,
      duration: '4 h, più le soste',
      start: "Sant'Anna di Stazzema (650 m)",
      loop: true,
    },
  },
  {
    id: 'trekking-pedone-da-passo-del-lucese',
    name: 'Monte Pedone dal Passo del Lucese',
    category: 'trekking',
    summary: 'Alla cima più meridionale delle Apuane, per la Casa del Maestro.',
    description:
      "Dal Passo del Lucese (558 m) si segue il sentiero 101 fino al bivio segnato per le Case Stradone, poi una traccia evidente fino alla Casa del Maestro (887 m), rifugio per chi sale al Prana e al Pedone. Si prosegue nel bosco e poi allo scoperto, in un tratto molto panoramico, fino alla vetta erbosa (1.013 m). Dal bivio in poi il percorso non è segnato: è semplice, ma serve un minimo di orientamento. Si può chiudere un anello scendendo per la cresta sud-est verso la Casa Bernardi.",
    area: 'Valle della Freddana',
    lat: 43.93648,
    lon: 10.38217,
    details: {
      difficulty: 'E',
      elevationGain: 455,
      start: 'Passo del Lucese (558 m)',
    },
  },
  {
    id: 'trekking-traversata-frazioni-camaioresi',
    name: 'Traversata delle Frazioni Camaioresi',
    category: 'trekking',
    summary: 'I sentieri camaioresi da Santa Lucia a Migliano, attraverso undici frazioni.',
    description:
      "Detta anche Via Bassa, la traversata collega per circa 30 km undici frazioni sulle colline e le prime pendici delle Apuane meridionali, da Santa Lucia fino a Migliano, nelle Seimiglia, su sentieri e antiche mulattiere. Tocca Monteggiori, La Culla, Greppolungo, Casoli, Metato, Summonti, Peralla, Torcigliano e Gombitelli, sempre con la vista sulla conca di Camaiore, sulla piana di Capezzano e sul mare.\n\nÈ segnata in bianco e giallo, con pannelli informativi in diversi paesi, ma in alcuni tratti i segni sono radi. Si può percorrere a tappe, scegliendo i tratti tra una frazione e l'altra.",
    area: 'Colline di Camaiore',
    lat: 43.94118,
    lon: 10.27158,
    details: {
      difficulty: 'E',
      length: 30,
      duration: 'Più giorni, a tappe',
      start: 'Santa Lucia (arrivo a Migliano)',
    },
  },
]

/** Parking places, for crags with no position of their own in the sources: to refine in the admin. */
const PARKING = {
  candalla: { lat: 43.95739, lon: 10.32394 },
  casoli: { lat: 43.96354, lon: 10.33032 },
  trescolli: { lat: 43.96428, lon: 10.32424 },
  greppolungo: { lat: 43.95356, lon: 10.30115 },
}

const VA = 'http://www.versanteapuano.it'
const versanteApuano = (path: string): PoiLink => ({ label: 'Relazione Versante Apuano', url: `${VA}/${path}.html` })
const climbook = (path: string): PoiLink => ({ label: 'Scheda Climbook', url: `https://climbook.com/falesie/${path}` })

/** Reports and pages on each crag, from the research behind these entries. */
const CRAG_LINKS: Record<string, PoiLink[]> = {
  'candalla-bassa': [versanteApuano('valle-del-lombricese/117-candalla-bassa'), climbook('213/candalla-bassa')],
  'candalla-alta': [
    versanteApuano('arrampicata-sportiva/151-candalla-alta'),
    climbook('16691/candalla-alta-penitenziario-le-villette-pancione-bianco-bao'),
  ],
  'placche-a-mare': [
    versanteApuano('valle-del-lombricese/111-placche-a-mare'),
    climbook('212/candalla-alta-placche-a-mare'),
    { label: 'Scheda TheTopo', url: 'https://thetopo.com/crags/camaiore/cragmap/placche-a-mare' },
  ],
  castagni: [climbook('28212/i-castagni-sinistro-destro')],
  'parco-pagazzo': [climbook('25794/il-parco')],
  'muro-del-cimitero': [versanteApuano('casoli-basso/130-muro-del-cimitero'), climbook('216/cimitero')],
  mongololificio: [versanteApuano('casoli-basso/128-mongololificio'), climbook('21111/mongololificio')],
  'giardino-degli-elfi': [
    versanteApuano('casoli-basso/53-giardino-degli-elfi'),
    climbook('223/giardino-degli-elfi'),
    { label: 'Scheda theCrag', url: 'https://www.thecrag.com/it/arrampicata/italy/central-and-southern-italy/lucca-area/area/2223140946' },
  ],
  'primo-pilastro-di-setriana': [
    versanteApuano('casoli-alto/150-i-pilastro-di-setriana'),
    climbook('15651/1-pilastro-di-setriana'),
    { label: 'Scheda Gulliver', url: 'https://www.gulliver.it/itinerari/primo-pilastro-di-setriana-falesia/' },
  ],
  'secondo-pilastro-di-setriana': [versanteApuano('arrampicata-sportiva/167-ii-pilastro-di-setriana'), climbook('21121/2-pilastro-di-setriana')],
  caianificio: [
    climbook('17071/caianificio'),
    { label: 'Scheda theCrag', url: 'https://www.thecrag.com/it/arrampicar/italy/central-and-southern-italy/lucca-area/area/2061126891' },
  ],
  'san-rocchino': [
    versanteApuano('casoli-alto/159-san-rocchino'),
    climbook('239/san-rocchino'),
    { label: 'Scheda theCrag', url: 'https://www.thecrag.com/en/climbing/italy/s-rocchino' },
  ],
  'muro-dei-ganzi': [versanteApuano('greppolungo/83-muro-dei-ganzi'), climbook('21101/muro-dei-ganzi')],
  'muro-del-tossico': [versanteApuano('greppolungo/79-muro-del-tossico'), climbook('26552/muro-del-tossico')],
  isola: [versanteApuano('greppolungo/80-isola-e-pilastro-dei-bimbi'), climbook('224/isola-di-greppolungo-pilastro-dei-bimbi')],
  'pilastro-di-greppolungo': [versanteApuano('greppolungo/80-isola-e-pilastro-dei-bimbi'), climbook('224/isola-di-greppolungo-pilastro-dei-bimbi')],
  tomeoni: [{ label: 'Scheda PeakVisor', url: 'https://peakvisor.com/poi/falesia-di-tomeoni.html' }],
  'ciarro-torre': [
    versanteApuano('arrampicata-sportiva/135-ciarro-torre'),
    { label: 'CAI Viareggio · la nuova via del 2026', url: 'https://www.caiviareggio.it/notizie-12-03-2026/nuova-via-di-arrampicata-a-greppolungo' },
  ],
  saratoga: [climbook('220/saratoga')],
  trittico: [versanteApuano('home/163-trittico'), climbook('221/trittico')],
  conchetta: [versanteApuano('valle-del-conchiusori/110-conchetta'), climbook('217/conchetta')],
  grottino: [versanteApuano('valle-del-conchiusori/127-grottino'), climbook('14921/grottino')],
  'muro-di-swann': [versanteApuano('arrampicata-sportiva/134-muro-si-swann'), climbook('219/muro-di-swann')],
}

const crag = (
  id: string,
  name: string,
  area: string,
  position: { lat: number; lon: number },
  summary: string,
  description: string,
  details: SeedPoi['details'] = {},
  published = true,
): SeedPoi => ({
  id: `falesia-${id}`,
  name,
  category: 'arrampicata',
  area,
  ...position,
  summary,
  description,
  details,
  links: CRAG_LINKS[id] ?? [],
  published,
})

/** Not yet described by any source: a draft to complete, unpublished. */
const draftCrag = (id: string, name: string, area: string, position: { lat: number; lon: number }, known = '') =>
  crag(
    id,
    name,
    area,
    position,
    `Settore di arrampicata della zona di ${area}.`,
    `Settore della zona di ${area}.${known ? ` ${known}` : ''} Scheda da completare con vie, gradi, esposizione e avvicinamento.`,
    {},
    false,
  )

/**
 * Crags of the Camaiorese: from the reports of Versante Apuano (where most were re-bolted by the
 * Magicandalla association), Climbook, TheTopo and Gulliver; positions from OpenStreetMap and PeakVisor,
 * or the parking place where none is known.
 */
const climbingPois: SeedPoi[] = [
  // ── Candalla, valle del Lombricese ──
  crag(
    'candalla-bassa',
    'Candalla Bassa',
    'Candalla',
    { lat: 43.95802, lon: 10.32691 },
    'Uno dei settori più imponenti di Camaiore: quasi cento vie lunghe di resistenza, a dieci minuti dal mulino.',
    "Il grande settore della valle del Lombricese, tra i più conosciuti dagli arrampicatori toscani. Quasi cento vie divise nei settori Sinistro, Cengia, Centrale, Destro e Pennino, con tiri lunghi e di resistenza che d'estate restano all'ombra. La falesia è stata interamente richiodata e pulita dall'associazione Magicandalla.\n\nSi parcheggia sulla strada per il mulino di Candalla, oltre il ristorante Emilio e Bona, rispettando i divieti per lasciar girare l'autobus. Si attraversa il ponticello del mulino, dove c'è acqua potabile, si segue il sentiero della valle, si scende al torrente e lo si attraversa: la parete è visibile dopo una decina di minuti. Si arrampica anche con la pioggia.",
    { gradeMin: '5b', gradeMax: '8c', routes: 97, rock: 'Calcare', approach: 10, season: 'Tutto l’anno; d’estate all’ombra' },
  ),
  crag(
    'candalla-alta',
    'Candalla Alta',
    'Candalla',
    { lat: 43.95773, lon: 10.32792 },
    'Strapiombi di calcare a canne e un grande panorama: una delle falesie più belle della Toscana.',
    "Uno dei settori più spettacolari della valle, con strapiombi di calcare a canne e tiri lunghi e di resistenza fino a 40 metri. Quasi cento vie nei settori Bao, Pancione Bianco, Le Villette e Penitenziario.\n\nDal parcheggio sulla strada per il mulino si prende lo sterrato a destra prima del mulino, si passa sotto le casette e si sale nel bosco: dopo 30-35 minuti, a destra, si stacca il sentiero per le Placche a Mare; proseguendo si arriva ai settori. Si arrampica anche con la pioggia.",
    { gradeMin: '5c', gradeMax: '8c', routes: 99, height: 40, rock: 'Calcare a canne', approach: 35 },
  ),
  crag(
    'placche-a-mare',
    'Placche a Mare',
    'Candalla',
    { lat: 43.9567, lon: 10.32661 },
    'Placche a gocce e lame al sole del pomeriggio: il settore più abbordabile per cominciare.',
    "Il settore più adatto a chi arriva per la prima volta: placche di calcare grigio lavorate a gocce e lame, con qualche strapiombo, su tiri di 22-25 metri. È al sole dalla tarda mattina al tramonto, perfetto d'inverno e nelle mezze stagioni. Richiodato e pulito dall'associazione Magicandalla.\n\nSi raggiunge con lo stesso sentiero di Candalla Alta: dopo 30-35 minuti di salita nel bosco si prende la deviazione a destra.",
    { gradeMin: '5+', gradeMax: '7a', routes: 16, height: 25, rock: 'Calcare grigio', approach: 30, season: 'Inverno e mezze stagioni' },
  ),
  crag(
    'castagni',
    'I Castagni',
    'Candalla',
    PARKING.candalla,
    'Due piccoli settori esposti a ovest, con vie dal 6b all’8a.',
    'Falesia divisa in due settori, Sinistro e Destro, con una quindicina di vie dal 6b all’8a, esposte a ovest. Circa 20 minuti di avvicinamento.',
    { gradeMin: '6b', gradeMax: '8a', routes: 14, exposure: 'O', approach: 20 },
  ),
  draftCrag('mulini', 'Mulini', 'Candalla', PARKING.candalla),
  crag(
    'parco-pagazzo',
    'Il Parco',
    'Candalla',
    PARKING.candalla,
    'Una ventina di vie, soprattutto dal 5b al 7b, con qualche tiro più duro.',
    'Settore con una ventina di vie, in gran parte tra il 5b e il 7b, con qualche linea più dura e alcune vie a due tiri.',
    { gradeMin: '5b', gradeMax: '7b', routes: 24 },
  ),
  draftCrag('penna-pirsing', 'Penna Pirsing', 'Candalla', PARKING.candalla, 'Conta una tredicina di vie sulle pareti del Monte Penna, sopra il Rio Lombricese.'),

  // ── Casoli bassa ──
  crag(
    'muro-del-cimitero',
    'Muro del Cimitero',
    'Casoli bassa',
    { lat: 43.9621, lon: 10.33407 },
    'La parete storica di Casoli, visibile dal paese: tiri non banali su placca strapiombante.',
    "La parete più imponente di Casoli, ben visibile dal paese: il settore storico della valle, con tiri lunghi fino a 40 metri su placca strapiombante, quasi tutti dal 7a in su e poco frequentati. Richiodato dall'associazione Magicandalla.\n\nSi parcheggia nella piazzetta della Garbatella, vicino al bar La Frana; si attraversa il paese oltre il cimitero fino a un ponte, si gira a sinistra e dopo pochi minuti si sale per il sentiero a destra.",
    { gradeMin: '6c', gradeMax: '8c', routes: 27, height: 40, exposure: 'O', season: 'Inverno e mezze stagioni' },
  ),
  crag(
    'mongololificio',
    'Mongololificio',
    'Casoli bassa',
    PARKING.casoli,
    'Un muro verticale su tacche, esposto a nord-est: la falesia estiva di Casoli.',
    "Parete verticale e difficile, su tacche, esposta a nord-est e all'ombra dalle 11: una falesia da estate. Scoperta e chiodata dall'associazione Magicandalla.\n\nDalla piazzetta della Garbatella si attraversa il paese oltre il cimitero e un ponte, poi si gira a sinistra seguendo il sentiero sotto il muro del cimitero: circa 25 minuti.",
    { gradeMin: '6b', gradeMax: '7c+', routes: 13, height: 30, exposure: 'NE', approach: 25, season: 'Estate e mezze stagioni' },
  ),
  crag(
    'giardino-degli-elfi',
    'Giardino degli Elfi',
    'Casoli bassa',
    { lat: 43.96733, lon: 10.34049 },
    'Un bosco nascosto con strapiombi atletici: fresco anche nelle giornate più afose.',
    "Sul versante opposto della valle, nascosto in un bosco, è il posto giusto per le giornate afose: arrampicata atletica su strapiombi, con le vie più facili dentro il canyon.\n\nOltre Casoli si parcheggia nello slargo sul rettilineo vicino al cimitero; si scende per la strada cementata sotto il cimitero e le case fino a una cappella e al ponte, e poco prima del ponte si prende il sentiero in salita a sinistra: circa 20 minuti.",
    { gradeMin: '5b', gradeMax: '8c', routes: 23, height: 30, exposure: 'N', approach: 20, season: 'Estate' },
  ),

  // ── Casoli alta, verso Trescolli ──
  crag(
    'primo-pilastro-di-setriana',
    'Primo pilastro di Setriana',
    'Casoli alta',
    { lat: 43.96173, lon: 10.31593 },
    'Una bellissima placca verticale fino a 40 metri, al sole fino al primo pomeriggio.',
    "Una bellissima placca verticale, con tiri fino a 40 metri: per alcune vie una corda da 80 metri non basta senza che chi assicura salga qualche metro. Il sole resta sulla parete fino al primo pomeriggio.\n\nDal centro di Camaiore si seguono le indicazioni per Vado e Casoli, si supera Casoli e si prosegue verso Trescolli, parcheggiando al bivio per la località Luciana, dove inizia la strada privata: circa 15 minuti a piedi.",
    { gradeMin: '4+', gradeMax: '8a+', routes: 16, height: 40, approach: 15, season: 'Inverno e mezze stagioni' },
  ),
  crag(
    'secondo-pilastro-di-setriana',
    'Secondo pilastro di Setriana',
    'Casoli alta',
    PARKING.trescolli,
    'Partenze boulderose e muri verticali, al sole la mattina.',
    "Partenze boulderose e muri verticali, con alcune vie a due tiri. La parete va all'ombra nel primo pomeriggio. Interamente richiodata e pulita dall'associazione Magicandalla.\n\nSi parcheggia prima della sbarra della strada privata verso Trescolli e si sale per il sentiero seguendo l'acquedotto fino a un ometto sulla destra, poi per una traccia fino alla base: circa 20 minuti.",
    { gradeMin: '5+', gradeMax: '8b+', routes: 18, height: 35, approach: 20, season: 'Estate e mezze stagioni' },
  ),
  crag(
    'caianificio',
    'Caianificio',
    'Casoli alta',
    PARKING.trescolli,
    'Vie a più tiri con secondi tiri bellissimi: serve una corda da 80 metri.',
    "Un settore di vie a più tiri, dove i secondi e terzi tiri sono considerati i più belli. Serve una corda da almeno 80 metri, che a volte non basta. Va all'ombra verso mezzogiorno; il periodo migliore è da maggio a ottobre.",
    { gradeMin: '5c', gradeMax: '8a', routes: 22, season: 'Da maggio a ottobre' },
  ),
  draftCrag('pensatoio', 'Pensatoio', 'Casoli alta', PARKING.trescolli, 'Conta una decina di vie.'),
  draftCrag('grotta-allombra', "Grotta all'ombra", 'Casoli alta', PARKING.trescolli),
  crag(
    'san-rocchino',
    'San Rocchino',
    'Casoli alta',
    PARKING.trescolli,
    'Arrampicata atletica su strapiombi, con quello che è probabilmente il primo 9a della Toscana.',
    "Trenta vie su due settori, basso e alto, di arrampicata atletica su strapiombi, con tiri fino a 35 metri. Qui si trova quello che è probabilmente il primo 9a della Toscana.\n\nDal centro di Camaiore si seguono le indicazioni per Vado e Casoli, si prosegue verso Trescolli e si parcheggia prima della sbarra della strada privata; si sale per il sentiero oltre un gruppo di case, con la falesia ben visibile sopra.",
    { gradeMin: '6b', gradeMax: '9a', routes: 30, height: 35, season: 'Estate e mezze stagioni' },
  ),

  // ── Greppolungo ──
  draftCrag('il-nido', 'Il Nido', 'Greppolungo', PARKING.greppolungo),
  crag(
    'muro-dei-ganzi',
    'Muro dei Ganzi',
    'Greppolungo',
    PARKING.greppolungo,
    'Muri verticali e leggermente strapiombanti nel bosco sopra Greppolungo.',
    "Una ventina di vie su muri verticali e leggermente strapiombanti, lunghe 15-25 metri. Interamente richiodato e pulito dall'associazione Magicandalla.\n\nSi parcheggia sotto il paese di Greppolungo e si sale per la strada e poi il sentiero: 25-30 minuti.",
    { gradeMin: '5+', gradeMax: '8a', routes: 23, height: 25, approach: 30, season: 'Estate e mezze stagioni' },
  ),
  crag(
    'muro-del-tossico',
    'Muro del Tossico',
    'Greppolungo',
    { lat: 43.95693, lon: 10.30368 },
    'Vie corte e boulderose esposte a sud, a dieci minuti dal paese: la falesia d’inverno.',
    "Vie corte, 15-25 metri, con movimenti boulder, esposte a sud: una falesia da inverno. Interamente richiodata e pulita dall'associazione Magicandalla.\n\nSi parcheggia sotto Greppolungo, si sale per la strada lastricata tenendo la destra al bivio della Madonnina fino alla fontana con i pesci rossi, poi per il sentiero accanto al cancello di una casa, oltre i ruderi: circa 10 minuti.",
    { gradeMin: '6a', gradeMax: '8a+', routes: 12, height: 25, exposure: 'S', approach: 10, season: 'Inverno' },
  ),
  crag(
    'isola',
    'Isola',
    'Greppolungo',
    { lat: 43.9603, lon: 10.3032 },
    'Strapiombi a buchi all’ombra del bosco, buoni anche con la pioggia.',
    "Pareti strapiombanti lavorate a buchi, all'ombra della vegetazione: l'Isola è una delle poche falesie dove si arrampica anche con la pioggia. Insieme al vicino Pilastro dei Bimbi conta 35 vie, lunghe fino a 33 metri. Richiodata e pulita dall'associazione Magicandalla.\n\nSi parcheggia sotto Greppolungo e si segue la strada lastricata e poi il sentiero: 30-35 minuti.",
    { gradeMin: '5+', gradeMax: '8a', height: 33, approach: 35, season: 'Inverno e mezze stagioni' },
  ),
  crag(
    'pilastro-di-greppolungo',
    'Pilastro dei Bimbi',
    'Greppolungo',
    { lat: 43.9603, lon: 10.3032 },
    'Il pilastro di Greppolungo: calcare lavorato al sole d’inverno, asciuga in fretta.',
    "Calcare lavorato e appoggiato sul pilastro accanto all'Isola: d'inverno prende il sole dalla mattina al tardo pomeriggio e asciuga molto in fretta. Con l'Isola conta 35 vie.\n\nStesso avvicinamento dell'Isola: 30-35 minuti dal parcheggio sotto Greppolungo.",
    { gradeMin: '5+', gradeMax: '8a', approach: 35, season: 'Inverno e mezze stagioni' },
  ),
  crag(
    'tomeoni',
    'Tomeoni',
    'Greppolungo',
    { lat: 43.95787, lon: 10.28965 },
    'Uno sperone nel bosco esposto a sud-est, tra Greppolungo e La Culla.',
    "Uno sperone esposto a sud-est, con tiri fino a 30 metri tra il 5c e l'8a, come Retone del 2000 (6a) e Musica ribelle (6c+).\n\nSi parcheggia a Greppolungo, si segue la scalinata con le traversine dei binari in direzione La Culla e poi il sentiero nel bosco che scende allo sperone.",
    { gradeMin: '5c', gradeMax: '8a', height: 30, exposure: 'SE' },
  ),
  draftCrag('al-castellaccio', 'Al Castellaccio', 'Greppolungo', PARKING.greppolungo),
  draftCrag('la-selva', 'La Selva', 'Greppolungo', PARKING.greppolungo),

  // ── Valle del Conchiusori, sotto Greppolungo ──
  crag(
    'ciarro-torre',
    'Ciarro Torre',
    'Valle del Conchiusori',
    { lat: 43.95703, lon: 10.30541 },
    'Un pilastro a dieci minuti dalla strada, con vie facili sempre all’ombra.',
    "Una dozzina di vie corte, 10-20 metri: le più facili, su una parete sempre all'ombra, sono adatte a chi comincia, mentre le più dure sono molto impegnative. Nel 2026 il CAI di Viareggio ha aperto qui accanto una nuova via di quattro tiri, fino al 5c.\n\nDa Camaiore si seguono le indicazioni per Vado, Lombrici e Greppolungo, si tira dritto al bivio per Greppolungo e si parcheggia nello slargo al primo tornante a sinistra. Si prende il sentiero prima del ponte, attraverso l'oliveto, e al bivio nel bosco si va a sinistra fino alla base del pilastro: circa 10 minuti.",
    { gradeMin: '5c', gradeMax: '7c', routes: 12, height: 20, exposure: 'S', approach: 10, season: 'Mezze stagioni' },
  ),
  crag(
    'saratoga',
    'Saratoga',
    'Valle del Conchiusori',
    { lat: 43.95841, lon: 10.30531 },
    'Una ventina di vie, soprattutto tra il 6a e il 7b+, nella valle del Conchiusori.',
    'Settore della valle del Conchiusori, accanto al Trittico, con una ventina di vie, le più ripetute tra il 6a e il 7b+.',
    { gradeMin: '6a', gradeMax: '7b+', routes: 19 },
  ),
  crag(
    'trittico',
    'Trittico',
    'Valle del Conchiusori',
    { lat: 43.95859, lon: 10.30581 },
    'Calcare appoggiato con strapiombi e diedri, al sole la mattina.',
    "Una falesia molto frequentata: calcare in gran parte appoggiato, con qualche strapiombo e qualche diedro, su tiri di 15-35 metri. Al sole la mattina. Richiodata dall'associazione Magicandalla.\n\nDal parcheggio al primo tornante a sinistra dopo il bivio per Greppolungo si prende il sentiero prima del ponte, attraverso l'oliveto, e al bivio nel bosco si va a destra: la falesia è sulla sinistra del greto, a 15-20 minuti.",
    { gradeMin: '5c', gradeMax: '7b+', routes: 26, height: 35, exposure: 'E', approach: 20, season: 'Estate e mezze stagioni' },
  ),
  crag(
    'conchetta',
    'Conchetta',
    'Valle del Conchiusori',
    { lat: 43.95836, lon: 10.30659 },
    'Calcare lavorato e leggermente strapiombante, riparato dal vento e buono con la pioggia.',
    "Calcare lavorato, leggermente strapiombante, con frequenti movimenti boulder su tiri di circa 15 metri. Riparata dal vento, prende il sole dal primo pomeriggio per qualche ora e si arrampica anche con la pioggia. Interamente richiodata e pulita dall'associazione Magicandalla.\n\nDal parcheggio al primo tornante dopo il bivio per Greppolungo si segue il sentiero nell'oliveto e nella gola; al bivio si va a destra, si attraversa il greto e si sale sul lato destro della valle: 15-20 minuti.",
    { gradeMin: '5+', gradeMax: '8a+', routes: 19, height: 18, approach: 20, season: 'Inverno e mezze stagioni' },
  ),
  crag(
    'grottino',
    'Grottino',
    'Valle del Conchiusori',
    { lat: 43.95888, lon: 10.30692 },
    'Una grotta con strapiombi e tiri fino a 40 metri, all’ombra d’estate fino alle 14.',
    "Il secondo settore sulla destra della valle, con 27 vie da 10 a 40 metri, alcune a due tiri. Il sole arriva nel primo pomeriggio per un paio d'ore; d'estate è all'ombra fino alle 14. Il lato sinistro e gli strapiombi restano riparati con la pioggia, mentre le uscite e il pilastro centrale si bagnano.\n\nDal parcheggio al primo tornante dopo il bivio per Greppolungo (pochi posti: se è pieno, si lascia l'auto al bivio precedente) si segue il sentiero nell'oliveto e nella gola, si va a destra al bivio, si attraversa il greto e si sale sul lato destro con l'aiuto delle corde fisse: 20-25 minuti.",
    { gradeMin: '5+', gradeMax: '8a+', routes: 27, height: 40, approach: 25, season: 'Inverno e mezze stagioni' },
  ),
  crag(
    'muro-di-swann',
    'Muro di Swann',
    'Valle del Conchiusori',
    { lat: 43.95965, lon: 10.30739 },
    'In fondo alla valle del Conchiusori: vie dure al sole la mattina, buone anche con la pioggia.',
    "Il settore più in fondo alla valle, con una ventina di vie dal 6c all'8b+, lunghe 15-20 metri, alcune a due tiri. Al sole la mattina, si arrampica anche con la pioggia.\n\nSi segue il sentiero della valle del Conchiusori oltre la Conchetta, il Grottino e la Maruccio Area, e al bivio si va a destra: 30-35 minuti dal parcheggio al primo tornante dopo il bivio per Greppolungo.",
    { gradeMin: '6c', gradeMax: '8b+', routes: 17, height: 20, approach: 35, season: 'Mezze stagioni' },
  ),
]

/** Every seeded place, with its Wikimedia Commons photos where there are some (seed-photos.ts). */
export const seedPois: SeedPoi[] = [
  ...scopriPois,
  ...trekkingPois,
  ...climbingPois,
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
    showOnMap: false,
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
    showOnMap: false,
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
    showOnMap: false,
    summary: "Proiezioni all'aperto sul lungomare nelle sere d'estate.",
    description:
      "Nelle sere d'estate, sul lungomare del Lido, uno schermo all'aperto propone film per tutte le età: classici, novità della stagione e serate dedicate ai più piccoli. Si porta un telo e si guarda il film con la brezza del mare.",
    area: 'Lido di Camaiore',
    lat: 43.8975,
    lon: 10.2232,
  },
].map((poi) => ({ ...poi, ...seedPhotos[poi.id] }))
