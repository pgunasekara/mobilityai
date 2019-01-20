using System;
using System.Globalization;

namespace mobilityAI.Models {
    public class Activity {
        public string Id {
            get; set;
        }
        public string DeviceId {
            get; set;
        }
        public long Start {
            get; set;
        }
        public long End {
            get; set;
        }
        public short Type {
            get; set;
        }
    }
}