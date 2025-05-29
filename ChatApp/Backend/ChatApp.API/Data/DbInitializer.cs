using ChatApp.API.Models;

namespace ChatApp.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // verifica daca Messages nu este null si daca nu exista deja mesaje
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

            // adauga cateva mesaje de test
            var messages = new ChatMessage[]
            {
        new ChatMessage
        {
            Username = "System",
            Message = "Bine ati venit in aplicatia de chat!",
            Timestamp = DateTime.UtcNow.AddMinutes(-5)
        },
        new ChatMessage
        {
            Username = "Admin",
            Message = "Aplicatia folosește WebSocket pentru comunicare in timp real.",
            Timestamp = DateTime.UtcNow.AddMinutes(-4)
        }
            };

            context.Messages.AddRange(messages);
            context.SaveChanges();

            Console.WriteLine("Mesajele initiale au fost adaugate cu succes.");
        }
    }
}