using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models
{
    public class Observation
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id
        {
            get; set;
        }
        [ForeignKey("Users")]
        public int UserId
        {
            get; set;
        }
        [ForeignKey("Patients")]
        public int PatientId
        {
            get; set;
        }
        public string Comment
        {
            get; set;
        }
        public DateTime Timestamp
        {
            get; set;
        }
    }


}