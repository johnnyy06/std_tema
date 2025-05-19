using ChatApp.API.Models;
using ChatApp.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChatApp.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly ChatService _chatService;

        public ChatController(ChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpGet]
        public async Task<ActionResult<List<ChatMessage>>> Get()
        {
            var messages = await _chatService.GetMessagesAsync();
            return Ok(messages);
        }
    }
}