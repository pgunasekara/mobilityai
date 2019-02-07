using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id {
            get; set;
        }
        [Required]
        public string Email {
            get; set;
        }
        [Required]
        public string FirstName {
            get; set;
        }
        [Required]
        public string LastName {
            get; set;
        }
        [Required]
        public string Password {
            get; set;
        }
        [Required]
        public string Salt {
            get; set;
        }
    }
}