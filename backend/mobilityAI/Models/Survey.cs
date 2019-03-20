using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models
{
    public class Survey
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id
        {
            get; set;
        }

        [ForeignKey("Patients")]
        public int PatientId
        {
            get; set;
        }
        [Column(TypeName = "jsonb")]
        public string Data
        {
            get; set;
        }
    }


}