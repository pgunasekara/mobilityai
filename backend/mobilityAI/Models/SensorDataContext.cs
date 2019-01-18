using Microsoft.EntityFrameworkCore;
using System.Data.SqlClient;

namespace mobilityAI.Models
{
    public class SensorDataContext : DbContext
    {
        public void IsServerConnected()
        {
            using (var l_oConnection = new SqlConnection("Host=40.117.231.58;Port=5432;Username=postgres;Password=password;Database=SensorDatabase;"))
            {
                try
                {
                    l_oConnection.Open();
                    System.Diagnostics.Debug.Print("true");
                }
                catch (SqlException)
                {
                    System.Diagnostics.Debug.Print("false");
                }
            }
        }
        
        public SensorDataContext(DbContextOptions<SensorDataContext> options) : base(options)
        {
            System.Net.ServicePointManager.SecurityProtocol = System.Net.SecurityProtocolType.Tls12 | System.Net.SecurityProtocolType.Tls11 | System.Net.SecurityProtocolType.Tls;

            // IsServerConnected();
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