---
name: nuovo-evento
description: Aggiunge uno o più eventi a Visit Camaiore partendo da una descrizione, un volantino, un testo o un link. Usala quando l'utente chiede di inserire, caricare o creare un evento (sagra, mercato, concerto, festa, mostra…) sul sito.
---

# Nuovo evento su Visit Camaiore

Gli eventi si inviano a `/api/events` con lo script `scripts/add-event.ts`, che legge `EVENTS_API_URL` e `EVENTS_API_TOKEN` da `.env.local`. **Non stampare mai il token** e non leggere `.env.local` per intero: al massimo `grep -c '^EVENTS_API_TOKEN=' .env.local`.

## Passi

1. **Categorie ed eventi già presenti**: `npm run event:add -- --list`. Scegli la categoria (`id`) più adatta e controlla in `upcoming` che l'evento non ci sia già: se c'è, fermati e dillo.
2. **Scrivi il JSON** in un file nella scratchpad (non nel progetto), seguendo i campi sotto. I testi sono in italiano, chiari e senza inventare: quello che non sai lo lasci fuori.
3. **Mostra all'utente un riepilogo** (nome, date, luogo, categoria, sito di destinazione cioè `EVENTS_API_URL`) e chiedi conferma prima di inviare, soprattutto se l'indirizzo non è `localhost`.
4. **Invia**: `npm run event:add -- /percorso/evento.json` (accetta anche un array di eventi).
5. Riporta i link restituiti (pagina e modifica nel backoffice) e cancella il file temporaneo.

Gli eventi arrivano come **bozza** (`published: false`): l'utente li controlla e li pubblica dal backoffice. Metti `published: true` solo se lo chiede esplicitamente.

## Campi

Obbligatori:

| Campo | Note |
| --- | --- |
| `category` | `id` di una categoria di eventi, da `--list` |
| `name` | Titolo dell'evento |
| `summary` | Una frase, massimo 160 caratteri: compare nelle schede |
| `description` | Il testo della pagina; paragrafi separati da una riga vuota |
| `area` | Zona: `Camaiore centro`, `Lido di Camaiore`, `Capezzano Pianore`, `Casoli`, … |
| `startsAt` | Ora di Camaiore: `"2026-12-08T21:00"`, o `"2026-12-08"` con `allDay: true` |

Facoltativi:

| Campo | Note |
| --- | --- |
| `endsAt` | Stesso formato di `startsAt`; per eventi di più giorni con `allDay`, l'ultimo giorno |
| `allDay` | `true` per eventi senza orario (default `false`) |
| `recurrence` | `daily`, `weekly`, `monthly` (stesso giorno del mese), `monthlyWeekday` (es. 1° sabato), `yearly`. Verifica i valori in `src/lib/event-dates.ts` (`RECURRENCES`) |
| `recurrenceWeeks` | Solo con `monthlyWeekday`: settimane del mese `1`–`4`, `-1` per l'ultima. Il giorno è quello di `startsAt` |
| `recurrenceUntil` | Ultimo giorno delle ripetizioni, `"2027-06-30"` |
| `lat`, `lon` | Coordinate del luogo, solo se sicure. Senza, l'evento non appare sulla mappa |
| `address` | Es. `"Piazza San Bernardino, Camaiore"` |
| `website` | Pagina ufficiale dell'evento |
| `organizer` | Chi lo organizza |
| `price` | Es. `"Ingresso libero"`, `"10 €"` |
| `booking` | `true` se la prenotazione è obbligatoria |
| `imageUrl` | Solo `https://` e solo se l'utente ha i diritti sull'immagine; meglio aggiungere la foto dal backoffice |
| `imageCredit` | `{ "author", "license", "sourceUrl" }` se l'immagine ha una licenza da citare |
| `extraCategories` | Altri `id` di categoria in cui mostrarlo |
| `featured` | In evidenza in home (default `false`) |
| `id` | Indirizzo della pagina; di solito lascialo fuori: viene dal nome, reso unico |

## Esempio

```json
{
  "category": "events",
  "name": "Mercatino di Natale in piazza",
  "summary": "Bancarelle di artigianato, dolci e vin brulé nel centro storico, nei weekend di dicembre.",
  "description": "Le piazze del centro si riempiono di bancarelle...\n\nIngresso libero.",
  "area": "Camaiore centro",
  "startsAt": "2026-12-05T10:00",
  "endsAt": "2026-12-05T20:00",
  "recurrence": "weekly",
  "recurrenceUntil": "2026-12-20",
  "address": "Piazza San Bernardino, Camaiore",
  "lat": 43.9418,
  "lon": 10.3022,
  "price": "Ingresso libero"
}
```

## Errori

- `Token non valido` / `API eventi non attiva`: il token in `.env.local` non coincide con quello del sito (in produzione è la variabile `EVENTS_API_TOKEN` su Vercel).
- Errori di validazione: il messaggio dice il campo (`summary: ...`); correggi il JSON e rinvia.
- `fetch failed` in locale: il sito non è avviato (`npm run dev`).
