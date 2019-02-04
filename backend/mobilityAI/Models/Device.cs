using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models {
    public class Device {
        [Key]
        public string Id {
            get; set;
        }
        [Required]
        public string FriendlyName {
            get; set;
        }
        [Required]
        public int PatientID {
            get; set;
        }
        [Required]
        public DateTime LastSync {
            get; set;
        }

    }
}