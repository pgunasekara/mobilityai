using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models
{
    public class StepCount
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public string Id
        {
            get; set;
        }
        [ForeignKey("Patient")]
        public int PatientId
        {
            get; set;
        }
        [Required]
        public DateTime Timestamp
        {
            get; set;
        }
        [Required]
        public int Steps
        {
            get; set;
        }
    }
}