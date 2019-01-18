using System;
using System.Globalization;

namespace mobilityAI.Models {
    public class Activity {
        public string DeviceId {
            get; set;
        }
        public DateTime Start {
            get; set;
        }
        public DateTime End {
            get; set;
        }
        public short Type {
            get; set;
        }
    }
}