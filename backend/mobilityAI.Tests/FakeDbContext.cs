namespace mobilityAI.Tests {
    using System;
    using Xunit;
    using mobilityAI.Evaluators;
    using mobilityAI.Models;
    using Moq;
    using Microsoft.EntityFrameworkCore;
    using Microsoft.Data.Sqlite;

    public class FakeDbContext {
        // https://gist.github.com/mikebridge/a1188728a28f0f53b06fed791031c89d
        public static MobilityAIContext InMemoryContext()
        {
            // SEE: https://docs.microsoft.com/en-us/ef/core/miscellaneous/testing/sqlite
            var connection = new SqliteConnection("Data Source=:memory:");
            var options = new DbContextOptionsBuilder<MobilityAIContext>()
                .UseSqlite(connection)
                .Options;
            connection.Open();
            
            // create the schema
            using (var context = new MobilityAIContext(options))
            {
                context.Database.EnsureCreated();
            }

            return new MobilityAIContext(options);
        }
    }
}