using System.Text.Json;
using AgriTrack.App.Models;

namespace AgriTrack.App.Services;

public class AppStateService
{
    private readonly string _storagePath;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };

    public AppState State { get; private set; } = new();

    public AppStateService(IWebHostEnvironment env)
    {
        _storagePath = Path.Combine(env.ContentRootPath, "Data", "appstate.json");
        Directory.CreateDirectory(Path.GetDirectoryName(_storagePath)!);
        State = Load();
        EnsureDefaults();
    }

    public void Save() => Persist(State);

    public void AddSessione(SessioneProduzione sessione)
    {
        State.SessioniProduzione.Add(sessione);
        Save();
    }

    public void AddLavorazione(Lavorazione lavorazione)
    {
        State.Lavorazioni.Add(lavorazione);
        Save();
    }

    public void AddPedana(Pedana pedana)
    {
        State.Pedane.Add(pedana);
        Save();
    }

    private AppState Load()
    {
        if (!File.Exists(_storagePath))
        {
            var seeded = Seed();
            Persist(seeded);
            return seeded;
        }

        var json = File.ReadAllText(_storagePath);
        return JsonSerializer.Deserialize<AppState>(json, _jsonOptions) ?? Seed();
    }

    private void Persist(AppState state)
    {
        File.WriteAllText(_storagePath, JsonSerializer.Serialize(state, _jsonOptions));
    }

    private void EnsureDefaults()
    {
        State.Imballi ??= new List<Imballo>();
        Save();
    }

    private static AppState Seed()
    {
        var area = new Area { Nome = "Confezionamento" };
        var linea = new Linea { Nome = "Linea 1", AreaId = area.Id };
        var prodotto = new ProdottoGrezzo { Codice = "UVA", Nome = "Uva da Tavola" };

        return new AppState
        {
            Aree = new List<Area> { area },
            Linee = new List<Linea> { linea },
            ProdottiGrezzi = new List<ProdottoGrezzo> { prodotto },
            Imballi = new List<Imballo>()
        };
    }
}
