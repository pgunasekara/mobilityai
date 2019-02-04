using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models
{
    public class BodyPart
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id
        {
            get; set;
        }
        [ForeignKey("Patient")]
        [Required]
        public int PatientId
        {
            get; set;
        }
        public bool Neck
        {
            get; set;
        }
        public bool MiddlebackRibs
        {
            get; set;
        }
        public bool Lowerback
        {
            get; set;
        }
        public bool ShoulderArmElbow
        {
            get; set;
        }
        public bool HandWrist
        {
            get; set;
        }
        public bool PelvisHipLegKnee
        {
            get; set;
        }
        public bool FootAnkle
        {
            get; set;
        }
        public bool Other
        {
            get; set;
        }
    }


}