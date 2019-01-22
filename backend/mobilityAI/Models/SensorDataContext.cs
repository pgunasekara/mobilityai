using Microsoft.EntityFrameworkCore;
using System.Data.SqlClient;

namespace mobilityAI.Models
{
    public class SensorDataContext : DbContext
    {   
        public SensorDataContext(DbContextOptions<SensorDataContext> options) : base(options)
        {
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12 | System.Net.SecurityProtocolType.Tls11 | System.Net.SecurityProtocolType.Tls;
            this.Database.EnsureCreated();
        }

        public DbSet<Accelerometer> AccelerometerData
        {
            get; set;
        }

        public DbSet<Gyroscope> GyroscopeData
        {
            get; set;
        }

        public DbSet<Device> Devices
        {
            get; set;
        }

        public DbSet<User> Users
        {
            get; set;
        }

        public DbSet<Activity> Activities
        {
            get; set;
        }
    }
}