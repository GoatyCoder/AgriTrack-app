# MIGRATIONS

## 0.1.x → 0.2.0

La migration pipeline in `core/services/AppStateService.ts` normalizza automaticamente:

1. `turni` → `sessioniProduzione` (con mirror legacy mantenuto).
2. `sessioni` → `lavorazioni` (con mirror legacy mantenuto).
3. `prodotti` → `prodottiGrezzi` (con mirror legacy mantenuto).
4. Campi `categoria` in `varieta`/`articoli` in `tipologiaId` quando possibile.
5. Campi audit (`createdAt`, `updatedAt`) su master data mancanti.
6. `doyIngresso` calcolato su lavorazioni che non lo possiedono.
7. Snapshot pedana legacy (`calibro`, `imballo`) normalizzati in `snapshotCalibro` / `snapshotImballo`.

> Nota: la compatibilità backward è mantenuta temporaneamente per supportare rollout incrementale del refactoring terminologico.
