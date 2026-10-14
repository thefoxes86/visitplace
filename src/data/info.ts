/** Content of the Info page. Fields left out are simply not shown. */

export interface TouristOffice {
  name: string
  area: string
  // TODO: fill in with the comune's official details.
  address?: string
  hours?: string
  phone?: string
  email?: string
}

export interface InfoItem {
  title: string
  text: string
}

export interface Webcam {
  name: string
  area: string
  /** Embeddable live stream or still image; without it the camera shows as coming soon. */
  url?: string
}

export const touristOffices: TouristOffice[] = [
  { name: 'Ufficio turistico di Camaiore', area: 'Centro storico' },
  { name: 'Ufficio turistico del Lido', area: 'Lido di Camaiore' },
]

export const gettingHere: InfoItem[] = [
  {
    title: 'In auto',
    text: "Dall'autostrada A12 Genova–Rosignano si esce a Versilia: da qui pochi minuti portano al Lido e al centro di Camaiore. Da Firenze si percorre la A11 Firenze–Mare fino all'innesto con la A12.",
  },
  {
    title: 'In treno',
    text: 'Le stazioni più vicine sono Viareggio e Pietrasanta, sulla linea Tirrenica tra Genova, Pisa e Roma. Dalla stazione si prosegue in autobus o in taxi.',
  },
  {
    title: 'In aereo',
    text: "L'aeroporto più vicino è il Galileo Galilei di Pisa, a circa 40 km. L'aeroporto di Firenze dista circa 100 km.",
  },
]

export const gettingAround: InfoItem[] = [
  {
    title: 'In autobus',
    text: 'Le linee di Autolinee Toscane collegano il centro di Camaiore con il Lido, i borghi e i comuni vicini della Versilia.',
  },
  {
    title: 'In bicicletta',
    text: 'La passeggiata a mare e i percorsi ciclabili della costa permettono di muoversi in bici tra il Lido, Viareggio e Pietrasanta.',
  },
  {
    title: 'A piedi',
    text: 'Il centro storico è raccolto e si visita comodamente a piedi, come la passeggiata del Lido. Per le colline e le Apuane, consulta la sezione Trekking.',
  },
  {
    title: 'In auto',
    text: "L'auto è il modo più comodo per raggiungere i borghi dell'entroterra. In estate, al Lido conviene lasciarla nei parcheggi e proseguire a piedi o in bici.",
  },
]

export const guides: InfoItem[] = [
  {
    title: 'Guide turistiche',
    text: 'Visite guidate al centro storico, alle chiese e ai musei con guide turistiche abilitate, in italiano e in altre lingue.',
  },
  {
    title: 'Guide ambientali',
    text: 'Per escursioni sulle colline e sulle Apuane ci si può affidare a guide ambientali escursionistiche, che conoscono sentieri, natura e storia del territorio.',
  },
  {
    title: 'Materiale informativo',
    text: 'Mappe, opuscoli e calendari degli eventi sono disponibili negli uffici turistici.',
  },
]

export const webcams: Webcam[] = [
  { name: 'Pontile', area: 'Lido di Camaiore' },
  { name: 'Spiaggia', area: 'Lido di Camaiore' },
  { name: 'Piazza San Bernardino', area: 'Centro storico' },
]
