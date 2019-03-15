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
            var data = (from a in _context.Devices
                        join b in _context.Users on a.PatientID equals b.Id
                        where (a.Id == deviceId)
                        select new { a.Id, a.FriendlyName, b.FirstName, b.LastName, a.LastSync }).SingleOrDefault();

            if(data == null)
                return BadRequest(String.Format("Device ID: {0} not found.", deviceId));

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
            //Check if valid patient ID entered
            Patient p = (from a in _context.Patients
                         where a.Id == patientId
                         select a).SingleOrDefault();

            if(p == null) {
                return BadRequest(String.Format("Patient ID: {0} not found.", patientId));
            }

            Device data = (from a in _context.Devices
                           where (a.Id == deviceId)
                           select a).SingleOrDefault();

            if(data == null) {
                //Add new device
                Device nDev = new Device()
                {
                    Id = deviceId,
                    FriendlyName = "MetaMotion",
                    PatientID = patientId,
                    LastSync = DateTime.Now
                };

                _context.Devices.Add(nDev);
                _context.SaveChanges(); //save changes here to get the new ID

                //Update patient
                p.DeviceId = nDev.Id;
            } else {
                p.DeviceId = data.Id;

                var date = new DateTime();

                if(DateTime.TryParse(lastsync, out date)) {
                    data.LastSync = date;
                } else {
                    data.LastSync = DateTime.Now;
                }

                data.Id = deviceId;
                data.FriendlyName = name;
                data.PatientID = patientId;
            }

            _context.SaveChanges();
            return Ok(p.FirstName + " " + p.LastName);
        }

        /*
        [HttpPost]
        public IActionResult CreateDevice(...) { ... }
         */
    }
}