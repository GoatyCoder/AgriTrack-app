namespace AgriTrack.App.Models;

public class Area : AuditFields
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Nome { get; set; } = string.Empty;
    public bool Attiva { get; set; } = true;
}

public class Linea : AuditFields
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string AreaId { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public bool Attiva { get; set; } = true;
}

public class ProdottoGrezzo : AuditFields
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Codice { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public bool Attivo { get; set; } = true;
}

public class Varieta : AuditFields
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string ProdottoId { get; set; } = string.Empty;
    public string Codice { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
}

public class Articolo : AuditFields
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string Codice { get; set; } = string.Empty;
    public string Nome { get; set; } = string.Empty;
    public decimal PesoColloTeorico { get; set; }
}

public class SessioneProduzione
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public DateTime Inizio { get; set; } = DateTime.UtcNow;
    public DateTime? Fine { get; set; }
    public string Operatore { get; set; } = string.Empty;
    public string AreaId { get; set; } = string.Empty;
    public string Status { get; set; } = "APERTO";
}

public class Lavorazione
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string SessioneProduzioneId { get; set; } = string.Empty;
    public string LineaId { get; set; } = string.Empty;
    public string ArticoloId { get; set; } = string.Empty;
    public string SiglaLottoCode { get; set; } = string.Empty;
    public DateOnly DataIngresso { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public string Status { get; set; } = "ATTIVA";
}

public class Pedana
{
    public string Id { get; set; } = Guid.NewGuid().ToString("N");
    public string LavorazioneId { get; set; } = string.Empty;
    public string StickerCode { get; set; } = string.Empty;
    public int NumeroColli { get; set; }
    public decimal PesoTotale { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class AppState
{
    public IList<Area> Aree { get; set; } = new List<Area>();
    public IList<Linea> Linee { get; set; } = new List<Linea>();
    public IList<ProdottoGrezzo> ProdottiGrezzi { get; set; } = new List<ProdottoGrezzo>();
    public IList<Varieta> Varieta { get; set; } = new List<Varieta>();
    public IList<Articolo> Articoli { get; set; } = new List<Articolo>();
    public IList<SessioneProduzione> SessioniProduzione { get; set; } = new List<SessioneProduzione>();
    public IList<Lavorazione> Lavorazioni { get; set; } = new List<Lavorazione>();
    public IList<Pedana> Pedane { get; set; } = new List<Pedana>();
}
