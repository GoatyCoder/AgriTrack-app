# MIGRATIONS

## 0.2.x → 0.3.x

Migrazione architetturale completa da frontend React/Vite a applicazione **Blazor Server**:

1. Rimossa pipeline TypeScript e dipendenze Node.
2. Introdotto progetto ASP.NET Core con target `net10.0`.
3. Portato il modello di dominio in classi C# (`Models/DomainModels.cs`).
4. Sostituita persistenza `localStorage` con persistenza JSON lato server (`Services/AppStateService.cs`, `Data/appstate.json`).
5. Introdotte pagine Razor per Dashboard, Produzione, Anagrafiche e Report.

## 0.1.x → 0.2.x

La migration pipeline in `core/services/AppStateService.ts` normalizza automaticamente:

1. `turni` → `sessioniProduzione`.
2. `sessioni` → `lavorazioni`.
3. `prodotti` → `prodottiGrezzi`.
4. Campi `categoria` storici in `varieta`/`articoli` verso `tipologiaId` (quando presenti).
5. Campi audit (`createdAt`, `updatedAt`) su master data mancanti.
6. `doyIngresso` calcolato in modo sicuro (evitando `NaN`).
7. Snapshot pedana pre-0.2 normalizzati in `snapshotCalibro` / `snapshotImballo`.

> Nota: da v0.3 il runtime React non è più utilizzato.
