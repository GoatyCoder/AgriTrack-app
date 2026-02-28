using AgriTrack.App.Infrastructure.Persistence;
using AgriTrack.App.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

builder.Services.AddDbContextFactory<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("Postgres")
                           ?? throw new InvalidOperationException("Connection string 'Postgres' is missing.");

    options.UseNpgsql(connectionString, npgsql =>
    {
        npgsql.EnableRetryOnFailure(5);
    });
});

builder.Services.AddScoped<AppStateService>();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseAntiforgery();

app.MapRazorComponents<AgriTrack.App.Components.App>()
    .AddInteractiveServerRenderMode();

await AppDbInitializer.InitializeAsync(app.Services);

app.Run();
