using ChatApp.API;

var builder = WebApplication.CreateBuilder(args);

// Configurare pentru a asculta pe toate interfețele
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(5000); // Ascultă pe portul 80 pentru toate IP-urile
});

// Adăugare servicii la container
var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);

var app = builder.Build();

// Configurare pipeline de cereri HTTP
startup.Configure(app, app.Environment);

Console.WriteLine("Starting ChatApp API...");
Console.WriteLine($"Environment: {app.Environment.EnvironmentName}");
Console.WriteLine("Listening on port 5000...");

app.Run();