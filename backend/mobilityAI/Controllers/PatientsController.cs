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

namespace mobilityAI.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private readonly MobilityAIContext _context;
        private static bool isFirstRun = true;
        private static readonly DateTime epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        public PatientsController(MobilityAIContext context){
            _context = context;
        }

        /// <summary>
        /// Returns a list of all patients
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public JsonResult GetPatients() {
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
        /// Gets processed activity data for a specific device in a specific time range to be displayed on the UI
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

            if(data.Count != 0) {

                float[] count = new float[5];
                float[] total = new float[5];
                float[][] activityTotals = new float[5][];
                for (int i = 0; i < 5; i++) activityTotals[i] = new float[13];
                float totalRows = data.Count;

                for(int i = 0; i < data.Count-1; i++) {
                    var element = data[i];
                    var nextElement = data[i+1];

                    count[element.Type]++;

                    int startHour = (FromUnixTime(element.Start/1000).Hour) - 12;
                    activityTotals[element.Type][startHour] += (nextElement.Start - element.Start)/1000f;
                }

                int startHour2 = (FromUnixTime(data[data.Count-1].Start).Hour) - 12;
                activityTotals[data[data.Count-1].Type][startHour2] += (data[data.Count-1].End - data[data.Count-1].Start)/1000f;

                for (int i=0; i<5; i++){
                    for (int j=0; j<13; j++){
                        activityTotals[i][j] = activityTotals[i][j]/60;
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

            return Ok();
        }

        /*
        [HttpPut("{patientId}")]
        public IActionResult UpdatePatient(string patientId, string PatientData) { ... }

        [HttpGet("{patientId}")]
        public IActionResult GetPatientData(string patientId) { ... }
         */

        private static DateTime FromUnixTime(long time)
        {
            time = time/1000;
            return epoch.AddSeconds(time);
        }
    }
}