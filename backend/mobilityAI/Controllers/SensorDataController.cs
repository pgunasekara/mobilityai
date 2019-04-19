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
using mobilityAI.Evaluators;

namespace mobilityAI.Controllers {
    [Route("api/[controller]")]
    [ApiController]
    public class SensorDataController : ControllerBase
    {
        private SensorsEvaluator evaluator;

        public SensorDataController(MobilityAIContext context){
            evaluator = new SensorsEvaluator(context);
        }

        /// <summary>
        /// Taking the list of lines files, converting each line to an Accelerometer/Gyroscope object, adding it into the database
        /// </summary>
        /// <param name="accelerometerFile">
        /// The file input for Accelerometer
        /// </param>
        /// <param name="gyroscopeFile">
        /// The file input for Gyroscope
        /// </param>
        /// <param name="patientID">
        /// The patient id from which this data came from
        /// </param>
        [HttpPost("{patientId}")]
        public IActionResult AddSensorData(int patientId, IFormFile accelerometerFile, IFormFile gyroscopeFile)
        {
            try
            {
                evaluator.AddSensorData(patientId, accelerometerFile, gyroscopeFile);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        /// <summary>
        /// Allows the machine learning server to send back the labeled data
        /// </summary>
        /// <param name="Id">Callback id that's created from the server</param>
        /// <param name="activities">File containing timestamps and the activities performed</param>
        [HttpPost("Callback")]
        public IActionResult Callback(string Id, IFormFile activities)
        {
            try
            {
                evaluator.Callback(Id, activities);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}
