using AgriTrack.App.Models;
using Microsoft.EntityFrameworkCore;

namespace AgriTrack.App.Infrastructure.Persistence;

public static class AppDbInitializer
{
    public static async Task InitializeAsync(IServiceProvider services, CancellationToken cancellationToken = default)
    {
        await using var scope = services.CreateAsyncScope();
        var contextFactory = scope.ServiceProvider.GetRequiredService<IDbContextFactory<AppDbContext>>();
        await using var db = await contextFactory.CreateDbContextAsync(cancellationToken);

        await db.Database.EnsureCreatedAsync(cancellationToken);

        if (await db.Aree.AnyAsync(cancellationToken))
        {
            return;
        }

        var area = new Area
        {
            Id = Guid.NewGuid().ToString("N"),
            Nome = "Confezionamento",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var linea = new Linea
        {
            Id = Guid.NewGuid().ToString("N"),
            AreaId = area.Id,
            Nome = "Linea 1",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var prodotto = new ProdottoGrezzo
        {
            Id = Guid.NewGuid().ToString("N"),
            Codice = "UVA",
            Nome = "Uva da Tavola",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        db.Aree.Add(area);
        db.Linee.Add(linea);
        db.ProdottiGrezzi.Add(prodotto);
        await db.SaveChangesAsync(cancellationToken);
    }
}
