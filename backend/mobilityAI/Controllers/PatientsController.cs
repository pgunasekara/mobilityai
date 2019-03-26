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
using Newtonsoft.Json.Linq;
using mobilityAI.Evaluators;

namespace mobilityAI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientsController : ControllerBase
    {
        private PatientsEvaluator evaluator;

        public PatientsController(MobilityAIContext context)
        {
            evaluator = new PatientsEvaluator(context);
        }

        /// <summary>
        /// Returns a list of all patients
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public IActionResult GetPatients()
        {
            try
            {
                return evaluator.GetPatients();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
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
            try
            {
                evaluator.CreatePatient(patientData);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        /// <summary>
        /// Gets processed activity data for a specific device in a specific time range to be displayed on the UI.
        /// It is assumed that start is at the beginning of the hour respective to the timezone of the device making the request.
        /// </summary>
        /// <param name="Start">Epoch for beginning of time range</param>
        /// <param name="End"Epoch for end of time rante></param>
        /// <param name="patientId">Patient Id for the data you want to query</param>
        /// <returns></returns>
        [HttpGet("{patientId}/Activity")]
        public IActionResult GetPatientActivity(int patientId, long start, long end)
        {
            try
            {
                return evaluator.GetPatientActivity(patientId, start, end);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        /// <summary>
        /// Create new patient activity
        /// </summary>
        /// <param name="patientId">Patient Id you want to update</param>
        /// <param name="steps">The goal for the number of steps per day</param>
        /// <param name="activeMinutes">The goal for the number of active minutes per hour</param>
        /// <param name="walkingMiutes">The goal for the number of walking minutes per hour</param>
        /// <param name="standingMinutes">The goal for the number of standing minutes per hour</param>
        /// <returns></returns>
        [HttpPost("{patientId}/Achievements")]
        public IActionResult PatientAchievement(int patientId, int steps, int activeMinutes, int walkingMinutes, int standingMinutes)
        {
            try
            {
                evaluator.PatientAchievement(patientId, steps, activeMinutes, walkingMinutes, standingMinutes);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        /// <summary>
        /// Returning the patient achievements stats
        /// </summary>
        /// <param name="patientId">
        /// The id value of the patient
        /// </param>
        /// <returns>
        /// If the patient does not have any achievement stats, returns -1
        /// If the patient has achievement stats, returns the stats
        /// </returns>
        [HttpGet("{patientId}/Achievements")]
        public IActionResult GetPatientAchievements(int patientId)
        {
            try
            {
                return evaluator.GetPatientAchievements(patientId);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        [HttpGet("{patientId}/Steps")]
        public IActionResult GetSteps(int patientId, long startDate, long endDate)
        {
            try
            {
                return evaluator.GetSteps(patientId, startDate, endDate);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        /// <summary>
        /// Updating existing patient information
        /// </summary>
        /// <param name="patientId">
        /// The id value of the patient that the data will be updated for
        /// </param>
        /// <param name="patientData">
        /// Data that will be updated for the corresponding patient
        /// </param>
        [HttpPut("{patientId}")]
        public IActionResult UpdatePatient(int patientId, string patientData)
        {
            try
            {
                evaluator.UpdatePatient(patientId, patientData);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }


        /// <summary>
        /// Retrieve patient survey data
        /// </summary>
        /// <param name="patientId">
        /// The id value of the patient
        /// </param>
        /// <returns>
        /// If the patientId is found, returns the json results
        /// </returns>
        [HttpGet("{patientId}")]
        public IActionResult PatientData(int patientId)
        {
            try
            {
                return evaluator.PatientData(patientId);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);    
            }
        }

        /// <summary>
        /// Allowing nurses to add comments and observations for a given patient
        /// </summary>
        /// <param name="userId">
        /// The userId of the nurse placing the comment
        /// </param>
        /// <param name="patientId">
        /// The patientId of the user the comment belongs to
        /// </param>
        /// <param name="comment">
        /// The comment being added for the patient
        /// </param>
        [HttpPut("{patientId}/Observations")]
        public IActionResult AddPatientObservations(int userId, int patientId, string comment)
        {
            try
            {
                evaluator.AddPatientObservations(userId, patientId, comment);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        /// <summary>
        /// Retreiving the comments to be displayed on the front end 
        /// </summary>
        /// <param name="patientId">
        /// The patientId of the comments that are being retreived
        /// </param>
        /// <returns></returns>
        [HttpGet("{patientId}/Observations")]
        public IActionResult GetPatientObserations(int patientId)
        {
            try
            {
                return evaluator.GetPatientObserations(patientId);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="patientId"></param>
        /// <returns></returns>
        [HttpGet("{patientId}/Surveys")]
        public IActionResult GetPatientSurveys(int patientId)
        {
            try
            {
                return evaluator.GetPatientSurveys(patientId);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="patientId"></param>
        /// <param name="surveyData"></param>
        /// <returns></returns>
        [HttpPut("{patientId}/Surveys")]
        public IActionResult NewPatientSurvey(int patientId, string surveyData)
        {
            try
            {
                evaluator.NewPatientSurvey(patientId, surveyData);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}
