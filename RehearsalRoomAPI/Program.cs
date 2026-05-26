using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using RehearsalRoomAPI.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Database ──────────────────────────────────────────────────────────────────
// Railway / Render set DATABASE_URL for PostgreSQL.
// Local dev falls back to SQLite via appsettings.Development.json.
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
var usePostgres = !string.IsNullOrEmpty(databaseUrl);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    if (usePostgres)
    {
        // Convert postgresql:// URL to Npgsql connection string with SSL
        var connStr = databaseUrl!;
        if (connStr.StartsWith("postgresql://") || connStr.StartsWith("postgres://"))
        {
            var uri = new Uri(connStr);
            var userInfo = uri.UserInfo.Split(':');
            connStr = $"Host={uri.Host};Port={Math.Max(uri.Port, 5432)};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]};SSL Mode=Require;Trust Server Certificate=true";
        }
        options.UseNpgsql(connStr);
    }
    else
    {
        options.UseSqlite(
            builder.Configuration.GetConnectionString("DefaultConnection")
        ).ConfigureWarnings(w =>
            w.Ignore(RelationalEventId.PendingModelChangesWarning)
        );
    }
});

// ── Auth ──────────────────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
    throw new Exception("Jwt:Key is missing. Set it in appsettings.Development.json locally or as the Jwt__Key environment variable in production.");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// ── CORS ──────────────────────────────────────────────────────────────────────
// Set App__FrontendUrl (comma-separated) in the production environment.
// Localhost origins are always included for local development.
var frontendUrls = (builder.Configuration["App:FrontendUrl"] ?? "")
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

var allowedOrigins = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
{
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
};
foreach (var url in frontendUrls) allowedOrigins.Add(url);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
        policy.WithOrigins([.. allowedOrigins])
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHttpClient();

// ── Build ─────────────────────────────────────────────────────────────────────
var app = builder.Build();

app.UseCors("AllowReactApp");

// Global error handler — never leaks raw stack traces to the client
app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    ctx.Response.StatusCode = 500;
    ctx.Response.ContentType = "application/json";
    var env = ctx.RequestServices.GetRequiredService<IWebHostEnvironment>();
    if (env.IsDevelopment())
    {
        var feature = ctx.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        await ctx.Response.WriteAsJsonAsync(new { error = feature?.Error?.Message ?? "Unknown error" });
    }
    else
    {
        await ctx.Response.WriteAsJsonAsync(new { error = "An unexpected error occurred." });
    }
}));

app.UseAuthentication();
app.UseAuthorization();

// ── Database setup ────────────────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

    if (usePostgres)
    {
        // Fresh PostgreSQL database — create all tables from the EF model
        db.Database.EnsureCreated();
    }
    else
    {
        // SQLite — apply pending migrations
        try { db.Database.ExecuteSqlRaw("DELETE FROM __EFMigrationsLock"); } catch { }
        db.Database.Migrate();

        // Safety net: create tables that may not exist from migrations
        db.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS Announcements (
                Id        INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                Title     TEXT    NOT NULL DEFAULT '',
                Body      TEXT    NOT NULL DEFAULT '',
                CreatedBy TEXT    NOT NULL DEFAULT '',
                CreatedAt TEXT    NOT NULL DEFAULT ''
            )
        ");
        db.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS PushSubscriptions (
                Id        INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                UserId    INTEGER NOT NULL DEFAULT 0,
                Endpoint  TEXT    NOT NULL DEFAULT '',
                P256dh    TEXT    NOT NULL DEFAULT '',
                Auth      TEXT    NOT NULL DEFAULT '',
                CreatedAt TEXT    NOT NULL DEFAULT ''
            )
        ");
        db.Database.ExecuteSqlRaw(@"
            CREATE TABLE IF NOT EXISTS WaitlistEntries (
                Id          INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                Email       TEXT    NOT NULL DEFAULT '',
                FullName    TEXT    NOT NULL DEFAULT '',
                ChurchName  TEXT    NOT NULL DEFAULT '',
                Role        TEXT    NOT NULL DEFAULT '',
                CreatedAt   TEXT    NOT NULL DEFAULT ''
            )
        ");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();

app.Run();
