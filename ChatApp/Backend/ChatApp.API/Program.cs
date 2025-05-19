using ChatApp.API;

var builder = WebApplication.CreateBuilder(args);

// Adăugare servicii la container
var startup = new Startup(builder.Configuration);
startup.ConfigureServices(builder.Services);

var app = builder.Build();

// Configurare pipeline de cereri HTTP
startup.Configure(app, app.Environment);

app.Run();