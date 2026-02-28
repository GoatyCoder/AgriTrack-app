# AgriTrack (Blazor Server)

Sistema web per la **gestione produzione e tracciabilità** in stabilimenti di confezionamento agricolo, riscritto in **Blazor Server** su **.NET 10**.

## Stato del progetto

Versione attuale: **v0.4.0-alpha**.

Questa release introduce un backend più solido con:
- persistenza su PostgreSQL tramite EF Core;
- `DbContext` dedicato e inizializzazione database;
- service layer asincrono per use-case applicativi;
- CRUD anagrafiche con filtri/ordinamenti collegato a DB.

## Stack tecnico

- .NET 10 (target framework `net10.0`)
- ASP.NET Core Blazor Server (Interactive Server Components)
- EF Core + Npgsql (PostgreSQL)

## Neon vs Supabase

Entrambi vanno bene perché espongono PostgreSQL standard.

- **Neon**: migliore se vuoi solo database PostgreSQL serverless, branch DB e costi più semplici.
- **Supabase**: migliore se vuoi anche auth, storage, realtime e API pronte oltre al DB.

Per AgriTrack (scenario attuale) la scelta consigliata è **Neon + EF Core**: architettura più pulita lato backend .NET e pieno controllo su dominio e migrazioni.

## Configurazione database

Imposta `ConnectionStrings:Postgres` in `appsettings.json` o variabile ambiente:

```bash
ConnectionStrings__Postgres="Host=...;Port=5432;Database=...;Username=...;Password=...;SSL Mode=Require;Trust Server Certificate=true"
```

## Avvio locale

```bash
dotnet restore
dotnet run
```

Applicazione disponibile (default):
- `https://localhost:7184`
- `http://localhost:5184`

## Deploy su Render.com

Il repository include un `Dockerfile` multi-stage compatibile con Render.

1. Crea un nuovo **Web Service** da repository GitHub.
2. Seleziona **Environment: Docker**.
3. Imposta `ConnectionStrings__Postgres` nelle environment variables.
4. Lascia vuoti Build/Start command (Render userà il `Dockerfile`).

Il container usa automaticamente `PORT` fornita da Render con fallback a `10000`.

## Note

Per glossario di dominio, business rules e roadmap consulta `AGENTS.md`.
