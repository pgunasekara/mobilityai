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
using Newtonsoft.Json;
using System.Text;
using System.Security.Cryptography;
using Debug = System.Diagnostics.Debugger;


/// <summary>
/// Endpoints for retrieving all data/range of data/writing data to/from the database
/// Endpoints to add patient data, new user sign ups
///</summary>

namespace mobilityAI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MobilityAIController : ControllerBase
    {
        const string ML_SERVER_URL = "http://127.0.0.1:6000/";
        const string SERVER_URL = "http://127.0.0.1:5000/";
        const string SERVER_SECURE_URL = "https://127.0.0.1:5001/";
        private readonly MobilityAIContext _context;
        private static readonly HttpClient client = new HttpClient();
        private static ConcurrentDictionary<string, int> mlCallbackIds = new ConcurrentDictionary<string, int>();

        private static readonly DateTime epoch = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        private static bool isFirstRun = true;
        public MobilityAIController(MobilityAIContext context)
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
        [HttpGet("GetAllGyroscope", Name = "GetAllGyroscope")]
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
        /// <param name="patientId">
        /// The specific patient id for the range of data to be retrieved from
        /// </param>
        [HttpGet("GetRangeAccelerometer", Name = "GetRangeAccelerometer")]
        public JsonResult GetRangeAccelerometer(long start, long end, int patientId)
        {
            var dataRange = from a in _context.AccelerometerData
                            where (a.PatientId == patientId && a.Epoch >= start && a.Epoch <= end)
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
        /// <param name="patientId">
        /// The specific patient id for the range of data to be retrieved from
        /// </param>
        [HttpGet("GetRangeGyroscope", Name = "GetRangeGyroscope")]
        public JsonResult GetRangeGyroscope(long start, long end, int patientId)
        {
            var dataRange = from a in _context.GyroscopeData
                            where (a.PatientId == patientId && a.Epoch >= start && a.Epoch <= end)
                            select a;
            return new JsonResult(dataRange.ToList());
        }

        [HttpPost("AddDataSingle", Name = "AddDataSingle")]
        public async Task<IActionResult> AddDataSingle(IFormFile DataFile, int patientId) 
        {
            List<String> accel = new List<string>();
            List<String> gyro = new List<string>();
            string ac = "epoch (ms),time (-13:00),elapsed (s),x-axis (g),y-axis (g),z-axis (g)" + Environment.NewLine;
            string gy = "epoch (ms),time (-13:00),elapsed (s),x-axis (deg/s),y-axis (deg/s),z-axis (deg/s)" + Environment.NewLine;

            using (var reader = new StreamReader(DataFile.OpenReadStream()))
            {
                while (reader.Peek() >= 0)
                {
                    String res = reader.ReadLine();
                    if(String.Equals(res.Substring(0,2), "a,")) { accel.Add(res.Substring(2)); ac += res.Substring(2)+ Environment.NewLine; }
                    if(String.Equals(res.Substring(0,2), "g,"))  { gyro.Add(res.Substring(2)); gy += res.Substring(2)+ Environment.NewLine; }
                }
            }

            var AccelerometerObjects = accel.Select(line => line.Split(","))
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

            var GyroscopeObjects = gyro.Select(line => line.Split(","))
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
            // _context.SaveChanges();


            var accelMs = new MemoryStream(Encoding.UTF8.GetBytes(ac));
            var gyroMs = new MemoryStream(Encoding.UTF8.GetBytes(gy));
            // AccelerometerFile.OpenReadStream().CopyTo(accelMs);

            
            // GyroscopeFile.OpenReadStream().CopyTo(gyroMs);

            var callbackId = Guid.NewGuid().ToString();

            MultipartFormDataContent form = new MultipartFormDataContent();
            string format = "Mddyyyyhhmmsstt";
            string dt = String.Format("{0}",DateTime.Now.ToString(format));

            form.Add(new StringContent("false"), "test");
            form.Add(new StringContent(SERVER_URL + "api/MobilityAI/MlCallback?Id=" + callbackId), "callback_url");
            form.Add(new ByteArrayContent(accelMs.ToArray()), "file[]", "accelerometer" + dt + ".csv");
            form.Add(new ByteArrayContent(gyroMs.ToArray()), "file[]", "gyroscope" + dt + ".csv");

            HttpResponseMessage response = await client.PostAsync(ML_SERVER_URL + "windowify", form);

            response.EnsureSuccessStatusCode();

            mlCallbackIds.TryAdd(callbackId, patientId);

            return Ok();
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
        /// <param name="patientID">
        /// The patient id from which this data came from
        /// </param>
        [HttpPost("AddData", Name = "AddData")]
        public async Task<IActionResult> AddData(IFormFile AccelerometerFile, IFormFile GyroscopeFile, int patientId)
        {
            var result = readData(AccelerometerFile);
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

            result = readData(GyroscopeFile);
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
            AccelerometerFile.OpenReadStream().CopyTo(accelMs);

            var gyroMs = new MemoryStream();
            GyroscopeFile.OpenReadStream().CopyTo(gyroMs);

            var callbackId = Guid.NewGuid().ToString();

            MultipartFormDataContent form = new MultipartFormDataContent();

            form.Add(new StringContent("false"), "test");
            form.Add(new StringContent(SERVER_URL + "api/MobilityAI/MlCallback?Id=" + callbackId), "callback_url");
            form.Add(new ByteArrayContent(accelMs.ToArray()), "file[]", AccelerometerFile.FileName);
            form.Add(new ByteArrayContent(gyroMs.ToArray()), "file[]", GyroscopeFile.FileName);

            HttpResponseMessage response = await client.PostAsync(ML_SERVER_URL + "windowify", form);

            response.EnsureSuccessStatusCode();

            mlCallbackIds.TryAdd(callbackId, patientId);

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
        /// <param name="patientId">
        /// The id value of the patient
        /// </param>
        /// <param name="lastsync">
        /// The timestamp of when the device was last synced
        /// </param>
        [HttpGet("SetDeviceInfo", Name = "SetDeviceInfo")]
        public IActionResult SetDeviceInfo(string id, string name, int patientId, string lastsync)
        {
            Device data = (from a in _context.Devices
                           where (a.Id == id)
                           select a).SingleOrDefault();

            var date = DateTime.Parse(lastsync);

            data.Id = id;
            data.FriendlyName = name;
            data.PatientID = patientId;
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
                       join b in _context.Users on a.PatientID equals b.Id
                       where (a.Id == macAddress)
                       select new { a.FriendlyName, b.FirstName, b.LastName, a.LastSync };

            return new JsonResult(data);
        }

        /// <summary>
        /// Allows the machine learning server to send back the labeled data
        /// </summary>
        /// <param name="Id">Callback id that's created from the server</param>
        /// <param name="Activities">File containing timestamps and the activities performed</param>
        [HttpPost("MlCallback", Name = "MlCallback")]
        public IActionResult MlCallback(string Id, IFormFile Activities)
        {
            if (mlCallbackIds.ContainsKey(Id))
            {
                int patientId;
                if (mlCallbackIds.TryGetValue(Id, out patientId))
                {
                    var actionData = readData(Activities);
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

        /// <summary>
        /// Gets processed activity data for a specific device in a specific time range to be displayed on the UI
        /// </summary>
        /// <param name="Start">Epoch for beginning of time range</param>
        /// <param name="End"Epoch for end of time rante></param>
        /// <param name="patientId">Patient Id for the data you want to query</param>
        /// <returns></returns>
        [HttpGet("GetActivityData", Name = "GetActivityData")]
        public IActionResult GetActivityData(long start, long end, int patientId)
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

                // long firstHour = data[0].Start;
                // long lastHour = data[data.Count-1].End;
        
                // long diff = lastHour - firstHour;

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

                total[0] = (count[0] / totalRows) * 100;
                total[1] = (count[1] / totalRows) * 100;
                total[2] = (count[2] / totalRows) * 100;
                total[3] = (count[3] / totalRows) * 100;
                total[4] = (count[4] / totalRows) * 100;

                var retObj = new
                {
                    sitting = new
                    {   
                        total = total[0],
                        bar = activityTotals[0]
                    },
                    lyingDown = new
                    {
                        total = total[1],
                        bar = activityTotals[1]
                    },
                    walking = new
                    {
                        total = total[2],
                        bar = activityTotals[2]
                    },
                    standing = new
                    {
                        total = total[3],
                        bar = activityTotals[3]
                    },
                    unknown = new
                    {
                        total = total[4],
                        bar = activityTotals[4]
                    },
                };


                return Ok(JsonConvert.SerializeObject(retObj));
            }

            return Ok();
        }

        private static DateTime FromUnixTime(long time)
        {
            time = time/1000;
            return DateTime.Now.AddSeconds(time);
        }

        /// <summary>
        /// Adding new patient and corresponding data to the database
        /// </summary>
        /// <param name="PatientData"> 
        /// Corresponding data of the new patient to be added
        /// </param>
        [HttpPost("AddPatientData", Name = "AddPatientData")]
        public IActionResult AddPatientData(string PatientData)
        {
            Patient_Impl data = new Patient_Impl();

            data.Data = PatientData;

            _context.Patients_Impl.Add(data);
            _context.SaveChanges();

            return Ok();
        }

        /// <summary>
        /// Once a new user signs up for the application, it will add the user's credentials to the database
        /// </summary>
        /// <param name="email">
        /// The email entered by the user, which will be stored and used for future reference when the user tries to log on
        /// </param>
        /// <param name="firstName">
        /// The first name entered by the user
        /// </param>
        /// <param name="lastName">
        /// The last name entered by the user
        /// </param>
        /// <param name="password">
        /// The password entered by the user, this information will be salted and hashed (the hashed password is stored on the database for security purposes)
        /// </param>
        [HttpPost("SignUpUser", Name = "SignUpUser")]
        public IActionResult SignUpUser(string email, string firstName, string lastName, string password)
        {
            RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider();
            byte[] buffer = new byte[128];

            rng.GetBytes(buffer);
            string salt = Convert.ToBase64String(buffer);
            var saltedPw = password + salt;

            var hashedPw = generateHash(saltedPw);

            User data = new User();

            data.Email = email;
            data.FirstName = firstName;
            data.LastName = lastName;
            data.Password = hashedPw;
            data.Salt = salt;

            _context.Users.Add(data);
            _context.SaveChanges();

            return Ok();

        }

        // [HttpGet("SignInUser", Name = "SignInUser")]
        // public JsonResult SignInUser(string email, string password)
        // {
        //     var salt = from a in _context.Users
        //                where (a.Email == email)
        //                select new { a.Salt };
        //     // var saltedPw = password + salt;
        //     // var hashedPw = generateHash(saltedPw);

        //     // var data = (from b in _context.Users
        //     //            where (b.Email == email && b.Password == hashedPw)
        //     //            select b).Count();



        //     return new JsonResult(salt);
        // }

        /// <summary>
        /// Function that will take the salted password and hash it (for encryption and security purposes)
        /// </summary>
        /// <param name="saltedPw">
        /// The salted password that is passed to be hashed with SHA-256 hashing algorithm
        /// </param>
        private string generateHash(string saltedPw)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                // ComputeHash - returns byte array  
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(saltedPw));

                // Convert byte array to a string   
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }



        /// <summary>
        /// Returns a list of all patients
        /// </summary>
        /// <returns></returns>
        [HttpGet("GetPatients", Name = "GetPatients")]
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
    }
}
