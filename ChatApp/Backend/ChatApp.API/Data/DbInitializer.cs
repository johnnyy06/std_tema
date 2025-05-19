using ChatApp.API.Models;

namespace ChatApp.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // Verifică dacă există deja mesaje în baza de date
            if (context.Messages == null || context.Messages.Any())
            {
                return; // Baza de date a fost deja populată sau Messages este null
            }

            // Adaugă câteva mesaje de test
            var messages = new ChatMessage[]
            {
                new ChatMessage
                {
                    Username = "System",
                    Message = "Bine ați venit în aplicația de chat!",
                    Timestamp = DateTime.UtcNow.AddMinutes(-5)
                },
                new ChatMessage
                {
                    Username = "Admin",
                    Message = "Aplicația folosește WebSocket pentru comunicare în timp real.",
                    Timestamp = DateTime.UtcNow.AddMinutes(-4)
                }
            };

            context.Messages.AddRange(messages);
            context.SaveChanges();
        }
    }
}