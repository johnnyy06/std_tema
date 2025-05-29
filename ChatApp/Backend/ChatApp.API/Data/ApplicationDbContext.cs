using ChatApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<ChatMessage>? Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // configurare tabel mesaje
            modelBuilder.Entity<ChatMessage>()
                .HasIndex(m => m.Timestamp);
        }
    }
}