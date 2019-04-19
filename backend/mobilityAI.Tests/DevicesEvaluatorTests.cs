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
        MobilityAIContext context = FakeDbContext.InMemoryContext();
        const int patientId = 1;
        const string deviceId = "FF:FF:FF:FF:FF:FF";
        const string firstName = "John";
        const string lastName = "Smith";
        const string friendlyName = "John's Device";
        DateTime lastsync = new DateTime();
        const string newDeviceId = "FF:FF:FF:FF:FF:FE";
        public DevicesEvaluatorTests()
        {
            // Arrange
            context.Patients.Add(new Patient {
                Id = patientId,
                DeviceId = deviceId,
                FirstName = firstName,
                LastName = lastName
            });

            context.Devices.Add(new Device {
                Id = deviceId,
                FriendlyName = friendlyName,
                PatientID = patientId,
                LastSync = lastsync
            });
            context.SaveChanges();
        }

        [Fact]
        public void Test_GetDevice()
        {
            var evaluator = new DevicesEvaluator(context);

            // Act
            var deviceResult = evaluator.GetDevice(deviceId);

            // Assert
            var okDeviceResult = deviceResult as JsonResult;
            Assert.NotNull(okDeviceResult);

            var jsonResult = JsonConvert.SerializeObject(okDeviceResult.Value).ToString();

            var device = JsonConvert.DeserializeObject<Dictionary<string,string>>(jsonResult);
            Assert.NotNull(device);

            Assert.Equal(patientId.ToString(), device["PatientID"]);
            Assert.Equal(deviceId, device["Id"]);
            Assert.Equal(friendlyName, device["FriendlyName"]);
            Assert.Equal(firstName, device["FirstName"]);
            Assert.Equal(lastName, device["LastName"]);
        }

        [Fact]
        public void Test_UpdateDevice_New()
        {
            var evaluator = new DevicesEvaluator(context);

            // Act
            var deviceResult = evaluator.UpdateDevice(newDeviceId, friendlyName, patientId, lastsync.AddDays(1).ToString());

            // Assert
            var okDeviceResult = deviceResult as JsonResult;
            Assert.NotNull(okDeviceResult);

            var jsonResult = JsonConvert.SerializeObject(okDeviceResult.Value).ToString();

            var patient = JsonConvert.DeserializeObject<Patient>(jsonResult);
            Assert.NotNull(patient);

            Assert.Equal(patientId, patient.Id);
            Assert.Equal(firstName, patient.FirstName);
            Assert.Equal(lastName, patient.LastName);
            Assert.Equal(newDeviceId, patient.DeviceId);
        }

        [Fact]
        public void Test_UpdateDevice_Update()
        {
            var evaluator = new DevicesEvaluator(context);

            // Act
            var deviceResult = evaluator.UpdateDevice(deviceId, friendlyName, patientId, lastsync.AddDays(1).ToString());

            // Assert
            var okDeviceResult = deviceResult as JsonResult;
            Assert.NotNull(okDeviceResult);

            var jsonResult = JsonConvert.SerializeObject(okDeviceResult.Value).ToString();

            var patient = JsonConvert.DeserializeObject<Patient>(jsonResult);
            Assert.NotNull(patient);

            Assert.Equal(patientId, patient.Id);
            Assert.Equal(firstName, patient.FirstName);
            Assert.Equal(lastName, patient.LastName);
            Assert.Equal(deviceId, patient.DeviceId);
        }
    }
}
