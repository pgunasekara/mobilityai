namespace mobilityAI.Evaluators {
    using Microsoft.AspNetCore.Mvc;
    using mobilityAI.Models;
    using System;
    using System.Linq;
    public class DevicesEvaluator {
        private readonly MobilityAIContext _context;

        public DevicesEvaluator(MobilityAIContext context)
        {
            _context = context;
        }


        public IActionResult GetDevice(string deviceId)
        {
            var data = (from a in _context.Devices
                        join b in _context.Patients on a.PatientID equals b.Id
                        where (a.Id == deviceId)
                        select new { a.Id, a.PatientID, a.FriendlyName, b.FirstName, b.LastName, a.LastSync }).SingleOrDefault();

            if(data == null)
                throw new Exception(String.Format("Device ID: {0} not found.", deviceId));

            return new JsonResult(data);
        }

        public IActionResult UpdateDevice(string deviceId, string name, int patientId, string lastsync)
        {
            //Check if valid patient ID entered
            Patient p = (from a in _context.Patients
                         where a.Id == patientId
                         select a).SingleOrDefault();

            if(p == null) {
                throw new Exception(String.Format("Patient ID: {0} not found.", patientId));
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
            return new JsonResult(p);
        }
    }
}