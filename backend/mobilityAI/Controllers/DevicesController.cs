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
    public class DevicesController : ControllerBase
    {
        private readonly MobilityAIContext _context;

        public DevicesController(MobilityAIContext context){
            _context = context;
        }

        /// <summary>
        /// Retrieving the device information (the name of the device, the user assigned to the device and when it was last synced)
        /// Results returned in JSON
        /// </summary>
        /// <param name="deviceId">
        /// The device id of the device to retrieve the information
        /// </param>
        [HttpGet("{deviceId}")]
        public JsonResult GetDevice(string deviceId)
        {
            var data = from a in _context.Devices
                       join b in _context.Users on a.PatientID equals b.Id
                       where (a.Id == deviceId)
                       select new { a.FriendlyName, b.FirstName, b.LastName, a.LastSync };

            return new JsonResult(data);
        }

        /// <summary>
        /// Updating the device information with the device ID and the User ID
        /// </summary>
        /// <param name="deviceId">
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
        [HttpPut("{deviceId}")]
        public IActionResult UpdateDevice(string deviceId, 
                                [FromQuery]string name, 
                                [FromQuery]int patientId, 
                                [FromQuery]string lastsync)
        {
            Device data = (from a in _context.Devices
                           where (a.Id == deviceId)
                           select a).SingleOrDefault();

            var date = DateTime.Parse(lastsync);

            data.Id = deviceId;
            data.FriendlyName = name;
            data.PatientID = patientId;
            data.LastSync = date;

            _context.SaveChanges();
            return Ok();
        }

        /*
        [HttpPost]
        public IActionResult CreateDevice(...) { ... }
         */
    }
}