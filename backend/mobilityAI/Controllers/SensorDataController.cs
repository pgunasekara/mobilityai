using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Collections.Concurrent;
using System.Linq;
using mobilityAI.Models;
using System;
using System.IO;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Microsoft.VisualBasic;
using System.Net.Http;

/// <summary>
/// Endpoints for retrieving all data/range of data/writing data to/from the database
///</summary>

namespace mobilityAI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SensorDataController : ControllerBase
    {
        const string ML_SERVER_URL = "http://127.0.0.1:6000/";
        const string SERVER_URL = "http://127.0.0.1:5000/";
        private readonly SensorDataContext _context;
        private static readonly HttpClient client = new HttpClient();
        private static ConcurrentDictionary<string, string> mlCallbackIds = new ConcurrentDictionary<string, string>();
        public SensorDataController(SensorDataContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Endpoint for retrieiving all the data in Accelerometer table
        /// </summary>
        [HttpGet]
        public ActionResult<List<Accelerometer>> GetAllAccelerometer()
        {
            return _context.AccelerometerData.ToList();
        }

        /// <summary>
        /// Endpoint for retrieiving all the data in Gyroscope table
        /// </summary>
        [HttpGet]
        public ActionResult<List<Gyroscope>> GetAllGyroscope()
        {
            return _context.GyroscopeData.ToList();
        }

        /// <summary>
        /// Endpoint for adding a row of data into Accelerometer table
        /// </summary>
        /// <param name="a">
        /// Row that is being added into the table
        /// </param>
        [HttpPost("SetAccelerometer", Name = "SetAccelerometer")]
        public IActionResult AddItem(Accelerometer a)
        {
            _context.AccelerometerData.Add(a);
            _context.SaveChanges();

            return CreatedAtRoute("GetAccelerometer", new { id = 0 }, a);
        }

        //api/sensordata/setgyroscope
        /// <summary>
        /// Endpoint for adding a row of data into Gyroscope table
        /// </summary>
        /// <param name="g">
        /// Row that is being added into the table
        /// </param>
        [HttpPost("SetGyroscope", Name = "SetGyroscope")]
        public IActionResult AddItem(Gyroscope g)
        {
            _context.GyroscopeData.Add(g);
            _context.SaveChanges();

            return CreatedAtRoute("GetGyroscope", new { id = 0 }, g);
        }

        /// <summary>
        /// Endpoint for retrieving a range of data from the Accelerometer table.
        /// Query using the parameters to retrieve all rows that belong to the range specified
        /// </summary>
        /// <param name="start">
        /// The starting point of the Epoch time of which the range will begin at
        /// </param>
        /// <param name="end">
        /// The ending point of the Epoch time of which the range will end at
        /// </param>
        [HttpGet("GetRangeAccelerometer", Name = "GetRangeAccelerometer")]
        public JsonResult GetRangeAccelerometer(long start, long end)
        {
            var dataRange = from a in _context.AccelerometerData
                            where (a.Epoch >= start && a.Epoch <= end)
                            select a;
            return new JsonResult(dataRange.ToList());
        }

        /// <summary>
        /// Endpoint for retrieving a range of data from the Gyroscope table.
        /// Query using the parameters to retrieve all rows that belong to the range specified
        /// </summary>
        /// <param name="start">
        /// The starting point of the Epoch time of which the range will begin at
        /// </param>
        /// <param name="end">
        /// The ending point of the Epoch time of which the range will end at
        /// </param>
        [HttpGet("GetRangeGyroscope", Name = "GetRangeGyroscope")]
        public JsonResult GetRangeGyroscope(long start, long end)
        {
            var dataRange = from a in _context.GyroscopeData
                            where (a.Epoch >= start && a.Epoch <= end)
                            select a;
            return new JsonResult(dataRange.ToList());
        }

        //AddData function might need to be async (unsure as of now)
        /// <summary>
        /// Taking the list of lines files, converting each line to an Accelerometer/Gyroscope object, adding it into the database
        /// </summary>
        /// <param name="AccelerometerFile">
        /// The file input for Accelerometer
        /// </param>
        /// <param name="GyroscopeFile">
        /// The file input for Gyroscope
        /// </param>
        /// <param name="DeviceId">
        /// The device id from which this data came
        /// </param>
        [HttpPost("AddData", Name = "AddData")]
        public async Task<IActionResult> AddData(IFormFile AccelerometerFile, IFormFile GyroscopeFile, string DeviceId)
        {
            var result = readData(AccelerometerFile);
            var AccelerometerObjects = result.Skip(1)
                                            .Select(line => line.Split(","))
                                            .Select(tokens => new Accelerometer
                                            {
                                                Id = Guid.NewGuid().ToString(),
                                                Epoch = Convert.ToInt64(tokens[0]),
                                                Timestamp = DateTime.Parse(tokens[1]),
                                                Elapsed = Convert.ToDouble(tokens[2]),
                                                XAxis = Convert.ToDouble(tokens[3]),
                                                YAxis = Convert.ToDouble(tokens[4]),
                                                ZAxis = Convert.ToDouble(tokens[5])
                                            })
                                            .ToList();

            _context.AccelerometerData.AddRange(AccelerometerObjects);

            result = readData(GyroscopeFile);
            var GyroscopeObjects = result.Skip(1)
                                        .Select(line => line.Split(","))
                                        .Select(tokens => new Gyroscope
                                        {
                                            Id = Guid.NewGuid().ToString(),
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
            AccelerometerFile.OpenReadStream().CopyTo(accelMs);

            var gyroMs = new MemoryStream();
            GyroscopeFile.OpenReadStream().CopyTo(gyroMs);

            var callbackId = Guid.NewGuid().ToString();

            MultipartFormDataContent form = new MultipartFormDataContent();

            form.Add(new StringContent(SERVER_URL + "MlCallback?Id=" + callbackId), "callback_url");
            form.Add(new ByteArrayContent(accelMs.ToArray()), "file[]", AccelerometerFile.FileName);
            form.Add(new ByteArrayContent(gyroMs.ToArray()), "file[]", GyroscopeFile.FileName);

            HttpResponseMessage response = await client.PostAsync(ML_SERVER_URL + "windowify", form);

            response.EnsureSuccessStatusCode();

            mlCallbackIds.TryAdd(callbackId, DeviceId);

            return Ok();
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

        /// <summary>
        /// Updating the device information with the device ID and the User ID
        /// </summary>
        /// <param name="id">
        /// The id value of the Device
        /// </param>
        /// <param name="name">
        /// The string value of the name for the device
        /// </param>
        /// <param name="userid">
        /// The id value of the user
        /// </param>
        /// <param name="lastsync">
        /// The timestamp of when the device was last synced
        /// </param>
        [HttpGet("SetDeviceInfo", Name = "SetDeviceInfo")]
        public IActionResult SetDeviceInfo(string id, string name, int userid, string lastsync)
        {
            Device data = (from a in _context.Devices
                           where (a.Id == id)
                           select a).SingleOrDefault();

            var date = DateTime.Parse(lastsync);

            data.Id = id;
            data.FriendlyName = name;
            data.UserID = userid;
            data.LastSync = date;

            _context.SaveChanges();
            return Ok();
        }

        /// <summary>
        /// Retrieving the device information (the name of the device, the user assigned to the device and when it was last synced)
        /// Results returned in JSON file
        /// </summary>
        /// <param name="macAddress">
        /// The MacAddress of the device to retrieve the information
        /// </param>
        [HttpGet("GetDeviceInfo", Name = "GetDeviceInfo")]
        public JsonResult GetDeviceInfo(string macAddress)
        {
            var data = from a in _context.Devices
                       join b in _context.Users on a.UserID equals b.Id
                       where (a.Id == macAddress)
                       select new { a.FriendlyName, b.Name, a.LastSync };

            return new JsonResult(data);
        }

        /// <summary>
        /// Allows the machine learning server to send back the labeled data
        /// </summary>
        /// <param name="Id">Callback id that's created from the server</param>
        /// <param name="Activities">File containing timestamps and the activities performed</param>
        [HttpGet("MlCallback", Name = "MlCallback")]
        public IActionResult MlCallback(string Id, IFormFile Activities)
        {
            if (mlCallbackIds.ContainsKey(Id))
            {
                string deviceId;
                if (mlCallbackIds.TryGetValue(Id, out deviceId))
                {
                    var actionData = readData(Activities);
                    var ActivityObjects = actionData.Skip(1)
                                            .Select(line => line.Split(","))
                                            .Select(tokens => new Activity
                                            {
                                                DeviceId = deviceId,
                                                Start = Convert.ToDateTime(tokens[0]),
                                                End = DateTime.Parse(tokens[1]),
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
    }
}