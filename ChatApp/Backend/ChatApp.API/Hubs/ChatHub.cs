using ChatApp.API.Models;
using ChatApp.API.Services;
using Microsoft.AspNetCore.SignalR;

namespace ChatApp.API.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ChatService _chatService;

        public ChatHub(ChatService chatService)
        {
            _chatService = chatService;
        }

        public async Task SendMessage(string username, string message)
        {
            // verificam daca mesajul contine doar caractere ASCII
            if (!IsAscii(message))
            {
                await Clients.Caller.SendAsync("ReceiveError", "Mesajul trebuie să conțină doar caractere ASCII.");
                return;
            }

            var chatMessage = new ChatMessage
            {
                Username = username,
                Message = message,
                Timestamp = DateTime.UtcNow
            };

            // salvam mesajul in baza de date
            await _chatService.CreateMessageAsync(chatMessage);

            // transmitem mesajul catre toti clientii conectati
            await Clients.All.SendAsync("ReceiveMessage", chatMessage);
        }

        public async Task GetMessages()
        {
            var messages = await _chatService.GetMessagesAsync();
            await Clients.Caller.SendAsync("ReceiveMessages", messages);
        }

        private bool IsAscii(string text)
        {
            // verifica daca toate caracterele sunt ASCII (coduri 0-127)
            return text.All(c => c <= 127);
        }
    }
}