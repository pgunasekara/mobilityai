using System;
using System.Globalization;

namespace mobilityAI.Models {
    public class Accelerometer {
        public string Id {
            get; set;
        }
        public long Epoch {
            get; set;
        }

        public DateTime Timestamp {
            get; set;
        }

        public double Elapsed {
            get; set;
        }
        
        public double XAxis {
            get; set;
        }
        
        public double YAxis {
            get; set;
        }

        public double ZAxis {
            get; set;
        }
    }
}