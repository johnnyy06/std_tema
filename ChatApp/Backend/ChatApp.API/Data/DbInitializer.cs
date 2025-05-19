using ChatApp.API.Models;

namespace ChatApp.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // Verifică dacă Messages nu este null și dacă nu există deja mesaje
            if (context.Messages == null)
            {
                Console.WriteLine("DbSet Messages este null!");
                return;
            }

            if (context.Messages.Any())
            {
                Console.WriteLine("Baza de date conține deja mesaje, nu se inițializează din nou.");
                return;
            }

            Console.WriteLine("Se adaugă mesaje inițiale în baza de date...");

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

            Console.WriteLine("Mesajele inițiale au fost adăugate cu succes.");
        }
    }
}