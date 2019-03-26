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
    using System.Security.Cryptography;
    using System.Text;
    
    public class UsersEvaluator {
        private readonly MobilityAIContext _context;

        public UsersEvaluator(MobilityAIContext context)
        {
            _context = context;
        }

        public void SignUp(string email, string firstName, string lastName, string password)
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
        }

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