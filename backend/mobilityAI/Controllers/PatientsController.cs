using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Collections.Concurrent;
using Microsoft.AspNetCore.Http;
using mobilityAI.Models;
using System.Net.Http;
using System.Threading.Tasks;
using System.Linq;
using System;
using System.IO;
using System.Globalization;
using Microsoft.VisualBasic;
using Newtonsoft.Json;
using System.Text;
using System.Security.Cryptography;

namespace mobilityAI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly MobilityAIContext _context;
        private static bool isFirstRun = true;
        private static readonly DateTime epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        private readonly int NumberOfActivities = Enum.GetNames(typeof(ActivityType)).Length;

        public PatientsController(MobilityAIContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Returns a list of all patients
        /// </summary>
        /// <returns></returns>
        [HttpGet]
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

        /// <summary>
        /// Adding new patient and corresponding data to the database
        /// </summary>
        /// <param name="patientData"> 
        /// Corresponding data of the new patient to be added
        /// </param>
        [HttpPost]
        public IActionResult CreatePatient(string patientData)
        {
            Patient_Impl data = new Patient_Impl();

            data.Data = patientData;

            _context.Patients_Impl.Add(data);
            _context.SaveChanges();

            return Ok();
        }

        /// <summary>
        /// Gets processed activity data for a specific device in a specific time range to be displayed on the UI.
        /// It is assumed that start is at the beginning of the hour respective to the timezone of the device making the request.
        /// </summary>
        /// <param name="Start">Epoch for beginning of time range</param>
        /// <param name="End"Epoch for end of time rante></param>
        /// <param name="patientId">Patient Id for the data you want to query</param>
        /// <returns></returns>
        [HttpGet("{patientId}/Activity")]
        public IActionResult GetPatientActivity(int patientId, long start, long end)
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
                // return Ok(String.Format("Number of activities is {0} and totalHourBcukets is {1}", NumberOfActivities, totalHourBuckets));
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

                    if (nextElement.Start - startOfHourBucket >= lengthOfHourBucket) {
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


                return Ok(JsonConvert.SerializeObject(retObj));
            }

            return BadRequest(String.Format("Could not find any activity data for patient with id: {0} between the dates {1} and {2} UTC", 
                                patientId,
                                startDate,
                                endDate));
        }

        /// <summary>
        /// Update patients achievement information
        /// </summary>
        /// <param name="patientId">Patient Id you want to update</param>
        /// <param name="steps">The goal for the number of steps per day</param>
        /// <param name="activeMinutes">The goal for the number of active minutes per hour</param>
        /// <param name="walkingMiutes">The goal for the number of walking minutes per hour</param>
        /// <param name="standingMinutes">The goal for the number of standing minutes per hour</param>
        /// <returns>
        /// 200 if successful
        /// </returns>
        [HttpPut("{patientId}/Achievements")]
        public IActionResult PatientAchievements(int patientId, int steps, int activeMinutes, int walkingMiutes, int standingMinutes)
        {
            ActivityGoal dataQuery = (from a in _context.ActivityGoals
                                      where (a.Id == patientId)
                                      select a).SingleOrDefault();

            if (dataQuery != null)
            {
                dataQuery.Id = patientId;
                dataQuery.Steps = steps;
                dataQuery.ActiveMinutes = activeMinutes;
                dataQuery.WalkingMinutes = walkingMiutes;
                dataQuery.StandingMinutes = standingMinutes;

                _context.SaveChanges();
                return Ok();
            }
            else
            {
                return BadRequest(String.Format("Patient ID: {0} not found.", patientId));
            }
        }

        /// <summary>
        /// Create new patient activity
        /// </summary>
        /// <param name="patientId">Patient Id you want to update</param>
        /// <param name="steps">The goal for the number of steps per day</param>
        /// <param name="activeMinutes">The goal for the number of active minutes per hour</param>
        /// <param name="walkingMiutes">The goal for the number of walking minutes per hour</param>
        /// <param name="standingMinutes">The goal for the number of standing minutes per hour</param>
        /// <returns></returns>
        [HttpPost("{patientId}/Achievements")]
        public IActionResult NewPatientAchievement(int patientId, int steps, int activeMinutes, int walkingMiutes, int standingMinutes)
        {
            _context.ActivityGoals.Add(new ActivityGoal {
                Id = patientId,
                Steps = steps,
                ActiveMinutes = activeMinutes,
                WalkingMinutes = walkingMiutes,
                StandingMinutes = standingMinutes
            });

            _context.SaveChanges();

            return Ok();
        }

        /// <summary>
        /// Returning the patient achievements stats
        /// </summary>
        /// <param name="patientId">
        /// The id value of the patient
        /// </param>
        /// <returns>
        /// If the patient does not have any achievement stats, returns -1
        /// If the patient has achievement stats, returns the stats
        /// </returns>
        [HttpGet("{patientId}/Achievements")]
        public IActionResult GetPatientAchievements(int patientId)
        {
            ActivityGoal data = (from a in _context.ActivityGoals
                                 where a.Id == patientId
                                 select a).SingleOrDefault();

            if (data == null)
            {
                return BadRequest(String.Format("Patient ID: {0} not found.", patientId));
            }

            return new JsonResult(data);
        }

        [HttpGet("{patientId}/GetSteps")]
        public IActionResult GetSteps(int patientId, String startDate, String endDate)
        {
            long startEpoch = ToUnixTime(DateTime.Parse(startDate));
            long endEpoch = ToUnixTime(DateTime.Parse(endDate));

            var data = (from steps in _context.Steps
                        where steps.Epoch >= startEpoch && steps.Epoch <= endEpoch && steps.PatientId == patientId
                        orderby steps.Epoch ascending
                        select new { steps.Epoch })
                        .ToList();

            if (data != null)
            {
                return new JsonResult(data);
            }

            return new JsonResult(new List<Step>()); //Empty list indicates that no data was found
        }

        /// <summary>
        /// Updating existing patient information
        /// </summary>
        /// <param name="patientId">
        /// The id value of the patient that the data will be updated for
        /// </param>
        /// <param name="patientData">
        /// Data that will be updated for the corresponding patient
        /// </param>
        [HttpPut("{patientId}")]
        public IActionResult UpdatePatient(int patientId, string patientData) { 
            Patient_Impl data = (from a in _context.Patients_Impl
                                 where a.Id == patientId
                                 select a).SingleOrDefault();
            
            data.Id = patientId;
            data.Data = patientData;

            _context.SaveChanges();
            return Ok();         
        }
  

        /// <summary>
        /// Retrieve patient survey data
        /// </summary>
        /// <param name="patientId">
        /// The id value of the patient
        /// </param>
        /// <returns>
        /// If the patientId is found, returns the json results
        /// </returns>
        [HttpGet("{patientId}")]
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
    }
}