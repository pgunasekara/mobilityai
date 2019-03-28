namespace mobilityAI.Tests {
    using mobilityAI.Models;
    using mobilityAI.Evaluators;
    using System;
    using Xunit;
    using Microsoft.AspNetCore.Http.Internal;
    using System.IO;
    using System.Linq;
    using Moq;
    using System.Net.Http;
    using System.Net;
    using System.Web;
    using System.Threading.Tasks;
    using System.Threading;
    using System.Text;
    public class SensorsEvaluatorTests {
        MobilityAIContext context = FakeDbContext.InMemoryContext();
        const int patientId = 1;

        public SensorsEvaluatorTests()
        {
        }

        [Fact]
        public void Test_AddSensorData()
        {
            // Arrange
            var evaluator = new SensorsEvaluator(context, new HttpClient(new FakeHttpMessageHandler()));
            var accelFileStream = new FileStream("../../../../../machine_learning/training_sets/untagged_sets/new-1-roberto-d11_MetaWear Prime_2018-12-11T15.41.32.039_D0D172CD1CFC_Accelerometer_25.000Hz_1.4.2.csv", FileMode.Open);
            var gyroFileStream = new FileStream("../../../../../machine_learning/training_sets/untagged_sets/new-1-roberto-d11_MetaWear Prime_2018-12-11T15.41.32.039_D0D172CD1CFC_Gyroscope_25.000Hz_1.4.2.csv", FileMode.Open);

            var accelMemoryStream = new MemoryStream();
            var gyroMemoryStream = new MemoryStream();
            accelFileStream.CopyTo(accelMemoryStream);
            gyroFileStream.CopyTo(gyroMemoryStream);

            var accelFile = new FormFile(accelMemoryStream, 
                                        0,
                                        accelFileStream.Length,
                                        "new-1-roberto-d11_MetaWear Prime_2018-12-11T15.41.32.039_D0D172CD1CFC_Accelerometer_25.000Hz_1.4.2.csv",
                                        "new-1-roberto-d11_MetaWear Prime_2018-12-11T15.41.32.039_D0D172CD1CFC_Accelerometer_25.000Hz_1.4.2.csv");

            var gyroFile = new FormFile(gyroMemoryStream,
                                        0,
                                        gyroFileStream.Length,
                                        "new-1-roberto-d11_MetaWear Prime_2018-12-11T15.41.32.039_D0D172CD1CFC_Gyroscope_25.000Hz_1.4.2.csv",
                                        "new-1-roberto-d11_MetaWear Prime_2018-12-11T15.41.32.039_D0D172CD1CFC_Gyroscope_25.000Hz_1.4.2.csv");

            // Act
            evaluator.AddSensorData(patientId, accelFile, gyroFile);

            // Assert
            var accelData = from accel in context.AccelerometerData
                            where accel.PatientId == patientId
                            select new {accel.Id};
            
            Assert.Equal(9189, accelData.Count());
        }

        [Fact]
        public void Test_AddSteps()
        {
            // Arrange
            var evaluator = new SensorsEvaluator(context);
            string fakeStepsFile = "1553737808000\n1553737809000\n";
            var fakeStepsBytes = Encoding.UTF8.GetBytes(fakeStepsFile);
            var stepsMemoryStream = new MemoryStream(fakeStepsBytes);

            var stepsFile = new FormFile(stepsMemoryStream,
                                        0,
                                        fakeStepsBytes.Length,
                                        "Steps",
                                        "steps.csv");

            // Act
            evaluator.AddSteps(patientId, stepsFile);

            // Assert
            var stepsData = from steps in context.Steps
                            where steps.PatientId == patientId
                            select new {steps.Id};

            Assert.Equal(2, stepsData.Count());
        }
    }

    public class FakeHttpMessageHandler : HttpMessageHandler {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage message, CancellationToken token)
        {
            return Task.FromResult(new HttpResponseMessage() { StatusCode = HttpStatusCode.OK, Content = new StringContent("OK") });
        }
    }
}