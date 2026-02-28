# AgriTrack (Blazor Server)

Sistema web per la **gestione produzione e tracciabilità** in stabilimenti di confezionamento agricolo, riscritto in **Blazor Server** su **.NET 10**.

## Stato del progetto

Versione attuale: **v0.3.0-alpha**.

Questa release introduce la migrazione strutturale da React/Vite a Blazor Server con:
- shell applicativa server-rendered (layout, routing, pagine principali);
- gestione stato centralizzata in `AppStateService`;
- persistenza JSON lato server (`Data/appstate.json`);
- dashboard operativa, produzione, anagrafiche e report di base.

## Stack tecnico

- .NET 10 (target framework `net10.0`)
- ASP.NET Core Blazor Server (Interactive Server Components)
- JSON persistence locale (seed in `Data/appstate.json`)

## Requisiti

- .NET SDK 10 (preview o stable compatibile con `net10.0`)

## Avvio locale

```bash
dotnet restore
dotnet run
```

Applicazione disponibile (default):
- `https://localhost:7184`
- `http://localhost:5184`

## Struttura principale

- `Program.cs`: bootstrap applicazione
- `Components/`: routing, layout e pagine Razor
- `Models/`: modelli dominio
- `Services/AppStateService.cs`: stato applicativo + persistenza
- `Data/appstate.json`: dataset iniziale

## Note

Per glossario di dominio, business rules e roadmap consulta `AGENTS.md`.
