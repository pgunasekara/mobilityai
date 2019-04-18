namespace mobilityAI.Tests {
    using mobilityAI.Models;
    using mobilityAI.Evaluators;
    using Xunit;
    using System.Linq;
    public class UsersEvaluatorTests {
        MobilityAIContext context = FakeDbContext.InMemoryContext();
        const string email = "example@example.com";
        const string firstName = "John";
        const string lastName = "Smith";
        const string password = "password";

        public UsersEvaluatorTests()
        {
        }

        [Fact]
        public void Test_SignUp()
        {
            // Arrange
            var evaluator = new UsersEvaluator(context);

            // Act
            evaluator.SignUp(email, firstName,  lastName, password);

            // Assert
            var newUser = (from user in context.Users
                          where user.FirstName == firstName && user.LastName == lastName && user.Email == email
                          select new {
                              FirstName = user.FirstName,
                              LastName = user.LastName,
                              Email = user.Email,
                              Password = user.Password,
                          }).First();

            Assert.Equal(newUser.Email, email);
            Assert.Equal(newUser.FirstName, firstName);
            Assert.Equal(newUser.LastName, lastName);
            Assert.NotEqual(newUser.Password, password);
        }
    }
}