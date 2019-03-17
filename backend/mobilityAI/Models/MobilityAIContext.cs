using Microsoft.EntityFrameworkCore;
using System.Data.SqlClient;

namespace mobilityAI.Models
{
    public class MobilityAIContext : DbContext
    {
        public MobilityAIContext(DbContextOptions<MobilityAIContext> options) : base(options)
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
        public DbSet<Patient> Patients
        {
            get; set;
        }
        public DbSet<Patient_Impl> Patients_Impl
        {
            get; set;
        }

        public DbSet<ActivityGoal> ActivityGoals
        {
            get; set;
        }

        public DbSet<Observation> Observations
        {
            get; set;
        }

        public DbSet<Step> Steps
        {
            get; set;
        }
        public DbSet<Condition> Conditions
        {
            get; set;
        }

        public DbSet<Severity> Severities
        {
            get; set;
        }

        public DbSet<LivingSituation> LivingSituations
        {
            get; set;
        }

        public DbSet<WalkingSituation> WalkingSituations
        {
            get; set;
        }

        public DbSet<BodyPart> BodyParts
        {
            get; set;
        }

        public DbSet<Survey> Surveys
        {
            get; set;
        }

        // Pre-populating the patient data tables 
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Condition>().HasData(
                new Condition
                {
                    Id = 1,
                    Text = "Orhopedic"
                },
                new Condition
                {
                    Id = 2,
                    Text = "Neurologic",
                },
                new Condition
                {
                    Id = 3,
                    Text = "Cardiopulmonary",
                },
                new Condition
                {
                    Id = 4,
                    Text = "Major Medical Condition",
                },
                new Condition
                {
                    Id = 5,
                    Text = "Other",
                }
            );
            modelBuilder.Entity<Severity>().HasData(
                new Severity
                {
                    Id = 1,
                    Text = "Not Severe"
                },
                new Severity
                {
                    Id = 2,
                    Text = "Mildly Severe"
                },
                new Severity
                {
                    Id = 3,
                    Text = "Moderately Severe"
                },
                new Severity
                {
                    Id = 4,
                    Text = "Extremely Severe"
                }
            );
            modelBuilder.Entity<LivingSituation>().HasData(
                new LivingSituation
                {
                    Id = 1,
                    Text = "Living in the Community"
                },
                new LivingSituation
                {
                    Id = 2,
                    Text = "Hospital/Nursing Home/Assisted Living Facility",
                }
            );
            modelBuilder.Entity<WalkingSituation>().HasData(
                new WalkingSituation
                {
                    Id = 1,
                    Text = "Never use a walking device or wheelchair"
                },
                new WalkingSituation
                {
                    Id = 2,
                    Text = "Use a cane, walker or other walking device at least some of the time, but never use a wheelchair",
                },
                new WalkingSituation
                {
                    Id = 3,
                    Text = "Using a walking device at least some of the time and a wheelchair at least some of the time"
                },
                new WalkingSituation
                {
                    Id = 4,
                    Text = "Use a wheelchair, never walk"
                }
            );
        }
    }
}