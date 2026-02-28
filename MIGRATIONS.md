# MIGRATIONS

## 0.3.x → 0.4.x

Migrazione backend da persistenza JSON locale a PostgreSQL con EF Core:

1. Introdotto `Infrastructure/Persistence/AppDbContext.cs` con mapping e vincoli relazionali.
2. Introdotto `AppDbInitializer` per bootstrap schema + seed iniziale.
3. Refactor `AppStateService` verso accesso dati asincrono su database.
4. Aggiornate pagine Blazor per usare servizi asincroni DB-backed.
5. Aggiunta configurazione connection string PostgreSQL (`ConnectionStrings:Postgres`).

## 0.2.x → 0.3.x

Migrazione architetturale completa da frontend React/Vite a applicazione **Blazor Server**:

1. Rimossa pipeline TypeScript e dipendenze Node.
2. Introdotto progetto ASP.NET Core con target `net10.0`.
3. Portato il modello di dominio in classi C# (`Models/DomainModels.cs`).
4. Sostituita persistenza `localStorage` con persistenza JSON lato server (`Services/AppStateService.cs`, `Data/appstate.json`).
5. Introdotte pagine Razor per Dashboard, Produzione, Anagrafiche e Report.

> Nota: da v0.4 il runtime usa PostgreSQL via EF Core.
