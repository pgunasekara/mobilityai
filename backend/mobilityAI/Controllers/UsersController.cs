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
    public class UsersController : ControllerBase
    {
        private UsersEvaluator evaluator;

        public UsersController(MobilityAIContext context){
            evaluator = new UsersEvaluator(context);
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
        [HttpPost]
        public IActionResult SignUp(string email, string firstName, string lastName, string password)
        {
            try
            {
                evaluator.SignUp(email, firstName, lastName, password);
                return Ok();
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }

        }

        /*
        [HttpPost("Authenticate")]
        public IActionResult Post(string email, string password) { ... }
        */
    }
}