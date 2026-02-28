using AgriTrack.App.Infrastructure.Persistence;
using AgriTrack.App.Models;
using Microsoft.EntityFrameworkCore;

namespace AgriTrack.App.Services;

public class AppStateService(IDbContextFactory<AppDbContext> dbContextFactory)
{
    public async Task<IReadOnlyList<Area>> GetAreeAsync(CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db.Aree.AsNoTracking().OrderBy(x => x.Nome).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProdottoGrezzo>> GetProdottiAsync(CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db.ProdottiGrezzi.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Varieta>> GetVarietaAsync(CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db.Varieta.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Imballo>> GetImballiAsync(CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db.Imballi.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Articolo>> GetArticoliAsync(CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db.Articoli.AsNoTracking().ToListAsync(cancellationToken);
    }

    public async Task<(int SessioniAperte, int SessioniTotali, int LavorazioniAttive, int LavorazioniTotali, int PedaneTotali)> GetDashboardStatsAsync(CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var sessioniAperte = await db.SessioniProduzione.CountAsync(x => x.Status != "CHIUSO", cancellationToken);
        var sessioniTotali = await db.SessioniProduzione.CountAsync(cancellationToken);
        var lavorazioniAttive = await db.Lavorazioni.CountAsync(x => x.Status == "ATTIVA", cancellationToken);
        var lavorazioniTotali = await db.Lavorazioni.CountAsync(cancellationToken);
        var pedaneTotali = await db.Pedane.CountAsync(cancellationToken);
        return (sessioniAperte, sessioniTotali, lavorazioniAttive, lavorazioniTotali, pedaneTotali);
    }

    public async Task AddSessioneAsync(SessioneProduzione sessione, CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        db.SessioniProduzione.Add(sessione);
        await db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<SessioneProduzione>> GetSessioniAsync(CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        return await db.SessioniProduzione.AsNoTracking().OrderByDescending(x => x.Inizio).ToListAsync(cancellationToken);
    }

    public async Task<bool> SaveProdottoAsync(ProdottoGrezzo model, string? editId, CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var duplicate = await db.ProdottiGrezzi.AnyAsync(p => p.Codice == model.Codice && p.Id != editId, cancellationToken);
        if (duplicate) return false;

        if (string.IsNullOrWhiteSpace(editId))
        {
            db.ProdottiGrezzi.Add(model);
        }
        else
        {
            var entity = await db.ProdottiGrezzi.FirstOrDefaultAsync(x => x.Id == editId, cancellationToken);
            if (entity is null) return false;
            entity.Codice = model.Codice;
            entity.Nome = model.Nome;
            entity.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteProdottoAsync(string id, CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var referenced = await db.Varieta.AnyAsync(v => v.ProdottoId == id, cancellationToken)
                         || await db.Articoli.AnyAsync(a => a.ProdottoId == id, cancellationToken);
        if (referenced) return false;

        var entity = await db.ProdottiGrezzi.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return false;
        db.ProdottiGrezzi.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> SaveVarietaAsync(Varieta model, string? editId, CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var duplicate = await db.Varieta.AnyAsync(v => v.ProdottoId == model.ProdottoId && v.Codice == model.Codice && v.Id != editId, cancellationToken);
        if (duplicate) return false;

        if (string.IsNullOrWhiteSpace(editId))
        {
            db.Varieta.Add(model);
        }
        else
        {
            var entity = await db.Varieta.FirstOrDefaultAsync(x => x.Id == editId, cancellationToken);
            if (entity is null) return false;
            entity.ProdottoId = model.ProdottoId;
            entity.Codice = model.Codice;
            entity.Nome = model.Nome;
            entity.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteVarietaAsync(string id, CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var referenced = await db.Articoli.AnyAsync(a => a.VarietaId == id, cancellationToken);
        if (referenced) return false;

        var entity = await db.Varieta.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return false;
        db.Varieta.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> SaveImballoAsync(Imballo model, string? editId, CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var duplicate = await db.Imballi.AnyAsync(v => v.Codice == model.Codice && v.Id != editId, cancellationToken);
        if (duplicate) return false;

        if (string.IsNullOrWhiteSpace(editId))
        {
            db.Imballi.Add(model);
        }
        else
        {
            var entity = await db.Imballi.FirstOrDefaultAsync(x => x.Id == editId, cancellationToken);
            if (entity is null) return false;
            entity.Codice = model.Codice;
            entity.Nome = model.Nome;
            entity.TaraKg = model.TaraKg;
            entity.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteImballoAsync(string id, CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var referenced = await db.Lavorazioni.AnyAsync(a => a.ImballoId == id, cancellationToken);
        if (referenced) return false;

        var entity = await db.Imballi.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return false;
        db.Imballi.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> SaveArticoloAsync(Articolo model, string? editId, CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var duplicate = await db.Articoli.AnyAsync(v => v.Codice == model.Codice && v.Id != editId, cancellationToken);
        if (duplicate) return false;

        if (!string.IsNullOrWhiteSpace(model.VarietaId) && string.IsNullOrWhiteSpace(model.ProdottoId)) return false;

        if (!string.IsNullOrWhiteSpace(model.VarietaId))
        {
            var varieta = await db.Varieta.FirstOrDefaultAsync(v => v.Id == model.VarietaId, cancellationToken);
            if (varieta is null || varieta.ProdottoId != model.ProdottoId) return false;
        }

        if (string.IsNullOrWhiteSpace(editId))
        {
            db.Articoli.Add(model);
        }
        else
        {
            var entity = await db.Articoli.FirstOrDefaultAsync(x => x.Id == editId, cancellationToken);
            if (entity is null) return false;
            entity.Codice = model.Codice;
            entity.Nome = model.Nome;
            entity.ProdottoId = model.ProdottoId;
            entity.VarietaId = model.VarietaId;
            entity.PesoColloTeorico = model.PesoColloTeorico;
            entity.TipoPeso = model.TipoPeso;
            entity.UpdatedAt = DateTime.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteArticoloAsync(string id, CancellationToken cancellationToken = default)
    {
        await using var db = await dbContextFactory.CreateDbContextAsync(cancellationToken);
        var referenced = await db.Lavorazioni.AnyAsync(a => a.ArticoloId == id, cancellationToken);
        if (referenced) return false;

        var entity = await db.Articoli.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (entity is null) return false;
        db.Articoli.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
