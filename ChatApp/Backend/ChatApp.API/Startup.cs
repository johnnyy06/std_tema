using ChatApp.API.Hubs;
using ChatApp.API.Services;
using ChatApp.API.Data;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.API
{
    public class Startup
    {
        public IConfiguration Configuration { get; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();

            // Enhanced CORS configuration for Kubernetes
            services.AddCors(options =>
            {
                options.AddPolicy("CorsPolicy", builder =>
                {
                    builder
                        .AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });

                options.AddPolicy("SignalRCorsPolicy", builder =>
                {
                    builder
                        .SetIsOriginAllowed(_ => true)
                        .AllowCredentials()
                        .AllowAnyMethod()
                        .AllowAnyHeader();
                });
            });

            // Configure database connection string
            var connectionString = Configuration.GetConnectionString("DefaultConnection");
            if (Environment.GetEnvironmentVariable("KUBERNETES_SERVICE_HOST") != null)
            {
                connectionString = "Server=mysql-service;Database=chatdb;Uid=chatuser;Pwd=ChatP@ssw0rd;";
            }

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

            // Enhanced SignalR configuration
            services.AddSignalR(options =>
            {
                options.EnableDetailedErrors = true;
                options.KeepAliveInterval = TimeSpan.FromSeconds(15);
                options.ClientTimeoutInterval = TimeSpan.FromSeconds(30);
                options.HandshakeTimeout = TimeSpan.FromSeconds(15);
            });

            // Dependency injection
            services.AddScoped<ChatService>();
        }

        public void Configure(WebApplication app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }

            // Database initialization
            using (var scope = app.Services.CreateScope())
            {
                try
                {
                    var services = scope.ServiceProvider;
                    var context = services.GetRequiredService<ApplicationDbContext>();

                    context.Database.EnsureCreated();
                    DbInitializer.Initialize(context);

                    Console.WriteLine("Database initialized successfully.");
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Database initialization error: {ex.Message}");
                    if (env.IsDevelopment())
                    {
                        Console.WriteLine(ex.ToString());
                    }
                }
            }

            // Configure middleware pipeline
            app.UseRouting();

            // Apply CORS before other middleware
            app.UseCors("CorsPolicy");

            app.UseAuthorization();

            // Map endpoints
            app.MapControllers();

            // Apply SignalR specific CORS policy
            app.MapHub<ChatHub>("/chatHub").RequireCors("SignalRCorsPolicy");

            // Add health check endpoint
            app.MapGet("/health", () => "Healthy");
        }
    }
}