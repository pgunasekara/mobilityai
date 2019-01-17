using System;
using System.Globalization;

namespace mobilityAI.Models {
    public class Device {
        public string Id {
            get; set;
        }
        public string FriendlyName {
            get; set;
        }
        public int UserID {
            get; set;
        }
        public DateTime LastSync {
            get; set;
        }

    }
}