using ChatApp.API.Data;
using ChatApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatApp.API.Services
{
    public class ChatService
    {
        private readonly ApplicationDbContext _context;

        public ChatService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<ChatMessage>> GetMessagesAsync()
        {
            return await _context.Messages!
                .OrderBy(m => m.Timestamp)
                .ToListAsync();
        }

        public async Task<ChatMessage> CreateMessageAsync(ChatMessage message)
        {
            message.Timestamp = DateTime.UtcNow;
            if (_context.Messages == null)
            {
                throw new InvalidOperationException("Messages DbSet is null.");
            }
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            return message;
        }
    }
}