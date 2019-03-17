using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models
{
    public class Survey
    {
        [Key]
        public int Id
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