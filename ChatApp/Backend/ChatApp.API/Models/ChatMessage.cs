using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApp.API.Models
{
    [Table("messages")]
    public class ChatMessage
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("username")]
        [StringLength(50)]
        public string? Username { get; set; }

        [Required]
        [Column("message")]
        [StringLength(1000)]
        public string? Message { get; set; }

        [Required]
        [Column("timestamp")]
        public DateTime Timestamp { get; set; }
    }
}