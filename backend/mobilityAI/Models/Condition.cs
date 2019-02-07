using System;
using System.Globalization;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace mobilityAI.Models
{
    public class Condition
    {
        [Key]
        public int Id
        {
            get; set;
        }
        public string Text
        {
            get; set;
        }
    }


}