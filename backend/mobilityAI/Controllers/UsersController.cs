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
    public class UsersController : ControllerBase
    {
        private readonly MobilityAIContext _context;

        public UsersController(MobilityAIContext context){
            _context = context;
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

        /*
        [HttpPost("Authenticate")]
        public IActionResult Post(string email, string password) { ... }
        */

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
    }
}