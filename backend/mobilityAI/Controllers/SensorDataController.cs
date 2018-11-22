using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using mobilityAI.Models;
using System;
using System.IO;
using System.Globalization;
using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;
using Microsoft.VisualBasic;


namespace mobilityAI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SensorDataController : ControllerBase
    {
        private readonly SensorDataContext _context;
        public SensorDataController(SensorDataContext context)
        {
            _context = context;
        }
        [HttpGet]
        public ActionResult<List<Accelerometer>> GetAllAccelerometer()
        {
            return _context.AccelerometerData.ToList();
        }

        [HttpGet]
        public ActionResult<List<Gyroscope>> GetAllGyroscope()
        {
            return _context.GyroscopeData.ToList();
        }

        [HttpPost("SetAccelerometer", Name = "SetAccelerometer")]
        public IActionResult AddItem(Accelerometer a)
        {
            _context.AccelerometerData.Add(a);
            _context.SaveChanges();

            return CreatedAtRoute("GetAccelerometer", new { id = 0 }, a);
        }

        //api/sensordata/setgyroscope
        [HttpPost("SetGyroscope", Name = "SetGyroscope")]
        public IActionResult AddItem(Gyroscope a)
        {
            _context.GyroscopeData.Add(a);
            _context.SaveChanges();

            return CreatedAtRoute("GetGyroscope", new { id = 0 }, a);
        }

        [HttpGet("GetRangeAccelerometer", Name = "GetRangeAccelerometer")]
        public JsonResult GetRangeAccelerometer(long start, long end)
        {
            var dataRange = from a in _context.AccelerometerData
                            where (a.Epoch >= start && a.Epoch <= end)
                            select a;
            return new JsonResult(dataRange.ToList());
        }

        [HttpGet("GetRangeGyroscope", Name = "GetRangeGyroscope")]
        public JsonResult GetRangeGyroscope(long start, long end)
        {
            var dataRange = from a in _context.GyroscopeData
                            where (a.Epoch >= start && a.Epoch <= end)
                            select a;
            return new JsonResult(dataRange.ToList());
        }

        //AddData function might need to be async (unsure as of now)
        [HttpPost("AddData", Name = "AddData")]
        public IActionResult AddData(IFormFile AccelerometerFile, IFormFile GyroscopeFile)
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

            return Ok();
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