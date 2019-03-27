using System;
using Xunit;
using mobilityAI.Evaluators;
using mobilityAI.Models;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;


namespace mobilityAI.Tests
{
    public class DevicesEvaluatorTests
    {
        [Fact]
        public void Test_GetDevice()
        {
            // Arrange
            const int patientId = 1;
            const string deviceId = "FF:FF:FF:FF:FF:FF";
            const string firstName = "John";
            const string lastName = "Smith";
            const string friendlyName = "John's Device";
            var lastsync = new DateTime();

            var db = FakeDbContext.InMemoryContext();
            db.Patients.Add(new Patient {
                Id = patientId,
                DeviceId = deviceId,
                FirstName = firstName,
                LastName = lastName
            });

            db.Devices.Add(new Device {
                Id = deviceId,
                FriendlyName = friendlyName,
                PatientID = patientId,
                LastSync = lastsync
            });
            db.SaveChanges();

            var evaluator = new DevicesEvaluator(db);

            // Act
            var deviceResult = evaluator.GetDevice(deviceId);

            // Assert
            var okDeviceResult = deviceResult as JsonResult;
            Assert.NotNull(okDeviceResult);

            var jsonResult = JsonConvert.SerializeObject(okDeviceResult.Value).ToString();
            Console.WriteLine(jsonResult);

            var device = JsonConvert.DeserializeObject<Dictionary<string,string>>(jsonResult);
            Assert.NotNull(device);

            Assert.Equal(patientId.ToString(), device["PatientID"]);
            Assert.Equal(deviceId, device["Id"]);
            Assert.Equal(friendlyName, device["FriendlyName"]);
            Assert.Equal(firstName, device["FirstName"]);
            Assert.Equal(lastName, device["LastName"]);
        }
    }
}
