namespace mobilityAI.Evaluators {
    using Microsoft.AspNetCore.Mvc;
    using mobilityAI.Models;
    using System;
    using System.Linq;
    using System.Net.Http;
    using Microsoft.AspNetCore.Http;
    using System.Collections.Generic;
    using System.Collections.Concurrent;
    using System.IO;

    public class SensorsEvaluator {
        private readonly MobilityAIContext _context;
        private static readonly HttpClient client = new HttpClient();
        const string ML_SERVER_URL = "http://ml:6000/";
        const string SERVER_URL = "http://web:5000/";
        const string SERVER_SECURE_URL = "https://web:5001/";
        private static ConcurrentDictionary<string, int> mlCallbackIds = new ConcurrentDictionary<string, int>();
        public SensorsEvaluator(MobilityAIContext context)
        {
            _context = context;
        }
        public async void AddSensorData(int patientId, IFormFile accelerometerFile, IFormFile gyroscopeFile)
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
            form.Add(new StringContent(SERVER_URL + "api/SensorData/Callback?Id=" + callbackId), "callback_url");
            form.Add(new ByteArrayContent(accelMs.ToArray()), "file[]", accelerometerFile.FileName);
            form.Add(new ByteArrayContent(gyroMs.ToArray()), "file[]", gyroscopeFile.FileName);

            HttpResponseMessage response = await client.PostAsync(ML_SERVER_URL + "windowify", form);

            response.EnsureSuccessStatusCode();

            mlCallbackIds.TryAdd(callbackId, patientId);
        }

        public void AddSteps(int patientId, IFormFile steps)
        {
            /*
             * Format of Step count file: { epoch \n [epoch \n] }
             */
            var data = readData(steps);
            var stepObjects = data.Select(line => line)
                                  .Select(tokens => new Step 
                                  {
                                      PatientId = patientId,
                                      Epoch = Convert.ToInt64(tokens[0])
                                  }).ToList();

            _context.Steps.AddRange(stepObjects);
            _context.SaveChanges();
        }

        public void Callback(string Id, IFormFile activities)
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
                    return;
                }
                throw new Exception("Could not find the device id associated to the callback id");
            }
            throw new Exception("Could not find the callback id: " + Id);
        }

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