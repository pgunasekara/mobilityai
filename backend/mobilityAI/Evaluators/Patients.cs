namespace mobilityAI.Evaluators {
    using mobilityAI.Models;
    using System.Globalization;
    using System;
    using System.Collections.Generic;
    using Microsoft.AspNetCore.Mvc;
    using System.Linq;
    using Newtonsoft.Json;
    using Newtonsoft.Json.Linq;
    public class PatientsEvaluator {
        private readonly MobilityAIContext _context;
        private static bool isFirstRun = true;
        private static readonly DateTime epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        private readonly int NumberOfActivities = Enum.GetNames(typeof(ActivityType)).Length;

        public PatientsEvaluator(MobilityAIContext context)
        {
            _context = context;
        }

        public JsonResult GetPatients()
        {
            if (isFirstRun)
            {
                var demoPatients = new List<Patient> {
                    new Patient {
                        DeviceId = "1",
                        FirstName = "Joe",
                        LastName = "Johnson"
                    },
                    new Patient {
                        DeviceId = "2",
                        FirstName = "Ruth",
                        LastName = "Reynolds",
                    },
                    new Patient {
                        DeviceId = "3",
                        FirstName = "Marie",
                        LastName = "Anderson"
                    }
                };
                _context.Patients.AddRange(demoPatients);
                _context.SaveChanges();
                isFirstRun = false;
            }
            return new JsonResult(_context.Patients.ToList());
        }

        public void CreatePatient(string patientData)
        {
            JObject parsedPatientData = JObject.Parse(patientData);

            Patient p = new Patient()
            {
                DeviceId = "",
                FirstName = (string)parsedPatientData["firstName"],
                LastName = (string)parsedPatientData["lastName"]
            };

            _context.Patients.Add(p);
            _context.SaveChanges(); //Save changes here to retrieve the db generate Id for patient


            Patient_Impl data = new Patient_Impl()
            {
                Id = p.Id,
                Data = parsedPatientData.ToString()
            };

            _context.Patients_Impl.Add(data);
            _context.SaveChanges();
        }

        public JsonResult GetPatientActivity(int patientId, long start, long end)
        {
            var data = (from activities in _context.Activities
                        where activities.Start >= start && activities.End <= end && activities.PatientId == patientId
                        orderby activities.Start ascending
                        select new { activities.Start, activities.End, activities.Type })
                        .ToList();

            var startDate = FromUnixTime(start);
            var endDate = FromUnixTime(end);

            if (data.Count != 0)
            {
                var totalHourBuckets = (int)Math.Ceiling((endDate - startDate).TotalHours);

                float[] count = new float[NumberOfActivities];
                float[] total = new float[NumberOfActivities];
                float[][] activityTotals = new float[NumberOfActivities][];
                for (int i = 0; i < NumberOfActivities; i++) activityTotals[i] = new float[totalHourBuckets];
                float totalRows = data.Count;

                int currentHourBucket = 0;
                long startOfHourBucket = 0;
                const int lengthOfHourBucket = 3600000; // milliseconds in one hour

                for (int i = 0; i < data.Count - 1; i++)
                {
                    var element = data[i];
                    var nextElement = data[i + 1];

                    count[element.Type]++;

                    activityTotals[element.Type][currentHourBucket] += (nextElement.Start - element.Start) / 1000f;

                    if (nextElement.Start - startOfHourBucket >= lengthOfHourBucket)
                    {
                        currentHourBucket++;
                        startOfHourBucket = nextElement.Start;
                    }
                }

                activityTotals[data[data.Count - 1].Type][currentHourBucket] += (data[data.Count - 1].End - data[data.Count - 1].Start) / 1000f;

                for (int i = 0; i < NumberOfActivities; i++)
                {
                    for (int j = 0; j < totalHourBuckets; j++)
                    {
                        activityTotals[i][j] = activityTotals[i][j] / 60;
                    }
                }

                total[(int)ActivityType.sitting] = (count[(int)ActivityType.sitting] / totalRows) * 100;
                total[(int)ActivityType.lyingDown] = (count[(int)ActivityType.lyingDown] / totalRows) * 100;
                total[(int)ActivityType.walking] = (count[(int)ActivityType.walking] / totalRows) * 100;
                total[(int)ActivityType.standing] = (count[(int)ActivityType.standing] / totalRows) * 100;
                total[(int)ActivityType.unknown] = (count[(int)ActivityType.unknown] / totalRows) * 100;

                var retObj = new
                {
                    sitting = new
                    {
                        total = total[(int)ActivityType.sitting],
                        bar = activityTotals[(int)ActivityType.sitting]
                    },
                    lyingDown = new
                    {
                        total = total[(int)ActivityType.lyingDown],
                        bar = activityTotals[(int)ActivityType.lyingDown]
                    },
                    walking = new
                    {
                        total = total[(int)ActivityType.walking],
                        bar = activityTotals[(int)ActivityType.walking]
                    },
                    standing = new
                    {
                        total = total[(int)ActivityType.standing],
                        bar = activityTotals[(int)ActivityType.standing]
                    },
                    unknown = new
                    {
                        total = total[(int)ActivityType.unknown],
                        bar = activityTotals[(int)ActivityType.unknown]
                    },
                };
                return new JsonResult(JsonConvert.SerializeObject(retObj));
            }
            throw new Exception(String.Format("Could not find any activity data for patient with id: {0} between the dates {1} and {2} UTC",
                                patientId,
                                startDate,
                                endDate));
        }

        public void PatientAchievement(int patientId, int steps, int activeMinutes, int walkingMinutes, int standingMinutes)
        {
            var data = (from a in _context.ActivityGoals
                        where a.Id == patientId
                        select a).SingleOrDefault();

            if (data == null)
            {
                _context.ActivityGoals.Add(new ActivityGoal
                {
                    Id = patientId,
                    Steps = steps,
                    ActiveMinutes = activeMinutes,
                    WalkingMinutes = walkingMinutes,
                    StandingMinutes = standingMinutes
                });
            }
            else
            {
                data.Id = patientId;
                data.Steps = steps;
                data.ActiveMinutes = activeMinutes;
                data.WalkingMinutes = walkingMinutes;
                data.StandingMinutes = standingMinutes;
            }

            _context.SaveChanges();
        }

        public IActionResult GetPatientAchievements(int patientId)
        {
            ActivityGoal data = (from a in _context.ActivityGoals
                                 where a.Id == patientId
                                 select a).SingleOrDefault();

            if (data == null)
            {
                throw new Exception(String.Format("Patient ID: {0} not found.", patientId));
            }

            return new JsonResult(data);
        }

        public IActionResult GetSteps(int patientId, long startDate, long endDate)
        {
            var data = (from steps in _context.Steps
                        where steps.Epoch >= startDate && steps.Epoch <= endDate && steps.PatientId == patientId
                        orderby steps.Epoch ascending
                        select new { steps.Epoch })
                        .ToList();

            if (data != null)
            {
                return new JsonResult(data);
            }

            return new JsonResult(new List<Step>()); //Empty list indicates that no data was found
        }

        public void UpdatePatient(int patientId, string patientData)
        {
            Patient_Impl data = (from a in _context.Patients_Impl
                                 where a.Id == patientId
                                 select a).SingleOrDefault();

            data.Id = patientId;
            data.Data = patientData;

            _context.SaveChanges();
        }

        public JsonResult PatientData(int patientId)
        {
            Patient_Impl data = (from a in _context.Patients_Impl
                                 where a.Id == patientId
                                 select a).SingleOrDefault();

            if (data != null)
            {
                return new JsonResult(data);
            }
            Patient_Impl b = new Patient_Impl();
            return new JsonResult(b);
        }

        public void AddPatientObservations(int userId, int patientId, string comment)
        {
            Observation data = new Observation();

            data.UserId = userId;
            data.PatientId = patientId;
            data.Comment = comment;
            data.Timestamp = DateTime.Now;

            _context.Observations.Add(data);
            _context.SaveChanges();
        }

        public IActionResult GetPatientObserations(int patientId)
        {
            var data = (from obs in _context.Observations
                        join users in _context.Users on obs.UserId equals users.Id
                        where obs.PatientId == patientId
                        select new { users.FirstName, users.LastName, obs.Comment, obs.Timestamp }).ToList();

            if (data != null)
            {
                return new JsonResult(data);
            }

            throw new Exception(String.Format("Patient ID: {0} not found.", patientId));
        }

        public IActionResult GetPatientSurveys(int patientId)
        {
            var data = (from survey in _context.Surveys
                        where survey.PatientId == patientId
                        select new { survey.Data }).ToList();

            if (data != null)
            {
                return new JsonResult(data);
            }

            throw new Exception(String.Format("Patient ID: {0} not found.", patientId));
        }

        public void NewPatientSurvey(int patientId, string surveyData)
        {
            if (patientExists(patientId))
            {
                _context.Surveys.Add(
                    new Survey
                    {
                        PatientId = patientId,
                        Data = surveyData
                    }
                );

                _context.SaveChanges();
            }
            throw new Exception(String.Format("Patient ID: {0} not found.", patientId));
        }

        private static DateTime FromUnixTime(long time)
        {
            time = time / 1000;
            return epoch.AddSeconds(time);
        }

        private static long ToUnixTime(DateTime time)
        {
            TimeSpan diff = time.ToUniversalTime() - epoch;
            return (long)Math.Floor(diff.TotalSeconds);
        }

        private bool patientExists(int patientId)
        {
            return (from patient in _context.Patients
                    where patient.Id == patientId
                    select new { patient.Id }).SingleOrDefault() != null;
        }
    }
}