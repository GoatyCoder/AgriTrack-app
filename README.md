# AgriTrack

Sistema web per la **gestione produzione e tracciabilità** in stabilimenti di confezionamento agricolo.

## Stato del progetto

Versione attuale: **v0.2-alpha**.

Funzionalità già disponibili:
- Gestione sessioni di produzione e lavorazioni
- Tracciabilità pedane con codici univoci
- Anagrafiche base (prodotti, varietà, articoli, lotti)
- Reportistica base
- Persistenza locale tramite `localStorage`

Per glossario di dominio, business rules e roadmap, consulta `AGENTS.md`.

Per il log delle migrazioni schema, consulta `MIGRATIONS.md`.

## Stack tecnico

- React 19 + TypeScript
- Vite
- Recharts
- Zod

## Requisiti

- Node.js 20+
- npm 10+

## Avvio locale

1. Installa le dipendenze:
   ```bash
   npm install
   ```
2. Avvia il progetto in sviluppo:
   ```bash
   npm run dev
   ```
3. Apri l'app su `http://localhost:5173`.

## Script disponibili

```bash
npm run dev        # avvio in sviluppo
npm run typecheck  # controllo TypeScript
npm run build      # build di produzione
npm run preview    # anteprima build
```

## Deploy su GitHub Pages

Il progetto è configurato per deploy automatico con GitHub Actions.

Passi consigliati:
1. In GitHub: **Settings → Pages**
2. Imposta **Source: GitHub Actions**
3. Esegui push su `main` oppure avvia manualmente il workflow da tab **Actions**


Workflow previsto:
- `npm ci`
- `npm run typecheck`
- `npm run build`
- publish della cartella `dist/`

## Note architetturali

Il codice segue una struttura orientata alla Clean Architecture (domain/application/infrastructure) con logica applicativa centralizzata in custom hooks e servizi.

## Roadmap sintetica

- Refactoring terminologia (`Turno` → `SessioneProduzione`, `SessioneLinea` → `Lavorazione`)
- Introduzione entità separate per `Tipologia` e `Calibro`
- Versionamento schema e migrazioni dati
- Testing suite
- Backend con database PostgreSQL

Per il dettaglio completo: `AGENTS.md`.
