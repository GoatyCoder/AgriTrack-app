using AgriTrack.App.Models;
using Microsoft.EntityFrameworkCore;

namespace AgriTrack.App.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Area> Aree => Set<Area>();
    public DbSet<Linea> Linee => Set<Linea>();
    public DbSet<ProdottoGrezzo> ProdottiGrezzi => Set<ProdottoGrezzo>();
    public DbSet<Varieta> Varieta => Set<Varieta>();
    public DbSet<Imballo> Imballi => Set<Imballo>();
    public DbSet<Articolo> Articoli => Set<Articolo>();
    public DbSet<SessioneProduzione> SessioniProduzione => Set<SessioneProduzione>();
    public DbSet<Lavorazione> Lavorazioni => Set<Lavorazione>();
    public DbSet<Pedana> Pedane => Set<Pedana>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<ProdottoGrezzo>()
            .HasIndex(x => x.Codice)
            .IsUnique();

        modelBuilder.Entity<Imballo>()
            .HasIndex(x => x.Codice)
            .IsUnique();

        modelBuilder.Entity<Articolo>()
            .HasIndex(x => x.Codice)
            .IsUnique();

        modelBuilder.Entity<Varieta>()
            .HasIndex(x => new { x.ProdottoId, x.Codice })
            .IsUnique();

        modelBuilder.Entity<Varieta>()
            .HasOne<ProdottoGrezzo>()
            .WithMany()
            .HasForeignKey(x => x.ProdottoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Articolo>()
            .HasOne<ProdottoGrezzo>()
            .WithMany()
            .HasForeignKey(x => x.ProdottoId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Articolo>()
            .HasOne<Varieta>()
            .WithMany()
            .HasForeignKey(x => x.VarietaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Lavorazione>()
            .HasOne<Articolo>()
            .WithMany()
            .HasForeignKey(x => x.ArticoloId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Lavorazione>()
            .HasOne<Imballo>()
            .WithMany()
            .HasForeignKey(x => x.ImballoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
