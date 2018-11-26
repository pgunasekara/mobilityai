using Microsoft.EntityFrameworkCore;

namespace mobilityAI.Models {
    public class SensorDataContext: DbContext {
        public SensorDataContext(DbContextOptions<SensorDataContext> options) : base(options){
            this.Database.EnsureCreated();
        }
        public DbSet<Accelerometer> AccelerometerData {
            get; set;
        }

        public DbSet<Gyroscope> GyroscopeData {
            get; set;
        }

    }
}