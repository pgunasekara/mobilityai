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
    public class SensorDataController : ControllerBase
    {
        private readonly MobilityAIContext _context;
        private static readonly HttpClient client = new HttpClient();
        const string ML_SERVER_URL = "http://127.0.0.1:6000/";
        const string SERVER_URL = "http://127.0.0.1:5000/";
        const string SERVER_SECURE_URL = "https://127.0.0.1:5001/";
        private static ConcurrentDictionary<string, int> mlCallbackIds = new ConcurrentDictionary<string, int>();

        public SensorDataController(MobilityAIContext context){
            _context = context;
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
        public async Task<IActionResult> AddSensorData(int patientId, IFormFile accelerometerFile, IFormFile gyroscopeFile)
        {
            var result = readData(accelerometerFile);
            var AccelerometerObjects = result.Skip(1)
                                            .Select(line => line.Split(","))
                                            .Select(tokens => new Accelerometer
                                            {
                                                Id = Guid.NewGuid().ToString(),
                                                PatientId = Convert.ToInt32(patientId),
                                                Epoch = Convert.ToInt64(tokens[0]),
                                                Timestamp = DateTime.Parse(tokens[1]),
                                                Elapsed = Convert.ToDouble(tokens[2]),
                                                XAxis = Convert.ToDouble(tokens[3]),
                                                YAxis = Convert.ToDouble(tokens[4]),
                                                ZAxis = Convert.ToDouble(tokens[5])
                                            })
                                            .ToList();

            _context.AccelerometerData.AddRange(AccelerometerObjects);

            result = readData(gyroscopeFile);
            var GyroscopeObjects = result.Skip(1)
                                        .Select(line => line.Split(","))
                                        .Select(tokens => new Gyroscope
                                        {
                                            Id = Guid.NewGuid().ToString(),
                                            PatientId = Convert.ToInt32(patientId),
                                            Epoch = Convert.ToInt64(tokens[0]),
                                            Timestamp = DateTime.Parse(tokens[1]),
                                            Elapsed = Convert.ToDouble(tokens[2]),
                                            XAxis = Convert.ToDouble(tokens[3]),
                                            YAxis = Convert.ToDouble(tokens[4]),
                                            ZAxis = Convert.ToDouble(tokens[5])
                                        })
                                        .ToList();

            _context.GyroscopeData.AddRange(GyroscopeObjects);
            _context.SaveChanges();


            var accelMs = new MemoryStream();
            accelerometerFile.OpenReadStream().CopyTo(accelMs);

            var gyroMs = new MemoryStream();
            gyroscopeFile.OpenReadStream().CopyTo(gyroMs);

            var callbackId = Guid.NewGuid().ToString();

            MultipartFormDataContent form = new MultipartFormDataContent();

            form.Add(new StringContent("false"), "test");
            form.Add(new StringContent(SERVER_URL + "api/MobilityAI/MlCallback?Id=" + callbackId), "callback_url");
            form.Add(new ByteArrayContent(accelMs.ToArray()), "file[]", accelerometerFile.FileName);
            form.Add(new ByteArrayContent(gyroMs.ToArray()), "file[]", gyroscopeFile.FileName);

            HttpResponseMessage response = await client.PostAsync(ML_SERVER_URL + "windowify", form);

            response.EnsureSuccessStatusCode();

            mlCallbackIds.TryAdd(callbackId, patientId);

            return Ok();
        }

        /// <summary>
        /// Add a single file with accelerometer and gyroscope data into the database and into machine learning server
        /// TODO: Handle larger files (ie: don't wait for the files to be added to the database before returning 200 or else the client will timeout)
        /// </summary>
        /// <param name="dataFile">
        /// The file input for the data to be analyzed
        /// </param>
        /// <param name="patientID">
        /// The patient id from which this data came from
        /// </param>
        [HttpPost("{patientId}")]
        public async Task<IActionResult> AddSensorDataSingle(int patientId, IFormFile dataFile)
        {
            List<String> accel = new List<string>();
            List<String> gyro = new List<string>();
            string ac = "epoch (ms),time (-13:00),elapsed (s),x-axis (g),y-axis (g),z-axis (g)" + Environment.NewLine;
            string gy = "epoch (ms),time (-13:00),elapsed (s),x-axis (deg/s),y-axis (deg/s),z-axis (deg/s)" + Environment.NewLine;

            using (var reader = new StreamReader(dataFile.OpenReadStream()))
            {
                while (reader.Peek() >= 0)
                {
                    String res = reader.ReadLine();
                    if(String.Equals(res.Substring(0,2), "a,")) { accel.Add(res.Substring(2)); ac += res.Substring(2)+ Environment.NewLine; }
                    if(String.Equals(res.Substring(0,2), "g,"))  { gyro.Add(res.Substring(2)); gy += res.Substring(2)+ Environment.NewLine; }
                }
            }

            var accelerometerObjects = accel.Select(line => line.Split(","))
                                            .Select(tokens => new Accelerometer
                                            {
                                                Id = Guid.NewGuid().ToString(),
                                                PatientId = Convert.ToInt32(patientId),
                                                Epoch = Convert.ToInt64(tokens[0]),
                                                Timestamp = DateTime.Parse(tokens[1]),
                                                Elapsed = Convert.ToDouble(tokens[2]),
                                                XAxis = Convert.ToDouble(tokens[3]),
                                                YAxis = Convert.ToDouble(tokens[4]),
                                                ZAxis = Convert.ToDouble(tokens[5])
                                            })
                                            .ToList();

            _context.AccelerometerData.AddRange(accelerometerObjects);

            var gyroscopeObjects = gyro.Select(line => line.Split(","))
                                        .Select(tokens => new Gyroscope
                                        {
                                            Id = Guid.NewGuid().ToString(),
                                            PatientId = Convert.ToInt32(patientId),
                                            Epoch = Convert.ToInt64(tokens[0]),
                                            Timestamp = DateTime.Parse(tokens[1]),
                                            Elapsed = Convert.ToDouble(tokens[2]),
                                            XAxis = Convert.ToDouble(tokens[3]),
                                            YAxis = Convert.ToDouble(tokens[4]),
                                            ZAxis = Convert.ToDouble(tokens[5])
                                        })
                                        .ToList();

            _context.GyroscopeData.AddRange(gyroscopeObjects);
            _context.SaveChanges();


            var accelMs = new MemoryStream(Encoding.UTF8.GetBytes(ac));
            var gyroMs = new MemoryStream(Encoding.UTF8.GetBytes(gy));

            var callbackId = Guid.NewGuid().ToString();

            MultipartFormDataContent form = new MultipartFormDataContent();
            string format = "Mddyyyyhhmmsstt";
            string dt = String.Format("{0}",DateTime.Now.ToString(format));

            form.Add(new StringContent("false"), "test");
            form.Add(new StringContent(SERVER_URL + "api/SensorData/Callback?Id=" + callbackId), "callback_url");
            form.Add(new ByteArrayContent(accelMs.ToArray()), "file[]", "accelerometer" + dt + ".csv");
            form.Add(new ByteArrayContent(gyroMs.ToArray()), "file[]", "gyroscope" + dt + ".csv");

            HttpResponseMessage response = await client.PostAsync(ML_SERVER_URL + "windowify", form);

            response.EnsureSuccessStatusCode();

            mlCallbackIds.TryAdd(callbackId, patientId);

            return Ok();
        }

        /// <summary>
        /// Allows the machine learning server to send back the labeled data
        /// </summary>
        /// <param name="Id">Callback id that's created from the server</param>
        /// <param name="activities">File containing timestamps and the activities performed</param>
        [HttpPost("Callback")]
        public IActionResult Callback(string Id, IFormFile activities)
        {
            if (mlCallbackIds.ContainsKey(Id))
            {
                int patientId;
                if (mlCallbackIds.TryGetValue(Id, out patientId))
                {
                    var actionData = readData(activities);
                    var ActivityObjects = actionData.Skip(1)
                                            .Select(line => line.Split(","))
                                            .Select(tokens => new Activity
                                            {
                                                Id = Guid.NewGuid().ToString(),
                                                PatientId = Convert.ToInt32(patientId),
                                                Start = Convert.ToInt64(tokens[0]),
                                                End = Convert.ToInt64(tokens[1]),
                                                Type = Convert.ToInt16(tokens[2])
                                            })
                                            .ToList();

                    _context.Activities.AddRange(ActivityObjects);
                    _context.SaveChanges();
                    return Ok();
                }
                return BadRequest("Could not find the device id associated to the callback id");
            }
            return BadRequest("Could not find the callback id: " + Id);
        }

        //Reading the file to be parsed, returns a list of lines
        private List<string> readData(IFormFile fileName)
        {
            var result = new List<string>();
            using (var reader = new StreamReader(fileName.OpenReadStream()))
            {
                while (reader.Peek() >= 0)
                {
                    result.Add(reader.ReadLine());
                }
            }
            return result;
        }
    }
}