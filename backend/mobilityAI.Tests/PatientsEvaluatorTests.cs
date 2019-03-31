namespace mobilityAI.Tests {
    using Xunit;
    using mobilityAI.Models;
    using mobilityAI.Evaluators;
    using System.Linq;
    using Microsoft.AspNetCore.Mvc;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Linq;
    using System.Collections.Generic;
    using System;
    public class PatientsEvaluatorTests {
        MobilityAIContext context = FakeDbContext.InMemoryContext();
        const int patientId = 1;
        const string deviceId = "FF:FF:FF:FF:FF:FF";
        const string firstName = "John";
        const string lastName = "Smith";
        const long activityStart = 1553888784000;
        const long activityEnd = activityStart + 60000;
        const int activityType = (int)ActivityType.standing;
        string activityId = Guid.NewGuid().ToString();
        const int patientSteps = 10;
        const int activeMinutes = 5;
        const int walkingMinutes = 3;
        const int standingMinutes = 7;
        const long stepStart = activityStart;
        const long stepEnd = activityEnd;
        const string patientDataString = "{\"id\": null, \"firstName\": \"Tim\", \"lastName\": \"Apple\", \"someData\": \"Frequently\"}";
        const string newPatientDataString = "{\"id\": null, \"firstName\": \"Tim\", \"lastName\": \"Apple\", \"someData\": \"Rarely\"}";
        const int userId = 15;
        const string userComment = "wow, what a great patient!";
        const string email = "example@example.com";
        const string password = "password";
        const string surveyData = "{\"satisfied\": 5}";



        public PatientsEvaluatorTests()
        {

        }

        [Fact]
        public void Test_GetPatients()
        {
            // Arrange
            context.Patients.Add(new Patient{
                Id = patientId,
                DeviceId = deviceId,
                FirstName = firstName,
                LastName = lastName
            });

            context.SaveChanges();

            var evaluator = new PatientsEvaluator(context);

            // Act
            var patientsResult = evaluator.GetPatients();

            // Assert
            var patientsResultJson = patientsResult as JsonResult;
            Assert.NotNull(patientsResultJson);

            var jsonResult = JsonConvert.SerializeObject(patientsResultJson.Value).ToString();
            var patients = JsonConvert.DeserializeObject<List<Dictionary<string,string>>>(jsonResult);

            var insertedPatient = from patient in patients
                                  where patient["Id"] == patientId.ToString()
                                  select patient;

            Assert.Equal(insertedPatient.Count(), 1);
        }

        [Fact]
        public void Test_CreatePatient()
        {
            // Arrange
            
            var evaluator = new PatientsEvaluator(context);

            // Act
            evaluator.CreatePatient(patientDataString);

            // Assert
            var newPatient = (from patient in context.Patients
                             where patient.FirstName == "Tim" && patient.LastName == "Apple"
                             select patient).First();

            var newPatientImpl = (from patientimpl in context.Patients_Impl
                                  where patientimpl.Id == newPatient.Id
                                  select patientimpl).First();

            var newPatientData = JsonConvert.DeserializeObject<Dictionary<string, string>>(newPatientImpl.Data);
            Assert.Equal(newPatientData["someData"], "Frequently");
        }

        [Fact]
        public void Test_GetPatientActivity()
        {
            // Arrange
            context.Activities.Add(new Activity{
                Id = activityId,
                PatientId = patientId,
                Start = activityStart,
                End = activityEnd,
                Type = activityType
            });

            context.SaveChanges();

            var evaluator = new PatientsEvaluator(context);

            // Act
            var activity = evaluator.GetPatientActivity(patientId, activityStart, activityEnd);

            // Assert
            var activityResponse = JObject.Parse((string)activity.Value);
            var standingBarArray = activityResponse["standing"]["bar"];
            var t = standingBarArray.Values<int>();
            Assert.Equal(t.ToArray()[0], 1);
        }

        [Fact]
        public void Test_PatientAchievements()
        {
            // Arrange
            var evaluator = new PatientsEvaluator(context);

            // Act
            evaluator.PatientAchievement(patientId, patientSteps, activeMinutes, walkingMinutes, standingMinutes);

            // Assert
            var patientActivity = (from activity in context.ActivityGoals
                                  where activity.Id == patientId
                                  select activity).First();

            Assert.Equal(patientActivity.Steps, patientSteps);
            Assert.Equal(patientActivity.ActiveMinutes, activeMinutes);
            Assert.Equal(patientActivity.WalkingMinutes, walkingMinutes);
            Assert.Equal(patientActivity.StandingMinutes, standingMinutes);
        }

        [Fact]
        public void Test_GetPatientAchievements()
        {
            // Arrange
            var newGoal = new ActivityGoal {
                Id = patientId,
                Steps = patientSteps,
                ActiveMinutes = activeMinutes,
                WalkingMinutes = walkingMinutes,
                StandingMinutes = standingMinutes
            };
            context.ActivityGoals.Add(newGoal);

            context.SaveChanges();

            var evaluator = new PatientsEvaluator(context);

            // Act
            var activityResult = evaluator.GetPatientAchievements(patientId) as JsonResult;

            // Assert
            var activity = (ActivityGoal) activityResult.Value;
            Assert.Same(newGoal, activity);
        }

        [Fact]
        public void Test_GetSteps()
        {
            // Arrange
            context.Steps.Add(new Step {
                PatientId = patientId,
                Epoch = stepStart
            });

            context.SaveChanges();

            var evaluator = new PatientsEvaluator(context);

            // Act
            var stepsResult = evaluator.GetSteps(patientId, stepStart, stepEnd);

            // Assert
            var steps = JsonConvert.SerializeObject((stepsResult as JsonResult).Value as IEnumerable<object>);
            var stepsObj = JArray.Parse(steps);

            Assert.Equal(stepsObj.Count(), 1);
            Assert.Equal(stepsObj.First["Epoch"], stepStart);
        }

        [Fact]
        public void Test_UpdatePatient()
        {
            // Arrange
            context.Patients_Impl.Add(new Patient_Impl {
                Id = patientId,
                Data = patientDataString
            });

            context.SaveChanges();

            var evaluator = new PatientsEvaluator(context);

            // Act
            evaluator.UpdatePatient(patientId, newPatientDataString);

            // Assert
            var newPatientImpl = (from patient_impl in context.Patients_Impl
                                 where patient_impl.Id == patientId
                                 select patient_impl).First();

            Assert.Equal(newPatientImpl.Id, patientId);
            Assert.Equal(newPatientImpl.Data, newPatientDataString);
        }

        [Fact]
        public void Test_PatientData()
        {
            // Arrange
            context.Patients_Impl.Add(new Patient_Impl {
                Id = patientId,
                Data = patientDataString
            });

            context.SaveChanges();

            var evaluator = new PatientsEvaluator(context);

            // Act
            var patient_impl = evaluator.PatientData(patientId).Value as Patient_Impl;

            // Assert
            Assert.Equal(patient_impl.Id, patientId);
            Assert.Equal(patient_impl.Data, patientDataString);
        }

        [Fact]
        public void Test_AddPatientObservation()
        {
            // Arrange
            var evaluator = new PatientsEvaluator(context);

            // Act
            evaluator.AddPatientObservations(userId, patientId, userComment);

            // Assert
            var observationResult = (from observation in context.Observations
                                    where observation.UserId == userId && observation.PatientId == patientId
                                    select observation).First();
            
            Assert.Equal(observationResult.Comment, userComment);
        }

        [Fact]
        public void Test_GetPatientObservations()
        {
            // Arrange
            context.Observations.Add(new Observation {
                UserId = userId,
                PatientId = patientId,
                Comment = userComment,
                Timestamp = new DateTime()
            });

            context.Users.Add(new User {
                Id = userId,
                FirstName = firstName,
                LastName = lastName,
                Email = email,
                Password = password,
                Salt = "salt"
            });

            context.SaveChanges();

            var evaluator = new PatientsEvaluator(context);

            // Act
            var evalResult = evaluator.GetPatientObserations(patientId);
            var observationResult = JsonConvert.SerializeObject((evalResult as JsonResult).Value);
            var observation = JArray.Parse(observationResult);

            // Assert
            Assert.Equal(observation[0]["Comment"], userComment);
        }

        [Fact]
        public void Test_GetPatientSurvey()
        {
            // Arrange
            context.Surveys.Add(new Survey{
                PatientId = patientId,
                Data = surveyData
            });

            context.SaveChanges();

            var evaluator = new PatientsEvaluator(context);

            // Act
            var evalResults = evaluator.GetPatientSurveys(patientId);
            var surveyResults = JsonConvert.SerializeObject((evalResults as JsonResult).Value);
            var surveys = JArray.Parse(surveyResults);

            // Assert
            Assert.Equal(surveys[0]["Data"], surveyData);
        }

        [Fact]
        public void Test_NewPatientSurvey()
        {
            // Arrange
            context.Patients.Add(new Patient{
                Id = patientId,
                DeviceId = deviceId,
                FirstName = firstName,
                LastName = lastName
            });

            context.SaveChanges();
            
            var evaluator = new PatientsEvaluator(context);

            // Act
            evaluator.NewPatientSurvey(patientId, surveyData);

            // Assert
            var surveyResult = (from survey in context.Surveys
                                where survey.PatientId == patientId
                                select survey).First();

            Assert.Equal(surveyResult.Data, surveyData);
        }
    }
}