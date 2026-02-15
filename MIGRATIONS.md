# MIGRATIONS

## 0.1.x → 0.2.x

La migration pipeline in `core/services/AppStateService.ts` normalizza automaticamente:

1. `turni` → `sessioniProduzione`.
2. `sessioni` → `lavorazioni`.
3. `prodotti` → `prodottiGrezzi`.
4. Campi `categoria` storici in `varieta`/`articoli` verso `tipologiaId` (quando presenti).
5. Campi audit (`createdAt`, `updatedAt`) su master data mancanti.
6. `doyIngresso` calcolato in modo sicuro (evitando `NaN`).
7. Snapshot pedana pre-0.2 normalizzati in `snapshotCalibro` / `snapshotImballo`.

> Nota: il runtime corrente usa esclusivamente il modello v0.2 (`sessioniProduzione`, `lavorazioni`, `prodottiGrezzi`).
