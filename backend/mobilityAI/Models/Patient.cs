using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models
{
    public class Patient
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id {
            get; set;
        }
        public string DeviceId {
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
    }
}