using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models {
    public class ActivityGoal {
        [Key, ForeignKey("Patients")] 
        public int Id { get; set; }

        [Required]
        public int Steps { get; set; }

        [Required]
        public int ActiveMinutes { get; set; }

        [Required]
        public int WalkingMinutes { get; set; }
        [Required]
        public int StandingMinutes { get; set; }
    }
}