using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models
{
    public class Accelerometer
    {
        [Key]
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
        public long Epoch
        {
            get; set;
        }
        [Required]
        public DateTime Timestamp
        {
            get; set;
        }
        [Required]
        public double Elapsed
        {
            get; set;
        }
        [Required]
        public double XAxis
        {
            get; set;
        }
        [Required]
        public double YAxis
        {
            get; set;
        }
        [Required]
        public double ZAxis
        {
            get; set;
        }
    }
}