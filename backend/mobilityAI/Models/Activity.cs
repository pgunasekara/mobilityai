using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models {
    public class Activity {
        [Key]
        public string Id {
            get; set;
        }
        [Required]
        [ForeignKey("Patient")]
        public int PatientId
        {
            get; set;
        }
        [Required]
        public long Start {
            get; set;
        }
        [Required]
        public long End {
            get; set;
        }
        [Required]
        public short Type {
            get; set;
        }
    }

    public enum ActivityType : int
    {
        sitting=0,
        lyingDown=1,
        walking=2,
        standing=3,
        unknown=4
    };
}